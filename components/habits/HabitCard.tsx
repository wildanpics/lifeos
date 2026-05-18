'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAppStore } from '@/store/useAppStore';
import { HABIT_DEFINITIONS } from '@/lib/constants/habits';
import { logHabit } from '@/lib/firebase/firestore';
import { getToday } from '@/lib/utils/time';
import { CheckCircle, Circle, Trash2, Plus, AlertTriangle, Compass, Heart, Sunrise, Sun, Sunset, Moon, Sparkles } from 'lucide-react';
import { triggerConfetti, triggerPremiumSuccessConfetti } from '@/lib/utils/confetti';
import { cn } from '@/lib/utils';
import { CustomHabitModal } from '@/components/habits/CustomHabitModal';
import type { HabitId } from '@/types/habit';

export function HabitCard() {
  const { 
    todayStats, 
    user, 
    completeHabit, 
    updateWater, 
    updateMeals, 
    customCategories, 
    customHabits, 
    deleteCustomCategory, 
    deleteCustomHabit 
  } = useAppStore();

  const [activeCategory, setActiveCategory] = useState<string>('morning');
  const [showXP, setShowXP] = useState<{ id: string; xp: number } | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<{ type: 'category' | 'habit'; id: string; name: string } | null>(null);

  // Merge default system categories (which are protected) with dynamic custom categories
  const mergedCategories = [
    ...(customCategories || []),
    { id: 'prayer', label: 'Sholat', emoji: '🕌', order: 1.5, isSystem: true },
    { id: 'health', label: 'Kesehatan', emoji: '💪', order: 3.5, isSystem: true }
  ].sort((a, b) => a.order - b.order);

  // Fallback to the first available category if the active one does not exist (e.g. for new users or deleted categories)
  useEffect(() => {
    if (mergedCategories.length > 0 && !mergedCategories.some((c) => c.id === activeCategory)) {
      setActiveCategory(mergedCategories[0].id);
    }
  }, [mergedCategories, activeCategory]);

  const activeCategoryObj = mergedCategories.find((c) => c.id === activeCategory);
  const activeCategoryLabel = activeCategoryObj?.label || 'Kategori';
  const isSystemCategory = activeCategory === 'prayer' || activeCategory === 'health';

  // Filter habits belonging to the active category
  const filteredHabits = isSystemCategory
    ? HABIT_DEFINITIONS.filter((h) => h.category === activeCategory && !h.isHidden)
    : [
        ...HABIT_DEFINITIONS.filter((h) => h.category === activeCategory && !h.isHidden),
        ...(customHabits || []).filter((h) => h.category === activeCategory)
      ];

  const handleComplete = async (habitId: HabitId, xp: number) => {
    if (!user || todayStats?.completedHabits?.includes(habitId)) return;
    
    // Trigger satisfying confetti burst!
    triggerConfetti();
    
    // 1. Update local UI state immediately
    completeHabit(habitId, xp);
    setShowXP({ id: habitId, xp });
    setTimeout(() => setShowXP(null), 1500);
    
    try {
      const today = getToday();
      
      // 2. Log individual habit
      await logHabit({ habitId, userId: user.uid, date: today, completedAt: new Date(), xpEarned: xp });
      
      // 3. Update the dailyStats document so completed habits persist on reload
      const newCompleted = [...(todayStats?.completedHabits || []), habitId];
      const newXp = (todayStats?.xpEarned || 0) + xp;
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
    const next = value === current ? current - 1 : Math.max(0, Math.min(8, value));
    if (next === current) return;

    updateWater(next);
    try {
      const { updateDailyStats } = await import('@/lib/firebase/firestore');
      await updateDailyStats(user.uid, todayStats.date, { waterGlasses: next });
      
      // Auto-complete custom water milestone (Gives flat 20 XP upon full 8 glasses!)
      if (next >= 8 && !todayStats.completedHabits?.includes('water_8')) {
        handleComplete('water_8', 20);
        triggerPremiumSuccessConfetti();
      }
    } catch (e) { console.error(e); }
  };

  const handleSetMeals = async (value: number) => {
    if (!user || !todayStats) return;
    const current = todayStats.meals || 0;
    const next = value === current ? current - 1 : Math.max(0, Math.min(4, value));
    if (next === current) return;

    updateMeals(next);
    try {
      const { updateDailyStats } = await import('@/lib/firebase/firestore');
      await updateDailyStats(user.uid, todayStats.date, { meals: next });
      
      // Auto-complete custom meals milestone (Gives flat 20 XP upon full 4 meals completed!)
      if (next >= 4 && !todayStats.completedHabits?.includes('meals_4')) {
        handleComplete('meals_4', 20);
        triggerPremiumSuccessConfetti();
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

      {/* Categories Tabs Bar */}
      <div className="flex gap-1.5 overflow-x-auto pb-2 mb-4 items-center">
        {mergedCategories.map((cat) => (
          <button key={cat.id} onClick={() => setActiveCategory(cat.id)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium whitespace-nowrap transition-all flex-shrink-0"
            style={{
              background: activeCategory === cat.id ? 'var(--accent)' : 'var(--bg-secondary)',
              color: activeCategory === cat.id ? 'white' : 'var(--text-secondary)',
            }}>
            {cat.id === 'prayer' ? (
              <Compass className="w-3.5 h-3.5" />
            ) : cat.id === 'health' ? (
              <Heart className="w-3.5 h-3.5" />
            ) : (
              <span>{cat.emoji}</span>
            )}
            {cat.label}
          </button>
        ))}

        {/* Add Sub-Menu Button */}
        <button 
          onClick={() => setIsModalOpen(true)}
          className="flex items-center justify-center p-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all border border-dashed border-amber-500/40 text-amber-500 hover:bg-amber-500/10 hover:border-amber-500 flex-shrink-0"
          title="Tambah Sub-Menu"
        >
          <Plus className="w-3.5 h-3.5" />
        </button>
      </div>

      <div className="space-y-2">
        {/* Health Custom Widgets rendering */}
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
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full" style={{ background: 'rgba(99,102,241,0.15)', color: 'var(--accent)' }}>
                    +20 XP
                  </span>
                  {todayStats?.waterGlasses === 8 ? (
                    <span className="text-xs font-bold text-blue-500 animate-pulse">Selesai! 🎉</span>
                  ) : null}
                </div>
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
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full" style={{ background: 'rgba(99,102,241,0.15)', color: 'var(--accent)' }}>
                    +20 XP
                  </span>
                  {todayStats?.meals === 4 ? (
                    <span className="text-xs font-bold text-orange-500 animate-pulse">Kenyang! 😋</span>
                  ) : null}
                </div>
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
                        {i === 3 ? '🍎' : '🍲'}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* Habit List rendering */}
        {filteredHabits.map((habit, i) => {
          const done = todayStats?.completedHabits?.includes(habit.id) || false;
          return (
            <motion.div key={habit.id} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.05 }}
              className="w-full flex items-center justify-between p-3 rounded-xl text-left transition-all relative overflow-hidden"
              style={{
                background: done ? 'rgba(16,185,129,0.08)' : 'var(--bg-secondary)',
                border: `1px solid ${done ? 'rgba(16,185,129,0.3)' : 'var(--border)'}`,
              }}>
              <div 
                onClick={() => !done && handleComplete(habit.id, habit.xp)}
                className={cn("flex-1 flex items-center gap-3 min-w-0", !done ? "cursor-pointer" : "")}
              >
                <span className="text-xl flex items-center justify-center w-8 h-8 rounded-xl flex-shrink-0" style={{ background: habit.id.startsWith('prayer_') ? 'rgba(245, 158, 11, 0.08)' : 'var(--bg-secondary)' }}>
                  {habit.id === 'prayer_fajr' ? (
                    <Sunrise className="w-4.5 h-4.5 text-amber-500" />
                  ) : habit.id === 'prayer_dhuhr' ? (
                    <Sun className="w-4.5 h-4.5 text-amber-500" />
                  ) : habit.id === 'prayer_asr' ? (
                    <Sunset className="w-4.5 h-4.5 text-amber-500" />
                  ) : habit.id === 'prayer_maghrib' ? (
                    <Moon className="w-4.5 h-4.5 text-indigo-400" />
                  ) : habit.id === 'prayer_isya' ? (
                    <Sparkles className="w-4.5 h-4.5 text-indigo-400" />
                  ) : (
                    habit.icon
                  )}
                </span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium" style={{ color: done ? 'var(--success)' : 'var(--text-primary)', textDecoration: done ? 'line-through' : 'none' }}>
                    {habit.labelId}
                  </p>
                  {habit.deadline && <p className="text-[10px]" style={{ color: 'var(--text-muted)' }}>Deadline: {habit.deadline}</p>}
                </div>
              </div>
              <div className="flex items-center gap-2 flex-shrink-0">
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full" style={{ background: 'rgba(99,102,241,0.15)', color: 'var(--accent)' }}>
                  +{habit.xp} XP
                </span>
                {done ? (
                  <CheckCircle className="w-5 h-5 text-green-400 flex-shrink-0" />
                ) : (
                  <Circle className="w-5 h-5 flex-shrink-0" style={{ color: 'var(--border)' }} />
                )}
                
                {/* Delete button for custom habits */}
                {habit.id.startsWith('custom_') && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setDeleteTarget({ type: 'habit', id: habit.id, name: habit.labelId });
                    }}
                    className="p-1 rounded-lg hover:bg-red-500/20 text-red-400 hover:text-red-500 transition-all flex items-center justify-center flex-shrink-0"
                    title="Hapus Kebiasaan"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
              <AnimatePresence>
                {showXP?.id === habit.id && (
                  <motion.div initial={{ opacity: 0, y: 0, scale: 0.5 }} animate={{ opacity: 1, y: -30, scale: 1 }} exit={{ opacity: 0, y: -50 }}
                    className="absolute right-4 top-2 text-sm font-bold pointer-events-none" style={{ color: '#F59E0B' }}>
                    +{showXP.xp} XP ✨
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          );
        })}

        {/* Dynamic Habits CRUD Actions Triggers */}
        {!isSystemCategory && (
          <div className="space-y-3 pt-2">
            <button
              onClick={() => setIsModalOpen(true)}
              className="w-full flex items-center justify-center gap-2 p-3 rounded-xl border border-dashed text-sm font-medium transition-all hover:bg-amber-500/5 hover:border-amber-500 border-amber-500/40 text-amber-500"
            >
              <Plus className="w-4 h-4" /> Tambah Kebiasaan Baru
            </button>

            {/* Custom Category Deletion Option */}
            {activeCategoryObj && !(activeCategoryObj as any).isSystem && (
              <div className="flex gap-2 mt-4 pt-4 border-t border-dashed" style={{ borderColor: 'var(--border)' }}>
                <button
                  onClick={() => {
                    setDeleteTarget({ type: 'category', id: activeCategory, name: activeCategoryObj.label });
                  }}
                  className="px-4 py-2 rounded-xl text-xs font-semibold border text-red-500 border-red-500/20 hover:bg-red-500/10 transition-all flex items-center gap-1.5"
                >
                  <Trash2 className="w-3.5 h-3.5" /> Hapus Sub-Menu Ini
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Habits & Category Creator Modal */}
      <CustomHabitModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        activeCategoryId={activeCategory}
        activeCategoryLabel={activeCategoryLabel}
      />

      {/* Custom Confirmation Dialog */}
      <AnimatePresence>
        {deleteTarget && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="w-full max-w-sm rounded-2xl overflow-hidden shadow-2xl p-6 border"
              style={{
                background: 'var(--bg-card)',
                borderColor: 'var(--border)',
                boxShadow: '0 20px 25px -5px rgba(0,0,0,0.5)'
              }}
            >
              <div className="flex flex-col items-center text-center space-y-4">
                <div className="w-12 h-12 rounded-full bg-red-500/10 flex items-center justify-center border border-red-500/20 text-red-500 animate-pulse">
                  <AlertTriangle className="w-5 h-5 text-red-500" />
                </div>
                <div className="space-y-1">
                  <h3 className="text-base font-bold" style={{ color: 'var(--text-primary)' }}>
                    Hapus {deleteTarget.type === 'category' ? 'Sub-Menu' : 'Kebiasaan'}?
                  </h3>
                  <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                    {deleteTarget.type === 'category' 
                      ? `Apakah Anda yakin ingin menghapus sub-menu "${deleteTarget.name}" beserta semua kebiasaan di dalamnya?`
                      : `Apakah Anda yakin ingin menghapus kebiasaan "${deleteTarget.name}"?`
                    }
                  </p>
                </div>
                <div className="flex gap-3 w-full pt-2">
                  <button
                    onClick={() => setDeleteTarget(null)}
                    className="flex-1 py-2.5 rounded-xl text-xs font-semibold border transition-all hover:bg-white/5"
                    style={{ borderColor: 'var(--border)', color: 'var(--text-secondary)' }}
                  >
                    Batal
                  </button>
                  <button
                    onClick={() => {
                      if (deleteTarget.type === 'category') {
                        deleteCustomCategory(deleteTarget.id);
                      } else {
                        deleteCustomHabit(deleteTarget.id);
                      }
                      setDeleteTarget(null);
                    }}
                    className="flex-1 py-2.5 rounded-xl text-xs font-semibold text-white transition-all bg-red-600 hover:bg-red-700 shadow-lg shadow-red-600/10"
                  >
                    Hapus
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
