'use client';

import { DailyStats } from '@/types/user';
import { motion } from 'framer-motion';
import { Brain, Droplet, Moon, Smartphone, Sparkles, TrendingUp } from 'lucide-react';

interface AIInsightsProps {
  stats: DailyStats[];
  theme: 'dark' | 'light';
}

export function AIInsights({ stats, theme }: AIInsightsProps) {
  if (!stats || stats.length < 3) {
    return (
      <div className="card p-5 text-center" style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border)' }}>
        <Brain className="w-8 h-8 mx-auto text-indigo-400 mb-2 opacity-50" />
        <p className="text-xs font-semibold" style={{ color: 'var(--text-secondary)' }}>
          Mengumpulkan Data Korelasi Pintar...
        </p>
        <p className="text-[10px]" style={{ color: 'var(--text-muted)' }}>
          Butuh log minimal 3 hari untuk menampilkan analitik korelasi AI.
        </p>
      </div>
    );
  }

  // 1. Calculate Sleep vs Mood
  const goodSleepDays = stats.filter((s) => (s.sleepHours || 0) >= 7);
  const badSleepDays = stats.filter((s) => (s.sleepHours || 0) > 0 && (s.sleepHours || 0) < 6);
  
  const avgMoodGoodSleep = goodSleepDays.length
    ? goodSleepDays.reduce((sum, s) => sum + (s.mood || 3), 0) / goodSleepDays.length
    : 3;
  const avgMoodBadSleep = badSleepDays.length
    ? badSleepDays.reduce((sum, s) => sum + (s.mood || 3), 0) / badSleepDays.length
    : 3;
  
  const sleepMoodImprovement = avgMoodGoodSleep > avgMoodBadSleep
    ? Math.round(((avgMoodGoodSleep - avgMoodBadSleep) / avgMoodBadSleep) * 100)
    : 0;

  // 2. Calculate Hydration vs Focus
  const highWaterDays = stats.filter((s) => (s.waterGlasses || 0) >= 7);
  const lowWaterDays = stats.filter((s) => (s.waterGlasses || 0) < 5);

  const avgFocusHighWater = highWaterDays.length
    ? highWaterDays.reduce((sum, s) => sum + (s.focusMinutes || 0), 0) / highWaterDays.length
    : 0;
  const avgFocusLowWater = lowWaterDays.length
    ? lowWaterDays.reduce((sum, s) => sum + (s.focusMinutes || 0), 0) / lowWaterDays.length
    : 0;

  const waterFocusImprovement = avgFocusHighWater > avgFocusLowWater
    ? Math.round(((avgFocusHighWater - avgFocusLowWater) / Math.max(avgFocusLowWater, 1)) * 100)
    : 0;

  // 3. Screen Time vs Sleep / Focus Impact
  const highScreenDays = stats.filter((s) => (s.screenTimeMinutes || 0) >= 120);
  const avgFocusHighScreen = highScreenDays.length
    ? highScreenDays.reduce((sum, s) => sum + (s.focusMinutes || 0), 0) / highScreenDays.length
    : 0;
  const avgFocusOverall = stats.reduce((sum, s) => sum + (s.focusMinutes || 0), 0) / stats.length;
  
  const screenFocusReduction = avgFocusOverall > avgFocusHighScreen
    ? Math.round(((avgFocusOverall - avgFocusHighScreen) / Math.max(avgFocusOverall, 1)) * 100)
    : 0;

  // Insight messages generators
  const getSleepMoodInsight = () => {
    if (sleepMoodImprovement > 0) {
      return `Hari dengan tidur cukup (≥7 jam) mendongkrak suasana hati Anda sebesar ${sleepMoodImprovement}%! Pertahankan konsistensi tidur untuk menjaga kestabilan energi harian.`;
    }
    return `Tidur cukup adalah fondasi fokus Anda. Rata-rata mood Anda saat ini stabil pada nilai ${(avgMoodGoodSleep).toFixed(1)}/5 dengan pola istirahat teratur.`;
  };

  const getWaterFocusInsight = () => {
    if (waterFocusImprovement > 0) {
      return `Tingkat hidrasi tinggi (≥7 gelas) meningkatkan durasi fokus Pomodoro harian Anda hingga ${waterFocusImprovement}% lebih lama! Air minum terbukti mendominasi performa otak Anda.`;
    }
    return `Menjaga konsumsi air minimal 8 gelas per hari membantu menghindari keletihan mental di sore hari. Targetkan minum minimal 1 gelas setiap 2 jam.`;
  };

  const getScreenInsight = () => {
    if (screenFocusReduction > 0) {
      return `Screen time berlebih (≥120 menit) mengurangi fokus mendalam Anda sebesar ${screenFocusReduction}%! Kurangi scrolling tak bertujuan untuk membebaskan 30-40 menit fokus produktif.`;
    }
    return `Screen time Anda dalam batas aman dan seimbang. Ini berkontribusi langsung pada kestabilan produktivitas harian Anda.`;
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="card p-6 rounded-3xl space-y-5 relative overflow-hidden border"
      style={{
        background: 'var(--bg-secondary)',
        borderColor: theme === 'dark' ? 'rgba(99, 102, 241, 0.25)' : 'var(--border)',
        boxShadow: theme === 'dark' ? '0 10px 40px rgba(99, 102, 241, 0.05)' : 'none',
      }}
    >
      {/* Glow decorative circle */}
      <div className="absolute -top-10 -right-10 w-36 h-36 rounded-full bg-indigo-500/5 blur-2xl" />

      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl flex items-center justify-center bg-indigo-500/10 text-indigo-400">
            <Brain className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <h3 className="text-sm font-extrabold tracking-tight" style={{ color: 'var(--text-primary)' }}>
              Analitik Korelasi Pintar
            </h3>
            <p className="text-[10px]" style={{ color: 'var(--text-muted)' }}>
              AI engine menghubungkan statistik harian Anda secara real-time
            </p>
          </div>
        </div>
        <div className="flex items-center gap-1 bg-indigo-500/15 px-2.5 py-1 rounded-full text-indigo-400 text-xs font-black">
          <Sparkles className="w-3 h-3" /> Core Engine
        </div>
      </div>

      {/* Insights stack */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Sleep vs Mood */}
        <div className="flex flex-col p-4 rounded-2xl border bg-white/5 space-y-3" style={{ borderColor: 'var(--border)' }}>
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-purple-500/10 flex items-center justify-center text-purple-400">
              <Moon className="w-4 h-4" />
            </div>
            <span className="text-xs font-bold" style={{ color: 'var(--text-primary)' }}>Tidur vs Mood</span>
          </div>
          <p className="text-[11px] leading-relaxed flex-1" style={{ color: 'var(--text-secondary)' }}>
            {getSleepMoodInsight()}
          </p>
          {sleepMoodImprovement > 0 && (
            <div className="text-purple-400 font-extrabold text-[10px] bg-purple-500/10 px-2 py-0.5 rounded-full w-max">
              +{sleepMoodImprovement}% Kebaikan Mood
            </div>
          )}
        </div>

        {/* Water vs Focus */}
        <div className="flex flex-col p-4 rounded-2xl border bg-white/5 space-y-3" style={{ borderColor: 'var(--border)' }}>
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-blue-500/10 flex items-center justify-center text-blue-400">
              <Droplet className="w-4 h-4" />
            </div>
            <span className="text-xs font-bold" style={{ color: 'var(--text-primary)' }}>Air vs Fokus</span>
          </div>
          <p className="text-[11px] leading-relaxed flex-1" style={{ color: 'var(--text-secondary)' }}>
            {getWaterFocusInsight()}
          </p>
          {waterFocusImprovement > 0 && (
            <div className="text-blue-400 font-extrabold text-[10px] bg-blue-500/10 px-2 py-0.5 rounded-full w-max">
              +{waterFocusImprovement}% Fokus Kerja
            </div>
          )}
        </div>

        {/* Screen time vs Focus */}
        <div className="flex flex-col p-4 rounded-2xl border bg-white/5 space-y-3" style={{ borderColor: 'var(--border)' }}>
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-amber-500/10 flex items-center justify-center text-amber-400">
              <Smartphone className="w-4 h-4" />
            </div>
            <span className="text-xs font-bold" style={{ color: 'var(--text-primary)' }}>Layar vs Fokus</span>
          </div>
          <p className="text-[11px] leading-relaxed flex-1" style={{ color: 'var(--text-secondary)' }}>
            {getScreenInsight()}
          </p>
          {screenFocusReduction > 0 ? (
            <div className="text-red-400 font-extrabold text-[10px] bg-red-500/10 px-2 py-0.5 rounded-full w-max">
              -{screenFocusReduction}% Distraksi Layar
            </div>
          ) : (
            <div className="text-emerald-400 font-extrabold text-[10px] bg-emerald-500/10 px-2 py-0.5 rounded-full w-max">
              Layar Terkendali
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}
