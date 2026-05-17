'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAppStore } from '@/store/useAppStore';
import { AlertTriangle, X, Droplets, PhoneOff, Activity } from 'lucide-react';
import { isAfterTime } from '@/lib/utils/time';
import { HABIT_DEFINITIONS } from '@/lib/constants/habits';

const EMERGENCY_TASKS = [
  { icon: Droplets, text: 'Minum segelas air sekarang', color: '#3B82F6' },
  { icon: PhoneOff, text: 'Tutup semua sosial media', color: '#EF4444' },
  { icon: Activity, text: 'Stretching 1 menit', color: '#10B981' },
];

export function EmergencyPanel() {
  const { todayStats, setEmergencyPanel } = useAppStore();
  const [completedTasks, setCompletedTasks] = useState<number[]>([]);
  const [dismissed, setDismissed] = useState(false);

  const completedCount = todayStats?.completedHabits?.length || 0;
  const totalHabits = HABIT_DEFINITIONS.length;
  const progress = totalHabits > 0 ? (completedCount / totalHabits) * 100 : 0;

  // Show emergency if: after 09:00 and less than 10% done
  const shouldShow = isAfterTime('09:00') && progress < 10 && !dismissed;

  if (!shouldShow) return null;

  const toggleTask = (i: number) => {
    setCompletedTasks((prev) =>
      prev.includes(i) ? prev.filter((t) => t !== i) : [...prev, i]
    );
  };

  const allTasksDone = completedTasks.length === EMERGENCY_TASKS.length;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 20, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 20 }}
        className="card border-2 relative"
        style={{
          borderColor: 'rgba(239, 68, 68, 0.4)',
          background: 'rgba(239, 68, 68, 0.05)',
        }}
      >
        <button
          onClick={() => setDismissed(true)}
          className="absolute top-3 right-3 p-1 rounded-lg"
          style={{ color: 'var(--text-muted)' }}
        >
          <X className="w-4 h-4" />
        </button>

        <div className="flex items-start gap-3 mb-4">
          <motion.div
            animate={{ scale: [1, 1.1, 1] }}
            transition={{ repeat: Infinity, duration: 1.5 }}
            className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
            style={{ background: 'rgba(239, 68, 68, 0.15)' }}
          >
            <AlertTriangle className="w-5 h-5 text-red-400" />
          </motion.div>
          <div>
            <h3 className="text-sm font-bold text-red-400">
              🚨 Emergency! Prokrastinasi Terdeteksi
            </h3>
            <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>
              Sudah jam 9 pagi tapi progress {Math.round(progress)}%. Lakukan ini dulu:
            </p>
          </div>
        </div>

        <div className="space-y-2 mb-4">
          {EMERGENCY_TASKS.map((task, i) => {
            const done = completedTasks.includes(i);
            return (
              <motion.button
                key={i}
                whileTap={{ scale: 0.97 }}
                onClick={() => toggleTask(i)}
                className="w-full flex items-center gap-3 p-3 rounded-xl text-left transition-all"
                style={{
                  background: done ? `${task.color}15` : 'var(--bg-secondary)',
                  border: `1px solid ${done ? task.color + '40' : 'var(--border)'}`,
                }}
              >
                <div
                  className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                  style={{ background: `${task.color}20` }}
                >
                  <task.icon className="w-4 h-4" style={{ color: task.color }} />
                </div>
                <span
                  className="text-sm flex-1"
                  style={{
                    color: done ? 'var(--success)' : 'var(--text-primary)',
                    textDecoration: done ? 'line-through' : 'none',
                  }}
                >
                  {task.text}
                </span>
                <div
                  className="w-5 h-5 rounded-full border-2 flex items-center justify-center"
                  style={{
                    borderColor: done ? task.color : 'var(--border)',
                    background: done ? task.color : 'transparent',
                  }}
                >
                  {done && <span className="text-white text-xs">✓</span>}
                </div>
              </motion.button>
            );
          })}
        </div>

        {allTasksDone && (
          <motion.button
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            onClick={() => {
              setDismissed(true);
              setEmergencyPanel(false);
            }}
            className="btn-primary w-full justify-center"
          >
            🎯 Siap! Buka Focus Mode
          </motion.button>
        )}
      </motion.div>
    </AnimatePresence>
  );
}
