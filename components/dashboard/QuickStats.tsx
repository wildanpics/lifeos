'use client';

import { motion } from 'framer-motion';
import { useAppStore } from '@/store/useAppStore';
import { Smile, Moon, Monitor, Timer, Utensils, Droplets, TrendingUp, TrendingDown, Minus, Zap, Trophy, AlertCircle } from 'lucide-react';
import { formatDuration } from '@/lib/utils/time';
import { useEffect, useState } from 'react';
import { getRecentStats } from '@/lib/firebase/firestore';
import { DailyStats } from '@/types/user';
import { QuickStatsModal } from './QuickStatsModal';
import { WaterPhysicsCanvas } from './WaterPhysicsCanvas';

// ─── Micro-insight renderers per stat type ───────────────────────────────────

/** 7-day mood streak dots */
function MoodStreak({ history }: { history: DailyStats[] }) {
  const COLORS: Record<number, string> = {
    1: '#EF4444', 2: '#F97316', 3: '#EAB308', 4: '#22C55E', 5: '#10B981',
  };
  const EMOJIS: Record<number, string> = {
    1: '😔', 2: '😕', 3: '😐', 4: '🙂', 5: '😄',
  };
  const last7 = history.slice(-7);
  if (last7.length === 0) return <p className="text-[10px]" style={{ color: 'var(--text-muted)' }}>Belum ada data</p>;

  return (
    <div className="flex items-center gap-1 flex-wrap">
      {last7.map((d, i) => (
        <div
          key={i}
          title={d.mood ? EMOJIS[d.mood] : '—'}
          className="w-5 h-5 rounded-full flex items-center justify-center text-[10px]"
          style={{
            background: d.mood ? COLORS[d.mood] + '30' : 'var(--border)',
            border: `1.5px solid ${d.mood ? COLORS[d.mood] : 'var(--border)'}`,
          }}
        >
          {d.mood ? EMOJIS[d.mood] : '·'}
        </div>
      ))}
    </div>
  );
}

/** Sleep trend vs yesterday */
function SleepTrend({ history }: { history: DailyStats[] }) {
  const last2 = history.slice(-2);
  const today = last2[last2.length - 1]?.sleepHours ?? 0;
  const yesterday = last2.length >= 2 ? (last2[last2.length - 2]?.sleepHours ?? 0) : null;
  const target = 8;
  const pct = Math.min(100, Math.round((today / target) * 100));

  const delta = yesterday !== null ? today - yesterday : null;
  const quality = today >= 7 ? { label: 'Optimal', color: '#10B981' }
    : today >= 6 ? { label: 'Cukup', color: '#EAB308' }
    : today > 0  ? { label: 'Kurang', color: '#EF4444' }
    : null;

  return (
    <div className="space-y-1.5 w-full">
      {/* Progress bar toward 8h goal */}
      <div className="w-full h-1.5 rounded-full overflow-hidden" style={{ background: 'var(--border)' }}>
        <motion.div
          className="h-full rounded-full"
          style={{ background: 'linear-gradient(90deg, #8B5CF6, #A78BFA)' }}
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
        />
      </div>
      <div className="flex items-center justify-between">
        {quality && (
          <span className="text-[10px] font-bold" style={{ color: quality.color }}>{quality.label}</span>
        )}
        {delta !== null && (
          <span className="flex items-center gap-0.5 text-[10px]" style={{ color: delta >= 0 ? '#10B981' : '#EF4444' }}>
            {delta > 0 ? <TrendingUp className="w-3 h-3" /> : delta < 0 ? <TrendingDown className="w-3 h-3" /> : <Minus className="w-3 h-3" />}
            {delta > 0 ? '+' : ''}{Math.round(delta * 10) / 10}j
          </span>
        )}
      </div>
    </div>
  );
}

/** 4-segment orange bar for meals — mirrors the water segment bar */
function MealSegments({ meals }: { meals: number }) {
  return (
    <div className="flex items-center gap-1">
      {Array.from({ length: 4 }).map((_, i) => (
        <div
          key={i}
          className="flex-1 h-1.5 rounded-full transition-all duration-300"
          style={{ background: i < meals ? '#F97316' : 'var(--border)' }}
        />
      ))}
    </div>
  );
}

