'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { User } from 'firebase/auth';
import { DailyStats } from '@/types/user';
import { HabitId } from '@/types/habit';
import { UserAchievement, Achievement } from '@/types/achievement';
import { ACHIEVEMENTS } from '@/lib/constants/achievements';
import { getLevelFromXP } from '@/lib/constants/levels';
import { AppNotification, NotificationType } from '@/types/notification';

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

  // Prayer Location
  prayerCityId: string;
  prayerCityName: string;

  // Sleep Tracker
  isSleeping: boolean;
  sleepStartTime: number | null;

  // Achievements
  unlockedAchievements: UserAchievement[];
  newAchievement: Achievement | null;

  // Notifications
  notifications: AppNotification[];

  // Actions
  setUser: (user: User | null) => void;
  setTotalXP: (xp: number) => void;
  setTodayStats: (stats: DailyStats) => void;
  setTheme: (theme: 'dark' | 'light') => void;
  toggleTheme: () => void;
  setLoading: (loading: boolean) => void;
  setMorningLock: (open: boolean) => void;
  setEmergencyPanel: (open: boolean) => void;
  setPrayerCity: (id: string, name: string) => void;
  toggleSleep: () => void;
  completeHabit: (habitId: HabitId, xp: number) => void;
  updateWater: (glasses: number) => void;
  updateMeals: (meals: number) => void;
  updateSleep: (hours: number) => void;
  updateMood: (mood: number) => void;
  updateScreenTime: (minutes: number) => void;
  updateFocusMinutes: (minutes: number) => void;
  toggleMorningReset: (taskId: number) => void;
  addFocusTask: (task: { id: string; label: string; tag: string; done: boolean }) => void;
  toggleFocusTask: (taskId: string) => void;
  removeFocusTask: (taskId: string) => void;
  breakTheLoop: () => void;
  addXP: (amount: number) => void;
  setNewAchievement: (a: Achievement | null) => void;
  unlockAchievementLocal: (achievementId: string) => void;
  checkAchievements: () => void;

  // Notifications Actions
  addNotification: (title: string, message: string, type: NotificationType, xpReward?: number) => void;
  markAllAsRead: () => void;
  clearAllNotifications: () => void;
  removeNotification: (id: string) => void;
}

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      user: null,
      totalXP: 0,
      todayStats: null,
      todayDate: '',
      isLoading: true,
      theme: 'dark',
      morningLockOpen: false,
      emergencyPanelOpen: false,
      prayerCityId: '1301',
      prayerCityName: 'Kota Jakarta',
      isSleeping: false,
      sleepStartTime: null,
      unlockedAchievements: [],
      newAchievement: null,
      notifications: [],

      setUser: (user) => set({ user }),
      setTotalXP: (xp) => set({ totalXP: xp }),
      setTodayStats: (stats) => set({ todayStats: stats }),
      setTheme: (theme) => set({ theme }),
      toggleTheme: () => set((s) => ({ theme: s.theme === 'dark' ? 'light' : 'dark' })),
      setLoading: (loading) => set({ isLoading: loading }),
      setMorningLock: (open) => set({ morningLockOpen: open }),
      setEmergencyPanel: (open) => set({ emergencyPanelOpen: open }),
      setPrayerCity: (id, name) => set({ prayerCityId: id, prayerCityName: name }),
      toggleSleep: () => set((state) => {
        if (state.isSleeping) {
          return { isSleeping: false, sleepStartTime: null };
        } else {
          return { isSleeping: true, sleepStartTime: Date.now() };
        }
      }),

      completeHabit: (habitId, xp) => {
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
        });
        get().checkAchievements();
      },

      updateWater: (glasses) => {
        set((state) => ({
          todayStats: state.todayStats
            ? { ...state.todayStats, waterGlasses: glasses }
            : null,
        }));
        get().checkAchievements();
      },
        
      updateMeals: (meals) => {
        set((state) => ({
          todayStats: state.todayStats
            ? { ...state.todayStats, meals }
            : null,
        }));
        get().checkAchievements();
      },

      updateSleep: (hours) => {
        set((state) => ({
          todayStats: state.todayStats
            ? { ...state.todayStats, sleepHours: hours }
            : null,
        }));
        get().checkAchievements();
      },

      updateMood: (mood) => {
        set((state) => ({
          todayStats: state.todayStats
            ? { ...state.todayStats, mood }
            : null,
        }));
        get().checkAchievements();
      },

      updateScreenTime: (minutes) => {
        set((state) => ({
          todayStats: state.todayStats
            ? { ...state.todayStats, screenTimeMinutes: minutes }
            : null,
        }));
        get().checkAchievements();
      },

      updateFocusMinutes: (minutes) => {
        set((state) => ({
          todayStats: state.todayStats
            ? { ...state.todayStats, focusMinutes: minutes }
            : null,
        }));
        get().checkAchievements();
      },

      toggleMorningReset: (taskId) => {
        set((state) => {
          if (!state.todayStats) return {};
          const current = state.todayStats.morningResetComplete || [];
          const next = current.includes(taskId) 
            ? current.filter(id => id !== taskId)
            : [...current, taskId];
          return { todayStats: { ...state.todayStats, morningResetComplete: next } };
        });
        get().checkAchievements();
      },

      addFocusTask: (task) =>
        set((state) => {
          if (!state.todayStats) return {};
          const current = state.todayStats.focusTasks || [];
          return { todayStats: { ...state.todayStats, focusTasks: [...current, task] } };
        }),

      toggleFocusTask: (taskId) =>
        set((state) => {
          if (!state.todayStats) return {};
          const current = state.todayStats.focusTasks || [];
          const next = current.map(t => t.id === taskId ? { ...t, done: !t.done } : t);
          return { todayStats: { ...state.todayStats, focusTasks: next } };
        }),

      removeFocusTask: (taskId) =>
        set((state) => {
          if (!state.todayStats) return {};
          const current = state.todayStats.focusTasks || [];
          const next = current.filter(t => t.id !== taskId);
          return { todayStats: { ...state.todayStats, focusTasks: next } };
        }),

      breakTheLoop: () =>
        set((state) => {
          if (!state.todayStats) return {};
          return { todayStats: { ...state.todayStats, breakTheLoopDone: true } };
        }),

      addXP: (amount) => {
        const oldLevel = getLevelFromXP(get().totalXP).level;
        set((state) => {
          if (!state.todayStats) return { totalXP: state.totalXP + amount };
          return {
            todayStats: { ...state.todayStats, xpEarned: (state.todayStats.xpEarned || 0) + amount },
            totalXP: state.totalXP + amount
          };
        });
        const newLevel = getLevelFromXP(get().totalXP).level;
        if (newLevel > oldLevel) {
          get().addNotification(
            '⚡ Level Up!',
            `Selamat! Anda telah naik ke Level ${newLevel}. Pertahankan disiplin Anda!`,
            'streak'
          );
        }
        get().checkAchievements();
      },

      setNewAchievement: (a) => set({ newAchievement: a }),

      addNotification: (title, message, type, xpReward) => {
        const id = Math.random().toString(36).substring(2, 9);
        const newNotif: AppNotification = {
          id,
          title,
          message,
          timestamp: new Date().toISOString(),
          type,
          read: false,
          xpReward
        };
        set((state) => {
          const list = [newNotif, ...(state.notifications || [])].slice(0, 50);
          return { notifications: list };
        });
      },

      markAllAsRead: () => {
        set((state) => ({
          notifications: (state.notifications || []).map((n) => ({ ...n, read: true }))
        }));
      },

      clearAllNotifications: () => {
        set({ notifications: [] });
      },

      removeNotification: (id) => {
        set((state) => ({
          notifications: (state.notifications || []).filter((n) => n.id !== id)
        }));
      },

      unlockAchievementLocal: async (achievementId) => {
        const state = get();
        if (state.unlockedAchievements.some(a => a.id === achievementId)) return;
        
        const newAchievementRecord: UserAchievement = {
          id: achievementId,
          unlockedAt: new Date().toISOString()
        };
        
        set({
          unlockedAchievements: [...state.unlockedAchievements, newAchievementRecord]
        });

        const definition = ACHIEVEMENTS.find(a => a.id === achievementId);
        if (definition) {
          set({ newAchievement: definition });
          get().addXP(definition.xpReward);
          get().addNotification(
            '🏆 Piala Baru Terbuka!',
            `Selamat! Anda membuka pencapaian "${definition.title}": ${definition.description}`,
            'achievement',
            definition.xpReward
          );
        }

        // Save to Firestore if user is logged in
        if (state.user) {
          try {
            const { unlockAchievement } = await import('@/lib/firebase/firestore');
            await unlockAchievement(state.user.uid, newAchievementRecord);
          } catch (e) {
            console.error("Failed to save achievement to Firestore", e);
          }
        }
      },

      checkAchievements: () => {
        const state = get();
        const { todayStats, totalXP, unlockedAchievements } = state;
        if (!todayStats) return;

        // 1. First step
        if (!unlockedAchievements.some(a => a.id === 'first_step')) {
          if (todayStats.morningResetComplete?.length === 4) get().unlockAchievementLocal('first_step');
        }
        // 2. Hydration Master
        if (!unlockedAchievements.some(a => a.id === 'hydration_master')) {
          if ((todayStats.waterGlasses || 0) >= 8) get().unlockAchievementLocal('hydration_master');
        }
        // 3. Deep Worker
        if (!unlockedAchievements.some(a => a.id === 'deep_worker')) {
          if ((todayStats.focusMinutes || 0) >= 100) get().unlockAchievementLocal('deep_worker');
        }
        // 4. Focus Beast
        if (!unlockedAchievements.some(a => a.id === 'focus_beast')) {
          if ((todayStats.focusMinutes || 0) >= 200) get().unlockAchievementLocal('focus_beast');
        }
        // 5. Morning Champion
        if (!unlockedAchievements.some(a => a.id === 'morning_champion')) {
          if (todayStats.morningResetComplete?.length === 4) get().unlockAchievementLocal('morning_champion');
        }
        // 6. Mindfulness Master
        if (!unlockedAchievements.some(a => a.id === 'mindfulness_master')) {
          if ((todayStats.mood || 0) >= 4) get().unlockAchievementLocal('mindfulness_master');
        }
        // 7. Screen Time Slayer
        if (!unlockedAchievements.some(a => a.id === 'screen_time_slayer')) {
          if (todayStats.screenTimeMinutes && todayStats.screenTimeMinutes > 0 && todayStats.screenTimeMinutes <= 120) {
            get().unlockAchievementLocal('screen_time_slayer');
          }
        }
        // 8. Loop Breaker
        if (!unlockedAchievements.some(a => a.id === 'loop_breaker')) {
          if (todayStats.breakTheLoopDone === true) get().unlockAchievementLocal('loop_breaker');
        }
        // 9. Veteran
        if (!unlockedAchievements.some(a => a.id === 'veteran')) {
          if (getLevelFromXP(totalXP).level >= 5) get().unlockAchievementLocal('veteran');
        }
        // 10. Night Owl No More
        if (!unlockedAchievements.some(a => a.id === 'night_owl_no_more')) {
          if ((todayStats.sleepHours || 0) >= 7) get().unlockAchievementLocal('night_owl_no_more');
        }
        // 11. Completionist
        if (!unlockedAchievements.some(a => a.id === 'completionist')) {
          const unlockedCount = unlockedAchievements.filter(a => a.id !== 'completionist').length;
          if (unlockedCount >= 5) get().unlockAchievementLocal('completionist');
        }
        // 12. Perfect Day
        if (!unlockedAchievements.some(a => a.id === 'perfect_day')) {
          if ((todayStats.completedHabits?.length || 0) >= 16) get().unlockAchievementLocal('perfect_day');
        }
      }
    }),
    {
      name: 'life-os-storage',
      partialize: (state) => ({
        theme: state.theme,
        totalXP: state.totalXP,
        prayerCityId: state.prayerCityId,
        prayerCityName: state.prayerCityName,
        isSleeping: state.isSleeping,
        sleepStartTime: state.sleepStartTime,
        unlockedAchievements: state.unlockedAchievements,
        notifications: state.notifications,
      }),
    }
  )
);
