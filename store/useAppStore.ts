'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { User } from 'firebase/auth';
import { HabitId, CustomCategory, HabitDefinition } from '@/types/habit';
import { UserAchievement, Achievement } from '@/types/achievement';
import { ACHIEVEMENTS } from '@/lib/constants/achievements';
import { getLevelFromXP } from '@/lib/constants/levels';
import { AppNotification, NotificationType } from '@/types/notification';
import { playMechanicalClick, playCrystalChime } from '@/lib/utils/sound';
import { DailyQuest, DailyStats } from '@/types/user';

const checkQuestCompletions = (
  stats: DailyStats | null,
  totalXP: number,
  addNotification: (title: string, message: string, type: NotificationType, xpReward?: number) => void,
  silent: boolean = false
): { stats: DailyStats | null; xpAdded: number } => {
  if (!stats || !stats.dailyQuests || stats.dailyQuests.length === 0) return { stats, xpAdded: 0 };

  let xpAdded = 0;
  let hasChanges = false;

  const updatedQuests = stats.dailyQuests.map((q) => {
    if (q.completed) return q;

    let isCompleted = false;
    switch (q.targetType) {
      case 'water':
        isCompleted = (stats.waterGlasses || 0) >= q.targetValue;
        break;
      case 'meals':
        isCompleted = (stats.meals || 0) >= q.targetValue;
        break;
      case 'sleep':
        isCompleted = (stats.sleepHours || 0) >= q.targetValue;
        break;
      case 'focus':
        isCompleted = (stats.focusMinutes || 0) >= q.targetValue;
        break;
      case 'habit_count':
        isCompleted = (stats.completedHabits || []).length >= q.targetValue;
        break;
      case 'screen_time_limit':
        isCompleted = (stats.screenTimeMinutes || 0) > 0 && (stats.screenTimeMinutes || 0) <= q.targetValue;
        break;
      case 'morning_habits':
        const pagiHabits = ['mandi', 'sholat_subuh', 'morning_reset', 'baca_buku'];
        isCompleted = pagiHabits.every((id) => stats.completedHabits.includes(id));
        break;
      case 'custom_habit':
        isCompleted = (stats.completedHabits || []).includes(q.targetHabitId || '');
        break;
    }

    if (isCompleted) {
      xpAdded += q.xpBonus;
      hasChanges = true;

      // Trigger Confetti & Chime on client side if not silent
      if (!silent && typeof window !== 'undefined') {
        setTimeout(() => {
          import('canvas-confetti').then((confetti) => {
            confetti.default({
              particleCount: 70,
              spread: 60,
              origin: { y: 0.6 },
            });
          });
          playCrystalChime();
        }, 100);
      }

      if (!silent) {
        addNotification(
          '🎯 Misi Harian Selesai!',
          `Misi "${q.label}" berhasil diselesaikan. +${q.xpBonus} XP diperoleh!`,
          'achievement',
          q.xpBonus
        );
      }

      return { ...q, completed: true };
    }
    return q;
  });

  if (hasChanges) {
    return {
      stats: {
        ...stats,
        dailyQuests: updatedQuests,
        xpEarned: (stats.xpEarned || 0) + xpAdded,
      },
      xpAdded,
    };
  }

  return { stats, xpAdded: 0 };
};

