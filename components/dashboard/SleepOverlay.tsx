'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAppStore } from '@/store/useAppStore';
import { Moon, Sunrise, Smile, Sparkles } from 'lucide-react';
import { triggerConfetti } from '@/lib/utils/confetti';
import { playMechanicalClick, playCrystalChime } from '@/lib/utils/sound';

export function SleepOverlay() {
  const { 
    isSleeping, 
    sleepStartTime, 
    toggleSleep, 
    updateSleep, 
    updateMood, 
    todayStats, 
    user 
  } = useAppStore();

  const [elapsedText, setElapsedText] = useState('00j 00m 00d');
  const [showMoodPrompt, setShowMoodPrompt] = useState(false);
  const [sessionHours, setSessionHours] = useState(0);

  // Live timer tick
  useEffect(() => {
    if (!isSleeping || !sleepStartTime) return;

    const interval = setInterval(() => {
      const diffMs = Date.now() - sleepStartTime;
      const secs = Math.floor(diffMs / 1000) % 60;
      const mins = Math.floor(diffMs / (1000 * 60)) % 60;
      const hours = Math.floor(diffMs / (1000 * 60 * 60));

      const formatNum = (num: number) => num.toString().padStart(2, '0');
      setElapsedText(`${formatNum(hours)}j ${formatNum(mins)}m ${formatNum(secs)}d`);
    }, 1000);

    return () => clearInterval(interval);
  }, [isSleeping, sleepStartTime]);

  // If sleep status resets but mood is not answered yet, we keep the prompt open
  if (!isSleeping && !showMoodPrompt) return null;

  const handleWakeUp = async () => {
    if (!sleepStartTime) return;
    try {
      playMechanicalClick();
    } catch (e) {}

    const diffHrs = (Date.now() - sleepStartTime) / (1000 * 60 * 60);
    const finalHours = Math.round(diffHrs * 10) / 10; // 1 decimal place
    setSessionHours(finalHours);

    // Save sleep hours
    updateSleep(finalHours);
    try {
      const { updateDailyStats } = await import('@/lib/firebase/firestore');
      if (user && todayStats) {
        await updateDailyStats(user.uid, todayStats.date, { sleepHours: finalHours });
      }
    } catch (e) {
      console.error(e);
    }

    // Toggle sleep state to false in app store
    toggleSleep(); 
    
    // Shift view to mood selection
    setShowMoodPrompt(true);
  };

  const handleMoodSelect = async (moodValue: number) => {
    try {
      playCrystalChime();
    } catch (e) {}

    updateMood(moodValue);
    try {
      const { updateDailyStats } = await import('@/lib/firebase/firestore');
      if (user && todayStats) {
        await updateDailyStats(user.uid, todayStats.date, { mood: moodValue });
      }
    } catch (e) {
      console.error(e);
    }

    // Close the mood prompt
    setShowMoodPrompt(false);
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md select-none overflow-y-auto">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="w-full max-w-md rounded-3xl p-6 md:p-8 text-center relative overflow-hidden border border-indigo-500/20 shadow-[0_0_50px_rgba(99,102,241,0.2)] bg-slate-900/90"
        >
          {/* Neon radial backdrop glows */}
          <div className="absolute -top-24 -left-24 w-48 h-48 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -bottom-24 -right-24 w-48 h-48 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />

          {!showMoodPrompt ? (
            <div className="space-y-6 relative z-10 py-4">
              <div className="relative w-24 h-24 mx-auto flex items-center justify-center">
                {/* Pulsing moon container */}
                <div className="absolute inset-0 bg-indigo-500/20 rounded-full blur-xl scale-125 animate-pulse" />
                <div className="w-20 h-20 rounded-full bg-gradient-to-tr from-indigo-600 to-purple-600 flex items-center justify-center border border-indigo-400/30">
                  <Moon className="w-10 h-10 text-indigo-200 animate-bounce" style={{ animationDuration: '4s' }} />
                </div>
                {/* Floating sleep Zzz */}
                <span className="absolute -top-1 -right-1 text-xs animate-bounce" style={{ animationDelay: '0.5s' }}>💤</span>
                <span className="absolute top-4 -right-4 text-sm animate-bounce" style={{ animationDelay: '1.2s' }}>💤</span>
              </div>

              <div className="space-y-1">
                <h2 className="text-xl font-black text-transparent bg-clip-text bg-gradient-to-r from-indigo-200 to-purple-200 uppercase tracking-widest">
                  Sesi Tidur Aktif
                </h2>
                <p className="text-xs text-indigo-300/70 font-medium px-4">
                  Dasbor dinonaktifkan sementara agar pikiran Anda beristirahat. Selamat tidur nyenyak!
                </p>
              </div>

              {/* Ticking elapsed timer */}
              <div className="py-4 bg-slate-950/40 rounded-2xl border border-white/5 shadow-inner">
                <p className="text-xs font-bold text-indigo-400 uppercase tracking-widest mb-1.5">Durasi Tidur Anda</p>
                <p className="text-3xl font-black font-mono tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-amber-200 via-amber-300 to-amber-200 drop-shadow-[0_0_12px_rgba(245,158,11,0.25)]">
                  {elapsedText}
                </p>
              </div>

              <div className="flex flex-col gap-2.5">
                <button
                  onClick={handleWakeUp}
                  className="w-full py-4 rounded-2xl font-black text-xs uppercase tracking-widest text-slate-900 bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 shadow-lg shadow-amber-500/20 transition-all active:scale-[0.98]"
                >
                  Aku Sudah Bangun ☀️
                </button>

                <button
                  onClick={() => {
                    try { playMechanicalClick(); } catch (e) {}
                    toggleSleep();
                  }}
                  className="w-full py-2.5 rounded-2xl font-bold text-xs uppercase tracking-widest text-slate-400 hover:text-red-400 transition-colors border border-dashed border-white/10 hover:border-red-500/30"
                >
                  Batalkan ❌
                </button>
              </div>
            </div>
          ) : (
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-6 relative z-10 py-4"
            >
              <div className="w-20 h-20 mx-auto rounded-full bg-gradient-to-tr from-amber-400 to-orange-500 flex items-center justify-center border border-amber-300/30 shadow-[0_0_30px_rgba(245,158,11,0.3)]">
                <Sunrise className="w-10 h-10 text-white" />
              </div>

              <div className="space-y-1">
                <span className="text-[10px] font-black uppercase tracking-widest text-amber-500 block">
                  Selamat Pagi! 🌅
                </span>
                <h2 className="text-xl font-black text-white uppercase tracking-tight">
                  Tidur Anda: {sessionHours} Jam
                </h2>
                <p className="text-xs text-slate-400 px-4">
                  Bagaimana perasaan atau mood Anda saat bangun pagi ini? Pilih emoji di bawah:
                </p>
              </div>

              {/* Mood emojis list */}
              <div className="grid grid-cols-5 gap-2.5 py-2">
                {[
                  { emoji: '😔', val: 1, label: 'Lemas' },
                  { emoji: '😕', val: 2, label: 'Lelah' },
                  { emoji: '😐', val: 3, label: 'Biasa' },
                  { emoji: '🙂', val: 4, label: 'Segar' },
                  { emoji: '😄', val: 5, label: 'Sangat Bugar' }
                ].map((m) => (
                  <button
                    key={m.val}
                    onClick={() => handleMoodSelect(m.val)}
                    className="flex flex-col items-center p-2.5 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 hover:border-amber-500/30 hover:scale-105 active:scale-95 transition-all group"
                  >
                    <span className="text-3xl mb-1.5 transition-transform group-hover:scale-110">{m.emoji}</span>
                    <span className="text-[9px] font-bold text-slate-400 group-hover:text-amber-400">{m.label}</span>
                  </button>
                ))}
              </div>

              <div className="text-[10px] font-black text-slate-500 uppercase tracking-widest">
                💡 Mood pagi menentukan produktivitas seharian
              </div>
            </motion.div>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
