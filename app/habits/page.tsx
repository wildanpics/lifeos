'use client';

import { motion } from 'framer-motion';
import { HabitCard } from '@/components/habits/HabitCard';
import { useAppStore } from '@/store/useAppStore';
import { HABIT_DEFINITIONS } from '@/lib/constants/habits';
import { CheckSquare, Flame } from 'lucide-react';

export default function HabitsPage() {
  const { todayStats } = useAppStore();
  const completed = todayStats?.completedHabits?.length || 0;
  const total = HABIT_DEFINITIONS.length;
  const pct = Math.round((completed / total) * 100);
  const xpToday = todayStats?.xpEarned || 0;

  return (
    <div className="space-y-4">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-xl font-bold" style={{ color: 'var(--text-primary)' }}>
            ✅ Habit Tracker
          </h1>
          <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
            Bangun kebiasaan. Bentuk identitas baru.
          </p>
        </div>
        <div className="flex items-center gap-1 px-3 py-1.5 rounded-xl"
          style={{ background: 'rgba(245,158,11,0.15)', border: '1px solid rgba(245,158,11,0.3)' }}>
          <Flame className="w-4 h-4 text-orange-400" />
          <span className="text-sm font-bold text-orange-400">+{xpToday} XP</span>
        </div>
      </div>

      {/* Summary */}
      <div className="card">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>
            {completed}/{total} selesai hari ini
          </span>
          <span className="text-sm font-bold" style={{ color: 'var(--accent)' }}>{pct}%</span>
        </div>
        <div className="progress-track h-2">
          <motion.div className="progress-fill h-full" initial={{ width: 0 }} animate={{ width: `${pct}%` }}
            transition={{ duration: 0.8 }} />
        </div>
      </div>

      <HabitCard />
    </div>
  );
}
