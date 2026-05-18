'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { X, Flame, Calendar, Trophy, Zap, Info, Brain } from 'lucide-react';
import { useEffect, useState } from 'react';
import { getRecentStats } from '@/lib/firebase/firestore';
import { useAppStore } from '@/store/useAppStore';
import { DailyStats } from '@/types/user';
import { analyzeDopamine, getDopamineColor } from '@/lib/utils/dopamine';

interface DopamineHeatmapModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface HeatmapDay {
  date: string;
  displayDate: string;
  completedCount: number;
  xpEarned: number;
  level: number; // 0 to 4
}

export function DopamineHeatmapModal({ isOpen, onClose }: DopamineHeatmapModalProps) {
  const { user, todayStats, theme } = useAppStore();
  const [history, setHistory] = useState<DailyStats[]>([]);
  const [heatmapData, setHeatmapData] = useState<HeatmapDay[]>([]);
  const [hoveredDay, setHoveredDay] = useState<HeatmapDay | null>(null);
  const [loading, setLoading] = useState(true);

  const dopamineAnalysis = analyzeDopamine(todayStats || {});
  const dopamineColor = getDopamineColor(dopamineAnalysis.status);
  const isDark = theme === 'dark';

  useEffect(() => {
    if (isOpen && user) {
      setLoading(true);
      getRecentStats(user.uid, 90).then(data => {
        setHistory(data);
        
        // Generate last 84 days (12 weeks)
        const days: HeatmapDay[] = [];
        const now = new Date();
        
        for (let i = 83; i >= 0; i--) {
          const d = new Date(now);
          d.setDate(now.getDate() - i);
          const dateStr = d.toISOString().split('T')[0];
          
          const record = data.find(h => h.date === dateStr);
          const completedCount = record?.completedHabits?.length || 0;
          const xpEarned = record?.xpEarned || 0;
          
          let level = 0;
          if (completedCount >= 12) level = 4;
          else if (completedCount >= 8) level = 3;
          else if (completedCount >= 4) level = 2;
          else if (completedCount >= 1) level = 1;

          days.push({
            date: dateStr,
            displayDate: new Intl.DateTimeFormat('id-ID', {
              weekday: 'long',
              day: 'numeric',
              month: 'long',
              year: 'numeric'
            }).format(d),
            completedCount,
            xpEarned,
            level
          });
        }
        
        setHeatmapData(days);
        setLoading(false);
      }).catch(err => {
        console.error("Failed to load heatmap data", err);
        setLoading(false);
      });
    }
  }, [isOpen, user]);

  // Calculations for stats
  const totalCompleted = heatmapData.reduce((acc, curr) => acc + curr.completedCount, 0);
  const activeDays = heatmapData.filter(d => d.completedCount > 0).length;
  const consistencyRate = heatmapData.length > 0 ? Math.round((activeDays / heatmapData.length) * 100) : 0;
  
  // Calculate current streak
  let currentStreak = 0;
  const sortedHistory = [...history].sort((a, b) => b.date.localeCompare(a.date));
  const todayStr = new Date().toISOString().split('T')[0];
  const yesterdayStr = new Date(Date.now() - 86400000).toISOString().split('T')[0];

  let hasStreak = false;
  if (sortedHistory.length > 0) {
    const latest = sortedHistory[0];
    if (latest.date === todayStr || latest.date === yesterdayStr) {
      hasStreak = true;
    }
  }

  if (hasStreak) {
    for (let i = 0; i < sortedHistory.length; i++) {
      const day = sortedHistory[i];
      if (day.completedHabits && day.completedHabits.length > 0) {
        currentStreak++;
      } else {
        break;
      }
    }
  }

  // Color mapping helper
  const getCellColor = (level: number) => {
    switch (level) {
      case 4: return 'rgba(16, 185, 129, 0.95)'; // Neon Green/Emerald
      case 3: return 'rgba(16, 185, 129, 0.65)';
      case 2: return 'rgba(16, 185, 129, 0.4)';
      case 1: return 'rgba(16, 185, 129, 0.18)';
      default: return isDark ? 'rgba(255, 255, 255, 0.03)' : 'rgba(0, 0, 0, 0.05)'; // Dark vs Light empty grid background
    }
  };

  const getCellGlow = (level: number) => {
    if (level === 4) return isDark ? '0 0 10px rgba(16, 185, 129, 0.6)' : '0 0 4px rgba(16, 185, 129, 0.3)';
    if (level === 3) return isDark ? '0 0 6px rgba(16, 185, 129, 0.3)' : 'none';
    return 'none';
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/60 backdrop-blur-xs"
          />

          {/* Modal Container */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="w-full max-w-xl rounded-2xl relative overflow-hidden shadow-2xl z-10 border transition-all duration-300"
            style={{
              background: isDark ? 'rgba(15, 23, 42, 0.95)' : 'rgba(255, 255, 255, 0.98)',
              borderColor: isDark ? `${dopamineColor}40` : `${dopamineColor}30`,
              boxShadow: isDark 
                ? `0 10px 40px -10px ${dopamineColor}25` 
                : `0 10px 40px -10px rgba(0, 0, 0, 0.08)`
            }}
          >
            {/* Background glowing gradient (only active in dark mode) */}
            {isDark && (
              <>
                <div 
                  className="absolute -top-24 -left-24 w-48 h-48 rounded-full blur-3xl opacity-20 pointer-events-none"
                  style={{ background: dopamineColor }}
                />
                <div 
                  className="absolute -bottom-24 -right-24 w-48 h-48 rounded-full blur-3xl opacity-10 pointer-events-none"
                  style={{ background: '#3B82F6' }}
                />
              </>
            )}

            {/* Header */}
            <div className="flex items-start justify-between p-5 pb-3 border-b transition-colors duration-300" style={{ borderColor: isDark ? 'var(--border)' : '#e2e8f0' }}>
              <div className="flex items-center gap-3">
                <div 
                  className="w-10 h-10 rounded-xl flex items-center justify-center transition-colors duration-300"
                  style={{ 
                    background: isDark ? `${dopamineColor}15` : `${dopamineColor}10`, 
                    border: `1px solid ${dopamineColor}25` 
                  }}
                >
                  <Brain className="w-5 h-5 animate-pulse animate-duration-3000" style={{ color: dopamineColor }} />
                </div>
                <div>
                  <h3 className={`text-base font-bold flex items-center gap-1.5 transition-colors duration-300 ${isDark ? 'text-white' : 'text-slate-800'}`}>
                    🧠 Peta Konsistensi Disiplin
                  </h3>
                  <p className="text-[11px] mt-0.5 transition-colors duration-300" style={{ color: isDark ? 'var(--text-secondary)' : '#64748b' }}>
                    Visualisasi kontribusi habit Anda dalam 12 minggu terakhir.
                  </p>
                </div>
              </div>
              <button 
                onClick={onClose}
                className="p-1.5 rounded-lg transition-colors hover:bg-black/5 hover:dark:bg-white/5"
                style={{ color: 'var(--text-muted)' }}
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Content body */}
            <div className="p-5 space-y-5">
              {loading ? (
                <div className="py-12 flex flex-col items-center justify-center gap-3">
                  <div className="w-8 h-8 border-4 border-emerald-500/20 border-t-emerald-500 rounded-full animate-spin"></div>
                  <span className="text-xs" style={{ color: 'var(--text-muted)' }}>Menganalisis histori habit...</span>
                </div>
              ) : (
                <>
                  {/* Summary Stats Row */}
                  <div className="grid grid-cols-3 gap-3">
                    <div 
                      className="p-3 rounded-xl border flex flex-col items-center justify-center text-center transition-colors duration-300"
                      style={{ 
                        background: isDark ? 'var(--bg-secondary)' : '#f8fafc', 
                        borderColor: isDark ? 'var(--border)' : '#e2e8f0' 
                      }}
                    >
                      <Flame className="w-4 h-4 text-orange-400 mb-1" />
                      <span className="text-[10px] transition-colors duration-300" style={{ color: isDark ? 'var(--text-muted)' : '#64748b' }}>Beruntun (Streak)</span>
                      <span className={`text-sm font-bold mt-0.5 transition-colors duration-300 ${isDark ? 'text-white' : 'text-slate-800'}`}>{currentStreak} Hari</span>
                    </div>

                    <div 
                      className="p-3 rounded-xl border flex flex-col items-center justify-center text-center transition-colors duration-300"
                      style={{ 
                        background: isDark ? 'var(--bg-secondary)' : '#f8fafc', 
                        borderColor: isDark ? 'var(--border)' : '#e2e8f0' 
                      }}
                    >
                      <Zap className="w-4 h-4 text-emerald-400 mb-1" />
                      <span className="text-[10px] transition-colors duration-300" style={{ color: isDark ? 'var(--text-muted)' : '#64748b' }}>Konsistensi</span>
                      <span className={`text-sm font-bold mt-0.5 transition-colors duration-300 ${isDark ? 'text-white' : 'text-slate-800'}`}>{consistencyRate}%</span>
                    </div>

                    <div 
                      className="p-3 rounded-xl border flex flex-col items-center justify-center text-center transition-colors duration-300"
                      style={{ 
                        background: isDark ? 'var(--bg-secondary)' : '#f8fafc', 
                        borderColor: isDark ? 'var(--border)' : '#e2e8f0' 
                      }}
                    >
                      <Trophy className="w-4 h-4 text-yellow-400 mb-1" />
                      <span className="text-[10px] transition-colors duration-300" style={{ color: isDark ? 'var(--text-muted)' : '#64748b' }}>Total Selesai</span>
                      <span className={`text-sm font-bold mt-0.5 transition-colors duration-300 ${isDark ? 'text-white' : 'text-slate-800'}`}>{totalCompleted} Habit</span>
                    </div>
                  </div>

                  {/* Heatmap Area */}
                  <div 
                    className="p-4 rounded-xl border relative transition-colors duration-300"
                    style={{ 
                      background: isDark ? 'rgba(15, 23, 42, 0.4)' : '#f8fafc', 
                      borderColor: isDark ? 'var(--border)' : '#e2e8f0' 
                    }}
                  >
                    <div className="flex justify-between items-center mb-3">
                      <span className={`text-[10px] font-bold tracking-wider uppercase flex items-center gap-1 transition-colors duration-300 ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                        <Calendar className="w-3.5 h-3.5" /> Kalender Kontribusi
                      </span>
                      <div className="flex items-center gap-1 text-[10px]" style={{ color: 'var(--text-muted)' }}>
                        <span>Less</span>
                        <div className="w-2.5 h-2.5 rounded-sm" style={{ background: getCellColor(0) }} />
                        <div className="w-2.5 h-2.5 rounded-sm" style={{ background: getCellColor(1) }} />
                        <div className="w-2.5 h-2.5 rounded-sm" style={{ background: getCellColor(2) }} />
                        <div className="w-2.5 h-2.5 rounded-sm" style={{ background: getCellColor(3) }} />
                        <div className="w-2.5 h-2.5 rounded-sm" style={{ background: getCellColor(4) }} />
                        <span>More</span>
                      </div>
                    </div>

                    {/* Grid wrapper */}
                    <div className="flex items-start gap-2 justify-center py-2 overflow-x-auto">
                      {/* Left Labels (Days) */}
                      <div className={`grid grid-rows-7 gap-1.5 text-[9px] font-bold h-[106px] justify-items-end pr-0.5 select-none pt-0.5 transition-colors duration-300 ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
                        <span>Sen</span>
                        <span className="invisible">Sel</span>
                        <span>Rab</span>
                        <span className="invisible">Kam</span>
                        <span>Jum</span>
                        <span className="invisible">Sab</span>
                        <span>Min</span>
                      </div>

                      {/* Heatmap Grid (12 columns, 7 rows) */}
                      <div className="grid grid-flow-col grid-rows-7 gap-1.5">
                        {heatmapData.map((day) => (
                          <motion.div
                            key={day.date}
                            className="w-3.5 h-3.5 rounded-sm cursor-pointer border transition-all duration-300 relative group"
                            style={{
                              background: getCellColor(day.level),
                              boxShadow: getCellGlow(day.level),
                              borderColor: isDark ? 'rgba(15, 23, 42, 0.8)' : 'rgba(255, 255, 255, 0.95)'
                            }}
                            whileHover={{ scale: 1.25, zIndex: 20 }}
                            onMouseEnter={() => setHoveredDay(day)}
                            onMouseLeave={() => setHoveredDay(null)}
                          />
                        ))}
                      </div>
                    </div>

                    {/* Hover Status Display (Bottom of grid) */}
                    <div className={`mt-3 min-h-[32px] border-t pt-2 flex items-center justify-center text-center transition-colors duration-300 ${isDark ? 'border-slate-800/50' : 'border-slate-200'}`}>
                      <AnimatePresence mode="wait">
                        {hoveredDay ? (
                          <motion.div
                            key={hoveredDay.date}
                            initial={{ opacity: 0, y: 5 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -5 }}
                            className="text-[11px] font-medium"
                          >
                            <span className={`font-semibold ${isDark ? 'text-white' : 'text-slate-800'}`}>{hoveredDay.displayDate}</span>
                            <span className={`mx-2 ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>•</span>
                            <span className="text-emerald-500 font-extrabold">{hoveredDay.completedCount} habit selesai</span>
                            {hoveredDay.xpEarned > 0 && (
                              <span className="text-orange-500 font-extrabold ml-1">({hoveredDay.xpEarned} XP)</span>
                            )}
                          </motion.div>
                        ) : (
                          <motion.div
                            key="idle"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 0.5 }}
                            className={`text-[10px] font-medium italic flex items-center gap-1 transition-colors duration-300 ${isDark ? 'text-slate-500' : 'text-slate-400'}`}
                          >
                            <Info className="w-3.5 h-3.5" /> Arahkan kursor / sentuh kotak untuk melihat rincian kontribusi harian
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  </div>

                  {/* Dopamine Motivational Footer Card */}
                  <div 
                    className="p-3.5 rounded-xl border flex items-center gap-3 transition-colors duration-300"
                    style={{
                      background: isDark ? `${dopamineColor}08` : `${dopamineColor}05`,
                      borderColor: isDark ? `${dopamineColor}25` : `${dopamineColor}15`
                    }}
                  >
                    <div className="w-2 h-2 rounded-full animate-ping flex-shrink-0" style={{ background: dopamineColor }} />
                    <p className="text-[10.5px] leading-relaxed transition-colors duration-300" style={{ color: isDark ? 'var(--text-secondary)' : '#475569' }}>
                      <span className={`font-bold transition-colors duration-300 ${isDark ? 'text-white' : 'text-slate-800'}`}>Analisis Dopamine:</span> Status Anda saat ini adalah <span className="font-extrabold" style={{ color: dopamineColor }}>{dopamineAnalysis.messageId}</span>. Pertahankan konsistensi barisan hijau bercahaya di atas untuk mengunci kestabilan fokus mental Anda!
                    </p>
                  </div>
                </>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
