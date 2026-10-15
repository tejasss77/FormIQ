from sqlalchemy import Column, Integer, String, Text, JSON
from app.core.database import Base

class Exercise(Base):
    __tablename__ = "exercises"

    id = Column(Integer, primary_key=True, index=True)
    slug = Column(String(50), unique=True, index=True, nullable=False)
    name = Column(String(100), nullable=False)
    category = Column(String(50), nullable=False)
    difficulty = Column(String(30), nullable=False)  # Beginner, Intermediate, Advanced
    primary_muscles = Column(String(200), nullable=False)
    description = Column(Text, nullable=False)
    instructions = Column(JSON, default=list)
    key_metrics = Column(JSON, default=list)
    camera_view = Column(String(50), default="Front / 45-degree angle")
    thumbnail_url = Column(String(255), nullable=True)
