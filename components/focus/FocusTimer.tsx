'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useFocusStore } from '@/store/useFocusStore';
import { useAppStore } from '@/store/useAppStore';
import { saveFocusSession } from '@/lib/firebase/firestore';
import { getToday } from '@/lib/utils/time';
import { Play, Pause, RotateCcw, Check, Timer } from 'lucide-react';
const uuidv4 = () => crypto.randomUUID();

const PRESET_DURATIONS = [25, 45, 60, 90];
const CIRCUMFERENCE = 2 * Math.PI * 60;

export function FocusTimer() {
  const { status, elapsedSeconds, plannedDuration, currentTask, startSession, pauseSession, resumeSession, completeSession, tick, setTask, setPlannedDuration, reset } = useFocusStore();
  const { user, updateFocusMinutes, todayStats } = useAppStore();
  const [showComplete, setShowComplete] = useState(false);

  const totalSeconds = plannedDuration * 60;
  const remainingSeconds = totalSeconds - elapsedSeconds;
  const progress = elapsedSeconds / totalSeconds;
  const strokeDashoffset = CIRCUMFERENCE * (1 - progress);

  const formatTime = (s: number) => {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${String(m).padStart(2, '0')}:${String(sec).padStart(2, '0')}`;
  };

  useEffect(() => {
    if (status !== 'running') return;
    const interval = setInterval(() => tick(), 1000);
    return () => clearInterval(interval);
  }, [status, tick]);

  useEffect(() => {
    if (status === 'completed' && !showComplete) {
      setShowComplete(true);
      handleSessionComplete();
    }
  }, [status]);

  const handleSessionComplete = useCallback(async () => {
    if (!user) return;
    const mins = Math.round(elapsedSeconds / 60);
    updateFocusMinutes((todayStats?.focusMinutes || 0) + mins);
    try {
      await saveFocusSession({
        id: uuidv4(),
        userId: user.uid,
        date: getToday(),
        startTime: new Date(Date.now() - elapsedSeconds * 1000),
        endTime: new Date(),
        plannedDuration,
        actualDuration: mins,
        status: 'completed',
        task: currentTask,
        xpEarned: 30,
      });
    } catch (e) { console.error(e); }
  }, [user, elapsedSeconds, plannedDuration, currentTask]);

  const handleStart = () => {
    startSession({
      id: uuidv4(),
      userId: user?.uid || 'guest',
      date: getToday(),
      startTime: new Date(),
      plannedDuration,
      status: 'running',
      task: currentTask,
      xpEarned: 0,
    });
  };

  const progressColor = status === 'completed' ? '#10B981' : '#6366F1';

  return (
    <div className="flex flex-col items-center gap-6">
      {/* Duration presets */}
      {status === 'idle' && (
        <div className="flex gap-2">
          {PRESET_DURATIONS.map((d) => (
            <button key={d} onClick={() => setPlannedDuration(d)}
              className="px-3 py-1.5 rounded-xl text-xs font-semibold transition-all"
              style={{
                background: plannedDuration === d ? 'var(--accent)' : 'var(--bg-secondary)',
                color: plannedDuration === d ? 'white' : 'var(--text-secondary)',
              }}>
              {d}m
            </button>
          ))}
        </div>
      )}

      {/* Timer circle */}
      <div className="relative w-48 h-48">
        <svg className="w-full h-full timer-ring" viewBox="0 0 144 144">
          <circle cx="72" cy="72" r="60" fill="none" stroke="var(--border)" strokeWidth="8" />
          <motion.circle cx="72" cy="72" r="60" fill="none" stroke={progressColor}
            strokeWidth="8" strokeLinecap="round"
            strokeDasharray={CIRCUMFERENCE}
            strokeDashoffset={strokeDashoffset}
            style={{ filter: `drop-shadow(0 0 10px ${progressColor}60)` }}
            transition={{ duration: 0.5 }} />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <motion.span key={remainingSeconds} className="text-4xl font-bold tabular-nums"
            style={{ color: 'var(--text-primary)' }}>
            {formatTime(Math.max(0, remainingSeconds))}
          </motion.span>
          <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>
            {status === 'idle' ? 'Siap fokus' : status === 'paused' ? 'Dijeda' : status === 'completed' ? 'Selesai! 🎉' : 'Fokus...'}
          </p>
        </div>
      </div>

      {/* Task input */}
      {status === 'idle' && (
        <input value={currentTask} onChange={(e) => setTask(e.target.value)}
          placeholder="Sedang mengerjakan apa?"
          className="w-full max-w-xs text-sm px-4 py-2.5 rounded-xl outline-none transition-all"
          style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border)', color: 'var(--text-primary)' }} />
      )}

      {/* Controls */}
      <div className="flex items-center gap-3">
        {status === 'idle' ? (
          <motion.button whileTap={{ scale: 0.95 }} onClick={handleStart}
            className="btn-primary px-8 py-3 text-base">
            <Play className="w-5 h-5" /> Mulai Fokus
          </motion.button>
        ) : status === 'running' ? (
          <>
            <motion.button whileTap={{ scale: 0.95 }} onClick={pauseSession}
              className="btn-secondary px-6 py-2.5">
              <Pause className="w-4 h-4" />
            </motion.button>
            <motion.button whileTap={{ scale: 0.95 }} onClick={completeSession}
              className="btn-primary px-6 py-2.5">
              <Check className="w-4 h-4" /> Selesai
            </motion.button>
          </>
        ) : status === 'paused' ? (
          <>
            <motion.button whileTap={{ scale: 0.95 }} onClick={resumeSession}
              className="btn-primary px-6 py-2.5">
              <Play className="w-4 h-4" /> Lanjut
            </motion.button>
            <motion.button whileTap={{ scale: 0.95 }} onClick={reset}
              className="btn-secondary px-4 py-2.5">
              <RotateCcw className="w-4 h-4" />
            </motion.button>
          </>
        ) : (
          <motion.button whileTap={{ scale: 0.95 }} onClick={reset}
            className="btn-primary px-8 py-3">
            <Timer className="w-4 h-4" /> Sesi Baru
          </motion.button>
        )}
      </div>

      {/* Completion celebration */}
      <AnimatePresence>
        {showComplete && (
          <motion.div initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }}
            className="text-center p-4 rounded-2xl"
            style={{ background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.3)' }}>
            <p className="text-2xl mb-1">🎉</p>
            <p className="font-bold text-sm text-green-400">Sesi Fokus Selesai!</p>
            <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>+30 XP diperoleh</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
