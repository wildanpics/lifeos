'use client';

import { motion } from 'framer-motion';
import { useAppStore } from '@/store/useAppStore';
import { Smile, Moon, Monitor, Timer, Utensils, Droplets } from 'lucide-react';
import { formatDuration } from '@/lib/utils/time';

export function QuickStats() {
  const { todayStats } = useAppStore();

  const stats = [
    {
      icon: Smile,
      label: 'Mood',
      labelId: 'Suasana Hati',
      value: todayStats?.mood ? ['😔','😕','😐','🙂','😄'][todayStats.mood - 1] : '—',
      raw: todayStats?.mood || 0,
      max: 5,
      color: '#EC4899',
      unit: '',
    },
    {
      icon: Moon,
      label: 'Sleep',
      labelId: 'Tidur',
      value: todayStats?.sleepHours ? `${todayStats.sleepHours}h` : '—',
      raw: todayStats?.sleepHours || 0,
      max: 9,
      color: '#8B5CF6',
      unit: 'jam',
    },
    {
      icon: Monitor,
      label: 'Screen',
      labelId: 'Layar',
      value: todayStats?.screenTimeMinutes ? formatDuration(todayStats.screenTimeMinutes) : '0m',
      raw: Math.min(todayStats?.screenTimeMinutes || 0, 360),
      max: 360,
      color: '#EF4444',
      unit: '',
    },
    {
      icon: Timer,
      label: 'Focus',
      labelId: 'Fokus',
      value: todayStats?.focusMinutes ? formatDuration(todayStats.focusMinutes) : '0m',
      raw: Math.min(todayStats?.focusMinutes || 0, 120),
      max: 120,
      color: '#6366F1',
      unit: '',
    },
    {
      icon: Utensils,
      label: 'Meals',
      labelId: 'Makan',
      value: `${todayStats?.meals || 0}/4`,
      raw: todayStats?.meals || 0,
      max: 4,
      color: '#F59E0B',
      unit: 'kali',
    },
    {
      icon: Droplets,
      label: 'Water',
      labelId: 'Air',
      value: `${todayStats?.waterGlasses || 0}/8`,
      raw: todayStats?.waterGlasses || 0,
      max: 8,
      color: '#3B82F6',
      unit: 'gelas',
    },
  ];

  return (
    <div className="grid grid-cols-3 gap-2 sm:grid-cols-6">
      {stats.map((stat, i) => {
        const pct = Math.min(100, Math.round((stat.raw / stat.max) * 100));
        return (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.07, duration: 0.4 }}
            className="card flex flex-col items-center gap-2 p-3 text-center"
          >
            <div
              className="w-8 h-8 rounded-lg flex items-center justify-center"
              style={{ background: `${stat.color}20` }}
            >
              <stat.icon className="w-4 h-4" style={{ color: stat.color }} />
            </div>
            <div>
              <p className="text-base font-bold leading-tight" style={{ color: 'var(--text-primary)' }}>
                {stat.value}
              </p>
              <p className="text-[10px]" style={{ color: 'var(--text-muted)' }}>
                {stat.labelId}
              </p>
            </div>
            {/* Mini bar */}
            <div className="w-full h-1 rounded-full" style={{ background: 'var(--border)' }}>
              <motion.div
                className="h-full rounded-full"
                style={{ background: stat.color }}
                initial={{ width: 0 }}
                animate={{ width: `${pct}%` }}
                transition={{ delay: i * 0.07 + 0.3, duration: 0.6 }}
              />
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}
