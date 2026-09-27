"""Authentication service backed exclusively by MongoDB."""

from datetime import datetime, timedelta, timezone
import re
from typing import Optional

from jose import JWTError, jwt
from passlib.context import CryptContext

from app.config import settings


class AuthService:
    def __init__(self) -> None:
        self.pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

    def hash_password(self, password: str) -> str:
        return self.pwd_context.hash(password)

    def verify_password(self, plain_password: str, hashed_password: str) -> bool:
        return self.pwd_context.verify(plain_password, hashed_password)

    def create_access_token(
        self,
        subject: str,
        role: str,
        expires_minutes: Optional[int] = None,
    ) -> str:
        expires = expires_minutes if expires_minutes is not None else settings.JWT_EXPIRE_MINUTES
        expire = datetime.now(timezone.utc) + timedelta(minutes=expires)
        payload = {"sub": subject, "role": role, "exp": expire}
        return jwt.encode(payload, settings.JWT_SECRET_KEY, algorithm=settings.JWT_ALGORITHM)

    def decode_access_token(self, token: str) -> dict:
        try:
            payload = jwt.decode(
                token,
                settings.JWT_SECRET_KEY,
                algorithms=[settings.JWT_ALGORITHM],
            )
            if not payload.get("sub") or not payload.get("role"):
                raise ValueError("Token is missing required claims.")
            return payload
        except (JWTError, ValueError) as exc:
            raise ValueError("Invalid or expired authentication token.") from exc

    @staticmethod
    def validate_phone_number(phone_number: str) -> str:
        value = phone_number.strip()
        if not re.fullmatch(r"\+?[0-9][0-9\s-]{8,18}[0-9]", value):
            raise ValueError("Enter a valid phone number using 10 to 15 digits.")
        digits = re.sub(r"\D", "", value)
        if not 10 <= len(digits) <= 15:
            raise ValueError("Enter a valid phone number using 10 to 15 digits.")
        return digits

    async def authenticate_control_room(
        self,
        db,
        username: str,
        password: str,
    ) -> Optional[dict]:
        document = await db["control_room_users"].find_one({"username": username.strip()})
        if not document or not self.verify_password(password, document["hashed_password"]):
            return None
        document["_id"] = str(document["_id"])
        return document

    async def get_or_create_passenger(
        self,
        db,
        phone_number: str,
        train_number: Optional[str],
    ) -> dict:
        phone = self.validate_phone_number(phone_number)
        train = train_number.strip() if train_number and train_number.strip() else None

        collection = db["passenger_users"]
        document = await collection.find_one({"phone_number": phone})

        if document:
            if train and train != document.get("preferred_train_number"):
                await collection.update_one(
                    {"_id": document["_id"]},
                    {"$set": {"preferred_train_number": train}},
                )
                document = await collection.find_one({"_id": document["_id"]})
            document["_id"] = str(document["_id"])
            return document

        document = {
            "phone_number": phone,
            "name": None,
            "preferred_train_number": train,
            "created_at": datetime.now(timezone.utc),
        }
        result = await collection.insert_one(document)
        document["_id"] = str(result.inserted_id)
        return document


auth_service = AuthService()
