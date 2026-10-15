from typing import Optional
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from app.core.database import get_db
from app.core.security import decode_access_token
from app.models.user import User

security_bearer = HTTPBearer(auto_error=False)

async def get_current_user_optional(
    credentials: Optional[HTTPAuthorizationCredentials] = Depends(security_bearer),
    db: AsyncSession = Depends(get_db)
) -> Optional[User]:
    if not credentials:
        # Fallback to demo default user if unauthenticated for smooth demo flow
        res = await db.execute(select(User).where(User.email == "athlete@formiq.com"))
        return res.scalar_one_or_none()

    payload = decode_access_token(credentials.credentials)
    if not payload:
        res = await db.execute(select(User).where(User.email == "athlete@formiq.com"))
        return res.scalar_one_or_none()

    user_id = payload.get("sub")
    if not user_id:
        res = await db.execute(select(User).where(User.email == "athlete@formiq.com"))
        return res.scalar_one_or_none()

    res = await db.execute(select(User).where(User.id == int(user_id)))
    user = res.scalar_one_or_none()
    return user

async def get_current_user(
    current_user: Optional[User] = Depends(get_current_user_optional)
) -> User:
    if not current_user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authentication required",
            headers={"WWW-Authenticate": "Bearer"},
        )
    return current_user
