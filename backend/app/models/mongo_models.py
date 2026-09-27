"""Pydantic document models for MongoDB auth collections."""

from datetime import datetime
from typing import Optional

from pydantic import BaseModel


class ControlRoomUserDoc(BaseModel):
    username: str
    hashed_password: str
    full_name: Optional[str] = None
    created_at: datetime


class PassengerUserDoc(BaseModel):
    phone_number: str
    name: Optional[str] = None
    preferred_train_number: Optional[str] = None
    created_at: datetime


# MongoDB's _id (ObjectId) must be stripped or str()-converted before these
# documents are returned through Pydantic response models because ObjectId is
# not JSON/Pydantic serializable by default.
