from datetime import datetime
from typing import List, Optional, Dict, Any
from pydantic import BaseModel

class RepResponse(BaseModel):
    id: int
    rep_number: int
    form_score: float
    duration_seconds: float
    rom_percentage: float
    tempo_seconds: float
    stability_score: float
    symmetry_score: float
    violations_json: List[str] = []

    class Config:
        from_attributes = True

class WorkoutSetResponse(BaseModel):
    id: int
    set_number: int
    reps_completed: int
    target_reps: int
    avg_form_score: float

    class Config:
        from_attributes = True

class WorkoutFeedbackResponse(BaseModel):
    id: int
    feedback_text: str
    category: str
    spoken: int
    timestamp: datetime

    class Config:
        from_attributes = True

class WorkoutCreate(BaseModel):
    exercise_slug: str
    title: Optional[str] = None

class WorkoutUpdate(BaseModel):
    duration_seconds: Optional[int] = None
    total_reps: Optional[int] = None
    overall_form_score: Optional[float] = None
    technique_score: Optional[float] = None
    rom_score: Optional[float] = None
    stability_score: Optional[float] = None
    tempo_score: Optional[float] = None
    status: Optional[str] = "completed"
    summary_positives: Optional[List[str]] = None
    summary_improvements: Optional[List[str]] = None
    ai_summary: Optional[str] = None
    completed_at: Optional[datetime] = None

class WorkoutResponse(BaseModel):
    id: int
    user_id: int
    title: str
    exercise_slug: str
    duration_seconds: int
    total_reps: int
    overall_form_score: float
    technique_score: float
    rom_score: float
    stability_score: float
    tempo_score: float
    status: str
    summary_positives: List[str] = []
    summary_improvements: List[str] = []
    ai_summary: Optional[str] = None
    started_at: datetime
    completed_at: Optional[datetime] = None

    class Config:
        from_attributes = True

class WorkoutDetail(WorkoutResponse):
    sets: List[WorkoutSetResponse] = []
    reps: List[RepResponse] = []
    feedbacks: List[WorkoutFeedbackResponse] = []
