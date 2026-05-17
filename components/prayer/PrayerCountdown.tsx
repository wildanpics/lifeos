'use client';

import { motion } from 'framer-motion';
import { usePrayer } from '@/lib/hooks/usePrayer';
import { formatCountdown } from '@/lib/utils/time';
import { Clock } from 'lucide-react';

export function PrayerCountdown() {
  const { schedule, nextPrayer, alert, countdown, loading } = usePrayer();

  if (loading) {
    return (
      <div className="card">
        <div className="skeleton h-4 w-2/3 mb-2" />
        <div className="skeleton h-8 w-1/2" />
      </div>
    );
  }

  const alertStyles = {
    info: { border: 'rgba(59,130,246,0.3)', bg: 'rgba(59,130,246,0.08)', text: '#3B82F6' },
    warning: { border: 'rgba(245,158,11,0.4)', bg: 'rgba(245,158,11,0.08)', text: '#F59E0B' },
    urgent: { border: 'rgba(239,68,68,0.4)', bg: 'rgba(239,68,68,0.08)', text: '#EF4444' },
    now: { border: 'rgba(239,68,68,0.6)', bg: 'rgba(239,68,68,0.15)', text: '#EF4444' },
  };
  const style = alert ? alertStyles[alert.level] : alertStyles.info;

  const prayerNames = schedule?.prayers
    ? [
        { name: 'Subuh', time: schedule.prayers.fajr },
        { name: 'Terbit', time: schedule.prayers.sunrise },
        { name: 'Dzuhur', time: schedule.prayers.dhuhr },
        { name: 'Ashar', time: schedule.prayers.asr },
        { name: 'Maghrib', time: schedule.prayers.maghrib },
        { name: 'Isya', time: schedule.prayers.isya },
      ]
    : [];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="card"
      style={{
        border: `1px solid ${style.border}`,
        background: style.bg,
      }}
    >
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div
            className="w-8 h-8 rounded-lg flex items-center justify-center"
            style={{ background: `${style.text}20` }}
          >
            <Clock className="w-4 h-4" style={{ color: style.text }} />
          </div>
          <div>
            <p className="text-xs font-medium" style={{ color: 'var(--text-muted)' }}>
              Sholat Selanjutnya
            </p>
            <p className="text-sm font-bold" style={{ color: 'var(--text-primary)' }}>
              {nextPrayer?.name || '—'}
            </p>
          </div>
        </div>

        <div className="text-right">
          <motion.p
            className="text-2xl font-bold tabular-nums"
            style={{ color: style.text }}
            animate={alert?.level === 'urgent' ? { opacity: [1, 0.4, 1] } : {}}
            transition={{ repeat: Infinity, duration: 1 }}
          >
            {nextPrayer?.time || '--:--'}
          </motion.p>
          {countdown > 0 && (
            <p className="text-xs" style={{ color: style.text }}>
              {formatCountdown(countdown)} lagi
            </p>
          )}
        </div>
      </div>

      {/* Prayer schedule strip */}
      <div className="flex justify-between md:justify-around gap-1 mt-2 overflow-x-auto pb-1">
        {prayerNames.map((p) => {
          const isNext = p.name === nextPrayer?.name;
          return (
            <div
              key={p.name}
              className="flex flex-col items-center gap-1 py-2 px-2 sm:px-4 rounded-lg flex-1 min-w-[50px]"
              style={{
                background: isNext ? `${style.text}20` : 'transparent',
                border: isNext ? `1px solid ${style.text}40` : '1px solid transparent',
              }}
            >
              <span className="text-[10px] sm:text-xs font-semibold truncate w-full text-center"
                style={{ color: isNext ? style.text : 'var(--text-muted)' }}>
                {p.name}
              </span>
              <span className="text-[10px] sm:text-sm tabular-nums"
                style={{ color: isNext ? style.text : 'var(--text-secondary)' }}>
                {p.time}
              </span>
            </div>
          );
        })}
      </div>
    </motion.div>
  );
}
