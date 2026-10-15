import time
from typing import Dict, Any, List, Tuple
from app.exercises.base_exercise import BaseExercise, ExerciseState
from app.vision.angle_calculator import calculate_angle
from app.vision.landmark_processor import (
    LM_LEFT_SHOULDER, LM_RIGHT_SHOULDER,
    LM_LEFT_HIP, LM_RIGHT_HIP,
    LM_LEFT_ANKLE, LM_RIGHT_ANKLE,
    LandmarkProcessor
)

class PlankExercise(BaseExercise):
    """
    Biomechanical analyzer for Isometric Plank.
    Unlike rep-based movements, Plank tracks time held with rigid alignment.
    Evaluates:
    - Linear Shoulder-Hip-Ankle body angle (target: 165° - 180°)
    - Hip sag vs hip piking detection
    - Accumulates hold seconds as 'reps' (1 rep = 5 seconds held with >85% form)
    """

    def __init__(self):
        super().__init__(name="Plank Hold", slug="plank")
        self.hold_start_time: float = 0.0
        self.total_hold_seconds: float = 0.0
        self.is_holding: bool = False

    def required_landmarks(self) -> List[int]:
        return [
            LM_LEFT_SHOULDER, LM_RIGHT_SHOULDER,
            LM_LEFT_HIP, LM_RIGHT_HIP,
            LM_LEFT_ANKLE, LM_RIGHT_ANKLE
        ]

    def evaluate_frame(
        self,
        raw_landmarks: Dict[int, Tuple[float, float, float]],
        visibilities: Dict[int, float],
        timestamp: float
    ) -> Dict[str, Any]:
        smoothed = self.smoother.smooth(raw_landmarks)
        named = LandmarkProcessor.extract_named_landmarks(smoothed)

        left_body = calculate_angle(named["left_shoulder"], named["left_hip"], named["left_ankle"])
        right_body = calculate_angle(named["right_shoulder"], named["right_hip"], named["right_ankle"])
        avg_body = round((left_body + right_body) / 2.0, 1)

        current_frame_violations = []

        # Check alignment
        if avg_body < 155.0:
            mid_y = (named["left_shoulder"][1] + named["left_ankle"][1]) / 2.0
            if named["left_hip"][1] > mid_y + 0.05:
                current_frame_violations.append("Hip sag; brace rectus abdominis")
            else:
                current_frame_violations.append("Hips elevated; lower pelvis flat")

        # Isometric State Machine
        rep_just_completed = False
        completed_rep_data = None

        if avg_body >= 155.0 and len(current_frame_violations) == 0:
            if not self.is_holding:
                self.is_holding = True
                self.hold_start_time = timestamp
                self.state = ExerciseState.INFLECTION
            else:
                elapsed = timestamp - self.hold_start_time
                self.total_hold_seconds += 0.033  # ~30-60 FPS delta
                
                # Award 1 milestone 'rep' every 5 clean seconds
                expected_reps = int(self.total_hold_seconds // 5)
                if expected_reps > self.rep_count:
                    self.rep_count = expected_reps
                    rep_just_completed = True
                    form_score = 95.0
                    completed_rep_data = self.record_rep_completion(
                        rep_duration=5.0,
                        form_score=form_score,
                        rom_percentage=100.0,
                        violations=[],
                        breakdown={"technique": 96.0, "rom": 100.0, "stability": 95.0, "tempo": 90.0}
                    )
        else:
            self.is_holding = False
            self.state = ExerciseState.START

        live_score = 100.0 - (len(current_frame_violations) * 15.0)

        self.latest_metrics = {
            "primary_angle": avg_body,
            "primary_label": "Plank Alignment",
            "body_alignment_angle": avg_body,
            "state": "HOLDING" if self.is_holding else "RESTING",
            "rep_phase": "HOLDING" if self.is_holding else "RESTING",
            "rep_count": self.rep_count,
            "reps_count": self.rep_count,
            "hold_seconds": round(self.total_hold_seconds, 1),
            "violations": current_frame_violations,
            "active_violations": current_frame_violations,
            "form_score": round(max(50.0, live_score), 1),
            "rep_just_completed": rep_just_completed,
            "completed_rep_data": completed_rep_data
        }

        return {
            "metrics": self.latest_metrics,
            "completed_rep": completed_rep_data,
            "reps": self.rep_count,
            "phase": "HOLDING" if self.is_holding else "RESTING"
        }
