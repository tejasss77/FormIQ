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

class SquatExercise(BaseExercise):
    def __init__(self):
        super().__init__(name="Squat", slug="squat")
        self.standing_threshold = 150.0  # knee angle degrees
        self.depth_threshold = 95.0      # knee angle degrees for parallel depth
        self.shallow_threshold = 105.0    # knee angle threshold for too shallow

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

        # 1. Calculate Joint Angles
        left_knee_angle = calculate_angle(named["left_hip"], named["left_knee"], named["left_ankle"])
        right_knee_angle = calculate_angle(named["right_hip"], named["right_knee"], named["right_ankle"])
        avg_knee_angle = round((left_knee_angle + right_knee_angle) / 2.0, 1)

        left_hip_angle = calculate_angle(named["left_shoulder"], named["left_hip"], named["left_knee"])
        right_hip_angle = calculate_angle(named["right_shoulder"], named["right_hip"], named["right_knee"])
        avg_hip_angle = round((left_hip_angle + right_hip_angle) / 2.0, 1)

        # Torso angle relative to vertical (0 = upright)
        left_torso_tilt = calculate_vertical_angle(named["left_shoulder"], named["left_hip"])
        right_torso_tilt = calculate_vertical_angle(named["right_shoulder"], named["right_hip"])
        torso_angle = round((left_torso_tilt + right_torso_tilt) / 2.0, 1)

        # Knee alignment / valgus check (distance between knees vs ankles)
        knee_dist = abs(named["left_knee"][0] - named["right_knee"][0])
        ankle_dist = abs(named["left_ankle"][0] - named["right_ankle"][0])
        knee_alignment_status = "GOOD"
        if ankle_dist > 0.05 and (knee_dist / ankle_dist) < 0.72:
            knee_alignment_status = "KNEE ALIGNMENT ISSUE"

        # Torso lean check
        back_angle_status = "GOOD"
        if torso_angle > 45.0:
            back_angle_status = "BACK LEAN"

        # Squat Depth status
        depth_status = "STANDING"
        if avg_knee_angle <= self.depth_threshold:
            depth_status = "GOOD DEPTH"
        elif avg_knee_angle <= 120.0:
            depth_status = "DESCENDING"
        elif avg_knee_angle > self.standing_threshold:
            depth_status = "STANDING"

        # Track Min Knee Angle for rep
        if avg_knee_angle < self.min_primary_angle:
            self.min_primary_angle = avg_knee_angle

        # Violations in this frame
        current_frame_violations = []
        if back_angle_status == "BACK LEAN":
            current_frame_violations.append("Excessive torso lean")
        if knee_alignment_status == "KNEE ALIGNMENT ISSUE":
            current_frame_violations.append("Knee valgus collapse")

        self.current_rep_violations.extend(current_frame_violations)

        # Range of motion percentage (165 standing down to 90 depth)
        rom_pct = self.biomechanics.evaluate_rom_percentage(avg_knee_angle, target_min=90.0, target_max=165.0)
        symmetry_score = self.biomechanics.evaluate_symmetry(left_knee_angle, right_knee_angle)

        completed_rep_data = None

        # 2. State Machine Transitions
        if self.state == ExerciseState.START:
            if avg_knee_angle < 140.0:
                self.state = ExerciseState.DESCENDING
                self.rep_start_time = timestamp if timestamp > 0 else time.time()
                self.min_primary_angle = avg_knee_angle
                self.current_rep_violations = []

        elif self.state == ExerciseState.DESCENDING:
            if avg_knee_angle <= self.depth_threshold:
                self.state = ExerciseState.INFLECTION
            elif avg_knee_angle > (self.min_primary_angle + 12.0) and self.min_primary_angle > self.shallow_threshold:
                # Reversing too early without hitting depth
                self.current_rep_violations.append("Too shallow")
                self.state = ExerciseState.ASCENDING

        elif self.state == ExerciseState.INFLECTION:
            if avg_knee_angle > (self.min_primary_angle + 10.0):
                self.state = ExerciseState.ASCENDING

        elif self.state == ExerciseState.ASCENDING:
            if avg_knee_angle >= self.standing_threshold:
                # Rep completed!
                rep_duration = max(0.8, (timestamp if timestamp > 0 else time.time()) - self.rep_start_time)
                
                # Check if depth was hit
                is_shallow = self.min_primary_angle > self.depth_threshold
                if is_shallow:
                    self.current_rep_violations.append("Too shallow")
                    depth_score = 65.0
                else:
                    depth_score = 95.0

                technique_score = 95.0
                if "Excessive torso lean" in self.current_rep_violations:
                    technique_score -= 15.0
                if "Knee valgus collapse" in self.current_rep_violations:
                    technique_score -= 20.0
                technique_score = max(50.0, (technique_score + depth_score) / 2.0)

                tempo_score = self.biomechanics.evaluate_tempo(rep_duration, ideal_seconds=2.4)
                stability_score = round(max(60.0, min(98.0, 95.0 - (torso_angle * 0.3))), 1)

                completed_rep_data = self.record_rep_completion(
                    rep_duration=rep_duration,
                    technique_score=technique_score,
                    rom_score=rom_pct if not is_shallow else 70.0,
                    stability_score=stability_score,
                    tempo_score=tempo_score,
                    violations=self.current_rep_violations
                )

                # Reset for next rep
                self.state = ExerciseState.START
                self.min_primary_angle = 180.0
                self.current_rep_violations = []

        # Current live form score calculation
        live_form_score = 90.0
        if depth_status == "TOO SHALLOW":
            live_form_score -= 15.0
        if back_angle_status == "BACK LEAN":
            live_form_score -= 15.0
        if knee_alignment_status == "KNEE ALIGNMENT ISSUE":
            live_form_score -= 20.0

        self.latest_metrics = {
            "knee_angle": avg_knee_angle,
            "left_knee_angle": left_knee_angle,
            "right_knee_angle": right_knee_angle,
            "hip_angle": avg_hip_angle,
            "torso_angle": torso_angle,
            "depth_status": depth_status,
            "knee_alignment": knee_alignment_status,
            "back_angle": back_angle_status,
            "rom_percentage": rom_pct,
            "symmetry_score": symmetry_score,
            "rep_phase": self.state,
            "reps_count": self.rep_count,
            "form_score": live_form_score,
            "active_violations": current_frame_violations
        }

        return {
            "metrics": self.latest_metrics,
            "completed_rep": completed_rep_data,
            "reps": self.rep_count,
            "phase": self.state
        }
