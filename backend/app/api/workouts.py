from typing import List, Optional
from datetime import datetime, timezone
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy.orm import selectinload
from app.core.database import get_db
from app.models.workout import Workout, WorkoutSet, Rep, WorkoutFeedback
from app.models.user import User
from app.schemas.workout import WorkoutCreate, WorkoutUpdate, WorkoutResponse, WorkoutDetail, RepResponse
from app.api.deps import get_current_user_optional
from app.coaching.coach import AICoach

router = APIRouter(prefix="/workouts", tags=["Workouts"])
ai_coach = AICoach()

@router.post("", response_model=WorkoutResponse)
async def create_workout(
    workout_in: WorkoutCreate,
    current_user: User = Depends(get_current_user_optional),
    db: AsyncSession = Depends(get_db)
):
    title = workout_in.title or f"{workout_in.exercise_slug.replace('_', ' ').title()} Session"
    workout = Workout(
        user_id=current_user.id,
        exercise_slug=workout_in.exercise_slug.lower(),
        title=title,
        status="in_progress",
        duration_seconds=0,
        total_reps=0,
        overall_form_score=0.0
    )
    db.add(workout)
    await db.commit()
    await db.refresh(workout)
    return workout

@router.get("", response_model=List[WorkoutResponse])
async def list_workouts(
    limit: int = 20,
    current_user: User = Depends(get_current_user_optional),
    db: AsyncSession = Depends(get_db)
):
    result = await db.execute(
        select(Workout)
        .where(Workout.user_id == current_user.id)
        .order_by(Workout.started_at.desc())
        .limit(limit)
    )
    return result.scalars().all()

@router.get("/{workout_id}", response_model=WorkoutDetail)
async def get_workout(
    workout_id: int,
    current_user: User = Depends(get_current_user_optional),
    db: AsyncSession = Depends(get_db)
):
    result = await db.execute(
        select(Workout)
        .where(Workout.id == workout_id)
        .options(
            selectinload(Workout.sets),
            selectinload(Workout.reps),
            selectinload(Workout.feedbacks)
        )
    )
    workout = result.scalar_one_or_none()
    if not workout:
        raise HTTPException(status_code=404, detail="Workout not found")
    return workout

@router.put("/{workout_id}", response_model=WorkoutDetail)
async def update_workout(
    workout_id: int,
    workout_update: WorkoutUpdate,
    current_user: User = Depends(get_current_user_optional),
    db: AsyncSession = Depends(get_db)
):
    result = await db.execute(
        select(Workout)
        .where(Workout.id == workout_id)
        .options(
            selectinload(Workout.sets),
            selectinload(Workout.reps),
            selectinload(Workout.feedbacks)
        )
    )
    workout = result.scalar_one_or_none()
    if not workout:
        raise HTTPException(status_code=404, detail="Workout not found")

    update_dict = workout_update.model_dump(exclude_unset=True)
    for field, val in update_dict.items():
        setattr(workout, field, val)

    if not workout.completed_at:
        workout.completed_at = datetime.now(timezone.utc)

    # Auto-generate summary if not provided
    if not workout.summary_positives or not workout.ai_summary:
        summary_result = ai_coach.generate_workout_summary(
            exercise_name=workout.exercise_slug.replace('_', ' ').title(),
            total_reps=workout.total_reps,
            duration_minutes=round(workout.duration_seconds / 60.0, 1),
            avg_score=workout.overall_form_score or 85.0,
            rep_history=[{"violations": r.violations_json} for r in workout.reps]
        )
        if not workout.summary_positives:
            workout.summary_positives = summary_result["positives"]
        if not workout.summary_improvements:
            workout.summary_improvements = summary_result["improvements"]
        if not workout.ai_summary:
            workout.ai_summary = summary_result["coach_takeaway"]

    await db.commit()
    await db.refresh(workout)
    return workout
