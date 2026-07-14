from fastapi import APIRouter, Query, HTTPException
from typing import Optional, List
from datetime import datetime
from app.core.database import get_db
from bson import ObjectId

router = APIRouter()


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
    }


def serialize_summary(doc):
    d = serialize_content(doc)
    d.pop("html_body", None)
    return d


@router.get("/contents")
async def list_contents(
    pillar: Optional[str] = None,
    category: Optional[str] = None,
    q: Optional[str] = None,
    page: int = Query(1, ge=1),
    limit: int = Query(20, ge=1, le=100),
):
    db = get_db()
    query: dict = {"status": "published", "deleted_at": None}
    if pillar:
        query["pillar"] = pillar
    if category:
        query["category"] = category
    if q:
        query["$text"] = {"$search": q}

    skip = (page - 1) * limit
    cursor = db.contents.find(query).sort("created_at", -1).skip(skip).limit(limit)
    docs = await cursor.to_list(length=limit)
    total = await db.contents.count_documents(query)

    return {
        "items": [serialize_summary(d) for d in docs],
        "total": total,
        "page": page,
        "limit": limit,
        "pages": (total + limit - 1) // limit,
    }


@router.get("/contents/{slug}")
async def get_content(slug: str):
    db = get_db()
    doc = await db.contents.find_one({"slug": slug, "status": "published", "deleted_at": None})
    if not doc:
        raise HTTPException(status_code=404, detail="Content not found")
    return serialize_content(doc)
