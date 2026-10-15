from typing import Dict, Any, List
from datetime import datetime, timedelta, timezone
from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from app.core.database import get_db
from app.models.workout import Workout
from app.models.exercise import Exercise
from app.models.user import User
from app.schemas.progress import ProgressSummary, TrendPoint, ExerciseStat
from app.api.deps import get_current_user_optional

router = APIRouter(prefix="/progress", tags=["Progress"])

@router.get("", response_model=ProgressSummary)
async def get_progress(
    period: str = "30D",
    current_user: User = Depends(get_current_user_optional),
    db: AsyncSession = Depends(get_db)
):
    normalized_period = period.upper() if period else "30D"
    days_map = {"7D": 7, "30D": 30, "90D": 90, "ALL": 365}
    days = days_map.get(normalized_period, 30)

    now = datetime.now(timezone.utc)
    cutoff = now - timedelta(days=days)

    # Query real stored workouts within window
    result = await db.execute(
        select(Workout)
        .where(Workout.user_id == current_user.id, Workout.started_at >= cutoff)
        .order_by(Workout.started_at.asc())
    )
    workouts = list(result.scalars().all())

    if len(workouts) == 0:
        return ProgressSummary(
            overall_form_score=0.0,
            form_score_change_pct=0.0,
            weekly_workouts_count=0,
            total_reps=0,
            total_training_minutes=0,
            trend=[],
            exercise_breakdown=[],
            recent_streaks=0
        )

    # Calculate real cumulative athletic metrics
    total_reps = sum(w.total_reps for w in workouts)
    total_seconds = sum(w.duration_seconds for w in workouts)
    total_minutes = int(total_seconds / 60)

    scores = [w.overall_form_score for w in workouts if w.overall_form_score and w.overall_form_score > 0]
    avg_score = round(sum(scores) / len(scores), 1) if scores else 0.0

    # Trend points aggregated by period for clean chart rendering
    trend_points: List[TrendPoint] = []
    
    if normalized_period == "ALL" and len(workouts) > 8:
        # Group into monthly buckets for annual trajectory
        monthly_map: Dict[str, Dict[str, Any]] = {}
        for w in workouts:
            key = w.started_at.strftime("%b '%y") if w.started_at else "Earlier"
            if key not in monthly_map:
                monthly_map[key] = {"scores": [], "reps": 0, "duration": 0}
            if w.overall_form_score and w.overall_form_score > 0:
                monthly_map[key]["scores"].append(w.overall_form_score)
            monthly_map[key]["reps"] += w.total_reps
            monthly_map[key]["duration"] += w.duration_seconds
        
        for k, v in monthly_map.items():
            sc = v["scores"]
            trend_points.append(
                TrendPoint(
                    date=k,
                    form_score=round(sum(sc) / len(sc), 1) if sc else avg_score,
                    reps=v["reps"],
                    duration_minutes=round(v["duration"] / 60.0, 1)
                )
            )
    elif normalized_period == "90D" and len(workouts) > 12:
        # Group into weekly/bi-weekly buckets for quarterly view
        step = max(1, len(workouts) // 10)
        for i in range(0, len(workouts), step):
            chunk = workouts[i:i + step]
            date_str = chunk[-1].started_at.strftime("%b %d") if chunk[-1].started_at else f"W{i//step + 1}"
            chunk_scores = [w.overall_form_score for w in chunk if w.overall_form_score and w.overall_form_score > 0]
            trend_points.append(
                TrendPoint(
                    date=date_str,
                    form_score=round(sum(chunk_scores) / len(chunk_scores), 1) if chunk_scores else avg_score,
                    reps=sum(w.total_reps for w in chunk),
                    duration_minutes=round(sum(w.duration_seconds for w in chunk) / 60.0, 1)
                )
            )
    else:
        for w in workouts:
            date_str = w.started_at.strftime("%b %d") if w.started_at else "Today"
            trend_points.append(
                TrendPoint(
                    date=date_str,
                    form_score=round(w.overall_form_score, 1),
                    reps=w.total_reps,
                    duration_minutes=round(w.duration_seconds / 60.0, 1)
                )
            )

    # Exercise breakdown
    exercise_map: Dict[str, Dict[str, Any]] = {}
    for w in workouts:
        slug = w.exercise_slug
        if slug not in exercise_map:
            exercise_map[slug] = {
                "slug": slug,
                "name": slug.replace("_", " ").title(),
                "total_reps": 0,
                "scores": [],
                "count": 0
            }
        exercise_map[slug]["total_reps"] += w.total_reps
        if w.overall_form_score and w.overall_form_score > 0:
            exercise_map[slug]["scores"].append(w.overall_form_score)
        exercise_map[slug]["count"] += 1

    exercise_stats: List[ExerciseStat] = []
    for slug, data in exercise_map.items():
        sc = data["scores"]
        avg_s = round(sum(sc) / len(sc), 1) if sc else 0.0
        exercise_stats.append(
            ExerciseStat(
                slug=slug,
                name=data["name"],
                total_reps=data["total_reps"],
                avg_form_score=avg_s,
                workouts_count=data["count"]
            )
        )

    # Sort breakdown by volume descending
    exercise_stats.sort(key=lambda x: x.total_reps, reverse=True)

    form_score_change = 0.0
    if len(scores) >= 2:
        first_s = scores[0]
        last_s = scores[-1]
        if first_s > 0:
            form_score_change = round(((last_s - first_s) / first_s) * 100, 1)

    return ProgressSummary(
        overall_form_score=avg_score,
        form_score_change_pct=form_score_change,
        weekly_workouts_count=len(workouts),
        total_reps=total_reps,
        total_training_minutes=total_minutes,
        trend=trend_points,
        exercise_breakdown=exercise_stats,
        recent_streaks=min(len(workouts), 7)
    )

    # Otherwise, return period-calibrated telemetry so switching 7D / 30D / 90D / ALL is fully dynamic & realistic
    if normalized_period == "7D":
        # 7-Day View: Detailed daily progression
        trend_dates = [(now - timedelta(days=i)).strftime("%b %d") for i in range(6, -1, -1)]
        scores_curve = [85.0, 84.5, 87.2, 86.0, 88.5, 90.0, 91.5]
        reps_curve = [36, 42, 48, 32, 45, 52, 60]
        durations = [24, 28, 35, 22, 30, 38, 42]

        trend_points = [
            TrendPoint(
                date=trend_dates[i],
                form_score=scores_curve[i],
                reps=reps_curve[i],
                duration_minutes=durations[i]
            )
            for i in range(7)
        ]

        breakdown = [
            ExerciseStat(slug="squat", name="Bodyweight Squat", total_reps=88, avg_form_score=90.2, workouts_count=2),
            ExerciseStat(slug="pushup", name="Push-Up", total_reps=76, avg_form_score=87.5, workouts_count=2),
            ExerciseStat(slug="biceps_curl", name="Biceps Curl", total_reps=55, avg_form_score=92.0, workouts_count=1),
            ExerciseStat(slug="shoulder_press", name="Shoulder Press", total_reps=50, avg_form_score=86.8, workouts_count=1),
            ExerciseStat(slug="lunge", name="Forward Lunge", total_reps=46, avg_form_score=87.4, workouts_count=1),
        ]

        return ProgressSummary(
            overall_form_score=88.4,
            form_score_change_pct=4.8,
            weekly_workouts_count=5,
            total_reps=315,
            total_training_minutes=219, # ~3h 39m
            trend=trend_points,
            exercise_breakdown=breakdown,
            recent_streaks=5
        )

    elif normalized_period == "90D":
        # 90-Day View: Quarterly athletic ramp
        intervals = 10
        trend_points = []
        for i in range(intervals):
            days_ago = int(90 - (i * (90 / intervals)))
            d = (now - timedelta(days=days_ago)).strftime("%b %d")
            base_score = 78.5 + (i * 1.05)
            base_reps = 34 + (i * 4)
            trend_points.append(
                TrendPoint(
                    date=d,
                    form_score=round(min(base_score, 92.5), 1),
                    reps=base_reps,
                    duration_minutes=round(24 + (i * 1.8), 1)
                )
            )

        breakdown = [
            ExerciseStat(slug="squat", name="Bodyweight Squat", total_reps=680, avg_form_score=88.2, workouts_count=22),
            ExerciseStat(slug="pushup", name="Push-Up", total_reps=540, avg_form_score=86.0, workouts_count=18),
            ExerciseStat(slug="biceps_curl", name="Biceps Curl", total_reps=390, avg_form_score=91.4, workouts_count=14),
            ExerciseStat(slug="shoulder_press", name="Shoulder Press", total_reps=320, avg_form_score=87.5, workouts_count=12),
            ExerciseStat(slug="lunge", name="Forward Lunge", total_reps=290, avg_form_score=86.8, workouts_count=11),
        ]

        return ProgressSummary(
            overall_form_score=86.6,
            form_score_change_pct=11.4,
            weekly_workouts_count=4,
            total_reps=2220,
            total_training_minutes=1420, # ~23h 40m
            trend=trend_points,
            exercise_breakdown=breakdown,
            recent_streaks=6
        )

    elif normalized_period == "ALL":
        # Full Year View: Long-term transformation
        intervals = 12
        trend_points = []
        for i in range(intervals):
            days_ago = int(365 - (i * (365 / intervals)))
            d = (now - timedelta(days=days_ago)).strftime("%b '%y")
            base_score = 74.0 + (i * 1.25)
            base_reps = 30 + (i * 5)
            trend_points.append(
                TrendPoint(
                    date=d,
                    form_score=round(min(base_score, 94.0), 1),
                    reps=base_reps,
                    duration_minutes=round(25 + (i * 2.2), 1)
                )
            )

        breakdown = [
            ExerciseStat(slug="squat", name="Bodyweight Squat", total_reps=2180, avg_form_score=89.4, workouts_count=74),
            ExerciseStat(slug="pushup", name="Push-Up", total_reps=1820, avg_form_score=87.2, workouts_count=62),
            ExerciseStat(slug="biceps_curl", name="Biceps Curl", total_reps=1290, avg_form_score=92.8, workouts_count=50),
            ExerciseStat(slug="shoulder_press", name="Shoulder Press", total_reps=1040, avg_form_score=88.5, workouts_count=42),
            ExerciseStat(slug="lunge", name="Forward Lunge", total_reps=930, avg_form_score=87.9, workouts_count=38),
        ]

        return ProgressSummary(
            overall_form_score=87.8,
            form_score_change_pct=16.8,
            weekly_workouts_count=4,
            total_reps=7260,
            total_training_minutes=4680, # ~78 hours
            trend=trend_points,
            exercise_breakdown=breakdown,
            recent_streaks=7
        )

    else:
        # Default 30D (Monthly Meso-cycle)
        intervals = 8
        trend_points = []
        for i in range(intervals):
            days_ago = int(30 - (i * (30 / intervals)))
            d = (now - timedelta(days=days_ago)).strftime("%b %d")
            base_score = 81.0 + (i * 1.2)
            base_reps = 38 + (i * 4)
            trend_points.append(
                TrendPoint(
                    date=d,
                    form_score=round(min(base_score, 92.0), 1),
                    reps=base_reps,
                    duration_minutes=round(26 + (i * 2), 1)
                )
            )

        breakdown = [
            ExerciseStat(slug="squat", name="Bodyweight Squat", total_reps=295, avg_form_score=88.8, workouts_count=9),
            ExerciseStat(slug="pushup", name="Push-Up", total_reps=215, avg_form_score=85.4, workouts_count=7),
            ExerciseStat(slug="biceps_curl", name="Biceps Curl", total_reps=155, avg_form_score=91.8, workouts_count=5),
            ExerciseStat(slug="shoulder_press", name="Shoulder Press", total_reps=125, avg_form_score=87.2, workouts_count=4),
            ExerciseStat(slug="lunge", name="Forward Lunge", total_reps=105, avg_form_score=86.5, workouts_count=4),
        ]

        return ProgressSummary(
            overall_form_score=87.3,
            form_score_change_pct=8.4,
            weekly_workouts_count=4,
            total_reps=895,
            total_training_minutes=558, # ~9h 18m
            trend=trend_points,
            exercise_breakdown=breakdown,
            recent_streaks=4
        )
