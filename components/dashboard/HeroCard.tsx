'use client';

import { motion } from 'framer-motion';
import { useAppStore } from '@/store/useAppStore';
import { getLevelFromXP } from '@/lib/constants/levels';
import { Flame, Target } from 'lucide-react';

export function HeroCard() {
  const { user, totalXP, todayStats } = useAppStore();
  const level = getLevelFromXP(totalXP);
  
  // Example dummy calculation for progress
  const { HABIT_DEFINITIONS } = require('@/lib/constants/habits');
  const completed = todayStats?.completedHabits?.length || 0;
  const target = HABIT_DEFINITIONS?.length || 12;
  const percentage = Math.min(100, Math.round((completed / target) * 100));
  
  // Real streak would require a global counter, using 0 for now
  const streak = 0;

  const radius = 60;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  return (
    <div className="card relative overflow-hidden p-6 md:p-8 rounded-2xl flex flex-col md:flex-row items-center gap-8 shadow-2xl shadow-indigo-500/10"
         style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border)' }}>
      
      {/* Background glow effects */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-64 h-64 bg-purple-500/10 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2 pointer-events-none" />

      {/* Header Info (Mobile Top) */}
      <div className="md:hidden w-full mb-4">
        <h1 className="text-xl font-bold" style={{ color: 'var(--text-primary)' }}>
          Selamat pagi,<br/>
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-400">
            {user?.displayName?.split(' ')[0] || 'Teman'}, ayo bangkit! 👋
          </span>
        </h1>
        <p className="text-xs mt-1" style={{ color: 'var(--text-secondary)' }}>
          Hari baru adalah kesempatan baru untuk menjadi lebih baik.
        </p>
      </div>

      {/* Big Circular Progress */}
      <div className="relative flex-shrink-0 flex items-center justify-center p-2">
        <div className="absolute inset-0 bg-indigo-500/10 rounded-full blur-2xl scale-110 pointer-events-none" />
        
        <svg className="w-44 h-44 transform -rotate-90 relative z-10" viewBox="0 0 160 160">
          <defs>
            <linearGradient id="progress-gradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#A855F7" />
              <stop offset="100%" stopColor="#3B82F6" />
            </linearGradient>
            <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="4" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
          </defs>

          {/* Background circle */}
          <circle
            cx="80"
            cy="80"
            r={radius}
            className="stroke-current"
            style={{ color: 'var(--border)' }}
            strokeWidth="6"
            fill="transparent"
          />
          {/* Progress circle */}
          <motion.circle
            cx="80"
            cy="80"
            r={radius}
            stroke="url(#progress-gradient)"
            strokeWidth="6"
            fill="transparent"
            strokeDasharray={circumference}
            initial={{ strokeDashoffset: circumference }}
            animate={{ strokeDashoffset }}
            transition={{ duration: 1, ease: "easeOut" }}
            strokeLinecap="round"
            filter="url(#glow)"
          />
        </svg>
        
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center z-10">
          <span className="text-4xl font-bold tracking-tight mb-1" style={{ color: 'var(--text-primary)' }}>
            {percentage}%
          </span>
          <span className="text-[10px] font-medium" style={{ color: 'var(--text-secondary)' }}>
            Progress Hari Ini
          </span>
        </div>

        {/* Floating Stars */}
        <div className="absolute top-6 left-6 text-blue-400 text-sm animate-pulse">✦</div>
        <div className="absolute top-10 right-4 text-purple-400 text-xs animate-pulse" style={{ animationDelay: '0.5s' }}>✦</div>
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 text-indigo-400 text-xs animate-pulse" style={{ animationDelay: '1s' }}>✦</div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 w-full relative z-10">
        
        {/* Header Info (Desktop Left) */}
        <div className="hidden md:block mb-6">
          <h1 className="text-2xl font-bold tracking-tight" style={{ color: 'var(--text-primary)' }}>
            Selamat pagi,<br/>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-400">
              {user?.displayName?.split(' ')[0] || 'Teman'}, ayo bangkit! 👋
            </span>
          </h1>
          <p className="text-sm mt-1" style={{ color: 'var(--text-secondary)' }}>
            Hari baru adalah kesempatan baru untuk menjadi lebih baik.
          </p>
        </div>

        {/* Stats Row */}
        <div className="flex items-center gap-8 mb-4">
          <div>
            <div className="flex items-center gap-1.5 mb-1">
              <Flame className="w-4 h-4 text-orange-500" />
              <span className="text-xs font-medium" style={{ color: 'var(--text-secondary)' }}>Streak</span>
            </div>
            <p className="text-xl font-bold" style={{ color: 'var(--text-primary)' }}>{streak} hari</p>
          </div>
          <div>
            <div className="flex items-center gap-1.5 mb-1">
              <Target className="w-4 h-4 text-indigo-400" />
              <span className="text-xs font-medium" style={{ color: 'var(--text-secondary)' }}>Target</span>
            </div>
            <p className="text-xl font-bold tabular-nums" style={{ color: 'var(--text-primary)' }}>
              {completed} / {target}
            </p>
          </div>
        </div>

        {/* Horizontal Progress Bar */}
        <div className="flex items-center gap-3">
          <div className="flex-1 h-2.5 rounded-full overflow-hidden" style={{ background: 'var(--bg-primary)' }}>
            <motion.div
              className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${percentage}%` }}
              transition={{ duration: 1, delay: 0.2 }}
            />
          </div>
          <span className="text-xs font-bold w-8 text-right" style={{ color: 'var(--text-secondary)' }}>
            {percentage}%
          </span>
        </div>
      </div>
      
      {/* Decorative stars */}
      <div className="absolute top-8 right-12 text-yellow-500/20 text-4xl hidden lg:block">✧</div>
      <div className="absolute bottom-12 right-24 text-indigo-500/20 text-2xl hidden lg:block">✦</div>
    </div>
  );
}
