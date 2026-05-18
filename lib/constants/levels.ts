import { 
  Leaf, 
  Sprout, 
  TreePine, 
  Compass, 
  Map, 
  Sword, 
  Shield, 
  Flame, 
  Zap, 
  Target, 
  Mountain, 
  Rocket, 
  Star, 
  Crown, 
  Diamond,
  Sparkles,
  Trophy
} from 'lucide-react';
import React from 'react';

export interface Level {
  level: number;
  title: string;
  titleId: string;
  minXP: number;
  maxXP: number;
  color: string;
  icon: any; // LucideIcon
}

const ICONS = [
  Leaf, Sprout, TreePine, Compass, Map, Sword, Shield, Flame, Zap, 
  Target, Mountain, Rocket, Star, Crown, Diamond, Sparkles, Trophy
];

const TIER_TITLES: [string, string][] = [
  // Tier 1 (Lv 1-10): The Awakened
  ['Novice', 'Pemula'],
  ['Initiated', 'Terinisiasi'],
  ['Seeker', 'Pencari'],
  ['Focused', 'Fokus'],
  ['Persistent', 'Gigih'],
  ['Resolute', 'Teguh'],
  ['Habit Builder', 'Pembangun Kebiasaan'],
  ['Ignited', 'Berkobar'],
  ['Ascending', 'Menanjak'],
  ['Vanguard', 'Garda Depan'],
  // Tier 2 (Lv 11-20): The Iron Will
  ['Iron Will', 'Tekad Besi'],
  ['Focused Mind', 'Pikiran Terfokus'],
  ['Stoic Apprentice', 'Murid Stoik'],
  ['Self-Master', 'Tuan Diri'],
  ['Unshakable', 'Tak Tergoyahkan'],
  ['Catalyst', 'Katalis'],
  ['Warrior', 'Pejuang'],
  ['Guardian', 'Penjaga'],
  ['Conqueror', 'Penakluk'],
  ['Overcomer', 'Pemenang'],
  // Tier 3 (Lv 21-30): The Flow State
  ['Flow Seeker', 'Pencari Alir'],
  ['Deep Worker', 'Pekerja Keras'],
  ['Focus Knight', 'Ksatria Fokus'],
  ['Mind Master', 'Master Pikiran'],
  ['Elite Planner', 'Perencana Elite'],
  ['Habit Alchemist', 'Alkemis Kebiasaan'],
  ['Constant', 'Konstan'],
  ['Momentum Keeper', 'Penjaga Momentum'],
  ['Force of Nature', 'Kekuatan Alam'],
  ['Unstoppable', 'Tak Terhentikan'],
  // Tier 4 (Lv 31-40): The Tempered Steel
  ['Steel Mind', 'Pikiran Baja'],
  ['Tempered Soul', 'Jiwa Baja'],
  ['Stoic Sage', 'Bijak Stoik'],
  ['Routine Architect', 'Arsitek Rutinitas'],
  ['Daily Zenith', 'Titik Puncak Harian'],
  ['Grid Warrior', 'Pejuang Grid'],
  ['Streak Master', 'Master Streak'],
  ['Discipline Knight', 'Ksatria Disiplin'],
  ['Pure Focus', 'Fokus Murni'],
  ['High Ruler', 'Penguasa Tinggi'],
  // Tier 5 (Lv 41-50): The Master of Time
  ['Chronos Master', 'Master Waktu'],
  ['Peak Performer', 'Pelaku Puncak'],
  ['Daily General', 'Jenderal Harian'],
  ['Routine Emperor', 'Kaisar Rutinitas'],
  ['Apex Focus', 'Fokus Puncak'],
  ['Time Alchemist', 'Alkemis Waktu'],
  ['Momentum Lord', 'Tuan Momentum'],
  ['Habit Overlord', 'Overlord Kebiasaan'],
  ['Zenith Seeker', 'Pencari Puncak'],
  ['Steel Will', 'Tekad Baja'],
  // Tier 6 (Lv 51-60): The Cosmic Discipline
  ['Cosmic Spark', 'Percikan Kosmik'],
  ['Astral Focused', 'Fokus Astral'],
  ['Nova Vanguard', 'Garda Nova'],
  ['Nebula Seeker', 'Nebula Explorer'],
  ['Galactic Stoic', 'Stoik Galaksi'],
  ['Comet Strike', 'Serangan Komet'],
  ['Starlight Guardian', 'Penjaga Bintang'],
  ['Eclipse Conqueror', 'Penakluk Gerhana'],
  ['Void Walker', 'Penebas Hampa'],
  ['Zenith Commander', 'Komandan Puncak'],
  // Tier 7 (Lv 61-70): The Legend of Will
  ['Undefeated', 'Tak Terkalahkan'],
  ['Immortal Will', 'Tekad Abadi'],
  ['Mythic Focused', 'Fokus Mitos'],
  ['Phoenix Rising', 'Kelahiran Phoenix'],
  ['Dragon Heart', 'Jantung Naga'],
  ['Titan of Routine', 'Titan Rutinitas'],
  ['Oracle of Focus', 'Peramal Fokus'],
  ['Sovereign', 'Berdaulat'],
  ['Apex Predator', 'Predator Puncak'],
  ['Legendary Knight', 'Ksatria Legendaris'],
  // Tier 8 (Lv 71-80): The Archon
  ['Archon of Time', 'Archon Waktu'],
  ['Willpower Sentinel', 'Sentinil Tekad'],
  ['Eternal Focus', 'Fokus Abadi'],
  ['Infinite Builder', 'Pembangun Abadi'],
  ['Celestial Stoic', 'Stoik Surgawi'],
  ['Zenith Overlord', 'Overlord Puncak'],
  ['Astral Archon', 'Archon Astral'],
  ['Epoch Master', 'Master Epik'],
  ['Chrono Monarch', 'Monarki Waktu'],
  ['Prime Vanguard', 'Garda Utama'],
  // Tier 9 (Lv 81-90): The Demigod of Focus
  ['Demigod', 'Setengah Dewa'],
  ['Void Conqueror', 'Penakluk Kekosongan'],
  ['Eclipse Monarch', 'Monarki Gerhana'],
  ['Supernova', 'Supernova'],
  ['Cosmic Archon', 'Archon Kosmik'],
  ['Singularity', 'Singularitas'],
  ['Absolute Focus', 'Fokus Mutlak'],
  ['Iron Overlord', 'Overlord Besi'],
  ['Eternal Sovereign', 'Penguasa Abadi'],
  ['Prime Arbiter', 'Arbiter Utama'],
  // Tier 10 (Lv 91-100): The Divine Discipline
  ['Divine Spark', 'Percikan Ilahi'],
  ['Zenith Sovereign', 'Penguasa Puncak'],
  ['Time Architect', 'Arsitek Waktu'],
  ['Absolute Ruler', 'Penguasa Mutlak'],
  ['Transcendent', 'Transenden'],
  ['Cosmic Mind', 'Pikiran Kosmik'],
  ['Infinity Lord', 'Tuan Tak Terbatas'],
  ['Eternal Legend', 'Legenda Abadi'],
  ['Discipline God', 'Dewa Disiplin'],
  ['The Ultimate One', 'Puncak Semesta'],
];

