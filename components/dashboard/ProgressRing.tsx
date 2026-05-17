'use client';

import { motion } from 'framer-motion';
import { useAppStore } from '@/store/useAppStore';
import { HABIT_DEFINITIONS } from '@/lib/constants/habits';

const CIRCUMFERENCE = 2 * Math.PI * 48; // r=48

export function ProgressRing() {
  const { todayStats } = useAppStore();

  const completedCount = todayStats?.completedHabits?.length || 0;
  const totalCount = HABIT_DEFINITIONS.length;
  const percentage = Math.round((completedCount / totalCount) * 100);
  const strokeDashoffset = CIRCUMFERENCE - (percentage / 100) * CIRCUMFERENCE;

  const getColor = () => {
    if (percentage >= 80) return '#10B981';
    if (percentage >= 50) return '#6366F1';
    if (percentage >= 25) return '#F59E0B';
    return '#EF4444';
  };

  const getMessage = () => {
    if (percentage >= 80) return 'Luar biasa! 🔥';
    if (percentage >= 50) return 'Bagus sekali! ⚡';
    if (percentage >= 25) return 'Terus semangat! 💪';
    return 'Mulai sekarang! 🚀';
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.6, type: 'spring' }}
      className="flex flex-col items-center"
    >
      <div className="relative w-32 h-32">
        {/* Background track */}
        <svg className="w-full h-full timer-ring" viewBox="0 0 112 112">
          <circle
            cx="56" cy="56" r="48"
            fill="none"
            stroke="var(--border)"
            strokeWidth="8"
          />
          <motion.circle
            cx="56" cy="56" r="48"
            fill="none"
            stroke={getColor()}
            strokeWidth="8"
            strokeLinecap="round"
            strokeDasharray={CIRCUMFERENCE}
            initial={{ strokeDashoffset: CIRCUMFERENCE }}
            animate={{ strokeDashoffset }}
            transition={{ duration: 1.2, ease: 'easeOut', delay: 0.3 }}
            style={{ filter: `drop-shadow(0 0 8px ${getColor()}60)` }}
          />
        </svg>

        {/* Center content */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <motion.span
            key={percentage}
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="text-2xl font-bold"
            style={{ color: getColor() }}
          >
            {percentage}%
          </motion.span>
          <span className="text-[10px]" style={{ color: 'var(--text-muted)' }}>
            {completedCount}/{totalCount}
          </span>
        </div>
      </div>

      <p className="text-xs font-medium mt-2 text-center" style={{ color: 'var(--text-secondary)' }}>
        Progress Harian
      </p>
      <p className="text-xs font-semibold" style={{ color: getColor() }}>
        {getMessage()}
      </p>
    </motion.div>
  );
}
