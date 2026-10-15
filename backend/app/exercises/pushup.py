import time
from typing import Dict, Any, List, Tuple
from app.exercises.base_exercise import BaseExercise, ExerciseState
from app.vision.angle_calculator import calculate_angle
from app.vision.landmark_processor import (
    LM_LEFT_SHOULDER, LM_RIGHT_SHOULDER,
    LM_LEFT_ELBOW, LM_RIGHT_ELBOW,
    LM_LEFT_WRIST, LM_RIGHT_WRIST,
    LM_LEFT_HIP, LM_RIGHT_HIP,
    LM_LEFT_ANKLE, LM_RIGHT_ANKLE,
    LandmarkProcessor
)

class PushupExercise(BaseExercise):
    def __init__(self):
        super().__init__(name="Push-Up", slug="pushup")
        self.lockout_threshold = 155.0  # elbow angle degrees
        self.depth_threshold = 90.0     # elbow angle degrees for full depth

    def required_landmarks(self) -> List[int]:
        return [
            LM_LEFT_SHOULDER, LM_RIGHT_SHOULDER,
            LM_LEFT_ELBOW, LM_RIGHT_ELBOW,
            LM_LEFT_WRIST, LM_RIGHT_WRIST,
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

        # 1. Elbow Angles
        left_elbow = calculate_angle(named["left_shoulder"], named["left_elbow"], named["left_wrist"])
        right_elbow = calculate_angle(named["right_shoulder"], named["right_elbow"], named["right_wrist"])
        avg_elbow_angle = round((left_elbow + right_elbow) / 2.0, 1)

        # 2. Body Alignment (Shoulder - Hip - Ankle angle, should be ~160° - 180° for flat plank)
        left_body_line = calculate_angle(named["left_shoulder"], named["left_hip"], named["left_ankle"])
        right_body_line = calculate_angle(named["right_shoulder"], named["right_hip"], named["right_ankle"])
        avg_body_line = round((left_body_line + right_body_line) / 2.0, 1)

        # Detect Hip Sag vs Hip Raise
        alignment_status = "GOOD"
        current_frame_violations = []
        if avg_body_line < 150.0:
            # Check y coordinate of hip relative to shoulder and ankle
            mid_y = (named["left_shoulder"][1] + named["left_ankle"][1]) / 2.0
            hip_y = named["left_hip"][1]
            if hip_y > mid_y + 0.05:  # lower in screen space = sag
                alignment_status = "HIP SAG"
                current_frame_violations.append("Hip sag")
            else:
                alignment_status = "HIP RAISE"
                current_frame_violations.append("Hips elevated")

        # Track min elbow angle
        if avg_elbow_angle < self.min_primary_angle:
            self.min_primary_angle = avg_elbow_angle

        # ROM percentage
        rom_pct = self.biomechanics.evaluate_rom_percentage(avg_elbow_angle, target_min=85.0, target_max=165.0)
        self.current_rep_violations.extend(current_frame_violations)

        completed_rep_data = None

        # State Machine
        if self.state == ExerciseState.START:
            if avg_elbow_angle < 140.0:
                self.state = ExerciseState.DESCENDING
                self.rep_start_time = timestamp if timestamp > 0 else time.time()
                self.min_primary_angle = avg_elbow_angle
                self.current_rep_violations = []

        elif self.state == ExerciseState.DESCENDING:
            if avg_elbow_angle <= self.depth_threshold:
                self.state = ExerciseState.INFLECTION
            elif avg_elbow_angle > (self.min_primary_angle + 12.0) and self.min_primary_angle > 105.0:
                self.current_rep_violations.append("Partial rep")
                self.state = ExerciseState.ASCENDING

        elif self.state == ExerciseState.INFLECTION:
            if avg_elbow_angle > (self.min_primary_angle + 10.0):
                self.state = ExerciseState.ASCENDING

        elif self.state == ExerciseState.ASCENDING:
            if avg_elbow_angle >= self.lockout_threshold:
                rep_duration = max(0.7, (timestamp if timestamp > 0 else time.time()) - self.rep_start_time)
                is_partial = self.min_primary_angle > self.depth_threshold
                if is_partial:
                    self.current_rep_violations.append("Partial rep")

                technique_score = 95.0
                if "Hip sag" in self.current_rep_violations:
                    technique_score -= 20.0
                if "Hips elevated" in self.current_rep_violations:
                    technique_score -= 15.0
                if is_partial:
                    technique_score -= 15.0

                tempo_score = self.biomechanics.evaluate_tempo(rep_duration, ideal_seconds=2.0)
                stability_score = round(max(50.0, min(100.0, avg_body_line * 0.55)), 1)

                completed_rep_data = self.record_rep_completion(
                    rep_duration=rep_duration,
                    technique_score=max(45.0, technique_score),
                    rom_score=rom_pct if not is_partial else 70.0,
                    stability_score=stability_score,
                    tempo_score=tempo_score,
                    violations=self.current_rep_violations
                )

                self.state = ExerciseState.START
                self.min_primary_angle = 180.0
                self.current_rep_violations = []

        live_form = 92.0
        if alignment_status != "GOOD":
            live_form -= 20.0

        self.latest_metrics = {
            "elbow_angle": avg_elbow_angle,
            "body_alignment_angle": avg_body_line,
            "alignment_status": alignment_status,
            "rom_percentage": rom_pct,
            "rep_phase": self.state,
            "reps_count": self.rep_count,
            "form_score": live_form,
            "active_violations": current_frame_violations
        }

        return {
            "metrics": self.latest_metrics,
            "completed_rep": completed_rep_data,
            "reps": self.rep_count,
            "phase": self.state
        }
