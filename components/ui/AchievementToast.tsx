'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAppStore } from '@/store/useAppStore';
import { Trophy, X } from 'lucide-react';

export function AchievementToast() {
  const { newAchievement, setNewAchievement } = useAppStore();
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (newAchievement) {
      setVisible(true);
      // Auto hide after 5 seconds
      const timer = setTimeout(() => {
        handleClose();
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [newAchievement]);

  const handleClose = () => {
    setVisible(false);
    setTimeout(() => {
      setNewAchievement(null);
    }, 300); // Wait for exit animation
  };

  return (
    <AnimatePresence>
      {visible && newAchievement && (
        <motion.div
          initial={{ opacity: 0, y: 50, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 20, scale: 0.9 }}
          className="fixed bottom-20 left-4 right-4 md:left-auto md:right-8 md:bottom-8 z-[100] md:w-96"
        >
          <div className="relative overflow-hidden rounded-2xl p-4 shadow-2xl"
               style={{ 
                 background: 'linear-gradient(135deg, #1E1B4B, #312E81)', 
                 border: '1px solid rgba(99, 102, 241, 0.4)'
               }}>
            
            {/* Background effects */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-yellow-500/10 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2" />
            <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] opacity-20" />
            
            <button onClick={handleClose} className="absolute top-2 right-2 p-1 text-white/50 hover:text-white transition-colors">
              <X size={16} />
            </button>

            <div className="relative z-10 flex items-center gap-4">
              <div className="w-14 h-14 rounded-full bg-yellow-500/20 border border-yellow-500/30 flex items-center justify-center flex-shrink-0 relative">
                <span className="text-3xl relative z-10">{newAchievement.icon}</span>
                <motion.div
                  className="absolute inset-0 border-2 border-yellow-400 rounded-full"
                  animate={{ scale: [1, 1.2, 1], opacity: [1, 0, 1] }}
                  transition={{ duration: 2, repeat: Infinity }}
                />
              </div>
              
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1 mb-0.5">
                  <Trophy className="w-3 h-3 text-yellow-400" />
                  <span className="text-[10px] font-bold tracking-widest text-yellow-400 uppercase">
                    Achievement Unlocked
                  </span>
                </div>
                <h3 className="font-bold text-white text-base truncate">
                  {newAchievement.title}
                </h3>
                <p className="text-xs text-indigo-200 line-clamp-1 mt-0.5">
                  {newAchievement.description}
                </p>
              </div>

              <div className="flex-shrink-0 text-center">
                <span className="block text-[10px] font-bold text-indigo-200 uppercase">Reward</span>
                <span className="block text-sm font-bold text-yellow-400">+{newAchievement.xpReward} XP</span>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
