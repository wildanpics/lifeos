'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import { useAppStore } from '@/store/useAppStore';

interface QuickStatsModalProps {
  isOpen: boolean;
  onClose: () => void;
  dataKey: string | null;
}

export function QuickStatsModal({ isOpen, onClose, dataKey }: QuickStatsModalProps) {
  const { todayStats, updateSleep, updateMood, updateScreenTime, updateFocusMinutes, isSleeping, sleepStartTime, toggleSleep } = useAppStore();
  const [value, setValue] = useState<string>('');

  useEffect(() => {
    if (isOpen && todayStats && dataKey) {
      if (dataKey === 'sleepHours') setValue(todayStats.sleepHours?.toString() || '');
      if (dataKey === 'screenTimeMinutes') setValue(todayStats.screenTimeMinutes?.toString() || '');
      if (dataKey === 'focusMinutes') setValue(todayStats.focusMinutes?.toString() || '');
    }
  }, [isOpen, dataKey, todayStats]);

  const handleSave = async () => {
    if (!dataKey) return;

    try {
      // Lazy load to avoid loading Firebase on initial render if not needed
      const { updateDailyStats } = await import('@/lib/firebase/firestore');
      const { auth } = await import('@/lib/firebase/config');
      const user = auth.currentUser;
      if (!user || !todayStats) return;

      const numValue = parseFloat(value) || 0;

      if (dataKey === 'sleepHours') {
        updateSleep(numValue);
        await updateDailyStats(user.uid, todayStats.date, { sleepHours: numValue });
      } else if (dataKey === 'screenTimeMinutes') {
        updateScreenTime(numValue);
        await updateDailyStats(user.uid, todayStats.date, { screenTimeMinutes: numValue });
      } else if (dataKey === 'focusMinutes') {
        updateFocusMinutes(numValue);
        await updateDailyStats(user.uid, todayStats.date, { focusMinutes: numValue });
      }
      
      onClose();
    } catch (e) {
      console.error(e);
    }
  };

  const handleMoodSelect = async (moodValue: number) => {
    try {
      const { updateDailyStats } = await import('@/lib/firebase/firestore');
      const { auth } = await import('@/lib/firebase/config');
      const user = auth.currentUser;
      if (!user || !todayStats) return;

      updateMood(moodValue);
      await updateDailyStats(user.uid, todayStats.date, { mood: moodValue });
      onClose();
    } catch (e) {
      console.error(e);
    }
  };

  const handleSleepToggle = async () => {
    try {
      const { updateDailyStats } = await import('@/lib/firebase/firestore');
      const { auth } = await import('@/lib/firebase/config');
      const user = auth.currentUser;
      
      if (isSleeping && sleepStartTime) {
        // Waking up
        const hours = (Date.now() - sleepStartTime) / (1000 * 60 * 60);
        const finalHours = Math.round(hours * 10) / 10; // 1 decimal place
        updateSleep(finalHours);
        if (user && todayStats) {
          await updateDailyStats(user.uid, todayStats.date, { sleepHours: finalHours });
        }
      }
      
      toggleSleep();
      onClose();
    } catch (e) {
      console.error(e);
    }
  };

  if (!isOpen || !dataKey) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.95, y: 20 }}
          animate={{ scale: 1, y: 0 }}
          exit={{ scale: 0.95, y: 20 }}
          onClick={(e) => e.stopPropagation()}
          className="w-full max-w-sm rounded-2xl p-5 shadow-2xl"
          style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-base" style={{ color: 'var(--text-primary)' }}>
              {dataKey === 'mood' && 'Bagaimana Perasaanmu?'}
              {dataKey === 'sleepHours' && 'Berapa Lama Tidurmu?'}
              {dataKey === 'screenTimeMinutes' && 'Catat Screen Time'}
              {dataKey === 'focusMinutes' && 'Catat Menit Fokus'}
            </h3>
            <button onClick={onClose} className="p-1 rounded-lg hover:bg-white/10 transition-colors">
              <X className="w-5 h-5" style={{ color: 'var(--text-muted)' }} />
            </button>
          </div>

          <div className="py-2">
            {dataKey === 'mood' && (
              <div className="flex items-center justify-between gap-2">
                {[
                  { icon: '😔', val: 1, label: 'Sangat Buruk' },
                  { icon: '😕', val: 2, label: 'Buruk' },
                  { icon: '😐', val: 3, label: 'Normal' },
                  { icon: '🙂', val: 4, label: 'Baik' },
                  { icon: '😄', val: 5, label: 'Sangat Baik' }
                ].map((m) => (
                  <button
                    key={m.val}
                    onClick={() => handleMoodSelect(m.val)}
                    className="flex flex-col items-center p-2 rounded-xl transition-all hover:bg-white/10 hover:scale-110"
                    style={{ background: todayStats?.mood === m.val ? 'var(--bg-secondary)' : 'transparent' }}
                  >
                    <span className="text-3xl mb-1">{m.icon}</span>
                    <span className="text-[10px]" style={{ color: 'var(--text-muted)' }}>{m.label}</span>
                  </button>
                ))}
              </div>
            )}

            {(dataKey === 'screenTimeMinutes' || dataKey === 'focusMinutes') && (
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <input
                    type="number"
                    value={value}
                    onChange={(e) => setValue(e.target.value)}
                    placeholder="0"
                    min="0"
                    step="1"
                    className="flex-1 bg-transparent text-2xl font-bold border-b-2 outline-none p-2 text-center"
                    style={{ borderColor: 'var(--border)', color: 'var(--text-primary)' }}
                    autoFocus
                  />
                  <span className="text-sm font-medium" style={{ color: 'var(--text-muted)' }}>
                    Menit
                  </span>
                </div>
                <button
                  onClick={handleSave}
                  className="w-full py-3 rounded-xl font-bold text-white transition-opacity hover:opacity-90 mt-4"
                  style={{ background: 'linear-gradient(135deg, #6366F1, #8B5CF6)' }}
                >
                  Simpan
                </button>
              </div>
            )}

            {dataKey === 'sleepHours' && (
              <div className="space-y-4">
                {isSleeping ? (
                  <div className="text-center space-y-4">
                    <div className="w-20 h-20 mx-auto rounded-full bg-indigo-500/20 flex items-center justify-center animate-pulse">
                      <span className="text-4xl">😴</span>
                    </div>
                    <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>Kamu sedang tidur...</p>
                    <button
                      onClick={handleSleepToggle}
                      className="w-full py-3 rounded-xl font-bold text-white transition-opacity hover:opacity-90"
                      style={{ background: '#10B981' }} // Emerald
                    >
                      Saya Sudah Bangun
                    </button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <button
                      onClick={handleSleepToggle}
                      className="w-full py-4 rounded-xl font-bold text-white transition-opacity hover:opacity-90 flex flex-col items-center gap-1"
                      style={{ background: '#8B5CF6' }} // Purple
                    >
                      <span className="text-lg">Mulai Tidur Sekarang</span>
                      <span className="text-[10px] opacity-70">Otomatis menghitung durasi</span>
                    </button>
                    
                    <div className="relative flex py-2 items-center">
                      <div className="flex-grow border-t" style={{ borderColor: 'var(--border)' }}></div>
                      <span className="flex-shrink-0 mx-4 text-xs" style={{ color: 'var(--text-muted)' }}>atau isi manual</span>
                      <div className="flex-grow border-t" style={{ borderColor: 'var(--border)' }}></div>
                    </div>

                    <div className="flex items-center gap-3">
                      <input
                        type="number"
                        value={value}
                        onChange={(e) => setValue(e.target.value)}
                        placeholder="0"
                        min="0"
                        step="0.5"
                        className="flex-1 bg-transparent text-2xl font-bold border-b-2 outline-none p-2 text-center"
                        style={{ borderColor: 'var(--border)', color: 'var(--text-primary)' }}
                      />
                      <span className="text-sm font-medium" style={{ color: 'var(--text-muted)' }}>
                        Jam
                      </span>
                    </div>
                    <button
                      onClick={handleSave}
                      className="w-full py-2 rounded-xl font-bold transition-opacity hover:bg-white/5 border"
                      style={{ color: 'var(--text-primary)', borderColor: 'var(--border)' }}
                    >
                      Simpan Manual
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
