'use client';

import { useState, useEffect, useRef } from 'react';
import { usePathname, useRouter } from 'next/navigation';
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
  const router = useRouter();
  const { 
    hasCompletedTutorial, setHasCompletedTutorial, 
    user, customCategories = [],
    tutorialSlide, setTutorialSlide
  } = useAppStore();
  // Use persisted tutorialSlide from store so it survives page navigation remounts
  const currentSlide = tutorialSlide;
  const setCurrentSlide = setTutorialSlide;
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
      description: "Halo! Selamat bergabung di Life OS — platform gamifikasi disiplin diri terbaik! 🎖️\n\nKami akan memandu kamu langkah demi langkah selama ±1 menit untuk:\n• Membuat sub-menu kebiasaan pertamamu\n• Memasang pelacak ibadah & kesehatan\n• Melihat posisimu di Liga Pejuang\n\nYuk mulai petualangan disiplinmu!",
      icon: Compass,
      colorClass: "text-indigo-400",
      glowClass: "shadow-[0_0_30px_rgba(99,102,241,0.3)]",
      bgGradient: "from-indigo-500/10 via-transparent to-transparent",
      position: 'center',
      requiresUserAction: false
    },
    {
      step: 2,
      title: "1. Buka Halaman Kebiasaan 📅",
      subtitle: "👆 Klik menu 'Kebiasaan' di sidebar kiri",
      description: "Di sinilah kamu akan mencatat & melacak semua kebiasaan harianmu!\n\nHalaman Kebiasaan adalah 'markas besar' disiplinmu. Di sini kamu bisa:\n• Mencentang habit yang sudah selesai\n• Melihat progress sub-menu (Sholat, Kesehatan, dll)\n• Mengumpulkan XP setiap kali menyelesaikan kebiasaan\n\n👆 Sekarang, klik menu 'Kebiasaan' yang disorot di sidebar!",
      icon: Flame,
      colorClass: "text-orange-400",
      glowClass: "shadow-[0_0_30px_rgba(249,115,22,0.3)]",
      bgGradient: "from-orange-500/10 via-transparent to-transparent",
      targetId: "tour-nav-habits",
      position: 'right',
      requiresUserAction: true
    },
    {
      step: 3,
      title: "2. Buka Menu Pengelola Kebiasaan ➕",
      subtitle: "👆 Klik tombol '+' di pojok kanan atas",
      description: "Halaman Kebiasaan masih kosong karena belum ada sub-menu yang dibuat.\n\nSub-menu adalah kategori pengelompokan kebiasaan, misalnya:\n• 🕌 Sholat & Ibadah — untuk melacak sholat 5 waktu\n• 💪 Kesehatan & Diet — untuk melacak air & makan sehat\n• 🌅 Rutinitas Pagi — untuk kebiasaan pagi harimu\n\n👆 Klik tombol '+' yang disorot (atau tombol 'Pasang Tab Menu Sekarang') untuk membuka menu pengelola!",
      icon: Zap,
      colorClass: "text-amber-400",
      glowClass: "shadow-[0_0_30px_rgba(245,158,11,0.3)]",
      bgGradient: "from-amber-500/10 via-transparent to-transparent",
      targetId: "tour-add-category",
      position: 'bottom',
      requiresUserAction: true
    },
    {
      step: 4,
      title: "3. Pasang Sub-Menu Sholat & Ibadah 🕌",
      subtitle: "👆 Klik tombol '+ Pasang' di template Sholat",
      description: "Kamu sudah membuka menu pengelola. Bagus! 🎉\n\nSekarang kamu bisa melihat Template Sub-Menu Rekomendasi. Template ini adalah preset siap pakai yang sudah dilengkapi dengan habit-habit populer di dalamnya.\n\nTemplate 'Sholat & Ibadah' akan otomatis membuat:\n• ✅ Sholat Subuh, Dzuhur, Ashar, Maghrib, Isya\n• ✅ Pelacak sholat sunnah & dzikir\n• ✅ Setiap sholat = +15 XP untuk karaktermu!\n\n👆 Klik tombol '+ Pasang' di baris template Sholat & Ibadah!",
      icon: Target,
      colorClass: "text-indigo-400",
      glowClass: "shadow-[0_0_30px_rgba(99,102,241,0.3)]",
      bgGradient: "from-indigo-500/10 via-transparent to-transparent",
      targetId: "tour-apply-prayer",
      position: 'right',
      requiresUserAction: true
    },
    {
      step: 5,
      title: "4. Pasang Sub-Menu Kesehatan & Diet 🍎",
      subtitle: "👆 Klik tombol '+ Pasang' di template Kesehatan",
      description: "Mantap! Sub-menu Sholat berhasil dipasang! 💪\n\nSekarang saatnya memasang template kedua. Template 'Kesehatan & Diet' akan otomatis menambahkan:\n• 💧 Pelacak Minum Air — target 8 gelas/hari (+20 XP)\n• 🍽️ Pelacak Makan Bernutrisi — target 4 porsi/hari (+20 XP)\n• 🏃 Pelacak Olahraga & Langkah Kaki\n\nKedua pelacak ini akan tampil sebagai widget visual interaktif di bagian atas halaman Kebiasaanmu!\n\n👆 Sekarang klik tombol '+ Pasang' di baris Kesehatan & Diet!",
      icon: Star,
      colorClass: "text-emerald-400",
      glowClass: "shadow-[0_0_30px_rgba(16,185,129,0.3)]",
      bgGradient: "from-emerald-500/10 via-transparent to-transparent",
      targetId: "tour-apply-health",
      position: 'right',
      requiresUserAction: true
    },
    {
      step: 6,
      title: "5. Tutup Menu Pengelola ✅",
      subtitle: "👆 Klik tombol 'X' di pojok kanan atas modal",
      description: "Luar biasa! Semua template sudah berhasil dipasang! 🎊\n\nSub-menu Sholat & Ibadah dan Kesehatan & Diet kini sudah aktif di halaman Kebiasaanmu. Kamu juga bisa menambah sub-menu kustom sendiri kapan saja melalui tombol '+' yang sama.\n\nSelanjutnya kita akan melihat posisi peringkatmu di Liga Pejuang bersama semua pengguna lain!\n\n👆 Klik tombol 'X' (silang) di pojok kanan atas modal ini untuk menutup menu pengelola!",
      icon: X,
      colorClass: "text-red-400",
      glowClass: "shadow-[0_0_30px_rgba(239,68,68,0.3)]",
      bgGradient: "from-red-500/10 via-transparent to-transparent",
      targetId: "tour-close-modal",
      position: 'left',
      requiresUserAction: true
    },
    {
      step: 7,
      title: "6. Intip Liga Pejuang 🏆",
      subtitle: "👆 Klik menu 'Leaderboard' di sidebar kiri",
      description: "Selamat! Halaman Kebiasaanmu sudah lengkap dan siap digunakan! 🥳\n\nSekarang waktunya melihat Liga Pejuang — papan peringkat global semua pengguna Life OS! Di sana kamu bisa:\n• 🥇 Melihat posisi peringkatmu saat ini\n• 👥 Melihat siapa yang ada di atas dan bawahmu\n• ⚔️ Menantang pengguna lain untuk duel fokus\n• 🏆 Naik liga dari Bronze → Silver → Gold → Diamond\n\nSemakin banyak kebiasaan yang kamu selesaikan, semakin tinggi peringkatmu!\n\n👆 Klik menu 'Leaderboard' yang disorot di sidebar kiri!",
      icon: Trophy,
      colorClass: "text-yellow-400",
      glowClass: "shadow-[0_0_30px_rgba(234,179,8,0.3)]",
      bgGradient: "from-yellow-500/10 via-transparent to-transparent",
      targetId: "tour-nav-leaderboard",
      position: 'right',
      requiresUserAction: true
    },
    {
      step: 8,
      title: "Petualangan Disiplin Dimulai! 🔥",
      subtitle: "Selamat — Kamu Resmi Menjadi Pejuang!",
      description: "LUAR BIASA! Kamu telah menyelesaikan semua langkah panduan dengan sempurna! 🎖️\n\nSebagai pengingat, berikut cara menggunakan Life OS setiap harinya:\n• 📅 Buka halaman Kebiasaan — centang semua habit harian (+XP)\n• 💧 Update minum air & makan sehat di widget Kesehatan\n• 🏆 Cek Leaderboard untuk memantau posisi liga-mu\n• 🎯 Selesaikan Misi Harian untuk bonus XP ekstra\n\nSelamat berjuang dan sampai jumpa di puncak Liga Diamond! 💎",
      icon: Shield,
      colorClass: "text-emerald-400",
      glowClass: "shadow-[0_0_30px_rgba(16,185,129,0.3)]",
      bgGradient: "from-emerald-500/10 via-transparent to-transparent",
      position: 'center',
      requiresUserAction: false
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

      // Auto-complete safeguard: If we reach the final slide (index 7) AND we're past the leaderboard,
      // mark tutorial complete automatically after a brief display moment to prevent any looping
      if (nextSlide === 7 && currentSlide === 7) {
        // Tutorial is already showing final slide — do nothing, wait for user to click Selesai
        // But if somehow the component re-mounts with slide 7 and tutorial not complete, mark it done
        return;
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

  const handleAutoPerform = () => {
    if (currentSlide === 1) {
      // Step 2 -> Navigate to habits page
      router.push('/habits');
    } else if (currentSlide === 2) {
      // Step 3 -> Open custom category template modal
      const btn = document.getElementById('tour-add-category') || document.getElementById('tour-add-category-banner');
      if (btn) btn.click();
    } else if (currentSlide === 3) {
      // Step 4 -> Pasang Prayer preset
      const btn = document.getElementById('tour-apply-prayer');
      if (btn) btn.click();
    } else if (currentSlide === 4) {
      // Step 5 -> Pasang Health preset
      const btn = document.getElementById('tour-apply-health');
      if (btn) btn.click();
    } else if (currentSlide === 5) {
      // Step 6 -> Close modal
      const btn = document.getElementById('tour-close-modal');
      if (btn) btn.click();
    } else if (currentSlide === 6) {
      // Step 7 -> Navigate to Leaderboard
      router.push('/achievements');
    }
  };

  const handleNext = () => {
    if (currentSlide < slides.length - 1) {
      setCurrentSlide(currentSlide + 1);
    } else {
      setHasCompletedTutorial(true);
    }
  };

  const handleSkip = () => {
    setHasCompletedTutorial(true);
  };

  // Clamp to valid range in case persisted slide index is out of bounds
  const clampedSlide = Math.max(0, Math.min(currentSlide, slides.length - 1));
  const activeSlide = slides[clampedSlide];
  const ActiveIcon = activeSlide.icon;

  // Compute bubble coordinates based on active target rect
  const getBubbleStyle = (): React.CSSProperties => {
    const isMobile = typeof window !== 'undefined' && window.innerWidth < 640;

    // On mobile: always anchor to bottom of screen as a bottom sheet
    // Use left+right instead of left:50%+transform to avoid Framer Motion transform conflict
    if (isMobile) {
      return {
        position: 'fixed',
        left: '12px',
        right: '12px',
        top: '25%', // Position in the middle-upper screen to completely clear the bottom navigation bar
        zIndex: 9999,
      };
    }

    // Desktop: position relative to highlighted element
    if (!targetRect) {
      return {
        position: 'fixed',
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

    // Prefer positioning to the right if there's enough room
    const bubbleWidth = 380;
    const spaceRight = window.innerWidth - targetRect.right - gap;
    const spaceLeft = targetRect.left - gap;

    if (activeSlide.position === 'right' && spaceRight >= bubbleWidth) {
      style.left = `${targetRect.right + gap}px`;
      const topVal = targetRect.top + (targetRect.height / 2) - 180;
      style.top = `${Math.max(16, Math.min(window.innerHeight - 400, topVal))}px`;
    } else if (activeSlide.position === 'left' && spaceLeft >= bubbleWidth) {
      style.right = `${window.innerWidth - targetRect.left + gap}px`;
      const topVal = targetRect.top + (targetRect.height / 2) - 180;
      style.top = `${Math.max(16, Math.min(window.innerHeight - 400, topVal))}px`;
    } else if (activeSlide.position === 'bottom') {
      const leftVal = targetRect.left + (targetRect.width / 2) - (bubbleWidth / 2);
      style.left = `${Math.max(16, Math.min(window.innerWidth - bubbleWidth - 16, leftVal))}px`;
      style.top = `${Math.min(targetRect.bottom + gap, window.innerHeight - 420)}px`;
    } else if (activeSlide.position === 'right' && spaceRight < bubbleWidth) {
      // Not enough room right — fall back to center
      style.left = '50%';
      style.top = '50%';
      style.transform = 'translate(-50%, -50%)';
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
      {/* Overlay backdrop layer — overflow hidden to clip edges */}
      <div className="fixed inset-0 z-[9990] pointer-events-none select-none">
        {/* 4-Rectangle Spotlight Overlay to allow pointer clicks to pass through the hollow area */}
        {!cutout ? (
          /* No target found — use a soft non-blocking dim so users can still click nav items */
          <div className="fixed inset-0 bg-black/50 pointer-events-none transition-all duration-300" />
        ) : (
          <>
            {/* Top Overlay */}
            <div 
              className="fixed left-0 top-0 w-screen bg-black/80 pointer-events-auto transition-all duration-300"
              style={{ height: `${Math.max(0, cutout.top)}px` }}
            />
            {/* Bottom Overlay — on mobile, stop above bottom nav (80px) so tabs remain tappable */}
            <div 
              className="fixed left-0 w-screen bg-black/80 pointer-events-auto transition-all duration-300"
              style={{ 
                top: `${cutout.bottom}px`,
                height: typeof window !== 'undefined' && window.innerWidth < 640
                  ? `calc(100vh - ${cutout.bottom}px - 80px)`
                  : `calc(100vh - ${cutout.bottom}px)`
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
      </div>

      {/* Tooltip Bubble — rendered OUTSIDE the overflow container to avoid clipping */}
      <motion.div
        key={currentSlide}
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        transition={{ duration: 0.25, ease: 'easeOut' }}
        style={getBubbleStyle()}
        className="bg-[#0b0b0e] border border-amber-500/20 rounded-2xl sm:rounded-3xl px-4 py-4 sm:p-6 overflow-hidden flex flex-col items-center text-center pointer-events-auto shadow-2xl"
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
        <span className="text-[9px] font-black tracking-widest text-amber-500 bg-amber-500/10 px-2.5 py-0.5 rounded-full border border-amber-500/20 uppercase mb-3 sm:mb-4 z-10">
          Langkah {currentSlide + 1} dari {slides.length}
        </span>

        {/* Icon Circle — hidden on mobile to save space */}
        <div className="relative mb-2 sm:mb-4 z-10 hidden sm:block">
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
        <div className="flex flex-col items-center z-10 w-full mb-2 sm:mb-3">
          <h2 className="text-sm sm:text-base font-extrabold text-white tracking-tight leading-snug mb-1">
            {activeSlide.title}
          </h2>
          <h3 className={`text-[9px] sm:text-[10px] font-black uppercase tracking-wider mb-2 ${activeSlide.colorClass}`}>
            {activeSlide.subtitle}
          </h3>
          <div className="text-[11px] sm:text-[11.5px] leading-relaxed text-neutral-400 font-medium px-1 text-left space-y-1 max-h-32 sm:max-h-52 overflow-y-auto w-full">
            {activeSlide.description.split('\n').map((line, i) => (
              line.trim() === '' ? <div key={i} className="h-1" /> :
              <p key={i} className={line.startsWith('•') ? 'pl-1' : ''}>{line}</p>
            ))}
          </div>
          {activeSlide.requiresUserAction && (
            <span className="mt-2 sm:mt-3.5 inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[9px] font-black tracking-wider text-amber-400 bg-amber-500/10 border border-amber-500/20 uppercase animate-bounce">
              👉 Lakukan Aksi Ini Sekarang!
            </span>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-between w-full gap-3 mt-1 sm:mt-2 z-10">
          {activeSlide.requiresUserAction ? (
            <>
              <button
                onClick={handleSkip}
                className="px-3 py-2 sm:px-4 rounded-xl text-neutral-500 hover:text-neutral-300 font-bold text-[10px] tracking-wider uppercase border border-transparent hover:bg-white/5 transition-all"
              >
                Lewati
              </button>

              <button
                onClick={handleAutoPerform}
                className="flex items-center gap-1 px-4 py-2 sm:px-5 rounded-xl font-bold text-[10px] tracking-wider uppercase bg-amber-500 hover:bg-amber-600 text-white shadow-lg shadow-amber-500/20 active:scale-95 transition-all border border-amber-500/20 animate-pulse"
              >
                Bantu Lakukan ⚡
              </button>
            </>
          ) : (
            <>
              <button
                onClick={handleSkip}
                className="px-3 py-2 sm:px-4 rounded-xl text-neutral-500 hover:text-neutral-300 font-bold text-[10px] tracking-wider uppercase border border-transparent hover:bg-white/5 transition-all"
              >
                Lewati
              </button>

              <button
                onClick={handleNext}
                className="flex items-center gap-1.5 px-4 py-2.5 sm:px-5 rounded-xl font-bold text-[10px] tracking-wider uppercase bg-amber-500 hover:bg-amber-600 text-white shadow-lg shadow-amber-500/20 active:scale-95 transition-all border border-amber-500/20"
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
    </AnimatePresence>
  );
}

