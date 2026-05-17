export type AchievementCategory = 'milestone' | 'habit' | 'focus' | 'special';

export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  category: AchievementCategory;
  xpReward: number;
  secret?: boolean; // If true, description is hidden until unlocked
}

export interface UserAchievement {
  id: string;
  unlockedAt: string; // ISO string
}
