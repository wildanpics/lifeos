'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAppStore } from '@/store/useAppStore';
import { HABIT_DEFINITIONS } from '@/lib/constants/habits';
import { logHabit } from '@/lib/firebase/firestore';
import { getToday } from '@/lib/utils/time';
import { CheckCircle, Circle, Trash2, Plus, AlertTriangle, Compass, Heart, Sunrise, Sun, Sunset, Moon, Sparkles, Lightbulb } from 'lucide-react';
import { triggerConfetti, triggerPremiumSuccessConfetti } from '@/lib/utils/confetti';
import { cn } from '@/lib/utils';
import { CustomHabitModal } from '@/components/habits/CustomHabitModal';
import { playMechanicalClick } from '@/lib/utils/sound';
import type { HabitId } from '@/types/habit';

interface CoachContent {
  quote: string;
  author: string;
  tip: string;
}

const COACH_CONTENTS: CoachContent[] = [
  {
    quote: "Anda tidak naik ke tingkat tujuan Anda. Anda jatuh ke tingkat sistem Anda.",
    author: "James Clear, Atomic Habits",
    tip: "Fokuslah membangun rutinitas kecil yang mudah diulangi setiap hari daripada hanya memikirkan target besar."
  },
  {
    quote: "Kemenangan pertama dan terbaik adalah menaklukkan diri sendiri.",
    author: "Plato",
    tip: "Saat malas melanda, gunakan aturan 2 menit: mulailah kebiasaan tersebut selama 2 menit saja untuk memecah kelembaman."
  },
  {
    quote: "Hambatan untuk bertindak memajukan tindakan. Apa yang menghalangi jalan menjadi jalan.",
    author: "Marcus Aurelius, Stoicism",
    tip: "Jadikan rasa malas atau rintangan hari ini sebagai latihan kekuatan mental dan disiplin diri Anda."
  },
  {
    quote: "Disiplin adalah memilih antara apa yang Anda inginkan sekarang dan apa yang paling Anda inginkan.",
    author: "Abraham Lincoln",
    tip: "Saat tergoda untuk menunda, ingatkan diri Anda tentang identitas disiplin jangka panjang yang sedang Anda bangun."
  },
  {
    quote: "Kita adalah apa yang kita lakukan berulang kali. Keunggulan, bukanlah tindakan, melainkan kebiasaan.",
    author: "Aristoteles",
    tip: "Konsistensi kecil yang dilakukan setiap hari jauh lebih kuat daripada ledakan motivasi besar yang hanya bertahan seminggu."
  },
  {
    quote: "Kekuatan kebiasaan bertumpu pada pengulangan, bukan intensitas.",
    author: "James Clear, Atomic Habits",
    tip: "Lebih baik minum 4 gelas air sehari secara konsisten daripada minum 8 gelas hari ini tapi besok sama sekali tidak."
  },
  {
    quote: "Kuasai pagimu, maka kamu akan menguasai harimu.",
    author: "Seneca, Stoicism",
    tip: "Selesaikan kebiasaan tersulit Anda di pagi hari (Eat The Frog) untuk memicu produktivitas beruntun sepanjang hari."
  },
  {
    quote: "Jika kamu menginginkan ketenangan pikiran, lakukanlah lebih sedikit hal tetapi lakukan dengan lebih baik.",
    author: "Marcus Aurelius, Stoicism",
    tip: "Jangan penuhi hari Anda dengan puluhan target. Pilih 3-5 kebiasaan inti dan lakukan dengan fokus penuh."
  },
  {
    quote: "Satu-satunya kegagalan sejati dalam membangun kebiasaan adalah ketika Anda berhenti mencobanya.",
    author: "James Clear, Atomic Habits",
    tip: "Jika hari ini Anda melewatkan satu kebiasaan, pastikan Anda tidak melewatkannya dua kali berturut-turut."
  }
];

