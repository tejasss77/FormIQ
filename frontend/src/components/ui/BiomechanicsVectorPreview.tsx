import React from 'react';
import { HudThemeConfig } from '../../utils/theme';

interface BiomechanicsVectorPreviewProps {
  theme: HudThemeConfig;
  kneeAngle?: number;
  elbowAngle?: number;
  interactive?: boolean;
}

export const BiomechanicsVectorPreview: React.FC<BiomechanicsVectorPreviewProps> = ({
  theme,
  kneeAngle = 92,
  elbowAngle = 84,
}) => {
  return (
    <div className="relative w-full h-56 rounded-xl bg-[#0d0d0d] border border-[#222222] overflow-hidden flex items-center justify-center p-4">
      {/* Background Grid & Alignment Crosshairs */}
      <div className="absolute inset-0 hud-grid opacity-25 pointer-events-none" />
      <div className="absolute inset-x-4 top-1/2 border-b border-dashed border-zinc-800 pointer-events-none" />
      <div className="absolute inset-y-4 left-1/2 border-r border-dashed border-zinc-800 pointer-events-none" />

      {/* SVG Kinematic Skeleton Simulation */}
      <svg
        viewBox="0 0 240 200"
        className="w-full h-full max-h-48 z-10 filter drop-shadow-md"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <filter id={`glow-${theme.id}`} x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="3" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
        </defs>

        {/* Head */}
        <circle
          cx="120"
          cy="28"
          r="10"
          stroke={theme.primary}
          strokeWidth="2.5"
          filter={`url(#glow-${theme.id})`}
        />
        <circle cx="120" cy="28" r="4" fill={theme.jointAccent} />

        {/* Clavicle / Neck */}
        <line x1="120" y1="38" x2="120" y2="52" stroke={theme.primary} strokeWidth="2.5" />
        <line x1="95" y1="52" x2="145" y2="52" stroke={theme.primary} strokeWidth="3" filter={`url(#glow-${theme.id})`} />

        {/* Left Arm (Shoulder -> Elbow -> Wrist) */}
        <line x1="95" y1="52" x2="72" y2="82" stroke={theme.primary} strokeWidth="2.5" />
        <line x1="72" y1="82" x2="60" y2="114" stroke={theme.primary} strokeWidth="2.5" />

        {/* Right Arm (Shoulder -> Elbow -> Wrist) */}
        <line x1="145" y1="52" x2="168" y2="80" stroke={theme.primary} strokeWidth="2.5" />
        <line x1="168" y1="80" x2="182" y2="112" stroke={theme.primary} strokeWidth="2.5" />

        {/* Spine / Torso Box */}
        <line x1="120" y1="52" x2="120" y2="105" stroke={theme.primary} strokeWidth="3" strokeDasharray="4 2" />
        <line x1="95" y1="52" x2="102" y2="105" stroke={theme.primary} strokeWidth="1.5" strokeOpacity="0.4" />
        <line x1="145" y1="52" x2="138" y2="105" stroke={theme.primary} strokeWidth="1.5" strokeOpacity="0.4" />

        {/* Pelvis / Hip Hinge */}
        <line x1="102" y1="105" x2="138" y2="105" stroke={theme.primary} strokeWidth="3" filter={`url(#glow-${theme.id})`} />

        {/* Left Leg (Hip -> Knee -> Ankle) */}
        <line x1="102" y1="105" x2="84" y2="148" stroke={theme.primary} strokeWidth="3" />
        <line x1="84" y1="148" x2="80" y2="186" stroke={theme.primary} strokeWidth="3" />
        {/* Left Foot */}
        <line x1="80" y1="186" x2="65" y2="188" stroke={theme.primary} strokeWidth="2" />

        {/* Right Leg (Hip -> Knee -> Ankle) */}
        <line x1="138" y1="105" x2="156" y2="148" stroke={theme.primary} strokeWidth="3" />
        <line x1="156" y1="148" x2="160" y2="186" stroke={theme.primary} strokeWidth="3" />
        {/* Right Foot */}
        <line x1="160" y1="186" x2="175" y2="188" stroke={theme.primary} strokeWidth="2" />

        {/* Kinematic Joints */}
        {[
          [95, 52], [145, 52], // Shoulders
          [72, 82], [168, 80], // Elbows
          [60, 114], [182, 112], // Wrists
          [102, 105], [138, 105], // Hips
          [84, 148], [156, 148], // Knees
          [80, 186], [160, 186], // Ankles
        ].map(([x, y], i) => (
          <g key={i}>
            <circle cx={x} cy={y} r="5" fill={theme.primary} filter={`url(#glow-${theme.id})`} />
            <circle cx={x} cy={y} r="2.5" fill={theme.jointAccent} />
          </g>
        ))}

        {/* Angle HUD Callout Badge (Knee) */}
        <g transform="translate(164, 136)">
          <rect
            x="0"
            y="0"
            width="48"
            height="18"
            rx="5"
            fill={theme.badgeBg}
            stroke={theme.badgeBorder}
            strokeWidth="1"
          />
          <text
            x="24"
            y="12"
            fill={theme.badgeText}
            fontSize="9"
            fontFamily="'JetBrains Mono', monospace"
            fontWeight="bold"
            textAnchor="middle"
          >
            {kneeAngle}° ATG
          </text>
        </g>

        {/* Angle HUD Callout Badge (Elbow) */}
        <g transform="translate(14, 72)">
          <rect
            x="0"
            y="0"
            width="44"
            height="18"
            rx="5"
            fill={theme.badgeBg}
            stroke={theme.badgeBorder}
            strokeWidth="1"
          />
          <text
            x="22"
            y="12"
            fill={theme.badgeText}
            fontSize="9"
            fontFamily="'JetBrains Mono', monospace"
            fontWeight="bold"
            textAnchor="middle"
          >
            {elbowAngle}°
          </text>
        </g>
      </svg>

      {/* Floating Theme Information Watermark */}
      <div className="absolute bottom-2.5 right-3 flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-[#141414]/90 border border-zinc-800 text-[11px] font-medium text-zinc-300">
        <span className="w-2 h-2 rounded-full" style={{ backgroundColor: theme.primary }} />
        <span>{theme.name}</span>
      </div>
    </div>
  );
};
