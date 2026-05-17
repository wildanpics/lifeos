// Habit Types
export type HabitId =
  | 'sweep'
  | 'shower'
  | 'no_tiktok_morning'
  | 'prayer_fajr'
  | 'prayer_dhuhr'
  | 'prayer_asr'
  | 'prayer_maghrib'
  | 'prayer_isya'
  | 'focus_1h'
  | 'no_tiktok_night'
  | 'sleep_before_23'
  | 'eat_breakfast'
  | 'eat_lunch'
  | 'eat_dinner'
  | 'eat_snack'
  | 'water_8'
  | 'exercise'
  | 'freelance_work';

export type HabitCategory = 'morning' | 'prayer' | 'focus' | 'health' | 'night' | 'freelance';

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
