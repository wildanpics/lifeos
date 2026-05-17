'use client';

import { useEffect } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '@/lib/firebase/config';
import { useAppStore } from '@/store/useAppStore';
import { getUserXP, getTodayStats, initTodayStats } from '@/lib/firebase/firestore';
import { getToday } from '@/lib/utils/time';

export const useAuth = () => {
  const { setUser, setLoading, setTotalXP, setTodayStats, isLoading, user } = useAppStore();

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
        } catch (error) {
          console.error('Error loading user data:', error);
        }
      }

      setLoading(false);
    });

    return () => unsubscribe();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return { user, isLoading };
};
