'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAppStore } from '@/store/useAppStore';
import { 
  Trophy, Sparkles, Award, Star, Zap, Target, Timer, 
  Flame, Shield, ArrowRight, X, Compass, CheckCircle2, ChevronRight, Play
} from 'lucide-react';
import React from 'react';

interface Slide {
  title: string;
  subtitle: string;
  description: string;
  icon: any;
  colorClass: string;
  glowClass: string;
  bgGradient: string;
}

export const OnboardingTutorial = () => {
  const { hasCompletedTutorial, setHasCompletedTutorial, user } = useAppStore();
  const [currentSlide, setCurrentSlide] = useState(0);

  // Only show tutorial if user is logged in AND has not completed tutorial
  if (!user || hasCompletedTutorial) return null;

  const slides: Slide[] = [
    {
      title: "Selamat Datang di Life OS! 🚀",
      subtitle: "Sistem Operasi Kedisiplinan Pribadi Anda",
      description: "Life OS adalah asisten produktivitas berbasis gamifikasi yang dirancang khusus untuk membantu Anda mengalahkan penundaan (prokrastinasi), membangun kebiasaan positif, dan memperkuat disiplin harian Anda secara terstruktur.",
      icon: Compass,
      colorClass: "text-indigo-400",
      glowClass: "shadow-[0_0_30px_rgba(99,102,241,0.3)]",
      bgGradient: "from-indigo-500/10 via-transparent to-transparent"
    },
    {
      title: "Membangun Kebiasaan 📅",
      subtitle: "Bentuk Rutinitas & Pertahankan Streak",
      description: "Catat kebiasaan harian Anda di tab 'Kebiasaan'. Setiap tugas yang selesai tepat waktu akan memberikan Anda XP. Konsistensi harian akan melipatgandakan multiplier streak Anda demi meraup ekstra XP!",
      icon: Flame,
      colorClass: "text-orange-400",
      glowClass: "shadow-[0_0_30px_rgba(249,115,22,0.3)]",
      bgGradient: "from-orange-500/10 via-transparent to-transparent"
    },
    {
      title: "Fokus Tanpa Batas ⏱️",
      subtitle: "Mode Fokus Mendalam (Pomodoro)",
      description: "Gunakan fitur 'Fokus' untuk mengunci waktu kerja mendalam tanpa gangguan media sosial. Setiap menit fokus produktif yang berhasil diselesaikan akan diubah menjadi XP berharga untuk menaikkan level Anda.",
      icon: Timer,
      colorClass: "text-cyan-400",
      glowClass: "shadow-[0_0_30px_rgba(34,211,238,0.3)]",
      bgGradient: "from-cyan-500/10 via-transparent to-transparent"
    },
    {
      title: "Liga Disiplin Utama 🏆",
      subtitle: "Bersaing Sehat & Raih Peringkat Teratas",
      description: "Kumpulkan XP sebanyak-banyaknya untuk memanjat klasemen liga mingguan (Bronze, Silver, Gold, hingga Diamond). Bersainglah dengan pengguna lain secara sehat, tantang mereka dalam duel fokus harian, dan penuhi lemari piala Anda!",
      icon: Trophy,
      colorClass: "text-yellow-400",
      glowClass: "shadow-[0_0_30px_rgba(234,179,8,0.3)]",
      bgGradient: "from-yellow-500/10 via-transparent to-transparent"
    },
    {
      title: "Siap Jadi Versi Terbaik? 🌟",
      subtitle: "Disiplin Adalah Kunci Kebebasan Sejati",
      description: "Tetapkan Target Kustom (Custom Goals) Anda sendiri di halaman profil, patuhi aturan harian yang berlaku, dan buktikan diri Anda sebagai ksatria disiplin sejati. Waktunya menaklukkan hari ini!",
      icon: Shield,
      colorClass: "text-emerald-400",
      glowClass: "shadow-[0_0_30px_rgba(16,185,129,0.3)]",
      bgGradient: "from-emerald-500/10 via-transparent to-transparent"
    }
  ];

  const handleNext = () => {
    if (currentSlide < slides.length - 1) {
      setCurrentSlide(prev => prev + 1);
    } else {
      setHasCompletedTutorial(true);
    }
  };

  const handleSkip = () => {
    setHasCompletedTutorial(true);
  };

  const ActiveIcon = slides[currentSlide].icon;

  return (
    <AnimatePresence>
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[9999] flex items-center justify-center p-4 backdrop-blur-md bg-black/80 select-none"
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          className="relative max-w-lg w-full bg-[#0d0d10] border border-white/10 rounded-3xl p-8 overflow-hidden shadow-[0_0_50px_rgba(99,102,241,0.15)] flex flex-col items-center text-center"
        >
          {/* Radial Ambient Glow */}
          <div className={`absolute top-0 inset-x-0 h-44 bg-gradient-to-b ${slides[currentSlide].bgGradient} pointer-events-none transition-all duration-500`} />

          {/* Close Button / Skip */}
          <button 
            onClick={handleSkip}
            className="absolute top-5 right-5 w-8 h-8 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 flex items-center justify-center text-neutral-400 hover:text-white transition-all z-10"
            title="Lewati Tutorial"
          >
            <X className="w-4 h-4" />
          </button>

          {/* Header Step Counter */}
          <span className="text-[10px] font-black tracking-widest text-indigo-400 bg-indigo-500/10 px-3 py-1 rounded-full border border-indigo-500/20 uppercase mb-6 z-10">
            Panduan Fitur — Langkah {currentSlide + 1} dari {slides.length}
          </span>

          {/* Icon Circle */}
          <div className="relative mb-6 z-10">
            <div className={`w-20 h-20 rounded-2xl bg-neutral-900 border border-white/10 flex items-center justify-center transition-all duration-500 ${slides[currentSlide].glowClass}`}>
              <AnimatePresence mode="wait">
                <motion.div
                  key={currentSlide}
                  initial={{ opacity: 0, rotate: -30, scale: 0.5 }}
                  animate={{ opacity: 1, rotate: 0, scale: 1 }}
                  exit={{ opacity: 0, rotate: 30, scale: 0.5 }}
                  transition={{ duration: 0.3 }}
                  className={slides[currentSlide].colorClass}
                >
                  <ActiveIcon className="w-10 h-10" />
                </motion.div>
              </AnimatePresence>
            </div>
            {/* Soft pulse decor */}
            <div className="absolute -inset-2 rounded-3xl bg-indigo-500/5 animate-ping -z-10 pointer-events-none" />
          </div>

          {/* Texts content with transition */}
          <div className="min-h-[170px] flex flex-col items-center z-10 w-full">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentSlide}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.25 }}
                className="w-full"
              >
                <h2 className="text-xl font-black text-white tracking-tight leading-snug mb-1">
                  {slides[currentSlide].title}
                </h2>
                <h3 className={`text-xs font-black uppercase tracking-wider mb-4 ${slides[currentSlide].colorClass}`}>
                  {slides[currentSlide].subtitle}
                </h3>
                <p className="text-[11.5px] leading-relaxed text-neutral-400 font-medium px-4">
                  {slides[currentSlide].description}
                </p>
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Indicator Dots */}
          <div className="flex gap-2.5 my-6 z-10">
            {slides.map((_, idx) => (
              <button
                key={idx}
                onClick={() => setCurrentSlide(idx)}
                className={`h-1.5 rounded-full transition-all duration-300 ${
                  idx === currentSlide 
                    ? 'w-6 bg-indigo-500' 
                    : 'w-1.5 bg-neutral-800 hover:bg-neutral-700'
                }`}
              />
            ))}
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-between w-full gap-3 mt-2 z-10">
            <button
              onClick={handleSkip}
              className="px-5 py-2.5 rounded-xl text-neutral-500 hover:text-neutral-300 font-black text-xs tracking-wider uppercase border border-transparent hover:bg-white/5 transition-all"
            >
              Lewati
            </button>

            <button
              onClick={handleNext}
              className="flex items-center gap-2 px-6 py-2.5 rounded-xl font-black text-xs tracking-wider uppercase bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-600/20 active:scale-95 transition-all border border-indigo-500/20"
            >
              {currentSlide === slides.length - 1 ? (
                <>
                  Mulai Pejuang!
                  <Play className="w-3.5 h-3.5 fill-current" />
                </>
              ) : (
                <>
                  Lanjut
                  <ChevronRight className="w-4 h-4" />
                </>
              )}
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};