/** Screen time arc / danger ring */
function ScreenTimeArc({ minutes }: { minutes: number }) {
  const limit = 180; // 3h limit
  const pct = Math.min(1, minutes / limit);
  const color = pct < 0.5 ? '#10B981' : pct < 0.85 ? '#F59E0B' : '#EF4444';
  const label = pct < 0.5 ? 'Sehat' : pct < 0.85 ? 'Hati-hati' : 'Berlebihan';
  const radius = 14;
  const circumference = 2 * Math.PI * radius;
  const strokeDash = circumference * pct;

  return (
    <div className="flex items-center gap-2">
      <svg width="36" height="36" viewBox="0 0 36 36" className="-rotate-90">
        <circle cx="18" cy="18" r={radius} fill="none" stroke="var(--border)" strokeWidth="3.5" />
        <motion.circle
          cx="18" cy="18" r={radius}
          fill="none" stroke={color} strokeWidth="3.5"
          strokeLinecap="round"
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: circumference - strokeDash }}
          transition={{ duration: 1, ease: 'easeOut' }}
        />
      </svg>
      <span className="text-[10px] font-bold" style={{ color }}>{label}</span>
    </div>
  );
}

/** Focus best record + today vs goal */
function FocusInsight({ history, today }: { history: DailyStats[]; today: number }) {
  const best = Math.max(...history.map(d => d.focusMinutes ?? 0), today);
  const isRecord = today > 0 && today >= best;
  const goal = 60;
  const pct = Math.min(100, Math.round((today / goal) * 100));

  return (
    <div className="space-y-1.5 w-full">
      <div className="w-full h-1.5 rounded-full overflow-hidden" style={{ background: 'var(--border)' }}>
        <motion.div
          className="h-full rounded-full"
          style={{ background: 'linear-gradient(90deg, #6366F1, #818CF8)' }}
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
        />
      </div>
      {isRecord ? (
        <div className="flex items-center gap-1">
          <Trophy className="w-3 h-3 text-amber-400" />
          <span className="text-[10px] font-bold text-amber-400">Rekor hari ini!</span>
        </div>
      ) : (
        <span className="text-[10px]" style={{ color: 'var(--text-muted)' }}>
          {pct}% dari goal {goal}m
        </span>
      )}
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export function QuickStats() {
  const { user, todayStats } = useAppStore();
  const [history, setHistory] = useState<DailyStats[]>([]);
  const [selectedStat, setSelectedStat] = useState<string | null>(null);
  const [tiltAngle, setTiltAngle] = useState(0);

  useEffect(() => {
    const handleOrientation = (e: DeviceOrientationEvent) => {
      if (e.gamma !== null) {
        setTiltAngle(Math.max(-30, Math.min(30, e.gamma)));
      }
    };
    window.addEventListener('deviceorientation', handleOrientation);
    return () => window.removeEventListener('deviceorientation', handleOrientation);
  }, []);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    setTiltAngle(((e.clientX - rect.left) / rect.width - 0.5) * 40);
  };

  useEffect(() => {
    if (user) {
      getRecentStats(user.uid, 7).then(data => setHistory(data.reverse()));
    }
  }, [user]);

  const handleStatClick = (dataKey: string) => {
    if (['mood', 'sleepHours', 'screenTimeMinutes', 'focusMinutes'].includes(dataKey)) {
      setSelectedStat(dataKey);
    }
  };

  const water   = todayStats?.waterGlasses    ?? 0;
  const meals   = todayStats?.meals           ?? 0;
  const screen  = todayStats?.screenTimeMinutes ?? 0;
  const focus   = todayStats?.focusMinutes    ?? 0;
  const mood    = todayStats?.mood            ?? 0;
  const sleep   = todayStats?.sleepHours      ?? 0;

  const stats = [
    {
      icon: Smile, labelId: 'Mood',
      value: mood ? ['😔','😕','😐','🙂','😄'][mood - 1] : '—',
      sub: mood >= 4 ? 'Baik' : mood > 0 ? 'Normal' : 'Belum diisi',
      color: '#EC4899', dataKey: 'mood', clickable: true,
    },
    {
      icon: Moon, labelId: 'Tidur',
      value: sleep ? `${Math.floor(sleep)}j ${Math.round((sleep % 1) * 60)}m` : '—',
      sub: sleep >= 7 ? 'Optimal 😴' : sleep >= 6 ? 'Cukup' : sleep > 0 ? 'Kurang' : 'Belum diisi',
      color: '#8B5CF6', dataKey: 'sleepHours', clickable: true,
    },
    {
      icon: Droplets, labelId: 'Hidrasi',
      value: `${water}/8`,
      sub: `${Math.round((water / 8) * 100)}%`,
      color: '#3B82F6', dataKey: 'waterGlasses', clickable: false,
    },
    {
      icon: Utensils, labelId: 'Makan',
      value: `${meals}/4`,
      sub: meals >= 4 ? 'Lengkap! 😋' : `${4 - meals} porsi lagi`,
      color: '#F59E0B', dataKey: 'meals', clickable: false,
    },
    {
      icon: Monitor, labelId: 'Screen Time',
      value: screen ? formatDuration(screen) : '—',
      sub: screen < 60 ? 'Sangat sehat' : screen < 180 ? 'Normal' : 'Terlalu lama',
      color: '#EF4444', dataKey: 'screenTimeMinutes', clickable: true,
    },
    {
      icon: Timer, labelId: 'Fokus',
      value: focus ? formatDuration(focus) : '—',
      sub: focus > 90 ? 'Luar biasa! ⚡' : focus > 60 ? 'Hebat' : focus > 0 ? 'Sedang' : 'Belum mulai',
      color: '#6366F1', dataKey: 'focusMinutes', clickable: true,
    },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
      {stats.map((stat, i) => (
        <motion.div
          key={stat.labelId}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.06, duration: 0.4 }}
          onClick={() => stat.clickable && handleStatClick(stat.dataKey)}
          onMouseMove={stat.dataKey === 'waterGlasses' ? handleMouseMove : undefined}
          onMouseLeave={stat.dataKey === 'waterGlasses' ? () => setTiltAngle(0) : undefined}
          className={`card p-4 flex flex-col gap-2 rounded-xl relative overflow-hidden min-h-[110px] ${stat.clickable ? 'cursor-pointer hover:bg-white/5 transition-colors' : ''}`}
          style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border)' }}
        >
          {/* ── Water physics layer ── */}
          {stat.dataKey === 'waterGlasses' && water > 0 && (
            <WaterPhysicsCanvas fillPercent={water / 8} tiltAngle={tiltAngle} />
          )}

          {/* ── Meals gradient fill layer ── */}
          {stat.dataKey === 'meals' && (
            <div
              className="absolute bottom-0 left-0 right-0 transition-all duration-700 ease-in-out z-0"
              style={{
                background: 'linear-gradient(180deg, rgba(245,158,11,0.25) 0%, rgba(245,158,11,0.05) 100%)',
                height: `${(meals / 4) * 100}%`,
                borderTop: meals > 0 ? '1.5px solid rgba(245,158,11,0.4)' : 'none',
              }}
            />
          )}

          {/* ── Header ── */}
          <div className="flex items-center gap-2 relative z-10">
            <stat.icon className="w-4 h-4 flex-shrink-0" style={{ color: stat.color }} />
            <span className="text-xs font-medium truncate" style={{ color: 'var(--text-secondary)' }}>
              {stat.labelId}
            </span>
            {stat.clickable && (
              <div className="ml-auto w-1 h-1 rounded-full opacity-40" style={{ background: stat.color }} />
            )}
          </div>

          {/* ── Main value ── */}
          <div className="relative z-10">
            <p className="text-xl font-bold leading-none" style={{ color: 'var(--text-primary)' }}>
              {stat.value}
            </p>
            <p className="text-[10px] mt-0.5" style={{ color: 'var(--text-muted)' }}>
              {stat.sub}
            </p>
          </div>

          {/* ── Contextual micro-insight ── */}
          <div className="relative z-10 mt-auto">
            {stat.dataKey === 'mood' && (
              <MoodStreak history={history} />
            )}
            {stat.dataKey === 'sleepHours' && (
              <SleepTrend history={history} />
            )}
            {stat.dataKey === 'waterGlasses' && (
              <div className="flex items-center gap-1">
                {Array.from({ length: 8 }).map((_, i) => (
                  <div
                    key={i}
                    className="flex-1 h-1.5 rounded-full transition-all duration-300"
                    style={{ background: i < water ? '#60A5FA' : 'var(--border)' }}
                  />
                ))}
              </div>
            )}
            {stat.dataKey === 'meals' && (
              <MealSegments meals={meals} />
            )}
            {stat.dataKey === 'screenTimeMinutes' && (
              <ScreenTimeArc minutes={screen} />
            )}
            {stat.dataKey === 'focusMinutes' && (
              <FocusInsight history={history} today={focus} />
            )}
          </div>
        </motion.div>
      ))}

      <QuickStatsModal
        isOpen={!!selectedStat}
        onClose={() => setSelectedStat(null)}
        dataKey={selectedStat}
      />
    </div>
  );
}
