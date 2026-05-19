'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, Calendar, Compass, BarChart2, Bell, CheckCircle2, Circle, 
  Clock, MapPin, Sparkles, Navigation, Info, BellOff,
  Coffee, Sunrise, Sun, Moon
} from 'lucide-react';
import { useAppStore } from '@/store/useAppStore';
import { usePrayer } from '@/lib/hooks/usePrayer';
import { getToday } from '@/lib/utils/time';
import { triggerConfetti } from '@/lib/utils/confetti';
import { cn } from '@/lib/utils';
import type { HabitId } from '@/types/habit';

interface PrayerModalProps {
  isOpen: boolean;
  onClose: () => void;
}

type TabType = 'schedule' | 'extra' | 'stats' | 'settings';

// Helpers to compute extra times safely
function subtractMinutes(timeStr: string, minutes: number): string {
  if (!timeStr) return '';
  const [h, m] = timeStr.split(':').map(Number);
  let totalMin = h * 60 + m - minutes;
  if (totalMin < 0) totalMin += 24 * 60;
  const hours = Math.floor(totalMin / 60);
  const mins = totalMin % 60;
  return `${String(hours).padStart(2, '0')}:${String(mins).padStart(2, '0')}`;
}

function addMinutes(timeStr: string, minutes: number): string {
  if (!timeStr) return '';
  const [h, m] = timeStr.split(':').map(Number);
  let totalMin = h * 60 + m + minutes;
  const hours = Math.floor(totalMin / 60) % 24;
  const mins = totalMin % 60;
  return `${String(hours).padStart(2, '0')}:${String(mins).padStart(2, '0')}`;
}

function calculateTahajjud(maghrib: string, fajr: string): string {
  if (!maghrib || !fajr) return '01:30';
  
  const parseTimeToMinutes = (t: string) => {
    const [h, m] = t.split(':').map(Number);
    return h * 60 + m;
  };
  
  let maghribMin = parseTimeToMinutes(maghrib);
  let fajrMin = parseTimeToMinutes(fajr);
  
  // Fajr is in the next day morning, so add 24 hours
  if (fajrMin < maghribMin) {
    fajrMin += 24 * 60;
  }
  
  const nightDuration = fajrMin - maghribMin;
  const lastThirdStartMin = maghribMin + Math.floor(nightDuration * (2 / 3));
  
  const targetMin = lastThirdStartMin % (24 * 60);
  const hours = Math.floor(targetMin / 60);
  const minutes = targetMin % 60;
  
  return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;
}

