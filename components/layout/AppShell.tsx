'use client';

import { useEffect, useState } from 'react';
import { Sidebar } from './Sidebar';
import { TopBar } from './TopBar';
import { BottomNav } from './BottomNav';
import { AchievementToast } from '@/components/ui/AchievementToast';
import { usePrayer } from '@/lib/hooks/usePrayer';
import { useAppStore } from '@/store/useAppStore';

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
    prayerAlertBeforeMins 
  } = useAppStore();
  const { alert } = usePrayer();
  
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
