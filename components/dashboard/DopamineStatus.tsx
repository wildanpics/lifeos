'use client';

import { motion } from 'framer-motion';
import { useAppStore } from '@/store/useAppStore';
import { analyzeDopamine, getDopamineColor } from '@/lib/utils/dopamine';
import { Brain } from 'lucide-react';
import { cn } from '@/lib/utils';

export function DopamineStatus() {
  const { todayStats } = useAppStore();
  const analysis = analyzeDopamine(todayStats || {});
  const color = getDopamineColor(analysis.status);

  const statusIcon = {
    clean: '✅',
    distracted: '⚠️',
    overstimulated: '🚨',
  }[analysis.status];

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: 0.3 }}
      className="card"
      style={{
        background: `${color}10`,
        border: `1px solid ${color}30`,
      }}
    >
      <div className="flex items-center gap-3">
        <div
          className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
          style={{ background: `${color}20` }}
        >
          <Brain className="w-5 h-5" style={{ color }} />
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-0.5">
            <span className="text-sm font-semibold" style={{ color }}>
              {statusIcon} {analysis.messageId}
            </span>
            <span
              className="text-xs px-2 py-0.5 rounded-full font-medium"
              style={{ background: `${color}20`, color }}
            >
              {analysis.score}/100
            </span>
          </div>
          <p className="text-xs leading-relaxed" style={{ color: 'var(--text-muted)' }}>
            {analysis.recommendationId}
          </p>
        </div>

        {/* Score bar */}
        <div className="w-12 flex flex-col items-center gap-1">
          <div className="text-xs font-bold" style={{ color }}>
            {analysis.score}%
          </div>
          <div className="w-2 h-16 rounded-full relative" style={{ background: 'var(--border)' }}>
            <motion.div
              className="absolute bottom-0 left-0 right-0 rounded-full"
              style={{ background: color }}
              initial={{ height: 0 }}
              animate={{ height: `${analysis.score}%` }}
              transition={{ duration: 1, delay: 0.5 }}
            />
          </div>
        </div>
      </div>
    </motion.div>
  );
}
