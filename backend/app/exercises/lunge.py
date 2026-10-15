import time
from typing import Dict, Any, List, Tuple
from app.exercises.base_exercise import BaseExercise, ExerciseState
from app.vision.angle_calculator import calculate_angle, calculate_vertical_angle
from app.vision.landmark_processor import (
    LM_LEFT_HIP, LM_RIGHT_HIP,
    LM_LEFT_KNEE, LM_RIGHT_KNEE,
    LM_LEFT_ANKLE, LM_RIGHT_ANKLE,
    LM_LEFT_SHOULDER, LM_RIGHT_SHOULDER,
    LandmarkProcessor
)

class LungeExercise(BaseExercise):
    def __init__(self):
        super().__init__(name="Lunge", slug="lunge")
        self.standing_threshold = 150.0  # standing knees
        self.depth_threshold = 95.0      # lead knee flexion

    def required_landmarks(self) -> List[int]:
        return [
            LM_LEFT_HIP, LM_RIGHT_HIP,
            LM_LEFT_KNEE, LM_RIGHT_KNEE,
            LM_LEFT_ANKLE, LM_RIGHT_ANKLE,
            LM_LEFT_SHOULDER, LM_RIGHT_SHOULDER
        ]

    def evaluate_frame(
        self,
        raw_landmarks: Dict[int, Tuple[float, float, float]],
        visibilities: Dict[int, float],
        timestamp: float
    ) -> Dict[str, Any]:
        smoothed = self.smoother.smooth(raw_landmarks)
        named = LandmarkProcessor.extract_named_landmarks(smoothed)

        # In lunges, one knee flexes forward. We find the lead knee (more flexed / smaller angle)
        left_knee = calculate_angle(named["left_hip"], named["left_knee"], named["left_ankle"])
        right_knee = calculate_angle(named["right_hip"], named["right_knee"], named["right_ankle"])
        lead_knee_angle = min(left_knee, right_knee)
        is_left_lead = left_knee < right_knee
        lead_knee_pt = named["left_knee"] if is_left_lead else named["right_knee"]
        lead_ankle_pt = named["left_ankle"] if is_left_lead else named["right_ankle"]

        # Torso uprightness
        torso_angle = calculate_vertical_angle(named["mid_shoulder"], named["mid_hip"])
        forward_lean = torso_angle > 25.0

        # Knee position relative to ankle (overshoot)
        knee_overshoot = abs(lead_knee_pt[0] - lead_ankle_pt[0]) > 0.12

        # Balance / sway
        hip_tilt = abs(named["left_hip"][1] - named["right_hip"][1])
        balance_issue = hip_tilt > 0.08

        current_frame_violations = []
        if forward_lean:
            current_frame_violations.append("Forward lean")
        if knee_overshoot:
            current_frame_violations.append("Knee overshooting toes")
        if balance_issue:
            current_frame_violations.append("Balance instability")

        self.current_rep_violations.extend(current_frame_violations)

        if lead_knee_angle < self.min_primary_angle:
            self.min_primary_angle = lead_knee_angle

        rom_pct = self.biomechanics.evaluate_rom_percentage(lead_knee_angle, target_min=90.0, target_max=160.0)

        completed_rep_data = None

        if self.state == ExerciseState.START:
            if lead_knee_angle < 135.0:
                self.state = ExerciseState.DESCENDING
                self.rep_start_time = timestamp if timestamp > 0 else time.time()
                self.min_primary_angle = lead_knee_angle
                self.current_rep_violations = []

        elif self.state == ExerciseState.DESCENDING:
            if lead_knee_angle <= self.depth_threshold:
                self.state = ExerciseState.INFLECTION
            elif lead_knee_angle > (self.min_primary_angle + 12.0) and self.min_primary_angle > 105.0:
                self.current_rep_violations.append("Too shallow")
                self.state = ExerciseState.ASCENDING

        elif self.state == ExerciseState.INFLECTION:
            if lead_knee_angle > (self.min_primary_angle + 10.0):
                self.state = ExerciseState.ASCENDING

        elif self.state == ExerciseState.ASCENDING:
            if lead_knee_angle >= self.standing_threshold:
                rep_duration = max(0.8, (timestamp if timestamp > 0 else time.time()) - self.rep_start_time)
                is_shallow = self.min_primary_angle > self.depth_threshold
                if is_shallow:
                    self.current_rep_violations.append("Too shallow")

                technique_score = 95.0
                if "Forward lean" in self.current_rep_violations:
                    technique_score -= 15.0
                if "Knee overshooting toes" in self.current_rep_violations:
                    technique_score -= 15.0
                if "Balance instability" in self.current_rep_violations:
                    technique_score -= 15.0
                if is_shallow:
                    technique_score -= 15.0

                tempo_score = self.biomechanics.evaluate_tempo(rep_duration, ideal_seconds=2.6)
                stability_score = round(max(50.0, 100.0 - (hip_tilt * 300.0)), 1)

                completed_rep_data = self.record_rep_completion(
                    rep_duration=rep_duration,
                    technique_score=max(45.0, technique_score),
                    rom_score=rom_pct if not is_shallow else 70.0,
                    stability_score=stability_score,
                    tempo_score=tempo_score,
                    violations=self.current_rep_violations
                )

                self.state = ExerciseState.START
                self.min_primary_angle = 180.0
                self.current_rep_violations = []

        live_form = 90.0
        if forward_lean:
            live_form -= 15.0
        if balance_issue:
            live_form -= 15.0

        self.latest_metrics = {
            "lead_knee_angle": lead_knee_angle,
            "torso_angle": torso_angle,
            "knee_overshoot": knee_overshoot,
            "balance_status": "UNSTABLE" if balance_issue else "STABLE",
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
