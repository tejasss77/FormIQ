import React, { useEffect } from 'react';
import { motion } from 'framer-motion';
import confetti from 'canvas-confetti';
import { 
  CheckCircle2, 
  ArrowRight, 
  Clock, 
  Activity, 
  Award, 
  Flame, 
  Share2, 
  RotateCcw,
  Sparkles,
  AlertCircle
} from 'lucide-react';
import { ScoreGauge } from '../components/ui/ScoreGauge';
import { Workout } from '../types';

interface WorkoutSummaryPageProps {
  workout: Partial<Workout> | null;
  onNavigate: (tab: string) => void;
  onSelectExercise: (slug: string) => void;
}

export const WorkoutSummaryPage: React.FC<WorkoutSummaryPageProps> = ({
  workout,
  onNavigate,
  onSelectExercise,
}) => {
  // Fire celebratory athletic confetti burst
  useEffect(() => {
    try {
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#C8FF3D', '#FFFFFF', '#7CFF6B'],
      });
    } catch (e) {
      // Ignored if confetti fails
    }
  }, []);

  const totalMinutes = Math.max(1, Math.round((workout?.duration_seconds || 2520) / 60));
  const formScore = Math.round(workout?.overall_form_score || 87);
  const totalReps = workout?.total_reps || 124;
  const exerciseName = (workout?.exercise_slug || 'squat').replace('_', ' ').toUpperCase();

  const exerciseBreakdown = [
    { name: 'Squat', reps: 48, form: 89 },
    { name: 'Push-Up', reps: 32, form: 84 },
    { name: 'Biceps Curl', reps: 44, form: 88 },
  ];

  const positives = workout?.summary_positives || [
    'Strong squat depth breaking parallel crease',
    'Consistent 2.2s eccentric lowering tempo',
    'High lateral stability and zero knee valgus collapse',
  ];

  const improvements = workout?.summary_improvements || [
    'Improve push-up alignment in final fatigue reps',
    'Control eccentric phase during transition at bottom',
  ];

  return (
    <div className="p-8 lg:p-12 max-w-5xl mx-auto space-y-12">
      {/* Header */}
      <div className="text-center max-w-xl mx-auto">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.4 }}
          className="w-12 h-12 rounded-full bg-[#181818] border border-[#2a2a2a] flex items-center justify-center mx-auto mb-4 text-[#C8FF3D]"
        >
          <Award className="w-6 h-6" />
        </motion.div>

        <span className="text-xs font-semibold uppercase tracking-wider text-[#C8FF3D]">
          Session Report
        </span>
        <h1 className="text-4xl sm:text-5xl font-display font-bold tracking-tight text-white mt-1">
          Workout Complete
        </h1>
        <p className="text-zinc-300 text-sm mt-2">
          Telemetric movement profile saved to your biometric history.
        </p>
      </div>

      {/* Top 3 Giant Metric Pillars */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="p-8 rounded-2xl bg-[#111111] border border-[#1e1e1e] text-center flex flex-col justify-center items-center">
          <span className="text-xs font-semibold uppercase tracking-wider text-zinc-400">
            Session Duration
          </span>
          <div className="text-5xl font-display font-bold text-white mt-2 tabular-nums">
            {totalMinutes}
          </div>
          <span className="text-xs font-medium text-zinc-400 mt-1">Minutes</span>
        </div>

        <div className="p-8 rounded-2xl bg-[#111111] border border-[#C8FF3D]/40 text-center flex flex-col justify-center items-center relative overflow-hidden">
          <div className="absolute top-0 right-0 w-24 h-24 bg-[#C8FF3D]/5 rounded-bl-full pointer-events-none" />
          <span className="text-xs font-semibold uppercase tracking-wider text-[#C8FF3D]">
            Form Score
          </span>
          <div className="text-5xl font-display font-bold text-[#C8FF3D] mt-2 tabular-nums">
            {formScore}
          </div>
          <span className="text-xs font-medium text-zinc-400 mt-1">Out of 100</span>
        </div>

        <div className="p-8 rounded-2xl bg-[#111111] border border-[#1e1e1e] text-center flex flex-col justify-center items-center">
          <span className="text-xs font-semibold uppercase tracking-wider text-zinc-400">
            Total Volume
          </span>
          <div className="text-5xl font-display font-bold text-white mt-2 tabular-nums">
            {totalReps}
          </div>
          <span className="text-xs font-medium text-zinc-400 mt-1">Repetitions</span>
        </div>
      </div>

      {/* EXERCISE BREAKDOWN */}
      <div className="p-8 rounded-2xl bg-[#111111] border border-[#1e1e1e] space-y-6">
        <div className="flex items-center justify-between pb-4 border-b border-[#181818]">
          <span className="text-xs font-semibold uppercase tracking-wider text-zinc-400">
            Exercise Breakdown
          </span>
          <span className="text-xs font-medium text-zinc-400">3 Movements Analyzed</span>
        </div>

        <div className="divide-y divide-[#181818]">
          {exerciseBreakdown.map((item, idx) => (
            <div key={idx} className="py-4 flex items-center justify-between">
              <div>
                <h4 className="text-base font-semibold text-white">{item.name}</h4>
                <span className="text-xs text-zinc-400">
                  {item.reps} completed reps
                </span>
              </div>

              <div className="flex items-center gap-6">
                <div className="text-right">
                  <span className="text-lg font-mono font-bold text-[#C8FF3D]">
                    {item.form}
                  </span>
                  <span className="text-xs text-zinc-400"> / 100</span>
                </div>
                <div className="w-24 bg-[#181818] h-2 rounded-full hidden sm:block overflow-hidden">
                  <div
                    className="bg-[#C8FF3D] h-full rounded-full"
                    style={{ width: `${item.form}%` }}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* WHAT WENT WELL & FOCUS NEXT TIME (Two-Column Layout) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* WHAT WENT WELL */}
        <div className="p-8 rounded-2xl bg-[#111111] border border-[#1e1e1e] space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-[#181818]">
            <CheckCircle2 className="w-4 h-4 text-[#7CFF6B]" />
            <h3 className="text-sm font-semibold uppercase tracking-wider text-white">
              What Went Well
            </h3>
          </div>

          <ul className="space-y-3 pt-2">
            {positives.map((pos, idx) => (
              <li key={idx} className="flex items-start gap-3 text-sm text-zinc-200">
                <span className="w-1.5 h-1.5 rounded-full bg-[#7CFF6B] mt-2 flex-shrink-0" />
                <span className="leading-relaxed">{pos}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* FOCUS NEXT TIME */}
        <div className="p-8 rounded-2xl bg-[#111111] border border-[#1e1e1e] space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-[#181818]">
            <AlertCircle className="w-4 h-4 text-[#FFB84D]" />
            <h3 className="text-sm font-semibold uppercase tracking-wider text-white">
              Focus Next Time
            </h3>
          </div>

          <ul className="space-y-3 pt-2">
            {improvements.map((imp, idx) => (
              <li key={idx} className="flex items-start gap-3 text-sm text-zinc-200">
                <span className="w-1.5 h-1.5 rounded-full bg-[#FFB84D] mt-2 flex-shrink-0" />
                <span className="leading-relaxed">{imp}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* AI Coach Takeaway Banner */}
      <div className="p-6 rounded-2xl bg-[#141414] border border-[#222222] flex items-start gap-4">
        <div className="p-2.5 rounded-xl bg-[#181818] border border-[#262626] text-[#C8FF3D] flex-shrink-0">
          <Sparkles className="w-5 h-5" />
        </div>
        <div>
          <span className="text-xs font-semibold uppercase tracking-wider text-[#C8FF3D]">
            Sports Scientist Analysis
          </span>
          <p className="text-sm text-white mt-1 leading-relaxed">
            {workout?.ai_summary ||
              `High-tier session on ${exerciseName}. Movement cadence and joint tracking remained within elite athletic parameters across all sets.`}
          </p>
        </div>
      </div>

      {/* Actions */}
      <div className="flex flex-wrap items-center justify-between gap-4 pt-6 border-t border-[#181818]">
        <button
          onClick={() => {
            onSelectExercise(workout?.exercise_slug || 'squat');
            onNavigate('live');
          }}
          className="inline-flex items-center gap-2 bg-[#181818] hover:bg-[#222222] border border-[#2a2a2a] text-white font-semibold text-xs tracking-wider uppercase px-6 py-3.5 rounded-xl transition-all cursor-pointer"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Repeat This Session</span>
        </button>

        <div className="flex items-center gap-3">
          <button
            onClick={() => onNavigate('progress')}
            className="inline-flex items-center gap-2 bg-[#181818] hover:bg-[#222222] border border-[#2a2a2a] text-white font-semibold text-xs tracking-wider uppercase px-6 py-3.5 rounded-xl transition-all cursor-pointer"
          >
            <span>View Progress</span>
          </button>
          <button
            onClick={() => onNavigate('dashboard')}
            className="inline-flex items-center gap-2 bg-[#C8FF3D] hover:bg-[#bbf030] text-black font-semibold text-xs tracking-wider uppercase px-6 py-3.5 rounded-xl transition-all shadow-md active:scale-95 cursor-pointer"
          >
            <span>Return to Dashboard</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
