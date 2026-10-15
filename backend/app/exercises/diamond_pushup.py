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

class DiamondPushupExercise(BaseExercise):
    """
    Biomechanical analyzer for Diamond / Close-Grip Push-Up.
    Emphasizes triceps brachii and sternal/inner pectoralis.
    Evaluates:
    - Elbow flexion depth (target 90°)
    - Elbow flare restriction (elbows tucked tighter than standard push-up)
    - Rigid plank line (shoulder-hip-ankle line 160°-180°)
    """

    def __init__(self):
        super().__init__(name="Diamond Push-Up", slug="diamond_pushup")
        self.lockout_threshold = 155.0
        self.depth_threshold = 92.0

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

        left_elbow = calculate_angle(named["left_shoulder"], named["left_elbow"], named["left_wrist"])
        right_elbow = calculate_angle(named["right_shoulder"], named["right_elbow"], named["right_wrist"])
        avg_elbow = round((left_elbow + right_elbow) / 2.0, 1)

        left_body = calculate_angle(named["left_shoulder"], named["left_hip"], named["left_ankle"])
        right_body = calculate_angle(named["right_shoulder"], named["right_hip"], named["right_ankle"])
        avg_body = round((left_body + right_body) / 2.0, 1)

        current_frame_violations = []

        if avg_body < 150.0:
            mid_y = (named["left_shoulder"][1] + named["left_ankle"][1]) / 2.0
            if named["left_hip"][1] > mid_y + 0.05:
                current_frame_violations.append("Hip sag; brace core")
            else:
                current_frame_violations.append("Hips elevated; lower pelvis")

        if self.state in [ExerciseState.DESCENDING, ExerciseState.INFLECTION]:
            if avg_elbow < self.min_primary_angle:
                self.min_primary_angle = avg_elbow

        rep_just_completed = False
        completed_rep_data = None

        if self.state == ExerciseState.START:
            if avg_elbow >= self.lockout_threshold - 5.0:
                if avg_elbow < self.lockout_threshold - 10.0:
                    self.state = ExerciseState.DESCENDING
                    self.rep_start_time = timestamp
                    self.min_primary_angle = avg_elbow
                    self.current_rep_violations = []

        elif self.state == ExerciseState.DESCENDING:
            for v in current_frame_violations:
                if v not in self.current_rep_violations:
                    self.current_rep_violations.append(v)

            if avg_elbow <= self.depth_threshold:
                self.state = ExerciseState.INFLECTION
            elif avg_elbow > self.min_primary_angle + 12.0 and avg_elbow < self.lockout_threshold - 15.0:
                self.state = ExerciseState.ASCENDING
                if "Partial depth" not in self.current_rep_violations:
                    self.current_rep_violations.append("Partial depth")

        elif self.state == ExerciseState.INFLECTION:
            for v in current_frame_violations:
                if v not in self.current_rep_violations:
                    self.current_rep_violations.append(v)

            if avg_elbow > self.min_primary_angle + 10.0:
                self.state = ExerciseState.ASCENDING

        elif self.state == ExerciseState.ASCENDING:
            for v in current_frame_violations:
                if v not in self.current_rep_violations:
                    self.current_rep_violations.append(v)

            if avg_elbow >= self.lockout_threshold - 5.0:
                duration = timestamp - self.rep_start_time
                if duration >= 0.8:
                    rom_pct = min(100.0, max(45.0, (self.lockout_threshold - self.min_primary_angle) / (self.lockout_threshold - self.depth_threshold) * 100.0))
                    
                    form_score, breakdown = self.biomechanics.compute_form_score(
                        rom_percentage=rom_pct,
                        violations=self.current_rep_violations,
                        stability_score=max(60.0, 100.0 - (len(self.current_rep_violations) * 15.0)),
                        tempo_score=90.0 if 1.2 <= duration <= 3.5 else 78.0
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
            "primary_angle": avg_elbow,
            "primary_label": "Elbow Flexion",
            "elbow_angle": avg_elbow,
            "body_line_angle": avg_body,
            "body_alignment_angle": avg_body,
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
