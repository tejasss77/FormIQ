import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ShieldCheck, Lock, Mail, KeyRound, ArrowLeft, CheckCircle2, ShieldAlert } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { api } from '../api/client';

interface LoginPageProps {
  onNavigate: (tab: string) => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({ onNavigate }) => {
  const { login, demoLogin, isLoading } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);

  // 2FA Verification Step State
  const [step, setStep] = useState<'credentials' | '2fa'>('credentials');
  const [twoFactorCode, setTwoFactorCode] = useState('');
  const [isVerifying2FA, setIsVerifying2FA] = useState(false);
  const [is2FASuccess, setIs2FASuccess] = useState(false);

  const handleSubmitCredentials = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    try {
      // Check if 2FA is active on this device / athlete
      const is2FAEnabled = localStorage.getItem('formiq_2fa_enabled') === 'true';
      const totpSecret = localStorage.getItem('formiq_2fa_secret');

      if (is2FAEnabled && totpSecret) {
        // Intercept: Require 6-digit Google Authenticator 2FA Verification
        setIsVerifying2FA(true);
        // Verify credentials with backend first
        await login(email, password);
        // Do not redirect to dashboard yet! Transition to 2FA verification step
        setIsVerifying2FA(false);
        setStep('2fa');
        return;
      }

      // If 2FA is not enabled, log in directly
      await login(email, password);
      onNavigate('dashboard');
    } catch (err: any) {
      setError(err.message || 'Authentication failed. Please check your credentials.');
      setIsVerifying2FA(false);
    }
  };

  const handleVerify2FACode = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const cleanCode = twoFactorCode.trim().replace(/\s+/g, '');
    if (cleanCode.length !== 6 || !/^\d+$/.test(cleanCode)) {
      setError('Please enter a valid 6-digit numeric verification code.');
      return;
    }

    setIsVerifying2FA(true);
    const totpSecret = localStorage.getItem('formiq_2fa_secret') || '';

    try {
      // Validate code against backend TOTP engine
      await api.verify2FALogin(totpSecret, cleanCode);

      // 2FA code is authorized!
      setIs2FASuccess(true);
      setTimeout(() => {
        onNavigate('dashboard');
      }, 1000);
    } catch (err: any) {
      setError(err.message || 'Invalid 6-digit code. Please verify the code in Google Authenticator.');
    } finally {
      setIsVerifying2FA(false);
    }
  };

  const handleDemo = async () => {
    setError(null);
    await demoLogin();
    onNavigate('dashboard');
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
        {/* Brand Header */}
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

          {step === 'credentials' ? (
            <>
              <h2 className="text-2xl sm:text-3xl font-display font-bold text-white tracking-tight">Athlete Sign In</h2>
              <p className="text-sm text-zinc-400 mt-2 leading-relaxed">Access your optical biomechanics command center.</p>
            </>
          ) : (
            <>
              <div className="w-12 h-12 rounded-2xl bg-[#C8FF3D]/10 border border-[#C8FF3D]/30 flex items-center justify-center mx-auto mb-3 text-[#C8FF3D]">
                <KeyRound className="w-6 h-6 text-[#C8FF3D]" />
              </div>
              <h2 className="text-2xl font-display font-bold text-white tracking-tight">Two-Factor Authentication</h2>
              <p className="text-xs text-zinc-400 mt-1.5 leading-relaxed max-w-xs mx-auto">
                Google Authenticator 2FA is active. Enter the 6-digit code for <span className="text-white font-medium">{email || 'athlete@formiq.com'}</span>.
              </p>
            </>
          )}
        </div>

        {error && (
          <div className="p-3 mb-6 rounded-xl bg-[#FF5C5C]/10 border border-[#FF5C5C]/30 text-xs font-medium text-[#FF5C5C] flex items-center gap-2">
            <ShieldAlert className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {is2FASuccess && (
          <div className="p-3 mb-6 rounded-xl bg-[#7CFF6B]/10 border border-[#7CFF6B]/30 text-xs font-medium text-[#7CFF6B] flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>Two-Factor code validated! Authorizing command center...</span>
          </div>
        )}

        {/* STEP 1: Email & Password Credentials */}
        {step === 'credentials' && (
          <form onSubmit={handleSubmitCredentials} className="space-y-4">
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
              disabled={isLoading || isVerifying2FA}
              className="w-full py-3.5 rounded-xl bg-[#C8FF3D] hover:bg-[#bbf030] text-zinc-950 font-bold text-sm tracking-wide transition-all shadow-md active:scale-95 mt-2 cursor-pointer disabled:opacity-50"
            >
              {isLoading || isVerifying2FA ? 'Verifying Account...' : 'Sign In'}
            </button>

            <div className="my-6 flex items-center gap-3">
              <div className="flex-1 h-px bg-[#1e1e1e]" />
              <span className="text-xs font-semibold uppercase tracking-wider text-zinc-500">or</span>
              <div className="flex-1 h-px bg-[#1e1e1e]" />
            </div>

            {/* Instant Demo Access Button */}
            <button
              type="button"
              onClick={handleDemo}
              className="w-full py-3.5 rounded-xl bg-[#181818] hover:bg-[#222222] border border-[#2a2a2a] text-xs font-semibold uppercase tracking-wider text-zinc-200 hover:text-white transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <ShieldCheck className="w-4 h-4 text-[#C8FF3D]" />
              <span>Instant Demo Access (Pro Athlete)</span>
            </button>

            <p className="text-center text-xs text-zinc-400 mt-6 leading-relaxed">
              Don't have an account?{' '}
              <button
                type="button"
                onClick={() => onNavigate('register')}
                className="text-[#C8FF3D] hover:underline font-semibold ml-1 cursor-pointer"
              >
                Create Athlete Profile
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
          </form>
        )}

        {/* STEP 2: Strict Two-Factor Authentication Prompt */}
        {step === '2fa' && (
          <motion.form
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            onSubmit={handleVerify2FACode}
            className="space-y-5"
          >
            <div>
              <label className="block text-xs font-semibold text-zinc-300 uppercase tracking-wider text-center mb-2">
                6-Digit Security Token
              </label>
              <input
                type="text"
                autoFocus
                maxLength={6}
                value={twoFactorCode}
                onChange={(e) => setTwoFactorCode(e.target.value.replace(/\D/g, ''))}
                placeholder="000 000"
                className="w-full py-4 text-center text-3xl font-mono font-bold tracking-[0.35em] text-[#C8FF3D] rounded-xl bg-[#141414] border border-[#2a2a2a] focus:outline-none focus:border-[#C8FF3D] transition-colors"
              />
              <span className="text-[11px] text-zinc-500 text-center block mt-2">
                Time-based one-time password regenerates every 30 seconds.
              </span>
            </div>

            <button
              type="submit"
              disabled={isVerifying2FA || is2FASuccess || twoFactorCode.length !== 6}
              className="w-full py-3.5 rounded-xl bg-[#C8FF3D] hover:bg-[#bbf030] text-zinc-950 font-bold text-sm tracking-wide transition-all shadow-md active:scale-95 cursor-pointer disabled:opacity-50"
            >
              {isVerifying2FA ? 'Verifying TOTP Token...' : 'Authorize & Launch'}
            </button>

            <button
              type="button"
              onClick={() => {
                setStep('credentials');
                setError(null);
                setTwoFactorCode('');
              }}
              className="w-full py-2.5 text-xs font-semibold text-zinc-400 hover:text-white flex items-center justify-center gap-1.5 cursor-pointer transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back to credentials</span>
            </button>
          </motion.form>
        )}
      </motion.div>
    </div>
  );
};
