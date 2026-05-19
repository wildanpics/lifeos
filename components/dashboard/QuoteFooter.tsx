'use client';

import { useState, useEffect } from 'react';
import { useAppStore } from '@/store/useAppStore';
import { getLevelFromXP, getProgressToNextLevel, getXPToNextLevel } from '@/lib/constants/levels';
import { Star, Sparkles, Brain, Award, ShieldAlert, Droplets, Monitor, Target } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

// Collection of fallback high-quality daily affirmations/quotes
const MOTIVATIONAL_QUOTES = [
  { text: "Disiplin hari ini adalah kebebasan di masa depan. Setiap pilihan kecil membentuk takdirmu.", author: "Marcus Aurelius" },
  { text: "Perubahan besar tidak terjadi dalam semalam, melainkan dari kebiasaan kecil yang dijaga konsistensinya.", author: "James Clear" },
  { text: "Fokuslah pada proses perkembangan dirimu, bukan pada kesempurnaan. Setiap hari adalah peluang baru.", author: "Stoic Sage" },
  { text: "Energi terbaik datang ketika pikiran, tubuh, dan jiwamu bergerak dalam ritme disiplin yang selaras.", author: "Zen Master" },
  { text: "Kesuksesan adalah tumpukan kemenangan kecil yang tidak terlihat oleh orang lain setiap harinya.", author: "Anonymous" },
];

