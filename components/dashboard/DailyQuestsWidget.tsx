'use client';

import { useAppStore } from '@/store/useAppStore';
import { motion, AnimatePresence } from 'framer-motion';
import { Target, Award, CheckCircle2, Circle, Flame, Sparkles } from 'lucide-react';

export function DailyQuestsWidget() {
  const { todayStats, theme } = useAppStore();

  const quests = todayStats?.dailyQuests || [];
  if (quests.length === 0) return null;

  const completedCount = quests.filter((q) => q.completed).length;
  const progressPercent = (completedCount / quests.length) * 100;

  // Quest type to icon converter
  const getQuestIcon = (type: string) => {
    switch (type) {
      case 'water':
        return '💧';
      case 'meals':
        return '🍽️';
      case 'sleep':
        return '🛌';
      case 'focus':
        return '⏱️';
      case 'habit_count':
        return '📜';
      case 'screen_time_limit':
        return '📱';
      default:
        return '🎯';
    }
  };

  const getMetricProgressLabel = (type: string, targetVal: number) => {
    if (!todayStats) return '';
    switch (type) {
      case 'water':
        return `${todayStats.waterGlasses || 0}/${targetVal} Gelas`;
      case 'meals':
        return `${todayStats.meals || 0}/${targetVal} Kali`;
      case 'sleep':
        return `${todayStats.sleepHours || 0}/${targetVal} Jam`;
      case 'focus':
        return `${todayStats.focusMinutes || 0}/${targetVal} Menit`;
      case 'habit_count':
        return `${todayStats.completedHabits?.length || 0}/${targetVal} Habit`;
      case 'screen_time_limit':
        return `${todayStats.screenTimeMinutes || 0}/${targetVal} Menit Maks`;
      default:
        return '';
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      className="card p-5 rounded-2xl space-y-4"
      style={{
        background: 'var(--bg-secondary)',
        border: '1px solid var(--border)',
        boxShadow: theme === 'dark' ? '0 10px 30px -10px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.05)' : '0 10px 30px -10px rgba(0,0,0,0.05)',
      }}
    >
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl flex items-center justify-center bg-indigo-500/10 text-indigo-400">
            <Target className="w-4 h-4 animate-pulse" />
          </div>
          <div>
            <h4 className="text-sm font-bold tracking-tight" style={{ color: 'var(--text-primary)' }}>
              Misi Harian Dinamis
            </h4>
            <p className="text-[10px]" style={{ color: 'var(--text-muted)' }}>
              Selesaikan misi untuk mendapatkan bonus XP ganda!
            </p>
          </div>
        </div>
        <div className="flex items-center gap-1 bg-yellow-500/10 px-2.5 py-1 rounded-full text-yellow-500 text-xs font-bold border border-yellow-500/20">
          <Flame className="w-3.5 h-3.5" />
          <span>+50 XP</span>
        </div>
      </div>

      {/* Progress Track */}
      <div className="space-y-1.5">
        <div className="flex justify-between text-xs font-semibold" style={{ color: 'var(--text-secondary)' }}>
          <span className="flex items-center gap-1">
            <Sparkles className="w-3 h-3 text-indigo-400" /> Progression
          </span>
          <span>{completedCount} / {quests.length} Selesai</span>
        </div>
        <div className="w-full h-2 rounded-full overflow-hidden" style={{ background: theme === 'dark' ? 'rgba(255,255,255,0.07)' : 'rgba(0,0,0,0.05)' }}>
          <motion.div
            className="h-full rounded-full"
            style={{
              background: 'linear-gradient(90deg, #6366F1, #8B5CF6)',
            }}
            initial={{ width: 0 }}
            animate={{ width: `${progressPercent}%` }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
          />
        </div>
      </div>

      {/* Quests list */}
      <div className="space-y-2.5 pt-1">
        <AnimatePresence>
          {quests.map((q) => (
            <motion.div
              key={q.id}
              layoutId={q.id}
              className="flex items-center justify-between p-3 rounded-xl transition-all border"
              style={{
                background: q.completed
                  ? 'rgba(16, 185, 129, 0.04)'
                  : theme === 'dark' ? 'rgba(255,255,255,0.01)' : 'rgba(0,0,0,0.01)',
                borderColor: q.completed
                  ? 'rgba(16, 185, 129, 0.2)'
                  : 'var(--border)',
              }}
            >
              <div className="flex items-center gap-3">
                <div className="text-xl flex-shrink-0 select-none">
                  {getQuestIcon(q.targetType)}
                </div>
                <div>
                  <p
                    className="text-xs font-semibold transition-all select-none"
                    style={{
                      color: q.completed ? 'var(--success)' : 'var(--text-primary)',
                      textDecoration: q.completed ? 'line-through' : 'none',
                      opacity: q.completed ? 0.7 : 1,
                    }}
                  >
                    {q.label}
                  </p>
                  <p className="text-[10px]" style={{ color: 'var(--text-muted)' }}>
                    Progress: {getMetricProgressLabel(q.targetType, q.targetValue)}
                  </p>
                </div>
              </div>

              {/* Status indicator */}
              <div className="flex-shrink-0">
                {q.completed ? (
                  <motion.div initial={{ scale: 0.5 }} animate={{ scale: 1 }}>
                    <CheckCircle2 className="w-5 h-5 text-emerald-500 fill-emerald-500/10" />
                  </motion.div>
                ) : (
                  <Circle className="w-5 h-5 text-slate-400 opacity-60" />
                )}
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}