export function PrayerModal({ isOpen, onClose }: PrayerModalProps) {
  const { 
    user, 
    todayStats, 
    completeHabit, 
    prayerCityId, 
    prayerCityName,
    prayerAlertsEnabled,
    prayerAlertBeforeMins,
    tahajjudAlertEnabled,
    dhuhaAlertEnabled,
    setPrayerAlertsEnabled,
    setPrayerAlertBeforeMins,
    setTahajjudAlertEnabled,
    setDhuhaAlertEnabled
  } = useAppStore();

  const { schedule } = usePrayer();
  const [activeTab, setActiveTab] = useState<TabType>('schedule');
  
  // Tab 1 state: Monthly prayer schedules
  const [monthlyTimes, setMonthlyTimes] = useState<any[]>([]);
  const [loadingMonthly, setLoadingMonthly] = useState(false);

  // Tab 3 state: History from Firestore
  const [history, setHistory] = useState<any[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(false);

  // Load Monthly Data
  useEffect(() => {
    if (isOpen && activeTab === 'schedule') {
      const fetchMonthly = async () => {
        try {
          setLoadingMonthly(true);
          const response = await fetch(`/api/prayer/monthly?cityId=${prayerCityId}`);
          if (response.ok) {
            const data = await response.json();
            setMonthlyTimes(data.schedule || []);
          }
        } catch (e) {
          console.error(e);
        } finally {
          setLoadingMonthly(false);
        }
      };
      fetchMonthly();
    }
  }, [isOpen, activeTab, prayerCityId]);

  // Load History from Firestore for the last 7 days
  useEffect(() => {
    if (isOpen && activeTab === 'stats' && user) {
      const fetchHistory = async () => {
        try {
          setLoadingHistory(true);
          const { getRecentStats } = await import('@/lib/firebase/firestore');
          const data = await getRecentStats(user.uid, 7);
          // Sort ascending by date
          const sorted = [...(data || [])].sort((a, b) => a.date.localeCompare(b.date));
          setHistory(sorted);
        } catch (e) {
          console.error(e);
        } finally {
          setLoadingHistory(false);
        }
      };
      fetchHistory();
    }
  }, [isOpen, activeTab, user]);

  if (!isOpen) return null;

  // Static clean layout items for 5 daily prayers
  const sholatList = [
    { name: 'Subuh', id: 'prayer_fajr', time: schedule?.prayers.fajr || '--:--', xp: 25 },
    { name: 'Dzuhur', id: 'prayer_dhuhr', time: schedule?.prayers.dhuhr || '--:--', xp: 25 },
    { name: 'Ashar', id: 'prayer_asr', time: schedule?.prayers.asr || '--:--', xp: 25 },
    { name: 'Maghrib', id: 'prayer_maghrib', time: schedule?.prayers.maghrib || '--:--', xp: 25 },
    { name: 'Isya', id: 'prayer_isya', time: schedule?.prayers.isya || '--:--', xp: 25 },
  ];

  // Completion calculation for today
  const completedTodayCount = sholatList.filter(s => todayStats?.completedHabits?.includes(s.id)).length;

  const handleToggleSholat = async (habitId: HabitId, xp: number) => {
    if (!user || todayStats?.completedHabits?.includes(habitId)) return;
    
    // Trigger confetti burst!
    triggerConfetti();
    
    // 1. Zustand Local update
    completeHabit(habitId, xp);
    
    // 2. Sync to Firestore
    try {
      const today = getToday();
      const { logHabit, updateDailyStats, addXP } = await import('@/lib/firebase/firestore');
      
      await logHabit({ habitId, userId: user.uid, date: today, completedAt: new Date(), xpEarned: xp });
      
      const newCompleted = [...(todayStats?.completedHabits || []), habitId];
      const newXp = (todayStats?.xpEarned || 0) + xp;
      await updateDailyStats(user.uid, today, {
        completedHabits: newCompleted,
        xpEarned: newXp
      });
      
      await addXP(user.uid, xp);
    } catch (e) {
      console.error('Failed to save habit completion in Firestore', e);
    }
  };

  // Astronomical Times computations
  const subuhTime = schedule?.prayers.fajr || '04:30';
  const maghribTime = schedule?.prayers.maghrib || '18:00';
  const terbitTime = schedule?.prayers.sunrise || '05:52';

  const imsakTime = subtractMinutes(subuhTime, 10);
  const dhuhaTime = addMinutes(terbitTime, 20);
  const tahajjudTime = calculateTahajjud(maghribTime, subuhTime);

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/75 backdrop-blur-md">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className="w-full max-w-2xl rounded-3xl overflow-hidden shadow-2xl flex flex-col border max-h-[85vh]"
        style={{
          background: 'var(--bg-card)',
          borderColor: 'var(--border)',
        }}
      >
        {/* Modal Header */}
        <div className="p-5 flex items-center justify-between border-b" style={{ borderColor: 'var(--border)' }}>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-500/10 flex items-center justify-center border border-amber-500/25">
              <Compass className="w-5 h-5 text-amber-500" style={{ animation: 'spin 12s linear infinite' }} />
            </div>
            <div>
              <h2 className="text-lg font-extrabold tracking-tight" style={{ color: 'var(--text-primary)' }}>
                Jadwal Sholat Hub
              </h2>
              <div className="flex items-center gap-1.5 text-xs font-semibold" style={{ color: 'var(--accent)' }}>
                <MapPin className="w-3.5 h-3.5" />
                <span>{prayerCityName.replace(/^(KOTA |KAB\. )/i, '')}</span>
              </div>
            </div>
          </div>
          <button 
            onClick={onClose} 
            className="p-2 rounded-xl transition-colors hover:bg-white/5" 
            style={{ color: 'var(--text-secondary)' }}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b overflow-x-auto" style={{ borderColor: 'var(--border)' }}>
          {[
            { id: 'schedule', label: 'Jadwal Bulanan', icon: Calendar },
            { id: 'extra', label: 'Ekstra & Kiblat', icon: Compass },
            { id: 'stats', label: 'Statistik & Tracker', icon: BarChart2 },
            { id: 'settings', label: 'Alarm & Pengingat', icon: Bell },
          ].map((tab) => {
            const Icon = tab.icon;
            const active = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as TabType)}
                className="flex items-center gap-2 px-5 py-3 text-xs font-bold whitespace-nowrap transition-all border-b-2 outline-none flex-1 justify-center"
                style={{
                  color: active ? 'var(--accent)' : 'var(--text-secondary)',
                  borderColor: active ? 'var(--accent)' : 'transparent',
                  background: active ? 'rgba(99,102,241,0.02)' : 'transparent',
                }}
              >
                <Icon className="w-4 h-4 flex-shrink-0" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Tab Content Box */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          <AnimatePresence mode="wait">
            {activeTab === 'schedule' && (
              <motion.div
                key="schedule"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-4"
              >
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-sm font-bold" style={{ color: 'var(--text-primary)' }}>
                    Jadwal Bulanan ({new Date().toLocaleString('id-ID', { month: 'long', year: 'numeric' })})
                  </h3>
                  <span className="text-[10px] px-2 py-0.5 rounded-full font-bold" style={{ background: 'var(--bg-secondary)', color: 'var(--text-muted)' }}>
                    API MyQuran
                  </span>
                </div>

                {loadingMonthly ? (
                  <div className="flex flex-col items-center justify-center py-20 space-y-3">
                    <div className="w-8 h-8 rounded-full border-4 border-dashed animate-spin border-amber-500" />
                    <p className="text-xs" style={{ color: 'var(--text-muted)' }}>Memuat jadwal bulanan...</p>
                  </div>
                ) : monthlyTimes.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-12 text-center space-y-2">
                    <Info className="w-8 h-8 text-amber-500" />
                    <p className="text-xs font-semibold" style={{ color: 'var(--text-secondary)' }}>
                      Gagal memuat jadwal dari server API
                    </p>
                    <p className="text-[10px]" style={{ color: 'var(--text-muted)' }}>
                      Silakan coba lagi nanti atau periksa koneksi internet Anda.
                    </p>
                  </div>
                ) : (
                  <div className="rounded-2xl border overflow-hidden max-h-[350px] overflow-y-auto" style={{ borderColor: 'var(--border)' }}>
                    <table className="w-full text-left text-xs border-collapse">
                      <thead>
                        <tr style={{ background: 'var(--bg-secondary)', color: 'var(--text-secondary)' }}>
                          <th className="p-3 font-extrabold">Tanggal</th>
                          <th className="p-3 font-extrabold text-center">Subuh</th>
                          <th className="p-3 font-extrabold text-center">Dzuhur</th>
                          <th className="p-3 font-extrabold text-center">Ashar</th>
                          <th className="p-3 font-extrabold text-center">Maghrib</th>
                          <th className="p-3 font-extrabold text-center">Isya</th>
                        </tr>
                      </thead>
                      <tbody>
                        {monthlyTimes.map((day, idx) => {
                          // Standardize current date comparison
                          const today = new Date();
                          const todayStr = String(today.getDate()).padStart(2, '0');
                          const isToday = day.tanggal.startsWith(todayStr) || day.date.includes(`-${todayStr}`);
                          
                          return (
                            <tr 
                              key={idx}
                              className={cn(
                                "border-b transition-colors hover:bg-white/5",
                                isToday ? "font-black bg-amber-500/10" : ""
                              )}
                              style={{ 
                                borderColor: 'var(--border)',
                                color: isToday ? '#F59E0B' : 'var(--text-primary)'
                              }}
                            >
                              <td className="p-3 font-semibold">{day.tanggal.split(',')[0]}, {day.tanggal.split(' ')[1]}</td>
                              <td className="p-3 text-center font-medium tabular-nums">{day.fajr}</td>
                              <td className="p-3 text-center font-medium tabular-nums">{day.dhuhr}</td>
                              <td className="p-3 text-center font-medium tabular-nums">{day.asr}</td>
                              <td className="p-3 text-center font-medium tabular-nums">{day.maghrib}</td>
                              <td className="p-3 text-center font-medium tabular-nums">{day.isya}</td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                )}
              </motion.div>
            )}

            {activeTab === 'extra' && (
              <motion.div
                key="extra"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="grid grid-cols-1 md:grid-cols-2 gap-6"
              >
                {/* Sunnah & Extra Times */}
                <div className="space-y-4">
                  <h3 className="text-sm font-bold" style={{ color: 'var(--text-primary)' }}>
                    Waktu Tambahan & Sunnah
                  </h3>
                  
                  <div className="space-y-2.5">
                    {[
                      { name: 'Imsak', time: imsakTime, desc: 'Batas akhir waktu sahur (10m sebelum Subuh)', icon: Coffee, iconColor: '#60A5FA', color: 'rgba(96, 165, 250, 0.1)' },
                      { name: 'Syuruk', time: terbitTime, desc: 'Waktu terbit matahari, batas akhir Subuh', icon: Sunrise, iconColor: '#FBBF24', color: 'rgba(251, 191, 36, 0.1)' },
                      { name: 'Dhuha', time: dhuhaTime, desc: 'Mulai waktu dhuha (+20m dari Syuruk)', icon: Sun, iconColor: '#F59E0B', color: 'rgba(245, 158, 11, 0.1)', id: 'prayer_dhuha', xp: 20 },
                      { name: 'Tahajjud (Malam Akhir)', time: `${tahajjudTime} - ${subuhTime}`, desc: 'Sepertiga malam akhir (Waktu utama Tahajjud)', icon: Moon, iconColor: '#6366F1', color: 'rgba(99, 102, 241, 0.1)', id: 'prayer_tahajjud', xp: 30 },
                    ].map((item, idx) => {
                      const IconComponent = item.icon;
                      const done = item.id ? todayStats?.completedHabits?.includes(item.id) : false;
                      const interactive = !!item.id;
                      
                      return (
                        <div 
                          key={idx}
                          onClick={() => interactive && !done && handleToggleSholat(item.id as HabitId, item.xp || 0)}
                          className={cn(
                            "flex items-center justify-between p-3.5 rounded-2xl border transition-all duration-300",
                            interactive && !done ? "cursor-pointer hover:border-amber-500/40 hover:bg-amber-500/5 active:scale-[0.98]" : "",
                            interactive && done ? "border-green-500/30 bg-green-500/5" : ""
                          )}
                          style={{ 
                            background: interactive && done ? 'rgba(16, 185, 129, 0.05)' : 'var(--bg-secondary)', 
                            borderColor: interactive && done ? 'rgba(16, 185, 129, 0.3)' : 'var(--border)' 
                          }}
                        >
                          <div className="flex items-center gap-3">
                            <span className="p-2 rounded-xl flex items-center justify-center" style={{ background: item.color }}>
                              <IconComponent className="w-5 h-5" style={{ color: item.iconColor }} />
                            </span>
                            <div>
                              <p className="text-xs font-bold" style={{ color: done ? 'var(--success)' : 'var(--text-primary)' }}>
                                {item.name}
                                {item.xp && !done && (
                                  <span className="ml-2 text-[8px] font-extrabold px-1.5 py-0.5 rounded-full bg-indigo-500/10" style={{ color: 'var(--accent)' }}>
                                    +{item.xp} XP
                                  </span>
                                )}
                              </p>
                              <p className="text-[10px]" style={{ color: 'var(--text-muted)' }}>{item.desc}</p>
                            </div>
                          </div>
                          
                          <div className="flex items-center gap-3">
                            <span className="text-sm font-black tabular-nums" style={{ color: done ? 'var(--success)' : 'var(--text-primary)' }}>
                              {item.time}
                            </span>
                            {interactive && (
                              <div className="flex items-center justify-center">
                                {done ? (
                                  <CheckCircle2 className="w-4 h-4 text-green-500" />
                                ) : (
                                  <Circle className="w-4 h-4 text-gray-500 hover:text-amber-500 transition-colors" />
                                )}
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Compass & Qibla */}
                <div className="flex flex-col items-center justify-center p-6 rounded-3xl border" style={{ background: 'var(--bg-secondary)', borderColor: 'var(--border)' }}>
                  <div className="flex items-center gap-2 mb-4">
                    <Navigation className="w-4 h-4 text-amber-500 animate-bounce" />
                    <h3 className="text-xs font-bold" style={{ color: 'var(--text-primary)' }}>
                      Kiblat Barat Laut (~292° - 295°)
                    </h3>
                  </div>

                  {/* Gorgeous Compass SVG Dial pointing at 295 deg */}
                  <div className="relative w-40 h-40 flex items-center justify-center rounded-full border-4 shadow-inner" style={{ borderColor: 'var(--border)', background: 'var(--bg-card)' }}>
                    <svg className="absolute inset-0 w-full h-full transform" viewBox="0 0 100 100">
                      {/* Outer Ring */}
                      <circle cx="50" cy="50" r="45" fill="none" stroke="var(--border)" strokeWidth="1" />
                      
                      {/* Cardinal points */}
                      <text x="50" y="10" textAnchor="middle" fill="#EF4444" fontSize="8" fontWeight="bold">U</text>
                      <text x="90" y="54" textAnchor="middle" fill="var(--text-muted)" fontSize="8" fontWeight="bold">T</text>
                      <text x="50" y="94" textAnchor="middle" fill="var(--text-muted)" fontSize="8" fontWeight="bold">S</text>
                      <text x="10" y="54" textAnchor="middle" fill="var(--text-muted)" fontSize="8" fontWeight="bold">B</text>

                      {/* Tick marks */}
                      {Array.from({ length: 12 }).map((_, i) => {
                        const angle = (i * 30 * Math.PI) / 180;
                        const x1 = 50 + Math.sin(angle) * 38;
                        const y1 = 50 - Math.cos(angle) * 38;
                        const x2 = 50 + Math.sin(angle) * 42;
                        const y2 = 50 - Math.cos(angle) * 42;
                        return (
                          <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} stroke="var(--border)" strokeWidth="1" />
                        );
                      })}

                      {/* Qibla Direction Vector Arrow (approx 293 degrees) */}
                      <g transform="rotate(293, 50, 50)">
                        {/* Golden Arrow Pointer pointing North West */}
                        <line x1="50" y1="50" x2="50" y2="15" stroke="#F59E0B" strokeWidth="2.5" strokeLinecap="round" />
                        <polygon points="50,10 46,18 54,18" fill="#F59E0B" />
                        {/* Kaaba tiny logo at the tip */}
                        <circle cx="50" cy="14" r="2.5" fill="#111" stroke="#F59E0B" strokeWidth="1" />
                      </g>
                    </svg>

                    {/* Compass Center Core Pin */}
                    <div className="w-4 h-4 rounded-full bg-amber-500 border border-white z-10 shadow-lg" />
                  </div>

                  <p className="text-[10px] mt-4 text-center" style={{ color: 'var(--text-muted)' }}>
                    Sudut kiblat berkisar **292°** searah Barat Laut untuk wilayah Indonesia Barat. Hadapkan kompas HP Anda ke derajat ini.
                  </p>
                </div>
              </motion.div>
            )}

            {activeTab === 'stats' && (
              <motion.div
                key="stats"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-6"
              >
                {/* Checklist Tracker */}
                <div className="p-5 rounded-3xl border" style={{ background: 'var(--bg-secondary)', borderColor: 'var(--border)' }}>
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h4 className="text-xs font-extrabold uppercase tracking-widest" style={{ color: 'var(--accent)' }}>
                        Tracker Sholat Hari Ini
                      </h4>
                      <p className="text-[10px]" style={{ color: 'var(--text-muted)' }}>
                        Ketuk sholat yang sudah Anda selesaikan untuk melacak & menambah XP!
                      </p>
                    </div>
                    <span className="text-xs font-black px-2.5 py-1 rounded-xl bg-green-500/10 border border-green-500/20 text-green-500 animate-pulse">
                      {completedTodayCount} / 5 Sholat
                    </span>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                    {sholatList.map((s) => {
                      const done = todayStats?.completedHabits?.includes(s.id) || false;
                      return (
                        <button
                          key={s.id}
                          onClick={() => handleToggleSholat(s.id as HabitId, s.xp)}
                          disabled={done}
                          className={cn(
                            "flex flex-col items-center justify-center p-3 rounded-2xl border text-center transition-all duration-300 relative overflow-hidden active:scale-95 group",
                            done 
                              ? "border-green-500/30 bg-green-500/5" 
                              : "border-gray-500/20 hover:border-amber-500/40 hover:bg-amber-500/5 cursor-pointer"
                          )}
                        >
                          <span className="text-xs font-black" style={{ color: done ? 'var(--success)' : 'var(--text-primary)' }}>
                            {s.name}
                          </span>
                          <span className="text-[10px] font-bold mt-0.5" style={{ color: done ? 'var(--success)' : 'var(--text-muted)' }}>
                            {s.time}
                          </span>
                          
                          <div className="mt-3 flex items-center justify-center">
                            {done ? (
                              <CheckCircle2 className="w-5 h-5 text-green-500" />
                            ) : (
                              <Circle className="w-5 h-5 text-gray-500 group-hover:text-amber-500 transition-colors" />
                            )}
                          </div>

                          <span className="text-[8px] font-extrabold mt-2 px-1.5 py-0.5 rounded-full bg-indigo-500/10" style={{ color: 'var(--accent)' }}>
                            +{s.xp} XP
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* 7 Day History */}
                <div className="space-y-3">
                  <h4 className="text-xs font-bold" style={{ color: 'var(--text-primary)' }}>
                    Riwayat Sholat 7 Hari Terakhir
                  </h4>

                  {loadingHistory ? (
                    <div className="flex flex-col items-center justify-center py-10">
                      <div className="w-6 h-6 rounded-full border-3 border-dashed animate-spin border-indigo-500" />
                      <p className="text-[10px] mt-2" style={{ color: 'var(--text-muted)' }}>Memuat riwayat...</p>
                    </div>
                  ) : history.length === 0 ? (
                    <div className="p-6 text-center border rounded-2xl" style={{ borderColor: 'var(--border)' }}>
                      <p className="text-xs" style={{ color: 'var(--text-muted)' }}>Belum ada log riwayat sholat sebelumnya.</p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-2 sm:grid-cols-7 gap-3">
                      {history.map((day, idx) => {
                        // Count completed sholats on that day
                        const doneCount = sholatList.filter(s => day.completedHabits?.includes(s.id)).length;
                        
                        const dateObj = new Date(day.date);
                        const dayLabel = dateObj.toLocaleDateString('id-ID', { weekday: 'short' });
                        const dateLabel = dateObj.toLocaleDateString('id-ID', { day: 'numeric', month: 'short' });

                        return (
                          <div
                            key={idx}
                            className="p-3 rounded-2xl border text-center flex flex-col items-center justify-center"
                            style={{ 
                              background: 'var(--bg-secondary)', 
                              borderColor: doneCount === 5 ? 'rgba(16, 185, 129, 0.3)' : 'var(--border)'
                            }}
                          >
                            <span className="text-[10px] font-extrabold uppercase" style={{ color: 'var(--text-secondary)' }}>
                              {dayLabel}
                            </span>
                            <span className="text-[8px] font-bold" style={{ color: 'var(--text-muted)' }}>
                              {dateLabel}
                            </span>
                            
                            {/* Stars or score block */}
                            <span className={cn(
                              "text-sm font-black mt-2",
                              doneCount === 5 ? "text-green-500 font-extrabold" : "text-amber-500"
                            )}>
                              {doneCount}/5
                            </span>
                            <span className="text-[8px] font-bold text-gray-500 mt-1 flex items-center justify-center gap-1">
                              {doneCount === 5 ? (
                                <>
                                  <Sparkles className="w-2.5 h-2.5 text-green-500" />
                                  <span>Sempurna</span>
                                </>
                              ) : doneCount > 0 ? (
                                <>
                                  <CheckCircle2 className="w-2.5 h-2.5 text-amber-500" />
                                  <span>Bagus</span>
                                </>
                              ) : (
                                <>
                                  <X className="w-2.5 h-2.5 text-red-500" />
                                  <span>Kosong</span>
                                </>
                              )}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </motion.div>
            )}

            {activeTab === 'settings' && (
              <motion.div
                key="settings"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-4"
              >
                <h3 className="text-sm font-bold" style={{ color: 'var(--text-primary)' }}>
                  Kustomisasi Notifikasi & Alarm
                </h3>

                <div className="space-y-3">
                  {/* Alarm Notifikasi Adzan */}
                  <div className="flex items-center justify-between p-4 rounded-2xl border transition-all" style={{ background: 'var(--bg-secondary)', borderColor: 'var(--border)' }}>
                    <div className="flex items-center gap-3">
                      <span className="p-2 bg-amber-500/10 rounded-xl">
                        {prayerAlertsEnabled ? <Bell className="w-5 h-5 text-amber-500" /> : <BellOff className="w-5 h-5 text-red-500" />}
                      </span>
                      <div>
                        <p className="text-xs font-bold" style={{ color: 'var(--text-primary)' }}>Notifikasi Adzan Wajib</p>
                        <p className="text-[10px]" style={{ color: 'var(--text-muted)' }}>Kirim notifikasi saat waktu sholat mendekat</p>
                      </div>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input 
                        type="checkbox" 
                        checked={prayerAlertsEnabled}
                        onChange={(e) => setPrayerAlertsEnabled(e.target.checked)}
                        className="sr-only peer"
                      />
                      <div className="w-9 h-5 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-amber-500"></div>
                    </label>
                  </div>

                  {/* Alert minutes selection */}
                  {prayerAlertsEnabled && (
                    <motion.div 
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      className="flex items-center justify-between p-4 rounded-2xl border"
                      style={{ background: 'var(--bg-secondary)', borderColor: 'var(--border)' }}
                    >
                      <div className="flex items-center gap-3">
                        <span className="p-2 bg-indigo-500/10 rounded-xl">
                          <Clock className="w-5 h-5 text-indigo-500" />
                        </span>
                        <div>
                          <p className="text-xs font-bold" style={{ color: 'var(--text-primary)' }}>Pengingat Sebelum Adzan</p>
                          <p className="text-[10px]" style={{ color: 'var(--text-muted)' }}>Waktu persiapan berwudhu & bersiap sholat</p>
                        </div>
                      </div>
                      <select
                        value={prayerAlertBeforeMins}
                        onChange={(e) => setPrayerAlertBeforeMins(Number(e.target.value))}
                        className="text-xs font-bold p-2.5 rounded-xl border outline-none cursor-pointer text-white"
                        style={{ background: 'var(--bg-card)', borderColor: 'var(--border)' }}
                      >
                        <option value={5}>5 Menit Sebelum</option>
                        <option value={10}>10 Menit Sebelum</option>
                        <option value={15}>15 Menit Sebelum</option>
                      </select>
                    </motion.div>
                  )}

                  {/* Alarm Tahajjud */}
                  <div className="flex items-center justify-between p-4 rounded-2xl border transition-all" style={{ background: 'var(--bg-secondary)', borderColor: 'var(--border)' }}>
                    <div className="flex items-center gap-3">
                      <span className="p-2 bg-purple-500/10 rounded-xl">
                        <Sparkles className="w-5 h-5 text-purple-500" />
                      </span>
                      <div>
                        <p className="text-xs font-bold" style={{ color: 'var(--text-primary)' }}>Pengingat Sholat Malam (Tahajjud)</p>
                        <p className="text-[10px]" style={{ color: 'var(--text-muted)' }}>Bunyikan alert khusus di sepertiga malam akhir</p>
                      </div>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input 
                        type="checkbox" 
                        checked={tahajjudAlertEnabled}
                        onChange={(e) => setTahajjudAlertEnabled(e.target.checked)}
                        className="sr-only peer"
                      />
                      <div className="w-9 h-5 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-purple-500"></div>
                    </label>
                  </div>

                  {/* Alarm Dhuha */}
                  <div className="flex items-center justify-between p-4 rounded-2xl border transition-all" style={{ background: 'var(--bg-secondary)', borderColor: 'var(--border)' }}>
                    <div className="flex items-center gap-3">
                      <span className="p-2 bg-yellow-500/10 rounded-xl">
                        <Calendar className="w-5 h-5 text-yellow-500" />
                      </span>
                      <div>
                        <p className="text-xs font-bold" style={{ color: 'var(--text-primary)' }}>Pengingat Sholat Dhuha</p>
                        <p className="text-[10px]" style={{ color: 'var(--text-muted)' }}>Kirim pemberitahuan saat masuk waktu sholat Dhuha</p>
                      </div>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input 
                        type="checkbox" 
                        checked={dhuhaAlertEnabled}
                        onChange={(e) => setDhuhaAlertEnabled(e.target.checked)}
                        className="sr-only peer"
                      />
                      <div className="w-9 h-5 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-yellow-500"></div>
                    </label>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  );
}
