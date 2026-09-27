"""Authentication API routes."""

from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer

from app.database.mongo import get_mongo_db
from app.models.auth_schemas import (
    ControlRoomLoginRequest,
    CurrentUserResponse,
    PassengerLoginRequest,
    TokenResponse,
)
from app.services.auth_service import auth_service

router = APIRouter()
bearer_scheme = HTTPBearer(auto_error=False)


async def get_current_user(
    credentials: HTTPAuthorizationCredentials | None = Depends(bearer_scheme),
    db=Depends(get_mongo_db),
) -> dict:
    if credentials is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authentication required.",
            headers={"WWW-Authenticate": "Bearer"},
        )

    try:
        payload = auth_service.decode_access_token(credentials.credentials)
    except ValueError as exc:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=str(exc),
            headers={"WWW-Authenticate": "Bearer"},
        ) from exc

    role = payload["role"]
    subject = payload["sub"]

    if role == "control_room":
        document = await db["control_room_users"].find_one({"username": subject})
        if not document:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Control Room account no longer exists.",
                headers={"WWW-Authenticate": "Bearer"},
            )
        return {
            "role": role,
            "username_or_phone": subject,
            "display_name": document.get("full_name") or subject,
            "preferred_train_number": None,
        }

    if role == "passenger":
        document = await db["passenger_users"].find_one({"phone_number": subject})
        if not document:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Passenger account no longer exists.",
                headers={"WWW-Authenticate": "Bearer"},
            )
        return {
            "role": role,
            "username_or_phone": subject,
            "display_name": document.get("name") or subject,
            "preferred_train_number": document.get("preferred_train_number"),
        }

    raise HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Invalid user role.",
        headers={"WWW-Authenticate": "Bearer"},
    )


@router.post("/control-room/login", response_model=TokenResponse)
async def control_room_login(
    request: ControlRoomLoginRequest,
    db=Depends(get_mongo_db),
):
    document = await auth_service.authenticate_control_room(
        db, request.username, request.password
    )
    if not document:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid username or password.",
        )

    username = document["username"]
    token = auth_service.create_access_token(username, "control_room")
    return TokenResponse(
        access_token=token,
        role="control_room",
        display_name=document.get("full_name") or username,
    )


@router.post("/passenger/login", response_model=TokenResponse)
async def passenger_login(
    request: PassengerLoginRequest,
    db=Depends(get_mongo_db),
):
    try:
        document = await auth_service.get_or_create_passenger(
            db, request.phone_number, request.train_number
        )
    except ValueError as exc:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(exc)) from exc

    phone = document["phone_number"]
    token = auth_service.create_access_token(phone, "passenger")
    return TokenResponse(
        access_token=token,
        role="passenger",
        display_name=document.get("name") or phone,
    )


@router.get("/me", response_model=CurrentUserResponse)
async def current_user(current_user: dict = Depends(get_current_user)):
    return CurrentUserResponse(**current_user)
