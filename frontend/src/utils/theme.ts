// FormiQ Biomechanical HUD & Skeleton Theme Configuration

export interface HudThemeConfig {
  id: string;
  name: string;
  primary: string;         // Main bone color & primary HUD accent
  glow: string;            // Shadow / laser glow RGBA
  jointAccent: string;     // Color for major joint pins (knees, elbows, hips)
  badgeBg: string;         // Background for angle HUD callout pill
  badgeText: string;       // Text color inside angle callout
  badgeBorder: string;     // Border color for angle callout
  laserLine: string;       // Parallel depth laser line color
}

export const HUD_THEMES: Record<string, HudThemeConfig> = {
  'Electric Lime Laser (Default)': {
    id: 'lime',
    name: 'Electric Lime Laser (Default)',
    primary: '#C8FF3D',
    glow: 'rgba(200, 255, 61, 0.55)',
    jointAccent: '#FFFFFF',
    badgeBg: 'rgba(17, 17, 17, 0.90)',
    badgeText: '#C8FF3D',
    badgeBorder: '#C8FF3D',
    laserLine: 'rgba(200, 255, 61, 0.45)',
  },
  'Cyber Cyan HUD': {
    id: 'cyan',
    name: 'Cyber Cyan HUD',
    primary: '#00F0FF',
    glow: 'rgba(0, 240, 255, 0.55)',
    jointAccent: '#FFFFFF',
    badgeBg: 'rgba(10, 25, 35, 0.90)',
    badgeText: '#00F0FF',
    badgeBorder: '#00F0FF',
    laserLine: 'rgba(0, 240, 255, 0.45)',
  },
  'Solar Amber Laser': {
    id: 'amber',
    name: 'Solar Amber Laser',
    primary: '#FFAA00',
    glow: 'rgba(255, 170, 0, 0.55)',
    jointAccent: '#FFFFFF',
    badgeBg: 'rgba(25, 20, 10, 0.90)',
    badgeText: '#FFAA00',
    badgeBorder: '#FFAA00',
    laserLine: 'rgba(255, 170, 0, 0.45)',
  },
  'Infrared Crimson': {
    id: 'crimson',
    name: 'Infrared Crimson',
    primary: '#FF3366',
    glow: 'rgba(255, 51, 102, 0.55)',
    jointAccent: '#FFFFFF',
    badgeBg: 'rgba(30, 10, 15, 0.90)',
    badgeText: '#FF3366',
    badgeBorder: '#FF3366',
    laserLine: 'rgba(255, 51, 102, 0.45)',
  },
  'Minimalist Joint Nodes Only': {
    id: 'mono',
    name: 'Minimalist Joint Nodes Only',
    primary: '#E4E4E7',
    glow: 'rgba(228, 228, 231, 0.30)',
    jointAccent: '#FFFFFF',
    badgeBg: 'rgba(20, 20, 20, 0.90)',
    badgeText: '#FFFFFF',
    badgeBorder: '#71717A',
    laserLine: 'rgba(228, 228, 231, 0.35)',
  },
};

const THEME_STORAGE_KEY = 'formiq_hud_theme';

export function getStoredHudTheme(): HudThemeConfig {
  if (typeof window === 'undefined') return HUD_THEMES['Electric Lime Laser (Default)'];
  const saved = localStorage.getItem(THEME_STORAGE_KEY);
  if (saved && HUD_THEMES[saved]) {
    return HUD_THEMES[saved];
  }
  return HUD_THEMES['Electric Lime Laser (Default)'];
}

export function saveHudTheme(themeName: string): HudThemeConfig {
  const theme = HUD_THEMES[themeName] || HUD_THEMES['Electric Lime Laser (Default)'];
  if (typeof window !== 'undefined') {
    localStorage.setItem(THEME_STORAGE_KEY, theme.name);
    window.dispatchEvent(new CustomEvent('formiq-hud-theme-changed', { detail: theme }));
  }
  return theme;
}
