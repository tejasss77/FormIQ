from typing import List, Dict, Any, Optional
from pydantic import BaseModel

class TrendPoint(BaseModel):
    date: str
    form_score: float
    reps: int
    duration_minutes: float

class ExerciseStat(BaseModel):
    slug: str
    name: str
    total_reps: int
    avg_form_score: float
    workouts_count: int

class ProgressSummary(BaseModel):
    overall_form_score: float
    form_score_change_pct: float
    weekly_workouts_count: int
    total_reps: int
    total_training_minutes: int
    trend: List[TrendPoint] = []
    exercise_breakdown: List[ExerciseStat] = []
    recent_streaks: int = 4
