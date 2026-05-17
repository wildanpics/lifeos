// User & Auth Types
export interface UserProfile {
  uid: string;
  email: string;
  displayName: string;
  photoURL?: string;
  city?: string;
  cityId?: number;
  createdAt: Date;
  onboardingComplete: boolean;
  preferences: UserPreferences;
}

export interface UserPreferences {
  theme: 'dark' | 'light' | 'system';
  notificationsEnabled: boolean;
  language: 'en' | 'id';
}

export interface FocusTask {
  id: string;
  label: string;
  tag: string;
  done: boolean;
}

export interface DailyStats {
  date: string; // YYYY-MM-DD
  userId: string;
  mood: number; // 1-5
  sleepHours: number;
  sleepBedtime?: string; // HH:mm
  sleepWakeTime?: string; // HH:mm
  sleepScore?: number;
  screenTimeMinutes: number;
  focusMinutes: number;
  meals: number; // count 0-4
  waterGlasses: number; // 0-8
  xpEarned: number;
  completedHabits: string[];
  morningLockUnlocked: boolean;
  dopamineStatus: 'clean' | 'distracted' | 'overstimulated';
  morningResetComplete?: number[]; // IDs of completed morning routines
  focusTasks?: FocusTask[]; // User's daily main focus tasks
  breakTheLoopDone?: boolean;
}

export interface Reflection {
  date: string;
  userId: string;
  bestMoment: string;
  failure: string;
  planTomorrow: string;
  createdAt: Date;
}
