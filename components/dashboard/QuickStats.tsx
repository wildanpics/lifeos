'use client';

import { motion } from 'framer-motion';
import { useAppStore } from '@/store/useAppStore';
import { Smile, Moon, Monitor, Timer, Utensils, Droplets } from 'lucide-react';
import { formatDuration } from '@/lib/utils/time';
import { useEffect, useState } from 'react';
import { getRecentStats } from '@/lib/firebase/firestore';
import { DailyStats } from '@/types/user';
import { LineChart, Line, ResponsiveContainer } from 'recharts';
import { QuickStatsModal } from './QuickStatsModal';

export function QuickStats() {
  const { user, todayStats, updateWater, updateMeals } = useAppStore();
  const [history, setHistory] = useState<DailyStats[]>([]);
  const [selectedStat, setSelectedStat] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      getRecentStats(user.uid, 7).then(data => {
        // Reverse so chronological order (left to right)
        setHistory(data.reverse());
      });
    }
  }, [user]);

  const handleStatClick = (dataKey: string) => {
    // Open modal for mood, sleep, screen time, focus
    if (['mood', 'sleepHours', 'screenTimeMinutes', 'focusMinutes'].includes(dataKey)) {
      setSelectedStat(dataKey);
    }
  };
  const stats = [
    {
      icon: Smile,
      labelId: 'Mood',
      value: todayStats?.mood ? ['😔','😕','😐','🙂','😄'][todayStats.mood - 1] : '—',
      sub: todayStats?.mood && todayStats.mood >= 4 ? 'Baik' : 'Normal',
      color: '#EC4899',
      dataKey: 'mood',
      clickable: true
    },
    {
      icon: Moon,
      labelId: 'Tidur',
      value: todayStats?.sleepHours ? `${Math.floor(todayStats.sleepHours)}j ${Math.round((todayStats.sleepHours % 1)*60)}m` : '—',
      sub: todayStats?.sleepHours && todayStats.sleepHours >= 7 ? 'Skor: 82' : 'Skor: 65',
      color: '#8B5CF6',
      dataKey: 'sleepHours',
      clickable: true
    },
    {
      icon: Droplets,
      labelId: 'Hidrasi',
      value: `${todayStats?.waterGlasses || 0}/8`,
      sub: `${Math.round(((todayStats?.waterGlasses || 0) / 8) * 100)}%`,
      color: '#3B82F6',
      dataKey: 'waterGlasses',
      clickable: false
    },
    {
      icon: Utensils,
      labelId: 'Makan',
      value: `${todayStats?.meals || 0}/4`,
      sub: `${Math.round(((todayStats?.meals || 0) / 4) * 100)}%`,
      color: '#F59E0B',
      dataKey: 'meals',
      clickable: false
    },
    {
      icon: Monitor,
      labelId: 'Screen Time',
      value: todayStats?.screenTimeMinutes ? formatDuration(todayStats.screenTimeMinutes) : '—',
      sub: (todayStats?.screenTimeMinutes || 0) < 180 ? 'Normal' : 'Tinggi',
      color: '#EF4444',
      dataKey: 'screenTimeMinutes',
      clickable: true
    },
    {
      icon: Timer,
      labelId: 'Fokus',
      value: todayStats?.focusMinutes ? formatDuration(todayStats.focusMinutes) : '—',
      sub: (todayStats?.focusMinutes || 0) > 60 ? 'Hebat' : 'Sedang',
      color: '#6366F1',
      dataKey: 'focusMinutes',
      clickable: true
    },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
      {stats.map((stat, i) => {
        return (
          <motion.div
            key={stat.labelId}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05, duration: 0.4 }}
            onClick={() => stat.clickable && handleStatClick(stat.dataKey)}
            className={`card p-4 flex flex-col justify-between rounded-xl relative overflow-hidden ${stat.clickable ? 'cursor-pointer hover:bg-white/5 transition-colors' : ''}`}
            style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border)' }}
          >
            {/* Water Fill Effect */}
            {stat.dataKey === 'waterGlasses' && (
              <div 
                className="water-wave-container" 
                style={{ 
                  height: `${((todayStats?.waterGlasses || 0) / 8) * 100}%`,
                  display: (todayStats?.waterGlasses || 0) > 0 ? 'block' : 'none'
                }}
              >
                <div className="water-wave water-wave-bg"></div>
                <div className="water-wave water-wave-2"></div>
                <div className="water-wave water-wave-1"></div>
              </div>
            )}

            {/* Meals Fill Effect */}
            {stat.dataKey === 'meals' && (
              <div 
                className="absolute bottom-0 left-0 right-0 transition-all duration-700 ease-in-out z-0" 
                style={{ 
                  background: 'linear-gradient(180deg, rgba(245, 158, 11, 0.3) 0%, rgba(245, 158, 11, 0.05) 100%)',
                  height: `${((todayStats?.meals || 0) / 4) * 100}%`,
                  borderTop: (todayStats?.meals || 0) > 0 ? '2px solid rgba(245, 158, 11, 0.5)' : 'none'
                }}
              />
            )}
            
            <div className="flex items-center gap-2 mb-3 relative z-10">
              <stat.icon className="w-4 h-4" style={{ color: stat.color }} />
              <span className="text-xs font-medium" style={{ color: 'var(--text-secondary)' }}>
                {stat.labelId}
              </span>
            </div>
            
            <div className="mb-2 relative z-10">
              <p className="text-xl font-bold leading-tight" style={{ color: 'var(--text-primary)' }}>
                {stat.value}
              </p>
              <p className="text-[10px]" style={{ color: 'var(--text-muted)' }}>
                {stat.sub}
              </p>
            </div>

            {/* Sparkline chart */}
            <div className="h-8 w-full mt-2">
              {history.length > 1 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={history}>
                    <Line 
                      type="monotone" 
                      dataKey={stat.dataKey} 
                      stroke={stat.color} 
                      strokeWidth={2} 
                      dot={false}
                      isAnimationActive={true}
                    />
                  </LineChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full w-full flex items-center">
                  <div className="w-full h-[2px] rounded-full" style={{ background: 'var(--border)' }}></div>
                </div>
              )}
            </div>
          </motion.div>
        );
      })}

      <QuickStatsModal 
        isOpen={!!selectedStat} 
        onClose={() => setSelectedStat(null)} 
        dataKey={selectedStat} 
      />
    </div>
  );
}
