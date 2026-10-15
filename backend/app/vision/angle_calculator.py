import math
from typing import Tuple, Dict, Any, Optional

def calculate_angle(point_a: Tuple[float, float], point_b: Tuple[float, float], point_c: Tuple[float, float]) -> float:
    """
    Calculates the interior angle ABC at vertex point_b in degrees [0, 180].
    point_a, point_b, point_c are (x, y) coordinates.
    """
    try:
        ba_x = point_a[0] - point_b[0]
        ba_y = point_a[1] - point_b[1]
        bc_x = point_c[0] - point_b[0]
        bc_y = point_c[1] - point_b[1]

        dot_product = ba_x * bc_x + ba_y * bc_y
        mag_ba = math.hypot(ba_x, ba_y)
        mag_bc = math.hypot(bc_x, bc_y)

        if mag_ba < 1e-6 or mag_bc < 1e-6:
            return 180.0

        cos_angle = dot_product / (mag_ba * mag_bc)
        # Clamp to avoid floating point precision overflow outside [-1.0, 1.0]
        cos_angle = max(-1.0, min(1.0, cos_angle))

        radians = math.acos(cos_angle)
        return float(round(math.degrees(radians), 1))
    except Exception:
        return 180.0

def calculate_angle_3d(point_a: Tuple[float, float, float], point_b: Tuple[float, float, float], point_c: Tuple[float, float, float]) -> float:
    """
    Calculates 3D angle ABC at vertex point_b in degrees.
    """
    try:
        v1 = (point_a[0] - point_b[0], point_a[1] - point_b[1], point_a[2] - point_b[2])
        v2 = (point_c[0] - point_b[0], point_c[1] - point_b[1], point_c[2] - point_b[2])

        dot = v1[0] * v2[0] + v1[1] * v2[1] + v1[2] * v2[2]
        mag1 = math.sqrt(v1[0]**2 + v1[1]**2 + v1[2]**2)
        mag2 = math.sqrt(v2[0]**2 + v2[1]**2 + v2[2]**2)

        if mag1 < 1e-6 or mag2 < 1e-6:
            return 180.0

        cos_angle = max(-1.0, min(1.0, dot / (mag1 * mag2)))
        return float(round(math.degrees(math.acos(cos_angle)), 1))
    except Exception:
        return 180.0

def calculate_vertical_angle(top_point: Tuple[float, float], bottom_point: Tuple[float, float]) -> float:
    """
    Calculates angle of line (bottom -> top) relative to vertical gravity vector (0 = perfectly upright).
    """
    dx = top_point[0] - bottom_point[0]
    dy = top_point[1] - bottom_point[1]  # In screen space, y increases downwards
    
    # In upright torso, top_point (shoulder) has smaller y than bottom_point (hip).
    # dy is negative when upright.
    angle_rad = math.atan2(abs(dx), abs(dy) if abs(dy) > 1e-6 else 1e-6)
    return float(round(math.degrees(angle_rad), 1))

def calculate_horizontal_alignment(left_pt: Tuple[float, float], right_pt: Tuple[float, float]) -> float:
    """
    Measures tilt from horizontal in degrees (0 = completely level).
    """
    dx = right_pt[0] - left_pt[0]
    dy = right_pt[1] - left_pt[1]
    angle_rad = math.atan2(abs(dy), abs(dx) if abs(dx) > 1e-6 else 1e-6)
    return float(round(math.degrees(angle_rad), 1))