export function QuoteFooter() {
  const { totalXP, todayStats } = useAppStore();
  const [randomQuote, setRandomQuote] = useState(MOTIVATIONAL_QUOTES[0]);
  const [insight, setInsight] = useState<{ icon: any; title: string; desc: string; color: string } | null>(null);

  // Get current RPG level metadata
  const levelInfo = getLevelFromXP(totalXP || 0);
  const progressPct = getProgressToNextLevel(totalXP || 0);
  const xpNeeded = getXPToNextLevel(totalXP || 0);
  const LevelIcon = levelInfo.icon || Star;

  // Select quote once on mount
  useEffect(() => {
    const idx = Math.floor(Math.random() * MOTIVATIONAL_QUOTES.length);
    setRandomQuote(MOTIVATIONAL_QUOTES[idx]);
  }, []);

  // Compute dynamic AI Coach insight based on real-time daily stats
  useEffect(() => {
    if (!todayStats) return;

    const sleep = todayStats.sleepHours ?? 0;
    const water = todayStats.waterGlasses ?? 0;
    const screen = todayStats.screenTimeMinutes ?? 0;
    const focus = todayStats.focusMinutes ?? 0;

    // 1. Alert for poor sleep
    if (sleep > 0 && sleep < 6) {
      setInsight({
        icon: ShieldAlert,
        title: "Tidurmu Kurang Optimal Semalam 🌙",
        desc: `Kamu hanya tidur ${sleep} jam. Hindari aktivitas kognitif berat hari ini, ambil jeda istirahat 15 menit untuk memulihkan energi otakmu.`,
        color: "#8B5CF6", // Purple
      });
      return;
    }

    // 2. Alert for dehydration
    if (water > 0 && water < 4) {
      setInsight({
        icon: Droplets,
        title: "Otakmu Butuh Hidrasi! 💧",
        desc: `Kamu baru meminum ${water} gelas air hari ini. Ambil segelas air dingin sekarang juga untuk mendongkrak daya konsentrasi dan mencegah kantuk.`,
        color: "#3B82F6", // Blue
      });
      return;
    }

    // 3. Alert for high screen time
    if (screen > 180) {
      setInsight({
        icon: Monitor,
        title: "Waktunya Istirahatkan Matamu 👀",
        desc: `Screen time hari ini sudah mencapai ${Math.floor(screen / 60)}j ${screen % 60}m. Terapkan aturan 20-20-20: tatap objek sejauh 6 meter selama 20 detik sekarang.`,
        color: "#EF4444", // Red
      });
      return;
    }

    // 4. Appreciation for high focus/deep work
    if (focus >= 60) {
      setInsight({
        icon: Target,
        title: "Kapasitas Fokus yang Luar Biasa! ⚡",
        desc: `Kamu telah melakukan deep work selama ${focus} menit hari ini. Selesaikan sisa harimu dengan penuh kemenangan!`,
        color: "#10B981", // Emerald
      });
      return;
    }

    // 5. Default state: Show beautiful quote
    setInsight(null);
  }, [todayStats]);

  return (
    <div 
      className="relative mt-8 rounded-2xl overflow-hidden p-6 md:p-8 border card transition-all duration-500 group shadow-md dark:shadow-black/40" 
      style={{ 
        borderColor: `${levelInfo.color}35`, 
        background: 'linear-gradient(135deg, var(--bg-card) 0%, var(--bg-secondary) 100%)',
      }}
    >
      {/* Dynamic Animated background particles */}
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none opacity-40">
        <svg className="absolute bottom-0 w-full h-24 preserve-3d" viewBox="0 0 1440 320" preserveAspectRatio="none">
          <path fill={`${levelInfo.color}08`} d="M0,288L48,272C96,256,192,224,288,197.3C384,171,480,149,576,165.3C672,181,768,235,864,250.7C960,267,1056,245,1152,250.7C1248,256,1344,288,1392,304L1440,320L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"></path>
          <path fill={`${levelInfo.color}05`} d="M0,192L60,202.7C120,213,240,235,360,234.7C480,235,600,213,720,208C840,203,960,213,1080,224C1200,235,1320,245,1380,250.7L1440,256L1440,320L1380,320C1320,320,1200,320,1080,320C960,320,840,320,720,320C600,320,480,320,360,320C240,320,120,320,60,320L0,320Z"></path>
        </svg>
        <div className="absolute top-4 right-10 w-24 h-24 rounded-full blur-3xl opacity-10" style={{ background: levelInfo.color }} />
        <div className="absolute bottom-2 left-1/4 w-32 h-16 rounded-full blur-2xl opacity-10" style={{ background: levelInfo.color }} />
      </div>

      {/* Main Grid: Left is Dynamic Insight, Right is Live XP Tracker */}
      <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
        
        {/* Dynamic Coach / Quote Panel (8 Columns) */}
        <div className="lg:col-span-8 flex gap-4">
          <div 
            className="w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0 transition-transform duration-500 group-hover:scale-110"
            style={{ 
              background: insight ? `${insight.color}15` : `${levelInfo.color}12`,
              border: `1.5px solid ${insight ? insight.color + '40' : levelInfo.color + '25'}`
            }}
          >
            {insight ? (
              <insight.icon className="w-6 h-6 animate-pulse" style={{ color: insight.color }} />
            ) : (
              <Brain className="w-6 h-6 text-indigo-500 dark:text-indigo-400" />
            )}
          </div>
          
          <div className="space-y-1">
            <span 
              className="text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-full"
              style={{ 
                background: insight ? `${insight.color}15` : `${levelInfo.color}15`, 
                color: insight ? insight.color : levelInfo.color 
              }}
            >
              {insight ? "AI Coach Reflection" : "Afirmasi Pertumbuhan"}
            </span>
            
            <AnimatePresence mode="wait">
              {insight ? (
                <motion.div
                  key="insight"
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -5 }}
                  transition={{ duration: 0.3 }}
                >
                  <h2 className="text-sm md:text-base font-bold text-[var(--text-primary)] mt-1 leading-snug">
                    {insight.title}
                  </h2>
                  <p className="text-xs md:text-sm text-[var(--text-secondary)] mt-1 leading-relaxed max-w-2xl">
                    {insight.desc}
                  </p>
                </motion.div>
              ) : (
                <motion.div
                  key="quote"
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -5 }}
                  transition={{ duration: 0.3 }}
                >
                  <h2 className="text-sm md:text-base font-bold text-[var(--text-primary)] mt-1 leading-snug">
                    "{randomQuote.text}"
                  </h2>
                  <p className="text-[11px] md:text-xs text-[var(--text-secondary)] mt-1 italic font-medium">
                    — {randomQuote.author}
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Live RPG XP Progression Panel (4 Columns) */}
        <div 
          className="lg:col-span-4 p-4 rounded-xl border flex flex-col gap-2 relative overflow-hidden bg-[var(--bg-primary)] border-[var(--border)]"
        >
          {/* Header level */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div 
                className="w-7 h-7 rounded-lg flex items-center justify-center"
                style={{ background: `${levelInfo.color}20`, border: `1px solid ${levelInfo.color}40` }}
              >
                <LevelIcon className="w-4 h-4" style={{ color: levelInfo.color }} />
              </div>
              <div className="flex flex-col">
                <span className="text-[10px] font-bold uppercase tracking-wide text-[var(--text-secondary)]">Level {levelInfo.level}</span>
                <span className="text-xs font-bold text-[var(--text-primary)] leading-none">{levelInfo.titleId}</span>
              </div>
            </div>
            
            <span className="text-[10px] font-bold" style={{ color: levelInfo.color }}>
              {totalXP} XP
            </span>
          </div>

          {/* Sleek Glowing Progress Bar */}
          <div className="space-y-1">
            <div className="w-full h-2 rounded-full bg-neutral-200 dark:bg-white/5 overflow-hidden border border-neutral-300/30 dark:border-white/5 relative">
              <motion.div
                className="h-full rounded-full relative"
                style={{ 
                  background: `linear-gradient(90deg, ${levelInfo.color}bb, ${levelInfo.color})`,
                  boxShadow: `0 0 10px ${levelInfo.color}` 
                }}
                initial={{ width: 0 }}
                animate={{ width: `${progressPct}%` }}
                transition={{ duration: 1, ease: 'easeOut' }}
              />
            </div>
            
            <div className="flex items-center justify-between text-[9px] font-medium text-[var(--text-secondary)]">
              <span>{progressPct}% Progres</span>
              {xpNeeded > 0 ? (
                <span className="flex items-center gap-0.5">
                  <Sparkles className="w-2.5 h-2.5 text-amber-500" />
                  {xpNeeded} XP menuju Level {levelInfo.level + 1}
                </span>
              ) : (
                <span>Level Maksimal! 🏆</span>
              )}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
