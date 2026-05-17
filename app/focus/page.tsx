'use client';

import { motion } from 'framer-motion';
import { FocusTimer } from '@/components/focus/FocusTimer';
import { useAppStore } from '@/store/useAppStore';
import { formatDuration } from '@/lib/utils/time';
import { useFocusStore } from '@/store/useFocusStore';
import { Timer, Zap, Target } from 'lucide-react';

export default function FocusPage() {
  const { todayStats } = useAppStore();
  const { status } = useFocusStore();

  const focusMinutes = todayStats?.focusMinutes || 0;
  const goalMinutes = 60;
  const progress = Math.min(100, Math.round((focusMinutes / goalMinutes) * 100));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold" style={{ color: 'var(--text-primary)' }}>
          🎯 Mode Fokus
        </h1>
        <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
          Deep work tanpa distraksi. Satu sesi = +30 XP
        </p>
      </div>

      {/* Today stats */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { icon: Timer, label: 'Fokus Hari Ini', value: formatDuration(focusMinutes), color: '#6366F1' },
          { icon: Target, label: 'Target', value: '60 menit', color: '#10B981' },
          { icon: Zap, label: 'Progress', value: `${progress}%`, color: '#F59E0B' },
        ].map((stat, i) => (
          <motion.div key={i} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }} className="card text-center py-4">
            <stat.icon className="w-5 h-5 mx-auto mb-2" style={{ color: stat.color }} />
            <p className="text-base font-bold" style={{ color: 'var(--text-primary)' }}>{stat.value}</p>
            <p className="text-[10px]" style={{ color: 'var(--text-muted)' }}>{stat.label}</p>
          </motion.div>
        ))}
      </div>

      {/* Progress bar */}
      <div>
        <div className="flex justify-between text-xs mb-1" style={{ color: 'var(--text-muted)' }}>
          <span>Progress Fokus Harian</span><span>{progress}%</span>
        </div>
        <div className="progress-track h-2">
          <motion.div className="progress-fill h-full" initial={{ width: 0 }} animate={{ width: `${progress}%` }}
            transition={{ duration: 0.8 }} />
        </div>
      </div>

      {/* Timer */}
      <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
        className="card py-8">
        <FocusTimer />
      </motion.div>

      {/* Tips */}
      {status === 'idle' && (
        <div className="card" style={{ background: 'rgba(99,102,241,0.05)', border: '1px solid rgba(99,102,241,0.2)' }}>
          <p className="text-xs font-semibold mb-2" style={{ color: 'var(--accent)' }}>💡 Tips Fokus:</p>
          <ul className="space-y-1 text-xs" style={{ color: 'var(--text-muted)' }}>
            <li>📵 Matikan notifikasi HP</li>
            <li>🎧 Pakai musik lo-fi atau white noise</li>
            <li>🚿 Pastikan sudah mandi sebelum fokus</li>
            <li>💧 Siapkan air minum di meja</li>
          </ul>
        </div>
      )}
    </div>
  );
}
