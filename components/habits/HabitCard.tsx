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
  const { todayStats, user, completeHabit, updateWater, updateMeals } = useAppStore();
  const [activeCategory, setActiveCategory] = useState<HabitCategory>('morning');
  const [showXP, setShowXP] = useState<{ id: string; xp: number } | null>(null);

  const filteredHabits = HABIT_DEFINITIONS.filter((h) => h.category === activeCategory && !h.isHidden);

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

  const handleSetWater = async (value: number) => {
    if (!user || !todayStats) return;
    const current = todayStats.waterGlasses || 0;
    // If clicking the current exact level, decrement by 1 (toggle off)
    const next = value === current ? current - 1 : Math.max(0, Math.min(8, value));
    if (next === current) return;

    updateWater(next);
    try {
      const { updateDailyStats } = await import('@/lib/firebase/firestore');
      await updateDailyStats(user.uid, todayStats.date, { waterGlasses: next });
      
      // Auto-complete hidden habit
      if (next >= 8 && !todayStats.completedHabits?.includes('water_8')) {
        handleComplete('water_8', 10);
      }
    } catch (e) { console.error(e); }
  };

  const handleSetMeals = async (value: number) => {
    if (!user || !todayStats) return;
    const current = todayStats.meals || 0;
    // If clicking the current exact level, decrement by 1
    const next = value === current ? current - 1 : Math.max(0, Math.min(4, value));
    if (next === current) return;

    updateMeals(next);
    try {
      const { updateDailyStats } = await import('@/lib/firebase/firestore');
      await updateDailyStats(user.uid, todayStats.date, { meals: next });
      
      // Auto-complete hidden habits based on meals count
      if (next >= 1 && !todayStats.completedHabits?.includes('eat_breakfast')) {
        handleComplete('eat_breakfast', 10);
      }
      if (next >= 2 && !todayStats.completedHabits?.includes('eat_lunch')) {
        handleComplete('eat_lunch', 10);
      }
      if (next >= 3 && !todayStats.completedHabits?.includes('eat_dinner')) {
        handleComplete('eat_dinner', 10);
      }
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
        {activeCategory === 'health' && (
          <div className="mb-4 space-y-3 pb-3 border-b" style={{ borderColor: 'var(--border)' }}>
            {/* Water Tracker */}
            <div className="p-4 rounded-xl transition-all" style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border)' }}>
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <span className="text-lg">💧</span>
                  <div>
                    <p className="text-sm font-bold" style={{ color: 'var(--text-primary)' }}>Minum 8 Gelas Air</p>
                    <p className="text-[10px]" style={{ color: 'var(--text-muted)' }}>{todayStats?.waterGlasses || 0} / 8 Gelas Terisi</p>
                  </div>
                </div>
                {todayStats?.waterGlasses === 8 && (
                  <span className="text-xs font-bold text-blue-500 animate-pulse">Selesai! 🎉</span>
                )}
              </div>
              <div className="flex items-center gap-2 sm:gap-4 flex-wrap">
                {Array.from({ length: 8 }).map((_, i) => {
                  const isFilled = (todayStats?.waterGlasses || 0) > i;
                  return (
                    <button
                      key={i}
                      onClick={() => handleSetWater(i + 1)}
                      className="relative w-8 h-12 sm:w-10 sm:h-14 rounded-b-lg rounded-t-sm border-2 overflow-hidden transition-all hover:-translate-y-1 flex-shrink-0"
                      style={{ 
                        borderColor: isFilled ? '#3B82F6' : 'var(--border)',
                        background: 'var(--bg-card)'
                      }}
                    >
                      <div 
                        className="absolute bottom-0 left-0 w-full transition-all duration-500 ease-out" 
                        style={{ 
                          height: isFilled ? '100%' : '0%', 
                          background: 'linear-gradient(180deg, #60A5FA 0%, #3B82F6 100%)' 
                        }}
                      />
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Meals Tracker */}
            <div className="p-4 rounded-xl transition-all" style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border)' }}>
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <span className="text-lg">🍽️</span>
                  <div>
                    <p className="text-sm font-bold" style={{ color: 'var(--text-primary)' }}>Makan Bernutrisi</p>
                    <p className="text-[10px]" style={{ color: 'var(--text-muted)' }}>{todayStats?.meals || 0} / 4 Porsi (3x Makan + Snack)</p>
                  </div>
                </div>
                {todayStats?.meals === 4 && (
                  <span className="text-xs font-bold text-orange-500 animate-pulse">Kenyang! 😋</span>
                )}
              </div>
              <div className="flex items-center gap-4 sm:gap-6 flex-wrap">
                {Array.from({ length: 4 }).map((_, i) => {
                  const isFilled = (todayStats?.meals || 0) > i;
                  return (
                    <button
                      key={i}
                      onClick={() => handleSetMeals(i + 1)}
                      className={cn(
                        "w-12 h-12 rounded-full border-2 flex items-center justify-center transition-all duration-300 hover:scale-110",
                        isFilled 
                          ? "border-orange-500 bg-orange-100 shadow-[0_0_15px_rgba(249,115,22,0.3)] dark:bg-orange-900/30" 
                          : "border-gray-300 bg-gray-50 dark:border-gray-700 dark:bg-gray-800"
                      )}
                    >
                      <span className={cn(
                        "text-xl transition-all duration-300",
                        isFilled ? "opacity-100 scale-100" : "opacity-30 grayscale scale-75"
                      )}>
                        {i === 3 ? '🍎' : '🍲'} {/* 4th meal is a snack */}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        )}

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
