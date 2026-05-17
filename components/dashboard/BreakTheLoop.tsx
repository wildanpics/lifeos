'use client';

import { motion } from 'framer-motion';
import { Sparkles, GlassWater, Wind, PenTool } from 'lucide-react';
import { useAppStore } from '@/store/useAppStore';

export function BreakTheLoop() {
  const { user, todayStats, addXP, breakTheLoop } = useAppStore();
  const isDone = todayStats?.breakTheLoopDone || false;

  const handleComplete = async () => {
    if (!user || !todayStats || isDone) return;
    
    breakTheLoop();
    addXP(50);

    try {
      const { updateDailyStats } = await import('@/lib/firebase/firestore');
      await updateDailyStats(user.uid, todayStats.date, { breakTheLoopDone: true });
    } catch (e) {
      console.error(e);
    }
  };

  // If already done, we completely hide it as requested
  if (isDone) return null;

  return (
    <div className="card p-4 md:p-6 rounded-2xl flex flex-col md:flex-row items-start md:items-center justify-between gap-6"
         style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border)' }}>
      
      <div className="flex items-center gap-4">
        <div className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0"
             style={{ background: 'rgba(168, 85, 247, 0.1)' }}>
          <Sparkles className="w-6 h-6 text-purple-500" />
        </div>
        <div>
          <h3 className="text-sm font-bold flex items-center gap-2" style={{ color: 'var(--text-primary)' }}>
            Break The Loop 🚀
          </h3>
          <p className="text-xs mt-1" style={{ color: 'var(--text-secondary)' }}>
            Mulai hari dengan satu langkah kecil!
          </p>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-4 text-[10px] font-medium" style={{ color: 'var(--text-secondary)' }}>
        <div className="flex items-center gap-1.5"><GlassWater className="w-3 h-3 text-blue-400" /> Minum air 1 gelas</div>
        <div className="flex items-center gap-1.5"><Wind className="w-3 h-3 text-emerald-400" /> Tarik napas 5 kali</div>
        <div className="flex items-center gap-1.5"><PenTool className="w-3 h-3 text-orange-400" /> Tulis 1 hal disyukuri</div>
      </div>

      <motion.button 
        whileTap={{ scale: 0.95 }}
        onClick={handleComplete}
        className="z-10 px-6 py-2 text-xs font-bold rounded-lg text-white w-full md:w-auto flex items-center justify-center gap-2 transition-all shadow-lg shadow-indigo-500/20 hover:shadow-indigo-500/40"
        style={{ background: 'var(--accent)' }}
      >
        ✓ Selesai
      </motion.button>
    </div>
  );
}
