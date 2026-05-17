'use client';

import { useEffect, useState } from 'react';
import { Sidebar } from './Sidebar';
import { TopBar } from './TopBar';
import { BottomNav } from './BottomNav';
import { MorningLock } from '@/components/dashboard/MorningLock';
import { AchievementToast } from '@/components/ui/AchievementToast';
import { usePrayer } from '@/lib/hooks/usePrayer';
import { useAppStore } from '@/store/useAppStore';

interface AppShellProps {
  children: React.ReactNode;
  topBarTitle?: string;
}

const SIDEBAR_WIDTH = 256; // px — must match Sidebar component

export function AppShell({ children, topBarTitle }: AppShellProps) {
  const { addNotification, todayStats } = useAppStore();
  const { alert } = usePrayer();
  
  const [lastTriggeredPrayer, setLastTriggeredPrayer] = useState<string | null>(null);
  const [lastReminderDate, setLastReminderDate] = useState<string | null>(null);

  // Observer 1: Prayer Alert Trigger (Urgent: <= 15 minutes)
  useEffect(() => {
    if (alert && alert.level === 'urgent' && alert.prayer !== lastTriggeredPrayer) {
      addNotification(
        '🕌 Waktu Sholat Mendekat',
        `Waktu sholat ${alert.prayer} akan tiba dalam ${alert.minutesUntil} menit. Mari bersiap!`,
        'prayer'
      );
      setLastTriggeredPrayer(alert.prayer);
    }
  }, [alert, lastTriggeredPrayer, addNotification]);

  // Observer 2: Morning Reset Tasks Reminder
  useEffect(() => {
    if (!todayStats) return;
    const now = new Date();
    const todayStr = now.toISOString().split('T')[0];
    const currentHour = now.getHours();

    // Trigger morning reset reminder between 5 AM and 10 AM if not fully completed
    if (
      currentHour >= 5 && 
      currentHour < 10 && 
      (!todayStats.morningResetComplete || todayStats.morningResetComplete.length < 4) && 
      lastReminderDate !== todayStr
    ) {
      addNotification(
        '🌅 Pengingat Morning Reset',
        'Morning Reset hari ini belum selesai! Selesaikan seluruh tugas pagi Anda untuk mengaktifkan fokus hari ini.',
        'lock'
      );
      setLastReminderDate(todayStr);
    }
  }, [todayStats, lastReminderDate, addNotification]);

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

      {/* Morning lock overlay */}
      <MorningLock />
      <AchievementToast />
    </div>
  );
}
