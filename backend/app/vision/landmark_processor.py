from typing import Dict, List, Tuple, Optional, Any
import numpy as np

# MediaPipe Pose Landmark Indices
LM_NOSE = 0
LM_LEFT_EYE_INNER = 1
LM_LEFT_EYE = 2
LM_LEFT_EYE_OUTER = 3
LM_RIGHT_EYE_INNER = 4
LM_RIGHT_EYE = 5
LM_RIGHT_EYE_OUTER = 6
LM_LEFT_EAR = 7
LM_RIGHT_EAR = 8
LM_MOUTH_LEFT = 9
LM_MOUTH_RIGHT = 10
LM_LEFT_SHOULDER = 11
LM_RIGHT_SHOULDER = 12
LM_LEFT_ELBOW = 13
LM_RIGHT_ELBOW = 14
LM_LEFT_WRIST = 15
LM_RIGHT_WRIST = 16
LM_LEFT_PINKY = 17
LM_RIGHT_PINKY = 18
LM_LEFT_INDEX = 19
LM_RIGHT_INDEX = 20
LM_LEFT_THUMB = 21
LM_RIGHT_THUMB = 22
LM_LEFT_HIP = 23
LM_RIGHT_HIP = 24
LM_LEFT_KNEE = 25
LM_RIGHT_KNEE = 26
LM_LEFT_ANKLE = 27
LM_RIGHT_ANKLE = 28
LM_LEFT_HEEL = 29
LM_RIGHT_HEEL = 30
LM_LEFT_FOOT_INDEX = 31
LM_RIGHT_FOOT_INDEX = 32

class LandmarkSmoother:
    """
    Exponential Moving Average smoother to eliminate high-frequency webcam landmark jitter.
    """
    def __init__(self, alpha: float = 0.65):
        self.alpha = alpha
        self.prev_landmarks: Optional[Dict[int, Tuple[float, float, float]]] = None

    def smooth(self, raw_landmarks: Dict[int, Tuple[float, float, float]]) -> Dict[int, Tuple[float, float, float]]:
        if not raw_landmarks:
            return {}

        if self.prev_landmarks is None:
            self.prev_landmarks = raw_landmarks.copy()
            return raw_landmarks

        smoothed = {}
        for idx, (x, y, z) in raw_landmarks.items():
            if idx in self.prev_landmarks:
                px, py, pz = self.prev_landmarks[idx]
                sx = self.alpha * x + (1.0 - self.alpha) * px
                sy = self.alpha * y + (1.0 - self.alpha) * py
                sz = self.alpha * z + (1.0 - self.alpha) * pz
                smoothed[idx] = (sx, sy, sz)
            else:
                smoothed[idx] = (x, y, z)

        self.prev_landmarks = smoothed.copy()
        return smoothed

    def reset(self):
        self.prev_landmarks = None


class LandmarkProcessor:
    @staticmethod
    def extract_named_landmarks(landmarks: Dict[int, Tuple[float, float, float]]) -> Dict[str, Tuple[float, float]]:
        """
        Returns 2D (x, y) coordinates for key biomechanical landmarks.
        """
        def pt(idx: int) -> Tuple[float, float]:
            if idx in landmarks:
                return (landmarks[idx][0], landmarks[idx][1])
            return (0.0, 0.0)

        # Midpoints
        ls = pt(LM_LEFT_SHOULDER)
        rs = pt(LM_RIGHT_SHOULDER)
        mid_shoulder = ((ls[0] + rs[0]) / 2.0, (ls[1] + rs[1]) / 2.0)

        lh = pt(LM_LEFT_HIP)
        rh = pt(LM_RIGHT_HIP)
        mid_hip = ((lh[0] + rh[0]) / 2.0, (lh[1] + rh[1]) / 2.0)

        return {
            "nose": pt(LM_NOSE),
            "left_shoulder": ls,
            "right_shoulder": rs,
            "mid_shoulder": mid_shoulder,
            "left_elbow": pt(LM_LEFT_ELBOW),
            "right_elbow": pt(LM_RIGHT_ELBOW),
            "left_wrist": pt(LM_LEFT_WRIST),
            "right_wrist": pt(LM_RIGHT_WRIST),
            "left_hip": lh,
            "right_hip": rh,
            "mid_hip": mid_hip,
            "left_knee": pt(LM_LEFT_KNEE),
            "right_knee": pt(LM_RIGHT_KNEE),
            "left_ankle": pt(LM_LEFT_ANKLE),
            "right_ankle": pt(LM_RIGHT_ANKLE),
            "left_foot": pt(LM_LEFT_FOOT_INDEX),
            "right_foot": pt(LM_RIGHT_FOOT_INDEX),
        }

    @staticmethod
    def validate_visibility(
        landmarks: Dict[int, Tuple[float, float, float]],
        visibilities: Dict[int, float],
        required_indices: List[int],
        min_confidence: float = 0.45
    ) -> Tuple[bool, List[str]]:
        """
        Verifies all required joints are in camera frame with sufficient confidence.
        """
        missing = []
        name_map = {
            LM_LEFT_SHOULDER: "Left Shoulder",
            LM_RIGHT_SHOULDER: "Right Shoulder",
            LM_LEFT_ELBOW: "Left Elbow",
            LM_RIGHT_ELBOW: "Right Elbow",
            LM_LEFT_WRIST: "Left Wrist",
            LM_RIGHT_WRIST: "Right Wrist",
            LM_LEFT_HIP: "Left Hip",
            LM_RIGHT_HIP: "Right Hip",
            LM_LEFT_KNEE: "Left Knee",
            LM_RIGHT_KNEE: "Right Knee",
            LM_LEFT_ANKLE: "Left Ankle",
            LM_RIGHT_ANKLE: "Right Ankle",
        }

        for idx in required_indices:
            conf = visibilities.get(idx, 0.0)
            if idx not in landmarks or conf < min_confidence:
                missing.append(name_map.get(idx, f"Joint {idx}"))

        return (len(missing) == 0, missing)
