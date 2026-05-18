'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { useAppStore } from '@/store/useAppStore';
import { analyzeDopamine, getDopamineColor } from '@/lib/utils/dopamine';
import { Brain, Info, MoreVertical, ChevronRight } from 'lucide-react';
import { DopamineHeatmapModal } from './DopamineHeatmapModal';

export function DopamineStatus() {
  const { todayStats } = useAppStore();
  const [isHeatmapOpen, setIsHeatmapOpen] = useState(false);
  
  const analysis = analyzeDopamine(todayStats || {});
  const color = getDopamineColor(analysis.status);

  return (
    <div className="card p-5 rounded-2xl flex flex-col items-center relative overflow-hidden"
         style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border)' }}>
      
      {/* Subtle glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-32 h-32 blur-3xl opacity-20 pointer-events-none"
           style={{ background: color }} />

      <div className="w-full flex items-center justify-between mb-6">
        <div className="flex items-center gap-1.5">
          <h2 className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>Status Dopamine</h2>
          <Info className="w-3.5 h-3.5" style={{ color: 'var(--text-muted)' }} />
        </div>
        <MoreVertical className="w-4 h-4" style={{ color: 'var(--text-muted)' }} />
      </div>

      {/* Central Visual */}
      <div className="relative mb-4">
        {/* Decorative Arc/Ring */}
        <svg className="absolute -inset-4 w-24 h-24 transform -rotate-135">
          <circle cx="48" cy="48" r="40" className="stroke-current" style={{ color: 'var(--bg-primary)' }} strokeWidth="4" fill="transparent" strokeDasharray="180 251" />
          <motion.circle
            cx="48" cy="48" r="40" className="stroke-current" style={{ color }} strokeWidth="4" fill="transparent"
            strokeDasharray={`${(analysis.score / 100) * 180} 251`}
            strokeLinecap="round"
            initial={{ strokeDashoffset: 180 }}
            animate={{ strokeDashoffset: 0 }}
            transition={{ duration: 1 }}
          />
        </svg>

        <div className="w-16 h-16 rounded-full flex items-center justify-center relative z-10"
             style={{ background: `${color}15`, border: `1px solid ${color}30` }}>
          <Brain className="w-8 h-8" style={{ color }} />
        </div>
      </div>

      <h3 className="text-lg font-bold mb-1" style={{ color }}>{analysis.messageId}</h3>
      <p className="text-xs text-center mb-6" style={{ color: 'var(--text-secondary)' }}>
        {analysis.recommendationId}
      </p>

      <button 
        onClick={() => setIsHeatmapOpen(true)}
        className="w-full flex items-center justify-between py-3 px-4 rounded-xl text-xs font-medium transition-colors hover:bg-white/5 cursor-pointer"
        style={{ background: 'var(--bg-primary)', color: 'var(--text-secondary)', border: '1px solid var(--border)' }}
      >
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded-sm" style={{ background: `${color}20` }} />
          Lihat Heatmap
        </div>
        <ChevronRight className="w-4 h-4" />
      </button>

      {/* Interactive Activity Heatmap Modal */}
      <DopamineHeatmapModal 
        isOpen={isHeatmapOpen} 
        onClose={() => setIsHeatmapOpen(false)} 
      />
    </div>
  );
}
