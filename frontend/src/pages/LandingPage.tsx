import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  ArrowRight, 
  Activity, 
  ShieldCheck, 
  Zap, 
  ChevronRight, 
  Play, 
  CheckCircle2, 
  BarChart3, 
  Layers, 
  Target,
  Sparkles
} from 'lucide-react';
import { Navbar } from '../components/layout/Navbar';
import { useAuth } from '../context/AuthContext';

interface LandingPageProps {
  onNavigate: (tab: string) => void;
  onSelectExercise: (slug: string) => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ onNavigate, onSelectExercise }) => {
  const { user } = useAuth();

  const handleStartSession = (destination: string = 'train', slug?: string) => {
    if (!user) {
      onNavigate('login');
      return;
    }
    if (slug) {
      onSelectExercise(slug);
    }
    onNavigate(destination);
  };

  // Interactive Hero Preview state machine
  const [heroRep, setHeroRep] = useState(12);
  const [heroKneeAngle, setHeroKneeAngle] = useState(88);
  const [heroPhase, setHeroPhase] = useState<'DESCENDING' | 'INFLECTION' | 'ASCENDING'>('INFLECTION');

  useEffect(() => {
    const interval = setInterval(() => {
      setHeroKneeAngle((prev) => {
        if (prev <= 82) {
          setHeroPhase('ASCENDING');
          return 94;
        } else if (prev >= 148) {
          setHeroPhase('DESCENDING');
          setHeroRep((r) => (r >= 20 ? 1 : r + 1));
          return 135;
        } else {
          return heroPhase === 'DESCENDING' ? prev - 12 : prev + 12;
        }
      });
    }, 400);
    return () => clearInterval(interval);
  }, [heroPhase]);

  const exercises = [
    {
      slug: 'squat',
      name: 'SQUAT',
      category: 'Compound Lower',
      target: 'Depth & Knee Alignment',
      rom: '95° Crease Parallel',
      desc: 'Real-time patellar tracking, femoral crease depth calculation, and anti-valgus coaching.',
    },
    {
      slug: 'pushup',
      name: 'PUSH-UP',
      category: 'Horizontal Press',
      target: 'Plank Integrity',
      rom: '90° Elbow Flexion',
      desc: 'Closed-chain scapular mechanics and anterior core anti-sag monitoring.',
    },
    {
      slug: 'biceps_curl',
      name: 'BICEPS CURL',
      category: 'Isolation Pull',
      target: 'Strict Anti-Momentum',
      rom: '145° Complete Sweep',
      desc: 'Zero torso sway tolerance and locked humerus elbow pivot tracking.',
    },
    {
      slug: 'shoulder_press',
      name: 'SHOULDER PRESS',
      category: 'Vertical Press',
      target: 'Overhead Lockout',
      rom: '175° Arm Extension',
      desc: 'Bilateral overhead clearance and lumbar hyperextension prevention.',
    },
    {
      slug: 'lunge',
      name: 'LUNGE',
      category: 'Unilateral Lower',
      target: 'Pelvic Balance',
      rom: '90° Lead Knee Flexion',
      desc: 'Decelerative knee overshoot and frontal plane pelvis stabilization.',
    },
  ];

  return (
    <div className="min-h-screen bg-[#090909] text-[#F5F5F5]">
      <Navbar currentTab="landing" setCurrentTab={onNavigate} />

      {/* Hero Section */}
      <section className="relative pt-36 pb-20 md:pt-44 md:pb-28 overflow-hidden">
        {/* Subtle background sports grid */}
        <div className="absolute inset-0 hud-grid opacity-30 pointer-events-none" />
        <div className="absolute -top-40 right-1/4 w-[600px] h-[600px] bg-[#C8FF3D]/5 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-7xl mx-auto px-6 relative z-10">
          <div className="max-w-3xl">
            {/* Athletic Eyebrow */}
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="inline-flex items-center gap-2.5 px-3.5 py-1.5 rounded-full bg-[#111111] border border-[#262626] mb-6 shadow-sm"
            >
              <span className="w-2 h-2 rounded-full bg-[#C8FF3D] animate-pulse" />
              <span className="text-xs font-semibold uppercase tracking-wider text-zinc-300">
                Precision Computer-Vision Biomechanics
              </span>
            </motion.div>

            {/* Massive Hero Heading */}
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="text-5xl sm:text-7xl lg:text-8xl font-display font-extrabold tracking-tight text-white leading-[1.05]"
            >
              Train Smarter.<br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-white via-zinc-200 to-zinc-400">
                Move Better.
              </span>
            </motion.h1>

            {/* Short confident subhead */}
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="mt-6 text-lg sm:text-xl text-zinc-300 max-w-xl font-normal leading-relaxed font-sans"
            >
              Real-time movement analysis for stronger, safer athletic performance. Powered by precision computer-vision and instant voice cues.
            </motion.p>

            {/* CTAs */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="mt-10 flex flex-wrap items-center gap-4"
            >
              <button
                onClick={() => handleStartSession('train')}
                className="inline-flex items-center gap-3 bg-[#C8FF3D] hover:bg-[#bbf030] text-black font-semibold text-sm tracking-wider uppercase px-8 py-4 rounded-xl transition-all shadow-lg active:scale-95"
              >
                <span>START TRAINING</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <button
                onClick={() => handleStartSession('exercises')}
                className="inline-flex items-center gap-3 bg-[#111111] hover:bg-[#181818] border border-[#222222] text-[#F5F5F5] font-semibold text-sm tracking-wider uppercase px-7 py-4 rounded-xl transition-all active:scale-95"
              >
                <span>EXPLORE EXERCISES</span>
              </button>
            </motion.div>
          </div>

          {/* Hero Visual: Premium Cinematic Workout Interface */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="mt-16 lg:mt-20 relative rounded-2xl border border-[#222222] bg-[#111111] overflow-hidden shadow-2xl"
          >
            {/* Top Bar */}
            <div className="h-12 border-b border-[#1c1c1c] bg-[#141414] px-6 flex items-center justify-between text-xs font-mono">
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#FF5C5C]/80 inline-block" />
                  <span className="w-2.5 h-2.5 rounded-full bg-[#FFB84D]/80 inline-block" />
                  <span className="w-2.5 h-2.5 rounded-full bg-[#7CFF6B]/80 inline-block" />
                </div>
                <span className="text-[#666666]">|</span>
                <span className="text-[#A1A1A1] uppercase tracking-wider">LIVE TELEMETRY FEED</span>
              </div>
              <div className="flex items-center gap-4">
                <span className="text-[#C8FF3D] flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-[#C8FF3D] animate-ping" />
                  60 FPS OPTICAL
                </span>
                <span className="text-[#666666]">33 LANDMARKS</span>
              </div>
            </div>

            {/* Split Screen Workout Showcase */}
            <div className="grid grid-cols-1 lg:grid-cols-12 min-h-[460px]">
              {/* Left/Center: Athlete Silhouette & HUD Overlay */}
              <div className="lg:col-span-8 relative bg-[#0d0d0d] flex items-center justify-center p-8 overflow-hidden">
                {/* Sports crosshairs */}
                <div className="absolute top-6 left-6 text-xs font-medium text-zinc-500 flex items-center gap-2 bg-[#141414]/80 px-2.5 py-1 rounded-lg border border-zinc-800">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#C8FF3D]" />
                  <span>CAM_01 / 28MM • DEPTH: PARALLEL</span>
                </div>
                <div className="absolute top-6 right-6 text-xs font-semibold text-[#C8FF3D] border border-[#C8FF3D]/30 px-2.5 py-1 rounded-lg bg-[#C8FF3D]/10">
                  CALIBRATED
                </div>

                {/* Simulated athlete wireframe / vector skeleton */}
                <div className="relative w-72 h-80 flex items-center justify-center">
                  {/* Subtle human silhouette gradient */}
                  <div className="absolute inset-0 bg-gradient-to-b from-[#181818] to-transparent rounded-full opacity-30 blur-2xl" />

                  {/* SVG Skeleton Simulation */}
                  <svg viewBox="0 0 200 260" className="w-full h-full">
                    {/* Head */}
                    <circle cx="100" cy="30" r="14" stroke="#C8FF3D" strokeWidth="2.5" fill="none" />
                    {/* Spine */}
                    <line x1="100" y1="44" x2="100" y2="120" stroke="#C8FF3D" strokeWidth="3" />
                    {/* Shoulder girdle */}
                    <line x1="60" y1="65" x2="140" y2="65" stroke="#C8FF3D" strokeWidth="3" />
                    {/* Left Arm */}
                    <line x1="60" y1="65" x2="45" y2="110" stroke="#C8FF3D" strokeWidth="2.5" />
                    <line x1="45" y1="110" x2="40" y2="150" stroke="#C8FF3D" strokeWidth="2.5" />
                    {/* Right Arm */}
                    <line x1="140" y1="65" x2="155" y2="110" stroke="#C8FF3D" strokeWidth="2.5" />
                    <line x1="155" y1="110" x2="160" y2="150" stroke="#C8FF3D" strokeWidth="2.5" />
                    {/* Pelvis */}
                    <line x1="75" y1="120" x2="125" y2="120" stroke="#C8FF3D" strokeWidth="3" />
                    {/* Left Leg with dynamic angle */}
                    <line x1="75" y1="120" x2="60" y2={heroKneeAngle <= 95 ? "175" : "185"} stroke="#C8FF3D" strokeWidth="3.5" />
                    <line x1="60" y1={heroKneeAngle <= 95 ? "175" : "185"} x2="65" y2="240" stroke="#C8FF3D" strokeWidth="3.5" />
                    {/* Right Leg */}
                    <line x1="125" y1="120" x2="140" y2={heroKneeAngle <= 95 ? "175" : "185"} stroke="#C8FF3D" strokeWidth="3.5" />
                    <line x1="140" y1={heroKneeAngle <= 95 ? "175" : "185"} x2="135" y2="240" stroke="#C8FF3D" strokeWidth="3.5" />
                    {/* Joint Nodes */}
                    <circle cx="100" cy="30" r="3" fill="#FFFFFF" />
                    <circle cx="60" cy="65" r="4" fill="#FFFFFF" />
                    <circle cx="140" cy="65" r="4" fill="#FFFFFF" />
                    <circle cx="75" cy="120" r="4" fill="#FFFFFF" />
                    <circle cx="125" cy="120" r="4" fill="#FFFFFF" />
                    <circle cx="60" cy={heroKneeAngle <= 95 ? "175" : "185"} r="5" fill="#FFFFFF" stroke="#C8FF3D" strokeWidth="2" />
                    <circle cx="140" cy={heroKneeAngle <= 95 ? "175" : "185"} r="5" fill="#FFFFFF" stroke="#C8FF3D" strokeWidth="2" />
                  </svg>

                  {/* Live Angle Tag Floating on Knee */}
                  <div className="absolute top-[60%] left-[10%] bg-[#111111]/90 border border-[#C8FF3D] text-[#C8FF3D] font-mono text-xs px-2.5 py-1 rounded shadow-lg">
                    {heroKneeAngle}° KNEE
                  </div>

                  {/* Horizontal Parallel Depth Laser */}
                  <div className="absolute top-[68%] left-4 right-4 h-px border-b border-dashed border-[#C8FF3D]/40 flex items-center justify-between text-[9px] font-mono text-[#C8FF3D]/60 px-2">
                    <span>TARGET PARALLEL (90°)</span>
                    <span>BREAK CREASE</span>
                  </div>
                </div>

                {/* Real-time Coach Audio Bar */}
                <div className="absolute bottom-6 left-1/2 -translate-x-1/2 max-w-md w-full px-4">
                  <div className="bg-[#181818]/90 backdrop-blur-md border border-[#2a2a2a] px-4 py-2.5 rounded-full flex items-center gap-3 shadow-xl">
                    <div className="w-2.5 h-2.5 rounded-full bg-[#C8FF3D] animate-ping" />
                    <span className="text-xs font-medium text-white truncate">
                      "Drive through your heels. Chest tall."
                    </span>
                    <span className="ml-auto text-[10px] font-mono uppercase text-[#666666]">AI COACH</span>
                  </div>
                </div>
              </div>

              {/* Right: Live Telemetry Sidebar */}
              <div className="lg:col-span-4 bg-[#141414] border-t lg:border-t-0 lg:border-l border-[#1c1c1c] p-6 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between pb-4 border-b border-[#222222]">
                    <div>
                      <span className="text-[10px] font-mono uppercase tracking-widest text-[#666666]">SESSION</span>
                      <h4 className="text-xl font-display font-bold text-white">SQUAT</h4>
                    </div>
                    <span className="text-xs font-mono px-2 py-1 rounded bg-[#1e1e1e] text-[#C8FF3D]">
                      SET 02 / 04
                    </span>
                  </div>

                  {/* Big Athletic Metrics */}
                  <div className="grid grid-cols-2 gap-4 my-6">
                    <div className="p-4 rounded-xl bg-[#181818] border border-[#222222]">
                      <span className="text-[10px] font-mono uppercase tracking-widest text-[#666666]">REPETITIONS</span>
                      <div className="text-4xl font-mono font-bold text-white mt-1 tabular-nums">
                        {heroRep}
                      </div>
                    </div>
                    <div className="p-4 rounded-xl bg-[#181818] border border-[#222222]">
                      <span className="text-[10px] font-mono uppercase tracking-widest text-[#666666]">FORM SCORE</span>
                      <div className="text-4xl font-mono font-bold text-[#C8FF3D] mt-1 tabular-nums">
                        88
                      </div>
                    </div>
                  </div>

                  {/* Live Biomechanical Indicators */}
                  <div className="space-y-3 font-mono text-xs">
                    <div className="flex items-center justify-between p-2.5 rounded-lg bg-[#181818]">
                      <span className="text-[#A1A1A1]">DEPTH</span>
                      <span className="text-[#7CFF6B] font-semibold flex items-center gap-1.5">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        PARALLEL (GOOD)
                      </span>
                    </div>

                    <div className="flex items-center justify-between p-2.5 rounded-lg bg-[#181818]">
                      <span className="text-[#A1A1A1]">KNEE ALIGNMENT</span>
                      <span className="text-[#7CFF6B] font-semibold flex items-center gap-1.5">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        SYMMETRIC
                      </span>
                    </div>

                    <div className="flex items-center justify-between p-2.5 rounded-lg bg-[#181818]">
                      <span className="text-[#A1A1A1]">BACK ANGLE</span>
                      <span className="text-[#7CFF6B] font-semibold flex items-center gap-1.5">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        14° NEUTRAL
                      </span>
                    </div>

                    <div className="flex items-center justify-between p-2.5 rounded-lg bg-[#181818]">
                      <span className="text-[#A1A1A1]">RANGE OF MOTION</span>
                      <span className="text-white font-semibold">96%</span>
                    </div>

                    <div className="flex items-center justify-between p-2.5 rounded-lg bg-[#181818]">
                      <span className="text-[#A1A1A1]">CADENCE / TEMPO</span>
                      <span className="text-white font-semibold">2.1s</span>
                    </div>
                  </div>
                </div>

                <div className="pt-6 border-t border-[#222222]">
                  <button
                    onClick={() => handleStartSession('live', 'squat')}
                    className="w-full py-3 rounded-lg bg-[#C8FF3D] hover:bg-[#bbf030] text-black font-semibold text-xs tracking-wider uppercase transition-all flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <Play className="w-3.5 h-3.5 fill-black" />
                    <span>LAUNCH THIS WORKOUT</span>
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* SECTION: YOUR FORM, IN REAL TIME */}
      <section className="py-24 border-t border-[#181818] bg-[#0c0c0c] relative">
        <div className="max-w-7xl mx-auto px-6">
          <div className="max-w-2xl">
            <span className="text-xs font-mono uppercase tracking-widest text-[#C8FF3D]">
              OPTICAL INTELLIGENCE
            </span>
            <h2 className="text-4xl sm:text-5xl font-display font-bold tracking-tight text-white mt-2">
              YOUR FORM, IN REAL TIME.
            </h2>
            <p className="text-[#A1A1A1] mt-4 text-base">
              Every millisecond of your repetition is tracked with sub-degree joint angle fidelity. No wearables required.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mt-16">
            <div className="p-8 rounded-2xl bg-[#111111] border border-[#1e1e1e] hover:border-[#C8FF3D]/30 transition-all">
              <div className="w-12 h-12 rounded-xl bg-[#181818] flex items-center justify-center mb-6 text-[#C8FF3D]">
                <Activity className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-white mb-2">Live Movement Tracking</h3>
              <p className="text-sm text-[#A1A1A1] leading-relaxed">
                Tracks 33 anatomical landmarks across 3D vector space at 60 frames per second using MediaPipe.
              </p>
            </div>

            <div className="p-8 rounded-2xl bg-[#111111] border border-[#1e1e1e] hover:border-[#C8FF3D]/30 transition-all">
              <div className="w-12 h-12 rounded-xl bg-[#181818] flex items-center justify-center mb-6 text-[#C8FF3D]">
                <Target className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-white mb-2">Rep Counting</h3>
              <p className="text-sm text-[#A1A1A1] leading-relaxed">
                State-machine verification eliminates fake reps. A rep only counts if full eccentric and concentric cycles complete.
              </p>
            </div>

            <div className="p-8 rounded-2xl bg-[#111111] border border-[#1e1e1e] hover:border-[#C8FF3D]/30 transition-all">
              <div className="w-12 h-12 rounded-xl bg-[#181818] flex items-center justify-center mb-6 text-[#C8FF3D]">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-white mb-2">Form Analysis</h3>
              <p className="text-sm text-[#A1A1A1] leading-relaxed">
                Flags knee valgus collapse, lumbar hyperextension, hip sag, and momentum cheats the exact instant they happen.
              </p>
            </div>

            <div className="p-8 rounded-2xl bg-[#111111] border border-[#1e1e1e] hover:border-[#C8FF3D]/30 transition-all">
              <div className="w-12 h-12 rounded-xl bg-[#181818] flex items-center justify-center mb-6 text-[#C8FF3D]">
                <Sparkles className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-white mb-2">Movement Quality</h3>
              <p className="text-sm text-[#A1A1A1] leading-relaxed">
                Calculates composite 0–100 Form Score balancing range of motion, symmetry, stability, and repetition tempo.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION: BUILT AROUND HOW YOU MOVE */}
      <section className="py-24 border-t border-[#181818] bg-[#090909]">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center max-w-2xl mx-auto">
            <span className="text-xs font-mono uppercase tracking-widest text-[#C8FF3D]">
              BIOMECHANICAL ENGINE
            </span>
            <h2 className="text-4xl sm:text-5xl font-display font-bold tracking-tight text-white mt-2">
              BUILT AROUND HOW YOU MOVE.
            </h2>
            <p className="text-[#A1A1A1] mt-4 text-base">
              Precision mathematics instead of generic guesswork. Every variable is weighed with sports-science discipline.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mt-16">
            <div className="p-6 rounded-2xl bg-[#111111] border border-[#1e1e1e] text-center">
              <span className="text-3xl font-mono font-bold text-[#C8FF3D]">40%</span>
              <h4 className="text-sm font-semibold text-white mt-2">Technique</h4>
              <p className="text-xs text-[#A1A1A1] mt-2">Joint alignment, posture & kinematic path integrity.</p>
            </div>

            <div className="p-6 rounded-2xl bg-[#111111] border border-[#1e1e1e] text-center">
              <span className="text-3xl font-mono font-bold text-white">25%</span>
              <h4 className="text-sm font-semibold text-white mt-2">Range of Motion</h4>
              <p className="text-xs text-[#A1A1A1] mt-2">Full target extension and inflection threshold.</p>
            </div>

            <div className="p-6 rounded-2xl bg-[#111111] border border-[#1e1e1e] text-center">
              <span className="text-3xl font-mono font-bold text-white">20%</span>
              <h4 className="text-sm font-semibold text-white mt-2">Stability</h4>
              <p className="text-xs text-[#A1A1A1] mt-2">Center-of-mass sway and anti-rotation control.</p>
            </div>

            <div className="p-6 rounded-2xl bg-[#111111] border border-[#1e1e1e] text-center">
              <span className="text-3xl font-mono font-bold text-white">15%</span>
              <h4 className="text-sm font-semibold text-white mt-2">Tempo</h4>
              <p className="text-xs text-[#A1A1A1] mt-2">Cadence, eccentric duration and isometric control.</p>
            </div>

            <div className="p-6 rounded-2xl bg-[#141414] border border-[#C8FF3D]/40 text-center">
              <span className="text-3xl font-mono font-bold text-[#C8FF3D]">100</span>
              <h4 className="text-sm font-semibold text-white mt-2">Form Score</h4>
              <p className="text-xs text-[#A1A1A1] mt-2">Your definitive single metric of execution excellence.</p>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION: FIVE MOVEMENTS. ONE STANDARD. */}
      <section className="py-24 border-t border-[#181818] bg-[#0c0c0c]">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-16">
            <div>
              <span className="text-xs font-mono uppercase tracking-widest text-[#C8FF3D]">
                MOVEMENT LIBRARY
              </span>
              <h2 className="text-4xl sm:text-5xl font-display font-bold tracking-tight text-white mt-2">
                FIVE MOVEMENTS. ONE STANDARD.
              </h2>
            </div>
            <button
              onClick={() => handleStartSession('exercises')}
              className="mt-4 md:mt-0 text-xs font-mono text-[#C8FF3D] hover:underline flex items-center gap-1 uppercase tracking-wider"
            >
              <span>View technical specs</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-6">
            {exercises.map((ex) => (
              <div
                key={ex.slug}
                onClick={() => handleStartSession('live', ex.slug)}
                className="group cursor-pointer p-6 rounded-2xl bg-[#111111] border border-[#1e1e1e] hover:border-[#C8FF3D] transition-all flex flex-col justify-between"
              >
                <div>
                  <span className="text-[10px] font-mono uppercase tracking-widest text-[#666666]">
                    {ex.category}
                  </span>
                  <h3 className="text-xl font-display font-bold text-white mt-1 group-hover:text-[#C8FF3D] transition-colors">
                    {ex.name}
                  </h3>
                  <div className="mt-4 pt-4 border-t border-[#1c1c1c] space-y-2 text-xs font-mono">
                    <div className="text-[#A1A1A1]">
                      FOCUS: <span className="text-white">{ex.target}</span>
                    </div>
                    <div className="text-[#A1A1A1]">
                      ROM: <span className="text-[#C8FF3D]">{ex.rom}</span>
                    </div>
                  </div>
                  <p className="text-xs text-[#A1A1A1] mt-4 line-clamp-3">
                    {ex.desc}
                  </p>
                </div>

                <div className="mt-6 pt-4 border-t border-[#1c1c1c] flex items-center justify-between text-xs font-semibold text-[#C8FF3D]">
                  <span>TRAIN NOW</span>
                  <ArrowRight className="w-3.5 h-3.5 transform group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* SECTION: YOUR TRAINING, OVER TIME */}
      <section className="py-24 border-t border-[#181818] bg-[#090909]">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            <div className="lg:col-span-5">
              <span className="text-xs font-mono uppercase tracking-widest text-[#C8FF3D]">
                PROGRESSION
              </span>
              <h2 className="text-4xl sm:text-5xl font-display font-bold tracking-tight text-white mt-2">
                YOUR TRAINING, OVER TIME.
              </h2>
              <p className="text-[#A1A1A1] mt-6 text-base leading-relaxed">
                Watch movement faults disappear as muscle memory solidifies. Longitudinal tracking highlights stability gains, velocity control, and injury risk mitigation.
              </p>

              <div className="grid grid-cols-2 gap-4 mt-8">
                <div className="p-4 rounded-xl bg-[#111111] border border-[#1e1e1e]">
                  <span className="text-3xl font-mono font-bold text-white">87</span>
                  <p className="text-xs font-mono uppercase text-[#A1A1A1] mt-1">Avg Form Score</p>
                </div>
                <div className="p-4 rounded-xl bg-[#111111] border border-[#1e1e1e]">
                  <span className="text-3xl font-mono font-bold text-[#C8FF3D]">+8.4%</span>
                  <p className="text-xs font-mono uppercase text-[#A1A1A1] mt-1">Quality Gain (30D)</p>
                </div>
              </div>

              <div className="mt-8">
                <button
                  onClick={() => handleStartSession('dashboard')}
                  className="inline-flex items-center gap-2 bg-[#181818] hover:bg-[#222222] border border-[#2a2a2a] text-white font-semibold text-xs tracking-wider uppercase px-6 py-3.5 rounded-xl transition-all"
                >
                  <span>EXPLORE ATHLETE COMMAND CENTER</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Analytics Dashboard Visual Showcase */}
            <div className="lg:col-span-7 p-6 rounded-2xl bg-[#111111] border border-[#1e1e1e]">
              <div className="flex items-center justify-between pb-4 border-b border-[#1c1c1c]">
                <div className="flex items-center gap-2">
                  <BarChart3 className="w-4 h-4 text-[#C8FF3D]" />
                  <span className="text-xs font-mono font-semibold text-white uppercase tracking-wider">
                    FORM SCORE TRAJECTORY (30 DAYS)
                  </span>
                </div>
                <span className="text-xs font-mono text-[#7CFF6B]">+8% TREND</span>
              </div>

              {/* Simulated crisp trend sparkline */}
              <div className="h-56 mt-6 flex items-end justify-between gap-2 px-2 pb-2">
                {[72, 74, 76, 75, 78, 80, 82, 81, 84, 85, 87, 88, 89, 91].map((val, idx) => (
                  <div key={idx} className="flex-1 flex flex-col items-center gap-2 group">
                    <div 
                      className="w-full bg-[#1c1c1c] group-hover:bg-[#C8FF3D] rounded-t transition-all duration-300 relative"
                      style={{ height: `${(val / 100) * 180}px` }}
                    >
                      <div className="opacity-0 group-hover:opacity-100 absolute -top-7 left-1/2 -translate-x-1/2 bg-black border border-[#C8FF3D] text-[#C8FF3D] font-mono text-[10px] px-1.5 py-0.5 rounded transition-opacity pointer-events-none">
                        {val}
                      </div>
                    </div>
                    <span className="text-[10px] font-mono text-[#555555]">
                      {idx % 3 === 0 ? `W${Math.floor(idx / 3) + 1}` : ''}
                    </span>
                  </div>
                ))}
              </div>

              <div className="grid grid-cols-3 gap-4 pt-6 mt-4 border-t border-[#1c1c1c] text-center font-mono">
                <div>
                  <span className="text-xs text-[#666666]">WORKOUTS</span>
                  <div className="text-lg font-bold text-white mt-0.5">24 SESSIONS</div>
                </div>
                <div>
                  <span className="text-xs text-[#666666]">TOTAL REPS</span>
                  <div className="text-lg font-bold text-white mt-0.5">642 REPS</div>
                </div>
                <div>
                  <span className="text-xs text-[#666666]">TRAINING TIME</span>
                  <div className="text-lg font-bold text-[#C8FF3D] mt-0.5">3H 42M</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FINAL CALL TO ACTION */}
      <section className="py-28 border-t border-[#181818] bg-[#0c0c0c] text-center relative overflow-hidden">
        <div className="max-w-4xl mx-auto px-6 relative z-10">
          <h2 className="text-5xl sm:text-6xl font-display font-extrabold tracking-tight text-white">
            READY TO MEASURE<br />
            <span className="text-[#C8FF3D]">YOUR MOVEMENT?</span>
          </h2>
          <p className="text-base sm:text-lg text-[#A1A1A1] mt-6 max-w-xl mx-auto">
            Zero specialized sensors. Instant webcam analysis. Elevate your training with commercial-grade sports science.
          </p>

          <div className="mt-10 flex flex-wrap justify-center gap-4">
            <button
              onClick={() => handleStartSession('train')}
              className="inline-flex items-center gap-3 bg-[#C8FF3D] hover:bg-[#bbf030] text-black font-semibold text-sm tracking-wider uppercase px-9 py-4 rounded-xl transition-all shadow-xl active:scale-95 cursor-pointer"
            >
              <span>START TRAINING NOW</span>
              <ArrowRight className="w-4 h-4" />
            </button>
            <button
              onClick={() => handleStartSession('dashboard')}
              className="inline-flex items-center gap-3 bg-[#111111] hover:bg-[#181818] border border-[#222222] text-white font-semibold text-sm tracking-wider uppercase px-8 py-4 rounded-xl transition-all cursor-pointer"
            >
              <span>OPEN COMMAND CENTER</span>
            </button>
          </div>
        </div>
      </section>
    </div>
  );
};