export const LEVELS: Level[] = [];

const hslToHex = (h: number, s: number, l: number): string => {
  l /= 100;
  const a = (s * Math.min(l, 1 - l)) / 100;
  const f = (n: number) => {
    const k = (n + h / 30) % 12;
    const color = l - a * Math.max(Math.min(k - 3, 9 - k, 1), -1);
    return Math.round(255 * color).toString(16).padStart(2, '0');
  };
  return `#${f(0)}${f(8)}${f(4)}`;
};

// Programmatic Level generator up to Level 100
const generateLevels = () => {
  const baseRanges = [
    { min: 0, max: 499 },       // 1
    { min: 500, max: 1199 },    // 2
    { min: 1200, max: 2199 },   // 3
    { min: 2200, max: 3599 },   // 4
    { min: 3600, max: 5499 },   // 5
    { min: 5500, max: 8099 },   // 6
    { min: 8100, max: 11599 },  // 7
    { min: 11600, max: 16199 }, // 8
    { min: 16200, max: 22199 }, // 9
    { min: 22200, max: 29999 }, // 10
    { min: 30000, max: 39999 }, // 11
    { min: 40000, max: 52999 }, // 12
    { min: 53000, max: 69999 }, // 13
    { min: 70000, max: 99999 }, // 14
  ];

  let currentMin = 100000;

  for (let L = 1; L <= 100; L++) {
    let minXP = 0;
    let maxXP = 0;

    if (L <= 14) {
      minXP = baseRanges[L - 1].min;
      maxXP = baseRanges[L - 1].max;
    } else if (L === 100) {
      minXP = currentMin;
      maxXP = Infinity;
    } else {
      minXP = currentMin;
      // Exponential RPG scaling formula for Level 15 to 99
      const range = Math.round(30000 + 5000 * (L - 14) + 200 * (L - 14) * (L - 14));
      maxXP = minXP + range - 1;
      currentMin = maxXP + 1;
    }

    // Dynamic HSL colors for levels converted to HEX strings
    let color = '';
    if (L === 1) color = '#9CA3AF'; // Novice Slate
    else if (L === 2) color = '#34D399'; // Emerald
    else if (L === 3) color = '#10B981'; // Green
    else {
      // Golden spiral hue distribution for dynamic beautiful HSL values
      const hue = Math.round((L * 137.5) % 360);
      color = hslToHex(hue, 85, 60);
    }

    // Cycles beautifully through premium discipline icons
    const iconIndex = (L - 1) % ICONS.length;
    const icon = ICONS[iconIndex];

    const titleInfo = TIER_TITLES[L - 1] || ['Discipline God', 'Dewa Disiplin'];

    LEVELS.push({
      level: L,
      title: titleInfo[0],
      titleId: titleInfo[1],
      minXP,
      maxXP,
      color,
      icon
    });
  }
};

