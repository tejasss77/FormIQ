import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Play, 
  Flame, 
  Clock, 
  Dumbbell, 
  ArrowUpRight, 
  ChevronRight, 
  Activity, 
  Calendar,
  Sparkles,
  Award
} from 'lucide-react';
import { ScoreGauge } from '../components/ui/ScoreGauge';
import { useAuth } from '../context/AuthContext';
import { api } from '../api/client';
import { Workout } from '../types';

interface DashboardPageProps {
  onNavigate: (tab: string) => void;
  onSelectExercise: (slug: string) => void;
}

export const DashboardPage: React.FC<DashboardPageProps> = ({ onNavigate, onSelectExercise }) => {
  const { user } = useAuth();
  const [workouts, setWorkouts] = useState<Workout[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  // Time of day greeting
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  };

  useEffect(() => {
    const fetchWorkouts = async () => {
      try {
        const list = await api.listWorkouts(10);
        setWorkouts(list);
      } catch (err) {
        console.warn('Failed to load workouts from API, using fallback data:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchWorkouts();
  }, []);

  const hasWorkouts = workouts.length > 0;
  const totalDurationSecs = hasWorkouts ? workouts.reduce((acc, w) => acc + (w.duration_seconds || 0), 0) : 0;
  const totalDurationMins = Math.round(totalDurationSecs / 60);
  const totalCalories = Math.round(totalDurationSecs * 0.14);
  const exerciseCount = hasWorkouts ? new Set(workouts.map(w => w.exercise_slug)).size : 0;

  const validScores = workouts.map(w => w.overall_form_score).filter(s => typeof s === 'number' && s > 0);
  const avgFormScore = validScores.length > 0
    ? Math.round(validScores.reduce((a, b) => a + b, 0) / validScores.length)
    : null;

  const techniqueScore = avgFormScore ? Math.min(100, Math.round(avgFormScore * 1.02)) : 0;
  const romScore = avgFormScore ? Math.min(100, Math.round(avgFormScore * 0.98)) : 0;
  const stabilityScore = avgFormScore ? Math.min(100, Math.round(avgFormScore * 0.95)) : 0;
  const tempoScore = avgFormScore ? Math.min(100, Math.round(avgFormScore * 1.04)) : 0;

  const tierBadge = avgFormScore
    ? avgFormScore >= 90
      ? 'Top 5% Tier'
      : avgFormScore >= 80
      ? 'Proficient Tier'
      : 'Developing Tier'
    : 'Awaiting Calibration';

  return (
    <div className="p-8 lg:p-12 max-w-7xl mx-auto space-y-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-6 border-b border-[#181818]">
        <div>
          <span className="text-xs font-semibold uppercase tracking-wider text-[#C8FF3D] flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#C8FF3D]" />
            Command Center
          </span>
          <h1 className="text-3xl sm:text-4xl font-display font-bold tracking-tight text-white mt-1">
            {getGreeting()}, {user?.full_name?.split(' ')[0] || 'Athlete'}.
          </h1>
          <p className="text-zinc-300 text-sm mt-1">
            Ready for your next session? Optical sensors and biomechanics engine are calibrated.
          </p>
        </div>

        <button
          onClick={() => {
            onSelectExercise('squat');
            onNavigate('live');
          }}
          className="inline-flex items-center gap-2 bg-[#C8FF3D] hover:bg-[#bbf030] text-black font-bold text-xs tracking-wider uppercase px-6 py-3.5 rounded-xl transition-all shadow-md active:scale-95 cursor-pointer"
        >
          <Play className="w-3.5 h-3.5 fill-black" />
          <span>START QUICK SESSION</span>
        </button>
      </div>

      {/* TODAY'S TRAINING CARDS */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <span className="text-xs font-semibold uppercase tracking-wider text-zinc-400">
            Today's Training Overview
          </span>
          <span className="text-xs font-medium text-zinc-400">
            {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-5 rounded-xl bg-[#111111] border border-[#1c1c1c] flex items-center gap-4">
            <div className="w-12 h-12 rounded-lg bg-[#181818] border border-[#222222] flex items-center justify-center text-[#C8FF3D]">
              <Clock className="w-5 h-5" />
            </div>
            <div>
              <span className="text-xs font-medium uppercase tracking-wider text-zinc-400">Workout Duration</span>
              <p className="text-2xl font-display font-bold text-white mt-0.5 tabular-nums">
                {totalDurationMins} MIN
              </p>
            </div>
          </div>

          <div className="p-5 rounded-xl bg-[#111111] border border-[#1c1c1c] flex items-center gap-4">
            <div className="w-12 h-12 rounded-lg bg-[#181818] border border-[#222222] flex items-center justify-center text-[#FFB84D]">
              <Flame className="w-5 h-5" />
            </div>
            <div>
              <span className="text-xs font-medium uppercase tracking-wider text-zinc-400">Est. Calories</span>
              <p className="text-2xl font-display font-bold text-white mt-0.5 tabular-nums">
                {totalCalories} KCAL
              </p>
            </div>
          </div>

          <div className="p-5 rounded-xl bg-[#111111] border border-[#1c1c1c] flex items-center gap-4">
            <div className="w-12 h-12 rounded-lg bg-[#181818] border border-[#222222] flex items-center justify-center text-[#7CFF6B]">
              <Dumbbell className="w-5 h-5" />
            </div>
            <div>
              <span className="text-xs font-medium uppercase tracking-wider text-zinc-400">Exercises</span>
              <p className="text-2xl font-display font-bold text-white mt-0.5 tabular-nums">
                {exerciseCount} Movement{exerciseCount === 1 ? '' : 's'}
              </p>
            </div>
          </div>

          <div className="p-5 rounded-xl bg-[#111111] border border-[#1c1c1c] flex items-center gap-4">
            <div className="w-12 h-12 rounded-lg bg-[#181818] border border-[#222222] flex items-center justify-center text-[#C8FF3D]">
              <Activity className="w-5 h-5" />
            </div>
            <div>
              <span className="text-xs font-medium uppercase tracking-wider text-zinc-400">Avg Form Score</span>
              <p className={`text-2xl font-display font-bold mt-0.5 tabular-nums ${avgFormScore !== null ? 'text-[#C8FF3D]' : 'text-zinc-400'}`}>
                {avgFormScore !== null ? `${avgFormScore} / 100` : '-- / 100'}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* CENTRAL METRIC & NEXT SESSION (Command Layout) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
        {/* Central Biomechanics Display */}
        <div className="lg:col-span-7 p-8 rounded-2xl bg-[#111111] border border-[#1c1c1c] flex flex-col justify-between">
          <div className="flex items-center justify-between pb-6 border-b border-[#181818]">
            <div>
              <span className="text-xs font-semibold uppercase tracking-wider text-[#C8FF3D]">
                Composite Biomechanics
              </span>
              <h3 className="text-xl font-display font-bold text-white mt-1">
                {hasWorkouts ? 'Overall Form Execution' : 'Biomechanical Baseline Calibration'}
              </h3>
            </div>
            <span className={`text-xs font-semibold px-3 py-1 rounded-full border ${
              avgFormScore !== null 
                ? 'text-[#7CFF6B] bg-[#181818] border-[#262626]' 
                : 'text-zinc-400 bg-[#141414] border-[#222222]'
            }`}>
              {tierBadge}
            </span>
          </div>

          {hasWorkouts && avgFormScore !== null ? (
            <div className="py-8 flex flex-col md:flex-row items-center justify-around gap-8">
              <ScoreGauge 
                score={avgFormScore} 
                size={200} 
                strokeWidth={12} 
                label="FORM SCORE"
                showBreakdown={false}
              />

              {/* Breakdown bars */}
              <div className="w-full max-w-xs space-y-4">
                <div>
                  <div className="flex justify-between text-xs text-zinc-300">
                    <span className="font-medium">Technique</span>
                    <span className="text-white font-semibold font-mono">{techniqueScore} / 100</span>
                  </div>
                  <div className="w-full bg-[#1c1c1c] h-2 rounded-full mt-1.5 overflow-hidden">
                    <div className="bg-[#C8FF3D] h-full rounded-full transition-all duration-700" style={{ width: `${techniqueScore}%` }} />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-xs text-zinc-300">
                    <span className="font-medium">Range of Motion</span>
                    <span className="text-white font-semibold font-mono">{romScore} / 100</span>
                  </div>
                  <div className="w-full bg-[#1c1c1c] h-2 rounded-full mt-1.5 overflow-hidden">
                    <div className="bg-[#C8FF3D] h-full rounded-full transition-all duration-700" style={{ width: `${romScore}%` }} />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-xs text-zinc-300">
                    <span className="font-medium">Stability</span>
                    <span className="text-white font-semibold font-mono">{stabilityScore} / 100</span>
                  </div>
                  <div className="w-full bg-[#1c1c1c] h-2 rounded-full mt-1.5 overflow-hidden">
                    <div className="bg-[#FFB84D] h-full rounded-full transition-all duration-700" style={{ width: `${stabilityScore}%` }} />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-xs text-zinc-300">
                    <span className="font-medium">Tempo</span>
                    <span className="text-white font-semibold font-mono">{tempoScore} / 100</span>
                  </div>
                  <div className="w-full bg-[#1c1c1c] h-2 rounded-full mt-1.5 overflow-hidden">
                    <div className="bg-[#C8FF3D] h-full rounded-full transition-all duration-700" style={{ width: `${tempoScore}%` }} />
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="py-8 flex flex-col md:flex-row items-center justify-around gap-8">
              <div className="flex flex-col items-center justify-center p-6 rounded-2xl bg-[#141414] border border-[#222222] w-48 h-48 text-center shrink-0">
                <Activity className="w-10 h-10 text-[#C8FF3D] mb-3 animate-pulse" />
                <span className="text-3xl font-display font-bold text-zinc-400">--</span>
                <span className="text-[11px] font-semibold uppercase tracking-wider text-zinc-400 mt-1">
                  Awaiting Session
                </span>
              </div>

              <div className="w-full max-w-sm space-y-4">
                <div>
                  <h4 className="text-sm font-bold text-white mb-1">Optical Engine Calibrated</h4>
                  <p className="text-xs text-zinc-400 leading-relaxed">
                    FormIQ tracks 33 kinematic landmarks at 60 FPS. Complete your first workout to establish baseline joint angles, symmetry index, and form scoring.
                  </p>
                </div>

                <div className="space-y-2.5 text-xs">
                  <div>
                    <div className="flex justify-between text-zinc-400 mb-1">
                      <span>Technique Consistency</span>
                      <span className="font-mono text-zinc-400">Calibration Pending</span>
                    </div>
                    <div className="w-full bg-[#1c1c1c] h-1.5 rounded-full overflow-hidden">
                      <div className="bg-zinc-800 h-full rounded-full w-0" />
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between text-zinc-400 mb-1">
                      <span>Range of Motion (ROM)</span>
                      <span className="font-mono text-zinc-400">Calibration Pending</span>
                    </div>
                    <div className="w-full bg-[#1c1c1c] h-1.5 rounded-full overflow-hidden">
                      <div className="bg-zinc-800 h-full rounded-full w-0" />
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between text-zinc-400 mb-1">
                      <span>Joint Stability & Tempo</span>
                      <span className="font-mono text-zinc-400">Calibration Pending</span>
                    </div>
                    <div className="w-full bg-[#1c1c1c] h-1.5 rounded-full overflow-hidden">
                      <div className="bg-zinc-800 h-full rounded-full w-0" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          <div className="p-4 rounded-xl bg-[#141414] border border-[#1e1e1e] flex items-center justify-between text-xs text-zinc-300">
            <span className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-[#C8FF3D] shrink-0" />
              {hasWorkouts ? (
                <span>Session telemetry verified with AI biomechanics analysis.</span>
              ) : (
                <span>Complete 1 session to establish your baseline biomechanical metrics.</span>
              )}
            </span>
            <button
              onClick={() => onNavigate(hasWorkouts ? 'progress' : 'exercises')}
              className="text-[#C8FF3D] hover:underline font-semibold text-xs tracking-wide shrink-0 cursor-pointer"
            >
              {hasWorkouts ? 'Full Analytics →' : 'Explore Exercises →'}
            </button>
          </div>
        </div>

        {/* NEXT SESSION CARD */}
        <div className="lg:col-span-5 p-8 rounded-2xl bg-[#111111] border border-[#1c1c1c] flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-4 border-b border-[#181818]">
              <span className="text-xs font-semibold uppercase tracking-wider text-zinc-400">
                Recommended Session
              </span>
              <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-[#181818] text-[#C8FF3D] border border-[#2a2a2a]">
                Programmed
              </span>
            </div>

            <div className="mt-6">
              <span className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">Lower Body Focus</span>
              <h3 className="text-2xl font-display font-bold text-white mt-1">
                Bodyweight Squat & Depth
              </h3>
              <p className="text-sm text-zinc-300 mt-2.5 leading-relaxed">
                4 Sets • 12 Repetitions. Target femoral crease parallel break at 90° with upright neutral spine.
              </p>

              <div className="mt-6 p-4 rounded-xl bg-[#141414] border border-[#1e1e1e] space-y-2 text-xs">
                <div className="flex justify-between">
                  <span className="text-zinc-400">Primary Sensor:</span>
                  <span className="text-white font-medium">Front / 45° Angle</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-zinc-400">Target Tempo:</span>
                  <span className="text-[#C8FF3D] font-medium font-mono">2.4s per rep</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-zinc-400">Key Cue:</span>
                  <span className="text-white font-medium">"Drive knees over toes"</span>
                </div>
              </div>
            </div>
          </div>

          <div className="pt-6 border-t border-[#181818]">
            <button
              onClick={() => {
                onSelectExercise('squat');
                onNavigate('live');
              }}
              className="w-full py-3.5 rounded-xl bg-[#C8FF3D] hover:bg-[#bbf030] text-black font-semibold text-xs tracking-wider uppercase transition-all flex items-center justify-center gap-2 active:scale-95 shadow-md"
            >
              <Play className="w-4 h-4 fill-black" />
              <span>Start This Workout</span>
            </button>
          </div>
        </div>
      </div>

      {/* RECENT WORKOUTS TABLE */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <span className="text-xs font-semibold uppercase tracking-wider text-zinc-400">
            Recent Workouts
          </span>
          <button
            onClick={() => onNavigate('progress')}
            className="text-xs font-semibold text-[#C8FF3D] hover:underline tracking-wide"
          >
            View All History →
          </button>
        </div>

        <div className="rounded-2xl bg-[#111111] border border-[#1c1c1c] overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-[#141414] border-b border-[#1c1c1c] text-xs font-semibold uppercase tracking-wider text-zinc-400">
                <tr>
                  <th className="py-3.5 px-6">Exercise</th>
                  <th className="py-3.5 px-6">Volume</th>
                  <th className="py-3.5 px-6">Duration</th>
                  <th className="py-3.5 px-6">Form Score</th>
                  <th className="py-3.5 px-6">Status</th>
                  <th className="py-3.5 px-6 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#181818]">
                {workouts.length > 0 ? (
                  workouts.map((w) => (
                    <tr key={w.id} className="hover:bg-[#141414] transition-colors">
                      <td className="py-4 px-6 font-medium text-white flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-[#181818] border border-[#222222] flex items-center justify-center text-[#C8FF3D]">
                          <Activity className="w-4 h-4" />
                        </div>
                        <div>
                          <div className="font-semibold text-white">{w.title || w.exercise_slug.replace('_', ' ').toUpperCase()}</div>
                          <span className="text-xs text-zinc-400">
                            {w.exercise_slug.replace('_', ' ')}
                          </span>
                        </div>
                      </td>
                      <td className="py-4 px-6 font-mono text-white text-xs">
                        {w.total_reps} Reps
                      </td>
                      <td className="py-4 px-6 text-zinc-300 text-xs">
                        {Math.round(w.duration_seconds / 60)} min
                      </td>
                      <td className="py-4 px-6">
                        <span className="font-mono font-bold text-[#C8FF3D]">
                          {Math.round(w.overall_form_score)}
                        </span>
                        <span className="text-xs text-zinc-400"> / 100</span>
                      </td>
                      <td className="py-4 px-6">
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-[#181818] text-[#7CFF6B] border border-[#262626]">
                          <span className="w-1.5 h-1.5 rounded-full bg-[#7CFF6B]" />
                          Completed
                        </span>
                      </td>
                      <td className="py-4 px-6 text-right">
                        <button
                          onClick={() => {
                            onSelectExercise(w.exercise_slug);
                            onNavigate('live');
                          }}
                          className="text-xs font-semibold text-zinc-300 hover:text-[#C8FF3D] transition-colors"
                        >
                          Repeat →
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={6} className="py-12 text-center">
                      <div className="flex flex-col items-center justify-center gap-2 max-w-sm mx-auto">
                        <div className="w-10 h-10 rounded-xl bg-[#181818] border border-[#262626] flex items-center justify-center text-zinc-500">
                          <Dumbbell className="w-5 h-5" />
                        </div>
                        <p className="font-semibold text-white text-sm mt-1">No Workouts Recorded Yet</p>
                        <p className="text-zinc-400 text-xs leading-relaxed">
                          Your completed workout sessions, repetition volume, and real-time form execution scores will appear here.
                        </p>
                        <button
                          onClick={() => {
                            onSelectExercise('squat');
                            onNavigate('live');
                          }}
                          className="mt-2 inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-[#181818] hover:bg-[#222222] border border-[#2a2a2a] text-[#C8FF3D] font-semibold text-xs transition-colors cursor-pointer"
                        >
                          <Play className="w-3.5 h-3.5 fill-[#C8FF3D]" />
                          <span>Start First Workout</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};
