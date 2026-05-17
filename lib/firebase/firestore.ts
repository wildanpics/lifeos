import {
  doc,
  getDoc,
  setDoc,
  updateDoc,
  collection,
  query,
  where,
  getDocs,
  orderBy,
  limit,
  serverTimestamp,
} from 'firebase/firestore';
import { db } from './config';
import { DailyStats, Reflection } from '@/types/user';
import { HabitLog, HabitStreak } from '@/types/habit';
import { FocusSession } from '@/types/focus';
import { UserAchievement } from '@/types/achievement';

// === Daily Stats ===
export const getTodayStats = async (userId: string, date: string): Promise<DailyStats | null> => {
  const ref = doc(db, 'users', userId, 'dailyStats', date);
  const snap = await getDoc(ref);
  if (!snap.exists()) return null;
  return snap.data() as DailyStats;
};

export const initTodayStats = async (userId: string, date: string): Promise<DailyStats> => {
  const ref = doc(db, 'users', userId, 'dailyStats', date);
  const initial: DailyStats = {
    date,
    userId,
    mood: 3,
    sleepHours: 0,
    screenTimeMinutes: 0,
    focusMinutes: 0,
    meals: 0,
    waterGlasses: 0,
    xpEarned: 0,
    completedHabits: [],
    morningLockUnlocked: false,
    dopamineStatus: 'clean',
  };
  await setDoc(ref, initial, { merge: true });
  return initial;
};

export const updateDailyStats = async (
  userId: string,
  date: string,
  updates: Partial<DailyStats>
) => {
  const ref = doc(db, 'users', userId, 'dailyStats', date);
  await setDoc(ref, updates, { merge: true });
};

// === Habit Logs ===
export const logHabit = async (log: HabitLog) => {
  const ref = doc(db, 'users', log.userId, 'habitLogs', `${log.date}_${log.habitId}`);
  await setDoc(ref, { ...log, completedAt: serverTimestamp() });
};

export const getHabitLogsForDate = async (userId: string, date: string): Promise<HabitLog[]> => {
  const ref = collection(db, 'users', userId, 'habitLogs');
  const q = query(ref, where('date', '==', date));
  const snap = await getDocs(q);
  return snap.docs.map((d) => d.data() as HabitLog);
};

// === Habit Streaks ===
export const getHabitStreak = async (userId: string, habitId: string): Promise<HabitStreak | null> => {
  const ref = doc(db, 'users', userId, 'habitStreaks', habitId);
  const snap = await getDoc(ref);
  if (!snap.exists()) return null;
  return snap.data() as HabitStreak;
};

export const updateHabitStreak = async (userId: string, habitId: string, streak: Partial<HabitStreak>) => {
  const ref = doc(db, 'users', userId, 'habitStreaks', habitId);
  await setDoc(ref, streak, { merge: true });
};

// === Focus Sessions ===
export const saveFocusSession = async (session: FocusSession) => {
  const ref = doc(db, 'users', session.userId, 'focusSessions', session.id);
  await setDoc(ref, session);
};

export const getFocusSessionsForDate = async (userId: string, date: string): Promise<FocusSession[]> => {
  const ref = collection(db, 'users', userId, 'focusSessions');
  const q = query(ref, where('date', '==', date), orderBy('startTime', 'desc'));
  const snap = await getDocs(q);
  return snap.docs.map((d) => d.data() as FocusSession);
};

// === Reflection ===
export const saveReflection = async (reflection: Reflection) => {
  const ref = doc(db, 'users', reflection.userId, 'reflections', reflection.date);
  await setDoc(ref, { ...reflection, createdAt: serverTimestamp() });
};

export const getReflection = async (userId: string, date: string): Promise<Reflection | null> => {
  const ref = doc(db, 'users', userId, 'reflections', date);
  const snap = await getDoc(ref);
  if (!snap.exists()) return null;
  return snap.data() as Reflection;
};

// === Analytics - get last N days ===
export const getRecentStats = async (userId: string, days: number = 7): Promise<DailyStats[]> => {
  const ref = collection(db, 'users', userId, 'dailyStats');
  const q = query(ref, orderBy('date', 'desc'), limit(days));
  const snap = await getDocs(q);
  return snap.docs.map((d) => d.data() as DailyStats);
};

// === User XP ===
export const getUserXP = async (userId: string): Promise<number> => {
  const ref = doc(db, 'users', userId);
  const snap = await getDoc(ref);
  if (!snap.exists()) return 0;
  return snap.data().totalXP || 0;
};

export const addXP = async (userId: string, amount: number): Promise<number> => {
  const ref = doc(db, 'users', userId);
  const snap = await getDoc(ref);
  const current = snap.exists() ? (snap.data().totalXP || 0) : 0;
  const newTotal = current + amount;
  await setDoc(ref, { totalXP: newTotal }, { merge: true });
  return newTotal;
};

// === Achievements ===
export const getUserAchievements = async (userId: string): Promise<UserAchievement[]> => {
  const ref = doc(db, 'users', userId);
  const snap = await getDoc(ref);
  if (!snap.exists()) return [];
  return snap.data().unlockedAchievements || [];
};

export const unlockAchievement = async (userId: string, achievement: UserAchievement) => {
  const ref = doc(db, 'users', userId);
  const snap = await getDoc(ref);
  const current = snap.exists() ? (snap.data().unlockedAchievements || []) : [];
  
  // Check if already unlocked
  if (current.some((a: UserAchievement) => a.id === achievement.id)) return;
  
  const newAchievements = [...current, achievement];
  await setDoc(ref, { unlockedAchievements: newAchievements }, { merge: true });
};