const autoCheckDailyRules = (key: 'sleep' | 'water' | 'screen_time' | 'focus', value: number) => {
  if (typeof window === 'undefined') return;
  try {
    const saved = localStorage.getItem('life_os_daily_rules');
    if (!saved) return;
    const rules = JSON.parse(saved);
    let changed = false;
    let xpAwarded = 0;
    const updated = rules.map((r: any) => {
      if (r.completed) return r;
      let completed = false;
      const lbl = r.label.toLowerCase();
      
      if (key === 'water' && (lbl.includes('minum') || lbl.includes('air') || lbl.includes('gelas')) && value >= 8) {
        completed = true;
      } else if (key === 'screen_time' && (lbl.includes('screen time') || lbl.includes('detox') || lbl.includes('hp') || lbl.includes('tiktok') || lbl.includes('layar')) && value > 0 && value <= 120) {
        completed = true;
      } else if (key === 'sleep' && (lbl.includes('tidur') || lbl.includes('sleep') || lbl.includes('ranjang')) && value > 0) {
        completed = true;
      } else if (key === 'focus' && (lbl.includes('fokus') || lbl.includes('focus') || lbl.includes('pomodoro') || lbl.includes('kerja')) && value >= 60) {
        completed = true;
      }
      
      if (completed) {
        changed = true;
        xpAwarded += 10;
        return { ...r, completed: true };
      }
      return r;
    });
    
    if (changed) {
      localStorage.setItem('life_os_daily_rules', JSON.stringify(updated));
      window.dispatchEvent(new Event('storage'));
      window.dispatchEvent(new Event('life-os-rules-updated'));
      if (xpAwarded > 0) {
        try {
          useAppStore.getState().addXP(xpAwarded);
        } catch (e) {}
      }
    }
  } catch (e) {
    console.error('Error in autoCheckDailyRules:', e);
  }
};

export interface CustomGoal {
  id: string;
  label: string;
  done: boolean;
  iconName: string;
  createdAt: number;
}

interface AppState {
  // Auth (not persisted — Firebase User is not serializable)
  user: User | null;
  realUser: User | null;
  isImpersonating: boolean;
  totalXP: number;
  customTitle: string;

  // Daily Data
  todayStats: DailyStats | null;
  todayDate: string;
  isLoading: boolean;

  // Theme
  theme: 'dark' | 'light';

  // Gamifikasi Liga & Streak
  disciplineStreak: number;
  league: 'bronze' | 'silver' | 'gold' | 'diamond';

  // Morning Lock
  morningLockOpen: boolean;

  // Emergency Panel
  emergencyPanelOpen: boolean;

  // Prayer Location
  prayerCityId: string;
  prayerCityName: string;

  // Prayer Notification / Alert Settings
  prayerAlertsEnabled: boolean;
  prayerAlertBeforeMins: number; // 0 (off), 5, 10, 15
  tahajjudAlertEnabled: boolean;
  dhuhaAlertEnabled: boolean;

  // Sleep Tracker
  isSleeping: boolean;
  sleepStartTime: number | null;

  // Achievements
  unlockedAchievements: UserAchievement[];
  newAchievement: Achievement | null;
  focusDuelsWon: number;

  // Notifications
  notifications: AppNotification[];

  // Soundscape & Level Up Celebration
  soundEnabled: boolean;
  setSoundEnabled: (enabled: boolean) => void;
  levelUpCelebration: number | null;
  setLevelUpCelebration: (level: number | null) => void;

  setPrayerAlertsEnabled: (enabled: boolean) => void;
  setPrayerAlertBeforeMins: (mins: number) => void;
  setTahajjudAlertEnabled: (enabled: boolean) => void;
  setDhuhaAlertEnabled: (enabled: boolean) => void;

  // Actions
  setUser: (user: User | null) => void;
  setRealUser: (user: User | null) => void;
  setIsImpersonating: (val: boolean) => void;
  setDisciplineStreak: (streak: number) => void;
  setLeague: (league: 'bronze' | 'silver' | 'gold' | 'diamond') => void;
  setTotalXP: (xp: number) => void;
  setCustomTitle: (title: string) => void;
  setTodayStats: (stats: DailyStats | null) => void;
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
  incrementFocusDuelsWon: () => void;
  setUnlockedAchievements: (achievements: UserAchievement[]) => void;

  // Notifications Actions
  addNotification: (title: string, message: string, type: NotificationType, xpReward?: number) => void;
  markAllAsRead: () => void;
  clearAllNotifications: () => void;
  removeNotification: (id: string) => void;

  // Custom Categories & Habits
  customCategories: CustomCategory[];
  customHabits: HabitDefinition[];
  setCustomCategories: (categories: CustomCategory[]) => void;
  setCustomHabits: (habits: HabitDefinition[]) => void;
  addCustomCategory: (label: string, emoji: string, id?: string) => void;
  deleteCustomCategory: (id: string) => void;
  addCustomHabit: (categoryId: string, labelId: string, icon: string, deadline?: string) => void;
  deleteCustomHabit: (id: string) => void;

