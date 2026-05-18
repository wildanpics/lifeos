'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAppStore } from '@/store/useAppStore';
import { getLevelFromXP, getProgressToNextLevel, getXPToNextLevel, LEVELS } from '@/lib/constants/levels';
import { X, Zap, ChevronRight } from 'lucide-react';

export function XPBar() {
  const { totalXP } = useAppStore();
  const level = getLevelFromXP(totalXP);
  const progress = getProgressToNextLevel(totalXP);
  const xpToNext = getXPToNextLevel(totalXP);
  const [showRoadmap, setShowRoadmap] = useState(false);

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="card"
      >
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full flex items-center justify-center" style={{ background: `${level.color}20`, color: level.color }}>
              <level.icon className="w-4 h-4" />
            </div>
            <div>
              <p className="text-xs font-bold" style={{ color: level.color }}>
                Lv.{level.level} — {level.titleId}
              </p>
              <p className="text-[10px]" style={{ color: 'var(--text-muted)' }}>
                {totalXP.toLocaleString()} XP total
              </p>
            </div>
          </div>
          <button
            onClick={() => setShowRoadmap(true)}
            className="flex items-center gap-1 text-xs px-2 py-1 rounded-lg"
            style={{ background: 'var(--bg-secondary)', color: 'var(--text-secondary)' }}
          >
            Roadmap <ChevronRight className="w-3 h-3" />
          </button>
        </div>

        {/* XP Bar */}
        <div>
          <div className="xp-bar-container mb-1">
            <motion.div
              className="xp-bar-fill"
              style={{ background: `linear-gradient(90deg, ${level.color}, ${level.color}bb)` }}
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 1, delay: 0.2 }}
            />
          </div>
          <div className="flex justify-between text-[10px]" style={{ color: 'var(--text-muted)' }}>
            <span>{progress}% ke level {level.level + 1}</span>
            <span>{xpToNext > 0 ? `${xpToNext} XP lagi` : '⚡ Max Level!'}</span>
          </div>
        </div>
      </motion.div>

      {/* Roadmap Modal */}
      <AnimatePresence>
        {showRoadmap && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center p-4"
            style={{ background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(8px)' }}
            onClick={() => setShowRoadmap(false)}
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="w-full max-w-sm rounded-2xl p-5"
              style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold text-base flex items-center gap-2" style={{ color: 'var(--text-primary)' }}>
                  <Zap className="w-4 h-4 text-yellow-400" />
                  Level Roadmap
                </h3>
                <button onClick={() => setShowRoadmap(false)}>
                  <X className="w-4 h-4" style={{ color: 'var(--text-muted)' }} />
                </button>
              </div>

              <div className="space-y-2 max-h-80 overflow-y-auto">
                {LEVELS.map((l) => {
                  const current = l.level === level.level;
                  const done = l.level < level.level;
                  return (
                    <div
                      key={l.level}
                      className="flex items-center gap-3 p-2.5 rounded-xl"
                      style={{
                        background: current ? `${l.color}20` : done ? 'var(--bg-secondary)' : 'transparent',
                        border: current ? `1px solid ${l.color}50` : '1px solid transparent',
                      }}
                    >
                      <div className="w-5 h-5 flex items-center justify-center shrink-0">
                        {done ? <span className="text-base">✅</span> : <l.icon className="w-4 h-4" style={{ color: current ? l.color : 'var(--text-muted)' }} />}
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-semibold"
                          style={{ color: current ? l.color : done ? 'var(--text-secondary)' : 'var(--text-muted)' }}>
                          Lv.{l.level} — {l.titleId}
                        </p>
                        <p className="text-[10px]" style={{ color: 'var(--text-muted)' }}>
                          {l.minXP.toLocaleString()} – {l.maxXP === Infinity ? '∞' : l.maxXP.toLocaleString()} XP
                        </p>
                      </div>
                      {current && (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full"
                          style={{ background: `${l.color}30`, color: l.color }}>
                          KAMU
                        </span>
                      )}
                    </div>
                  );
                })}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
