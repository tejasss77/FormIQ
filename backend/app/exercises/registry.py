from typing import Dict, Type, List, Any
from app.exercises.base_exercise import BaseExercise
from app.exercises.squat import SquatExercise
from app.exercises.pushup import PushupExercise
from app.exercises.biceps_curl import BicepsCurlExercise
from app.exercises.shoulder_press import ShoulderPressExercise
from app.exercises.lunge import LungeExercise
from app.exercises.bent_over_row import BentOverRowExercise
from app.exercises.rdl import RDLExercise
from app.exercises.diamond_pushup import DiamondPushupExercise
from app.exercises.plank import PlankExercise

EXERCISE_REGISTRY: Dict[str, Type[BaseExercise]] = {
    "squat": SquatExercise,
    "pushup": PushupExercise,
    "biceps_curl": BicepsCurlExercise,
    "shoulder_press": ShoulderPressExercise,
    "lunge": LungeExercise,
    "bent_over_row": BentOverRowExercise,
    "rdl": RDLExercise,
    "diamond_pushup": DiamondPushupExercise,
    "plank": PlankExercise,
}

SEED_EXERCISES = [
    {
        "slug": "squat",
        "name": "Bodyweight Squat",
        "category": "Lower Body",
        "difficulty": "Beginner",
        "primary_muscles": "Quadriceps, Gluteus Maximus, Hamstrings",
        "description": "The foundational compound movement for lower body force production and hip-knee-ankle kinematic mobility.",
        "instructions": [
            "Position feet shoulder-width apart, toes turned slightly outward 15-30 degrees.",
            "Initiate descending phase by simultaneously hinging hips and flexing knees.",
            "Drive knees out track inline with your toes, maintaining lumbar spine neutral.",
            "Descend until femoral crease breaks parallel with top of patella (90-95°).",
            "Drive through entire foot tripod to return to standing lockout."
        ],
        "key_metrics": ["Knee Angle", "Hip Depth", "Torso Angle", "Valgus Alignment"],
        "camera_view": "Front or 45-degree side angle (full body visible)"
    },
    {
        "slug": "pushup",
        "name": "Push-Up",
        "category": "Upper Body Push",
        "difficulty": "Beginner",
        "primary_muscles": "Pectoralis Major, Anterior Deltoids, Triceps Brachii, Core",
        "description": "A closed-kinetic-chain horizontal press establishing scapular rhythm, shoulder stability, and anterior core integrity.",
        "instructions": [
            "Set hands slightly wider than shoulder-width, fingers spread firmly on floor.",
            "Lock rigid plank with glutes squeezed and ribcage pulled down to pelvis.",
            "Lower torso under control until chest reaches approximately 3 inches off floor (90° elbow bend).",
            "Keep elbows tucked at a 45-degree arrow angle relative to ribcage.",
            "Press firmly through palms to full lockout without sagging or piking hips."
        ],
        "key_metrics": ["Elbow Angle", "Plank Body Alignment", "Elbow Tuck", "Lockout ROM"],
        "camera_view": "Side lateral view (head to toe visible)"
    },
    {
        "slug": "diamond_pushup",
        "name": "Diamond Push-Up",
        "category": "Upper Body Push",
        "difficulty": "Intermediate",
        "primary_muscles": "Triceps Brachii, Inner Pectoralis, Anterior Deltoid",
        "description": "Close-grip horizontal press placing mechanical disadvantage on triceps and sternal chest fibers while demanding strict core rigidity.",
        "instructions": [
            "Place hands close beneath chest with thumbs and index fingers forming a diamond shape.",
            "Lock a rigid, unyielding plank from heels to crown.",
            "Descend under control until chest grazes hand diamond (90° elbow flexion).",
            "Keep elbows tracking backward along your ribcage.",
            "Press through palms to full tricep lockout."
        ],
        "key_metrics": ["Elbow Flexion", "Plank Line", "Triceps Lockout", "Tempo"],
        "camera_view": "Side lateral or 45-degree angle"
    },
    {
        "slug": "bent_over_row",
        "name": "Bent-Over Row",
        "category": "Upper Body Pull",
        "difficulty": "Intermediate",
        "primary_muscles": "Latissimus Dorsi, Rhomboids, Trapezius, Biceps",
        "description": "Foundational horizontal pulling pattern developing scapular retraction, lat thickness, and isometric lumbar endurance.",
        "instructions": [
            "Hinge at hips to a 45-degree torso angle with flat spine and soft knees.",
            "Let arms hang vertically beneath shoulders holding weights or resistance.",
            "Initiate pull by driving elbows up and back toward hips.",
            "Squeeze shoulder blades tightly at top without standing up or jerking torso.",
            "Lower under eccentric control to full arm hang."
        ],
        "key_metrics": ["Elbow Retraction", "Hip Hinge Angle", "Bilateral Symmetry", "Torso Stability"],
        "camera_view": "Side lateral view (head to hip visible)"
    },
    {
        "slug": "rdl",
        "name": "Romanian Deadlift",
        "category": "Lower Body Posterior",
        "difficulty": "Intermediate",
        "primary_muscles": "Hamstrings, Gluteus Maximus, Erector Spinae",
        "description": "Strict hip-hinge pattern overloading the posterior chain through deep eccentric hamstring stretch while preserving lumbar neutrality.",
        "instructions": [
            "Stand upright with feet hip-width apart and soft, unlocked knees.",
            "Push hips straight back as if touching a wall behind you, hinging torso forward.",
            "Keep weights/hands skimming down shins while maintaining a flat, proud chest.",
            "Descend until deep hamstring tension is achieved (hip angle ~85-95°).",
            "Drive hips forward through glutes to lock out standing tall."
        ],
        "key_metrics": ["Hip Hinge Angle", "Knee Softness", "Spine Neutrality", "Concentric Power"],
        "camera_view": "Side lateral view (head to feet visible)"
    },
    {
        "slug": "plank",
        "name": "Isometric Plank",
        "category": "Core & Stability",
        "difficulty": "Beginner",
        "primary_muscles": "Rectus Abdominis, Transverse Abdominis, Obliques, Glutes",
        "description": "Gold standard isometric anti-extension core stability exercise evaluating full-body kinetic straightness.",
        "instructions": [
            "Plant forearms on floor with elbows directly stacked under shoulders.",
            "Extend legs straight back onto toes, squeezing glutes and quads tight.",
            "Create a laser-straight alignment from ankles through hips to shoulders (170-180°).",
            "Breathe diaphragmatically without allowing pelvis to drop or arch upward.",
            "Hold position strictly until designated time target."
        ],
        "key_metrics": ["Body Line Angle", "Hold Time (s)", "Hip Sag", "Hip Pike"],
        "camera_view": "Side lateral view (full profile visible)"
    },
    {
        "slug": "biceps_curl",
        "name": "Biceps Curl",
        "category": "Upper Body Pull",
        "difficulty": "Beginner",
        "primary_muscles": "Biceps Brachii, Brachialis, Brachioradialis",
        "description": "Strict isolation elbow flexion testing strict anti-momentum positioning and full concentric/eccentric tension.",
        "instructions": [
            "Stand tall with feet hip-width apart and shoulder blades retracted.",
            "Pin elbows securely against ribcage; do not allow elbows to drift forward.",
            "Curl weights upward while suppressing torso backward sway or momentum.",
            "Achieve peak contraction at top (45° elbow angle) and squeeze biceps.",
            "Lower slowly with a 3-second eccentric deceleration to full extension."
        ],
        "key_metrics": ["Elbow Angle", "Torso Sway", "Elbow Drift", "Concentric Squeeze"],
        "camera_view": "Front or 45-degree side angle"
    },
    {
        "slug": "shoulder_press",
        "name": "Shoulder Press",
        "category": "Upper Body Push",
        "difficulty": "Intermediate",
        "primary_muscles": "Anterior Deltoids, Lateral Deltoids, Triceps, Upper Trapezius",
        "description": "Overhead vertical pressing demanding scapular upward rotation, full elbow lockout, and anti-extension lumbar stability.",
        "instructions": [
            "Start with hands/weights at collarbone height, forearms vertical.",
            "Brace core firmly and squeeze glutes to prevent lumbar arching.",
            "Press overhead in a vertical trajectory until elbows reach full lockout (165°+).",
            "Bring head slightly through the window created by your biceps at the top.",
            "Lower under control back to clavicle shelf."
        ],
        "key_metrics": ["Elbow Lockout", "Lumbar Spine Arch", "Vertical Path", "Symmetry"],
        "camera_view": "Front view (waist to overhead visible)"
    },
    {
        "slug": "lunge",
        "name": "Forward Lunge",
        "category": "Lower Body Unilateral",
        "difficulty": "Intermediate",
        "primary_muscles": "Quadriceps, Glutes, Hamstrings, Adductors",
        "description": "Unilateral lower-body locomotion pattern developing pelvis leveling, decelerative strength, and knee tracking.",
        "instructions": [
            "Step forward into a comfortable split stance with feet on parallel train tracks.",
            "Descend vertically until front knee achieves 90 degrees and back knee grazes floor.",
            "Keep torso tall and proud without folding chest over front thigh.",
            "Maintain front knee tracking directly over second toe without collapsing inward.",
            "Push decisively off front heel to return cleanly to standing stance."
        ],
        "key_metrics": ["Lead Knee Angle", "Torso Angle", "Knee Overshoot", "Pelvic Tilt"],
        "camera_view": "Side lateral or 45-degree front angle"
    }
]

def create_exercise_analyzer(slug: str) -> BaseExercise:
    exercise_cls = EXERCISE_REGISTRY.get(slug.lower())
    if not exercise_cls:
        raise ValueError(f"Unknown exercise slug: {slug}. Available: {list(EXERCISE_REGISTRY.keys())}")
    return exercise_cls()