  // Custom Goals
  customGoals: CustomGoal[];
  setCustomGoals: (goals: CustomGoal[]) => void;
  addCustomGoal: (label: string, iconName: string) => void;
  toggleCustomGoal: (id: string) => void;
  deleteCustomGoal: (id: string) => void;

  // Tutorial Walkthrough
  hasCompletedTutorial: boolean;
  setHasCompletedTutorial: (val: boolean) => void;
}

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      user: null,
      realUser: null,
      isImpersonating: false,
      totalXP: 0,
      customTitle: '',
      todayStats: null,
      todayDate: '',
      isLoading: true,
      theme: 'dark',
      disciplineStreak: 0,
      league: 'bronze',
      morningLockOpen: false,
      emergencyPanelOpen: false,
      prayerCityId: '1301',
      prayerCityName: 'Kota Jakarta',
      prayerAlertsEnabled: true,
      prayerAlertBeforeMins: 15,
      tahajjudAlertEnabled: false,
      dhuhaAlertEnabled: false,
      isSleeping: false,
      sleepStartTime: null,
      unlockedAchievements: [],
      newAchievement: null,
      focusDuelsWon: 0,
      notifications: [],
      customCategories: [
        { id: 'morning', label: 'Pagi', emoji: '🌅', order: 1 },
        { id: 'focus', label: 'Fokus', emoji: '🎯', order: 2 },
        { id: 'night', label: 'Malam', emoji: '🌙', order: 3 }
      ],
      customHabits: [],
      soundEnabled: true,
      levelUpCelebration: null,
      hasCompletedTutorial: false,
      customGoals: [
        { id: 'g1', label: 'Upload Pertama di Marketplace', done: false, iconName: 'Rocket', createdAt: Date.now() },
        { id: 'g2', label: 'Klien Freelance Pertama', done: false, iconName: 'Trophy', createdAt: Date.now() },
        { id: 'g3', label: 'Streak 7 Hari', done: false, iconName: 'Flame', createdAt: Date.now() },
        { id: 'g4', label: 'Naik ke Level 5', done: false, iconName: 'Zap', createdAt: Date.now() },
      ],

      setUser: (user) => set({ user }),
      setRealUser: (realUser) => set({ realUser }),
      setIsImpersonating: (isImpersonating) => set({ isImpersonating }),
      setDisciplineStreak: (streak) => {
        set({ disciplineStreak: streak });
        const { user, league } = get();
        if (user) {
          import('@/lib/firebase/firestore').then(({ syncUserProfile }) => {
            syncUserProfile(user.uid, { disciplineStreak: streak, league });
          });
        }
      },
      setLeague: (league) => {
        set({ league });
        const { user, disciplineStreak } = get();
        if (user) {
          import('@/lib/firebase/firestore').then(({ syncUserProfile }) => {
            syncUserProfile(user.uid, { league, disciplineStreak });
          });
        }
      },
      setPrayerAlertsEnabled: (enabled) => set({ prayerAlertsEnabled: enabled }),
      setPrayerAlertBeforeMins: (mins) => set({ prayerAlertBeforeMins: mins }),
      setTahajjudAlertEnabled: (enabled) => set({ tahajjudAlertEnabled: enabled }),
      setDhuhaAlertEnabled: (enabled) => set({ dhuhaAlertEnabled: enabled }),
      incrementFocusDuelsWon: () => {
        set((state) => ({ focusDuelsWon: (state.focusDuelsWon || 0) + 1 }));
        get().checkAchievements();
      },
      setTotalXP: (xp) => set({ totalXP: xp }),
      setCustomTitle: (title) => {
        set({ customTitle: title });
        const { user } = get();
        if (user) {
          import('@/lib/firebase/firestore').then(({ syncUserProfile }) => {
            syncUserProfile(user.uid, { customTitle: title });
          });
        }
      },
      setTodayStats: (stats) => {
        if (!stats) {
          set({ todayStats: null });
          return;
        }
        set((state) => {
          const questResult = checkQuestCompletions(stats, state.totalXP, get().addNotification, true);
          return {
            todayStats: questResult.stats,
            totalXP: state.totalXP + questResult.xpAdded,
          };
        });
      },
      setTheme: (theme) => set({ theme }),
      toggleTheme: () => set((s) => ({ theme: s.theme === 'dark' ? 'light' : 'dark' })),
      setSoundEnabled: (enabled) => set({ soundEnabled: enabled }),
      setLevelUpCelebration: (level) => set({ levelUpCelebration: level }),
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
        playMechanicalClick();
        const oldLevel = getLevelFromXP(get().totalXP).level;
        set((state) => {
          const stats = state.todayStats;
          if (!stats) return {};
          const completedHabits = stats.completedHabits.includes(habitId)
            ? stats.completedHabits
            : [...stats.completedHabits, habitId];
          const interimStats = {
            ...stats,
            completedHabits,
            xpEarned: stats.xpEarned + xp,
          };
          const questResult = checkQuestCompletions(interimStats, state.totalXP + xp, get().addNotification);
          return {
            todayStats: questResult.stats,
            totalXP: state.totalXP + xp + questResult.xpAdded,
          };
        });
        const newLevel = getLevelFromXP(get().totalXP).level;
        if (newLevel > oldLevel) {
          set({ levelUpCelebration: newLevel });
          get().addNotification(
            '⚡ Level Up!',
            `Selamat! Anda telah naik ke Level ${newLevel}. Pertahankan disiplin Anda!`,
            'streak'
          );
        }
        get().checkAchievements();
      },

      updateWater: (glasses) => {
        playMechanicalClick();
        const oldLevel = getLevelFromXP(get().totalXP).level;
        set((state) => {
          if (!state.todayStats) return {};
          const interimStats = { ...state.todayStats, waterGlasses: glasses };
          const questResult = checkQuestCompletions(interimStats, state.totalXP, get().addNotification);
          return {
            todayStats: questResult.stats,
            totalXP: state.totalXP + questResult.xpAdded
          };
        });
        const newLevel = getLevelFromXP(get().totalXP).level;
        if (newLevel > oldLevel) {
          set({ levelUpCelebration: newLevel });
        }
        get().checkAchievements();
        autoCheckDailyRules('water', glasses);
      },
        
      updateMeals: (meals) => {
        playMechanicalClick();
        const oldLevel = getLevelFromXP(get().totalXP).level;
        set((state) => {
          if (!state.todayStats) return {};
          const interimStats = { ...state.todayStats, meals };
          const questResult = checkQuestCompletions(interimStats, state.totalXP, get().addNotification);
          return {
            todayStats: questResult.stats,
            totalXP: state.totalXP + questResult.xpAdded
          };
        });
        const newLevel = getLevelFromXP(get().totalXP).level;
        if (newLevel > oldLevel) {
          set({ levelUpCelebration: newLevel });
        }
        get().checkAchievements();
      },

      updateSleep: (hours) => {
        const oldLevel = getLevelFromXP(get().totalXP).level;
        set((state) => {
          if (!state.todayStats) return {};
          const interimStats = { ...state.todayStats, sleepHours: hours };
          const questResult = checkQuestCompletions(interimStats, state.totalXP, get().addNotification);
          return {
            todayStats: questResult.stats,
            totalXP: state.totalXP + questResult.xpAdded
          };
        });
        const newLevel = getLevelFromXP(get().totalXP).level;
        if (newLevel > oldLevel) {
          set({ levelUpCelebration: newLevel });
        }
        get().checkAchievements();
        autoCheckDailyRules('sleep', hours);
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
        const oldLevel = getLevelFromXP(get().totalXP).level;
        set((state) => {
          if (!state.todayStats) return {};
          const interimStats = { ...state.todayStats, screenTimeMinutes: minutes };
          const questResult = checkQuestCompletions(interimStats, state.totalXP, get().addNotification);
          return {
            todayStats: questResult.stats,
            totalXP: state.totalXP + questResult.xpAdded
          };
        });
        const newLevel = getLevelFromXP(get().totalXP).level;
        if (newLevel > oldLevel) {
          set({ levelUpCelebration: newLevel });
        }
        get().checkAchievements();
        autoCheckDailyRules('screen_time', minutes);
      },

      updateFocusMinutes: (minutes) => {
        const oldLevel = getLevelFromXP(get().totalXP).level;
        set((state) => {
          if (!state.todayStats) return {};
          const interimStats = { ...state.todayStats, focusMinutes: minutes };
          const questResult = checkQuestCompletions(interimStats, state.totalXP, get().addNotification);
          return {
            todayStats: questResult.stats,
            totalXP: state.totalXP + questResult.xpAdded
          };
        });
        const newLevel = getLevelFromXP(get().totalXP).level;
        if (newLevel > oldLevel) {
          set({ levelUpCelebration: newLevel });
        }
        get().checkAchievements();
        autoCheckDailyRules('focus', minutes);
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
        const { disciplineStreak, user, league } = get();
        const hasMultiplier = disciplineStreak >= 7;
        const multiplier = hasMultiplier ? 1.2 : 1.0;
        const originalAmount = amount;
        const finalAmount = Math.round(amount * multiplier);
        const bonusAmount = finalAmount - originalAmount;

        const oldLevel = getLevelFromXP(get().totalXP).level;
        set((state) => {
          if (!state.todayStats) return { totalXP: state.totalXP + finalAmount };
          return {
            todayStats: { ...state.todayStats, xpEarned: (state.todayStats.xpEarned || 0) + finalAmount },
            totalXP: state.totalXP + finalAmount
          };
        });

        if (bonusAmount > 0) {
          get().addNotification(
            '🔥 Pengganda XP Aktif!',
            `Mendapat +${finalAmount} XP (Bonus +${bonusAmount} XP dari ${disciplineStreak} Hari Streak!)`,
            'streak'
          );
        }

        const newLevel = getLevelFromXP(get().totalXP).level;
        if (newLevel > oldLevel) {
          set({ levelUpCelebration: newLevel });
          get().addNotification(
            '⚡ Level Up!',
            `Selamat! Anda telah naik ke Level ${newLevel}. Pertahankan disiplin Anda!`,
            'streak'
          );
        }

        if (user) {
          import('@/lib/firebase/firestore').then(({ syncUserProfile }) => {
            syncUserProfile(user.uid, {
              totalXP: get().totalXP,
              disciplineStreak,
              league
            });
          });
        }

        get().checkAchievements();
      },

      setNewAchievement: (a) => set({ newAchievement: a }),
      setUnlockedAchievements: (achievements) => set({ unlockedAchievements: achievements }),

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

      setCustomCategories: (categories) => set({ customCategories: categories }),
      setCustomHabits: (habits) => set({ customHabits: habits }),

      addCustomCategory: async (label, emoji, id) => {
        const { customCategories, user } = get();
        const newCat: CustomCategory = {
          id: id || 'cat_' + Date.now(),
          label,
          emoji,
          order: customCategories.length + 1
        };
        const updated = [...customCategories, newCat];
        set({ customCategories: updated });
        if (user) {
          try {
            const { saveCustomCategories } = await import('@/lib/firebase/firestore');
            await saveCustomCategories(user.uid, updated);
          } catch (e) { console.error(e); }
        }
      },

      deleteCustomCategory: async (id) => {
        const { customCategories, customHabits, user } = get();
        const updatedCats = customCategories.filter(c => c.id !== id);
        const updatedHabits = customHabits.filter(h => h.category !== id);
        set({ customCategories: updatedCats, customHabits: updatedHabits });
        if (user) {
          try {
            const { saveCustomCategories, saveCustomHabits } = await import('@/lib/firebase/firestore');
            await saveCustomCategories(user.uid, updatedCats);
            await saveCustomHabits(user.uid, updatedHabits);
          } catch (e) { console.error(e); }
        }
      },

      addCustomHabit: async (categoryId, labelId, icon, deadline) => {
        const { customHabits, user } = get();
        const newHabit: HabitDefinition = {
          id: 'custom_' + Date.now(),
          label: labelId,
          labelId,
          description: `Custom habit in category`,
          category: categoryId,
          icon,
          xp: 15, // FLAT 15 XP!
          deadline,
        };
        const updated = [...customHabits, newHabit];
        set({ customHabits: updated });
        if (user) {
          try {
            const { saveCustomHabits } = await import('@/lib/firebase/firestore');
            await saveCustomHabits(user.uid, updated);
          } catch (e) { console.error(e); }
        }
      },

      deleteCustomHabit: async (id) => {
        const { customHabits, user } = get();
        const updated = customHabits.filter(h => h.id !== id);
        set({ customHabits: updated });
        if (user) {
          try {
            const { saveCustomHabits } = await import('@/lib/firebase/firestore');
            await saveCustomHabits(user.uid, updated);
          } catch (e) { console.error(e); }
        }
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
        // 13. Fajr Ascended
        if (!unlockedAchievements.some(a => a.id === 'fajr_ascended')) {
          const userId = state.user?.uid;
          if (userId) {
            import('@/lib/firebase/firestore').then(({ getRecentStats }) => {
              getRecentStats(userId, 7).then((recentStats) => {
                if (recentStats && recentStats.length >= 7) {
                  const completedAll = recentStats.every(day => day.completedHabits?.includes('prayer_fajr'));
                  if (completedAll) {
                    get().unlockAchievementLocal('fajr_ascended');
                  }
                }
              }).catch(console.error);
            });
          }
        }
        // 14. Midnight Caller
        if (!unlockedAchievements.some(a => a.id === 'midnight_caller')) {
          if (state.tahajjudAlertEnabled && todayStats.completedHabits?.includes('prayer_tahajjud')) {
            get().unlockAchievementLocal('midnight_caller');
          }
        }
        // 15. Focus Gladiator
        if (!unlockedAchievements.some(a => a.id === 'focus_gladiator')) {
          if ((state.focusDuelsWon || 0) >= 5) {
            get().unlockAchievementLocal('focus_gladiator');
          }
        }
        // 16. Time Alchemist
        if (!unlockedAchievements.some(a => a.id === 'time_alchemist')) {
          const userId = state.user?.uid;
          if (userId) {
            import('@/lib/firebase/firestore').then(({ getRecentStats }) => {
              getRecentStats(userId, 3).then((recentStats) => {
                if (recentStats && recentStats.length >= 3) {
                  const completedAll = recentStats.every(day => {
                    const tasks = day.focusTasks || [];
                    return tasks.length > 0 && tasks.every(t => t.done);
                  });
                  if (completedAll) {
                    get().unlockAchievementLocal('time_alchemist');
                  }
                }
              }).catch(console.error);
            });
          }
        }
        // 17. Dopamine Sovereign
        if (!unlockedAchievements.some(a => a.id === 'dopamine_sovereign')) {
          const userId = state.user?.uid;
          if (userId) {
            import('@/lib/firebase/firestore').then(({ getRecentStats }) => {
              getRecentStats(userId, 5).then((recentStats) => {
                if (recentStats && recentStats.length >= 5) {
                  const cleanAll = recentStats.every(day => day.dopamineStatus === 'clean');
                  if (cleanAll) {
                    get().unlockAchievementLocal('dopamine_sovereign');
                  }
                }
              }).catch(console.error);
            });
          }
        }
        // 18. Loop Shatterer
        if (!unlockedAchievements.some(a => a.id === 'loop_shatterer')) {
          if (todayStats.breakTheLoopDone === true && (todayStats.focusMinutes || 0) >= 25) {
            get().unlockAchievementLocal('loop_shatterer');
          }
        }
        // 19. Diamond Sovereign
        if (!unlockedAchievements.some(a => a.id === 'league_conqueror')) {
          if (state.league === 'diamond') {
            get().unlockAchievementLocal('league_conqueror');
          }
        }
        // 20. Multiplier Deity
        if (!unlockedAchievements.some(a => a.id === 'multiplier_deity')) {
          if ((state.disciplineStreak || 0) >= 14) {
            get().unlockAchievementLocal('multiplier_deity');
          }
        }
        // 21. Radiant Faith
        if (!unlockedAchievements.some(a => a.id === 'radiant_faith')) {
          const userId = state.user?.uid;
          if (userId) {
            import('@/lib/firebase/firestore').then(({ getRecentStats }) => {
              getRecentStats(userId, 5).then((recentStats) => {
                if (recentStats && recentStats.length >= 5) {
                  const completedAll = recentStats.every(day => day.completedHabits?.includes('prayer_dhuha'));
                  if (completedAll) {
                    get().unlockAchievementLocal('radiant_faith');
                  }
                }
              }).catch(console.error);
            });
          }
        }
        // 22. Zenith Mind
        if (!unlockedAchievements.some(a => a.id === 'zenith_mind')) {
          if (todayStats.morningResetComplete?.length === 4 && todayStats.completedHabits?.includes('prayer_dhuha')) {
            get().unlockAchievementLocal('zenith_mind');
          }
        }
      },

      setCustomGoals: (goals) => {
        set({ customGoals: goals });
        // Sync to cloud
        const userId = get().user?.uid;
        if (userId) {
          import('@/lib/firebase/firestore').then(({ syncUserProfile }) => {
            syncUserProfile(userId, { customGoals: goals });
          });
        }
      },
      addCustomGoal: (label, iconName) => {
        const newGoal = {
          id: `goal_${Date.now()}`,
          label,
          done: false,
          iconName,
          createdAt: Date.now()
        };
        const updated = [...get().customGoals, newGoal];
        set({ customGoals: updated });

        if (get().soundEnabled) playMechanicalClick();

        // Sync to cloud
        const userId = get().user?.uid;
        if (userId) {
          import('@/lib/firebase/firestore').then(({ syncUserProfile }) => {
            syncUserProfile(userId, { customGoals: updated });
          });
        }
      },
      toggleCustomGoal: (id) => {
        const oldGoals = get().customGoals;
        let goalCompletedNow = false;
        const updated = oldGoals.map((g) => {
          if (g.id === id) {
            const nextDone = !g.done;
            if (nextDone) {
              goalCompletedNow = true;
            }
            return { ...g, done: nextDone };
          }
          return g;
        });
        set({ customGoals: updated });

        if (get().soundEnabled) {
          if (goalCompletedNow) {
            playCrystalChime();
          } else {
            playMechanicalClick();
          }
        }

        if (goalCompletedNow) {
          get().addXP(100);
          get().addNotification(
            '🏆 Goal Tercapai!',
            `Selamat! Anda menyelesaikan goal kustom Anda. +100 XP diperoleh!`,
            'achievement',
            100
          );
        }

        // Sync to cloud
        const userId = get().user?.uid;
        if (userId) {
          import('@/lib/firebase/firestore').then(({ syncUserProfile }) => {
            syncUserProfile(userId, { customGoals: updated });
          });
        }
      },
      deleteCustomGoal: (id) => {
        const updated = get().customGoals.filter((g) => g.id !== id);
        set({ customGoals: updated });

        if (get().soundEnabled) playMechanicalClick();

        // Sync to cloud
        const userId = get().user?.uid;
        if (userId) {
          import('@/lib/firebase/firestore').then(({ syncUserProfile }) => {
            syncUserProfile(userId, { customGoals: updated });
          });
        }
      },

      setHasCompletedTutorial: (val) => {
        set({ hasCompletedTutorial: val });
        const userId = get().user?.uid;
        if (userId) {
          import('@/lib/firebase/firestore').then(({ syncUserProfile }) => {
            syncUserProfile(userId, { hasCompletedTutorial: val });
          });
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
        customCategories: state.customCategories,
        customHabits: state.customHabits,
        prayerAlertsEnabled: state.prayerAlertsEnabled,
        prayerAlertBeforeMins: state.prayerAlertBeforeMins,
        tahajjudAlertEnabled: state.tahajjudAlertEnabled,
        dhuhaAlertEnabled: state.dhuhaAlertEnabled,
        customGoals: state.customGoals,
        hasCompletedTutorial: state.hasCompletedTutorial,
        focusDuelsWon: state.focusDuelsWon,
      }),
    }
  )
);
