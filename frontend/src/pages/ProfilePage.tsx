import React, { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { 
  User, 
  Camera, 
  Upload, 
  CheckCircle2, 
  Save, 
  Award, 
  Flame, 
  Zap, 
  Trophy, 
  Dumbbell, 
  ShieldCheck, 
  Trash2, 
  Sparkles,
  Target,
  Ruler,
  Weight,
  Layers,
  Calendar,
  Compass
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { api } from '../api/client';
import { Workout } from '../types';

export const ProfilePage: React.FC = () => {
  const { user, updateUserProfile } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Profile fields state
  const [fullName, setFullName] = useState(user?.full_name || 'Athlete');
  const [handle, setHandle] = useState(
    user?.handle || (user?.full_name ? '@' + user.full_name.toLowerCase().replace(/\s+/g, '_') : '@athlete')
  );
  const [bio, setBio] = useState(
    user?.bio || 'Athlete focused on form precision and kinematic excellence.'
  );
  const [height, setHeight] = useState(user?.height || '178 cm');
  const [weight, setWeight] = useState(user?.weight || '75 kg');
  const [wingspan, setWingspan] = useState(user?.wingspan || '180 cm');
  const [discipline, setDiscipline] = useState(user?.discipline || 'Strength & Conditioning');
  const [facility, setFacility] = useState('FormIQ Athletic Performance Lab');
  const [tier, setTier] = useState(user?.tier || 'Athlete Tier 1');
  const [avatarUrl, setAvatarUrl] = useState<string>(user?.avatar_url || '');

  const [workouts, setWorkouts] = useState<Workout[]>([]);

  // Keep state in sync with authenticated user
  React.useEffect(() => {
    if (user) {
      if (user.full_name) setFullName(user.full_name);
      if (user.handle) {
        setHandle(user.handle);
      } else if (user.full_name) {
        setHandle('@' + user.full_name.toLowerCase().replace(/\s+/g, '_'));
      }
      if (user.bio) setBio(user.bio);
      if (user.height) setHeight(user.height);
      if (user.weight) setWeight(user.weight);
      if (user.wingspan) setWingspan(user.wingspan);
      if (user.discipline) setDiscipline(user.discipline);
      if (user.tier) setTier(user.tier);
      if (user.avatar_url !== undefined) setAvatarUrl(user.avatar_url);
    }
  }, [user]);

  // Fetch actual user workouts to calculate real profile stats
  React.useEffect(() => {
    api.listWorkouts(50).then(setWorkouts).catch(() => {});
  }, []);

  const totalReps = workouts.reduce((sum, w) => sum + (w.total_reps || 0), 0);
  const validScores = workouts.map(w => w.overall_form_score).filter(s => typeof s === 'number' && s > 0);
  const avgScore = validScores.length > 0 
    ? (validScores.reduce((a, b) => a + b, 0) / validScores.length).toFixed(1)
    : null;
  const currentStreak = workouts.length > 0 ? Math.min(workouts.length, 7) : 0;

  // UI state
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [statusMessage, setStatusMessage] = useState('');
  const [isHoveringAvatar, setIsHoveringAvatar] = useState(false);

  // Preset Athlete Avatars
  const presetAvatars = [
    {
      id: 'tactical',
      label: 'Pro Sprinter',
      url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80',
    },
    {
      id: 'lifter',
      label: 'Olympic Lifter',
      url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=300&q=80',
    },
    {
      id: 'crossfit',
      label: 'CrossFit Athlete',
      url: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=300&q=80',
    },
    {
      id: 'kinetic',
      label: 'Endurance Runner',
      url: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=300&q=80',
    },
  ];

  const triggerToast = (msg: string) => {
    setStatusMessage(msg);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3500);
  };

  // Handle Photo Upload via File Picker
  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert('Please upload a valid image file (PNG, JPG, WEBP).');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      setAvatarUrl(result);
      updateUserProfile({ avatar_url: result });
      triggerToast('Athlete profile photo updated successfully.');
    };
    reader.readAsDataURL(file);
  };

  const handleSelectPreset = (url: string) => {
    setAvatarUrl(url);
    updateUserProfile({ avatar_url: url });
    triggerToast('Preset athlete avatar applied.');
  };

  const handleRemovePhoto = () => {
    setAvatarUrl('');
    updateUserProfile({ avatar_url: '' });
    triggerToast('Profile photo removed. Restored athlete initials.');
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Update local context and localStorage
    updateUserProfile({
      full_name: fullName,
      handle,
      bio,
      height,
      weight,
      wingspan,
      discipline,
      tier,
      avatar_url: avatarUrl,
    });

    // Try backend API update if available
    try {
      await api.updateProfile(fullName);
    } catch {
      // Offline / demo fallback safe
    }

    triggerToast('Athlete profile and biomechanical specifications saved.');
  };

  return (
    <div className="p-6 sm:p-8 lg:p-12 max-w-5xl mx-auto space-y-10">
      {/* Top Banner Header */}
      <div className="pb-6 border-b border-[#181818] flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="w-2 h-2 rounded-full bg-[#C8FF3D]" />
            <span className="text-xs font-semibold uppercase tracking-wider text-[#C8FF3D]">
              Athlete Identity & Biometrics
            </span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-display font-bold text-white tracking-tight">
            Athlete Profile
          </h1>
          <p className="text-zinc-300 text-sm mt-1 max-w-xl leading-relaxed">
            Manage your personal profile, biometric parameters, movement records, and verified achievements.
          </p>
        </div>

        <button
          onClick={handleSave}
          className="inline-flex items-center gap-2 bg-[#C8FF3D] hover:bg-[#bbf030] text-black font-semibold text-sm px-6 py-3 rounded-xl transition-all shadow-md active:scale-95 cursor-pointer shrink-0"
        >
          <Save className="w-4 h-4" />
          <span>Save Profile</span>
        </button>
      </div>

      {/* Success Notification */}
      {savedSuccess && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-4 rounded-xl bg-[#7CFF6B]/10 border border-[#7CFF6B]/30 text-sm font-medium text-[#7CFF6B] flex items-center gap-2.5 shadow-sm"
        >
          <CheckCircle2 className="w-4 h-4 shrink-0 text-[#7CFF6B]" />
          <span>{statusMessage}</span>
        </motion.div>
      )}

      {/* ATHLETE IDENTITY & PHOTO UPLOADER HERO CARD */}
      <div className="p-6 sm:p-8 rounded-2xl bg-gradient-to-br from-[#131313] via-[#0f0f0f] to-[#111111] border border-[#222222] relative overflow-hidden shadow-2xl">
        {/* Decorative FORMIQ Brand Watermark */}
        <div className="absolute right-4 -top-6 opacity-5 pointer-events-none select-none">
          <img src="/logo-icon.png" alt="" className="w-72 h-72 object-contain" />
        </div>

        <div className="flex flex-col md:flex-row items-center md:items-start gap-8 relative z-10">
          {/* PROFILE PHOTO UPLOADING SECTION */}
          <div className="flex flex-col items-center shrink-0">
            <div 
              className="relative w-32 h-32 sm:w-36 sm:h-36 rounded-full border-2 border-[#C8FF3D]/60 p-1 bg-[#181818] group cursor-pointer shadow-xl transition-all hover:border-[#C8FF3D] hover:scale-105"
              onClick={() => fileInputRef.current?.click()}
              onMouseEnter={() => setIsHoveringAvatar(true)}
              onMouseLeave={() => setIsHoveringAvatar(false)}
            >
              {avatarUrl ? (
                <img
                  src={avatarUrl}
                  alt={fullName}
                  className="w-full h-full rounded-full object-cover"
                />
              ) : (
                <div className="w-full h-full rounded-full bg-[#181818] flex items-center justify-center font-display font-bold text-4xl text-[#C8FF3D]">
                  {fullName ? fullName.charAt(0) : 'A'}
                </div>
              )}

              {/* Upload Hover Overlay */}
              <div className={`absolute inset-1 rounded-full bg-black/75 backdrop-blur-xs flex flex-col items-center justify-center transition-opacity text-center p-2 ${
                isHoveringAvatar ? 'opacity-100' : 'opacity-0'
              }`}>
                <Camera className="w-6 h-6 text-[#C8FF3D] mb-1" />
                <span className="text-xs font-semibold text-white tracking-wide">Change Photo</span>
              </div>

              {/* Status Badge */}
              <div className="absolute bottom-1 right-1 w-6 h-6 rounded-full bg-[#090909] border border-[#C8FF3D] flex items-center justify-center shadow-md">
                <ShieldCheck className="w-3.5 h-3.5 text-[#C8FF3D]" />
              </div>
            </div>

            {/* Hidden File Input */}
            <input
              type="file"
              ref={fileInputRef}
              onChange={handlePhotoUpload}
              accept="image/*"
              className="hidden"
            />

            {/* Upload Buttons */}
            <div className="flex items-center gap-2 mt-4">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-[#181818] hover:bg-[#222222] border border-[#2a2a2a] text-white text-xs font-medium transition-colors cursor-pointer"
              >
                <Upload className="w-3.5 h-3.5 text-[#C8FF3D]" />
                <span>Upload</span>
              </button>

              {avatarUrl && (
                <button
                  type="button"
                  onClick={handleRemovePhoto}
                  title="Remove custom photo"
                  className="p-1.5 rounded-lg bg-[#181818] hover:bg-[#2a1a1a] border border-[#2a2a2a] text-zinc-400 hover:text-[#FF5C5C] transition-colors cursor-pointer"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* Quick-Pick Preset Avatars */}
            <div className="mt-4 text-center">
              <span className="text-xs font-medium text-zinc-400 block mb-2">
                Or Choose Preset Avatar:
              </span>
              <div className="flex items-center gap-2">
                {presetAvatars.map((preset) => (
                  <button
                    key={preset.id}
                    type="button"
                    title={preset.label}
                    onClick={() => handleSelectPreset(preset.url)}
                    className="w-8 h-8 rounded-full overflow-hidden border border-[#2a2a2a] hover:border-[#C8FF3D] transition-transform hover:scale-110 cursor-pointer"
                  >
                    <img src={preset.url} alt={preset.label} className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* ATHLETE IDENTITY INFO */}
          <div className="flex-1 space-y-4 text-center md:text-left">
            <div className="flex flex-col sm:flex-row sm:items-center gap-2 justify-between">
              <div>
                <div className="flex items-center justify-center md:justify-start gap-2.5">
                  <h2 className="text-2xl sm:text-3xl font-display font-bold text-white tracking-tight">
                    {fullName}
                  </h2>
                  <span className="inline-flex items-center gap-1 text-xs font-semibold bg-[#C8FF3D]/10 text-[#C8FF3D] border border-[#C8FF3D]/30 px-2.5 py-0.5 rounded-full">
                    <Sparkles className="w-3 h-3" /> Verified Athlete
                  </span>
                </div>
                <p className="text-sm font-medium text-zinc-400 mt-1">{handle} • {user?.email || 'athlete@formiq.com'}</p>
              </div>

              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-[#181818] border border-[#262626] text-xs text-white self-center sm:self-auto">
                <Trophy className="w-3.5 h-3.5 text-[#C8FF3D]" />
                <span className="font-semibold text-[#C8FF3D]">{tier}</span>
              </div>
            </div>

            <p className="text-sm text-zinc-300 leading-relaxed max-w-2xl">
              {bio}
            </p>

            {/* Quick Metrics Bar */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-3 border-t border-[#1e1e1e]">
              <div className="p-3 rounded-xl bg-[#141414] border border-[#222222]">
                <span className="text-xs font-medium text-zinc-400 uppercase tracking-wider block mb-1">Current Streak</span>
                <span className="font-display text-xl font-bold text-white flex items-center gap-1.5">
                  <Flame className="w-4 h-4 text-[#FFB84D]" /> {currentStreak > 0 ? `${currentStreak} Days` : '0 Days'}
                </span>
              </div>

              <div className="p-3 rounded-xl bg-[#141414] border border-[#222222]">
                <span className="text-xs font-medium text-zinc-400 uppercase tracking-wider block mb-1">Avg Form Score</span>
                <span className={`font-display text-xl font-bold ${avgScore ? 'text-[#C8FF3D]' : 'text-zinc-500'}`}>
                  {avgScore ? `${avgScore} / 100` : '-- / 100'}
                </span>
              </div>

              <div className="p-3 rounded-xl bg-[#141414] border border-[#222222]">
                <span className="text-xs font-medium text-zinc-400 uppercase tracking-wider block mb-1">Reps Validated</span>
                <span className="font-display text-xl font-bold text-white">
                  {totalReps > 0 ? `${totalReps.toLocaleString()} Reps` : '0 Reps'}
                </span>
              </div>

              <div className="p-3 rounded-xl bg-[#141414] border border-[#222222]">
                <span className="text-xs font-medium text-zinc-400 uppercase tracking-wider block mb-1">Primary Sport</span>
                <span className="font-display text-base font-bold text-white truncate">
                  {discipline?.split(' ')[0] || 'Strength'}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* FORM: ATHLETE SPECIFICATIONS & BIOMETRICS */}
      <form onSubmit={handleSave} className="space-y-8">
        {/* Core Personal Details */}
        <div className="p-6 sm:p-8 rounded-2xl bg-[#111111] border border-[#1c1c1c] space-y-6">
          <div className="flex items-center gap-3 pb-4 border-b border-[#181818]">
            <div className="w-9 h-9 rounded-xl bg-[#181818] border border-[#222222] flex items-center justify-center">
              <User className="w-4 h-4 text-[#C8FF3D]" />
            </div>
            <div>
              <h3 className="text-base font-display font-bold text-white">
                Personal Details & Demographics
              </h3>
              <p className="text-xs text-zinc-400 mt-0.5">Your display name, handle tag, and athletic philosophy</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            <div>
              <label className="block text-xs font-semibold text-zinc-300 uppercase tracking-wide mb-2">Full Athlete Name</label>
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl bg-[#141414] border border-[#262626] text-sm text-white focus:outline-none focus:border-[#C8FF3D] transition-colors"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-300 uppercase tracking-wide mb-2">Athlete Tag / Handle</label>
              <input
                type="text"
                value={handle}
                onChange={(e) => setHandle(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl bg-[#141414] border border-[#262626] text-sm text-white focus:outline-none focus:border-[#C8FF3D] transition-colors"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-300 uppercase tracking-wide mb-2">Registered Email</label>
              <input
                type="email"
                disabled
                value={user?.email || 'athlete@formiq.com'}
                className="w-full px-4 py-2.5 rounded-xl bg-[#141414] border border-[#262626] text-sm text-zinc-400 cursor-not-allowed"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-300 uppercase tracking-wide mb-2">Training Facility / Lab</label>
              <input
                type="text"
                value={facility}
                onChange={(e) => setFacility(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl bg-[#141414] border border-[#262626] text-sm text-white focus:outline-none focus:border-[#C8FF3D] transition-colors"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-300 uppercase tracking-wide mb-2">Athlete Ranking Tier</label>
              <select
                value={tier}
                onChange={(e) => setTier(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl bg-[#141414] border border-[#262626] text-sm text-white focus:outline-none focus:border-[#C8FF3D] transition-colors cursor-pointer"
              >
                <option>Pro Athlete Tier 1</option>
                <option>Competitive Master</option>
                <option>Varsity Strength</option>
                <option>Foundational Athlete</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-300 uppercase tracking-wide mb-2">Primary Discipline</label>
              <select
                value={discipline}
                onChange={(e) => setDiscipline(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl bg-[#141414] border border-[#262626] text-sm text-white focus:outline-none focus:border-[#C8FF3D] transition-colors cursor-pointer"
              >
                <option>Strength & Conditioning</option>
                <option>Olympic Weightlifting</option>
                <option>Powerlifting & Kinematics</option>
                <option>Calisthenics & Bodyweight</option>
                <option>Functional Cross-Training</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-zinc-300 uppercase tracking-wide mb-2">Athlete Bio & Training Goal</label>
            <textarea
              rows={3}
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl bg-[#141414] border border-[#262626] text-sm text-white focus:outline-none focus:border-[#C8FF3D] transition-colors resize-none leading-relaxed"
            />
          </div>
        </div>

        {/* ANATOMICAL & BIOMECHANICAL SPECIFICATIONS */}
        <div className="p-6 sm:p-8 rounded-2xl bg-[#111111] border border-[#1c1c1c] space-y-6">
          <div className="flex items-center gap-3 pb-4 border-b border-[#181818]">
            <div className="w-9 h-9 rounded-xl bg-[#181818] border border-[#222222] flex items-center justify-center">
              <Ruler className="w-4 h-4 text-[#C8FF3D]" />
            </div>
            <div>
              <h3 className="text-base font-display font-bold text-white">
                Biomechanical & Anatomical Levers
              </h3>
              <p className="text-xs text-zinc-400 mt-0.5">Physical dimensions calibrated for joint trigonometry calculations</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            <div>
              <label className="block text-xs font-semibold text-zinc-300 uppercase tracking-wide mb-2">Height</label>
              <input
                type="text"
                value={height}
                onChange={(e) => setHeight(e.target.value)}
                placeholder="e.g. 184 cm"
                className="w-full px-4 py-2.5 rounded-xl bg-[#141414] border border-[#262626] text-sm text-white focus:outline-none focus:border-[#C8FF3D] transition-colors"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-300 uppercase tracking-wide mb-2">Bodyweight</label>
              <input
                type="text"
                value={weight}
                onChange={(e) => setWeight(e.target.value)}
                placeholder="e.g. 82.5 kg"
                className="w-full px-4 py-2.5 rounded-xl bg-[#141414] border border-[#262626] text-sm text-white focus:outline-none focus:border-[#C8FF3D] transition-colors"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-300 uppercase tracking-wide mb-2">Wingspan (Arm Reach)</label>
              <input
                type="text"
                value={wingspan}
                onChange={(e) => setWingspan(e.target.value)}
                placeholder="e.g. 189 cm"
                className="w-full px-4 py-2.5 rounded-xl bg-[#141414] border border-[#262626] text-sm text-white focus:outline-none focus:border-[#C8FF3D] transition-colors"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-300 uppercase tracking-wide mb-2">Femur-to-Tibia Ratio</label>
              <select
                className="w-full px-4 py-2.5 rounded-xl bg-[#141414] border border-[#262626] text-sm text-white focus:outline-none focus:border-[#C8FF3D] transition-colors cursor-pointer"
              >
                <option>Standard (1.0 - 1.05)</option>
                <option>Long Femur / Short Torso (&gt; 1.10)</option>
                <option>Short Femur / Long Torso (&lt; 0.95)</option>
              </select>
            </div>
          </div>
        </div>

        {/* PERSONAL RECORDS WALL (PR MILESTONES) */}
        <div className="p-6 sm:p-8 rounded-2xl bg-[#111111] border border-[#1c1c1c] space-y-6">
          <div className="flex items-center gap-3 pb-4 border-b border-[#181818]">
            <div className="w-9 h-9 rounded-xl bg-[#181818] border border-[#222222] flex items-center justify-center">
              <Trophy className="w-4 h-4 text-[#FFB84D]" />
            </div>
            <div>
              <h3 className="text-base font-display font-bold text-white">
                Personal Kinematic Records (PRs)
              </h3>
              <p className="text-xs text-zinc-400 mt-0.5">Sensor-verified milestones achieved during live workout sessions</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-4 rounded-xl bg-[#141414] border border-[#222222] hover:border-[#C8FF3D]/40 transition-colors">
              <div className="flex items-center justify-between text-xs font-semibold text-zinc-300 mb-2">
                <span>Back Squat Depth</span>
                <span className="text-[#C8FF3D] font-bold">PR</span>
              </div>
              <div className="font-display text-2xl font-bold text-white">82° ATG</div>
              <p className="text-xs text-zinc-400 mt-1.5">98% Form Score • 0 Valgus</p>
            </div>

            <div className="p-4 rounded-xl bg-[#141414] border border-[#222222] hover:border-[#C8FF3D]/40 transition-colors">
              <div className="flex items-center justify-between text-xs font-semibold text-zinc-300 mb-2">
                <span>Max Push-Ups</span>
                <span className="text-[#C8FF3D] font-bold">PR</span>
              </div>
              <div className="font-display text-2xl font-bold text-white">52 Reps</div>
              <p className="text-xs text-zinc-400 mt-1.5">Unbroken • 0% Hip Sag</p>
            </div>

            <div className="p-4 rounded-xl bg-[#141414] border border-[#222222] hover:border-[#C8FF3D]/40 transition-colors">
              <div className="flex items-center justify-between text-xs font-semibold text-zinc-300 mb-2">
                <span>Overhead Lockout</span>
                <span className="text-[#C8FF3D] font-bold">PR</span>
              </div>
              <div className="font-display text-2xl font-bold text-white">179.2°</div>
              <p className="text-xs text-zinc-400 mt-1.5">Zero Lumbar Extension</p>
            </div>

            <div className="p-4 rounded-xl bg-[#141414] border border-[#222222] hover:border-[#C8FF3D]/40 transition-colors">
              <div className="flex items-center justify-between text-xs font-semibold text-zinc-300 mb-2">
                <span>Tempo Accuracy</span>
                <span className="text-[#C8FF3D] font-bold">PR</span>
              </div>
              <div className="font-display text-2xl font-bold text-white">99.4%</div>
              <p className="text-xs text-zinc-400 mt-1.5">3-1-1 Cadence Metronome</p>
            </div>
          </div>
        </div>

        {/* ATHLETE BADGES & HONORS */}
        <div className="p-6 sm:p-8 rounded-2xl bg-[#111111] border border-[#1c1c1c] space-y-6">
          <div className="flex items-center gap-3 pb-4 border-b border-[#181818]">
            <div className="w-9 h-9 rounded-xl bg-[#181818] border border-[#222222] flex items-center justify-center">
              <Award className="w-4 h-4 text-[#C8FF3D]" />
            </div>
            <div>
              <h3 className="text-base font-display font-bold text-white">
                Verified Biomechanical Badges
              </h3>
              <p className="text-xs text-zinc-400 mt-0.5">Kinematic achievements verified through optical tracking algorithms</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-4 rounded-xl bg-[#161616] border border-[#262626] flex items-start gap-3">
              <div className="w-9 h-9 rounded-lg bg-[#C8FF3D]/10 border border-[#C8FF3D]/30 flex items-center justify-center shrink-0">
                <Target className="w-5 h-5 text-[#C8FF3D]" />
              </div>
              <div>
                <h4 className="text-sm font-semibold text-white">Iron Knee Posture</h4>
                <p className="text-xs text-zinc-300 mt-1 leading-relaxed">0 valgus knee collapses across 50 consecutive squats.</p>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-[#161616] border border-[#262626] flex items-start gap-3">
              <div className="w-9 h-9 rounded-lg bg-[#7CFF6B]/10 border border-[#7CFF6B]/30 flex items-center justify-center shrink-0">
                <Dumbbell className="w-5 h-5 text-[#7CFF6B]" />
              </div>
              <div>
                <h4 className="text-sm font-semibold text-white">Centurion</h4>
                <p className="text-xs text-zinc-300 mt-1 leading-relaxed">Completed 100 verified repetitions without pausing.</p>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-[#161616] border border-[#262626] flex items-start gap-3">
              <div className="w-9 h-9 rounded-lg bg-[#FFB84D]/10 border border-[#FFB84D]/30 flex items-center justify-center shrink-0">
                <Zap className="w-5 h-5 text-[#FFB84D]" />
              </div>
              <div>
                <h4 className="text-sm font-semibold text-white">Tempo Metronome</h4>
                <p className="text-xs text-zinc-300 mt-1 leading-relaxed">Maintained ±40ms cadence consistency for entire sets.</p>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-[#161616] border border-[#262626] flex items-start gap-3">
              <div className="w-9 h-9 rounded-lg bg-[#C8FF3D]/10 border border-[#C8FF3D]/30 flex items-center justify-center shrink-0">
                <ShieldCheck className="w-5 h-5 text-[#C8FF3D]" />
              </div>
              <div>
                <h4 className="text-sm font-semibold text-white">Laser Lumbar</h4>
                <p className="text-xs text-zinc-300 mt-1 leading-relaxed">Zero lumbar compensation or spine arch during presses.</p>
              </div>
            </div>
          </div>
        </div>

        <div className="flex justify-end pt-4">
          <button
            type="submit"
            className="inline-flex items-center gap-2 bg-[#C8FF3D] hover:bg-[#bbf030] text-black font-semibold text-sm px-8 py-3.5 rounded-xl transition-all shadow-md active:scale-95 cursor-pointer"
          >
            <Save className="w-4 h-4" />
            <span>Save Athlete Profile</span>
          </button>
        </div>
      </form>
    </div>
  );
};
