// Analytics Types
export interface DailyAnalytics {
  date: string;
  productivity: number; // 0-100
  mood: number; // 1-5
  sleepHours: number;
  focusMinutes: number;
  habitsCompleted: number;
  xpEarned: number;
  dopamineScore: number; // 0-100, higher = cleaner
}

export interface WeeklyAnalytics {
  week: string; // YYYY-WW
  avgProductivity: number;
  avgMood: number;
  avgSleep: number;
  totalFocusMinutes: number;
  totalXP: number;
  habitCompletionRate: number;
  days: DailyAnalytics[];
}

export type AnalyticsPeriod = 'week' | 'month' | '3months';
