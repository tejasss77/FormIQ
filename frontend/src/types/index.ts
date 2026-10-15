export interface User {
  id: number;
  email: string;
  full_name: string;
  is_active: boolean;
  created_at: string;
  avatar_url?: string;
  bio?: string;
  handle?: string;
  height?: string;
  weight?: string;
  discipline?: string;
  wingspan?: string;
  tier?: string;
}

export interface Exercise {
  id: number;
  slug: string;
  name: string;
  category: string;
  difficulty: string;
  primary_muscles: string;
  description: string;
  instructions: string[];
  key_metrics: string[];
  camera_view: string;
  thumbnail_url?: string;
}

export interface RepData {
  rep_number: number;
  form_score: number;
  duration_seconds: number;
  rom_percentage: number;
  tempo_seconds: number;
  stability_score: number;
  symmetry_score: number;
  violations: string[];
  technique_score?: number;
}

export interface WorkoutSet {
  id?: number;
  set_number: number;
  reps_completed: number;
  target_reps: number;
  avg_form_score: number;
}

export interface WorkoutFeedback {
  id?: number;
  feedback_text: string;
  category: string;
  spoken: number;
  timestamp?: string;
}

export interface Workout {
  id: number;
  user_id: number;
  title: string;
  exercise_slug: string;
  duration_seconds: number;
  total_reps: number;
  overall_form_score: number;
  technique_score: number;
  rom_score: number;
  stability_score: number;
  tempo_score: number;
  status: string;
  summary_positives: string[];
  summary_improvements: string[];
  ai_summary?: string;
  started_at: string;
  completed_at?: string;
  sets?: WorkoutSet[];
  reps?: RepData[];
  feedbacks?: WorkoutFeedback[];
}

export interface ProgressSummary {
  overall_form_score: number;
  form_score_change_pct: number;
  weekly_workouts_count: number;
  total_reps: number;
  total_training_minutes: number;
  trend: {
    date: string;
    form_score: number;
    reps: number;
    duration_minutes: number;
  }[];
  exercise_breakdown: {
    slug: string;
    name: string;
    total_reps: number;
    avg_form_score: number;
    workouts_count: number;
  }[];
  recent_streaks: number;
}

export interface LiveMetrics {
  knee_angle?: number;
  left_knee_angle?: number;
  right_knee_angle?: number;
  hip_angle?: number;
  torso_angle?: number;
  torso_sway?: number;
  elbow_angle?: number;
  lead_knee_angle?: number;
  depth_status?: string;
  knee_alignment?: string;
  back_angle?: string;
  alignment_status?: string;
  balance_status?: string;
  rom_percentage?: number;
  tempo_seconds?: number;
  symmetry_score?: number;
  rep_phase?: string;
  reps_count?: number;
  form_score?: number;
  active_violations?: string[];
}

export interface CoachingMessage {
  text: string;
  spoken: boolean;
  category: string;
  rep?: number;
  form_score?: number;
}