generateLevels();

export const getLevelFromXP = (xp: number): Level => {
  for (let i = LEVELS.length - 1; i >= 0; i--) {
    if (xp >= LEVELS[i].minXP) return LEVELS[i];
  }
  return LEVELS[0];
};

export const getProgressToNextLevel = (xp: number): number => {
  const current = getLevelFromXP(xp);
  if (current.level === 100) return 100;
  const range = current.maxXP - current.minXP + 1;
  const progress = xp - current.minXP;
  return Math.min(100, Math.round((progress / range) * 100));
};

export const getXPToNextLevel = (xp: number): number => {
  const current = getLevelFromXP(xp);
  if (current.level === 100) return 0;
  return current.maxXP + 1 - xp;
};

export interface LevelStyle {
  background: string;
  color: string;
  border: string;
  boxShadow?: string;
  fontWeight?: string;
  letterSpacing?: string;
  animation?: string;
  textShadow?: string;
}

// Programmatically scales gradients, glows, neon borders, and animations up to level 100
export const getLevelBadgeStyle = (levelNumber: number, color: string): LevelStyle => {
  // Low Levels (1-3)
  if (levelNumber <= 3) {
    return {
      background: `${color}15`,
      color: color,
      border: `1px solid ${color}35`,
      boxShadow: 'none',
    };
  }

  // Tier 1 - Mid Levels (4-30): Linear gradients
  if (levelNumber <= 30) {
    return {
      background: `linear-gradient(135deg, ${color}20, ${color}05)`,
      color: color,
      border: `1px solid ${color}40`,
    };
  }

  // Tier 2 - High Levels (31-60): Intense linear gradients + glowing box shadows & pulse animation
  if (levelNumber <= 60) {
    return {
      background: `linear-gradient(135deg, ${color}25, ${color}08)`,
      color: color,
      border: `1px solid ${color}60`,
      boxShadow: `0 0 10px ${color}35`,
      animation: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
    };
  }

  // Tier 3 - Legendary Levels (61-90): Bold gradients, thicker borders, and vibrant glows
  if (levelNumber <= 90) {
    return {
      background: `linear-gradient(135deg, ${color}30, ${color}10)`,
      color: color,
      border: `2px solid ${color}80`,
      boxShadow: `0 0 14px ${color}50`,
      animation: 'pulse 1.5s cubic-bezier(0.4, 0, 0.6, 1) infinite',
    };
  }

  // Tier 4 - Divine Mythic Tiers (91-100): Pure holographic crystalline shifts
  return {
    background: `linear-gradient(135deg, ${color}55, rgba(255, 255, 255, 0.35), ${color}15)`,
    color: '#FFF',
    border: `2px solid ${color}aa`,
    boxShadow: `0 0 20px ${color}80, inset 0 0 8px rgba(255, 255, 255, 0.4)`,
    fontWeight: 'black',
    letterSpacing: '0.05em',
    textShadow: `0 0 8px ${color}`,
    animation: 'pulse 1.2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
  };
};

