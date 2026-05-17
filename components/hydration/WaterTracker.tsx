'use client';

import { motion } from 'framer-motion';
import { useAppStore } from '@/store/useAppStore';
import { updateDailyStats } from '@/lib/firebase/firestore';
import { getToday } from '@/lib/utils/time';
import { Droplets } from 'lucide-react';

export function WaterTracker() {
  const { todayStats, user, updateWater } = useAppStore();
  const glasses = todayStats?.waterGlasses || 0;

  const handleGlass = async (index: number) => {
    if (!user) return;
    const newCount = index + 1 === glasses ? index : index + 1;
    updateWater(newCount);
    try {
      await updateDailyStats(user.uid, getToday(), { waterGlasses: newCount });
    } catch (e) { console.error(e); }
  };

  return (
    <div className="card">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Droplets className="w-4 h-4" style={{ color: '#3B82F6' }} />
          <span className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>
            Hidrasi
          </span>
        </div>
        <span className="text-xs font-bold" style={{ color: '#3B82F6' }}>
          {glasses}/8 gelas
        </span>
      </div>

      <div className="flex gap-2 justify-center flex-wrap">
        {Array.from({ length: 8 }, (_, i) => {
          const filled = i < glasses;
          return (
            <motion.button
              key={i}
              whileTap={{ scale: 0.9 }}
              onClick={() => handleGlass(i)}
              className="relative w-8 h-12 rounded-b-2xl rounded-t-sm border-2 overflow-hidden bg-transparent transition-colors duration-300"
              style={{ borderColor: filled ? '#3B82F6' : 'var(--border)' }}
            >
              <motion.div
                className="absolute bottom-0 left-0 w-full bg-gradient-to-t from-blue-600 to-blue-400"
                style={{ height: '85%', transformOrigin: 'bottom' }}
                initial={{ scaleY: 0 }}
                animate={{ scaleY: filled ? 1 : 0 }}
                transition={{ duration: 0.4, ease: "easeOut" }}
              />
            </motion.button>
          );
        })}
      </div>

      <p className="text-center text-xs mt-3" style={{ color: 'var(--text-muted)' }}>
        {glasses >= 8 ? '🎉 Target tercapai! Tubuh terhidrasi sempurna.' :
         glasses >= 5 ? '💧 Hampir! Terus minum air.' :
         glasses >= 2 ? '⚠️ Jangan lupa minum air lebih banyak.' :
         '😬 Minum air dulu yuk!'}
      </p>
    </div>
  );
}
