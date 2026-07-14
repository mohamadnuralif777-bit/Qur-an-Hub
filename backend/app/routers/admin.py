from fastapi import APIRouter, HTTPException, Depends, UploadFile, File, Query
from typing import Optional, List
from datetime import datetime
from bson import ObjectId
from app.core.database import get_db
from app.core.security import get_current_user, require_editor, require_superadmin, require_admin
from app.core.sanitize import sanitize_html, extract_body_content
from app.models.content import ContentCreate, ContentUpdate
from passlib.context import CryptContext

router = APIRouter()
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


def serialize_content(doc):
    return {
        "id": str(doc["_id"]),
        "pillar": doc.get("pillar", ""),
        "category": doc.get("category"),
        "title": doc.get("title", ""),
        "slug": doc.get("slug", ""),
        "html_body": doc.get("html_body", ""),
        "tags": doc.get("tags", []),
        "cover_image": doc.get("cover_image"),
        "status": doc.get("status", "draft"),
        "author_id": str(doc["author_id"]) if doc.get("author_id") else None,
        "created_at": doc.get("created_at", datetime.utcnow()).isoformat(),
        "updated_at": doc.get("updated_at", datetime.utcnow()).isoformat(),
        "deleted_at": doc.get("deleted_at").isoformat() if doc.get("deleted_at") else None,
    }


async def log_action(db, user_id: str, action: str, resource_type: str, resource_id: str):
    await db.audit_logs.insert_one({
        "user_id": user_id,
        "action": action,
        "resource_type": resource_type,
        "resource_id": resource_id,
        "timestamp": datetime.utcnow(),
    })


# ── Content endpoints ──────────────────────────────────────────────────────────

@router.get("/contents")
async def admin_list_contents(
    pillar: Optional[str] = None,
    category: Optional[str] = None,
    q: Optional[str] = None,
    status: Optional[str] = None,
    page: int = Query(1, ge=1),
    limit: int = Query(20, ge=1, le=100),
    current_user: dict = Depends(require_admin),
):
    db = get_db()
    query: dict = {"deleted_at": None}
    if pillar:
        query["pillar"] = pillar
    if category:
        query["category"] = category
    if status:
        query["status"] = status
    if q:
        query["$text"] = {"$search": q}

    skip = (page - 1) * limit
    cursor = db.contents.find(query).sort("created_at", -1).skip(skip).limit(limit)
    docs = await cursor.to_list(length=limit)
    total = await db.contents.count_documents(query)

    return {
        "items": [serialize_content(d) for d in docs],
        "total": total,
        "page": page,
        "limit": limit,
        "pages": (total + limit - 1) // limit,
    }


@router.get("/contents/{content_id}")
async def admin_get_content(
    content_id: str,
    current_user: dict = Depends(require_admin),
):
    db = get_db()
    doc = await db.contents.find_one({"_id": ObjectId(content_id), "deleted_at": None})
    if not doc:
        raise HTTPException(status_code=404, detail="Content not found")
    return serialize_content(doc)


@router.post("/contents", status_code=201)
async def create_content(
    content: ContentCreate,
    current_user: dict = Depends(require_admin),
):
    db = get_db()
    # Contributors can only create drafts
    if current_user["role"] == "contributor" and content.status == "published":
        raise HTTPException(status_code=403, detail="Contributors can only create drafts")

    existing = await db.contents.find_one({"slug": content.slug})
    if existing:
        raise HTTPException(status_code=409, detail="Slug already exists")

    now = datetime.utcnow()
    doc = {
        **content.model_dump(),
        "html_body": sanitize_html(content.html_body),
        "author_id": ObjectId(str(current_user["_id"])),
        "created_at": now,
        "updated_at": now,
        "deleted_at": None,
    }
    result = await db.contents.insert_one(doc)
    await log_action(db, str(current_user["_id"]), "create", "content", str(result.inserted_id))
    doc["_id"] = result.inserted_id
    return serialize_content(doc)


@router.put("/contents/{content_id}")
async def update_content(
    content_id: str,
    update: ContentUpdate,
    current_user: dict = Depends(require_admin),
):
    db = get_db()
    doc = await db.contents.find_one({"_id": ObjectId(content_id), "deleted_at": None})
    if not doc:
        raise HTTPException(status_code=404, detail="Content not found")

    if current_user["role"] == "contributor" and update.status == "published":
        raise HTTPException(status_code=403, detail="Contributors cannot publish content")

    update_data = {k: v for k, v in update.model_dump().items() if v is not None}
    if "html_body" in update_data:
        update_data["html_body"] = sanitize_html(update_data["html_body"])
    if "slug" in update_data and update_data["slug"] != doc["slug"]:
        existing = await db.contents.find_one({"slug": update_data["slug"]})
        if existing:
            raise HTTPException(status_code=409, detail="Slug already exists")

    update_data["updated_at"] = datetime.utcnow()
    await db.contents.update_one({"_id": ObjectId(content_id)}, {"$set": update_data})
    await log_action(db, str(current_user["_id"]), "update", "content", content_id)
    updated = await db.contents.find_one({"_id": ObjectId(content_id)})
    return serialize_content(updated)


