import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Play, 
  Dumbbell, 
  Shield, 
  Compass, 
  ChevronRight, 
  Activity, 
  Flame, 
  Layers, 
  Clock, 
  Sparkles, 
  Target, 
  CheckCircle2,
  Zap,
  ArrowRight
} from 'lucide-react';

interface WorkoutSelectionPageProps {
  onSelectExercise: (slug: string) => void;
  onNavigate: (tab: string) => void;
}

export const WorkoutSelectionPage: React.FC<WorkoutSelectionPageProps> = ({
  onSelectExercise,
  onNavigate,
}) => {
  // Mode: "SESSIONS" (Curated Multi-Exercise Routines) vs "EXERCISES" (Single Movements)
  const [viewMode, setViewMode] = useState<'SESSIONS' | 'EXERCISES'>('SESSIONS');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [selectedSessionModal, setSelectedSessionModal] = useState<any | null>(null);

  // 1. CURATED WORKOUT SESSIONS & SPLIT ROUTINES
  const workoutSessions = [
    {
      id: 'chest-push-matrix',
      title: 'CHEST & TRICEPS HYPERTROPHY',
      subtitle: 'Upper Body Push Split',
      duration: '22 MIN',
      difficulty: 'INTERMEDIATE',
      intensity: 'HIGH INTENSITY',
      muscleGroup: 'CHEST & PUSH',
      focus: 'Pectoralis Major, Sternal Head, Triceps Lockout, Scapular Control',
      description: 'Structured high-volume push workout combining foundational horizontal pressing, narrow mechanical triceps bias, and overhead stabilization.',
      exercises: [
        { slug: 'pushup', name: 'Push-Up', sets: '3 Sets', reps: '12-15 Reps', target: 'Chest & Core Rigidity' },
        { slug: 'diamond_pushup', name: 'Diamond Push-Up', sets: '3 Sets', reps: '10-12 Reps', target: 'Inner Chest & Triceps Squeeze' },
        { slug: 'shoulder_press', name: 'Overhead Shoulder Press', sets: '3 Sets', reps: '10-12 Reps', target: 'Vertical Deltoid Power' }
      ],
      tag: 'POPULAR'
    },
    {
      id: 'back-pull-power',
      title: 'BACK & POSTERIOR CHAIN POWER',
      subtitle: 'Pull Day & Scapular Matrix',
      duration: '25 MIN',
      difficulty: 'ADVANCED',
      intensity: 'MAX VELOCITY',
      muscleGroup: 'BACK & PULL',
      focus: 'Latissimus Dorsi, Rhomboids, Hamstrings, Biceps Brachii',
      description: 'Complete posterior chain development focusing on horizontal elbow retraction, strict anti-momentum curls, and deep hip-hinge hamstring tension.',
      exercises: [
        { slug: 'bent_over_row', name: 'Bent-Over Row', sets: '4 Sets', reps: '10-12 Reps', target: 'Lat Drive & Scapular Retraction' },
        { slug: 'rdl', name: 'Romanian Deadlift (RDL)', sets: '3 Sets', reps: '10 Reps', target: 'Hamstrings & Hip Hinge Integrity' },
        { slug: 'biceps_curl', name: 'Strict Biceps Curl', sets: '3 Sets', reps: '12 Reps', target: 'Zero-Momentum Arm Isolation' }
      ],
      tag: 'POSTERIOR CHAIN'
    },
    {
      id: 'lower-body-depth',
      title: 'LOWER BODY KINETIC DEPTH',
      subtitle: 'Quad, Glute & Pelvic Alignment',
      duration: '20 MIN',
      difficulty: 'INTERMEDIATE',
      intensity: 'HIGH DENSITY',
      muscleGroup: 'LEGS',
      focus: 'Quadriceps, Gluteus Medius, Adductors, Hamstring Elasticity',
      description: 'Compound leg builder enforcing sub-parallel femoral crease depth, bilateral symmetry, and decelerative knee tracking on single-leg lunges.',
      exercises: [
        { slug: 'squat', name: 'Bodyweight Squat', sets: '4 Sets', reps: '15 Reps', target: 'Sub-Parallel Crease Depth' },
        { slug: 'lunge', name: 'Forward Lunge', sets: '3 Sets', reps: '12 Reps / Leg', target: 'Unilateral Pelvic Stability' },
        { slug: 'rdl', name: 'Romanian Deadlift', sets: '3 Sets', reps: '12 Reps', target: 'Glute & Hamstring Lockout' }
      ],
      tag: 'LEGS & POWER'
    },
    {
      id: 'full-body-athletic',
      title: 'FULL-BODY ATHLETIC CONDITIONER',
      subtitle: 'Metabolic Olympic Circuit',
      duration: '28 MIN',
      difficulty: 'ADVANCED',
      intensity: 'AEROBIC + STRENGTH',
      muscleGroup: 'FULL BODY',
      focus: 'Full Kinetic Chain, Cardio Endurance, Joint Resilience',
      description: 'Dynamic athletic sequence linking lower body force production, horizontal pressing, and anti-extension core hold at 60 FPS sensor verification.',
      exercises: [
        { slug: 'squat', name: 'Bodyweight Squat', sets: '3 Sets', reps: '15 Reps', target: 'Explosive Tripod Drive' },
        { slug: 'pushup', name: 'Push-Up', sets: '3 Sets', reps: '12 Reps', target: 'Strict Plank Line' },
        { slug: 'bent_over_row', name: 'Bent-Over Row', sets: '3 Sets', reps: '12 Reps', target: 'Rhomboid Engagement' },
        { slug: 'plank', name: 'Isometric Plank', sets: '3 Sets', reps: '45s Hold', target: 'Linear Core Straightness' }
      ],
      tag: 'NTC ELITE'
    },
    {
      id: 'core-lumbar-stability',
      title: 'CORE & POSTURAL ALIGNMENT',
      subtitle: 'Anti-Extension & Spine Health',
      duration: '16 MIN',
      difficulty: 'BEGINNER',
      intensity: 'PRECISION',
      muscleGroup: 'CORE',
      focus: 'Transverse Abdominis, Lumbar Erectors, Scapular Depression',
      description: 'Zero-impact isometric stabilization session testing linear spine straightness, anti-sag plank holding, and neutral hip-hinge endurance.',
      exercises: [
        { slug: 'plank', name: 'Isometric Plank', sets: '4 Sets', reps: '60s Hold', target: 'Anti-Sag Abdominal Lock' },
        { slug: 'bent_over_row', name: 'Bent-Over Row', sets: '3 Sets', reps: '12 Reps', target: 'Thoracic Neutrality' },
        { slug: 'squat', name: 'Bodyweight Squat', sets: '2 Sets', reps: '15 Reps', target: 'Torso Upright Balance' }
      ],
      tag: 'STABILITY'
    }
  ];

  // 2. EXPANDED SINGLE EXERCISES ROSTER (9 MOVEMENTS)
  const exercises = [
    {
      slug: 'pushup',
      name: 'Push-Up',
      category: 'CHEST',
      difficulty: 'BEGINNER',
      primaryMuscles: 'Pectoralis Major, Deltoids, Triceps, Core',
      description: 'Strict horizontal press establishing scapular rhythm, shoulder stability, and anterior core integrity.',
      targetAngle: '90° Elbow Flexion / 175° Lockout',
      cameraSetup: 'Side lateral view (head to toe visible)',
      metrics: ['Plank Straightness', 'Elbow Flare Angle', 'Chest Depth', 'Hip Sag / Raise'],
    },
    {
      slug: 'diamond_pushup',
      name: 'Diamond Push-Up',
      category: 'CHEST',
      difficulty: 'INTERMEDIATE',
      primaryMuscles: 'Inner Pectoralis, Triceps Brachii, Anterior Deltoids',
      description: 'Close-grip horizontal press placing mechanical disadvantage on triceps and sternal chest fibers while demanding core rigidity.',
      targetAngle: '90° Elbow Flexion / 165° Triceps Lockout',
      cameraSetup: 'Side lateral or 45-degree angle',
      metrics: ['Elbow Flexion', 'Elbow Tuck', 'Plank Alignment', 'Triceps Squeeze'],
    },
    {
      slug: 'bent_over_row',
      name: 'Bent-Over Row',
      category: 'BACK',
      difficulty: 'INTERMEDIATE',
      primaryMuscles: 'Latissimus Dorsi, Rhomboids, Trapezius, Biceps',
      description: 'Foundational horizontal pulling pattern developing scapular retraction, lat thickness, and isometric lumbar endurance.',
      targetAngle: '45° Torso Hinge / 70° Elbow Pull',
      cameraSetup: 'Side lateral view (head to hip visible)',
      metrics: ['Elbow Retraction', 'Hip Hinge Angle', 'Bilateral Symmetry', 'Torso Jerk'],
    },
    {
      slug: 'rdl',
      name: 'Romanian Deadlift',
      category: 'BACK',
      difficulty: 'INTERMEDIATE',
      primaryMuscles: 'Hamstrings, Gluteus Maximus, Erector Spinae',
      description: 'Strict hip-hinge pattern overloading the posterior chain through deep eccentric hamstring stretch while preserving lumbar neutrality.',
      targetAngle: '85° - 95° Hip Hinge Depth',
      cameraSetup: 'Side lateral view (full profile in frame)',
      metrics: ['Hip Hinge Angle', 'Knee Softness', 'Spine Neutrality', 'Lockout'],
    },
    {
      slug: 'plank',
      name: 'Isometric Plank',
      category: 'CORE',
      difficulty: 'BEGINNER',
      primaryMuscles: 'Rectus Abdominis, Transverse Abdominis, Glutes',
      description: 'Gold standard isometric anti-extension core stability exercise evaluating full-body kinetic straightness.',
      targetAngle: '170° - 180° Linear Alignment',
      cameraSetup: 'Side lateral view (full body visible)',
      metrics: ['Body Line Angle', 'Hold Duration', 'Hip Sag', 'Hip Pike'],
    },
    {
      slug: 'squat',
      name: 'Bodyweight Squat',
      category: 'LEGS',
      difficulty: 'BEGINNER',
      primaryMuscles: 'Quadriceps, Glutes, Hamstrings',
      description: 'The foundational lower-body compound movement. Real-time patellar tracking, depth analysis, and anti-valgus coaching.',
      targetAngle: '90° - 95° Knee Flexion',
      cameraSetup: 'Front or 45-degree angle (full body in frame)',
      metrics: ['Depth Parallel', 'Knee Cave Valgus', 'Torso Lean Angle', 'Concentric Tempo'],
    },
    {
      slug: 'lunge',
      name: 'Forward Lunge',
      category: 'LEGS',
      difficulty: 'INTERMEDIATE',
      primaryMuscles: 'Quadriceps, Gluteus Medius, Adductors',
      description: 'Unilateral lower-body locomotion pattern developing pelvis leveling, decelerative strength, and knee tracking.',
      targetAngle: '90° Front Knee / 90° Rear Knee',
      cameraSetup: 'Side lateral or 45-degree angle',
      metrics: ['Lead Knee Overshoot', 'Pelvic Tilt Balance', 'Torso Uprightness', 'Cadence Rhythm'],
    },
    {
      slug: 'biceps_curl',
      name: 'Biceps Curl',
      category: 'ARMS',
      difficulty: 'BEGINNER',
      primaryMuscles: 'Biceps Brachii, Brachialis, Forearms',
      description: 'Strict isolation elbow flexion testing strict anti-momentum positioning and full concentric/eccentric tension.',
      targetAngle: '45° Peak Flexion / 155° Extension',
      cameraSetup: 'Front or 45-degree angle',
      metrics: ['Torso Sway Momentum', 'Elbow Drift Flare', 'Peak Squeeze', 'Deceleration Tempo'],
    },
    {
      slug: 'shoulder_press',
      name: 'Shoulder Press',
      category: 'ARMS',
      difficulty: 'INTERMEDIATE',
      primaryMuscles: 'Deltoids, Upper Trapezius, Triceps',
      description: 'Vertical pressing pattern demanding thoracic extension, scapular upward rotation, and core anti-extension stability.',
      targetAngle: '165°+ Overhead Lockout',
      cameraSetup: 'Front or 45-degree angle',
      metrics: ['Overhead Lockout', 'Lumbar Arch Tilt', 'Bilateral Symmetry', 'Bar Path Verticality'],
    },
  ];

  const filteredExercises = selectedCategory === 'ALL'
    ? exercises
    : exercises.filter(e => e.category === selectedCategory);

  const startSession = (firstSlug: string) => {
    onSelectExercise(firstSlug);
    setSelectedSessionModal(null);
    onNavigate('live');
  };

  return (
    <div className="p-6 sm:p-8 lg:p-12 max-w-7xl mx-auto space-y-10 relative">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-6 border-b border-[#181818]">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="w-2 h-2 rounded-full bg-[#C8FF3D]" />
            <span className="text-xs font-semibold uppercase tracking-wider text-[#C8FF3D]">
              Training Programs & Movements
            </span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-display font-bold text-white tracking-tight">
            Workout Selection & Split Routines
          </h1>
          <p className="text-zinc-300 text-sm mt-1 max-w-2xl leading-relaxed">
            Choose a curated muscle split routine (Chest, Back, Legs) or select an individual exercise for computer-vision coaching.
          </p>
        </div>

        {/* View Mode Switcher */}
        <div className="flex items-center gap-1.5 p-1.5 rounded-xl bg-[#111111] border border-[#222222] self-start md:self-auto">
          <button
            onClick={() => setViewMode('SESSIONS')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-xs font-semibold tracking-wide transition-all cursor-pointer ${
              viewMode === 'SESSIONS'
                ? 'bg-[#181818] text-[#C8FF3D] border border-[#C8FF3D]/40 shadow-sm'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            <Flame className="w-3.5 h-3.5 text-[#C8FF3D]" />
            <span>Workout Sessions & Splits</span>
          </button>

          <button
            onClick={() => setViewMode('EXERCISES')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-xs font-semibold tracking-wide transition-all cursor-pointer ${
              viewMode === 'EXERCISES'
                ? 'bg-[#181818] text-[#C8FF3D] border border-[#C8FF3D]/40 shadow-sm'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            <Dumbbell className="w-3.5 h-3.5 text-[#C8FF3D]" />
            <span>Single Movements ({exercises.length})</span>
          </button>
        </div>
      </div>

      {/* MODE 1: CURATED WORKOUT SESSIONS & SPLITS */}
      {viewMode === 'SESSIONS' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-zinc-400">
              Curated Split Programs ({workoutSessions.length} Routines)
            </span>
            <span className="text-xs font-medium text-zinc-400">Real-Time State Machine Tracked</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {workoutSessions.map((session, idx) => (
              <motion.div
                key={session.id}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: idx * 0.06 }}
                className="p-6 sm:p-7 rounded-2xl bg-[#111111] border border-[#1e1e1e] hover:border-[#C8FF3D]/40 transition-all flex flex-col justify-between group shadow-lg"
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <span className="text-xs font-semibold bg-[#C8FF3D]/10 text-[#C8FF3D] border border-[#C8FF3D]/30 px-2.5 py-0.5 rounded-full">
                      {session.tag}
                    </span>
                    <span className="text-xs font-medium text-zinc-300 flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-zinc-400" /> {session.duration}
                    </span>
                  </div>

                  <h3 className="text-xl font-display font-bold text-white group-hover:text-[#C8FF3D] transition-colors tracking-tight">
                    {session.title}
                  </h3>
                  <p className="text-xs font-semibold text-[#C8FF3D] mt-1">{session.subtitle}</p>

                  <p className="text-sm text-zinc-300 mt-3 leading-relaxed">
                    {session.description}
                  </p>

                  {/* Included Exercises Pill Stack */}
                  <div className="mt-5 pt-4 border-t border-[#181818] space-y-2">
                    <span className="text-xs font-semibold uppercase tracking-wider text-zinc-400 block">
                      Exercises Included ({session.exercises.length}):
                    </span>
                    <div className="space-y-1.5">
                      {session.exercises.map((ex) => (
                        <div key={ex.slug} className="flex items-center justify-between text-xs p-2.5 rounded-xl bg-[#141414] border border-[#222222]">
                          <span className="text-white font-medium flex items-center gap-2">
                            <span className="w-1.5 h-1.5 rounded-full bg-[#C8FF3D]" />
                            {ex.name}
                          </span>
                          <span className="text-xs font-medium text-zinc-400">{ex.sets} • {ex.reps}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="mt-6 pt-4 border-t border-[#181818] flex items-center justify-between gap-3">
                  <button
                    onClick={() => setSelectedSessionModal(session)}
                    className="text-xs font-medium text-zinc-400 hover:text-white transition-colors cursor-pointer"
                  >
                    View Details
                  </button>

                  <button
                    onClick={() => startSession(session.exercises[0].slug)}
                    className="inline-flex items-center gap-2 bg-[#C8FF3D] hover:bg-[#bbf030] text-black font-semibold text-xs px-4 py-2.5 rounded-xl transition-all shadow-md active:scale-95 cursor-pointer"
                  >
                    <Play className="w-3.5 h-3.5 fill-black" />
                    <span>Start Session</span>
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      )}

      {/* MODE 2: SINGLE MOVEMENTS ROSTER */}
      {viewMode === 'EXERCISES' && (
        <div className="space-y-6">
          {/* Filter Pills */}
          <div className="flex flex-wrap items-center gap-2 pb-2 border-b border-[#181818]">
            <span className="text-xs font-semibold text-zinc-400 uppercase tracking-wider mr-2">Filter By Muscle:</span>
            {['ALL', 'CHEST', 'BACK', 'LEGS', 'ARMS', 'CORE'].map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-medium tracking-wide transition-all cursor-pointer ${
                  selectedCategory === cat
                    ? 'bg-[#181818] text-[#C8FF3D] font-semibold border border-[#C8FF3D]/40 shadow-sm'
                    : 'text-zinc-400 bg-[#111111] hover:text-white hover:bg-[#181818]'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredExercises.map((ex, idx) => (
              <motion.div
                key={ex.slug}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: idx * 0.05 }}
                className="p-6 rounded-2xl bg-[#111111] border border-[#1e1e1e] hover:border-[#C8FF3D]/40 transition-all flex flex-col justify-between group shadow-lg"
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <span className="text-xs font-semibold bg-[#181818] text-[#C8FF3D] px-2.5 py-0.5 rounded-lg border border-[#282828]">
                      {ex.category}
                    </span>
                    <span className="text-xs font-medium text-zinc-400">{ex.difficulty}</span>
                  </div>

                  <h3 className="text-xl font-display font-bold text-white group-hover:text-[#C8FF3D] transition-colors tracking-tight">
                    {ex.name}
                  </h3>
                  <p className="text-xs text-zinc-400 mt-1">{ex.primaryMuscles}</p>

                  <p className="text-sm text-zinc-300 mt-3 leading-relaxed line-clamp-2">
                    {ex.description}
                  </p>

                  <div className="mt-4 pt-4 border-t border-[#181818] space-y-2">
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-zinc-400">Prescription:</span>
                      <span className="text-[#C8FF3D] font-mono font-semibold bg-[#181818] px-2 py-0.5 rounded border border-[#2a2a2a]">
                        3 Sets × 10-12 Reps • 45s Rest
                      </span>
                    </div>
                    <div className="flex justify-between text-xs">
                      <span className="text-zinc-400">Target Angle:</span>
                      <span className="text-white font-medium">{ex.targetAngle}</span>
                    </div>
                    <div className="flex justify-between text-xs">
                      <span className="text-zinc-400">Optical Camera:</span>
                      <span className="text-zinc-300 truncate max-w-[180px]">{ex.cameraSetup}</span>
                    </div>
                  </div>
                </div>

                <div className="mt-6 pt-4 border-t border-[#181818] flex items-center justify-between">
                  <button
                    onClick={() => {
                      onSelectExercise(ex.slug);
                      onNavigate('exercises');
                    }}
                    className="text-xs font-medium text-zinc-400 hover:text-white transition-colors cursor-pointer"
                  >
                    Movement Guide
                  </button>

                  <button
                    onClick={() => {
                      onSelectExercise(ex.slug);
                      onNavigate('live');
                    }}
                    className="inline-flex items-center gap-2 bg-[#C8FF3D] hover:bg-[#bbf030] text-black font-semibold text-xs px-4 py-2.5 rounded-xl transition-all shadow-md active:scale-95 cursor-pointer"
                  >
                    <Play className="w-3.5 h-3.5 fill-black" />
                    <span>Start Training</span>
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      )}

      {/* SESSION OVERVIEW MODAL */}
      <AnimatePresence>
        {selectedSessionModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/80 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              className="w-full max-w-xl bg-[#111111] border border-[#242424] rounded-2xl p-6 sm:p-8 shadow-2xl space-y-6"
            >
              <div className="flex items-center justify-between pb-4 border-b border-[#1c1c1c]">
                <div>
                  <span className="text-xs font-semibold uppercase text-[#C8FF3D] tracking-wider block mb-1">
                    Workout Session Specification
                  </span>
                  <h3 className="text-2xl font-display font-bold text-white tracking-tight">
                    {selectedSessionModal.title}
                  </h3>
                </div>
                <button
                  onClick={() => setSelectedSessionModal(null)}
                  className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-[#181818] transition-colors cursor-pointer"
                >
                  ✕
                </button>
              </div>

              <div className="space-y-4">
                <p className="text-sm text-zinc-300 leading-relaxed">
                  {selectedSessionModal.description}
                </p>

                <div className="grid grid-cols-3 gap-3 p-4 rounded-xl bg-[#141414] border border-[#222222]">
                  <div>
                    <span className="text-xs font-medium text-zinc-400 uppercase tracking-wider block">Duration</span>
                    <span className="text-sm font-semibold text-white mt-0.5 block">{selectedSessionModal.duration}</span>
                  </div>
                  <div>
                    <span className="text-xs font-medium text-zinc-400 uppercase tracking-wider block">Intensity</span>
                    <span className="text-sm font-semibold text-[#C8FF3D] mt-0.5 block">{selectedSessionModal.intensity}</span>
                  </div>
                  <div>
                    <span className="text-xs font-medium text-zinc-400 uppercase tracking-wider block">Level</span>
                    <span className="text-sm font-semibold text-white mt-0.5 block">{selectedSessionModal.difficulty}</span>
                  </div>
                </div>

                <div className="space-y-2">
                  <span className="text-xs font-semibold uppercase tracking-wider text-white block">
                    Session Exercise Sequence:
                  </span>
                  {selectedSessionModal.exercises.map((ex: any, i: number) => (
                    <div key={ex.slug} className="p-3.5 rounded-xl bg-[#161616] border border-[#262626] flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <span className="w-6 h-6 rounded-full bg-[#1e1e1e] border border-[#2a2a2a] text-xs font-bold text-[#C8FF3D] flex items-center justify-center">
                          {i + 1}
                        </span>
                        <div>
                          <p className="text-sm font-semibold text-white">{ex.name}</p>
                          <p className="text-xs text-zinc-400 mt-0.5">{ex.target}</p>
                        </div>
                      </div>
                      <span className="text-xs font-medium text-zinc-300 bg-[#1a1a1a] px-3 py-1 rounded-lg border border-[#222222]">
                        {ex.sets} • {ex.reps}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-[#1c1c1c]">
                <button
                  type="button"
                  onClick={() => setSelectedSessionModal(null)}
                  className="px-4 py-2.5 rounded-xl text-xs font-medium text-zinc-400 hover:text-white hover:bg-[#181818] transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={() => startSession(selectedSessionModal.exercises[0].slug)}
                  className="inline-flex items-center gap-2 bg-[#C8FF3D] hover:bg-[#bbf030] text-black font-semibold text-xs px-6 py-3 rounded-xl transition-all shadow-md active:scale-95 cursor-pointer"
                >
                  <Play className="w-4 h-4 fill-black" />
                  <span>Launch Session Live</span>
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
