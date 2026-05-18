'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { usePrayer } from '@/lib/hooks/usePrayer';
import { formatCountdown } from '@/lib/utils/time';
import { MapPin, CheckCircle2, Circle } from 'lucide-react';
import { useAppStore } from '@/store/useAppStore';
import { PrayerModal } from './PrayerModal';
import { triggerConfetti } from '@/lib/utils/confetti';
import { getToday } from '@/lib/utils/time';
import { cn } from '@/lib/utils';

export function PrayerList() {
  const { schedule, nextPrayer, countdown, loading } = usePrayer();
  const { todayStats, user, completeHabit, prayerCityName } = useAppStore();
  const [modalOpen, setModalOpen] = useState(false);

  if (loading) {
    return (
      <div className="card p-4">
        <div className="skeleton h-4 w-1/3 mb-4" />
        <div className="space-y-3">
          {[1,2,3,4,5].map(i => <div key={i} className="skeleton h-8 w-full" />)}
        </div>
      </div>
    );
  }

  const handleCompleteSholat = async (habitId: string, xp: number) => {
    if (!user || todayStats?.completedHabits?.includes(habitId)) return;
    
    // Satisfying confetti splash!
    triggerConfetti();
    
    // 1. Local zustand update
    completeHabit(habitId, xp);
    
    // 2. Persistent Firestore sync
    try {
      const today = getToday();
      const { logHabit, updateDailyStats, addXP } = await import('@/lib/firebase/firestore');
      await logHabit({ habitId, userId: user.uid, date: today, completedAt: new Date(), xpEarned: xp });
      
      const newCompleted = [...(todayStats?.completedHabits || []), habitId];
      const newXp = (todayStats?.xpEarned || 0) + xp;
      await updateDailyStats(user.uid, today, {
        completedHabits: newCompleted,
        xpEarned: newXp
      });
      await addXP(user.uid, xp);
    } catch (e) {
      console.error('Failed to log prayer in Firestore', e);
    }
  };

  const sholatList = [
    { name: 'Subuh', id: 'prayer_fajr', time: schedule?.prayers.fajr || '04:30', xp: 25 },
    { name: 'Dzuhur', id: 'prayer_dhuhr', time: schedule?.prayers.dhuhr || '12:02', xp: 25 },
    { name: 'Ashar', id: 'prayer_asr', time: schedule?.prayers.asr || '15:23', xp: 25 },
    { name: 'Maghrib', id: 'prayer_maghrib', time: schedule?.prayers.maghrib || '17:58', xp: 25 },
    { name: 'Isya', id: 'prayer_isya', time: schedule?.prayers.isya || '19:10', xp: 25 },
  ];

  const prayerNames = schedule?.prayers
    ? sholatList.map(s => ({
        name: s.name,
        id: s.id,
        time: s.time,
        done: todayStats?.completedHabits?.includes(s.id) || false,
        xp: s.xp
      }))
    : [];

  // Remove "KOTA " or "KAB. " prefix if it exists to make it cleaner
  const cleanCityName = prayerCityName.replace(/^(KOTA |KAB\. )/i, '');

  return (
    <div className="card p-5 rounded-2xl" style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border)' }}>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>Jadwal Sholat</h2>
        <div className="flex items-center gap-1 text-[10px]" style={{ color: 'var(--text-muted)' }}>
          <MapPin className="w-3 h-3" />
          <span>{cleanCityName}</span>
        </div>
      </div>

      <div className="space-y-2">
        {prayerNames.map((p, i) => {
          const isNext = p.name === nextPrayer?.name;
          
          return (
            <motion.div
              key={p.name}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.05 }}
              onClick={() => !p.done && handleCompleteSholat(p.id, p.xp)}
              className={cn(
                "flex items-center justify-between p-2.5 rounded-xl transition-all",
                isNext ? 'gold-pulse-active' : '',
                !p.done ? 'cursor-pointer hover:bg-white/5 active:scale-[0.98]' : ''
              )}
            >
              <div className="flex items-center gap-3">
                <span className="text-xs font-bold w-14" style={{ color: isNext ? '#F59E0B' : 'var(--text-secondary)' }}>
                  {p.name}
                </span>
                <span className="text-sm font-black tabular-nums" style={{ color: isNext ? '#F59E0B' : 'var(--text-primary)' }}>
                  {p.time}
                </span>
              </div>
              
              <div className="flex items-center gap-3">
                {isNext && countdown > 0 && (
                  <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-yellow-500/10 border border-yellow-500/25" style={{ color: '#F59E0B' }}>
                    {formatCountdown(countdown)}
                  </span>
                )}
                {p.done ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                ) : isNext ? (
                  <motion.div 
                    animate={{ scale: [1, 1.2, 1], rotate: 360 }} 
                    transition={{ repeat: Infinity, duration: 4, ease: 'linear' }}
                    className="w-4 h-4 rounded-full border-2 border-dashed border-yellow-500" 
                  />
                ) : (
                  <Circle className="w-4 h-4" style={{ color: 'var(--border)' }} />
                )}
              </div>
            </motion.div>
          );
        })}
      </div>
      
      <button 
        onClick={() => setModalOpen(true)}
        className="w-full mt-4 py-2 text-xs font-medium rounded-lg transition-colors hover:bg-white/5" 
        style={{ color: 'var(--text-secondary)', border: '1px solid var(--border)' }}
      >
        Lihat Semua
      </button>

      {/* Modern Multi-Tab Modal */}
      <PrayerModal isOpen={modalOpen} onClose={() => setModalOpen(false)} />
    </div>
  );
}

