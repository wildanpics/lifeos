'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { X, Lock, CheckCircle2 } from 'lucide-react';
import { useAppStore } from '@/store/useAppStore';
import { LEVELS, getLevelFromXP } from '@/lib/constants/levels';
import { cn } from '@/lib/utils';

interface LevelRoadmapModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function LevelRoadmapModal({ isOpen, onClose }: LevelRoadmapModalProps) {
  const { totalXP } = useAppStore();
  const currentLevel = getLevelFromXP(totalXP);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-sm"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-[101] w-[92%] max-w-md max-h-[75vh] flex flex-col rounded-2xl shadow-2xl overflow-hidden"
            style={{ background: 'var(--bg-primary)', border: '1px solid var(--border)' }}
          >
            {/* Header */}
            <div className="flex items-center justify-between p-4 sm:p-5 border-b shrink-0" style={{ borderColor: 'var(--border)' }}>
              <div>
                <h2 className="text-base sm:text-lg font-bold" style={{ color: 'var(--text-primary)' }}>
                  Roadmap Disiplin
                </h2>
                <p className="text-[10px] sm:text-xs mt-0.5 sm:mt-1" style={{ color: 'var(--text-secondary)' }}>
                  Selesaikan tugas harian untuk mengumpulkan XP dan naik level.
                </p>
              </div>
              <button
                onClick={onClose}
                className="p-1.5 sm:p-2 rounded-xl transition-colors hover:bg-white/10"
                style={{ color: 'var(--text-secondary)' }}
              >
                <X className="w-4.5 h-4.5 sm:w-5 sm:h-5" />
              </button>
            </div>

            {/* List of Levels */}
            <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-2 sm:space-y-3">
              {LEVELS.map((lvl) => {
                const isCurrent = lvl.level === currentLevel.level;
                const isPassed = lvl.level < currentLevel.level;
                const isLocked = lvl.level > currentLevel.level;

                return (
                  <div
                    key={lvl.level}
                    className={cn(
                      "relative p-3 sm:p-4 rounded-xl flex items-center gap-3 sm:gap-4 transition-all",
                      isCurrent && "ring-2 ring-indigo-500 shadow-lg shadow-indigo-500/20"
                    )}
                    style={{
                      background: isCurrent 
                        ? 'var(--bg-secondary)' 
                        : isLocked 
                          ? 'transparent' 
                          : 'var(--bg-secondary)',
                      border: '1px solid',
                      borderColor: isCurrent ? 'var(--border)' : isLocked ? 'transparent' : 'var(--border)',
                      opacity: isLocked ? 0.6 : 1
                    }}
                  >


                    {/* Icon / Status */}
                    <div className="relative z-10 w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center shrink-0"
                         style={{ 
                           background: isCurrent ? 'linear-gradient(135deg, #6366F1, #8B5CF6)' : isPassed ? 'rgba(16,185,129,0.1)' : 'var(--bg-card-hover)',
                           color: isCurrent ? 'white' : isPassed ? '#10B981' : 'var(--text-secondary)'
                         }}>
                      {isPassed ? (
                        <CheckCircle2 className="w-4 h-4 sm:w-5 sm:h-5" />
                      ) : isLocked ? (
                        <Lock className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                      ) : (
                        <lvl.icon className="w-4 h-4 sm:w-5 sm:h-5" />
                      )}
                    </div>

                    {/* Info */}
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-0.5 sm:mb-1">
                        <span className="text-[9px] sm:text-xs font-bold uppercase tracking-wider" style={{ color: isCurrent ? 'var(--accent)' : 'var(--text-muted)' }}>
                          Level {lvl.level}
                        </span>
                        {isCurrent && (
                          <span className="text-[8px] sm:text-[10px] font-bold px-1.5 py-0.5 sm:px-2 rounded-full bg-indigo-500/20 text-indigo-400">
                            Saat ini
                          </span>
                        )}
                      </div>
                      <h3 className="text-xs sm:text-sm font-bold flex items-center gap-1.5" style={{ color: 'var(--text-primary)' }}>
                        {lvl.titleId} {!isCurrent && !isLocked && <lvl.icon className="w-3.5 h-3.5 sm:w-4 sm:h-4 ml-0.5" />}
                      </h3>
                      <p className="text-[10px] sm:text-xs mt-0.5" style={{ color: 'var(--text-secondary)' }}>
                        Butuh {lvl.minXP.toLocaleString()} XP
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
            
            {/* Footer */}
            <div className="p-3 sm:p-4 border-t text-center shrink-0" style={{ borderColor: 'var(--border)' }}>
              <p className="text-[10px] sm:text-xs" style={{ color: 'var(--text-muted)' }}>
                Total XP Anda: <span className="font-bold text-indigo-400">{totalXP.toLocaleString()} XP</span>
              </p>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
