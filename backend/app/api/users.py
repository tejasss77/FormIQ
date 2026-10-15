from fastapi import APIRouter, Depends
from pydantic import BaseModel
from sqlalchemy.ext.asyncio import AsyncSession
from app.core.database import get_db
from app.models.user import User
from app.schemas.auth import UserResponse
from app.api.deps import get_current_user

router = APIRouter(prefix="/users", tags=["Users"])

class UserProfileUpdate(BaseModel):
    full_name: str

@router.get("/me", response_model=UserResponse)
async def get_profile(current_user: User = Depends(get_current_user)):
    return UserResponse.model_validate(current_user)

@router.put("/me", response_model=UserResponse)
async def update_profile(
    profile_data: UserProfileUpdate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    current_user.full_name = profile_data.full_name
    await db.commit()
    await db.refresh(current_user)
    return UserResponse.model_validate(current_user)
