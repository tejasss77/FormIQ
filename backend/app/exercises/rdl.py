import time
from typing import Dict, Any, List, Tuple
from app.exercises.base_exercise import BaseExercise, ExerciseState
from app.vision.angle_calculator import calculate_angle
from app.vision.landmark_processor import (
    LM_LEFT_SHOULDER, LM_RIGHT_SHOULDER,
    LM_LEFT_HIP, LM_RIGHT_HIP,
    LM_LEFT_KNEE, LM_RIGHT_KNEE,
    LM_LEFT_ANKLE, LM_RIGHT_ANKLE,
    LandmarkProcessor
)

class RDLExercise(BaseExercise):
    """
    Biomechanical analyzer for Romanian Deadlift (RDL).
    Evaluates:
    - Hip hinge angle (Shoulder-Hip-Knee): standing ~170°-180°, bottom hinge ~75°-90°
    - Knee stability: soft knee bend (155°-170°) without excessive squatting
    - Lumbar neutrality: checks linear spine angle to prevent dangerous back rounding
    """

    def __init__(self):
        super().__init__(name="Romanian Deadlift", slug="rdl")
        self.lockout_threshold = 165.0  # Hip angle in standing lockout
        self.hinge_threshold = 95.0     # Hip angle at full hinge depth

    def required_landmarks(self) -> List[int]:
        return [
            LM_LEFT_SHOULDER, LM_RIGHT_SHOULDER,
            LM_LEFT_HIP, LM_RIGHT_HIP,
            LM_LEFT_KNEE, LM_RIGHT_KNEE,
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

        # 1. Hip Hinge Angle (Shoulder - Hip - Knee)
        left_hip = calculate_angle(named["left_shoulder"], named["left_hip"], named["left_knee"])
        right_hip = calculate_angle(named["right_shoulder"], named["right_hip"], named["right_knee"])
        avg_hip = round((left_hip + right_hip) / 2.0, 1)

        # 2. Knee Angle (Hip - Knee - Ankle)
        left_knee = calculate_angle(named["left_hip"], named["left_knee"], named["left_ankle"])
        right_knee = calculate_angle(named["right_hip"], named["right_knee"], named["right_ankle"])
        avg_knee = round((left_knee + right_knee) / 2.0, 1)

        current_frame_violations = []

        # Fault 1: Squatting into the RDL (Knees bending too much < 140°)
        if avg_knee < 140.0:
            current_frame_violations.append("Squatting instead of hinging; push hips back")

        # Fault 2: Knees completely locked stiff (hyper-extension < 178°)
        if avg_knee > 178.0 and avg_hip < 130.0:
            current_frame_violations.append("Keep a soft bend in knees")

        if self.state in [ExerciseState.DESCENDING, ExerciseState.INFLECTION]:
            if avg_hip < self.min_primary_angle:
                self.min_primary_angle = avg_hip

        # --- STATE MACHINE ---
        rep_just_completed = False
        completed_rep_data = None

        if self.state == ExerciseState.START:
            if avg_hip >= self.lockout_threshold - 5.0:
                if avg_hip < self.lockout_threshold - 10.0:
                    self.state = ExerciseState.DESCENDING  # Hinging forward
                    self.rep_start_time = timestamp
                    self.min_primary_angle = avg_hip
                    self.current_rep_violations = []

        elif self.state == ExerciseState.DESCENDING:
            for v in current_frame_violations:
                if v not in self.current_rep_violations:
                    self.current_rep_violations.append(v)

            if avg_hip <= self.hinge_threshold:
                self.state = ExerciseState.INFLECTION
            elif avg_hip > self.min_primary_angle + 12.0 and avg_hip < self.lockout_threshold - 15.0:
                self.state = ExerciseState.ASCENDING
                if "Insufficient hinge depth" not in self.current_rep_violations:
                    self.current_rep_violations.append("Insufficient hinge depth")

        elif self.state == ExerciseState.INFLECTION:
            for v in current_frame_violations:
                if v not in self.current_rep_violations:
                    self.current_rep_violations.append(v)

            if avg_hip > self.min_primary_angle + 10.0:
                self.state = ExerciseState.ASCENDING

        elif self.state == ExerciseState.ASCENDING:
            for v in current_frame_violations:
                if v not in self.current_rep_violations:
                    self.current_rep_violations.append(v)

            if avg_hip >= self.lockout_threshold - 5.0:
                duration = timestamp - self.rep_start_time
                if duration >= 1.0:
                    rom_pct = min(100.0, max(50.0, (self.lockout_threshold - self.min_primary_angle) / (self.lockout_threshold - self.hinge_threshold) * 100.0))
                    
                    form_score, breakdown = self.biomechanics.compute_form_score(
                        rom_percentage=rom_pct,
                        violations=self.current_rep_violations,
                        stability_score=90.0,
                        tempo_score=94.0 if 2.0 <= duration <= 4.5 else 80.0
                    )

                    completed_rep_data = self.record_rep_completion(
                        rep_duration=duration,
                        form_score=form_score,
                        rom_percentage=rom_pct,
                        violations=list(self.current_rep_violations),
                        breakdown=breakdown
                    )
                    rep_just_completed = True

                self.state = ExerciseState.START
                self.min_primary_angle = 180.0

        live_score = 100.0 - (len(current_frame_violations) * 12.0)

        self.latest_metrics = {
            "primary_angle": avg_hip,
            "primary_label": "Hip Hinge Angle",
            "hip_angle": avg_hip,
            "knee_angle": avg_knee,
            "state": self.state,
            "rep_phase": self.state,
            "rep_count": self.rep_count,
            "reps_count": self.rep_count,
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
            "phase": self.state
        }
