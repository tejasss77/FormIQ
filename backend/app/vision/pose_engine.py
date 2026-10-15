import os
import io
import base64
import time
from typing import Dict, Tuple, List, Optional, Any
import numpy as np
import cv2
import mediapipe as mp
from mediapipe.tasks import python
from mediapipe.tasks.python import vision

# Default model path
DEFAULT_MODEL_PATH = os.path.join(
    os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))),
    "models_data",
    "pose_landmarker.task"
)

# Standard skeleton connections for rendering
SKELETON_CONNECTIONS = [
    # Face
    (0, 1), (1, 2), (2, 3), (3, 7),
    (0, 4), (4, 5), (5, 6), (6, 8),
    (9, 10),
    # Torso
    (11, 12), (11, 23), (12, 24), (23, 24),
    # Left Arm
    (11, 13), (13, 15), (15, 17), (15, 19), (15, 21),
    # Right Arm
    (12, 14), (14, 16), (16, 18), (16, 20), (16, 22),
    # Left Leg
    (23, 25), (25, 27), (27, 29), (27, 31), (29, 31),
    # Right Leg
    (24, 26), (26, 28), (28, 30), (28, 32), (30, 32),
]

class PoseEngine:
    _instance = None

    def __init__(self, model_path: Optional[str] = None):
        path = model_path or DEFAULT_MODEL_PATH
        if not os.path.exists(path):
            raise FileNotFoundError(f"MediaPipe task model not found at {path}")
        
        base_options = python.BaseOptions(model_asset_path=path)
        options = vision.PoseLandmarkerOptions(
            base_options=base_options,
            output_segmentation_masks=False,
            min_pose_detection_confidence=0.5,
            min_pose_presence_confidence=0.5,
            min_tracking_confidence=0.5,
        )
        self.detector = vision.PoseLandmarker.create_from_options(options)

    @classmethod
    def get_instance(cls, model_path: Optional[str] = None) -> "PoseEngine":
        if cls._instance is None:
            cls._instance = cls(model_path)
        return cls._instance

    def process_frame_bgr(self, frame_bgr: np.ndarray) -> Dict[str, Any]:
        """
        Processes a BGR OpenCV frame and returns landmarks and visibilities.
        """
        h, w, _ = frame_bgr.shape
        frame_rgb = cv2.cvtColor(frame_bgr, cv2.COLOR_BGR2RGB)
        mp_image = mp.Image(image_format=mp.ImageFormat.SRGB, data=frame_rgb)
        
        detection_result = self.detector.detect(mp_image)
        
        if not detection_result.pose_landmarks or len(detection_result.pose_landmarks) == 0:
            return {
                "detected": False,
                "landmarks": {},
                "visibilities": {},
                "world_landmarks": {},
                "raw_landmarks_list": []
            }

        # MediaPipe returns list of landmark lists (one per person detected)
        person_landmarks = detection_result.pose_landmarks[0]
        landmarks_dict: Dict[int, Tuple[float, float, float]] = {}
        visibilities_dict: Dict[int, float] = {}
        raw_list = []

        for idx, lm in enumerate(person_landmarks):
            landmarks_dict[idx] = (float(lm.x), float(lm.y), float(lm.z))
            visibilities_dict[idx] = float(lm.visibility if lm.visibility is not None else 1.0)
            raw_list.append({
                "id": idx,
                "x": float(lm.x),
                "y": float(lm.y),
                "z": float(lm.z),
                "visibility": float(lm.visibility if lm.visibility is not None else 1.0)
            })

        return {
            "detected": True,
            "landmarks": landmarks_dict,
            "visibilities": visibilities_dict,
            "raw_landmarks_list": raw_list
        }

    def process_base64_image(self, base64_data: str) -> Tuple[Dict[str, Any], Optional[np.ndarray]]:
        """
        Decodes a base64 JPEG/PNG string and processes pose.
        """
        try:
            if "," in base64_data:
                base64_data = base64_data.split(",", 1)[1]
            img_bytes = base64.b64decode(base64_data)
            nparr = np.frombuffer(img_bytes, np.uint8)
            frame_bgr = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
            if frame_bgr is None:
                return ({"detected": False, "error": "Invalid image bytes"}, None)
            
            result = self.process_frame_bgr(frame_bgr)
            return (result, frame_bgr)
        except Exception as e:
            return ({"detected": False, "error": str(e)}, None)
