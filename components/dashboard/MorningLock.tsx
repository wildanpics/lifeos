'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useAppStore } from '@/store/useAppStore';
import { MORNING_LOCK_HABITS, HABIT_DEFINITIONS } from '@/lib/constants/habits';
import { Lock, CheckCircle } from 'lucide-react';

export function MorningLock() {
  const { todayStats, morningLockOpen } = useAppStore();

  const morningHabits = HABIT_DEFINITIONS.filter((h) => h.isMorningLock);
  const completedMorning = morningHabits.filter((h) =>
    todayStats?.completedHabits?.includes(h.id)
  );
  const allComplete = completedMorning.length === morningHabits.length;

  // Don't show if morning lock is unlocked OR all complete
  if (allComplete || morningLockOpen) return null;

  // Only show morning lock between 4am and 10am
  const hour = new Date().getHours();
  if (hour < 4 || hour >= 10) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-end justify-center morning-lock-backdrop"
        style={{ background: 'rgba(11, 15, 25, 0.85)' }}
      >
        <motion.div
          initial={{ y: '100%' }}
          animate={{ y: 0 }}
          exit={{ y: '100%' }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          className="w-full max-w-lg mx-4 mb-24 rounded-3xl p-6"
          style={{
            background: 'var(--bg-card)',
            border: '1px solid var(--border)',
          }}
        >
          <div className="flex flex-col items-center text-center mb-6">
            <div
              className="w-16 h-16 rounded-2xl flex items-center justify-center mb-4"
              style={{ background: 'rgba(239, 68, 68, 0.1)' }}
            >
              <Lock className="w-8 h-8 text-red-400" />
            </div>
            <h2 className="text-xl font-bold mb-2" style={{ color: 'var(--text-primary)' }}>
              🔒 Morning Reset Dulu!
            </h2>
            <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
              Selesaikan ritual pagi sebelum membuka dashboard.{' '}
              <span className="font-semibold" style={{ color: 'var(--danger)' }}>
                Ini untuk melindungimu dari dopamin pagi.
              </span>
            </p>
          </div>

          <div className="space-y-2">
            {morningHabits.map((habit) => {
              const done = todayStats?.completedHabits?.includes(habit.id) || false;
              return (
                <motion.div
                  key={habit.id}
                  animate={done ? { scale: [1, 1.03, 1] } : {}}
                  className="flex items-center gap-3 p-3 rounded-xl"
                  style={{
                    background: done
                      ? 'rgba(16, 185, 129, 0.1)'
                      : 'var(--bg-secondary)',
                    border: `1px solid ${done ? 'rgba(16, 185, 129, 0.3)' : 'var(--border)'}`,
                  }}
                >
                  <span className="text-xl">{habit.icon}</span>
                  <div className="flex-1">
                    <p
                      className="text-sm font-medium"
                      style={{
                        color: done ? 'var(--success)' : 'var(--text-primary)',
                        textDecoration: done ? 'line-through' : 'none',
                      }}
                    >
                      {habit.labelId}
                    </p>
                    {habit.deadline && (
                      <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                        Sebelum {habit.deadline}
                      </p>
                    )}
                  </div>
                  {done ? (
                    <CheckCircle className="w-5 h-5 text-green-400" />
                  ) : (
                    <div
                      className="w-5 h-5 rounded-full border-2"
                      style={{ borderColor: 'var(--border)' }}
                    />
                  )}
                </motion.div>
              );
            })}
          </div>

          <p className="text-center text-xs mt-4" style={{ color: 'var(--text-muted)' }}>
            {completedMorning.length}/{morningHabits.length} selesai
          </p>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
