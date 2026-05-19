'use client';

import { useState, useEffect, useRef } from 'react';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { useAppStore } from '@/store/useAppStore';
import { 
  Trophy, Sparkles, Award, Star, Zap, Target, Timer, 
  Flame, Shield, ArrowRight, X, Compass, CheckCircle2, ChevronRight, Play
} from 'lucide-react';
import React from 'react';

interface Slide {
  step: number;
  title: string;
  subtitle: string;
  description: string;
  icon: any;
  colorClass: string;
  glowClass: string;
  bgGradient: string;
  targetId?: string; // ID of target DOM element to highlight
  position?: 'top' | 'bottom' | 'left' | 'right' | 'center';
  requiresUserAction: boolean; // If true, hide "Next" button and wait for actual user interaction
}

export const OnboardingTutorial = () => {
  const pathname = usePathname();
  const { hasCompletedTutorial, setHasCompletedTutorial, user, customCategories = [] } = useAppStore();
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
      step: 1,
      title: "Selamat Datang Pejuang! 🚀",
      subtitle: "Bimbingan Interaktif Life OS",
      description: "Mari luangkan waktu 1 menit untuk mempelajari cara menggunakan Life OS. Kami akan menuntunmu secara langsung untuk memasang tab menu pertama dan melihat liga pejuang harian harianmu!",
      icon: Compass,
      colorClass: "text-indigo-400",
      glowClass: "shadow-[0_0_30px_rgba(99,102,241,0.3)]",
      bgGradient: "from-indigo-500/10 via-transparent to-transparent",
      position: 'center',
      requiresUserAction: false // User clicks button to proceed
    },
    {
      step: 2,
      title: "1. Buka Halaman Kebiasaan 📅",
      subtitle: "Silakan Klik Menu 'Kebiasaan'",
      description: "Disiplin dimulai dari kebiasaan harian. Klik menu 'Kebiasaan' di sidebar sebelah kiri sekarang untuk beralih ke halaman pengelolaan habit harianmu!",
      icon: Flame,
      colorClass: "text-orange-400",
      glowClass: "shadow-[0_0_30px_rgba(249,115,22,0.3)]",
      bgGradient: "from-orange-500/10 via-transparent to-transparent",
      targetId: "tour-nav-habits",
      position: 'right',
      requiresUserAction: true // Wait for user to navigate to /habits
    },
    {
      step: 3,
      title: "2. Buka Pembuat Kategori ➕",
      subtitle: "Silakan Klik Tombol '+'",
      description: "Tab menu kebiasaanmu masih kosong. Sekarang, silakan klik tombol '+' (atau tombol 'Pasang Tab Menu Sekarang' di tengah banner) untuk membuka pilihan template sub-menu!",
      icon: Zap,
      colorClass: "text-amber-400",
      glowClass: "shadow-[0_0_30px_rgba(245,158,11,0.3)]",
      bgGradient: "from-amber-500/10 via-transparent to-transparent",
      targetId: "tour-add-category",
      position: 'bottom',
      requiresUserAction: true // Wait for modal to open (detecting targetId in next step)
    },
    {
      step: 4,
      title: "3. Pasang Menu Sholat & Ibadah 🕌",
      subtitle: "Silakan Klik '+ Pasang'",
      description: "Bagus sekali! Sekarang klik tombol '+ Pasang' pada template 'Sholat & Ibadah' di dalam modal untuk mengaktifkan pelacak ibadah fardhu & sunnahmu!",
      icon: Target,
      colorClass: "text-indigo-400",
      glowClass: "shadow-[0_0_30px_rgba(99,102,241,0.3)]",
      bgGradient: "from-indigo-500/10 via-transparent to-transparent",
      targetId: "tour-apply-prayer",
      position: 'right',
      requiresUserAction: true // Wait for 'prayer' category to exist
    },
    {
      step: 5,
      title: "4. Pasang Menu Kesehatan 🍎",
      subtitle: "Silakan Klik '+ Pasang'",
      description: "Luar biasa! Terakhir, silakan klik '+ Pasang' pada template 'Kesehatan & Diet' untuk mengaktifkan pelacak minum air 8 gelas & porsi makan bernutrisi!",
      icon: Star,
      colorClass: "text-emerald-400",
      glowClass: "shadow-[0_0_30px_rgba(16,185,129,0.3)]",
      bgGradient: "from-emerald-500/10 via-transparent to-transparent",
      targetId: "tour-apply-health",
      position: 'right',
      requiresUserAction: true // Wait for 'health' category to exist
    },
    {
      step: 6,
      title: "5. Tutup Menu Kelola ✖️",
      subtitle: "Silakan Klik Tombol Silang (X)",
      description: "Hebat! Semua sub-menu template rekomendasi sudah aktif di dashboard-mu. Sekarang, silakan klik tombol 'X' di pojok kanan atas modal ini untuk menutup menu kelola!",
      icon: X,
      colorClass: "text-red-400",
      glowClass: "shadow-[0_0_30px_rgba(239,68,68,0.3)]",
      bgGradient: "from-red-500/10 via-transparent to-transparent",
      targetId: "tour-close-modal",
      position: 'left',
      requiresUserAction: true // Wait for modal to be closed
    },
    {
      step: 7,
      title: "6. Intip Liga Pejuang 🏆",
      subtitle: "Silakan Klik Menu 'Leaderboard'",
      description: "Tab menu kebiasaan & pelacak kesehatanmu sudah aktif dan siap digunakan! Sekarang silakan klik menu 'Leaderboard' di sidebar kiri untuk melihat peringkat persainganmu!",
      icon: Trophy,
      colorClass: "text-yellow-400",
      glowClass: "shadow-[0_0_30px_rgba(234,179,8,0.3)]",
      bgGradient: "from-yellow-500/10 via-transparent to-transparent",
      targetId: "tour-nav-leaderboard",
      position: 'right',
      requiresUserAction: true // Wait for user to navigate to /achievements
    },
    {
      step: 8,
      title: "Petualangan Disiplin Dimulai! 🔥",
      subtitle: "Selamat, Kamu Siap Bertarung!",
      description: "Hebat! Kamu telah menguasai dasar-dasar navigasi LIFE OS. Sekarang, selesaikan kebiasaan harianmu, kumpulkan XP, naikkan level karakter, dan kalahkan prokrastinasi untuk memanjat peringkat Liga Diamond! Sampai jumpa di puncak klasemen!",
      icon: Shield,
      colorClass: "text-emerald-400",
      glowClass: "shadow-[0_0_30px_rgba(16,185,129,0.3)]",
      bgGradient: "from-emerald-500/10 via-transparent to-transparent",
      position: 'center',
      requiresUserAction: false // User clicks finish button
    }
  ];

  // Track the bounding rectangle of current target element and evaluate state transitions continuously
  useEffect(() => {
    if (!user || hasCompletedTutorial) return;

    const runStateMachineAndPosition = () => {
      let nextSlide = currentSlide;

      // Step 2 -> Step 3 trigger: User successfully navigates to '/habits'
      if (nextSlide === 1 && pathname === '/habits') {
        nextSlide = 2;
      }

      // Step 3 -> Step 4 trigger: Detect if template modal is open (checks if tour-apply-prayer exists in DOM)
      if (nextSlide === 2) {
        const modalOpen = document.getElementById('tour-apply-prayer') || document.getElementById('tour-apply-health') || document.getElementById('tour-close-modal');
        if (modalOpen) {
          nextSlide = 3;
        }
      }

      // Safeguard: If the user closed the modal during template setup (Step 4 or Step 5) without having installed the respective category,
      // revert back to Step 3 so they can click the "+" button again.
      if (nextSlide === 3 || nextSlide === 4) {
        const modalOpen = document.getElementById('tour-apply-prayer') || document.getElementById('tour-apply-health');
        const prayerExists = customCategories.some(c => c.id === 'prayer');
        const healthExists = customCategories.some(c => c.id === 'health');
        
        if (!modalOpen) {
          if (nextSlide === 3 && !prayerExists) {
            nextSlide = 2;
          } else if (nextSlide === 4 && !healthExists) {
            nextSlide = 2;
          }
        }
      }

      // Step 4 -> Step 5 trigger: Detect if 'prayer' category was successfully installed
      if (nextSlide === 3) {
        const prayerExists = customCategories.some(c => c.id === 'prayer');
        if (prayerExists) {
          // If the user already has both, skip straight to close modal step!
          const healthExists = customCategories.some(c => c.id === 'health');
          if (healthExists) {
            nextSlide = 5;
          } else {
            nextSlide = 4;
          }
        }
      }

      // Step 5 -> Step 6 trigger: Detect if 'health' category was successfully installed
      if (nextSlide === 4) {
        const healthExists = customCategories.some(c => c.id === 'health');
        if (healthExists) {
          nextSlide = 5;
        }
      }

      // Step 6 -> Step 7 trigger: Wait for the modal to be closed
      if (nextSlide === 5) {
        const modalOpen = document.getElementById('tour-close-modal');
        const prayerExists = customCategories.some(c => c.id === 'prayer');
        const healthExists = customCategories.some(c => c.id === 'health');

        // Once the close button is no longer in DOM and categories exist, proceed to sidebar navigation step!
        if (!modalOpen && prayerExists && healthExists) {
          nextSlide = 6;
        }
      }

      // Step 7 -> Step 8 trigger: User successfully navigates to '/achievements' (Leaderboard)
      if (nextSlide === 6 && pathname === '/achievements') {
        nextSlide = 7;
      }

      // If slide state changed, apply update and let the next loop run compute target coordinates
      if (nextSlide !== currentSlide) {
        setCurrentSlide(nextSlide);
        return;
      }

      // 2. POSITION UPDATE
      const activeSlide = slides[currentSlide];
      if (activeSlide && activeSlide.targetId) {
        let el = document.getElementById(activeSlide.targetId);
        // Dynamic target selection for step 3: prefer empty categories banner if present
        if (activeSlide.targetId === 'tour-add-category') {
          const bannerEl = document.getElementById('tour-add-category-banner');
          if (bannerEl) el = bannerEl;
        }
        if (el) {
          const rect = el.getBoundingClientRect();
          setTargetRect(rect);
          return;
        }
      }
      setTargetRect(null);
    };

    runStateMachineAndPosition();
    tourIntervalRef.current = setInterval(runStateMachineAndPosition, 300);

    return () => {
      if (tourIntervalRef.current) clearInterval(tourIntervalRef.current);
    };
  }, [pathname, currentSlide, customCategories, user, hasCompletedTutorial, windowSize]);

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

    if (activeSlide.position === 'right') {
      style.left = `${targetRect.right + gap}px`;
      style.top = `${targetRect.top + (targetRect.height / 2) - 150}px`;
      if (typeof window !== 'undefined') {
        const topVal = targetRect.top + (targetRect.height / 2) - 150;
        style.top = `${Math.max(16, Math.min(window.innerHeight - 340, topVal))}px`;
      }
    } else if (activeSlide.position === 'bottom') {
      style.left = `${targetRect.left + (targetRect.width / 2) - 190}px`;
      style.top = `${targetRect.bottom + gap}px`;
      if (typeof window !== 'undefined') {
        const leftVal = targetRect.left + (targetRect.width / 2) - 190;
        style.left = `${Math.max(16, Math.min(window.innerWidth - 400, leftVal))}px`;
      }
    } else {
      style.left = '50%';
      style.top = '50%';
      style.transform = 'translate(-50%, -50%)';
    }

    return style;
  };

  const padding = 6;
  const cutout = targetRect ? {
    left: targetRect.left - padding,
    top: targetRect.top - padding,
    right: targetRect.right + padding,
    bottom: targetRect.bottom + padding,
    width: targetRect.width + (padding * 2),
    height: targetRect.height + (padding * 2),
  } : null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[9990] overflow-hidden pointer-events-none select-none">
        {/* 4-Rectangle Spotlight Overlay to allow pointer clicks to pass through the hollow area */}
        {!cutout ? (
          <div className="fixed inset-0 bg-black/80 pointer-events-auto transition-all duration-300" />
        ) : (
          <>
            {/* Top Overlay */}
            <div 
              className="fixed left-0 top-0 w-screen bg-black/80 pointer-events-auto transition-all duration-300"
              style={{ height: `${Math.max(0, cutout.top)}px` }}
            />
            {/* Bottom Overlay */}
            <div 
              className="fixed left-0 w-screen bg-black/80 pointer-events-auto transition-all duration-300"
              style={{ 
                top: `${cutout.bottom}px`,
                height: `calc(100vh - ${cutout.bottom}px)`
              }}
            />
            {/* Left Overlay */}
            <div 
              className="fixed left-0 bg-black/80 pointer-events-auto transition-all duration-300"
              style={{ 
                top: `${cutout.top}px`,
                width: `${Math.max(0, cutout.left)}px`,
                height: `${cutout.height}px`
              }}
            />
            {/* Right Overlay */}
            <div 
              className="fixed bg-black/80 pointer-events-auto transition-all duration-300"
              style={{ 
                left: `${cutout.right}px`,
                top: `${cutout.top}px`,
                width: `calc(100vw - ${cutout.right}px)`,
                height: `${cutout.height}px`
              }}
            />
          </>
        )}

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
            className="absolute border-2 border-amber-500 rounded-2xl pointer-events-none z-[9991]"
            style={{
              boxShadow: '0 0 25px rgba(245, 158, 11, 0.5), inset 0 0 10px rgba(245, 158, 11, 0.3)'
            }}
          >
            {/* Soft breathing halo glow */}
            <span className="absolute -inset-2 rounded-2xl border border-amber-500/30 animate-pulse" />
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
          className="bg-[#0b0b0e] border border-amber-500/20 rounded-3xl p-6 overflow-hidden flex flex-col items-center text-center pointer-events-auto shadow-2xl"
        >
          {/* Radial Ambient Glow */}
          <div className={`absolute top-0 inset-x-0 h-32 bg-gradient-to-b ${activeSlide.bgGradient} pointer-events-none transition-all duration-500`} />

          {/* Skip Button (only visible on step 1 or end step) */}
          {!activeSlide.requiresUserAction && (
            <button 
              onClick={handleSkip}
              className="absolute top-4 right-4 w-7 h-7 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 flex items-center justify-center text-neutral-400 hover:text-white transition-all z-10"
              title="Lewati Tutorial"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}

          {/* Header Step Counter */}
          <span className="text-[9px] font-black tracking-widest text-amber-500 bg-amber-500/10 px-2.5 py-0.5 rounded-full border border-amber-500/20 uppercase mb-4 z-10">
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
                <ActiveIcon className="w-7 h-7 animate-pulse" />
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
            <p className="text-[11.5px] leading-relaxed text-neutral-350 font-medium px-1 text-center">
              {activeSlide.description}
            </p>
            {activeSlide.requiresUserAction && (
              <span className="mt-3.5 inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[9px] font-black tracking-wider text-amber-400 bg-amber-500/10 border border-amber-500/20 uppercase animate-bounce">
                👉 Lakukan Aksi Ini Sekarang!
              </span>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-between w-full gap-3 mt-2 z-10">
            {activeSlide.requiresUserAction ? (
              <>
                <button
                  onClick={handleSkip}
                  className="px-4 py-2 rounded-xl text-neutral-500 hover:text-neutral-300 font-bold text-[10px] tracking-wider uppercase transition-all"
                >
                  Lewati Panduan
                </button>
                <span className="text-[10px] font-black text-amber-500/70 italic uppercase tracking-wide">Menunggu Aksimu...</span>
              </>
            ) : (
              <>
                <button
                  onClick={handleSkip}
                  className="px-4 py-2 rounded-xl text-neutral-500 hover:text-neutral-300 font-bold text-[10px] tracking-wider uppercase border border-transparent hover:bg-white/5 transition-all"
                >
                  Lewati
                </button>

                <button
                  onClick={handleNext}
                  className="flex items-center gap-1.5 px-5 py-2.5 rounded-xl font-bold text-[10px] tracking-wider uppercase bg-amber-500 hover:bg-amber-600 text-white shadow-lg shadow-amber-500/20 active:scale-95 transition-all border border-amber-500/20"
                >
                  {currentSlide === slides.length - 1 ? (
                    <>
                      Mulai Bertarung! 🔥
                      <Play className="w-3 h-3 fill-current" />
                    </>
                  ) : (
                    <>
                      Mulai Bimbingan
                      <ChevronRight className="w-3.5 h-3.5" />
                    </>
                  )}
                </button>
              </>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
