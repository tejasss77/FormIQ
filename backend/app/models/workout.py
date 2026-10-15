from datetime import datetime, timezone
from sqlalchemy import Column, Integer, String, Float, DateTime, ForeignKey, Text, JSON
from sqlalchemy.orm import relationship
from app.core.database import Base

class Workout(Base):
    __tablename__ = "workouts"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    title = Column(String(150), nullable=False, default="Daily Session")
    exercise_slug = Column(String(50), nullable=False, index=True)
    duration_seconds = Column(Integer, default=0)
    total_reps = Column(Integer, default=0)
    overall_form_score = Column(Float, default=0.0)
    technique_score = Column(Float, default=0.0)
    rom_score = Column(Float, default=0.0)
    stability_score = Column(Float, default=0.0)
    tempo_score = Column(Float, default=0.0)
    status = Column(String(30), default="completed")  # in_progress, completed, abandoned
    summary_positives = Column(JSON, default=list)
    summary_improvements = Column(JSON, default=list)
    ai_summary = Column(Text, nullable=True)
    started_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    completed_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    user = relationship("User", back_populates="workouts")
    sets = relationship("WorkoutSet", back_populates="workout", cascade="all, delete-orphan")
    reps = relationship("Rep", back_populates="workout", cascade="all, delete-orphan")
    analyses = relationship("FormAnalysis", back_populates="workout", cascade="all, delete-orphan")
    feedbacks = relationship("WorkoutFeedback", back_populates="workout", cascade="all, delete-orphan")


class WorkoutSet(Base):
    __tablename__ = "workout_sets"

    id = Column(Integer, primary_key=True, index=True)
    workout_id = Column(Integer, ForeignKey("workouts.id", ondelete="CASCADE"), nullable=False)
    set_number = Column(Integer, nullable=False, default=1)
    reps_completed = Column(Integer, default=0)
    target_reps = Column(Integer, default=10)
    avg_form_score = Column(Float, default=0.0)

    workout = relationship("Workout", back_populates="sets")


class Rep(Base):
    __tablename__ = "reps"

    id = Column(Integer, primary_key=True, index=True)
    workout_id = Column(Integer, ForeignKey("workouts.id", ondelete="CASCADE"), nullable=False)
    set_id = Column(Integer, ForeignKey("workout_sets.id", ondelete="SET NULL"), nullable=True)
    rep_number = Column(Integer, nullable=False)
    form_score = Column(Float, default=80.0)
    duration_seconds = Column(Float, default=2.0)
    rom_percentage = Column(Float, default=85.0)
    tempo_seconds = Column(Float, default=2.2)
    stability_score = Column(Float, default=85.0)
    symmetry_score = Column(Float, default=90.0)
    violations_json = Column(JSON, default=list)
    timestamp = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    workout = relationship("Workout", back_populates="reps")


class FormAnalysis(Base):
    __tablename__ = "form_analyses"

    id = Column(Integer, primary_key=True, index=True)
    workout_id = Column(Integer, ForeignKey("workouts.id", ondelete="CASCADE"), nullable=False)
    timestamp = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    overall_score = Column(Float, default=80.0)
    technique_score = Column(Float, default=85.0)
    rom_score = Column(Float, default=80.0)
    stability_score = Column(Float, default=80.0)
    tempo_score = Column(Float, default=85.0)
    biomechanics_json = Column(JSON, default=dict)

    workout = relationship("Workout", back_populates="analyses")


class WorkoutFeedback(Base):
    __tablename__ = "workout_feedbacks"

    id = Column(Integer, primary_key=True, index=True)
    workout_id = Column(Integer, ForeignKey("workouts.id", ondelete="CASCADE"), nullable=False)
    feedback_text = Column(String(255), nullable=False)
    category = Column(String(50), default="form")  # form, encouragement, cadence, depth
    spoken = Column(Integer, default=1)
    timestamp = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    workout = relationship("Workout", back_populates="feedbacks")
