import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Play, CheckCircle2, AlertTriangle, ShieldCheck, Dumbbell, Compass, Flame, ArrowRight, Target, Clock, Activity } from 'lucide-react';

interface ExerciseLibraryPageProps {
  onSelectExercise: (slug: string) => void;
  onNavigate: (tab: string) => void;
}

export const ExerciseLibraryPage: React.FC<ExerciseLibraryPageProps> = ({
  onSelectExercise,
  onNavigate,
}) => {
  const [activeSlug, setActiveSlug] = useState<string>('pushup');
  const [filterCategory, setFilterCategory] = useState<string>('ALL');

  const exercises = [
    {
      slug: 'pushup',
      name: 'Push-Up',
      category: 'CHEST',
      difficulty: 'Beginner',
      targetSets: '3 Sets',
      targetReps: '12 - 15 Reps',
      targetRepsCount: 12,
      restInterval: '45s Recovery',
      tempo: '2s Lower / 1s Lockout',
      primaryMuscles: 'Pectoralis Major, Anterior Deltoids, Triceps Brachii, Core',
      description: 'A closed-kinetic-chain horizontal press establishing scapular rhythm, shoulder stability, and anterior core integrity.',
      targetAngle: 'Elbow Flexion: 90° at bottom / 175° full lockout',
      cameraSetup: 'Side lateral view (head to toe visible)',
      instructions: [
        'Set hands slightly wider than shoulder-width, fingers spread firmly on floor.',
        'Lock rigid plank with glutes squeezed and ribcage pulled down to pelvis.',
        'Lower torso under control until chest reaches 3 inches off floor (90° elbow bend).',
        'Keep elbows tucked at a 45-degree arrow angle relative to ribcage.',
        'Press firmly through palms to full lockout without sagging or piking hips.'
      ],
      faults: [
        { fault: 'Hip Sag', fix: 'Engage glutes and brace rectus abdominis into straight plank.' },
        { fault: 'Hips Elevated / Pike', fix: 'Lower pelvis into direct line between shoulder and ankles.' },
        { fault: 'Partial Rep', fix: 'Lower chest to full depth before pressing to full lockout.' },
      ],
    },
    {
      slug: 'diamond_pushup',
      name: 'Diamond Push-Up',
      category: 'CHEST',
      difficulty: 'Intermediate',
      targetSets: '3 Sets',
      targetReps: '8 - 10 Reps',
      targetRepsCount: 8,
      restInterval: '45s Recovery',
      tempo: '2s Lower / 1s Squeeze',
      primaryMuscles: 'Triceps Brachii, Sternal Pectoralis, Anterior Deltoid',
      description: 'Close-grip horizontal press placing mechanical disadvantage on triceps and sternal chest fibers while demanding core rigidity.',
      targetAngle: 'Elbow Flexion: 90° at bottom / 165° Triceps Lockout',
      cameraSetup: 'Side lateral or 45-degree angle',
      instructions: [
        'Place hands close together under center of chest with thumbs and index fingers forming a diamond.',
        'Lock rigid plank from heels to crown with glutes braced.',
        'Lower chest smoothly toward your hands until elbows reach 90 degrees.',
        'Keep elbows tracking backward along your ribcage rather than flaring out.',
        'Press firmly through palms to full arm extension and triceps peak contraction.'
      ],
      faults: [
        { fault: 'Elbow Flare', fix: 'Keep elbows tucked back along your ribs.' },
        { fault: 'Hip Sag', fix: 'Squeeze glutes and raise pelvis to maintain a straight plank line.' },
        { fault: 'Partial Lockout', fix: 'Fully extend arms at the apex to engage triceps heads.' },
      ],
    },
    {
      slug: 'bent_over_row',
      name: 'Bent-Over Row',
      category: 'BACK',
      difficulty: 'Intermediate',
      targetSets: '3 Sets',
      targetReps: '10 - 12 Reps',
      targetRepsCount: 10,
      restInterval: '45s Recovery',
      tempo: '1s Pull / 2s Controlled Descent',
      primaryMuscles: 'Latissimus Dorsi, Rhomboids, Middle Trapezius, Biceps',
      description: 'Foundational horizontal pulling pattern developing scapular retraction, lat thickness, and isometric lumbar endurance.',
      targetAngle: 'Torso Hip Hinge: 45° from vertical / Elbow Pull: ~70°',
      cameraSetup: 'Side lateral view (head to hip visible)',
      instructions: [
        'Hinge at hips to a 45-degree torso angle with flat spine and soft knees.',
        'Let arms hang vertically beneath shoulders holding weights or resistance.',
        'Initiate pull by driving elbows up and back toward hips.',
        'Squeeze shoulder blades tightly at top without standing up or jerking torso.',
        'Lower under eccentric control to full arm hang.'
      ],
      faults: [
        { fault: 'Torso Too Upright', fix: 'Hinge deeper at hips; do not stand up during concentric pull.' },
        { fault: 'Asymmetric Elbow Pull', fix: 'Drive both elbows back with equal bilateral balance.' },
        { fault: 'Torso Momentum', fix: 'Maintain static spine angle; eliminate torso swinging.' },
      ],
    },
    {
      slug: 'rdl',
      name: 'Romanian Deadlift (RDL)',
      category: 'BACK',
      difficulty: 'Intermediate',
      targetSets: '3 Sets',
      targetReps: '10 - 12 Reps',
      targetRepsCount: 10,
      restInterval: '60s Recovery',
      tempo: '3s Eccentric Hinge / 1s Lockout',
      primaryMuscles: 'Hamstrings, Gluteus Maximus, Erector Spinae',
      description: 'Strict hip-hinge pattern overloading the posterior chain through deep eccentric hamstring stretch while preserving lumbar neutrality.',
      targetAngle: 'Hip Hinge: 85° - 95° / Knee Soft Bend: 160° - 170°',
      cameraSetup: 'Side lateral view (full profile in frame)',
      instructions: [
        'Stand upright with feet hip-width apart and soft, unlocked knees.',
        'Push hips straight back as if touching a wall behind you, hinging torso forward.',
        'Keep weights/hands skimming down shins while maintaining a flat, proud chest.',
        'Descend until deep hamstring tension is achieved (hip angle ~85-95°).',
        'Drive hips forward through glutes to lock out standing tall.'
      ],
      faults: [
        { fault: 'Squatting Pattern', fix: 'Push hips backward; do not bend knees into a squat.' },
        { fault: 'Spine Flexion Rounding', fix: 'Keep lats packed and sternum proud; avoid curving upper back.' },
        { fault: 'Stiff Knee Lockout', fix: 'Maintain slight soft knee flex to protect joint ligaments.' },
      ],
    },
    {
      slug: 'plank',
      name: 'Isometric Plank',
      category: 'CORE',
      difficulty: 'Beginner',
      targetSets: '3 Sets',
      targetReps: '45s Strict Hold',
      targetRepsCount: 45,
      restInterval: '30s Recovery',
      tempo: 'Continuous Isometric Tension',
      primaryMuscles: 'Rectus Abdominis, Transverse Abdominis, Obliques, Glutes',
      description: 'Gold standard isometric anti-extension core stability exercise evaluating full-body kinetic straightness.',
      targetAngle: 'Shoulder-Hip-Ankle: 170° - 180° straight line',
      cameraSetup: 'Side lateral view (full body visible)',
      instructions: [
        'Plant forearms on floor with elbows directly stacked under shoulders.',
        'Extend legs straight back onto toes, squeezing glutes and quads tight.',
        'Create a laser-straight alignment from ankles through hips to shoulders (170-180°).',
        'Breathe diaphragmatically without allowing pelvis to drop or arch upward.',
        'Hold position strictly until designated time target.'
      ],
      faults: [
        { fault: 'Hip Sag', fix: 'Engage glutes and brace abdominal wall upward.' },
        { fault: 'Hips Piking Upward', fix: 'Drop pelvis down into neutral line with shoulders.' },
        { fault: 'Head Drop', fix: 'Keep neck neutral, gazing at floor 6 inches ahead of hands.' },
      ],
    },
    {
      slug: 'squat',
      name: 'Bodyweight Squat',
      category: 'LEGS',
      difficulty: 'Beginner',
      targetSets: '3 Sets',
      targetReps: '10 - 12 Reps',
      targetRepsCount: 10,
      restInterval: '45s Recovery',
      tempo: '2s Descent / 1s Drive',
      primaryMuscles: 'Quadriceps, Gluteus Maximus, Hamstrings, Core',
      description: 'The foundational compound movement for lower body force production and hip-knee-ankle kinematic mobility.',
      targetAngle: 'Knee Flexion: 90° - 95° at parallel depth',
      cameraSetup: 'Front or 45-degree angle (full body visible)',
      instructions: [
        'Position feet shoulder-width apart, toes turned slightly outward 15-30 degrees.',
        'Initiate descending phase by simultaneously hinging hips and flexing knees.',
        'Drive knees out tracking inline with your toes, maintaining neutral spine.',
        'Descend until femoral crease breaks parallel with top of patella (90-95°).',
        'Drive through entire foot tripod to return to upright standing lockout.'
      ],
      faults: [
        { fault: 'Too Shallow', fix: 'Break parallel crease; achieve 90° knee angle at bottom.' },
        { fault: 'Knee Valgus (Cave)', fix: 'Consciously track knees outward over middle toes.' },
        { fault: 'Excessive Torso Lean', fix: 'Brace core and keep sternum lifted upward throughout.' },
      ],
    },
    {
      slug: 'lunge',
      name: 'Forward Lunge',
      category: 'LEGS',
      difficulty: 'Intermediate',
      targetSets: '3 Sets',
      targetReps: '10 Reps / Leg',
      targetRepsCount: 10,
      restInterval: '45s Recovery',
      tempo: '2s Descent / 1s Return',
      primaryMuscles: 'Quadriceps, Gluteus Medius, Hamstrings, Adductors',
      description: 'Unilateral lower-body locomotion pattern developing pelvis leveling, decelerative strength, and knee tracking.',
      targetAngle: 'Front Knee: 90° / Rear Knee: 90°',
      cameraSetup: 'Side lateral or 45-degree angle',
      instructions: [
        'Step forward into split stance with feet tracking along parallel tracks.',
        'Lower vertically until front knee achieves 90 degrees and rear knee grazes floor.',
        'Keep torso upright without folding over front thigh.',
        'Ensure lead knee tracks over middle toes without excessive overshoot.',
        'Drive off front heel to return cleanly to standing position.'
      ],
      faults: [
        { fault: 'Lead Knee Overshoot', fix: 'Step slightly further forward; sit down rather than forward.' },
        { fault: 'Pelvic Instability', fix: 'Brace gluteus medius to keep hips level.' },
        { fault: 'Forward Lean', fix: 'Maintain proud posture with shoulders stacked over hips.' },
      ],
    },
    {
      slug: 'biceps_curl',
      name: 'Biceps Curl',
      category: 'ARMS',
      difficulty: 'Beginner',
      targetSets: '3 Sets',
      targetReps: '10 - 12 Reps',
      targetRepsCount: 12,
      restInterval: '45s Recovery',
      tempo: '1s Curl / 3s Eccentric Lowering',
      primaryMuscles: 'Biceps Brachii, Brachialis, Brachioradialis',
      description: 'Strict isolation elbow flexion testing strict anti-momentum positioning and full concentric/eccentric tension.',
      targetAngle: 'Peak Flexion: 45° / Extension: 155°',
      cameraSetup: 'Front or 45-degree angle',
      instructions: [
        'Stand tall with feet hip-width apart and shoulder blades retracted.',
        'Pin elbows securely against ribcage; do not allow elbows to drift forward.',
        'Curl weights upward while suppressing torso backward sway or momentum.',
        'Achieve peak contraction at top (45° elbow angle) and squeeze biceps.',
        'Lower slowly with a 3-second eccentric deceleration to full extension.'
      ],
      faults: [
        { fault: 'Torso Sway Momentum', fix: 'Keep spine locked upright; eliminate momentum rocking.' },
        { fault: 'Elbow Drift Flare', fix: 'Pin elbows to ribcage throughout entire movement.' },
        { fault: 'Fast Free-Fall Lowering', fix: 'Control 3-second eccentric deceleration down.' },
      ],
    },
    {
      slug: 'shoulder_press',
      name: 'Shoulder Press',
      category: 'ARMS',
      difficulty: 'Intermediate',
      targetSets: '3 Sets',
      targetReps: '10 - 12 Reps',
      targetRepsCount: 10,
      restInterval: '60s Recovery',
      tempo: '1s Overhead Press / 2s Descent',
      primaryMuscles: 'Anterior Deltoids, Lateral Deltoids, Triceps, Upper Trapezius',
      description: 'Overhead vertical pressing demanding scapular upward rotation, full elbow lockout, and anti-extension lumbar stability.',
      targetAngle: 'Overhead Lockout: 165°+ elbow extension',
      cameraSetup: 'Front view (waist to overhead visible)',
      instructions: [
        'Start with hands at collarbone height, forearms vertical.',
        'Brace core firmly and squeeze glutes to prevent lumbar arching.',
        'Press overhead in vertical trajectory until elbows reach full lockout (165°+).',
        'Bring head slightly through window created by your biceps at top.',
        'Lower under control back to clavicle shelf.'
      ],
      faults: [
        { fault: 'Incomplete Lockout', fix: 'Press fully to vertical arm extension overhead.' },
        { fault: 'Lumbar Hyperextension', fix: 'Squeeze glutes and pull ribs down to pelvic rim.' },
        { fault: 'Uneven Bilateral Drive', fix: 'Press both sides with synchronized tempo.' },
      ],
    },
  ];

  const filteredList = filterCategory === 'ALL'
    ? exercises
    : exercises.filter(e => e.category === filterCategory);

  const active = exercises.find((e) => e.slug === activeSlug) || exercises[0];

  return (
    <div className="p-6 sm:p-8 lg:p-12 max-w-7xl mx-auto space-y-10">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-6 border-b border-[#181818]">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="w-2 h-2 rounded-full bg-[#C8FF3D]" />
            <span className="text-xs font-semibold uppercase tracking-wider text-[#C8FF3D]">
              Biomechanical Standards
            </span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-display font-bold text-white tracking-tight">
            Exercise Kinematics Library
          </h1>
          <p className="text-zinc-300 text-sm mt-1 max-w-2xl leading-relaxed">
            Anatomical reference guidelines, joint angles, common kinematic faults, and optical camera placement rules.
          </p>
        </div>

        {/* Filter Categories */}
        <div className="flex flex-wrap items-center gap-1.5 p-1.5 rounded-xl bg-[#111111] border border-[#222222]">
          {['ALL', 'CHEST', 'BACK', 'LEGS', 'ARMS', 'CORE'].map((cat) => (
            <button
              key={cat}
              onClick={() => setFilterCategory(cat)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-medium tracking-wide transition-all cursor-pointer ${
                filterCategory === cat
                  ? 'bg-[#181818] text-[#C8FF3D] font-semibold border border-[#C8FF3D]/40 shadow-sm'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Exercise Selector Cards */}
        <div className="lg:col-span-5 space-y-3">
          <div className="text-xs font-semibold uppercase text-zinc-400 tracking-wider mb-2">
            Select Movement ({filteredList.length})
          </div>

          <div className="space-y-2.5 max-h-[750px] overflow-y-auto pr-2">
            {filteredList.map((ex) => {
              const isSelected = ex.slug === active.slug;
              return (
                <div
                  key={ex.slug}
                  onClick={() => setActiveSlug(ex.slug)}
                  className={`p-4 rounded-xl border transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-[#181818] border-[#C8FF3D] shadow-md'
                      : 'bg-[#111111] border-[#1e1e1e] hover:border-[#333333]'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-[#C8FF3D] bg-[#141414] px-2.5 py-0.5 rounded-lg border border-[#282828]">
                      {ex.category}
                    </span>
                    <span className="text-xs font-medium text-zinc-400">{ex.difficulty}</span>
                  </div>

                  <h3 className="text-base font-display font-bold text-white mt-2 tracking-tight">
                    {ex.name}
                  </h3>
                  <p className="text-xs text-zinc-400 mt-0.5">{ex.primaryMuscles}</p>

                  <div className="flex items-center gap-2 mt-2.5 text-[11px] font-mono">
                    <span className="px-2 py-0.5 rounded bg-[#181818] border border-[#2a2a2a] text-[#C8FF3D] font-semibold">
                      {ex.targetSets} × {ex.targetReps}
                    </span>
                    <span className="text-zinc-600">•</span>
                    <span className="text-zinc-400">{ex.restInterval}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Column: Detailed Biomechanical Standard Card */}
        <div className="lg:col-span-7 bg-[#111111] border border-[#1e1e1e] rounded-2xl p-6 sm:p-8 space-y-8 shadow-xl">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-[#181818]">
            <div>
              <span className="text-xs font-semibold uppercase tracking-wider text-[#C8FF3D] block mb-1">
                {active.category} • {active.difficulty}
              </span>
              <h2 className="text-2xl sm:text-3xl font-display font-bold text-white tracking-tight">
                {active.name}
              </h2>
              <p className="text-xs font-medium text-zinc-400 mt-1">{active.primaryMuscles}</p>
            </div>

            <button
              onClick={() => {
                onSelectExercise(active.slug);
                onNavigate('live');
              }}
              className="inline-flex items-center gap-2 bg-[#C8FF3D] hover:bg-[#bbf030] text-black font-semibold text-xs px-6 py-3 rounded-xl transition-all shadow-md active:scale-95 cursor-pointer shrink-0"
            >
              <Play className="w-4 h-4 fill-black" />
              <span>Train This Exercise</span>
            </button>
          </div>

          <p className="text-sm text-zinc-300 leading-relaxed">
            {active.description}
          </p>

          {/* Target Prescription & Training Volume */}
          <div className="p-4 sm:p-5 rounded-xl bg-[#141414] border border-[#242424] space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-[#C8FF3D] flex items-center gap-2">
                <Target className="w-4 h-4 text-[#C8FF3D]" />
                Target Prescription & Set Volume
              </span>
              <span className="text-[11px] font-mono text-zinc-400 uppercase tracking-wider">Recommended Protocol</span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-1">
              <div className="p-3 rounded-xl bg-[#181818] border border-[#222222]">
                <span className="text-[10px] uppercase font-semibold text-zinc-400 block tracking-wider">Target Reps</span>
                <span className="text-sm font-bold font-mono text-white mt-1 block">{active.targetReps}</span>
              </div>
              <div className="p-3 rounded-xl bg-[#181818] border border-[#222222]">
                <span className="text-[10px] uppercase font-semibold text-zinc-400 block tracking-wider">Working Sets</span>
                <span className="text-sm font-bold font-mono text-[#C8FF3D] mt-1 block">{active.targetSets}</span>
              </div>
              <div className="p-3 rounded-xl bg-[#181818] border border-[#222222]">
                <span className="text-[10px] uppercase font-semibold text-zinc-400 block tracking-wider">Rest Period</span>
                <span className="text-sm font-bold font-mono text-white mt-1 block">{active.restInterval}</span>
              </div>
              <div className="p-3 rounded-xl bg-[#181818] border border-[#222222]">
                <span className="text-[10px] uppercase font-semibold text-zinc-400 block tracking-wider">Cadence / Tempo</span>
                <span className="text-sm font-bold font-mono text-white mt-1 block">{active.tempo}</span>
              </div>
            </div>
          </div>

          {/* Target Angles & Camera Setup */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="p-4 rounded-xl bg-[#141414] border border-[#222222]">
              <span className="text-xs font-medium text-zinc-400 uppercase tracking-wider block">Target Joint Kinematics</span>
              <p className="text-sm font-semibold text-white mt-1">{active.targetAngle}</p>
            </div>

            <div className="p-4 rounded-xl bg-[#141414] border border-[#222222]">
              <span className="text-xs font-medium text-zinc-400 uppercase tracking-wider block">Optical Camera Setup</span>
              <p className="text-xs text-zinc-300 mt-1">{active.cameraSetup}</p>
            </div>
          </div>

          {/* Kinematic Execution Checklist */}
          <div className="space-y-3">
            <h4 className="text-sm font-semibold text-white flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-[#7CFF6B]" />
              <span>Execution Checklist & Repetition Criteria</span>
            </h4>
            <div className="space-y-2">
              {active.instructions.map((step, idx) => (
                <div key={idx} className="flex items-start gap-3 p-3.5 rounded-xl bg-[#141414] border border-[#202020] text-xs">
                  <span className="w-6 h-6 rounded-full bg-[#1c1c1c] text-[#C8FF3D] font-bold text-xs flex items-center justify-center shrink-0 mt-0.5">
                    {idx + 1}
                  </span>
                  <span className="text-zinc-300 leading-relaxed pt-0.5">{step}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Common Faults & Corrective Cues */}
          <div className="space-y-3">
            <h4 className="text-sm font-semibold text-white flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-[#FFB84D]" />
              <span>Detected Faults & Actionable Cues</span>
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {active.faults.map((f, idx) => (
                <div key={idx} className="p-4 rounded-xl bg-[#181414] border border-[#331c1c] space-y-1.5">
                  <span className="text-xs font-semibold text-[#FF5C5C] block">
                    {f.fault}
                  </span>
                  <p className="text-xs text-zinc-300 leading-relaxed font-sans">
                    {f.fix}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
