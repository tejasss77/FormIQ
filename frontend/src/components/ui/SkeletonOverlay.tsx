import React, { useEffect, useRef, useState } from 'react';
import { HudThemeConfig, getStoredHudTheme } from '../../utils/theme';

interface Landmark {
  id: number;
  x: number;
  y: number;
  z?: number;
  visibility?: number;
}

interface SkeletonOverlayProps {
  landmarks: Landmark[];
  width: number;
  height: number;
  metrics?: Record<string, any>;
  mirror?: boolean;
  themeConfig?: HudThemeConfig;
  showAngleOverlays?: boolean;
}

// Landmark pairs for biomechanical skeleton bones
const CONNECTIONS: [number, number][] = [
  // Face & Head
  [0, 1], [1, 2], [2, 3], [3, 7],
  [0, 4], [4, 5], [5, 6], [6, 8],
  [9, 10],
  // Shoulders & Clavicle
  [11, 12],
  // Left Arm
  [11, 13], [13, 15],
  // Right Arm
  [12, 14], [14, 16],
  // Torso / Spine Box
  [11, 23], [12, 24], [23, 24],
  // Left Leg
  [23, 25], [25, 27], [27, 29], [27, 31],
  // Right Leg
  [24, 26], [26, 28], [28, 30], [28, 32],
];

export const SkeletonOverlay: React.FC<SkeletonOverlayProps> = ({
  landmarks,
  width,
  height,
  metrics,
  mirror = true,
  themeConfig: customTheme,
  showAngleOverlays = true,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [activeTheme, setActiveTheme] = useState<HudThemeConfig>(() => customTheme || getStoredHudTheme());

  // Listen to live theme changes from Settings
  useEffect(() => {
    if (customTheme) {
      setActiveTheme(customTheme);
      return;
    }
    const handleThemeChange = (e: any) => {
      if (e.detail) {
        setActiveTheme(e.detail);
      }
    };
    window.addEventListener('formiq-hud-theme-changed', handleThemeChange);
    return () => window.removeEventListener('formiq-hud-theme-changed', handleThemeChange);
  }, [customTheme]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, width, height);

    if (!landmarks || landmarks.length === 0) return;

    const lmMap = new Map<number, Landmark>();
    landmarks.forEach((lm) => lmMap.set(lm.id, lm));

    const getX = (val: number) => (mirror ? (1 - val) * width : val * width);
    const getY = (val: number) => val * height;

    const theme = activeTheme || getStoredHudTheme();
    const isMinimalMono = theme.id === 'mono';

    // 1. Draw Bones
    if (!isMinimalMono) {
      ctx.lineWidth = 3.5;
      ctx.lineCap = 'round';
      ctx.shadowBlur = 12;
      ctx.shadowColor = theme.glow;
      ctx.strokeStyle = theme.primary;

      CONNECTIONS.forEach(([startIdx, endIdx]) => {
        const p1 = lmMap.get(startIdx);
        const p2 = lmMap.get(endIdx);

        if (p1 && p2 && (p1.visibility ?? 1) > 0.35 && (p2.visibility ?? 1) > 0.35) {
          ctx.beginPath();
          ctx.moveTo(getX(p1.x), getY(p1.y));
          ctx.lineTo(getX(p2.x), getY(p2.y));
          ctx.stroke();
        }
      });
    } else {
      // Subtle faint bones for minimalist mode
      ctx.lineWidth = 1.5;
      ctx.lineCap = 'round';
      ctx.shadowBlur = 0;
      ctx.strokeStyle = 'rgba(228, 228, 231, 0.35)';

      CONNECTIONS.forEach(([startIdx, endIdx]) => {
        const p1 = lmMap.get(startIdx);
        const p2 = lmMap.get(endIdx);

        if (p1 && p2 && (p1.visibility ?? 1) > 0.35 && (p2.visibility ?? 1) > 0.35) {
          ctx.beginPath();
          ctx.moveTo(getX(p1.x), getY(p1.y));
          ctx.lineTo(getX(p2.x), getY(p2.y));
          ctx.stroke();
        }
      });
    }

    // 2. Draw Kinematic Joint Nodes
    ctx.shadowBlur = 14;
    ctx.shadowColor = theme.glow;

    landmarks.forEach((lm) => {
      if ((lm.visibility ?? 1) < 0.35) return;
      const x = getX(lm.x);
      const y = getY(lm.y);

      // Key joints get accented circles
      const isKeyJoint = [11, 12, 13, 14, 23, 24, 25, 26].includes(lm.id);

      ctx.beginPath();
      ctx.arc(x, y, isKeyJoint ? 5.5 : 4, 0, 2 * Math.PI);
      ctx.fillStyle = isKeyJoint ? theme.jointAccent : theme.primary;
      ctx.fill();

      ctx.beginPath();
      ctx.arc(x, y, isKeyJoint ? 8 : 6, 0, 2 * Math.PI);
      ctx.strokeStyle = theme.primary;
      ctx.lineWidth = 1.5;
      ctx.stroke();
    });

    // 3. Draw Biomechanical Angle Callout Badges (if enabled)
    if (showAngleOverlays) {
      ctx.shadowBlur = 0;
      ctx.font = '600 12px "JetBrains Mono", monospace';

      // Knee angle callout
      if (metrics?.knee_angle !== undefined) {
        const knee = lmMap.get(25) || lmMap.get(26);
        if (knee && (knee.visibility ?? 1) > 0.35) {
          const kx = getX(knee.x) + 16;
          const ky = getY(knee.y) - 6;

          ctx.fillStyle = theme.badgeBg;
          ctx.strokeStyle = theme.badgeBorder;
          ctx.lineWidth = 1.2;
          ctx.beginPath();
          ctx.roundRect(kx - 4, ky - 16, 60, 24, 6);
          ctx.fill();
          ctx.stroke();

          ctx.fillStyle = theme.badgeText;
          ctx.fillText(`${Math.round(metrics.knee_angle)}°`, kx + 8, ky);
        }
      }

      // Elbow angle callout
      if (metrics?.elbow_angle !== undefined) {
        const elbow = lmMap.get(13) || lmMap.get(14);
        if (elbow && (elbow.visibility ?? 1) > 0.35) {
          const ex = getX(elbow.x) + 16;
          const ey = getY(elbow.y) - 6;

          ctx.fillStyle = theme.badgeBg;
          ctx.strokeStyle = theme.badgeBorder;
          ctx.lineWidth = 1.2;
          ctx.beginPath();
          ctx.roundRect(ex - 4, ey - 16, 60, 24, 6);
          ctx.fill();
          ctx.stroke();

          ctx.fillStyle = theme.badgeText;
          ctx.fillText(`${Math.round(metrics.elbow_angle)}°`, ex + 8, ey);
        }
      }
    }
  }, [landmarks, width, height, metrics, mirror, activeTheme, showAngleOverlays]);

  return (
    <canvas
      ref={canvasRef}
      width={width}
      height={height}
      className="absolute inset-0 pointer-events-none z-10 w-full h-full object-cover"
    />
  );
};
