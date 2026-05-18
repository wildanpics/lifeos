'use client';

import { useEffect } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '@/lib/firebase/config';
import { useAppStore } from '@/store/useAppStore';
import { getUserXP, getTodayStats, initTodayStats, getUserAchievements, getUserCity, getCustomCategories, getCustomHabits, saveCustomCategories } from '@/lib/firebase/firestore';
import { getToday } from '@/lib/utils/time';

export const useAuth = () => {
  const { setUser, setLoading, setTotalXP, setTodayStats, setUnlockedAchievements, setPrayerCity, setCustomCategories, setCustomHabits, isLoading, user } = useAppStore();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setUser(firebaseUser);

      if (firebaseUser) {
        try {
          // Load XP
          const xp = await getUserXP(firebaseUser.uid);
          setTotalXP(xp);

          // Load or init today's stats
          const today = getToday();
          let stats = await getTodayStats(firebaseUser.uid, today);
          if (!stats) {
            stats = await initTodayStats(firebaseUser.uid, today);
          }
          setTodayStats(stats);

          // Load achievements from Firestore
          const achievements = await getUserAchievements(firebaseUser.uid);
          setUnlockedAchievements(achievements);

          // Load prayer city from Firestore
          const cityConfig = await getUserCity(firebaseUser.uid);
          if (cityConfig && cityConfig.prayerCityId && cityConfig.prayerCityName) {
            setPrayerCity(cityConfig.prayerCityId, cityConfig.prayerCityName);
          }

          // Hydrate custom categories
          const categories = await getCustomCategories(firebaseUser.uid);
          setCustomCategories(categories);

          // Hydrate custom habits
          const habits = await getCustomHabits(firebaseUser.uid);
          setCustomHabits(habits);
        } catch (error) {
          console.error('Error loading user data:', error);
        }
      } else {
        // User logged out: clear Zustand local states to prevent data leakage/persistence issues!
        setTotalXP(0);
        setTodayStats(null);
        setUnlockedAchievements([]);
        setCustomCategories([]);
        setCustomHabits([]);
      }

      setLoading(false);
    });

    return () => unsubscribe();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return { user, isLoading };
};
