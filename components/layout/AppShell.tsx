'use client';

import { useEffect, useState } from 'react';
import { Sidebar } from './Sidebar';
import { TopBar } from './TopBar';
import { BottomNav } from './BottomNav';
import { AchievementToast } from '@/components/ui/AchievementToast';
import { usePrayer } from '@/lib/hooks/usePrayer';
import { useAppStore } from '@/store/useAppStore';
import { motion } from 'framer-motion';
import { ShieldAlert, LogOut } from 'lucide-react';

interface AppShellProps {
  children: React.ReactNode;
  topBarTitle?: string;
}

const SIDEBAR_WIDTH = 256; // px — must match Sidebar component

export function AppShell({ children, topBarTitle }: AppShellProps) {
  const { 
    addNotification, 
    todayStats, 
    prayerAlertsEnabled, 
    prayerAlertBeforeMins,
    isImpersonating,
    user,
    setLoading
  } = useAppStore();
  const { alert } = usePrayer();

  const handleStopImpersonation = async () => {
    const { realUser, setRealUser, setIsImpersonating, setUser } = useAppStore.getState();
    if (!realUser) return;

    setLoading(true);
    try {
      // Restore real user auth state
      setUser(realUser);
      setIsImpersonating(false);
      setRealUser(null);

      // Reload original user data from Firestore
      const uid = realUser.uid;
      const { 
        getUserXP, getTodayStats, initTodayStats, getUserAchievements, 
        getUserCity, getCustomCategories, getCustomHabits, getUserProfileById 
      } = await import('@/lib/firebase/firestore');
      const { getToday } = await import('@/lib/utils/time');

      const xp = await getUserXP(uid);
      useAppStore.getState().setTotalXP(xp);

      const today = getToday();
      let stats = await getTodayStats(uid, today);
      if (!stats) {
        stats = await initTodayStats(uid, today);
      }
      useAppStore.getState().setTodayStats(stats);

      const achievements = await getUserAchievements(uid);
      useAppStore.getState().setUnlockedAchievements(achievements);

      const cityConfig = await getUserCity(uid);
      if (cityConfig && cityConfig.prayerCityId && cityConfig.prayerCityName) {
        useAppStore.getState().setPrayerCity(cityConfig.prayerCityId, cityConfig.prayerCityName);
      }

      const categories = await getCustomCategories(uid);
      useAppStore.getState().setCustomCategories(categories);

      const habits = await getCustomHabits(uid);
      useAppStore.getState().setCustomHabits(habits);

      const userProfile = await getUserProfileById(uid);
      if (userProfile) {
        if (userProfile.customGoals !== undefined) {
          useAppStore.getState().setCustomGoals(userProfile.customGoals);
        }
        if (userProfile.disciplineStreak !== undefined) {
          useAppStore.getState().setDisciplineStreak(userProfile.disciplineStreak);
        }
        if (userProfile.league) {
          useAppStore.getState().setLeague(userProfile.league);
        }
        if (userProfile.hasCompletedTutorial !== undefined) {
          useAppStore.getState().setHasCompletedTutorial(userProfile.hasCompletedTutorial);
        }
        if (userProfile.customTitle !== undefined) {
          useAppStore.getState().setCustomTitle(userProfile.customTitle);
        }
      }

      addNotification(
        '👤 Akun Dipulihkan',
        'Anda telah kembali ke profil asli Anda.',
        'system'
      );
    } catch (err) {
      console.error('Failed to restore real user profile:', err);
    } finally {
      setLoading(false);
    }
  };
  
  // Observer 1: Prayer Alert Trigger (Dynamic before adzan) - Solved navigation & reload spam via localStorage persistence
  useEffect(() => {
    if (prayerAlertsEnabled && alert && alert.minutesUntil <= prayerAlertBeforeMins) {
      if (typeof window !== 'undefined') {
        const todayDate = new Date().toDateString(); // e.g. "Mon May 18 2026"
        const storageKey = `prayer_alert_${alert.prayer}_${todayDate}`;
        const alreadyTriggered = localStorage.getItem(storageKey);

        if (!alreadyTriggered) {
          addNotification(
            '🕌 Waktu Sholat Mendekat',
            `Waktu sholat ${alert.prayer} akan tiba dalam ${alert.minutesUntil} menit. Mari bersiap!`,
            'prayer'
          );
          localStorage.setItem(storageKey, 'true');
          
          // Proactively clean up old keys from localStorage to prevent storage build-up
          try {
            const keysToRemove: string[] = [];
            for (let i = 0; i < localStorage.length; i++) {
              const key = localStorage.key(i);
              if (key && key.startsWith('prayer_alert_') && !key.endsWith(todayDate)) {
                keysToRemove.push(key);
              }
            }
            keysToRemove.forEach(k => localStorage.removeItem(k));
          } catch (e) {
            console.error('Failed to clean up prayer alerts cache', e);
          }
        }
      }
    }
  }, [alert, addNotification, prayerAlertsEnabled, prayerAlertBeforeMins]);

  return (
    // Outer container: full viewport, no flex (sidebar is fixed so no flex needed)
    <div style={{ minHeight: '100vh', position: 'relative' }}>

      {/* Fixed Sidebar — handled inside Sidebar component */}
      <Sidebar />

      {/* Main area: offset from sidebar on desktop via paddingLeft */}
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          minHeight: '100vh',
          // Mobile: no offset, bottom nav takes space
          paddingBottom: '80px',
        }}
        // On lg screens: shift content right to clear the fixed sidebar
        className="lg:pl-64 lg:pb-0"
      >
        <TopBar title={topBarTitle} />

        {isImpersonating && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mx-6 mt-4 p-3 rounded-xl border border-violet-500/30 bg-violet-950/20 backdrop-blur-md flex flex-col sm:flex-row justify-between items-center gap-3 shadow-[0_0_15px_rgba(139,92,246,0.15)]"
          >
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-8 h-8 rounded-lg bg-violet-600/20 border border-violet-500/30 flex items-center justify-center flex-shrink-0">
                <ShieldAlert className="w-4 h-4 text-violet-400 animate-pulse" />
              </div>
              <div className="min-w-0">
                <p className="text-xs font-black text-white uppercase tracking-wider">Mode Developer (Intip Akun)</p>
                <p className="text-[10px] text-neutral-350 truncate">
                  Melihat dashboard sebagai: <strong className="text-violet-300">{user?.displayName}</strong> ({user?.email})
                </p>
              </div>
            </div>
            <button
              onClick={handleStopImpersonation}
              className="px-3.5 py-1.5 rounded-lg bg-violet-650 hover:bg-violet-750 text-white text-[10px] font-black uppercase tracking-wider transition-all flex items-center gap-1.5 shadow-md flex-shrink-0"
            >
              <LogOut className="w-3.5 h-3.5" />
              Keluar Mode Intip
            </button>
          </motion.div>
        )}

        {/* Content fills all remaining horizontal space */}
        <main
          style={{
            flex: 1,
            padding: '1.5rem',
            width: '100%',
            boxSizing: 'border-box',
          }}
        >
          {children}
        </main>
      </div>

      {/* Mobile bottom nav */}
      <BottomNav />

      <AchievementToast />
    </div>
  );
}
