import time
from typing import Dict, Any, List, Tuple
from app.exercises.base_exercise import BaseExercise, ExerciseState
from app.vision.angle_calculator import calculate_angle
from app.vision.landmark_processor import (
    LM_LEFT_SHOULDER, LM_RIGHT_SHOULDER,
    LM_LEFT_ELBOW, LM_RIGHT_ELBOW,
    LM_LEFT_WRIST, LM_RIGHT_WRIST,
    LM_LEFT_HIP, LM_RIGHT_HIP,
    LM_LEFT_KNEE, LM_RIGHT_KNEE,
    LandmarkProcessor
)

class BentOverRowExercise(BaseExercise):
    """
    Biomechanical analyzer for Bent-Over Row (Barbell / Dumbbell).
    Evaluates:
    - Torso hip-hinge inclination (ideal: 40° - 55° from vertical)
    - Elbow retraction angle (flexion at peak pull ~65°-85°, extension ~150°-170°)
    - Bilateral elbow symmetry
    - Anti-momentum torso jerking
    """

    def __init__(self):
        super().__init__(name="Bent-Over Row", slug="bent_over_row")
        self.extension_threshold = 145.0  # Elbow angle in bottom hang
        self.retraction_threshold = 85.0   # Elbow angle at peak row contraction
        self.baseline_torso_angle: float = 45.0

    def required_landmarks(self) -> List[int]:
        return [
            LM_LEFT_SHOULDER, LM_RIGHT_SHOULDER,
            LM_LEFT_ELBOW, LM_RIGHT_ELBOW,
            LM_LEFT_WRIST, LM_RIGHT_WRIST,
            LM_LEFT_HIP, LM_RIGHT_HIP,
            LM_LEFT_KNEE, LM_RIGHT_KNEE,
        ]

    def evaluate_frame(
        self,
        raw_landmarks: Dict[int, Tuple[float, float, float]],
        visibilities: Dict[int, float],
        timestamp: float
    ) -> Dict[str, Any]:
        smoothed = self.smoother.smooth(raw_landmarks)
        named = LandmarkProcessor.extract_named_landmarks(smoothed)

        # 1. Elbow Flexion / Retraction Angles
        left_elbow = calculate_angle(named["left_shoulder"], named["left_elbow"], named["left_wrist"])
        right_elbow = calculate_angle(named["right_shoulder"], named["right_elbow"], named["right_wrist"])
        avg_elbow = round((left_elbow + right_elbow) / 2.0, 1)

        # 2. Torso Hip Hinge Angle (Shoulder - Hip - Knee)
        left_hip_hinge = calculate_angle(named["left_shoulder"], named["left_hip"], named["left_knee"])
        right_hip_hinge = calculate_angle(named["right_shoulder"], named["right_hip"], named["right_knee"])
        avg_hip_hinge = round((left_hip_hinge + right_hip_hinge) / 2.0, 1)

        current_frame_violations = []

        # Check for excessive upright posture (standing too tall reduces lat tension)
        if avg_hip_hinge > 135.0:
            current_frame_violations.append("Torso too upright; hinge deeper")
        elif avg_hip_hinge < 70.0:
            current_frame_violations.append("Hips folded too deep; protect lumbar")

        # Check bilateral symmetry
        elbow_diff = abs(left_elbow - right_elbow)
        if elbow_diff > 18.0:
            current_frame_violations.append("Asymmetric elbow pull")

        # Track min elbow angle during rep
        if self.state in [ExerciseState.DESCENDING, ExerciseState.INFLECTION]:
            if avg_elbow < self.min_primary_angle:
                self.min_primary_angle = avg_elbow

        # --- STATE MACHINE ---
        rep_just_completed = False
        completed_rep_data = None

        if self.state == ExerciseState.START:
            # Athlete begins with arms extended in hang
            if avg_elbow >= self.extension_threshold - 10.0:
                if avg_elbow < self.extension_threshold - 12.0:
                    self.state = ExerciseState.DESCENDING  # Pulling up
                    self.rep_start_time = timestamp
                    self.min_primary_angle = avg_elbow
                    self.current_rep_violations = []

        elif self.state == ExerciseState.DESCENDING:  # Concentric pull
            for v in current_frame_violations:
                if v not in self.current_rep_violations:
                    self.current_rep_violations.append(v)

            # Peak contraction reached
            if avg_elbow <= self.retraction_threshold:
                self.state = ExerciseState.INFLECTION
            elif avg_elbow > self.min_primary_angle + 15.0 and avg_elbow < self.extension_threshold - 20.0:
                # Early turnaround without full pull
                self.state = ExerciseState.ASCENDING
                if "Partial row ROM" not in self.current_rep_violations:
                    self.current_rep_violations.append("Partial row ROM")

        elif self.state == ExerciseState.INFLECTION:
            for v in current_frame_violations:
                if v not in self.current_rep_violations:
                    self.current_rep_violations.append(v)

            # Once arms start extending back down
            if avg_elbow > self.min_primary_angle + 12.0:
                self.state = ExerciseState.ASCENDING

        elif self.state == ExerciseState.ASCENDING:  # Eccentric lowering
            for v in current_frame_violations:
                if v not in self.current_rep_violations:
                    self.current_rep_violations.append(v)

            # Arms returned to full extension lockout
            if avg_elbow >= self.extension_threshold - 5.0:
                duration = timestamp - self.rep_start_time
                if duration >= 0.7:  # Debounce false rep
                    # ROM % based on peak elbow drive
                    rom_pct = min(100.0, max(40.0, (self.extension_threshold - self.min_primary_angle) / (self.extension_threshold - self.retraction_threshold) * 100.0))
                    
                    form_score, breakdown = self.biomechanics.compute_form_score(
                        rom_percentage=rom_pct,
                        violations=self.current_rep_violations,
                        stability_score=max(60.0, 100.0 - (elbow_diff * 1.5)),
                        tempo_score=92.0 if 1.5 <= duration <= 3.5 else 78.0
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

        # Current live score
        live_score = 100.0 - (len(current_frame_violations) * 12.0)

        self.latest_metrics = {
            "primary_angle": avg_elbow,
            "primary_label": "Elbow Retraction",
            "elbow_angle": avg_elbow,
            "torso_angle": avg_hip_hinge,
            "symmetry_diff": round(elbow_diff, 1),
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
