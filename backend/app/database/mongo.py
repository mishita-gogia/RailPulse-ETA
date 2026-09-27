"""MongoDB connection used exclusively for authentication data."""

from motor.motor_asyncio import AsyncIOMotorClient, AsyncIOMotorDatabase

from app.config import settings

_client: AsyncIOMotorClient | None = None
_db: AsyncIOMotorDatabase | None = None


async def connect_to_mongo() -> None:
    """Initialize the Motor client and auth database."""
    global _client, _db

    if not settings.MONGODB_URI:
        raise RuntimeError(
            "MONGODB_URI is not configured. Set MONGODB_URI in the environment "
            "before starting RailPulse ETA."
        )

    _client = AsyncIOMotorClient(settings.MONGODB_URI)
    _db = _client[settings.MONGODB_DB_NAME]

    await _db["control_room_users"].create_index("username", unique=True)
    await _db["passenger_users"].create_index("phone_number", unique=True)


async def close_mongo_connection() -> None:
    """Close the Motor client."""
    global _client, _db

    if _client is not None:
        _client.close()

    _client = None
    _db = None


def get_mongo_db() -> AsyncIOMotorDatabase:
    """FastAPI dependency returning the initialized Mongo database."""
    if _db is None:
        raise RuntimeError(
            "MongoDB is not initialized. connect_to_mongo() must run during startup."
        )
    return _db