// Generates dynamic card styling for the Sidebar promo card based on the current level color/tier
export const getLevelCardStyle = (levelNumber: number, color: string): React.CSSProperties => {
  // Low Levels (1-3)
  if (levelNumber <= 3) {
    return {
      background: 'rgba(99, 102, 241, 0.05)',
      border: '1px solid var(--border)',
      borderRadius: '16px',
      padding: '1rem',
      boxShadow: 'none',
      transition: 'all 0.3s ease',
    };
  }

  // Mid Levels (4-30): Soft neon borders and glowing shadows
  if (levelNumber <= 30) {
    return {
      background: `linear-gradient(135deg, ${color}08, rgba(255, 255, 255, 0.01))`,
      border: `1px solid ${color}30`,
      borderRadius: '16px',
      padding: '1rem',
      boxShadow: `0 4px 15px rgba(0,0,0,0.2), 0 0 10px ${color}08`,
      transition: 'all 0.3s ease',
    };
  }

  // High Levels (31-60): Thicker borders, stronger inner/outer glows & gentle pulsing
  if (levelNumber <= 60) {
    return {
      background: `linear-gradient(135deg, ${color}12, rgba(255, 255, 255, 0.02))`,
      border: `1.5px solid ${color}45`,
      borderRadius: '16px',
      padding: '1rem',
      boxShadow: `0 6px 20px rgba(0,0,0,0.3), 0 0 14px ${color}15`,
      animation: 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      transition: 'all 0.3s ease',
    };
  }

  // Legendary Levels (61-90): Thick neon borders, deep colorful glows
  if (levelNumber <= 90) {
    return {
      background: `linear-gradient(135deg, ${color}18, rgba(255, 255, 255, 0.03))`,
      border: `2px solid ${color}60`,
      borderRadius: '16px',
      padding: '1rem',
      boxShadow: `0 8px 25px rgba(0,0,0,0.4), 0 0 20px ${color}25`,
      animation: 'pulse 2.2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      transition: 'all 0.3s ease',
    };
  }

  // Mythic Levels (91-100): Pure divine crystal holograph shift
  return {
    background: `linear-gradient(135deg, ${color}25, rgba(255, 255, 255, 0.06), ${color}06)`,
    border: `2.5px solid ${color}90`,
    borderRadius: '16px',
    padding: '1rem',
    boxShadow: `0 10px 35px rgba(0,0,0,0.5), 0 0 28px ${color}35, inset 0 0 12px rgba(255, 255, 255, 0.1)`,
    animation: 'pulse 1.6s cubic-bezier(0.4, 0, 0.6, 1) infinite',
    transition: 'all 0.3s ease',
  };
};
