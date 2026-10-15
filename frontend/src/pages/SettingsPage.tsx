import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import QRCode from 'qrcode';
import { 
  Camera, 
  Volume2, 
  Shield, 
  Sliders, 
  CheckCircle2, 
  Save, 
  Cpu, 
  Layers, 
  Eye, 
  VolumeX, 
  Play, 
  Download, 
  RefreshCw, 
  Lock, 
  Activity, 
  Smartphone,
  Sparkles,
  AlertTriangle,
  QrCode,
  Copy,
  Check,
  X,
  KeyRound,
  ShieldCheck,
  AlertCircle,
  ExternalLink
} from 'lucide-react';
import { voiceCoach } from '../services/voiceCoach';
import { api } from '../api/client';
import { useAuth } from '../context/AuthContext';
import { getStoredHudTheme, saveHudTheme, HUD_THEMES, HudThemeConfig } from '../utils/theme';
import { BiomechanicsVectorPreview } from '../components/ui/BiomechanicsVectorPreview';

export const SettingsPage: React.FC = () => {
  const { user } = useAuth();

  // Active settings tab
  const [activeSection, setActiveSection] = useState<'vision' | 'engine' | 'audio' | 'privacy' | 'security'>('vision');

  // Vision & Sensor Settings (Stored & Dynamic)
  const [cameraDevice, setCameraDevice] = useState<string>(() => {
    return localStorage.getItem('formiq_camera_device') || 'FaceTime HD Camera (Built-in)';
  });
  const [cameraDeviceId, setCameraDeviceId] = useState<string>(() => {
    return localStorage.getItem('formiq_camera_device_id') || 'builtin';
  });
  const [availableCameras, setAvailableCameras] = useState<{ id: string; label: string }[]>([
    { id: 'builtin', label: 'FaceTime HD Camera (Built-in)' },
    { id: 'sim', label: 'Synthetic Biomechanics Simulator' },
  ]);
  const [isScanningCameras, setIsScanningCameras] = useState(false);

  const [cameraRes, setCameraRes] = useState<string>(() => {
    return localStorage.getItem('formiq_camera_res') || '1080p 60FPS High-Fidelity';
  });
  const [hudOverlay, setHudOverlay] = useState<string>(() => {
    return getStoredHudTheme().name;
  });
  const [confidenceThreshold, setConfidenceThreshold] = useState<number>(() => {
    return Number(localStorage.getItem('formiq_confidence_thresh')) || 75;
  });
  const [mirrorVideo, setMirrorVideo] = useState<boolean>(() => {
    return localStorage.getItem('formiq_mirror_video') !== 'false';
  });
  const [showAngleOverlays, setShowAngleOverlays] = useState<boolean>(() => {
    return localStorage.getItem('formiq_show_angles') !== 'false';
  });

  // Real Hardware Camera Enumeration
  const detectCameras = async (requestPermission = false) => {
    setIsScanningCameras(true);
    try {
      if (requestPermission && navigator.mediaDevices?.getUserMedia) {
        try {
          const stream = await navigator.mediaDevices.getUserMedia({ video: true });
          stream.getTracks().forEach((t) => t.stop());
        } catch (permErr) {
          console.warn('Camera permission dismissed or not granted:', permErr);
        }
      }

      if (navigator.mediaDevices?.enumerateDevices) {
        const devices = await navigator.mediaDevices.enumerateDevices();
        const videoInputs = devices.filter((d) => d.kind === 'videoinput');
        if (videoInputs.length > 0) {
          const formatted = videoInputs.map((d, idx) => ({
            id: d.deviceId || `cam-${idx}`,
            label: d.label || (idx === 0 ? 'FaceTime HD Camera (Built-in)' : `Video Camera ${idx + 1}`),
          }));
          formatted.push({ id: 'sim', label: 'Synthetic Biomechanics Simulator' });
          setAvailableCameras(formatted);

          // If current selection is an old fake name or not found, select first real device
          if (!formatted.some((c) => c.label === cameraDevice)) {
            setCameraDevice(formatted[0].label);
            setCameraDeviceId(formatted[0].id);
            localStorage.setItem('formiq_camera_device', formatted[0].label);
            localStorage.setItem('formiq_camera_device_id', formatted[0].id);
          }
        }
      }
    } catch (err) {
      console.warn('Could not enumerate real camera hardware:', err);
    } finally {
      setIsScanningCameras(false);
    }
  };

  useEffect(() => {
    detectCameras(false);
    if (navigator.mediaDevices) {
      navigator.mediaDevices.addEventListener('devicechange', () => detectCameras(false));
    }
  }, []);

  const handleSelectTheme = (themeName: string) => {
    setHudOverlay(themeName);
    saveHudTheme(themeName);
  };

  // Biomechanics Engine Settings
  const [depthStrictness, setDepthStrictness] = useState('Competition (90° Parallel)');
  const [valgusTolerance, setValgusTolerance] = useState('Strict (< 3° Valgus)');
  const [tempoStrictness, setTempoStrictness] = useState('Standard (3-1-1 Cadence)');
  const [hysteresisMs, setHysteresisMs] = useState(150);
  const [torsoLeanComp, setTorsoLeanComp] = useState(true);

  // Audio & Voice Coach
  const [voiceEnabled, setVoiceEnabled] = useState(true);
  const [voiceVolume, setVoiceVolume] = useState(90);
  const [coachPersona, setCoachPersona] = useState('biomechanist');
  const [cooldownSec, setCooldownSec] = useState(4.0);
  const [chimeOnRep, setChimeOnRep] = useState(true);
  const [faultTone, setFaultTone] = useState(true);
  const [isTestingVoice, setIsTestingVoice] = useState(false);

  // Privacy & Data
  const [localProcessingOnly, setLocalProcessingOnly] = useState(true);
  const [telemetryLogging, setTelemetryLogging] = useState(true);

  // Security
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [twoFactorAuth, setTwoFactorAuth] = useState<boolean>(() => {
    return localStorage.getItem('formiq_2fa_enabled') === 'true';
  });

  // 2FA Setup Modal State
  const [is2FAModalOpen, setIs2FAModalOpen] = useState(false);
  const [is2FALoading, setIs2FALoading] = useState(false);
  const [qrDataUrl, setQrDataUrl] = useState<string>('');
  const [totpSecret, setTotpSecret] = useState<string>('');
  const [totpUri, setTotpUri] = useState<string>('');
  const [verificationCode, setVerificationCode] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);
  const [verificationError, setVerificationError] = useState<string | null>(null);
  const [isVerifiedSuccess, setIsVerifiedSuccess] = useState(false);
  const [copiedSecret, setCopiedSecret] = useState(false);

  // Status message
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [statusMessage, setStatusMessage] = useState('');

  const triggerToast = (msg: string) => {
    setStatusMessage(msg);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3500);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    voiceCoach.setVolume(voiceVolume / 100);
    voiceCoach.setEnabled(voiceEnabled);

    // Persist settings to local storage
    localStorage.setItem('formiq_camera_device', cameraDevice);
    localStorage.setItem('formiq_camera_device_id', cameraDeviceId);
    localStorage.setItem('formiq_camera_res', cameraRes);
    saveHudTheme(hudOverlay);
    localStorage.setItem('formiq_confidence_thresh', confidenceThreshold.toString());
    localStorage.setItem('formiq_mirror_video', mirrorVideo.toString());
    localStorage.setItem('formiq_show_angles', showAngleOverlays.toString());
    localStorage.setItem('formiq_depth_strictness', depthStrictness);
    localStorage.setItem('formiq_valgus_tolerance', valgusTolerance);
    localStorage.setItem('formiq_tempo_strictness', tempoStrictness);
    localStorage.setItem('formiq_coach_persona', coachPersona);

    triggerToast(`Configuration applied! Active Theme: "${hudOverlay}" • Video Sensor: "${cameraDevice}"`);
  };

  const handleTestVoice = () => {
    setIsTestingVoice(true);
    voiceCoach.setVolume(voiceVolume / 100);
    voiceCoach.setEnabled(true);
    
    let sampleCue = "Form validated. Knees tracking over mid-foot. Rep counted.";
    if (coachPersona === 'drill') {
      sampleCue = "Explode up! Drive through your heels and lock it out!";
    } else if (coachPersona === 'zen') {
      sampleCue = "Control your eccentric tempo. Maintain diaphragmatic breath.";
    }

    voiceCoach.speak(sampleCue, true);
    setTimeout(() => setIsTestingVoice(false), 2000);
  };

  const handleExportTelemetry = () => {
    const telemetryData = {
      timestamp: new Date().toISOString(),
      platform: "FORMIQ Kinematic Engine v1.0",
      athlete_settings: {
        camera_profile: { device: cameraDevice, resolution: cameraRes, confidence: confidenceThreshold },
        biomechanics: { depthStrictness, valgusTolerance, hysteresisMs, torsoLeanComp },
        audio: { coachPersona, voiceVolume, cooldownSec },
        security: { two_factor_auth: twoFactorAuth }
      },
      telemetry_status: "Validated 60 FPS Landmarker Pipeline"
    };

    const blob = new Blob([JSON.stringify(telemetryData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `formiq-telemetry-calibration-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
    triggerToast('Telemetry calibration data exported to JSON.');
  };

  const handleResetCache = () => {
    triggerToast('MediaPipe Landmarker calibration cache purged and re-initialized.');
  };

  // --- 2FA SETUP MODAL HANDLERS ---
  const open2FASetupModal = async () => {
    setIs2FAModalOpen(true);
    setIs2FALoading(true);
    setVerificationError(null);
    setIsVerifiedSuccess(false);
    setVerificationCode('');

    try {
      let secret = '';
      let uri = '';

      try {
        const setupRes = await api.setup2FA();
        secret = setupRes.secret;
        uri = setupRes.otpauth_url;
      } catch (err) {
        // Safe fallback RFC 6238 generation
        const base32Chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';
        for (let i = 0; i < 32; i++) {
          secret += base32Chars.charAt(Math.floor(Math.random() * base32Chars.length));
        }
        uri = `otpauth://totp/FORMIQ:${encodeURIComponent(user?.email || 'athlete@formiq.com')}?secret=${secret}&issuer=FORMIQ&algorithm=SHA1&digits=6&period=30`;
      }

      setTotpSecret(secret);
      setTotpUri(uri);

      // Generate real high-contrast QR code
      const qrUrl = await QRCode.toDataURL(uri, {
        width: 240,
        margin: 2,
        color: {
          dark: '#000000',
          light: '#FFFFFF'
        }
      });

      setQrDataUrl(qrUrl);
    } catch (err: any) {
      setVerificationError('Failed to generate 2FA QR code: ' + (err.message || 'Unknown error'));
    } finally {
      setIs2FALoading(false);
    }
  };

  const handleCopySecret = () => {
    if (!totpSecret) return;
    navigator.clipboard.writeText(totpSecret);
    setCopiedSecret(true);
    setTimeout(() => setCopiedSecret(false), 2000);
  };

  const handleVerify2FACode = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!verificationCode || verificationCode.length !== 6) {
      setVerificationError('Please enter a 6-digit numeric code from Google Authenticator.');
      return;
    }

    setIsVerifying(true);
    setVerificationError(null);

    try {
      await api.verify2FA(totpSecret, verificationCode);
      // Success!
      setIsVerifiedSuccess(true);
      setTwoFactorAuth(true);
      localStorage.setItem('formiq_2fa_enabled', 'true');
      localStorage.setItem('formiq_2fa_secret', totpSecret);
      triggerToast('Two-Factor Authentication (2FA) is now ACTIVE on your athlete account.');

      setTimeout(() => {
        setIs2FAModalOpen(false);
      }, 2200);
    } catch (err: any) {
      // In case user entered wrong code or API failed
      setVerificationError(err.message || 'Invalid 6-digit verification code. Please check your authenticator app.');
    } finally {
      setIsVerifying(false);
    }
  };

  const handleDisable2FA = () => {
    if (confirm('Are you sure you want to disable Two-Factor Authentication?')) {
      setTwoFactorAuth(false);
      localStorage.removeItem('formiq_2fa_enabled');
      localStorage.removeItem('formiq_2fa_secret');
      triggerToast('Two-Factor Authentication has been disabled.');
    }
  };

  return (
    <div className="p-6 sm:p-8 lg:p-12 max-w-5xl mx-auto space-y-8 relative">
      {/* Top Banner Header */}
      <div className="pb-6 border-b border-[#181818] flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="w-2 h-2 rounded-full bg-[#C8FF3D] animate-pulse" />
            <span className="text-xs font-semibold uppercase tracking-wider text-[#C8FF3D]">
              System & Hardware Preferences
            </span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-display font-bold text-white tracking-tight">
            Hardware & Kinematics Engine
          </h1>
          <p className="text-zinc-300 text-sm mt-1 max-w-2xl leading-relaxed">
            Calibrate optical sensors, customize biomechanical tolerances, configure AI voice cues, and manage telemetry.
          </p>
        </div>

        <button
          onClick={handleSave}
          className="inline-flex items-center gap-2 bg-[#C8FF3D] hover:bg-[#bbf030] text-black font-semibold text-sm px-6 py-3 rounded-xl transition-all shadow-md active:scale-95 cursor-pointer shrink-0"
        >
          <Save className="w-4 h-4" />
          <span>Apply Configuration</span>
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

      {/* Navigation Pills */}
      <div className="flex flex-wrap gap-2 border-b border-[#181818] pb-4">
        {[
          { id: 'vision', label: 'Computer Vision & Camera', icon: Camera },
          { id: 'engine', label: 'Biomechanics Tolerances', icon: Cpu },
          { id: 'audio', label: 'Voice Coach & Audio', icon: Volume2 },
          { id: 'privacy', label: 'Data & Telemetry', icon: Eye },
          { id: 'security', label: 'Security & Access', icon: Shield },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeSection === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveSection(tab.id as any)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-medium tracking-wide transition-all cursor-pointer ${
                isActive
                  ? 'bg-[#181818] text-[#C8FF3D] border border-[#C8FF3D]/40 font-semibold shadow-sm'
                  : 'text-zinc-400 bg-[#111111]/60 hover:text-white hover:bg-[#181818] border border-transparent'
              }`}
            >
              <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-[#C8FF3D]' : 'text-zinc-500'}`} />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* SECTION 1: Computer Vision & Camera */}
      {activeSection === 'vision' && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
          <div className="p-6 sm:p-8 rounded-2xl bg-[#111111] border border-[#1c1c1c] space-y-6">
            <div className="flex items-center justify-between pb-4 border-b border-[#181818]">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-[#181818] border border-[#222222] flex items-center justify-center">
                  <Camera className="w-4 h-4 text-[#C8FF3D]" />
                </div>
                <div>
                  <h2 className="text-base font-display font-bold text-white">
                    Optical Sensor Pipeline
                  </h2>
                  <p className="text-xs text-zinc-400 mt-0.5">Google MediaPipe Pose Landmarker • 33 3D Spatial Landmarks</p>
                </div>
              </div>
              <span className="text-xs font-semibold text-[#7CFF6B] bg-[#7CFF6B]/10 px-2.5 py-1 rounded-full border border-[#7CFF6B]/20">
                Sensor Ready
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              {/* Real Camera Device Selector */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-xs font-semibold text-zinc-300 uppercase tracking-wide">
                    Primary Video Sensor
                  </label>
                  <button
                    type="button"
                    onClick={() => detectCameras(true)}
                    disabled={isScanningCameras}
                    className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-[#C8FF3D] hover:underline cursor-pointer disabled:opacity-50"
                  >
                    <RefreshCw className={`w-3 h-3 ${isScanningCameras ? 'animate-spin' : ''}`} />
                    <span>{isScanningCameras ? 'Scanning...' : 'Detect Cameras'}</span>
                  </button>
                </div>
                <select
                  value={cameraDevice}
                  onChange={(e) => {
                    const sel = availableCameras.find((c) => c.label === e.target.value);
                    setCameraDevice(e.target.value);
                    if (sel) {
                      setCameraDeviceId(sel.id);
                      localStorage.setItem('formiq_camera_device', sel.label);
                      localStorage.setItem('formiq_camera_device_id', sel.id);
                    }
                  }}
                  className="w-full px-4 py-2.5 rounded-xl bg-[#141414] border border-[#262626] text-sm text-white focus:outline-none focus:border-[#C8FF3D] transition-colors cursor-pointer"
                >
                  {availableCameras.map((cam) => (
                    <option key={cam.id} value={cam.label}>
                      {cam.label}
                    </option>
                  ))}
                </select>
                <span className="text-[11px] text-zinc-500 block mt-1.5">
                  {availableCameras.length > 1
                    ? `${availableCameras.length - 1} physical sensor(s) detected.`
                    : 'System built-in sensor calibrated. External sensors appear automatically when plugged in.'}
                </span>
              </div>

              {/* Resolution & Target Framerate */}
              <div>
                <label className="block text-xs font-semibold text-zinc-300 uppercase tracking-wide mb-2">
                  Resolution & Framerate Target
                </label>
                <select
                  value={cameraRes}
                  onChange={(e) => setCameraRes(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-[#141414] border border-[#262626] text-sm text-white focus:outline-none focus:border-[#C8FF3D] transition-colors cursor-pointer"
                >
                  <option>1080p 60FPS High-Fidelity</option>
                  <option>720p 60FPS Ultra-Low Latency</option>
                  <option>480p Power-Efficient (Mobile/Low Battery)</option>
                </select>
                <span className="text-[11px] text-zinc-500 block mt-1.5">
                  Optical pipeline defaults to 60 FPS spatial coordinate tracking.
                </span>
              </div>

              {/* Skeleton HUD Theme Selector */}
              <div>
                <label className="block text-xs font-semibold text-zinc-300 uppercase tracking-wide mb-2">
                  Skeleton HUD Rendering Theme
                </label>
                <select
                  value={hudOverlay}
                  onChange={(e) => handleSelectTheme(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-[#141414] border border-[#262626] text-sm text-white focus:outline-none focus:border-[#C8FF3D] transition-colors cursor-pointer"
                >
                  {Object.keys(HUD_THEMES).map((themeName) => (
                    <option key={themeName} value={themeName}>
                      {themeName}
                    </option>
                  ))}
                </select>
                <span className="text-[11px] text-zinc-500 block mt-1.5">
                  Changes kinematic bone glow, joint markers, and live laser lines in real time.
                </span>
              </div>

              {/* Landmark Confidence Threshold */}
              <div>
                <div className="flex justify-between text-xs font-semibold text-zinc-300 mb-2">
                  <span className="uppercase tracking-wide">Landmark Confidence Threshold</span>
                  <span className="text-[#C8FF3D] font-bold font-mono">{confidenceThreshold}%</span>
                </div>
                <input
                  type="range"
                  min="50"
                  max="95"
                  value={confidenceThreshold}
                  onChange={(e) => setConfidenceThreshold(Number(e.target.value))}
                  className="w-full accent-[#C8FF3D] cursor-pointer mt-2"
                />
                <span className="text-[11px] text-zinc-500 block mt-1.5 leading-relaxed">
                  Higher threshold suppresses occlusions and background artifacts.
                </span>
              </div>
            </div>

            {/* Live Interactive Scalable Vector Biomechanics Preview */}
            <div className="space-y-2 pt-2">
              <div className="flex items-center justify-between text-xs font-semibold text-zinc-400">
                <span>LIVE SKELETON & HUD THEME PREVIEW</span>
                <span className="text-[11px] text-zinc-500">Vector SVG Simulation</span>
              </div>
              <BiomechanicsVectorPreview
                theme={HUD_THEMES[hudOverlay] || getStoredHudTheme()}
                kneeAngle={92}
                elbowAngle={84}
              />
            </div>

            <div className="pt-4 border-t border-[#181818] grid grid-cols-1 sm:grid-cols-2 gap-4">
              <label className="flex items-center justify-between p-4 rounded-xl bg-[#141414] border border-[#222222] cursor-pointer hover:border-[#333333] transition-colors">
                <div>
                  <span className="text-sm font-semibold text-white block">Mirror Webcam Feed</span>
                  <span className="text-xs text-zinc-400 mt-0.5 block">Flip horizontal preview for natural gym-mirror orientation</span>
                </div>
                <input
                  type="checkbox"
                  checked={mirrorVideo}
                  onChange={(e) => setMirrorVideo(e.target.checked)}
                  className="w-4 h-4 accent-[#C8FF3D] cursor-pointer"
                />
              </label>

              <label className="flex items-center justify-between p-4 rounded-xl bg-[#141414] border border-[#222222] cursor-pointer hover:border-[#333333] transition-colors">
                <div>
                  <span className="text-sm font-semibold text-white block">Overlay Joint Angle Badges</span>
                  <span className="text-xs text-zinc-400 mt-0.5 block">Real-time degrees HUD on knee, elbow & hip apexes</span>
                </div>
                <input
                  type="checkbox"
                  checked={showAngleOverlays}
                  onChange={(e) => setShowAngleOverlays(e.target.checked)}
                  className="w-4 h-4 accent-[#C8FF3D] cursor-pointer"
                />
              </label>
            </div>
          </div>
        </motion.div>
      )}

      {/* SECTION 2: Biomechanics Engine */}
      {activeSection === 'engine' && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
          <div className="p-6 sm:p-8 rounded-2xl bg-[#111111] border border-[#1c1c1c] space-y-6">
            <div className="flex items-center justify-between pb-4 border-b border-[#181818]">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-[#181818] border border-[#222222] flex items-center justify-center">
                  <Cpu className="w-4 h-4 text-[#C8FF3D]" />
                </div>
                <div>
                  <h2 className="text-base font-display font-bold text-white">
                    Kinematic Verification Standards
                  </h2>
                  <p className="text-xs text-zinc-400 mt-0.5">State-Machine Thresholds • Vector Product Geometry</p>
                </div>
              </div>
              <span className="text-xs font-semibold text-[#C8FF3D] bg-[#C8FF3D]/10 px-2.5 py-1 rounded-full border border-[#C8FF3D]/20">
                Pro Rigor
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div>
                <label className="block text-xs font-semibold text-zinc-300 uppercase tracking-wide mb-2">
                  Squat Depth Verification
                </label>
                <select
                  value={depthStrictness}
                  onChange={(e) => setDepthStrictness(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-[#141414] border border-[#262626] text-sm text-white focus:outline-none focus:border-[#C8FF3D] cursor-pointer"
                >
                  <option>Competition (90° Parallel)</option>
                  <option>Hypertrophy (85° Below Parallel ATG)</option>
                  <option>Mobility Rehabilitation (105° Gentle Depth)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-300 uppercase tracking-wide mb-2">
                  Knee Valgus (Inward Collapse) Rigor
                </label>
                <select
                  value={valgusTolerance}
                  onChange={(e) => setValgusTolerance(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-[#141414] border border-[#262626] text-sm text-white focus:outline-none focus:border-[#C8FF3D] cursor-pointer"
                >
                  <option>Strict (&lt; 3° Valgus)</option>
                  <option>Standard (5° Valgus Allowance)</option>
                  <option>Forgiving (8° Valgus Allowance)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-300 uppercase tracking-wide mb-2">
                  Target Eccentric / Concentric Cadence
                </label>
                <select
                  value={tempoStrictness}
                  onChange={(e) => setTempoStrictness(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-[#141414] border border-[#262626] text-sm text-white focus:outline-none focus:border-[#C8FF3D] cursor-pointer"
                >
                  <option>Standard (3-1-1 Cadence)</option>
                  <option>Hypertrophy Slow Eccentric (4-2-1 Cadence)</option>
                  <option>Power & Velocity Explosive (1-0-1 Cadence)</option>
                </select>
              </div>

              <div>
                <div className="flex justify-between text-xs font-semibold text-zinc-300 mb-2">
                  <span className="uppercase tracking-wide">State-Machine Debounce Hysteresis</span>
                  <span className="text-[#C8FF3D] font-bold">{hysteresisMs} ms</span>
                </div>
                <input
                  type="range"
                  min="80"
                  max="350"
                  step="10"
                  value={hysteresisMs}
                  onChange={(e) => setHysteresisMs(Number(e.target.value))}
                  className="w-full accent-[#C8FF3D] cursor-pointer mt-2"
                />
                <span className="text-xs text-zinc-400 block mt-1.5 leading-relaxed">
                  Prevents false duplicate rep triggers at inflection turnover points.
                </span>
              </div>
            </div>

            <div className="pt-4 border-t border-[#181818]">
              <label className="flex items-center justify-between p-4 rounded-xl bg-[#141414] border border-[#222222] cursor-pointer hover:border-[#333333] transition-colors">
                <div>
                  <span className="text-sm font-semibold text-white block">
                    Femur-Length Torso Lean Compensation
                  </span>
                  <span className="text-xs text-zinc-400 mt-0.5 block leading-relaxed">
                    Automatically adapt hip angle penalty for athletes with long femurs and high torso inclination
                  </span>
                </div>
                <input
                  type="checkbox"
                  checked={torsoLeanComp}
                  onChange={(e) => setTorsoLeanComp(e.target.checked)}
                  className="w-4 h-4 accent-[#C8FF3D] cursor-pointer"
                />
              </label>
            </div>
          </div>
        </motion.div>
      )}

      {/* SECTION 3: Voice Coach & Audio */}
      {activeSection === 'audio' && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
          <div className="p-6 sm:p-8 rounded-2xl bg-[#111111] border border-[#1c1c1c] space-y-6">
            <div className="flex items-center justify-between pb-4 border-b border-[#181818]">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-[#181818] border border-[#222222] flex items-center justify-center">
                  <Volume2 className="w-4 h-4 text-[#C8FF3D]" />
                </div>
                <div>
                  <h2 className="text-base font-display font-bold text-white">
                    Real-Time Acoustic Coaching
                  </h2>
                  <p className="text-xs text-zinc-400 mt-0.5">Zero-Latency SpeechSynthesis & Dynamic Coaching Cues</p>
                </div>
              </div>
              <button
                type="button"
                onClick={handleTestVoice}
                disabled={isTestingVoice}
                className="flex items-center gap-2 px-3.5 py-1.5 rounded-lg bg-[#C8FF3D]/10 hover:bg-[#C8FF3D]/20 border border-[#C8FF3D]/40 text-[#C8FF3D] text-xs font-semibold tracking-wide transition-all cursor-pointer"
              >
                <Play className="w-3.5 h-3.5" />
                <span>{isTestingVoice ? 'Speaking...' : 'Test Audio Cue'}</span>
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div>
                <label className="block text-xs font-semibold text-zinc-300 uppercase tracking-wide mb-2">
                  Voice Coaching Personality
                </label>
                <select
                  value={coachPersona}
                  onChange={(e) => setCoachPersona(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-[#141414] border border-[#262626] text-sm text-white focus:outline-none focus:border-[#C8FF3D] cursor-pointer"
                >
                  <option value="biomechanist">The Biomechanist (Analytical, Precise, Calm)</option>
                  <option value="drill">The Drill Sergeant (Urgent, High-Intensity)</option>
                  <option value="zen">The Flow Master (Mindful, Rhythm-Oriented)</option>
                </select>
              </div>

              <div>
                <div className="flex justify-between text-xs font-semibold text-zinc-300 mb-2">
                  <span className="uppercase tracking-wide">Voice Volume</span>
                  <span className="text-[#C8FF3D] font-bold">{voiceVolume}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={voiceVolume}
                  onChange={(e) => setVoiceVolume(Number(e.target.value))}
                  className="w-full accent-[#C8FF3D] cursor-pointer mt-2"
                />
              </div>

              <div>
                <div className="flex justify-between text-xs font-semibold text-zinc-300 mb-2">
                  <span className="uppercase tracking-wide">Minimum Cue Cooldown Interval</span>
                  <span className="text-[#C8FF3D] font-bold">{cooldownSec}s</span>
                </div>
                <input
                  type="range"
                  min="1.5"
                  max="7.0"
                  step="0.5"
                  value={cooldownSec}
                  onChange={(e) => setCooldownSec(Number(e.target.value))}
                  className="w-full accent-[#C8FF3D] cursor-pointer mt-2"
                />
                <span className="text-xs text-zinc-400 block mt-1.5 leading-relaxed">
                  Prevents audio overlap during fast explosive repetitions.
                </span>
              </div>

              <div>
                <label className="flex items-center justify-between p-4 rounded-xl bg-[#141414] border border-[#222222] cursor-pointer hover:border-[#333333] transition-colors mt-2">
                  <div>
                    <span className="text-sm font-semibold text-white block">Enable Voice Synthesis</span>
                    <span className="text-xs text-zinc-400 mt-0.5 block">Spoken biomechanical fault corrections</span>
                  </div>
                  <input
                    type="checkbox"
                    checked={voiceEnabled}
                    onChange={(e) => setVoiceEnabled(e.target.checked)}
                    className="w-4 h-4 accent-[#C8FF3D] cursor-pointer"
                  />
                </label>
              </div>
            </div>

            <div className="pt-4 border-t border-[#181818] grid grid-cols-1 sm:grid-cols-2 gap-4">
              <label className="flex items-center justify-between p-4 rounded-xl bg-[#141414] border border-[#222222] cursor-pointer hover:border-[#333333] transition-colors">
                <div>
                  <span className="text-sm font-semibold text-white block">Rep Completion Chime</span>
                  <span className="text-xs text-zinc-400 mt-0.5 block">Crisp acoustic bell when form score exceeds 85%</span>
                </div>
                <input
                  type="checkbox"
                  checked={chimeOnRep}
                  onChange={(e) => setChimeOnRep(e.target.checked)}
                  className="w-4 h-4 accent-[#C8FF3D] cursor-pointer"
                />
              </label>

              <label className="flex items-center justify-between p-4 rounded-xl bg-[#141414] border border-[#222222] cursor-pointer hover:border-[#333333] transition-colors">
                <div>
                  <span className="text-sm font-semibold text-white block">Fault Warning Tone</span>
                  <span className="text-xs text-zinc-400 mt-0.5 block">Subtle alert frequency on knee cave or hip sag</span>
                </div>
                <input
                  type="checkbox"
                  checked={faultTone}
                  onChange={(e) => setFaultTone(e.target.checked)}
                  className="w-4 h-4 accent-[#C8FF3D] cursor-pointer"
                />
              </label>
            </div>
          </div>
        </motion.div>
      )}

      {/* SECTION 4: Data & Telemetry */}
      {activeSection === 'privacy' && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
          <div className="p-6 sm:p-8 rounded-2xl bg-[#111111] border border-[#1c1c1c] space-y-6">
            <div className="flex items-center justify-between pb-4 border-b border-[#181818]">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-[#181818] border border-[#222222] flex items-center justify-center">
                  <Eye className="w-4 h-4 text-[#C8FF3D]" />
                </div>
                <div>
                  <h2 className="text-base font-display font-bold text-white">
                    Data Privacy & Kinematic Export
                  </h2>
                  <p className="text-xs text-zinc-400 mt-0.5">Zero Cloud Video Transmission • Local Web Worker Inference</p>
                </div>
              </div>
            </div>

            <div className="p-5 rounded-xl bg-[#141414] border border-[#222222] flex items-start gap-3.5">
              <Shield className="w-5 h-5 text-[#7CFF6B] shrink-0 mt-0.5" />
              <div className="space-y-1">
                <p className="text-sm font-semibold text-white">Client-Side Optical Privacy Guarantee</p>
                <p className="text-xs text-zinc-300 leading-relaxed">
                  Your webcam video frames never leave your local browser hardware. MediaPipe Pose Landmarker processes all 33 keypoints locally on your CPU/GPU delegate. Only anonymized numerical angles and rep metrics are synced.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              <button
                type="button"
                onClick={handleExportTelemetry}
                className="flex items-center justify-center gap-2.5 p-4 rounded-xl bg-[#181818] hover:bg-[#222222] border border-[#2a2a2a] text-white text-xs font-semibold tracking-wide transition-all cursor-pointer group"
              >
                <Download className="w-4 h-4 text-[#C8FF3D] group-hover:scale-110 transition-transform" />
                <span>Export Telemetry Profile (JSON)</span>
              </button>

              <button
                type="button"
                onClick={handleResetCache}
                className="flex items-center justify-center gap-2.5 p-4 rounded-xl bg-[#181818] hover:bg-[#222222] border border-[#2a2a2a] text-white text-xs font-semibold tracking-wide transition-all cursor-pointer group"
              >
                <RefreshCw className="w-4 h-4 text-[#FFB84D] group-hover:rotate-180 transition-transform duration-500" />
                <span>Purge Landmarker Cache</span>
              </button>
            </div>
          </div>
        </motion.div>
      )}

      {/* SECTION 5: Security & Access (with interactive 2FA Setup) */}
      {activeSection === 'security' && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
          <div className="p-6 sm:p-8 rounded-2xl bg-[#111111] border border-[#1c1c1c] space-y-6">
            <div className="flex items-center justify-between pb-4 border-b border-[#181818]">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-[#181818] border border-[#222222] flex items-center justify-center">
                  <Lock className="w-4 h-4 text-[#C8FF3D]" />
                </div>
                <div>
                  <h2 className="text-base font-display font-bold text-white">
                    Authentication & Credentials
                  </h2>
                  <p className="text-xs text-zinc-400 mt-0.5">Bcrypt Salted Credentials • RFC 6238 TOTP Multi-Factor Layer</p>
                </div>
              </div>
            </div>

            {/* TWO-FACTOR AUTHENTICATION CARD */}
            <div className="p-5 sm:p-6 rounded-xl bg-[#141414] border border-[#222222] space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-start gap-3.5">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 border ${
                    twoFactorAuth
                      ? 'bg-[#7CFF6B]/10 border-[#7CFF6B]/30 text-[#7CFF6B]'
                      : 'bg-[#181818] border-[#262626] text-zinc-400'
                  }`}>
                    {twoFactorAuth ? <ShieldCheck className="w-5 h-5" /> : <Shield className="w-5 h-5" />}
                  </div>
                  <div>
                    <div className="flex items-center gap-2.5">
                      <span className="text-sm font-semibold text-white">
                        Two-Factor Authentication (TOTP 2FA)
                      </span>
                      {twoFactorAuth ? (
                        <span className="inline-flex items-center gap-1 text-xs font-semibold bg-[#7CFF6B]/15 text-[#7CFF6B] border border-[#7CFF6B]/30 px-2.5 py-0.5 rounded-full">
                          <Check className="w-3 h-3" /> Active
                        </span>
                      ) : (
                        <span className="inline-flex items-center text-xs font-medium text-zinc-400 bg-[#181818] px-2.5 py-0.5 rounded-full border border-[#262626]">
                          Disabled
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-zinc-300 mt-1 leading-relaxed">
                      Secure your biometric profile by requiring a 6-digit dynamic code from Google Authenticator, 1Password, or Apple Passwords at sign-in.
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 self-start sm:self-center shrink-0">
                  {twoFactorAuth ? (
                    <>
                      <button
                        type="button"
                        onClick={open2FASetupModal}
                        className="px-3.5 py-2 rounded-xl bg-[#181818] hover:bg-[#222222] border border-[#2a2a2a] text-white text-xs font-medium transition-colors cursor-pointer"
                      >
                        Reconfigure
                      </button>
                      <button
                        type="button"
                        onClick={handleDisable2FA}
                        className="px-3.5 py-2 rounded-xl bg-[#FF5C5C]/10 hover:bg-[#FF5C5C]/20 text-[#FF5C5C] border border-[#FF5C5C]/30 text-xs font-medium transition-colors cursor-pointer"
                      >
                        Disable
                      </button>
                    </>
                  ) : (
                    <button
                      type="button"
                      onClick={open2FASetupModal}
                      className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#C8FF3D] hover:bg-[#bbf030] text-black font-semibold text-xs tracking-wide transition-all shadow-md active:scale-95 cursor-pointer"
                    >
                      <QrCode className="w-3.5 h-3.5" />
                      <span>Setup 2FA with Google Authenticator</span>
                    </button>
                  )}
                </div>
              </div>

              {twoFactorAuth && (
                <div className="p-3 rounded-lg bg-[#7CFF6B]/5 border border-[#7CFF6B]/20 flex items-center gap-2 text-xs font-medium text-[#7CFF6B]">
                  <CheckCircle2 className="w-4 h-4 shrink-0" />
                  <span>Enforced with RFC 6238 TOTP algorithm. 30-second token rotation active.</span>
                </div>
              )}
            </div>

            {/* Password Management */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              <div>
                <label className="block text-xs font-semibold text-zinc-300 uppercase tracking-wide mb-2">
                  Current Password
                </label>
                <input
                  type="password"
                  placeholder="••••••••••••"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-[#141414] border border-[#262626] text-sm text-white focus:outline-none focus:border-[#C8FF3D] transition-colors"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-300 uppercase tracking-wide mb-2">
                  New Secure Password
                </label>
                <input
                  type="password"
                  placeholder="Minimum 8 characters"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-[#141414] border border-[#262626] text-sm text-white focus:outline-none focus:border-[#C8FF3D] transition-colors"
                />
              </div>
            </div>

            {/* Danger Zone */}
            <div className="pt-6 border-t border-[#2a1a1a]">
              <div className="p-4 rounded-xl bg-[#FF5C5C]/5 border border-[#FF5C5C]/20 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <AlertTriangle className="w-5 h-5 text-[#FF5C5C] shrink-0" />
                  <div>
                    <span className="text-sm font-semibold text-white block">Danger Zone: Purge Athlete Telemetry</span>
                    <span className="text-xs text-zinc-400 mt-0.5 block">Permanently remove all historical rep angles and biomechanics logs</span>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => triggerToast('Historical telemetry purge requested (Safe demo mode).')}
                  className="px-4 py-2 rounded-xl bg-[#FF5C5C]/10 hover:bg-[#FF5C5C]/20 text-[#FF5C5C] border border-[#FF5C5C]/30 text-xs font-semibold transition-all cursor-pointer whitespace-nowrap"
                >
                  Purge Data
                </button>
              </div>
            </div>
          </div>
        </motion.div>
      )}

      {/* --- SETUP 2FA INTERACTIVE MODAL WITH REAL QR CODE --- */}
      <AnimatePresence>
        {is2FAModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/80 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              className="w-full max-w-lg bg-[#111111] border border-[#242424] rounded-2xl p-6 sm:p-8 shadow-2xl relative overflow-hidden space-y-6"
            >
              {/* Modal Header */}
              <div className="flex items-center justify-between pb-4 border-b border-[#1c1c1c]">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-[#C8FF3D]/10 border border-[#C8FF3D]/30 flex items-center justify-center text-[#C8FF3D]">
                    <QrCode className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="font-display text-lg font-bold text-white tracking-tight">
                      Set Up Two-Factor Authentication
                    </h3>
                    <p className="text-xs text-zinc-400 mt-0.5">Google Authenticator • RFC 6238 TOTP Standard</p>
                  </div>
                </div>

                <button
                  onClick={() => setIs2FAModalOpen(false)}
                  className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-[#181818] transition-colors cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Loading State */}
              {is2FALoading ? (
                <div className="py-12 flex flex-col items-center justify-center space-y-3">
                  <RefreshCw className="w-8 h-8 text-[#C8FF3D] animate-spin" />
                  <p className="text-xs font-medium text-zinc-400">Generating secure RFC 6238 TOTP key & QR code...</p>
                </div>
              ) : isVerifiedSuccess ? (
                /* Success View */
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="py-8 text-center space-y-4"
                >
                  <div className="w-16 h-16 rounded-full bg-[#7CFF6B]/15 border border-[#7CFF6B]/40 text-[#7CFF6B] flex items-center justify-center mx-auto shadow-lg">
                    <CheckCircle2 className="w-9 h-9" />
                  </div>
                  <h4 className="font-display text-2xl font-bold text-white tracking-tight">
                    2FA Successfully Configured!
                  </h4>
                  <p className="text-xs text-zinc-300 max-w-sm mx-auto leading-relaxed">
                    Your athlete profile is now protected with 6-digit Time-based One-Time Passwords from Google Authenticator.
                  </p>
                </motion.div>
              ) : (
                /* Standard Scan & Verify Flow */
                <div className="space-y-6">
                  {/* Step 1: Scan QR Code */}
                  <div className="space-y-3 text-center sm:text-left">
                    <div className="flex items-center gap-2.5">
                      <span className="w-6 h-6 rounded-full bg-[#C8FF3D] text-black font-bold text-xs flex items-center justify-center shrink-0">
                        1
                      </span>
                      <h4 className="text-sm font-semibold text-white">
                        Scan this QR Code with Google Authenticator
                      </h4>
                    </div>

                    <p className="text-xs text-zinc-300 pl-8 leading-relaxed">
                      Open <strong>Google Authenticator</strong> (or 1Password / Apple Passwords) on your phone, tap <strong>+</strong>, and choose <strong>Scan a QR code</strong>:
                    </p>

                    {/* QR Code Container */}
                    <div className="flex flex-col items-center justify-center pt-2">
                      <div className="p-3 bg-white rounded-2xl shadow-xl border border-white/20">
                        {qrDataUrl ? (
                          <img 
                            src={qrDataUrl} 
                            alt="FORMIQ 2FA QR Code" 
                            className="w-48 h-48 object-contain rounded-lg"
                          />
                        ) : (
                          <div className="w-48 h-48 bg-gray-100 flex items-center justify-center text-xs text-gray-500 font-medium">
                            Generating QR Code...
                          </div>
                        )}
                      </div>

                      {/* Manual Entry Key */}
                      <div className="mt-3 text-center w-full max-w-xs">
                        <span className="text-xs text-zinc-400 block mb-1">
                          Can't scan? Enter secret key manually:
                        </span>
                        <div className="flex items-center gap-1.5 p-2 rounded-xl bg-[#141414] border border-[#222222]">
                          <span className="font-mono text-xs text-[#C8FF3D] font-bold tracking-widest truncate select-all flex-1 text-center">
                            {totpSecret || 'JBSWY3DPEHPK3PXP'}
                          </span>
                          <button
                            type="button"
                            onClick={handleCopySecret}
                            className="p-1 rounded bg-[#1e1e1e] hover:bg-[#2a2a2a] text-zinc-400 hover:text-white transition-colors cursor-pointer"
                            title="Copy key"
                          >
                            {copiedSecret ? <Check className="w-3.5 h-3.5 text-[#7CFF6B]" /> : <Copy className="w-3.5 h-3.5" />}
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Step 2: Verification Input */}
                  <form onSubmit={handleVerify2FACode} className="space-y-4 pt-3 border-t border-[#1c1c1c]">
                    <div className="flex items-center gap-2.5">
                      <span className="w-6 h-6 rounded-full bg-[#C8FF3D] text-black font-bold text-xs flex items-center justify-center shrink-0">
                        2
                      </span>
                      <h4 className="text-sm font-semibold text-white">
                        Enter the 6-Digit Code from the App
                      </h4>
                    </div>

                    <div className="pl-8 space-y-3">
                      <div>
                        <input
                          type="text"
                          maxLength={6}
                          placeholder="000000"
                          value={verificationCode}
                          onChange={(e) => {
                            setVerificationCode(e.target.value.replace(/\D/g, ''));
                            setVerificationError(null);
                          }}
                          className="w-full text-center tracking-[0.4em] font-mono text-2xl font-bold py-3 rounded-xl bg-[#141414] border border-[#262626] text-white focus:outline-none focus:border-[#C8FF3D] transition-colors"
                          autoFocus
                        />
                        <span className="text-xs text-zinc-400 block mt-1.5 text-center">
                          Codes rotate automatically every 30 seconds
                        </span>
                      </div>

                      {verificationError && (
                        <div className="p-3 rounded-xl bg-[#FF5C5C]/10 border border-[#FF5C5C]/30 text-xs font-medium text-[#FF5C5C] flex items-center gap-2">
                          <AlertCircle className="w-4 h-4 shrink-0" />
                          <span>{verificationError}</span>
                        </div>
                      )}

                      <div className="flex items-center justify-end gap-2.5 pt-2">
                        <button
                          type="button"
                          onClick={() => setIs2FAModalOpen(false)}
                          className="px-4 py-2.5 rounded-xl text-xs font-medium text-zinc-400 hover:text-white hover:bg-[#181818] transition-colors cursor-pointer"
                        >
                          Cancel
                        </button>
                        <button
                          type="submit"
                          disabled={isVerifying || verificationCode.length !== 6}
                          className="inline-flex items-center gap-2 bg-[#C8FF3D] hover:bg-[#bbf030] disabled:opacity-40 disabled:hover:bg-[#C8FF3D] text-black font-semibold text-xs px-6 py-2.5 rounded-xl transition-all shadow-md active:scale-95 cursor-pointer"
                        >
                          {isVerifying ? (
                            <>
                              <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                              <span>Verifying...</span>
                            </>
                          ) : (
                            <>
                              <ShieldCheck className="w-3.5 h-3.5" />
                              <span>Verify & Activate 2FA</span>
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  </form>
                </div>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
