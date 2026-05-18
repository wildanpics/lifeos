// Habit Types
export type HabitId = string;
export type HabitCategory = string;

export interface CustomCategory {
  id: string;
  label: string;
  emoji: string;
  order: number;
}

export interface HabitDefinition {
  id: HabitId;
  label: string;
  labelId: string; // Bahasa Indonesia
  description: string;
  category: HabitCategory;
  icon: string;
  xp: number;
  deadline?: string; // HH:mm — time-based rule
  isMorningLock?: boolean; // Required for morning lock
  streakBonus?: boolean;
  isHidden?: boolean; // Hide from standard list (e.g. for custom UI integrations)
}

export interface HabitLog {
  habitId: HabitId;
  userId: string;
  date: string; // YYYY-MM-DD
  completedAt: Date;
  xpEarned: number;
}

export interface HabitStreak {
  habitId: HabitId;
  userId: string;
  currentStreak: number;
  longestStreak: number;
  lastCompletedDate: string;
}

export interface HabitProgress {
  completed: HabitId[];
  total: number;
  percentage: number;
  xpToday: number;
}
