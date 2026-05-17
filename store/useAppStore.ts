'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { User } from 'firebase/auth';
import { DailyStats } from '@/types/user';
import { HabitId } from '@/types/habit';

interface AppState {
  // Auth (not persisted — Firebase User is not serializable)
  user: User | null;
  totalXP: number;

  // Daily Data
  todayStats: DailyStats | null;
  todayDate: string;
  isLoading: boolean;

  // Theme
  theme: 'dark' | 'light';

  // Morning Lock
  morningLockOpen: boolean;

  // Emergency Panel
  emergencyPanelOpen: boolean;

  // Actions
  setUser: (user: User | null) => void;
  setTotalXP: (xp: number) => void;
  setTodayStats: (stats: DailyStats) => void;
  setTheme: (theme: 'dark' | 'light') => void;
  toggleTheme: () => void;
  setLoading: (loading: boolean) => void;
  setMorningLock: (open: boolean) => void;
  setEmergencyPanel: (open: boolean) => void;
  completeHabit: (habitId: HabitId, xp: number) => void;
  updateWater: (glasses: number) => void;
  updateMood: (mood: number) => void;
  updateScreenTime: (minutes: number) => void;
  updateFocusMinutes: (minutes: number) => void;
}

export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      user: null,
      totalXP: 0,
      todayStats: null,
      todayDate: '',
      isLoading: true,
      theme: 'dark',
      morningLockOpen: false,
      emergencyPanelOpen: false,

      setUser: (user) => set({ user }),
      setTotalXP: (xp) => set({ totalXP: xp }),
      setTodayStats: (stats) => set({ todayStats: stats }),
      setTheme: (theme) => set({ theme }),
      toggleTheme: () => set((s) => ({ theme: s.theme === 'dark' ? 'light' : 'dark' })),
      setLoading: (loading) => set({ isLoading: loading }),
      setMorningLock: (open) => set({ morningLockOpen: open }),
      setEmergencyPanel: (open) => set({ emergencyPanelOpen: open }),

      completeHabit: (habitId, xp) =>
        set((state) => {
          const stats = state.todayStats;
          if (!stats) return {};
          const completedHabits = stats.completedHabits.includes(habitId)
            ? stats.completedHabits
            : [...stats.completedHabits, habitId];
          return {
            todayStats: {
              ...stats,
              completedHabits,
              xpEarned: stats.xpEarned + xp,
            },
            totalXP: state.totalXP + xp,
          };
        }),

      updateWater: (glasses) =>
        set((state) => ({
          todayStats: state.todayStats
            ? { ...state.todayStats, waterGlasses: glasses }
            : null,
        })),

      updateMood: (mood) =>
        set((state) => ({
          todayStats: state.todayStats
            ? { ...state.todayStats, mood }
            : null,
        })),

      updateScreenTime: (minutes) =>
        set((state) => ({
          todayStats: state.todayStats
            ? { ...state.todayStats, screenTimeMinutes: minutes }
            : null,
        })),

      updateFocusMinutes: (minutes) =>
        set((state) => ({
          todayStats: state.todayStats
            ? { ...state.todayStats, focusMinutes: minutes }
            : null,
        })),
    }),
    {
      name: 'life-os-storage',
      // Only persist theme & totalXP — user must come from Firebase, not localStorage
      partialize: (state) => ({
        theme: state.theme,
        totalXP: state.totalXP,
      }),
    }
  )
);
