import time
from typing import Dict, Any, List, Tuple
from app.exercises.base_exercise import BaseExercise, ExerciseState
from app.vision.angle_calculator import calculate_angle, calculate_vertical_angle
from app.vision.landmark_processor import (
    LM_LEFT_SHOULDER, LM_RIGHT_SHOULDER,
    LM_LEFT_ELBOW, LM_RIGHT_ELBOW,
    LM_LEFT_WRIST, LM_RIGHT_WRIST,
    LM_LEFT_HIP, LM_RIGHT_HIP,
    LandmarkProcessor
)

class ShoulderPressExercise(BaseExercise):
    def __init__(self):
        super().__init__(name="Shoulder Press", slug="shoulder_press")
        self.rack_threshold = 85.0       # elbows down around 90 or below
        self.lockout_threshold = 160.0    # overhead lockout

    def required_landmarks(self) -> List[int]:
        return [
            LM_LEFT_SHOULDER, LM_RIGHT_SHOULDER,
            LM_LEFT_ELBOW, LM_RIGHT_ELBOW,
            LM_LEFT_WRIST, LM_RIGHT_WRIST,
            LM_LEFT_HIP, LM_RIGHT_HIP
        ]

    def evaluate_frame(
        self,
        raw_landmarks: Dict[int, Tuple[float, float, float]],
        visibilities: Dict[int, float],
        timestamp: float
    ) -> Dict[str, Any]:
        smoothed = self.smoother.smooth(raw_landmarks)
        named = LandmarkProcessor.extract_named_landmarks(smoothed)

        # 1. Elbow Extension Angles
        left_elbow = calculate_angle(named["left_shoulder"], named["left_elbow"], named["left_wrist"])
        right_elbow = calculate_angle(named["right_shoulder"], named["right_elbow"], named["right_wrist"])
        avg_elbow_angle = round((left_elbow + right_elbow) / 2.0, 1)

        # 2. Shoulder Elevation (torso to upper arm angle)
        left_shoulder_elev = calculate_angle(named["left_hip"], named["left_shoulder"], named["left_elbow"])
        right_shoulder_elev = calculate_angle(named["right_hip"], named["right_shoulder"], named["right_elbow"])
        avg_shoulder_elev = round((left_shoulder_elev + right_shoulder_elev) / 2.0, 1)

        # 3. Torso Arch / Lean
        torso_angle = calculate_vertical_angle(named["mid_shoulder"], named["mid_hip"])
        back_arch = torso_angle > 18.0

        current_frame_violations = []
        if back_arch:
            current_frame_violations.append("Excessive back arch")

        self.current_rep_violations.extend(current_frame_violations)

        if avg_elbow_angle > self.max_primary_angle:
            self.max_primary_angle = avg_elbow_angle

        # ROM percentage (80 rack up to 165 lockout)
        rom_pct = self.biomechanics.evaluate_rom_percentage(180.0 - avg_elbow_angle, target_min=15.0, target_max=100.0)

        completed_rep_data = None

        # State machine: START (at shoulders, elbow < 100°) -> ASCENDING (pressing up) -> INFLECTION (lockout) -> DESCENDING (lowering)
        if self.state == ExerciseState.START:
            if avg_elbow_angle > 115.0:
                self.state = ExerciseState.ASCENDING
                self.rep_start_time = timestamp if timestamp > 0 else time.time()
                self.max_primary_angle = avg_elbow_angle
                self.current_rep_violations = []

        elif self.state == ExerciseState.ASCENDING:
            if avg_elbow_angle >= self.lockout_threshold:
                self.state = ExerciseState.INFLECTION
            elif avg_elbow_angle < (self.max_primary_angle - 15.0) and self.max_primary_angle < 145.0:
                self.current_rep_violations.append("Partial lockout")
                self.state = ExerciseState.DESCENDING

        elif self.state == ExerciseState.INFLECTION:
            if avg_elbow_angle < (self.max_primary_angle - 10.0):
                self.state = ExerciseState.DESCENDING

        elif self.state == ExerciseState.DESCENDING:
            if avg_elbow_angle <= 100.0:
                rep_duration = max(0.8, (timestamp if timestamp > 0 else time.time()) - self.rep_start_time)
                is_partial = self.max_primary_angle < self.lockout_threshold

                technique_score = 95.0
                if "Excessive back arch" in self.current_rep_violations:
                    technique_score -= 20.0
                if is_partial:
                    technique_score -= 15.0

                tempo_score = self.biomechanics.evaluate_tempo(rep_duration, ideal_seconds=2.4)
                stability_score = round(max(50.0, 100.0 - (torso_angle * 2.0)), 1)

                completed_rep_data = self.record_rep_completion(
                    rep_duration=rep_duration,
                    technique_score=max(50.0, technique_score),
                    rom_score=rom_pct if not is_partial else 70.0,
                    stability_score=stability_score,
                    tempo_score=tempo_score,
                    violations=self.current_rep_violations
                )

                self.state = ExerciseState.START
                self.max_primary_angle = 0.0
                self.current_rep_violations = []

        live_form = 92.0
        if back_arch:
            live_form -= 20.0

        self.latest_metrics = {
            "elbow_angle": avg_elbow_angle,
            "shoulder_elevation": avg_shoulder_elev,
            "torso_angle": torso_angle,
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
