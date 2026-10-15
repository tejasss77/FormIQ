from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from app.core.database import get_db
from app.models.exercise import Exercise
from app.schemas.exercise import ExerciseResponse

router = APIRouter(prefix="/exercises", tags=["Exercises"])

@router.get("", response_model=List[ExerciseResponse])
async def list_exercises(db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Exercise).order_by(Exercise.id.asc()))
    exercises = result.scalars().all()
    return exercises

@router.get("/{slug}", response_model=ExerciseResponse)
async def get_exercise(slug: str, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Exercise).where(Exercise.slug == slug.lower()))
    exercise = result.scalar_one_or_none()
    if not exercise:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Exercise '{slug}' not found"
        )
    return exercise