@router.delete("/contents/{content_id}")
async def delete_content(
    content_id: str,
    current_user: dict = Depends(require_editor),
):
    db = get_db()
    doc = await db.contents.find_one({"_id": ObjectId(content_id), "deleted_at": None})
    if not doc:
        raise HTTPException(status_code=404, detail="Content not found")
    await db.contents.update_one(
        {"_id": ObjectId(content_id)},
        {"$set": {"deleted_at": datetime.utcnow(), "updated_at": datetime.utcnow()}},
    )
    await log_action(db, str(current_user["_id"]), "delete", "content", content_id)
    return {"message": "Content deleted"}


@router.post("/upload-html")
async def upload_html(
    file: UploadFile = File(...),
    current_user: dict = Depends(require_admin),
):
    if not file.filename.endswith(".html"):
        raise HTTPException(status_code=400, detail="Only .html files are allowed")
    raw = await file.read()
    text = raw.decode("utf-8", errors="replace")
    body_content = extract_body_content(text)
    sanitized = sanitize_html(body_content)
    return {"html": sanitized}


# ── User management (superadmin only) ──────────────────────────────────────────

def serialize_user(user):
    return {
        "id": str(user["_id"]),
        "email": user["email"],
        "name": user["name"],
        "role": user["role"],
        "created_at": user.get("created_at", datetime.utcnow()).isoformat(),
    }


@router.get("/users")
async def list_users(current_user: dict = Depends(require_superadmin)):
    db = get_db()
    users = await db.users.find({}).to_list(length=200)
    return [serialize_user(u) for u in users]


@router.post("/users", status_code=201)
async def create_user(
    data: dict,
    current_user: dict = Depends(require_superadmin),
):
    db = get_db()
    existing = await db.users.find_one({"email": data["email"]})
    if existing:
        raise HTTPException(status_code=409, detail="Email already exists")
    now = datetime.utcnow()
    user_doc = {
        "email": data["email"],
        "password_hash": pwd_context.hash(data["password"]),
        "name": data["name"],
        "role": data.get("role", "contributor"),
        "created_at": now,
    }
    result = await db.users.insert_one(user_doc)
    user_doc["_id"] = result.inserted_id
    return serialize_user(user_doc)


@router.put("/users/{user_id}")
async def update_user(
    user_id: str,
    data: dict,
    current_user: dict = Depends(require_superadmin),
):
    db = get_db()
    update = {}
    if "name" in data:
        update["name"] = data["name"]
    if "email" in data:
        update["email"] = data["email"]
    if "role" in data:
        update["role"] = data["role"]
    if "password" in data and data["password"]:
        update["password_hash"] = pwd_context.hash(data["password"])
    if not update:
        raise HTTPException(status_code=400, detail="No fields to update")
    await db.users.update_one({"_id": ObjectId(user_id)}, {"$set": update})
    updated = await db.users.find_one({"_id": ObjectId(user_id)})
    return serialize_user(updated)


@router.delete("/users/{user_id}")
async def delete_user(
    user_id: str,
    current_user: dict = Depends(require_superadmin),
):
    if user_id == str(current_user["_id"]):
        raise HTTPException(status_code=400, detail="Cannot delete yourself")
    db = get_db()
    result = await db.users.delete_one({"_id": ObjectId(user_id)})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="User not found")
    return {"message": "User deleted"}


# ── Audit logs ─────────────────────────────────────────────────────────────────

@router.get("/audit-logs")
async def get_audit_logs(
    page: int = Query(1, ge=1),
    limit: int = Query(50, ge=1, le=200),
    current_user: dict = Depends(require_superadmin),
):
    db = get_db()
    skip = (page - 1) * limit
    cursor = db.audit_logs.find({}).sort("timestamp", -1).skip(skip).limit(limit)
    logs = await cursor.to_list(length=limit)
    total = await db.audit_logs.count_documents({})
    return {
        "items": [
            {
                "id": str(log["_id"]),
                "user_id": log.get("user_id"),
                "action": log.get("action"),
                "resource_type": log.get("resource_type"),
                "resource_id": log.get("resource_id"),
                "timestamp": log.get("timestamp", datetime.utcnow()).isoformat(),
            }
            for log in logs
        ],
        "total": total,
    }


# ── Dashboard stats ────────────────────────────────────────────────────────────

@router.get("/dashboard")
async def dashboard_stats(current_user: dict = Depends(require_admin)):
    db = get_db()
    pillars = ["quran", "hadith", "tafsir", "sirah"]
    stats = {}
    for pillar in pillars:
        stats[pillar] = await db.contents.count_documents({"pillar": pillar, "deleted_at": None})

    recent_logs = await db.audit_logs.find({}).sort("timestamp", -1).limit(10).to_list(length=10)
    return {
        "content_counts": stats,
        "total_contents": sum(stats.values()),
        "recent_activity": [
            {
                "user_id": log.get("user_id"),
                "action": log.get("action"),
                "resource_type": log.get("resource_type"),
                "resource_id": log.get("resource_id"),
                "timestamp": log.get("timestamp", datetime.utcnow()).isoformat(),
            }
            for log in recent_logs
        ],
    }
