from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from app.core.database import get_db
from app.core.security import verify_password, hash_password, create_access_token
from app.models.user import User
from app.schemas.auth import UserCreate, UserLogin, UserResponse, Token
from app.api.deps import get_current_user

router = APIRouter(prefix="/auth", tags=["Authentication"])

@router.post("/register", response_model=Token)
async def register(user_in: UserCreate, db: AsyncSession = Depends(get_db)):
    res = await db.execute(select(User).where(User.email == user_in.email))
    existing = res.scalar_one_or_none()
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="User with this email already exists"
        )

    user = User(
        email=user_in.email,
        hashed_password=hash_password(user_in.password),
        full_name=user_in.full_name or "Athlete"
    )
    db.add(user)
    await db.commit()
    await db.refresh(user)

    token = create_access_token({"sub": str(user.id), "email": user.email})
    return Token(
        access_token=token,
        token_type="bearer",
        user=UserResponse.model_validate(user)
    )

@router.post("/login", response_model=Token)
async def login(credentials: UserLogin, db: AsyncSession = Depends(get_db)):
    res = await db.execute(select(User).where(User.email == credentials.email))
    user = res.scalar_one_or_none()
    if not user or not verify_password(credentials.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password"
        )

    token = create_access_token({"sub": str(user.id), "email": user.email})
    return Token(
        access_token=token,
        token_type="bearer",
        user=UserResponse.model_validate(user)
    )

from pydantic import BaseModel
from app.core.security import generate_totp_secret, get_totp_uri, verify_totp_code

class TwoFactorVerifyRequest(BaseModel):
    secret: str
    code: str

@router.get("/me", response_model=UserResponse)
async def get_me(current_user: User = Depends(get_current_user)):
    return UserResponse.model_validate(current_user)

@router.get("/2fa/setup")
async def setup_two_factor(current_user: User = Depends(get_current_user)):
    """Generate a new TOTP secret and QR code URI for the authenticated athlete."""
    secret = generate_totp_secret()
    otpauth_url = get_totp_uri(secret, current_user.email, issuer="FORMIQ")
    return {
        "secret": secret,
        "otpauth_url": otpauth_url,
        "email": current_user.email,
        "issuer": "FORMIQ"
    }

@router.post("/2fa/verify")
async def verify_two_factor(
    body: TwoFactorVerifyRequest,
    current_user: User = Depends(get_current_user)
):
    """Validate a 6-digit TOTP code against the secret key."""
    is_valid = verify_totp_code(body.secret, body.code)
    if not is_valid:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid 6-digit code. Please enter the current code from your Authenticator app."
        )
    return {
        "verified": True,
        "message": "Two-Factor Authentication successfully verified and activated."
    }

@router.post("/2fa/login-verify")
async def verify_two_factor_login(body: TwoFactorVerifyRequest):
    """Validate a 6-digit TOTP code during athlete login."""
    is_valid = verify_totp_code(body.secret, body.code)
    if not is_valid:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid 6-digit verification code. Please check your Google Authenticator app."
        )
    return {
        "verified": True,
        "message": "Two-Factor authentication approved."
    }


