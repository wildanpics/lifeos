'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAppStore } from '@/store/useAppStore';
import { HABIT_DEFINITIONS } from '@/lib/constants/habits';
import { logHabit } from '@/lib/firebase/firestore';
import { getToday } from '@/lib/utils/time';
import { CheckCircle, Circle } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { HabitId, HabitCategory } from '@/types/habit';

const CATEGORIES: { id: HabitCategory; label: string; emoji: string }[] = [
  { id: 'morning', label: 'Pagi', emoji: '🌅' },
  { id: 'prayer', label: 'Sholat', emoji: '🕌' },
  { id: 'focus', label: 'Fokus', emoji: '🎯' },
  { id: 'health', label: 'Kesehatan', emoji: '💪' },
  { id: 'night', label: 'Malam', emoji: '🌙' },
  { id: 'freelance', label: 'Freelance', emoji: '💼' },
];

export function HabitCard() {
  const { todayStats, user, completeHabit } = useAppStore();
  const [activeCategory, setActiveCategory] = useState<HabitCategory>('morning');
  const [showXP, setShowXP] = useState<{ id: string; xp: number } | null>(null);

  const filteredHabits = HABIT_DEFINITIONS.filter((h) => h.category === activeCategory);

  const handleComplete = async (habitId: HabitId, xp: number) => {
    if (!user || todayStats?.completedHabits?.includes(habitId)) return;
    
    // 1. Update local UI state immediately
    completeHabit(habitId, xp);
    setShowXP({ id: habitId, xp });
    setTimeout(() => setShowXP(null), 1500);
    
    try {
      const today = getToday();
      
      // 2. Log individual habit
      await logHabit({ habitId, userId: user.uid, date: today, completedAt: new Date(), xpEarned: xp });
      
      // 3. Update the dailyStats document so completed habits persist on reload!
      const newCompleted = [...(todayStats?.completedHabits || []), habitId];
      const newXp = (todayStats?.xpEarned || 0) + xp;
      // We need to import updateDailyStats and addXP for this
      const { updateDailyStats, addXP } = await import('@/lib/firebase/firestore');
      
      await updateDailyStats(user.uid, today, {
        completedHabits: newCompleted,
        xpEarned: newXp
      });
      
      // 4. Add XP to global user profile
      await addXP(user.uid, xp);
      
    } catch (e) { console.error(e); }
  };

  const completedCount = todayStats?.completedHabits?.length || 0;
  const identityMessage =
    completedCount >= 10 ? '⚡ Kamu sudah menjadi orang disiplin!'
    : completedCount >= 6 ? '🔥 Terus pertahankan kebiasaan baikmu!'
    : completedCount >= 3 ? '💪 Kamu sedang membangun karakter yang kuat!'
    : '🌱 Setiap langkah kecil membentuk disiplinmu.';

  return (
    <div className="card">
      <div className="px-3 py-2 rounded-xl mb-4 text-xs font-medium" style={{ background: 'var(--bg-secondary)', color: 'var(--accent)' }}>
        {identityMessage}
      </div>

      <div className="flex gap-1.5 overflow-x-auto pb-2 mb-4">
        {CATEGORIES.map((cat) => (
          <button key={cat.id} onClick={() => setActiveCategory(cat.id)}
            className="flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-medium whitespace-nowrap transition-all flex-shrink-0"
            style={{
              background: activeCategory === cat.id ? 'var(--accent)' : 'var(--bg-secondary)',
              color: activeCategory === cat.id ? 'white' : 'var(--text-secondary)',
            }}>
            <span>{cat.emoji}</span>{cat.label}
          </button>
        ))}
      </div>

      <div className="space-y-2">
        {filteredHabits.map((habit, i) => {
          const done = todayStats?.completedHabits?.includes(habit.id) || false;
          return (
            <motion.button key={habit.id} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.05 }} whileTap={{ scale: 0.98 }}
              onClick={() => handleComplete(habit.id, habit.xp)} disabled={done}
              className="w-full flex items-center gap-3 p-3 rounded-xl text-left transition-all relative overflow-hidden"
              style={{
                background: done ? 'rgba(16,185,129,0.08)' : 'var(--bg-secondary)',
                border: `1px solid ${done ? 'rgba(16,185,129,0.3)' : 'var(--border)'}`,
              }}>
              <span className="text-xl">{habit.icon}</span>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium" style={{ color: done ? 'var(--success)' : 'var(--text-primary)', textDecoration: done ? 'line-through' : 'none' }}>
                  {habit.labelId}
                </p>
                {habit.deadline && <p className="text-[10px]" style={{ color: 'var(--text-muted)' }}>Deadline: {habit.deadline}</p>}
              </div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full" style={{ background: 'rgba(99,102,241,0.15)', color: 'var(--accent)' }}>+{habit.xp} XP</span>
                {done ? <CheckCircle className="w-5 h-5 text-green-400 flex-shrink-0" /> : <Circle className="w-5 h-5 flex-shrink-0" style={{ color: 'var(--border)' }} />}
              </div>
              <AnimatePresence>
                {showXP?.id === habit.id && (
                  <motion.div initial={{ opacity: 0, y: 0, scale: 0.5 }} animate={{ opacity: 1, y: -30, scale: 1 }} exit={{ opacity: 0, y: -50 }}
                    className="absolute right-4 top-2 text-sm font-bold pointer-events-none" style={{ color: '#F59E0B' }}>
                    +{showXP.xp} XP ✨
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}
