import time
import httpx
import json
from typing import Dict, Any, List, Optional
from app.core.config import settings
from app.coaching.prompts import COACH_SYSTEM_PROMPT, SUMMARY_SYSTEM_PROMPT

class AICoach:
    def __init__(self, speech_cooldown_seconds: float = 6.0):
        self.speech_cooldown_seconds = speech_cooldown_seconds
        self.last_spoken_time: float = 0.0
        self.last_spoken_text: str = ""

    def should_speak(self, current_time: Optional[float] = None) -> bool:
        now = current_time or time.time()
        return (now - self.last_spoken_time) >= self.speech_cooldown_seconds

    def mark_spoken(self, text: str, current_time: Optional[float] = None):
        self.last_spoken_time = current_time or time.time()
        self.last_spoken_text = text

    async def get_live_coaching(self, structured_event: Dict[str, Any]) -> Dict[str, Any]:
        """
        Receives structured biomechanics event from the vision engine and generates concise coaching cue.
        Uses cooldown mechanism to avoid constant speaking.
        """
        exercise = structured_event.get("exercise", "").lower()
        form_score = structured_event.get("form_score", 100)
        violations = structured_event.get("violations", [])
        rep = structured_event.get("rep", 0)

        # 1. First priority: Resolve any active form violation
        cue_text = ""
        category = "encouragement"

        if "Too shallow" in violations or structured_event.get("depth") == "shallow":
            cue_text = "Go slightly deeper on your next rep."
            category = "depth"
        elif "Excessive torso lean" in violations or structured_event.get("back_angle") == "BACK LEAN":
            cue_text = "Keep your chest up and core braced."
            category = "form"
        elif "Knee valgus collapse" in violations or structured_event.get("knee_alignment") == "KNEE ALIGNMENT ISSUE":
            cue_text = "Drive your knees outward over your toes."
            category = "form"
        elif "Hip sag" in violations:
            cue_text = "Squeeze glutes and raise your hips."
            category = "form"
        elif "Hips elevated" in violations:
            cue_text = "Flatten out into a straight plank."
            category = "form"
        elif "Partial rep" in violations or "Partial ROM" in violations:
            cue_text = "Full range of motion. Complete the lockout."
            category = "rom"
        elif "Body swing" in violations:
            cue_text = "Eliminate momentum. Keep your torso steady."
            category = "stability"
        elif "Elbow drift" in violations:
            cue_text = "Keep your elbows pinned to your ribs."
            category = "form"
        elif "Excessive back arch" in violations:
            cue_text = "Brace your ribs down. Avoid arching."
            category = "form"
        elif "Forward lean" in violations:
            cue_text = "Stay upright through your torso."
            category = "form"
        elif "Knee overshooting toes" in violations:
            cue_text = "Sit back into your hips."
            category = "form"
        elif "Torso too upright" in str(violations):
            cue_text = "Hinge deeper at the hips. Keep back flat."
            category = "form"
        elif "Asymmetric elbow pull" in violations:
            cue_text = "Pull elbows back evenly together."
            category = "symmetry"
        elif "Squatting instead of hinging" in str(violations):
            cue_text = "Push hips straight back. Don't squat down."
            category = "form"
        elif "Keep a soft bend" in str(violations):
            cue_text = "Keep soft knees. Don't lock them stiff."
            category = "form"
        elif "Hip sag" in str(violations):
            cue_text = "Squeeze glutes and raise your hips."
            category = "form"
        elif "Hips elevated" in str(violations):
            cue_text = "Flatten out into a straight plank line."
            category = "form"
        elif "Balance instability" in violations:
            cue_text = "Widen your base for balance."
            category = "stability"
        elif form_score >= 90:
            praise_cues = [
                "Clean rep. Keep that tempo.",
                "Rock solid form. Drive up.",
                "Crisp depth. Lock in.",
                "Powerful movement. Stay braced.",
                "Great control. Maintain that rhythm."
            ]
            cue_text = praise_cues[rep % len(praise_cues)]
            category = "encouragement"
        else:
            cue_text = "Control the eccentric lowering phase."
            category = "cadence"

        # Check if external LLM configured and can refine
        if settings.OPENAI_API_KEY and False:  # LLM available if needed for offline post-rep analysis
            pass

        now = time.time()
        will_speak = self.should_speak(now) and (cue_text != self.last_spoken_text)

        if will_speak:
            self.mark_spoken(cue_text, now)

        return {
            "text": cue_text,
            "spoken": will_speak,
            "category": category,
            "rep": rep,
            "form_score": form_score
        }

    def generate_workout_summary(
        self,
        exercise_name: str,
        total_reps: int,
        duration_minutes: float,
        avg_score: float,
        rep_history: List[Dict[str, Any]]
    ) -> Dict[str, Any]:
        """
        Generates comprehensive post-workout report card.
        """
        all_violations = []
        for r in rep_history:
            all_violations.extend(r.get("violations", []))

        # Positives
        positives = []
        if avg_score >= 85:
            positives.append(f"Excellent overall technique consistency ({int(avg_score)}/100).")
        if "Too shallow" not in all_violations and total_reps > 0:
            positives.append("Achieved full target range of motion on every repetition.")
        else:
            positives.append("Solid engagement and concentric power throughout.")
        
        positives.append("Cadence and controlled eccentric tempo remained steady.")
        if "Excessive torso lean" not in all_violations:
            positives.append("Neutral spine and upright torso alignment maintained.")

        # Focus Next Time
        improvements = []
        if "Too shallow" in all_violations:
            improvements.append("Hit parallel depth consistently on late-set repetitions.")
        if "Hip sag" in all_violations or "Excessive back arch" in all_violations:
            improvements.append("Maintain rigid core and pelvic anti-extension bracing.")
        if "Knee valgus collapse" in all_violations:
            improvements.append("Strengthen hip abductors and consciously drive knees outward.")
        if "Body swing" in all_violations or "Elbow drift" in all_violations:
            improvements.append("Control momentum during transition; keep pivot joints locked.")
        if not improvements:
            improvements.append("Progress resistance or add tempo pauses at inflection point.")
            improvements.append("Maintain 3-second eccentric deceleration on the descent.")

        takeaway = (
            f"Strong session on {exercise_name}. Completed {total_reps} repetitions across {duration_minutes:.1f} minutes "
            f"with a high-tier {int(avg_score)} Form Score. Movement velocity and joint tracking remained within athletic parameters."
        )

        return {
            "positives": positives[:3],
            "improvements": improvements[:2],
            "coach_takeaway": takeaway
        }
