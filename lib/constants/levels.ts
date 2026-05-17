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
  Diamond 
} from 'lucide-react';

export interface Level {
  level: number;
  title: string;
  titleId: string;
  minXP: number;
  maxXP: number;
  color: string;
  icon: any; // LucideIcon
}

export const LEVELS: Level[] = [
  { level: 1, title: 'Novice', titleId: 'Pemula', minXP: 0, maxXP: 499, color: '#9CA3AF', icon: Leaf },
  { level: 2, title: 'Learner', titleId: 'Pelajar', minXP: 500, maxXP: 1199, color: '#34D399', icon: Sprout },
  { level: 3, title: 'Explorer', titleId: 'Penjelajah', minXP: 1200, maxXP: 2199, color: '#10B981', icon: TreePine },
  { level: 4, title: 'Focused', titleId: 'Fokus', minXP: 2200, maxXP: 3599, color: '#3B82F6', icon: Compass },
  { level: 5, title: 'Dedicated', titleId: 'Berdedikasi', minXP: 3600, maxXP: 5499, color: '#6366F1', icon: Map },
  { level: 6, title: 'Warrior', titleId: 'Pejuang', minXP: 5500, maxXP: 8099, color: '#8B5CF6', icon: Sword },
  { level: 7, title: 'Knight', titleId: 'Ksatria', minXP: 8100, maxXP: 11599, color: '#A855F7', icon: Shield },
  { level: 8, title: 'Ignited', titleId: 'Berkobar', minXP: 11600, maxXP: 16199, color: '#F97316', icon: Flame },
  { level: 9, title: 'Electric', titleId: 'Kilat', minXP: 16200, maxXP: 22199, color: '#EAB308', icon: Zap },
  { level: 10, title: 'Sniper', titleId: 'Jitu', minXP: 22200, maxXP: 29999, color: '#EF4444', icon: Target },
  { level: 11, title: 'Climber', titleId: 'Pendaki', minXP: 30000, maxXP: 39999, color: '#14B8A6', icon: Mountain },
  { level: 12, title: 'Astronaut', titleId: 'Astronot', minXP: 40000, maxXP: 52999, color: '#06B6D4', icon: Rocket },
  { level: 13, title: 'Superstar', titleId: 'Superstar', minXP: 53000, maxXP: 69999, color: '#F43F5E', icon: Star },
  { level: 14, title: 'King', titleId: 'Raja', minXP: 70000, maxXP: 99999, color: '#D946EF', icon: Crown },
  { level: 15, title: 'Discipline God', titleId: 'Dewa Disiplin', minXP: 100000, maxXP: Infinity, color: '#FFFFFF', icon: Diamond },
];

export const getLevelFromXP = (xp: number): Level => {
  for (let i = LEVELS.length - 1; i >= 0; i--) {
    if (xp >= LEVELS[i].minXP) return LEVELS[i];
  }
  return LEVELS[0];
};

export const getProgressToNextLevel = (xp: number): number => {
  const current = getLevelFromXP(xp);
  if (current.level === 15) return 100;
  const range = current.maxXP - current.minXP + 1;
  const progress = xp - current.minXP;
  return Math.min(100, Math.round((progress / range) * 100));
};

export const getXPToNextLevel = (xp: number): number => {
  const current = getLevelFromXP(xp);
  if (current.level === 15) return 0;
  return current.maxXP + 1 - xp;
};
