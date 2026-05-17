'use client';

import { motion } from 'framer-motion';
import { CheckCircle2, Circle } from 'lucide-react';
import { useAppStore } from '@/store/useAppStore';

const tasks = [
  { id: 1, label: 'Mandi' },
  { id: 2, label: 'Sholat Subuh' },
  { id: 3, label: 'Minum Air' },
  { id: 4, label: 'Menyapu / Beresin' },
];

export function MorningReset() {
  const { user, todayStats, toggleMorningReset, updateMood } = useAppStore();
  const completed = todayStats?.morningResetComplete || [];

  const handleToggle = async (id: number) => {
    if (!user || !todayStats) return;
    
    // Optimistic UI update
    toggleMorningReset(id);
    
    try {
      const { updateDailyStats } = await import('@/lib/firebase/firestore');
      const nextCompleted = completed.includes(id) 
        ? completed.filter(c => c !== id) 
        : [...completed, id];
        
      await updateDailyStats(user.uid, todayStats.date, {
        morningResetComplete: nextCompleted
      });
    } catch (error) {
      console.error('Failed to sync morning reset', error);
      // Revert if failed (optional, keeping it simple for now)
      toggleMorningReset(id);
    }
  };

  const handleMoodSelect = async (moodValue: number) => {
    try {
      const { updateDailyStats } = await import('@/lib/firebase/firestore');
      if (!user || !todayStats) return;
      updateMood(moodValue);
      await updateDailyStats(user.uid, todayStats.date, { mood: moodValue });
    } catch (e) {
      console.error(e);
    }
  };

  const progress = (completed.length / tasks.length) * 100;
  const allComplete = completed.length === tasks.length;
  const moodSet = !!todayStats?.mood;
  
  const radius = 20;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (progress / 100) * circumference;

  return (
    <div className="card p-5 rounded-2xl relative overflow-hidden" style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border)' }}>
      {/* Subtle green glow */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2 pointer-events-none" />
      
      <div className="flex items-center gap-4 mb-5">
        <div className="relative w-12 h-12 flex-shrink-0 flex items-center justify-center">
          <svg className="w-12 h-12 transform -rotate-90">
            <circle cx="24" cy="24" r={radius} className="stroke-current" style={{ color: 'var(--bg-primary)' }} strokeWidth="3" fill="transparent" />
            <motion.circle
              cx="24" cy="24" r={radius} className="stroke-current text-emerald-500" strokeWidth="3" fill="transparent"
              strokeDasharray={circumference}
              animate={{ strokeDashoffset }}
              transition={{ duration: 0.5 }}
              strokeLinecap="round"
            />
          </svg>
          <span className="absolute text-[10px] font-bold text-emerald-500">{completed.length}/{tasks.length}</span>
        </div>
        
        <div>
          <h2 className="text-sm font-bold text-emerald-400">Morning Reset</h2>
          <p className="text-[10px]" style={{ color: 'var(--text-secondary)' }}>Selesaikan rutinitas pagi untuk membuka sistem.</p>
        </div>
      </div>

      <div className="space-y-3">
        {tasks.map((task) => {
          const isDone = completed.includes(task.id);
          return (
            <button
              key={task.id}
              onClick={() => handleToggle(task.id)}
              className="w-full flex items-center gap-3 text-left group"
            >
              {isDone ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-500" />
              ) : (
                <Circle className="w-4 h-4 transition-colors group-hover:text-emerald-500/50" style={{ color: 'var(--border)' }} />
              )}
              <span className="text-xs font-medium" 
                    style={{ 
                      color: isDone ? 'var(--text-secondary)' : 'var(--text-primary)',
                      textDecoration: isDone ? 'line-through' : 'none'
                    }}>
                {task.label}
              </span>
            </button>
          );
        })}
      </div>

      {allComplete && !moodSet && (
        <motion.div 
          initial={{ opacity: 0, height: 0 }} 
          animate={{ opacity: 1, height: 'auto' }} 
          className="mt-4 pt-4 border-t"
          style={{ borderColor: 'var(--border)' }}
        >
          <p className="text-xs font-bold text-center mb-3" style={{ color: 'var(--text-primary)' }}>
            Bagaimana perasaanmu pagi ini?
          </p>
          <div className="flex items-center justify-between gap-1">
            {[
              { icon: '😔', val: 1 },
              { icon: '😕', val: 2 },
              { icon: '😐', val: 3 },
              { icon: '🙂', val: 4 },
              { icon: '😄', val: 5 }
            ].map((m) => (
              <button
                key={m.val}
                onClick={() => handleMoodSelect(m.val)}
                className="p-2 rounded-xl transition-all hover:bg-white/10 hover:scale-125"
              >
                <span className="text-2xl">{m.icon}</span>
              </button>
            ))}
          </div>
        </motion.div>
      )}

      {allComplete && moodSet && (
        <motion.div 
          initial={{ opacity: 0 }} 
          animate={{ opacity: 1 }} 
          className="mt-4 pt-4 border-t text-center"
          style={{ borderColor: 'var(--border)' }}
        >
          <p className="text-xs font-bold text-emerald-500">
            Sistem Siap! Selamat bekerja. 🚀
          </p>
        </motion.div>
      )}
    </div>
  );
}

