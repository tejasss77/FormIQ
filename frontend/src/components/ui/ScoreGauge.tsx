import React from 'react';
import { motion } from 'framer-motion';

interface ScoreGaugeProps {
  score: number;
  size?: number;
  strokeWidth?: number;
  label?: string;
  showBreakdown?: boolean;
  technique?: number;
  rom?: number;
  stability?: number;
  tempo?: number;
}

export const ScoreGauge: React.FC<ScoreGaugeProps> = ({
  score,
  size = 180,
  strokeWidth = 10,
  label = "FORM SCORE",
  showBreakdown = false,
  technique = 88,
  rom = 82,
  stability = 79,
  tempo = 91,
}) => {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const clampedScore = Math.max(0, Math.min(100, score));
  const strokeDashoffset = circumference - (clampedScore / 100) * circumference;

  const getScoreColor = (val: number) => {
    if (val >= 85) return '#C8FF3D'; // Accent lime
    if (val >= 70) return '#FFB84D'; // Warning amber
    return '#FF5C5C'; // Error coral
  };

  const primaryColor = getScoreColor(clampedScore);

  return (
    <div className="flex flex-col items-center">
      <div className="relative" style={{ width: size, height: size }}>
        <svg width={size} height={size} className="transform -rotate-90">
          {/* Background Track */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke="#1c1c1c"
            strokeWidth={strokeWidth}
            fill="transparent"
          />
          {/* Animated Progress Ring */}
          <motion.circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke={primaryColor}
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            fill="transparent"
            initial={{ strokeDashoffset: circumference }}
            animate={{ strokeDashoffset }}
            transition={{ duration: 1.2, ease: "easeOut" }}
            style={{
              strokeDasharray: circumference,
            }}
          />
        </svg>

        {/* Center Display */}
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
          <motion.span 
            className="text-4xl md:text-5xl font-mono font-bold tracking-tight text-white tabular-nums"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
          >
            {Math.round(clampedScore)}
          </motion.span>
          <span className="text-[10px] font-mono tracking-widest uppercase text-[#A1A1A1] mt-0.5">
            {label}
          </span>
        </div>
      </div>

      {/* Biomechanical Component Breakdown */}
      {showBreakdown && (
        <div className="w-full max-w-sm mt-6 grid grid-cols-2 gap-3 text-left">
          <div className="p-3 rounded-lg bg-[#141414] border border-[#1e1e1e]">
            <div className="flex items-center justify-between text-xs text-[#A1A1A1]">
              <span>Technique</span>
              <span className="font-mono font-semibold text-white">{Math.round(technique)}</span>
            </div>
            <div className="w-full bg-[#222222] h-1.5 rounded-full mt-2 overflow-hidden">
              <div 
                className="bg-[#C8FF3D] h-full rounded-full transition-all duration-500" 
                style={{ width: `${technique}%` }} 
              />
            </div>
          </div>

          <div className="p-3 rounded-lg bg-[#141414] border border-[#1e1e1e]">
            <div className="flex items-center justify-between text-xs text-[#A1A1A1]">
              <span>Range of Motion</span>
              <span className="font-mono font-semibold text-white">{Math.round(rom)}</span>
            </div>
            <div className="w-full bg-[#222222] h-1.5 rounded-full mt-2 overflow-hidden">
              <div 
                className="bg-[#C8FF3D] h-full rounded-full transition-all duration-500" 
                style={{ width: `${rom}%` }} 
              />
            </div>
          </div>

          <div className="p-3 rounded-lg bg-[#141414] border border-[#1e1e1e]">
            <div className="flex items-center justify-between text-xs text-[#A1A1A1]">
              <span>Stability</span>
              <span className="font-mono font-semibold text-white">{Math.round(stability)}</span>
            </div>
            <div className="w-full bg-[#222222] h-1.5 rounded-full mt-2 overflow-hidden">
              <div 
                className="bg-[#C8FF3D] h-full rounded-full transition-all duration-500" 
                style={{ width: `${stability}%` }} 
              />
            </div>
          </div>

          <div className="p-3 rounded-lg bg-[#141414] border border-[#1e1e1e]">
            <div className="flex items-center justify-between text-xs text-[#A1A1A1]">
              <span>Tempo</span>
              <span className="font-mono font-semibold text-white">{Math.round(tempo)}</span>
            </div>
            <div className="w-full bg-[#222222] h-1.5 rounded-full mt-2 overflow-hidden">
              <div 
                className="bg-[#C8FF3D] h-full rounded-full transition-all duration-500" 
                style={{ width: `${tempo}%` }} 
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
