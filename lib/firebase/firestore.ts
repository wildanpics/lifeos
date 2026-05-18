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
  deleteDoc,
} from 'firebase/firestore';
import { db } from './config';
import { DailyStats, Reflection, DailyQuest } from '@/types/user';
import { HabitLog, HabitStreak, CustomCategory, HabitDefinition } from '@/types/habit';
import { FocusSession } from '@/types/focus';
import { UserAchievement } from '@/types/achievement';

// Helper to recursively strip undefined values to prevent Firestore setDoc/addDoc crashes
function cleanUndefined(obj: any): any {
  if (obj === null || obj === undefined) {
    return null;
  }
  if (Array.isArray(obj)) {
    return obj.map(cleanUndefined);
  }
  if (Object.prototype.toString.call(obj) === '[object Object]') {
    // Return custom non-plain Firestore object types like FieldValue/Timestamp directly
    if (obj.constructor && obj.constructor !== Object) {
      return obj;
    }
    const cleaned: any = {};
    for (const key in obj) {
      if (Object.prototype.hasOwnProperty.call(obj, key)) {
        const val = obj[key];
        if (val !== undefined) {
          cleaned[key] = cleanUndefined(val);
        }
      }
    }
    return cleaned;
  }
  return obj;
}

// === Daily Stats ===
const QUEST_POOL = [
  { label: "Minum 8 gelas air hari ini", targetType: "water", targetValue: 8, xpBonus: 50 },
  { label: "Makan teratur 3 kali hari ini", targetType: "meals", targetValue: 3, xpBonus: 50 },
  { label: "Tidur berkualitas minimal 7 jam", targetType: "sleep", targetValue: 7, xpBonus: 50 },
  { label: "Selesaikan sesi fokus 30 menit", targetType: "focus", targetValue: 30, xpBonus: 50 },
  { label: "Selesaikan minimal 5 habit hari ini", targetType: "habit_count", targetValue: 5, xpBonus: 50 },
  { label: "Digital detox: screen time di bawah 120m", targetType: "screen_time_limit", targetValue: 120, xpBonus: 50 },
  { label: "Selesaikan minimal 7 habit hari ini", targetType: "habit_count", targetValue: 7, xpBonus: 50 }
];

const getRandomQuests = (): DailyQuest[] => {
  const shuffled = [...QUEST_POOL].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, 3).map((q, idx) => ({
    id: `quest_${idx}_${Date.now()}`,
    label: q.label,
    targetType: q.targetType as any,
    targetValue: q.targetValue,
    completed: false,
    xpBonus: q.xpBonus
  }));
};

export const getTodayStats = async (userId: string, date: string): Promise<DailyStats | null> => {
  const ref = doc(db, 'users', userId, 'dailyStats', date);
  const snap = await getDoc(ref);
  if (!snap.exists()) return null;
  const stats = snap.data() as DailyStats;

  // Self-heal: If document exists but dailyQuests is missing, generate and merge to Firestore
  if (!stats.dailyQuests || stats.dailyQuests.length === 0) {
    const dailyQuests = getRandomQuests();
    stats.dailyQuests = dailyQuests;
    await setDoc(ref, { dailyQuests }, { merge: true });
  }

  return stats;
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
    dailyQuests: getRandomQuests()
  };
  await setDoc(ref, cleanUndefined(initial), { merge: true });
  return initial;
};

export const updateDailyStats = async (
  userId: string,
  date: string,
  updates: Partial<DailyStats>
) => {
  const ref = doc(db, 'users', userId, 'dailyStats', date);
  await setDoc(ref, cleanUndefined(updates), { merge: true });
};

// === Habit Logs ===
export const logHabit = async (log: HabitLog) => {
  const ref = doc(db, 'users', log.userId, 'habitLogs', `${log.date}_${log.habitId}`);
  await setDoc(ref, cleanUndefined({ ...log, completedAt: serverTimestamp() }));
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
  await setDoc(ref, cleanUndefined(streak), { merge: true });
};

// === Focus Sessions ===
export const saveFocusSession = async (session: FocusSession) => {
  const ref = doc(db, 'users', session.userId, 'focusSessions', session.id);
  await setDoc(ref, cleanUndefined(session));
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
  await setDoc(ref, cleanUndefined({ ...reflection, createdAt: serverTimestamp() }));
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
  await setDoc(ref, cleanUndefined({ totalXP: newTotal }), { merge: true });
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
  await setDoc(ref, cleanUndefined({ unlockedAchievements: newAchievements }), { merge: true });
};

