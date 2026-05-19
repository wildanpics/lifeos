'use client';

import { useEffect } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '@/lib/firebase/config';
import { useAppStore } from '@/store/useAppStore';
import { getUserXP, getTodayStats, initTodayStats, getUserAchievements, getUserCity, getCustomCategories, getCustomHabits, getUserProfileById } from '@/lib/firebase/firestore';
import { getToday } from '@/lib/utils/time';

export const useAuth = () => {
  const { 
    setUser, setLoading, setTotalXP, setTodayStats, setUnlockedAchievements, 
    setPrayerCity, setCustomCategories, setCustomHabits, setCustomGoals, 
    setDisciplineStreak, setLeague, setHasCompletedTutorial, setCustomTitle, isLoading, user 
  } = useAppStore();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setUser(firebaseUser);

      if (firebaseUser && firebaseUser.emailVerified) {
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

          // Hydrate custom goals, streak, and league
          let userProfile = await getUserProfileById(firebaseUser.uid);
          if (!userProfile) {
            // Profile document failed to create during unverified signup, create it now!
            try {
              const { ensureUserProfile } = await import('@/lib/firebase/auth');
              await ensureUserProfile(firebaseUser);
              userProfile = await getUserProfileById(firebaseUser.uid);
            } catch (err) {
              console.warn('Failed to ensure user profile document:', err);
            }
          }

          if (userProfile) {
            // Extract latest photo and display name from Google provider data if available
            const googleProfile = firebaseUser.providerData.find((p) => p.providerId === 'google.com');
            const latestPhotoURL = googleProfile?.photoURL || firebaseUser.photoURL || null;
            const latestDisplayName = googleProfile?.displayName || firebaseUser.displayName || 'Life OS User';

            let needsProfileSync = false;
            const profileUpdates: any = {};

            if (latestDisplayName && userProfile.displayName !== latestDisplayName) {
              userProfile.displayName = latestDisplayName;
              profileUpdates.displayName = latestDisplayName;
              needsProfileSync = true;
            }
            if (latestPhotoURL && userProfile.photoURL !== latestPhotoURL) {
              userProfile.photoURL = latestPhotoURL;
              profileUpdates.photoURL = latestPhotoURL;
              needsProfileSync = true;
            }

            if (needsProfileSync) {
              try {
                const { syncUserProfile } = await import('@/lib/firebase/firestore');
                await syncUserProfile(firebaseUser.uid, profileUpdates);
              } catch (syncErr) {
                console.warn('Background profile sync failed:', syncErr);
              }
            }

            if (userProfile.customGoals !== undefined) {
              setCustomGoals(userProfile.customGoals);
            }
            if (userProfile.disciplineStreak !== undefined) {
              setDisciplineStreak(userProfile.disciplineStreak);
            }
            if (userProfile.league) {
              setLeague(userProfile.league);
            }
            if (userProfile.hasCompletedTutorial !== undefined) {
              setHasCompletedTutorial(userProfile.hasCompletedTutorial);
            }
            if (userProfile.customTitle !== undefined) {
              setCustomTitle(userProfile.customTitle);
            }
          } else {
            // Fallback: Initial sync of local goals to Cloud
            const { customGoals } = useAppStore.getState();
            const googleProfile = firebaseUser.providerData.find((p) => p.providerId === 'google.com');
            const latestPhotoURL = googleProfile?.photoURL || firebaseUser.photoURL || null;
            const latestDisplayName = googleProfile?.displayName || firebaseUser.displayName || 'Life OS User';

            if (customGoals && customGoals.length > 0) {
              const { syncUserProfile } = await import('@/lib/firebase/firestore');
              syncUserProfile(firebaseUser.uid, {
                uid: firebaseUser.uid,
                displayName: latestDisplayName,
                photoURL: latestPhotoURL,
                totalXP: xp,
                customGoals,
                prayerCityName: cityConfig?.prayerCityName || 'Kota Jakarta',
                disciplineStreak: 0,
                league: 'bronze',
                customTitle: ''
              });
            }
          }
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
        setCustomGoals([]);
        setDisciplineStreak(0);
        setLeague('bronze');
        setHasCompletedTutorial(false);
        setCustomTitle('');
      }

      setLoading(false);
    });

    return () => unsubscribe();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return { user, isLoading };
};
