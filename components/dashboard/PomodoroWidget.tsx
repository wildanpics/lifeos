'use client';

import { useEffect } from 'react';
import { motion } from 'framer-motion';
import { Play, Pause, Square, Sparkles } from 'lucide-react';
import { useFocusStore } from '@/store/useFocusStore';
import { useAppStore } from '@/store/useAppStore';
import { formatTime, getToday } from '@/lib/utils/time';
import { playMechanicalClick, playCrystalChime } from '@/lib/utils/sound';

export function PomodoroWidget() {
  const { status, elapsedSeconds, plannedDuration, startSession, pauseSession, resumeSession, tick, reset, setPlannedDuration, completeSession } = useFocusStore();

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (status === 'running') {
      interval = setInterval(() => {
        tick();
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [status, tick]);

  const { user, todayStats, updateFocusMinutes } = useAppStore();

  useEffect(() => {
    if (status === 'completed' && user && todayStats) {
      // Reward logic
      const giveReward = async () => {
        try {
          const { addXP, updateDailyStats } = await import('@/lib/firebase/firestore');
          // Only give XP and focus minutes for actual Pomodoro, not breaks
          if (plannedDuration >= 25) {
            await addXP(user.uid, 100);
            const newMinutes = (todayStats.focusMinutes || 0) + plannedDuration;
            updateFocusMinutes(newMinutes);
            await updateDailyStats(user.uid, todayStats.date, { focusMinutes: newMinutes });
          }
          playCrystalChime(); // Satisfying bell chime upon completion!
          // Complete session properly in store to prevent re-triggering
          completeSession();
          setTimeout(() => reset(), 3000); // Reset after 3 seconds so user sees completion
        } catch (e) {
          console.error('Reward error', e);
        }
      };
      giveReward();
    }
  }, [status, user, todayStats, plannedDuration, updateFocusMinutes, completeSession, reset]);

  const totalSeconds = plannedDuration * 60;
  const remainingSeconds = totalSeconds - elapsedSeconds;
  
  const handlePlayPause = () => {
    playMechanicalClick();
    if (status === 'idle') {
      startSession({ 
        id: Date.now().toString(), 
        userId: 'temp', 
        date: getToday(),
        startTime: new Date(), 
        plannedDuration, 
        status: 'running',
        xpEarned: 0 
      });
    } else if (status === 'running') {
      pauseSession();
    } else if (status === 'paused') {
      resumeSession();
    }
  };

  const handleStop = () => {
    playMechanicalClick();
    reset();
  };

  const progress = (elapsedSeconds / totalSeconds) * 100;
  const radius = 60;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (progress / 100) * circumference;

  const modes = [
    { label: 'Pomodoro', duration: 25 },
    { label: 'Short Break', duration: 5 },
    { label: 'Long Break', duration: 15 },
  ];

  return (
    <div className="card p-6 rounded-2xl h-full flex flex-col md:flex-row items-center gap-8" 
         style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border)' }}>
      
      {/* Left: Timer Ring */}
      <div className="relative flex-shrink-0">
        <svg className="w-40 h-40 transform -rotate-90">
          <circle cx="80" cy="80" r={radius} className="stroke-current" style={{ color: 'var(--bg-primary)' }} strokeWidth="8" fill="transparent" />
          <motion.circle
            cx="80" cy="80" r={radius} className="stroke-current" style={{ color: 'var(--accent)' }} strokeWidth="8" fill="transparent"
            strokeDasharray={circumference}
            animate={{ strokeDashoffset }}
            transition={{ duration: 1 }}
            strokeLinecap="round"
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
          <span className="text-3xl font-bold tabular-nums tracking-tighter" style={{ color: 'var(--text-primary)' }}>
            {formatTime(remainingSeconds)}
          </span>
          <span className="text-[10px]" style={{ color: 'var(--text-muted)' }}>
            {status === 'running' ? 'Fokus' : status === 'paused' ? 'Jeda' : 'Siap'}
          </span>
        </div>

        {/* Controls */}
        <div className="absolute -bottom-4 left-1/2 transform -translate-x-1/2 flex items-center gap-2 p-1.5 rounded-full shadow-lg"
             style={{ background: 'var(--bg-primary)', border: '1px solid var(--border)' }}>
          <button onClick={handlePlayPause} className="w-10 h-10 rounded-full flex items-center justify-center text-white" style={{ background: 'var(--accent)' }}>
            {status === 'running' ? <Pause className="w-4 h-4 fill-current" /> : <Play className="w-4 h-4 fill-current ml-0.5" />}
          </button>
          {status !== 'idle' && (
            <button onClick={handleStop} className="w-8 h-8 rounded-full flex items-center justify-center transition-colors"
                    style={{ background: 'var(--bg-secondary)', color: 'var(--text-secondary)' }}>
              <Square className="w-3 h-3 fill-current" />
            </button>
          )}
        </div>
      </div>

      {/* Right: Modes & Reward */}
      <div className="flex-1 w-full space-y-4">
        <div className="flex flex-col gap-2">
          {modes.map((m) => (
            <button 
              key={m.label}
              onClick={() => { playMechanicalClick(); reset(); setPlannedDuration(m.duration); }}
              className="flex items-center justify-between p-3 rounded-xl transition-colors"
              style={{ 
                background: plannedDuration === m.duration ? 'rgba(99,102,241,0.1)' : 'var(--bg-primary)',
                border: plannedDuration === m.duration ? '1px solid rgba(99,102,241,0.3)' : '1px solid transparent'
              }}
            >
              <div>
                <p className="text-xs font-bold" style={{ color: plannedDuration === m.duration ? '#818CF8' : 'var(--text-primary)' }}>{m.label}</p>
                <p className="text-[10px]" style={{ color: 'var(--text-muted)' }}>{m.duration} menit</p>
              </div>
              <div className="w-3 h-3 rounded-full border border-gray-600 flex items-center justify-center">
                {plannedDuration === m.duration && <div className="w-1.5 h-1.5 rounded-full bg-indigo-400" />}
              </div>
            </button>
          ))}
        </div>

        <div className="p-3 rounded-xl border border-dashed flex items-center justify-between" style={{ borderColor: 'var(--border)', background: 'rgba(255,255,255,0.02)' }}>
          <div>
            <p className="text-[10px]" style={{ color: 'var(--text-secondary)' }}>Reward Berikutnya</p>
            <p className="text-xs font-bold text-yellow-500">+100 XP</p>
          </div>
          <Sparkles className="w-5 h-5 text-yellow-500/50" />
        </div>
      </div>
    </div>
  );
}
