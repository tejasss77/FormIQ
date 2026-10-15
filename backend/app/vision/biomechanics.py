from typing import Dict, Any, List, Optional, Tuple
import math

class BiomechanicsEngine:
    """
    Core mathematical engine for sports biomechanics evaluation.
    Computes range of motion, symmetry, stability, cadence/tempo, and weighted composite form score.
    """

    def __init__(
        self,
        technique_weight: float = 0.40,
        rom_weight: float = 0.25,
        stability_weight: float = 0.20,
        tempo_weight: float = 0.15
    ):
        self.technique_weight = technique_weight
        self.rom_weight = rom_weight
        self.stability_weight = stability_weight
        self.tempo_weight = tempo_weight

    def calculate_form_score(
        self,
        technique_score: float,
        rom_score: float,
        stability_score: float,
        tempo_score: float
    ) -> float:
        """
        Computes the weighted composite Form Score (0-100).
        """
        composite = (
            (technique_score * self.technique_weight) +
            (rom_score * self.rom_weight) +
            (stability_score * self.stability_weight) +
            (tempo_score * self.tempo_weight)
        )
        return float(round(max(0.0, min(100.0, composite)), 1))

    def evaluate_symmetry(self, left_val: float, right_val: float, max_allowable_diff: float = 20.0) -> float:
        """
        Evaluates bilateral balance (left vs right). 100 is perfect symmetry.
        """
        diff = abs(left_val - right_val)
        if diff <= 2.0:
            return 100.0
        penalty = min(60.0, (diff / max_allowable_diff) * 50.0)
        return float(round(max(40.0, 100.0 - penalty), 1))

    def evaluate_rom_percentage(self, current_val: float, target_min: float, target_max: float) -> float:
        """
        Calculates percentage of full range of motion achieved.
        """
        total_range = abs(target_max - target_min)
        if total_range < 1e-4:
            return 100.0
        
        # When moving towards target_min (e.g. knee flexion in squat):
        achieved = (target_max - current_val) / total_range
        pct = max(0.0, min(1.2, achieved)) * 100.0
        return float(round(min(100.0, pct), 1))

    def evaluate_tempo(self, duration_seconds: float, ideal_seconds: float = 2.5, tolerance: float = 1.0) -> float:
        """
        Evaluates repetition cadence against ideal tempo curve.
        """
        diff = abs(duration_seconds - ideal_seconds)
        if diff <= 0.3:
            return 98.0
        if diff <= tolerance:
            return float(round(90.0 - (diff / tolerance) * 15.0, 1))
        # If too fast (<1.2s, rushing) or too slow (>5s, stalling)
        penalty = min(50.0, (diff / tolerance) * 25.0)
        return float(round(max(50.0, 85.0 - penalty), 1))

    def compute_form_score(
        self,
        rom_percentage: float = 90.0,
        violations: Optional[List[str]] = None,
        stability_score: float = 90.0,
        tempo_score: float = 90.0
    ) -> Tuple[float, Dict[str, float]]:
        """
        Calculates composite form score and component breakdown.
        """
        violation_count = len(violations or [])
        technique_score = max(40.0, 100.0 - (violation_count * 15.0))
        rom_score = min(100.0, max(40.0, rom_percentage))
        
        composite = self.calculate_form_score(
            technique_score=technique_score,
            rom_score=rom_score,
            stability_score=stability_score,
            tempo_score=tempo_score
        )
        breakdown = {
            "technique": technique_score,
            "rom": rom_score,
            "stability": stability_score,
            "tempo": tempo_score
        }
        return composite, breakdown
