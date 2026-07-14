import motor.motor_asyncio
from app.core.config import settings

client: motor.motor_asyncio.AsyncIOMotorClient = None
db = None


async def connect_to_mongo():
    global client, db
    client = motor.motor_asyncio.AsyncIOMotorClient(settings.MONGO_URL)
    db = client[settings.MONGO_DB]
    await db.users.create_index("email", unique=True)
    await db.contents.create_index("slug", unique=True)
    await db.contents.create_index([("pillar", 1), ("status", 1)])
    await db.contents.create_index([("title", "text"), ("tags", "text")])
    await db.audit_logs.create_index("timestamp")
    print("Connected to MongoDB")


async def close_mongo_connection():
    global client
    if client:
        client.close()
    print("Disconnected from MongoDB")


def get_db():
    return db
