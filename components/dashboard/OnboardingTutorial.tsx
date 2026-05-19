'use client';

import { useState, useEffect, useRef } from 'react';
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
  targetId?: string; // ID of target DOM element to highlight
  position?: 'top' | 'bottom' | 'left' | 'right' | 'center';
}

export const OnboardingTutorial = () => {
  const { hasCompletedTutorial, setHasCompletedTutorial, user } = useAppStore();
  const [currentSlide, setCurrentSlide] = useState(0);
  const [targetRect, setTargetRect] = useState<DOMRect | null>(null);
  const [windowSize, setWindowSize] = useState({ width: 0, height: 0 });
  const tourIntervalRef = useRef<any>(null);

  // Sync window size on client
  useEffect(() => {
    if (typeof window !== 'undefined') {
      setWindowSize({ width: window.innerWidth, height: window.innerHeight });
      const handleResize = () => setWindowSize({ width: window.innerWidth, height: window.innerHeight });
      window.addEventListener('resize', handleResize);
      return () => window.removeEventListener('resize', handleResize);
    }
  }, []);

  const slides: Slide[] = [
    {
      title: "Selamat Datang Pejuang! 🚀",
      subtitle: "Sistem Operasi Kedisiplinan Life OS",
      description: "Life OS dirancang khusus untuk membantumu mengalahkan prokrastinasi, membangun kebiasaan, dan memperkuat disiplin harian secara menyenangkan layaknya bermain game RPG!",
      icon: Compass,
      colorClass: "text-indigo-400",
      glowClass: "shadow-[0_0_30px_rgba(99,102,241,0.3)]",
      bgGradient: "from-indigo-500/10 via-transparent to-transparent",
      position: 'center'
    },
    {
      title: "Pusat Kebiasaanmu 📅",
      subtitle: "Kelola Rutinitas & Jaga Streak",
      description: "Ini adalah menu 'Kebiasaan'. Klik menu ini untuk merencanakan rutinitas harianmu. Setiap habit yang sukses diselesaikan akan memberikan XP melimpah untuk menaikkan peringkatmu!",
      icon: Flame,
      colorClass: "text-orange-400",
      glowClass: "shadow-[0_0_30px_rgba(249,115,22,0.3)]",
      bgGradient: "from-orange-500/10 via-transparent to-transparent",
      targetId: "tour-nav-habits",
      position: 'right'
    },
    {
      title: "Pasang Template Kebiasaan ➕",
      subtitle: "Mulai Cepat dengan Satu Klik",
      description: "Gunakan tombol '+' di sini untuk langsung memasang template siap pakai seperti 'Sholat & Ibadah', 'Kesehatan', atau membuat kategori khusus rancanganmu sendiri!",
      icon: Zap,
      colorClass: "text-amber-400",
      glowClass: "shadow-[0_0_30px_rgba(245,158,11,0.3)]",
      bgGradient: "from-amber-500/10 via-transparent to-transparent",
      targetId: "tour-add-category",
      position: 'bottom'
    },
    {
      title: "Panjat Klasemen Liga 🏆",
      subtitle: "Bersainglah dengan Pejuang Lain",
      description: "Kumpulkan XP harian dan masuki 'Leaderboard' liga mingguan. Tunjukkan konsistensimu, bersainglah sehat dengan pejuang lain, dan penuhi profilmu dengan lencana liga!",
      icon: Trophy,
      colorClass: "text-yellow-400",
      glowClass: "shadow-[0_0_30px_rgba(234,179,8,0.3)]",
      bgGradient: "from-yellow-500/10 via-transparent to-transparent",
      targetId: "tour-nav-leaderboard",
      position: 'right'
    },
    {
      title: "Kartu Karakter Pejuangmu 🛡️",
      subtitle: "Pantau Level & Gelar Kehormatan",
      description: "Ini adalah indikator level dan gelar kedisiplinanmu. Kumpulkan XP untuk melaju di peta petualangan (Roadmap) dan klaim gelar barumu mulai dari 'Pemula' hingga 'Gigh'!",
      icon: Shield,
      colorClass: "text-emerald-400",
      glowClass: "shadow-[0_0_30px_rgba(16,185,129,0.3)]",
      bgGradient: "from-emerald-500/10 via-transparent to-transparent",
      targetId: "tour-sidebar-level",
      position: 'right'
    },
    {
      title: "Halaman Profil & Target 🌟",
      subtitle: "Kustomisasi Karakter & Goal",
      description: "Menu 'Profil' menampung pengaturan avatar, biodata, target pribadi (Goals), serta panel 'Developer Tools' untuk intip akun simulasi lain secara rahasia!",
      icon: Star,
      colorClass: "text-cyan-400",
      glowClass: "shadow-[0_0_30px_rgba(34,211,238,0.3)]",
      bgGradient: "from-cyan-500/10 via-transparent to-transparent",
      targetId: "tour-nav-profile",
      position: 'right'
    }
  ];

  // Track the bounding rectangle of current target element
  useEffect(() => {
    if (!user || hasCompletedTutorial) return;

    const updateTargetPosition = () => {
      const activeSlide = slides[currentSlide];
      if (activeSlide && activeSlide.targetId) {
        const el = document.getElementById(activeSlide.targetId);
        if (el) {
          // Scroll slightly to target if needed to make it visible
          el.scrollIntoView({ behavior: 'smooth', block: 'center' });
          const rect = el.getBoundingClientRect();
          setTargetRect(rect);
          return;
        }
      }
      setTargetRect(null);
    };

    // Update position instantly
    updateTargetPosition();

    // Set interval to sync positioning (to handle lazy loads/scrolls/animations)
    tourIntervalRef.current = setInterval(updateTargetPosition, 500);

    return () => {
      if (tourIntervalRef.current) clearInterval(tourIntervalRef.current);
    };
  }, [currentSlide, hasCompletedTutorial, user, windowSize]);

  // Only show tutorial if user is logged in AND has not completed tutorial
  if (!user || hasCompletedTutorial) return null;

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

  const activeSlide = slides[currentSlide];
  const ActiveIcon = activeSlide.icon;

  // Compute bubble coordinates based on active target rect
  const getBubbleStyle = () => {
    if (!targetRect) {
      // Fallback to center screen popup
      return {
        position: 'fixed' as const,
        left: '50%',
        top: '50%',
        transform: 'translate(-50%, -50%)',
        zIndex: 9999,
        maxWidth: '420px',
        width: 'calc(100% - 32px)',
      };
    }

    const gap = 16;
    const style: React.CSSProperties = {
      position: 'fixed',
      zIndex: 9999,
      maxWidth: '380px',
      width: 'calc(100% - 32px)',
      boxShadow: '0 20px 50px rgba(0,0,0,0.5)',
    };

    // Place bubble based on desired position
    if (activeSlide.position === 'right') {
      style.left = `${targetRect.right + gap}px`;
      style.top = `${targetRect.top + (targetRect.height / 2) - 150}px`;
      // Boundary check to keep bubble on screen
      if (typeof window !== 'undefined') {
        const topVal = targetRect.top + (targetRect.height / 2) - 150;
        style.top = `${Math.max(16, Math.min(window.innerHeight - 340, topVal))}px`;
      }
    } else if (activeSlide.position === 'bottom') {
      style.left = `${targetRect.left + (targetRect.width / 2) - 190}px`;
      style.top = `${targetRect.bottom + gap}px`;
      // Boundary check to keep bubble on screen
      if (typeof window !== 'undefined') {
        const leftVal = targetRect.left + (targetRect.width / 2) - 190;
        style.left = `${Math.max(16, Math.min(window.innerWidth - 400, leftVal))}px`;
      }
    } else {
      // Default to center if positioning gets weird
      style.left = '50%';
      style.top = '50%';
      style.transform = 'translate(-50%, -50%)';
    }

    return style;
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[9990] overflow-hidden pointer-events-none select-none">
        {/* SVG Spotlight Mask to dark out everything EXCEPT the target element */}
        <svg className="absolute inset-0 w-full h-full pointer-events-auto">
          <defs>
            <mask id="spotlight-mask">
              <rect width="100%" height="100%" fill="white" />
              {targetRect && (
                <rect 
                  x={targetRect.left - 6} 
                  y={targetRect.top - 6} 
                  width={targetRect.width + 12} 
                  height={targetRect.height + 12} 
                  rx="14" 
                  fill="black" 
                />
              )}
            </mask>
          </defs>
          <rect 
            width="100%" 
            height="100%" 
            fill="black" 
            opacity="0.75" 
            mask="url(#spotlight-mask)" 
            className="transition-all duration-300"
          />
        </svg>

        {/* Dynamic Glowing Border highlight around target element */}
        {targetRect && (
          <motion.div 
            initial={{ opacity: 0, scale: 1.1 }}
            animate={{ 
              opacity: 1, 
              scale: 1,
              left: targetRect.left - 8,
              top: targetRect.top - 8,
              width: targetRect.width + 16,
              height: targetRect.height + 16
            }}
            transition={{ type: 'spring', stiffness: 200, damping: 25 }}
            className="absolute border-2 border-indigo-500 rounded-2xl pointer-events-none z-[9991]"
            style={{
              boxShadow: '0 0 20px rgba(99, 102, 241, 0.4), inset 0 0 10px rgba(99, 102, 241, 0.2)'
            }}
          >
            {/* Soft breathing halo glow */}
            <span className="absolute -inset-2 rounded-2xl border border-indigo-500/30 animate-pulse" />
          </motion.div>
        )}

        {/* Floating Tooltip Bubble */}
        <motion.div
          key={currentSlide}
          initial={{ opacity: 0, scale: 0.9, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 15 }}
          transition={{ duration: 0.3, ease: 'easeOut' }}
          style={getBubbleStyle()}
          className="bg-[#0f0f13] border border-white/10 rounded-3xl p-6 overflow-hidden flex flex-col items-center text-center pointer-events-auto shadow-2xl"
        >
          {/* Radial Ambient Glow */}
          <div className={`absolute top-0 inset-x-0 h-32 bg-gradient-to-b ${activeSlide.bgGradient} pointer-events-none transition-all duration-500`} />

          {/* Close Button / Skip */}
          <button 
            onClick={handleSkip}
            className="absolute top-4 right-4 w-7 h-7 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 flex items-center justify-center text-neutral-400 hover:text-white transition-all z-10"
            title="Lewati Tutorial"
          >
            <X className="w-3.5 h-3.5" />
          </button>

          {/* Header Step Counter */}
          <span className="text-[9px] font-black tracking-widest text-indigo-400 bg-indigo-500/10 px-2.5 py-0.5 rounded-full border border-indigo-500/20 uppercase mb-4 z-10">
            Langkah {currentSlide + 1} dari {slides.length}
          </span>

          {/* Icon Circle */}
          <div className="relative mb-4 z-10">
            <div className={`w-14 h-14 rounded-xl bg-neutral-900 border border-white/10 flex items-center justify-center transition-all duration-500 ${activeSlide.glowClass}`}>
              <motion.div
                initial={{ opacity: 0, scale: 0.5 }}
                animate={{ opacity: 1, scale: 1 }}
                className={activeSlide.colorClass}
              >
                <ActiveIcon className="w-7 h-7" />
              </motion.div>
            </div>
          </div>

          {/* Texts content with transition */}
          <div className="min-h-[120px] flex flex-col items-center z-10 w-full mb-3">
            <h2 className="text-base font-extrabold text-white tracking-tight leading-snug mb-1">
              {activeSlide.title}
            </h2>
            <h3 className={`text-[10px] font-black uppercase tracking-wider mb-2 ${activeSlide.colorClass}`}>
              {activeSlide.subtitle}
            </h3>
            <p className="text-[11px] leading-relaxed text-neutral-400 font-medium px-1 text-center">
              {activeSlide.description}
            </p>
          </div>

          {/* Indicator Dots */}
          <div className="flex gap-1.5 my-3 z-10">
            {slides.map((_, idx) => (
              <button
                key={idx}
                onClick={() => setCurrentSlide(idx)}
                className={`h-1.5 rounded-full transition-all duration-300 ${
                  idx === currentSlide 
                    ? 'w-4 bg-indigo-500' 
                    : 'w-1.5 bg-neutral-800 hover:bg-neutral-700'
                }`}
              />
            ))}
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-between w-full gap-3 mt-2 z-10">
            <button
              onClick={handleSkip}
              className="px-4 py-2 rounded-xl text-neutral-500 hover:text-neutral-300 font-bold text-[10px] tracking-wider uppercase border border-transparent hover:bg-white/5 transition-all"
            >
              Lewati
            </button>

            <button
              onClick={handleNext}
              className="flex items-center gap-1.5 px-5 py-2.5 rounded-xl font-bold text-[10px] tracking-wider uppercase bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-600/20 active:scale-95 transition-all border border-indigo-500/20"
            >
              {currentSlide === slides.length - 1 ? (
                <>
                  Mulai Pejuang!
                  <Play className="w-3 h-3 fill-current" />
                </>
              ) : (
                <>
                  Lanjut
                  <ChevronRight className="w-3.5 h-3.5" />
                </>
              )}
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
