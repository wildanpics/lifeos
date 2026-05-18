'use client';

import { useEffect, useState } from 'react';
import { useAppStore } from '@/store/useAppStore';
import { motion, AnimatePresence } from 'framer-motion';
import { Shield, Sparkles, Star, Zap } from 'lucide-react';
import { getLevelFromXP } from '@/lib/constants/levels';

export function LevelUpCelebrationModal() {
  const { levelUpCelebration, setLevelUpCelebration, totalXP } = useAppStore();
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    if (levelUpCelebration !== null) {
      setIsOpen(true);

      // Trigger spectacular double confetti cannons!
      import('canvas-confetti').then((confetti) => {
        const duration = 3 * 1000;
        const animationEnd = Date.now() + duration;
        const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 99999 };

        const randomInRange = (min: number, max: number) => Math.random() * (max - min) + min;

        const interval: NodeJS.Timeout = setInterval(() => {
          const timeLeft = animationEnd - Date.now();

          if (timeLeft <= 0) {
            return clearInterval(interval);
          }

          const particleCount = 50 * (timeLeft / duration);
          // Left and right side cannons
          confetti.default({ ...defaults, particleCount, origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 } });
          confetti.default({ ...defaults, particleCount, origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 } });
        }, 250);
      });
    } else {
      setIsOpen(false);
    }
  }, [levelUpCelebration]);

  if (!isOpen || levelUpCelebration === null) return null;

  const currentLevelInfo = getLevelFromXP(totalXP);

  // Custom RPG rank display based on the level
  const getDisciplineTitle = (lvl: number) => {
    if (lvl <= 1) return 'Pemula Berdedikasi';
    if (lvl === 2) return 'Pejuang Rutinitas';
    if (lvl === 3) return 'Ksatria Kebiasaan';
    if (lvl === 4) return 'Pakar Disiplin';
    return 'Master Produktivitas';
  };

  const handleClose = () => {
    setLevelUpCelebration(null);
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
        {/* Backdrop filter overlay */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={handleClose}
          className="absolute inset-0 bg-black/80 backdrop-blur-md"
        />

        {/* Modal content */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8, y: 50 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.8, y: 50 }}
          transition={{ type: 'spring', damping: 15 }}
          className="relative max-w-md w-full p-8 rounded-3xl text-center overflow-hidden border"
          style={{
            background: 'linear-gradient(185deg, rgba(30, 27, 75, 0.95), rgba(15, 23, 42, 0.98))',
            borderColor: 'rgba(99, 102, 241, 0.4)',
            boxShadow: '0 0 50px rgba(99, 102, 241, 0.25), inset 0 1px 0 rgba(255,255,255,0.1)',
          }}
        >
          {/* Glowing background circles */}
          <div className="absolute -top-12 -left-12 w-48 h-48 rounded-full bg-indigo-500/10 blur-3xl" />
          <div className="absolute -bottom-12 -right-12 w-48 h-48 rounded-full bg-purple-500/10 blur-3xl" />

          {/* Sparkles decoration */}
          <div className="flex justify-center gap-2 mb-2">
            <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 8, ease: 'linear' }}>
              <Sparkles className="w-6 h-6 text-yellow-400" />
            </motion.div>
          </div>

          <p className="text-yellow-400 text-xs font-black tracking-widest uppercase mb-1">
            Pencapaian Luar Biasa
          </p>

          <h3 className="text-3xl font-extrabold text-white tracking-tight mb-6">
            NAIK LEVEL!
          </h3>

          {/* 3D-like Spinning Shield Badge Container */}
          <div className="relative w-40 h-40 mx-auto mb-8 flex items-center justify-center">
            {/* Spinning glowing background ring */}
            <motion.div
              className="absolute inset-0 rounded-full border-2 border-dashed border-indigo-400/40"
              animate={{ rotate: 360 }}
              transition={{ repeat: Infinity, duration: 15, ease: 'linear' }}
            />
            {/* Pulsing light aura */}
            <motion.div
              className="absolute w-32 h-32 rounded-full bg-indigo-500/20 blur-xl"
              animate={{ scale: [1, 1.15, 1] }}
              transition={{ repeat: Infinity, duration: 2, ease: 'easeInOut' }}
            />

            {/* Shield badge */}
            <motion.div
              className="relative w-28 h-28 rounded-2xl flex items-center justify-center border shadow-2xl"
              style={{
                background: `linear-gradient(135deg, ${currentLevelInfo.color}, #1E1B4B)`,
                borderColor: `${currentLevelInfo.color}80`,
              }}
              animate={{
                rotateY: [0, 180, 360],
                y: [0, -8, 0],
              }}
              transition={{
                rotateY: { repeat: Infinity, duration: 6, ease: 'linear' },
                y: { repeat: Infinity, duration: 3, ease: 'easeInOut' },
              }}
            >
              <Shield className="w-14 h-14 text-white drop-shadow-[0_4px_10px_rgba(0,0,0,0.5)]" />
              <div className="absolute inset-0 flex items-center justify-center font-black text-2xl text-white select-none">
                {levelUpCelebration}
              </div>
            </motion.div>
          </div>

          {/* Reward information card */}
          <div className="space-y-4 mb-8">
            <div>
              <p className="text-white font-extrabold text-xl">
                Level {levelUpCelebration}
              </p>
              <p className="text-indigo-300 text-sm font-semibold mt-0.5">
                Gelar Baru: <span className="text-yellow-300 font-bold">{getDisciplineTitle(levelUpCelebration)}</span>
              </p>
            </div>

            <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-between text-left">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-yellow-500/20 text-yellow-400">
                  <Star className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-xs font-bold text-white">Bonus Naik Level</p>
                  <p className="text-[10px] text-gray-400">Kapasitas XP Anda telah meningkat</p>
                </div>
              </div>
              <div className="text-yellow-400 font-extrabold text-sm flex items-center gap-0.5">
                <Zap className="w-3.5 h-3.5 fill-current" /> +100 Max
              </div>
            </div>
          </div>

          {/* Close button */}
          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            onClick={handleClose}
            className="w-full py-4 rounded-2xl text-white text-sm font-extrabold transition-all"
            style={{
              background: 'linear-gradient(90deg, #6366F1, #8B5CF6)',
              boxShadow: '0 4px 15px rgba(99, 102, 241, 0.4)',
            }}
          >
            Lanjutkan Perjuangan!
          </motion.button>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