// === User Settings ===
export const updateUserCity = async (userId: string, cityId: string, cityName: string) => {
  const ref = doc(db, 'users', userId);
  await setDoc(ref, cleanUndefined({ prayerCityId: cityId, prayerCityName: cityName }), { merge: true });
};

export const getUserCity = async (userId: string): Promise<{ prayerCityId?: string; prayerCityName?: string } | null> => {
  const ref = doc(db, 'users', userId);
  const snap = await getDoc(ref);
  if (!snap.exists()) return null;
  const data = snap.data();
  return {
    prayerCityId: data.prayerCityId,
    prayerCityName: data.prayerCityName,
  };
};

// === Custom Categories ===
export const getCustomCategories = async (userId: string): Promise<CustomCategory[]> => {
  const ref = doc(db, 'users', userId);
  const snap = await getDoc(ref);
  if (!snap.exists()) return [];
  return snap.data().customCategories || [];
};

export const saveCustomCategories = async (userId: string, categories: CustomCategory[]) => {
  const ref = doc(db, 'users', userId);
  await setDoc(ref, cleanUndefined({ customCategories: categories }), { merge: true });
};

// === Custom Habits ===
export const getCustomHabits = async (userId: string): Promise<HabitDefinition[]> => {
  const ref = doc(db, 'users', userId);
  const snap = await getDoc(ref);
  if (!snap.exists()) return [];
  return snap.data().customHabits || [];
};

export const saveCustomHabits = async (userId: string, habits: HabitDefinition[]) => {
  const ref = doc(db, 'users', userId);
  await setDoc(ref, cleanUndefined({ customHabits: habits }), { merge: true });
};

// === Social Profiles & Custom Goals Sync ===
export interface PublicUserProfile {
  uid: string;
  email?: string;
  displayName: string;
  photoURL: string | null;
  totalXP: number;
  customGoals: {
    id: string;
    label: string;
    done: boolean;
    iconName: string;
    createdAt: number;
  }[];
  prayerCityName: string;
  unlockedAchievements?: {
    id: string;
    unlockedAt: string;
  }[];
  league?: 'bronze' | 'silver' | 'gold' | 'diamond';
  disciplineStreak?: number;
  hasCompletedTutorial?: boolean;
}

export const syncUserProfile = async (userId: string, data: Partial<PublicUserProfile>) => {
  const ref = doc(db, 'users', userId);
  await setDoc(ref, cleanUndefined({
    ...data,
    updatedAt: serverTimestamp()
  }), { merge: true });
};

export const getAllUserProfiles = async (): Promise<PublicUserProfile[]> => {
  const q = query(collection(db, 'users'), limit(50));
  const snap = await getDocs(q);
  const profiles: PublicUserProfile[] = [];
  snap.forEach((docSnap) => {
    const data = docSnap.data();
    if (data.uid) {
      profiles.push({
        uid: data.uid,
        email: data.email || '',
        displayName: data.displayName || 'Life OS User',
        photoURL: data.photoURL || null,
        totalXP: data.totalXP || 0,
        customGoals: data.customGoals || [],
        prayerCityName: data.prayerCityName || 'Kota Jakarta',
        unlockedAchievements: data.unlockedAchievements || [],
        league: data.league || 'bronze',
        disciplineStreak: data.disciplineStreak || 0,
        hasCompletedTutorial: data.hasCompletedTutorial || false
      });
    }
  });
  return profiles;
};

export const getUserProfileById = async (userId: string): Promise<PublicUserProfile | null> => {
  const ref = doc(db, 'users', userId);
  const snap = await getDoc(ref);
  if (!snap.exists()) return null;
  const data = snap.data();
  return {
    uid: data.uid || userId,
    email: data.email || '',
    displayName: data.displayName || 'Life OS User',
    photoURL: data.photoURL || null,
    totalXP: data.totalXP || 0,
    customGoals: data.customGoals || [],
    prayerCityName: data.prayerCityName || 'Kota Jakarta',
    unlockedAchievements: data.unlockedAchievements || [],
    league: data.league || 'bronze',
    disciplineStreak: data.disciplineStreak || 0,
    hasCompletedTutorial: data.hasCompletedTutorial || false
  };
};

export const deleteUserProfile = async (userId: string) => {
  const ref = doc(db, 'users', userId);
  await deleteDoc(ref);
};
