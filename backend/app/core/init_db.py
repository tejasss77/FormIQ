from datetime import datetime, timedelta, timezone
from sqlalchemy.future import select
from app.core.database import Base, engine, AsyncSessionLocal
from app.models.user import User
from app.models.exercise import Exercise
from app.models.workout import Workout, WorkoutSet, Rep, FormAnalysis, WorkoutFeedback
from app.core.security import hash_password
from app.exercises.registry import SEED_EXERCISES

async def init_db():
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)

    async with AsyncSessionLocal() as session:
        # 1. Seed Exercises
        for ex_data in SEED_EXERCISES:
            result = await session.execute(select(Exercise).where(Exercise.slug == ex_data["slug"]))
            existing = result.scalar_one_or_none()
            if not existing:
                exercise = Exercise(
                    slug=ex_data["slug"],
                    name=ex_data["name"],
                    category=ex_data["category"],
                    difficulty=ex_data["difficulty"],
                    primary_muscles=ex_data["primary_muscles"],
                    description=ex_data["description"],
                    instructions=ex_data["instructions"],
                    key_metrics=ex_data["key_metrics"],
                    camera_view=ex_data["camera_view"]
                )
                session.add(exercise)

        # 2. Seed Default User
        user_res = await session.execute(select(User).where(User.email == "athlete@formiq.com"))
        user = user_res.scalar_one_or_none()
        if not user:
            user = User(
                email="athlete@formiq.com",
                hashed_password=hash_password("athlete123"),
                full_name="Marcus Vance",
                is_active=True
            )
            session.add(user)
            await session.flush()

        # Check if workouts exist for this user, if fewer than 10 refresh with full historical progression
        wk_check = await session.execute(select(Workout).where(Workout.user_id == user.id))
        existing_wks = wk_check.scalars().all()
        if len(existing_wks) < 10:
            for ew in existing_wks:
                await session.delete(ew)
            await session.flush()

            now = datetime.now(timezone.utc)
            past_workouts_data = [
                # Last 7 Days (7D)
                {"slug": "squat", "title": "Lower Body Power & Depth", "days_ago": 0, "duration": 1820, "reps": 48, "form_score": 91.5, "positives": ["Parallel squat depth hit on 94% of reps", "Consistent 2.3s eccentric control"], "improvements": ["Maintain thoracic uprightness in final set"]},
                {"slug": "pushup", "title": "Horizontal Press Alignment", "days_ago": 1, "duration": 1450, "reps": 42, "form_score": 89.0, "positives": ["Full elbow lockout at top", "Zero hip sag in sets 1-3"], "improvements": ["Avoid piking hips during final 4 reps"]},
                {"slug": "biceps_curl", "title": "Strict Tempo Biceps Isolation", "days_ago": 3, "duration": 1200, "reps": 45, "form_score": 92.5, "positives": ["Zero body momentum or swing", "Peak contraction squeeze held"], "improvements": ["Keep wrists neutral throughout"]},
                {"slug": "shoulder_press", "title": "Overhead Lockout & Thoracic Mobility", "days_ago": 5, "duration": 1650, "reps": 38, "form_score": 88.0, "positives": ["Complete vertical arm extension", "Ribcage stayed clamped"], "improvements": ["Ensure full return to clavicle shelf"]},
                
                # Past 30 Days (30D)
                {"slug": "lunge", "title": "Unilateral Lower Body Kinetic Chain", "days_ago": 8, "duration": 1950, "reps": 44, "form_score": 88.5, "positives": ["Decisive knee tracking inline with toes", "Level pelvic balance"], "improvements": ["Equalize eccentric tempo on left lead leg"]},
                {"slug": "bent_over_row", "title": "Posterior Chain Lat Engagements", "days_ago": 11, "duration": 1550, "reps": 40, "form_score": 88.0, "positives": ["Retracted scapulae at top of sweep", "Neutral spine held"], "improvements": ["Keep neck neutral with spine"]},
                {"slug": "rdl", "title": "Hamstring Eccentric Threshold", "days_ago": 14, "duration": 1720, "reps": 36, "form_score": 89.2, "positives": ["Deep posterior hinge without lumbar rounding", "Bar kept close"], "improvements": ["Drive hips through earlier"]},
                {"slug": "diamond_pushup", "title": "Triceps Apex Lockout Drive", "days_ago": 17, "duration": 1380, "reps": 35, "form_score": 87.0, "positives": ["Tight elbow tuck", "Rigid anterior core integrity"], "improvements": ["Control final descent"]},
                {"slug": "plank", "title": "Core Anti-Extension Stability", "days_ago": 20, "duration": 1200, "reps": 50, "form_score": 93.5, "positives": ["Zero pelvic tilt deviation", "Even scapular protraction"], "improvements": ["Maintain steady breathing"]},
                {"slug": "squat", "title": "Explosive Squat Drive", "days_ago": 23, "duration": 1800, "reps": 46, "form_score": 87.5, "positives": ["Deep femur crease angle", "Heels firmly planted"], "improvements": ["Watch slight right knee valgus"]},
                {"slug": "pushup", "title": "High-Volume Pushups", "days_ago": 26, "duration": 1500, "reps": 40, "form_score": 86.0, "positives": ["Good chest to floor depth", "Strong lockouts"], "improvements": ["Tighten glute squeeze"]},
                {"slug": "biceps_curl", "title": "Eccentric Accentuated Curls", "days_ago": 29, "duration": 1250, "reps": 42, "form_score": 88.5, "positives": ["Smooth 3-second descent", "No shoulder forward roll"], "improvements": ["Avoid hyper-extending elbows at bottom"]},

                # Past 90 Days (90D)
                {"slug": "shoulder_press", "title": "Vertical Press Accumulation", "days_ago": 35, "duration": 1600, "reps": 36, "form_score": 86.5, "positives": ["Clean bar path", "Core locked"], "improvements": ["Elbow flare on rep 10"]},
                {"slug": "lunge", "title": "Dynamic Split Squats", "days_ago": 41, "duration": 1850, "reps": 40, "form_score": 85.8, "positives": ["Deep stride depth", "Upright torso"], "improvements": ["Watch lead knee drift"]},
                {"slug": "bent_over_row", "title": "Strict Pendlay Row Pulls", "days_ago": 47, "duration": 1650, "reps": 38, "form_score": 85.0, "positives": ["Torso stayed at 45 degrees", "Explosive pull"], "improvements": ["Reduce slight hip jerk"]},
                {"slug": "rdl", "title": "Posterior Kinetic Loading", "days_ago": 53, "duration": 1700, "reps": 34, "form_score": 86.2, "positives": ["Excellent hamstring tension", "Flat back"], "improvements": ["Look 6 feet ahead, not straight down"]},
                {"slug": "squat", "title": "Paused Squat Calibration", "days_ago": 60, "duration": 1900, "reps": 42, "form_score": 85.0, "positives": ["Solid 1s pause in the hole", "Good foot tripod"], "improvements": ["Drive out of bottom faster"]},
                {"slug": "pushup", "title": "Tempo Deficit Pushups", "days_ago": 67, "duration": 1400, "reps": 36, "form_score": 84.5, "positives": ["Full range reached", "Solid plank line"], "improvements": ["Head position dipped slightly"]},
                {"slug": "diamond_pushup", "title": "Diamond Tricep Loading", "days_ago": 74, "duration": 1350, "reps": 32, "form_score": 83.5, "positives": ["Thumbs and index fingers touching", "Good lockout"], "improvements": ["Elbows flared on last 3 reps"]},
                {"slug": "plank", "title": "Isometric Core Hold Block", "days_ago": 81, "duration": 1150, "reps": 45, "form_score": 91.0, "positives": ["Rock solid bridge", "Glutes engaged"], "improvements": ["Avoid sinking shoulders"]},
                {"slug": "biceps_curl", "title": "Bilateral Dumbbell Curls", "days_ago": 87, "duration": 1200, "reps": 38, "form_score": 84.8, "positives": ["Good supination at top", "Tucked elbows"], "improvements": ["Slight torso swing"]},

                # All-Time (ALL)
                {"slug": "squat", "title": "Baseline Kinetic Squats", "days_ago": 105, "duration": 1750, "reps": 40, "form_score": 82.5, "positives": ["Good effort on depth", "Chest tall"], "improvements": ["Heel lift on left foot"]},
                {"slug": "pushup", "title": "Foundation Pushups", "days_ago": 125, "duration": 1450, "reps": 35, "form_score": 81.0, "positives": ["Consistent rep cadence", "Good lockout"], "improvements": ["Hip sag in late reps"]},
                {"slug": "shoulder_press", "title": "Strict Overhead Press", "days_ago": 150, "duration": 1550, "reps": 32, "form_score": 80.5, "positives": ["Good vertical reach", "No arching"], "improvements": ["Bring weights down to collarbone"]},
                {"slug": "bent_over_row", "title": "Introductory Row Mechanics", "days_ago": 180, "duration": 1500, "reps": 34, "form_score": 79.5, "positives": ["Good elbow pull", "Hands aligned"], "improvements": ["Hips raised too high"]},
                {"slug": "rdl", "title": "Hinge Pattern Learning", "days_ago": 215, "duration": 1600, "reps": 30, "form_score": 78.0, "positives": ["Soft knee bend kept steady"], "improvements": ["Excessive spinal flexion"]},
                {"slug": "lunge", "title": "Balance & Step Placement", "days_ago": 250, "duration": 1650, "reps": 32, "form_score": 77.2, "positives": ["Good stride length", "Balanced finish"], "improvements": ["Front knee caved inwards"]},
                {"slug": "squat", "title": "Initial Movement Assessment", "days_ago": 285, "duration": 1700, "reps": 35, "form_score": 75.0, "positives": ["Completed all prescription reps"], "improvements": ["Stiff ankles, shallow depth, forward lean"]}
            ]

            for w_data in past_workouts_data:
                w_time = now - timedelta(days=w_data["days_ago"])
                workout = Workout(
                    user_id=user.id,
                    title=w_data["title"],
                    exercise_slug=w_data["slug"],
                    duration_seconds=w_data["duration"],
                    total_reps=w_data["reps"],
                    overall_form_score=w_data["form_score"],
                    technique_score=round(min(100.0, w_data["form_score"] + 1.5), 1),
                    rom_score=round(max(50.0, w_data["form_score"] - 2.0), 1),
                    stability_score=round(min(100.0, w_data["form_score"] + 0.5), 1),
                    tempo_score=round(max(50.0, w_data["form_score"] - 1.0), 1),
                    status="completed",
                    summary_positives=w_data["positives"],
                    summary_improvements=w_data["improvements"],
                    ai_summary=f"High-quality session completing {w_data['reps']} reps with an average {w_data['form_score']} Form Score.",
                    started_at=w_time,
                    completed_at=w_time + timedelta(seconds=w_data["duration"])
                )
                session.add(workout)
                await session.flush()

                for s in range(1, 4):
                    wset = WorkoutSet(
                        workout_id=workout.id,
                        set_number=s,
                        reps_completed=w_data["reps"] // 3,
                        target_reps=w_data["reps"] // 3,
                        avg_form_score=w_data["form_score"]
                    )
                    session.add(wset)

        await session.commit()
