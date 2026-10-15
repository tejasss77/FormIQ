from typing import List, Optional
from pydantic import BaseModel

class ExerciseBase(BaseModel):
    slug: str
    name: str
    category: str
    difficulty: str
    primary_muscles: str
    description: str
    instructions: List[str] = []
    key_metrics: List[str] = []
    camera_view: str = "Front / 45-degree angle"
    thumbnail_url: Optional[str] = None

class ExerciseResponse(ExerciseBase):
    id: int

    class Config:
        from_attributes = True
