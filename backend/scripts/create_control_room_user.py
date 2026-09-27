"""Create a Control Room account in the auth-only MongoDB database.

Run from the backend directory with MONGODB_URI configured:
    python scripts/create_control_room_user.py
"""

import asyncio
import getpass
from datetime import datetime, timezone

from app.database.mongo import close_mongo_connection, connect_to_mongo, get_mongo_db
from app.services.auth_service import auth_service


async def main() -> None:
    await connect_to_mongo()
    try:
        db = get_mongo_db()
        username = input("Control Room username: ").strip()
        if not username:
            raise ValueError("Username cannot be empty.")

        password = getpass.getpass("Password: ")
        if not password:
            raise ValueError("Password cannot be empty.")

        full_name = input("Full name (optional): ").strip() or None

        if await db["control_room_users"].find_one({"username": username}):
            raise ValueError(f"Control Room user '{username}' already exists.")

        await db["control_room_users"].insert_one(
            {
                "username": username,
                "hashed_password": auth_service.hash_password(password),
                "full_name": full_name,
                "created_at": datetime.now(timezone.utc),
            }
        )
        print(f"Created Control Room user: {username}")
    finally:
        await close_mongo_connection()


if __name__ == "__main__":
    asyncio.run(main())
