"""Pydantic request/response schemas for authentication."""

from typing import Optional

from pydantic import BaseModel


class ControlRoomLoginRequest(BaseModel):
    username: str
    password: str


class PassengerLoginRequest(BaseModel):
    phone_number: str
    train_number: Optional[str] = None


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    role: str
    display_name: str


class CurrentUserResponse(BaseModel):
    role: str
    username_or_phone: str
    display_name: str
    preferred_train_number: Optional[str] = None
