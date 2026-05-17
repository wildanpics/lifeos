export interface Level {
  level: number;
  title: string;
  titleId: string;
  minXP: number;
  maxXP: number;
  color: string;
  emoji: string;
}

export const LEVELS: Level[] = [
  { level: 1, title: 'Newbie', titleId: 'Pemula Baru', minXP: 0, maxXP: 199, color: '#6B7280', emoji: '🌱' },
  { level: 2, title: 'Beginner', titleId: 'Pemula', minXP: 200, maxXP: 449, color: '#10B981', emoji: '🌿' },
  { level: 3, title: 'Active', titleId: 'Aktif', minXP: 450, maxXP: 799, color: '#3B82F6', emoji: '⚡' },
  { level: 4, title: 'Consistent', titleId: 'Konsisten', minXP: 800, maxXP: 1199, color: '#8B5CF6', emoji: '🔥' },
  { level: 5, title: 'Disciplined', titleId: 'Disiplin', minXP: 1200, maxXP: 1799, color: '#F59E0B', emoji: '⚔️' },
  { level: 6, title: 'Productive', titleId: 'Produktif', minXP: 1800, maxXP: 2599, color: '#EC4899', emoji: '🎯' },
  { level: 7, title: 'Highly Focused', titleId: 'Fokus Tinggi', minXP: 2600, maxXP: 3599, color: '#14B8A6', emoji: '🧠' },
  { level: 8, title: 'Elite', titleId: 'Elite', minXP: 3600, maxXP: 4999, color: '#F97316', emoji: '👑' },
  { level: 9, title: 'Master', titleId: 'Master', minXP: 5000, maxXP: 6999, color: '#EF4444', emoji: '🏆' },
  { level: 10, title: 'Disciplined God', titleId: 'Dewa Disiplin', minXP: 7000, maxXP: Infinity, color: '#6366F1', emoji: '⚡' },
];

export const getLevelFromXP = (xp: number): Level => {
  for (let i = LEVELS.length - 1; i >= 0; i--) {
    if (xp >= LEVELS[i].minXP) return LEVELS[i];
  }
  return LEVELS[0];
};

export const getProgressToNextLevel = (xp: number): number => {
  const current = getLevelFromXP(xp);
  if (current.level === 10) return 100;
  const range = current.maxXP - current.minXP + 1;
  const progress = xp - current.minXP;
  return Math.min(100, Math.round((progress / range) * 100));
};

export const getXPToNextLevel = (xp: number): number => {
  const current = getLevelFromXP(xp);
  if (current.level === 10) return 0;
  return current.maxXP + 1 - xp;
};
