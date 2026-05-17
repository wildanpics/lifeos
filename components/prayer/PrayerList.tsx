'use client';

import { motion } from 'framer-motion';
import { usePrayer } from '@/lib/hooks/usePrayer';
import { formatCountdown } from '@/lib/utils/time';
import { MapPin, CheckCircle2, Circle } from 'lucide-react';

import { useAppStore } from '@/store/useAppStore';

export function PrayerList() {
  const { schedule, nextPrayer, countdown, loading } = usePrayer();
  const { prayerCityName } = useAppStore();

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

  const prayerNames = schedule?.prayers
    ? [
        { name: 'Subuh', time: schedule.prayers.fajr, done: true },
        { name: 'Dzuhur', time: schedule.prayers.dhuhr, done: true },
        { name: 'Ashar', time: schedule.prayers.asr, done: false },
        { name: 'Maghrib', time: schedule.prayers.maghrib, done: false },
        { name: 'Isya', time: schedule.prayers.isya, done: false },
      ]
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
              className="flex items-center justify-between p-2 rounded-lg"
              style={{
                background: isNext ? 'rgba(99,102,241,0.1)' : 'transparent',
              }}
            >
              <div className="flex items-center gap-3">
                <span className="text-xs font-medium w-14" style={{ color: isNext ? '#818CF8' : 'var(--text-secondary)' }}>
                  {p.name}
                </span>
                <span className="text-sm font-bold tabular-nums" style={{ color: isNext ? '#818CF8' : 'var(--text-primary)' }}>
                  {p.time}
                </span>
              </div>
              
              <div className="flex items-center gap-3">
                {isNext && countdown > 0 && (
                  <span className="text-[10px] font-bold" style={{ color: '#818CF8' }}>
                    {formatCountdown(countdown)}
                  </span>
                )}
                {p.done ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                ) : isNext ? (
                  <motion.div 
                    animate={{ scale: [1, 1.2, 1] }} 
                    transition={{ repeat: Infinity, duration: 2 }}
                    className="w-4 h-4 rounded-full border-2 border-indigo-400" 
                  />
                ) : (
                  <Circle className="w-4 h-4" style={{ color: 'var(--border)' }} />
                )}
              </div>
            </motion.div>
          );
        })}
      </div>
      
      <button className="w-full mt-4 py-2 text-xs font-medium rounded-lg transition-colors hover:bg-white/5" 
              style={{ color: 'var(--text-secondary)', border: '1px solid var(--border)' }}>
        Lihat Semua
      </button>
    </div>
  );
}