export function HabitCard() {
  const { 
    todayStats, 
    user, 
    completeHabit, 
    uncompleteHabit,
    updateWater, 
    updateMeals, 
    customCategories, 
    customHabits, 
    deleteCustomCategory, 
    deleteCustomHabit,
    theme
  } = useAppStore();

  const [activeCategory, setActiveCategory] = useState<string>('morning');
  const [showXP, setShowXP] = useState<{ id: string; xp: number } | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<{ type: 'category' | 'habit'; id: string; name: string } | null>(null);

  const [showCoaching, setShowCoaching] = useState(false);
  const [currentCoachContent, setCurrentCoachContent] = useState<CoachContent>(COACH_CONTENTS[0]);

  // Sync a random coaching quote on mount
  useEffect(() => {
    const randomIdx = Math.floor(Math.random() * COACH_CONTENTS.length);
    setCurrentCoachContent(COACH_CONTENTS[randomIdx]);
  }, []);

  const handleRefreshCoaching = () => {
    try {
      playMechanicalClick();
    } catch (e) {}

    let newIdx = Math.floor(Math.random() * COACH_CONTENTS.length);
    while (COACH_CONTENTS.length > 1 && COACH_CONTENTS[newIdx].quote === currentCoachContent.quote) {
      newIdx = Math.floor(Math.random() * COACH_CONTENTS.length);
    }
    setCurrentCoachContent(COACH_CONTENTS[newIdx]);
  };

  // Use custom categories directly
  const mergedCategories = [...(customCategories || [])].sort((a, b) => a.order - b.order);

  // Fallback to the first available category if the active one does not exist (e.g. for new users or deleted categories)
  useEffect(() => {
    if (mergedCategories.length > 0 && !mergedCategories.some((c) => c.id === activeCategory)) {
      setActiveCategory(mergedCategories[0].id);
    }
  }, [customCategories, activeCategory]);

  const activeCategoryObj = mergedCategories.find((c) => c.id === activeCategory);
  const activeCategoryLabel = activeCategoryObj?.label || 'Kategori';

  // Filter habits belonging to the active category
  const filteredHabits = [
    ...HABIT_DEFINITIONS.filter((h) => h.category === activeCategory && !h.isHidden),
    ...(customHabits || []).filter((h) => h.category === activeCategory)
  ];

  const handleHabitClick = async (habitId: HabitId, xp: number) => {
    if (!user || !todayStats) return;

    const isAlreadyCompleted = todayStats.completedHabits?.includes(habitId);

    if (isAlreadyCompleted) {
      // ── BATAL CENTANG (UNCHECK) ───────────────────────────────────────────
      // 1. Update state lokal seketika
      uncompleteHabit(habitId, xp);

      try {
        const today = getToday();
        const { deleteHabitLog, updateDailyStats, addXP } = await import('@/lib/firebase/firestore');

        // 2. Hapus log habit di database
        await deleteHabitLog(user.uid, habitId, today);

        // 3. Update status harian
        const newCompleted = (todayStats.completedHabits || []).filter((id) => id !== habitId);
        const newXp = Math.max(0, (todayStats.xpEarned || 0) - xp);
        await updateDailyStats(user.uid, today, {
          completedHabits: newCompleted,
          xpEarned: newXp,
        });

        // 4. Kurangi XP di profil global Firebase (-xp)
        await addXP(user.uid, -xp);
      } catch (e) {
        console.error('Failed to uncomplete habit:', e);
      }
    } else {
      // ── CENTANG (CHECK) ───────────────────────────────────────────────────
      const completedSet = new Set([...(todayStats.completedHabits || []), habitId]);
      const isCategoryCompleted = filteredHabits.every((h) => completedSet.has(h.id));

      if (isCategoryCompleted) {
        triggerPremiumSuccessConfetti();
      }

      // 1. Update state lokal seketika
      completeHabit(habitId, xp);
      setShowXP({ id: habitId, xp });
      setTimeout(() => setShowXP(null), 1500);

      try {
        const today = getToday();

        // 2. Catat log habit baru
        await logHabit({ habitId, userId: user.uid, date: today, completedAt: new Date(), xpEarned: xp });

        // 3. Update status harian
        const newCompleted = [...(todayStats.completedHabits || []), habitId];
        const newXp = (todayStats.xpEarned || 0) + xp;
        const { updateDailyStats, addXP } = await import('@/lib/firebase/firestore');

        await updateDailyStats(user.uid, today, {
          completedHabits: newCompleted,
          xpEarned: newXp,
        });

        // 4. Tambah XP ke profil global Firebase
        await addXP(user.uid, xp);
      } catch (e) {
        console.error(e);
      }
    }
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
        handleHabitClick('water_8', 20);
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
        handleHabitClick('meals_4', 20);
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

  const isDark = theme === 'dark';

  return (
    <div className="card">
      <div className="flex items-center justify-between gap-3 px-3 py-2 rounded-xl mb-4 text-xs font-medium" style={{ background: 'var(--bg-secondary)', color: 'var(--accent)' }}>
        <span>{identityMessage}</span>
        <button 
          onClick={() => {
            try { playMechanicalClick(); } catch(e) {}
            setShowCoaching(!showCoaching);
          }} 
          className="relative flex items-center justify-center p-1.5 rounded-lg hover:bg-white/5 transition-all text-amber-400 focus:outline-none shrink-0"
          title="Refleksi Disiplin & Motivasi Cerdas"
        >
          {/* Soft glowing ambient aura behind the lightbulb */}
          <span className="absolute inset-0 rounded-full bg-amber-400/20 blur-md animate-pulse pointer-events-none" />
          <Lightbulb className="w-4 h-4 text-amber-400 relative z-10 animate-bounce" style={{ animationDuration: '3s' }} />
        </button>
      </div>

      {/* AI Micro-Coaching Reflection Card */}
      <AnimatePresence initial={false}>
        {showCoaching && (
          <motion.div
            initial={{ opacity: 0, height: 0, marginBottom: 0 }}
            animate={{ opacity: 1, height: 'auto', marginBottom: 16 }}
            exit={{ opacity: 0, height: 0, marginBottom: 0 }}
            transition={{ duration: 0.3, ease: 'easeInOut' }}
            className="overflow-hidden"
          >
            <div 
              className="p-4 rounded-xl border relative overflow-hidden flex flex-col gap-3"
              style={{ 
                background: isDark 
                  ? 'linear-gradient(135deg, rgba(245, 158, 11, 0.04) 0%, rgba(99, 102, 241, 0.04) 100%)' 
                  : 'linear-gradient(135deg, rgba(245, 158, 11, 0.06) 0%, rgba(99, 102, 241, 0.06) 100%)',
                borderColor: 'var(--border)'
              }}
            >
              {/* Decorative particles / accent glows */}
              <div className="absolute -top-12 -right-12 w-24 h-24 bg-amber-500/10 rounded-full blur-xl pointer-events-none" />
              <div className="absolute -bottom-12 -left-12 w-24 h-24 bg-indigo-500/10 rounded-full blur-xl pointer-events-none" />

              <div className="flex items-start gap-2.5 relative z-10">
                <div className="p-2 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-500 shrink-0">
                  <Sparkles className="w-4 h-4 text-amber-400 animate-spin" style={{ animationDuration: '8s' }} />
                </div>
                <div className="space-y-1.5 flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-black uppercase tracking-widest text-amber-500">
                      AI Refleksi & Motivasi
                    </span>
                    <button 
                      onClick={() => handleRefreshCoaching()}
                      className="text-[9px] font-bold text-indigo-400 hover:text-indigo-500 uppercase tracking-wider transition-all select-none"
                    >
                      Segarkan 🔄
                    </button>
                  </div>
                  <p className="text-xs font-bold leading-relaxed italic" style={{ color: 'var(--text-primary)' }}>
                    "{currentCoachContent.quote}"
                  </p>
                  <p className="text-[10px] font-black text-right tracking-wide uppercase" style={{ color: 'var(--text-muted)' }}>
                    — {currentCoachContent.author}
                  </p>
                  
                  {/* Smart Tips divider */}
                  <div className="h-[1px] w-full my-2 bg-gradient-to-r from-transparent via-amber-500/20 to-transparent" />
                  
                  <div className="flex gap-2 items-start text-[11px] leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
                    <span className="text-xs shrink-0">💡</span>
                    <div className="min-w-0">
                      <span className="text-amber-500 font-extrabold uppercase text-[9px] tracking-wide mr-1.5">[AI TIPS]</span>
                      {currentCoachContent.tip}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

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
        {/* Empty State Banner when no categories exist */}
        {mergedCategories.length === 0 && (
          <motion.div 
            initial={{ opacity: 0, y: 15 }} 
            animate={{ opacity: 1, y: 0 }}
            className="p-6 rounded-2xl text-center border relative overflow-hidden my-4"
            style={{
              background: 'rgba(245,158,11,0.03)',
              borderColor: 'rgba(245,158,11,0.2)',
              boxShadow: '0 8px 32px 0 rgba(245, 158, 11, 0.05)',
            }}
          >
            <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-32 h-32 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

            <span className="text-4xl mb-3 block animate-bounce">✨</span>
            <h3 className="text-base font-extrabold mb-1" style={{ color: 'var(--text-primary)' }}>
              Mulai Perjalanan Disiplinmu!
            </h3>
            <p className="text-xs max-w-sm mx-auto mb-4 leading-relaxed text-center" style={{ color: 'var(--text-secondary)' }}>
              Tab menu kebiasaan Anda masih kosong bersih. Klik tombol <span className="font-bold text-amber-500">"+"</span> di atas untuk langsung memasang template siap pakai seperti **Sholat & Ibadah**, **Kesehatan**, atau membuat kategori kustom Anda sendiri!
            </p>
            <button 
              onClick={() => setIsModalOpen(true)}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold shadow-md transition-all hover:scale-105"
              style={{
                background: 'linear-gradient(135deg, #F59E0B 0%, #D97706 100%)',
                color: 'white',
              }}
            >
              <Plus className="w-3.5 h-3.5" /> Pasang Tab Menu Sekarang
            </button>
          </motion.div>
        )}

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
                onClick={() => handleHabitClick(habit.id, habit.xp)}
                className="flex-1 flex items-center gap-3 min-w-0 cursor-pointer"
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
                <div 
                  onClick={() => handleHabitClick(habit.id, habit.xp)}
                  className="cursor-pointer flex-shrink-0"
                >
                  {done ? (
                    <CheckCircle className="w-5 h-5 text-green-400" />
                  ) : (
                    <Circle className="w-5 h-5" style={{ color: 'var(--border)' }} />
                  )}
                </div>
                
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
        <div className="space-y-3 pt-2">
          {activeCategory !== 'prayer' && activeCategory !== 'health' && (
            <button
              onClick={() => setIsModalOpen(true)}
              className="w-full flex items-center justify-center gap-2 p-3 rounded-xl border border-dashed text-sm font-medium transition-all hover:bg-amber-500/5 hover:border-amber-500 border-amber-500/40 text-amber-500"
            >
              <Plus className="w-4 h-4" /> Tambah Kebiasaan Baru
            </button>
          )}

          {/* Custom Category Deletion Option */}
          {activeCategoryObj && (
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
      </div>

      {/* Habits & Category Creator Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <CustomHabitModal
            onClose={() => setIsModalOpen(false)}
            activeCategoryId={activeCategory}
            activeCategoryLabel={activeCategoryLabel}
          />
        )}
      </AnimatePresence>

      {/* Custom Confirmation Dialog */}
      <AnimatePresence>
        {deleteTarget && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
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
