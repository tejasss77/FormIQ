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

class BicepsCurlExercise(BaseExercise):
    def __init__(self):
        super().__init__(name="Biceps Curl", slug="biceps_curl")
        self.extension_threshold = 150.0  # full bottom extension
        self.flexion_threshold = 50.0     # top squeeze

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

        # 1. Elbow Angles
        left_elbow = calculate_angle(named["left_shoulder"], named["left_elbow"], named["left_wrist"])
        right_elbow = calculate_angle(named["right_shoulder"], named["right_elbow"], named["right_wrist"])
        avg_elbow_angle = round((left_elbow + right_elbow) / 2.0, 1)

        # 2. Torso sway
        torso_angle = calculate_vertical_angle(named["mid_shoulder"], named["mid_hip"])
        body_swing = torso_angle > 18.0

        # 3. Elbow drift (angle between hip-shoulder and shoulder-elbow, should stay close to torso < 25°)
        left_upper_arm_angle = calculate_angle(named["left_hip"], named["left_shoulder"], named["left_elbow"])
        right_upper_arm_angle = calculate_angle(named["right_hip"], named["right_shoulder"], named["right_elbow"])
        avg_arm_flare = round((left_upper_arm_angle + right_upper_arm_angle) / 2.0, 1)
        elbow_drift = avg_arm_flare > 30.0

        current_frame_violations = []
        if body_swing:
            current_frame_violations.append("Body swing")
        if elbow_drift:
            current_frame_violations.append("Elbow drift")

        self.current_rep_violations.extend(current_frame_violations)

        # In curls, primary angle starts large (~160°) and decreases during flexion
        if avg_elbow_angle < self.min_primary_angle:
            self.min_primary_angle = avg_elbow_angle

        # ROM percentage
        rom_pct = self.biomechanics.evaluate_rom_percentage(avg_elbow_angle, target_min=45.0, target_max=155.0)

        completed_rep_data = None

        # State transitions: START (extended) -> ASCENDING (curling up) -> INFLECTION -> DESCENDING (lowering)
        if self.state == ExerciseState.START:
            if avg_elbow_angle < 135.0:
                self.state = ExerciseState.ASCENDING
                self.rep_start_time = timestamp if timestamp > 0 else time.time()
                self.min_primary_angle = avg_elbow_angle
                self.current_rep_violations = []

        elif self.state == ExerciseState.ASCENDING:
            if avg_elbow_angle <= self.flexion_threshold:
                self.state = ExerciseState.INFLECTION
            elif avg_elbow_angle > (self.min_primary_angle + 15.0) and self.min_primary_angle > 70.0:
                self.current_rep_violations.append("Partial ROM")
                self.state = ExerciseState.DESCENDING

        elif self.state == ExerciseState.INFLECTION:
            if avg_elbow_angle > (self.min_primary_angle + 10.0):
                self.state = ExerciseState.DESCENDING

        elif self.state == ExerciseState.DESCENDING:
            if avg_elbow_angle >= self.extension_threshold:
                rep_duration = max(0.8, (timestamp if timestamp > 0 else time.time()) - self.rep_start_time)
                is_partial = self.min_primary_angle > self.flexion_threshold

                technique_score = 95.0
                if "Body swing" in self.current_rep_violations:
                    technique_score -= 20.0
                if "Elbow drift" in self.current_rep_violations:
                    technique_score -= 15.0
                if is_partial:
                    technique_score -= 15.0

                tempo_score = self.biomechanics.evaluate_tempo(rep_duration, ideal_seconds=2.8)
                stability_score = round(max(50.0, 100.0 - (torso_angle * 2.0)), 1)

                completed_rep_data = self.record_rep_completion(
                    rep_duration=rep_duration,
                    technique_score=max(50.0, technique_score),
                    rom_score=rom_pct if not is_partial else 72.0,
                    stability_score=stability_score,
                    tempo_score=tempo_score,
                    violations=self.current_rep_violations
                )

                self.state = ExerciseState.START
                self.min_primary_angle = 180.0
                self.current_rep_violations = []

        live_form = 92.0
        if body_swing:
            live_form -= 20.0
        if elbow_drift:
            live_form -= 15.0

        self.latest_metrics = {
            "elbow_angle": avg_elbow_angle,
            "torso_sway": torso_angle,
            "arm_flare": avg_arm_flare,
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
