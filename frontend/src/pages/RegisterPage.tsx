import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { User, Mail, Lock, ArrowLeft } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

interface RegisterPageProps {
  onNavigate: (tab: string) => void;
}

export const RegisterPage: React.FC<RegisterPageProps> = ({ onNavigate }) => {
  const { register, isLoading } = useAuth();
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    try {
      await register(email, password, fullName);
      onNavigate('dashboard');
    } catch (err: any) {
      setError(err.message || 'Registration failed');
    }
  };

  return (
    <div className="min-h-screen bg-[#090909] text-zinc-100 flex items-center justify-center p-6 relative overflow-hidden">
      <div className="absolute inset-0 hud-grid opacity-20 pointer-events-none" />

      {/* Back to Home Button */}
      <button
        type="button"
        onClick={() => onNavigate('landing')}
        className="fixed top-6 left-6 z-20 inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-zinc-400 hover:text-white bg-[#141414]/90 hover:bg-[#1f1f1f] border border-[#262626] hover:border-[#383838] px-4 py-2.5 rounded-xl transition-all shadow-md active:scale-95 cursor-pointer backdrop-blur-sm group"
        title="Return to Landing Page"
      >
        <ArrowLeft className="w-4 h-4 text-zinc-400 group-hover:text-[#C8FF3D] transition-colors" />
        <span>Back to Home</span>
      </button>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md bg-[#111111] border border-[#1e1e1e] p-8 sm:p-10 rounded-2xl shadow-2xl relative z-10"
      >
        <div className="text-center mb-8">
          <div 
            onClick={() => onNavigate('landing')} 
            className="inline-flex items-center gap-3 cursor-pointer mb-4 group"
            title="FormiQ Home"
            role="button"
            tabIndex={0}
            onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') onNavigate('landing'); }}
          >
            <div className="w-10 h-10 rounded-xl bg-[#181818] border border-[#262626] p-0.5 flex items-center justify-center group-hover:border-[#C8FF3D]/50 transition-all shadow-md">
              <img src="/logo-icon.png" alt="FORMIQ" className="w-full h-full object-contain rounded-lg" />
            </div>
            <span className="font-display text-2xl font-bold tracking-tight text-white">FORMIQ</span>
            <span className="w-2 h-2 rounded-full bg-[#C8FF3D]" />
          </div>
          <h2 className="text-2xl sm:text-3xl font-display font-bold text-white tracking-tight">Create Athlete Profile</h2>
          <p className="text-sm text-zinc-400 mt-2 leading-relaxed">Begin computer-vision movement telemetry and form coaching.</p>
        </div>

        {error && (
          <div className="p-3 mb-6 rounded-xl bg-[#FF5C5C]/10 border border-[#FF5C5C]/30 text-xs font-medium text-[#FF5C5C]">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-zinc-300 uppercase tracking-wider mb-1.5">
              Full Name
            </label>
            <div className="relative">
              <User className="w-4 h-4 text-zinc-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Marcus Vance"
                className="w-full pl-10 pr-4 py-3 rounded-xl bg-[#141414] border border-[#222222] text-sm text-white placeholder:text-zinc-600 focus:outline-none focus:border-[#C8FF3D] transition-colors"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-zinc-300 uppercase tracking-wider mb-1.5">
              Email Address
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-zinc-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="athlete@formiq.com"
                className="w-full pl-10 pr-4 py-3 rounded-xl bg-[#141414] border border-[#222222] text-sm text-white placeholder:text-zinc-600 focus:outline-none focus:border-[#C8FF3D] transition-colors"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-zinc-300 uppercase tracking-wider mb-1.5">
              Password
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-zinc-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-10 pr-4 py-3 rounded-xl bg-[#141414] border border-[#222222] text-sm text-white placeholder:text-zinc-600 focus:outline-none focus:border-[#C8FF3D] transition-colors"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3.5 rounded-xl bg-[#C8FF3D] hover:bg-[#bbf030] text-zinc-950 font-bold text-sm tracking-wide transition-all shadow-md active:scale-95 mt-2 cursor-pointer"
          >
            {isLoading ? 'Creating Account...' : 'Create Account'}
          </button>
        </form>

        <p className="text-center text-xs text-zinc-400 mt-6 leading-relaxed">
          Already registered?{' '}
          <button
            onClick={() => onNavigate('login')}
            className="text-[#C8FF3D] hover:underline font-semibold ml-1 cursor-pointer"
          >
            Sign In Here
          </button>
        </p>

        <div className="pt-4 mt-4 border-t border-[#1c1c1c] text-center">
          <button
            type="button"
            onClick={() => onNavigate('landing')}
            className="inline-flex items-center gap-1.5 text-xs text-zinc-400 hover:text-white transition-colors cursor-pointer group"
          >
            <ArrowLeft className="w-3.5 h-3.5 text-zinc-500 group-hover:text-[#C8FF3D] transition-colors" />
            <span>Return to Landing Page</span>
          </button>
        </div>
      </motion.div>
    </div>
  );
};
