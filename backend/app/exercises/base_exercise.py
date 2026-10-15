import time
from abc import ABC, abstractmethod
from typing import Dict, Any, List, Optional, Tuple
from app.vision.landmark_processor import LandmarkSmoother, LandmarkProcessor
from app.vision.biomechanics import BiomechanicsEngine

class ExerciseState:
    START = "START"
    DESCENDING = "DESCENDING"
    INFLECTION = "INFLECTION"
    ASCENDING = "ASCENDING"
    COMPLETED = "COMPLETED"

class BaseExercise(ABC):
    """
    Abstract Base Class for all biomechanical exercise analyzers.
    Manages state machines, repetition counting, form scoring, and violation detection.
    """

    def __init__(self, name: str, slug: str):
        self.name = name
        self.slug = slug
        self.smoother = LandmarkSmoother(alpha=0.65)
        self.biomechanics = BiomechanicsEngine()
        
        # State tracking
        self.state = ExerciseState.START
        self.rep_count = 0
        self.rep_start_time = 0.0
        self.current_rep_violations: List[str] = []
        self.all_rep_scores: List[float] = []
        self.rep_history: List[Dict[str, Any]] = []

        # Peak / Valley tracking during current repetition
        self.min_primary_angle = 180.0
        self.max_primary_angle = 0.0
        
        # Real-time metrics
        self.latest_metrics: Dict[str, Any] = {}
        self.latest_violations: List[str] = []
        self.latest_form_score: float = 100.0

    def reset(self):
        self.smoother.reset()
        self.state = ExerciseState.START
        self.rep_count = 0
        self.rep_start_time = 0.0
        self.current_rep_violations = []
        self.all_rep_scores = []
        self.rep_history = []
        self.min_primary_angle = 180.0
        self.max_primary_angle = 0.0
        self.latest_metrics = {}
        self.latest_violations = []
        self.latest_form_score = 100.0

    @abstractmethod
    def required_landmarks(self) -> List[int]:
        """Indices of required landmarks for this movement."""
        pass

    @abstractmethod
    def evaluate_frame(
        self,
        raw_landmarks: Dict[int, Tuple[float, float, float]],
        visibilities: Dict[int, float],
        timestamp: float
    ) -> Dict[str, Any]:
        """
        Processes a single frame's landmarks, updates state machine,
        returns structured biomechanical analysis.
        """
        pass

    def record_rep_completion(
        self,
        rep_duration: float,
        technique_score: Optional[float] = None,
        rom_score: Optional[float] = None,
        stability_score: Optional[float] = None,
        tempo_score: Optional[float] = None,
        violations: Optional[List[str]] = None,
        **kwargs
    ) -> Dict[str, Any]:
        """
        Constructs finished repetition record with detailed scoring.
        Accepts standard metrics or precomputed form_score / breakdown.
        """
        self.rep_count += 1
        violations_list = list(violations or kwargs.get("violations") or [])

        # Support precomputed form_score / breakdown if supplied
        if "form_score" in kwargs:
            rep_score = float(kwargs["form_score"])
            rom_val = float(kwargs.get("rom_percentage") or rom_score or 90.0)
            stab_val = float(stability_score or 90.0)
            tech_val = float(technique_score or 90.0)
        else:
            t_score = technique_score if technique_score is not None else 90.0
            r_score = rom_score if rom_score is not None else 90.0
            s_score = stability_score if stability_score is not None else 90.0
            tp_score = tempo_score if tempo_score is not None else 90.0
            rep_score = self.biomechanics.calculate_form_score(
                technique_score=t_score,
                rom_score=r_score,
                stability_score=s_score,
                tempo_score=tp_score
            )
            rom_val = r_score
            stab_val = s_score
            tech_val = t_score

        self.all_rep_scores.append(rep_score)
        self.latest_form_score = rep_score

        rep_data = {
            "rep_number": self.rep_count,
            "form_score": rep_score,
            "duration_seconds": round(rep_duration, 2),
            "rom_percentage": rom_val,
            "tempo_seconds": round(rep_duration, 2),
            "stability_score": stab_val,
            "symmetry_score": 90.0,
            "violations": list(set(violations_list)),
            "technique_score": tech_val
        }
        self.rep_history.append(rep_data)
        return rep_data
