'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X, Brain, TrendingUp, TrendingDown, Minus,
  AlertTriangle, CheckCircle2, Info, Moon, Smile, Monitor, Timer
} from 'lucide-react';
import { useAppStore } from '@/store/useAppStore';
import { getRecentStats } from '@/lib/firebase/firestore';
import { DailyStats } from '@/types/user';

interface QuickStatsModalProps {
  isOpen: boolean;
  onClose: () => void;
  dataKey: string | null;
}

// ─── AI Analysis Engine ───────────────────────────────────────────────────────

function analyzeSleep(history: DailyStats[], today: number) {
  const sleepData = history.map(d => d.sleepHours ?? 0).filter(h => h > 0);
  if (sleepData.length === 0) return null;

  const avg = sleepData.reduce((a, b) => a + b, 0) / sleepData.length;
  const max = Math.max(...sleepData);
  const min = Math.min(...sleepData);
  const range = max - min;
  const isUnstable = range > 2.5;
  const isChronicLack = avg < 6.5;
  const todayBad = today > 0 && today < 6;
  const todayGood = today >= 7;

  const insights: { type: 'warning' | 'success' | 'info'; text: string }[] = [];

  if (isUnstable)
    insights.push({ type: 'warning', text: `Pola tidurmu tidak stabil — variansi ${range.toFixed(1)} jam dalam seminggu. Jadwal tidur yang konsisten lebih penting dari durasi total.` });

  if (isChronicLack)
    insights.push({ type: 'warning', text: `Rata-rata tidurmu ${avg.toFixed(1)} jam, di bawah minimum 7 jam. Kurang tidur kronis meningkatkan risiko kognitif dan emosional.` });

  if (!isChronicLack && !isUnstable)
    insights.push({ type: 'success', text: `Pola tidurmu stabil dan memadai! Pertahankan rutinitas tidur saat ini.` });

  if (todayBad)
    insights.push({ type: 'warning', text: `Tidur ${today}j hari ini di bawah ambang batas. Pertimbangkan tidur siang 20 menit untuk recovery.` });

  if (todayGood)
    insights.push({ type: 'success', text: `Tidur ${today}j hari ini optimal. Produktivitas kognitif kamu sedang berada di puncak.` });

  insights.push({ type: 'info', text: `Target ideal: tidur sebelum jam 23:00 dan bangun 07:00. Konsistensi jam tidur lebih berpengaruh dari durasi saja.` });

  return { avg: avg.toFixed(1), max, min, isUnstable, insights };
}

function analyzeMood(history: DailyStats[], today: number) {
  const moodData = history.map(d => d.mood ?? 0).filter(m => m > 0);
  if (moodData.length === 0) return null;

  const avg = moodData.reduce((a, b) => a + b, 0) / moodData.length;
  const lowDays = moodData.filter(m => m <= 2).length;
  const highDays = moodData.filter(m => m >= 4).length;
  const trend = moodData.length >= 2
    ? moodData[moodData.length - 1] - moodData[0]
    : 0;

  const insights: { type: 'warning' | 'success' | 'info'; text: string }[] = [];

  if (lowDays >= 3)
    insights.push({ type: 'warning', text: `${lowDays} dari 7 hari terakhir mood kamu rendah. Pertimbangkan journaling atau olahraga ringan untuk meningkatkan mood.` });

  if (highDays >= 5)
    insights.push({ type: 'success', text: `Kamu dalam kondisi mental yang sangat baik! ${highDays} hari dengan mood positif minggu ini.` });

  if (trend > 1)
    insights.push({ type: 'success', text: `Tren mood kamu sedang naik — ini pertanda kondisi mental yang membaik secara konsisten.` });
  else if (trend < -1)
    insights.push({ type: 'warning', text: `Tren mood kamu menurun dalam seminggu ini. Perhatikan kualitas tidur dan aktivitas sosialmu.` });

  insights.push({ type: 'info', text: `Mood yang stabil berkorelasi kuat dengan tidur cukup, olahraga, dan keterbatasan screen time. Cek pola ini di statistikmu.` });

  return { avg: avg.toFixed(1), lowDays, highDays, trend, insights };
}

function analyzeScreenTime(history: DailyStats[], today: number) {
  const data = history.map(d => d.screenTimeMinutes ?? 0).filter(m => m > 0);
  if (data.length === 0) return null;

  const avg = data.reduce((a, b) => a + b, 0) / data.length;
  const overLimitDays = data.filter(m => m > 180).length;
  const todayOver = today > 180;
  const todayFmt = `${Math.floor(today / 60)}j ${today % 60}m`;
  const avgFmt = `${Math.floor(avg / 60)}j ${Math.round(avg % 60)}m`;

  const insights: { type: 'warning' | 'success' | 'info'; text: string }[] = [];

  if (overLimitDays >= 4)
    insights.push({ type: 'warning', text: `${overLimitDays} dari 7 hari terakhir screen time melebihi 3 jam. Ini berkorelasi dengan kualitas tidur yang buruk.` });

  if (todayOver)
    insights.push({ type: 'warning', text: `Screen time hari ini ${todayFmt} — melebihi batas sehat 3 jam. Coba aktifkan mode grayscale setelah jam 21:00.` });

  if (!todayOver && today > 0)
    insights.push({ type: 'success', text: `Screen time hari ini ${todayFmt} masih dalam batas sehat. Bagus!` });

  insights.push({ type: 'info', text: `Rata-rata mingguan: ${avgFmt}. Idealnya di bawah 3 jam/hari. Screen time tinggi di malam hari mengganggu produksi melatonin.` });

  return { avg: avgFmt, overLimitDays, todayOver, insights };
}

function analyzeFocus(history: DailyStats[], today: number) {
  const data = history.map(d => d.focusMinutes ?? 0).filter(m => m > 0);
  if (data.length === 0 && today === 0) return null;

  const all = [...data, today].filter(m => m > 0);
  const avg = all.length > 0 ? all.reduce((a, b) => a + b, 0) / all.length : 0;
  const best = Math.max(...all, 0);
  const isRecord = today > 0 && today >= best;
  const goodDays = data.filter(m => m >= 60).length;

  const insights: { type: 'warning' | 'success' | 'info'; text: string }[] = [];

  if (isRecord && today > 0)
    insights.push({ type: 'success', text: `🏆 Kamu baru saja memecahkan rekor fokus! ${today} menit hari ini — pencapaian terbaikmu.` });

  if (goodDays >= 5)
    insights.push({ type: 'success', text: `${goodDays} dari 7 hari terakhir kamu fokus lebih dari 1 jam. Konsistensi yang luar biasa!` });
  else if (goodDays <= 2 && data.length >= 4)
    insights.push({ type: 'warning', text: `Hanya ${goodDays} hari fokus produktif minggu ini. Coba sesi Pomodoro 25 menit untuk membangun kebiasaan.` });

  insights.push({ type: 'info', text: `Rata-rata fokusmu: ${Math.round(avg)} menit/hari. Target ideal 90-120 menit deep work per hari untuk produktivitas optimal.` });

  return { avg: Math.round(avg), best, goodDays, isRecord, insights };
}

// ─── Sub-components ───────────────────────────────────────────────────────────

const INSIGHT_STYLES = {
  warning: { bg: 'rgba(245,158,11,0.08)', border: 'rgba(245,158,11,0.3)', icon: AlertTriangle, color: '#F59E0B' },
  success: { bg: 'rgba(16,185,129,0.08)', border: 'rgba(16,185,129,0.3)', icon: CheckCircle2, color: '#10B981' },
  info:    { bg: 'rgba(99,102,241,0.08)', border: 'rgba(99,102,241,0.25)', icon: Info, color: '#6366F1' },
} as const;

function InsightCard({ type, text }: { type: keyof typeof INSIGHT_STYLES; text: string }) {
  const s = INSIGHT_STYLES[type];
  const Icon = s.icon;
  return (
    <div
      className="flex gap-2.5 p-3 rounded-xl text-xs leading-relaxed"
      style={{ background: s.bg, border: `1px solid ${s.border}` }}
    >
      <Icon className="w-4 h-4 flex-shrink-0 mt-0.5" style={{ color: s.color }} />
      <span style={{ color: 'var(--text-secondary)' }}>{text}</span>
    </div>
  );
}

function MiniHistoryBar({ history, dataKey, color }: { history: DailyStats[]; dataKey: string; color: string }) {
  const vals = history.slice(-7).map(d => (d as any)[dataKey] ?? 0);
  const max = Math.max(...vals, 1);
  const days = ['S','S','R','K','J','S','M'];
  const today = new Date().getDay(); // 0=Sun

  return (
    <div className="flex items-end gap-1 h-14">
      {vals.map((v, i) => {
        const pct = (v / max) * 100;
        const dayIdx = (today - (vals.length - 1 - i) + 7) % 7;
        return (
          <div key={i} className="flex-1 flex flex-col items-center gap-1">
            <div className="w-full rounded-t-sm relative" style={{ height: '40px', background: 'var(--border)' }}>
              <motion.div
                className="absolute bottom-0 left-0 right-0 rounded-t-sm"
                style={{ background: color, opacity: i === vals.length - 1 ? 1 : 0.6 }}
                initial={{ height: 0 }}
                animate={{ height: `${pct}%` }}
                transition={{ duration: 0.5, delay: i * 0.05 }}
              />
            </div>
            <span className="text-[9px]" style={{ color: 'var(--text-muted)' }}>
              {days[dayIdx]}
            </span>
          </div>
        );
      })}
    </div>
  );
}

// ─── Main Modal ───────────────────────────────────────────────────────────────

export function QuickStatsModal({ isOpen, onClose, dataKey }: QuickStatsModalProps) {
  const {
    todayStats, updateSleep, updateMood, updateScreenTime,
    updateFocusMinutes, isSleeping, sleepStartTime, toggleSleep, user
  } = useAppStore();

  const [value, setValue] = useState('');
  const [tab, setTab] = useState<'input' | 'ai'>('ai');
  const [history, setHistory] = useState<DailyStats[]>([]);

  useEffect(() => {
    if (isOpen && todayStats && dataKey) {
      if (dataKey === 'sleepHours') setValue(todayStats.sleepHours?.toString() || '');
      if (dataKey === 'screenTimeMinutes') setValue(todayStats.screenTimeMinutes?.toString() || '');
      if (dataKey === 'focusMinutes') setValue(todayStats.focusMinutes?.toString() || '');
      setTab('ai');
    }
  }, [isOpen, dataKey, todayStats]);

  useEffect(() => {
    if (isOpen && user) {
      getRecentStats(user.uid, 7).then(data => setHistory(data.reverse()));
    }
  }, [isOpen, user]);

  const handleSave = async () => {
    if (!dataKey) return;
    try {
      const { updateDailyStats } = await import('@/lib/firebase/firestore');
      const { auth } = await import('@/lib/firebase/config');
      const u = auth.currentUser;
      if (!u || !todayStats) return;
      const num = parseFloat(value) || 0;
      if (dataKey === 'sleepHours') { updateSleep(num); await updateDailyStats(u.uid, todayStats.date, { sleepHours: num }); }
      if (dataKey === 'screenTimeMinutes') { updateScreenTime(num); await updateDailyStats(u.uid, todayStats.date, { screenTimeMinutes: num }); }
      if (dataKey === 'focusMinutes') { updateFocusMinutes(num); await updateDailyStats(u.uid, todayStats.date, { focusMinutes: num }); }
      onClose();
    } catch (e) { console.error(e); }
  };

  const handleMoodSelect = async (m: number) => {
    try {
      const { updateDailyStats } = await import('@/lib/firebase/firestore');
      const { auth } = await import('@/lib/firebase/config');
      const u = auth.currentUser;
      if (!u || !todayStats) return;
      updateMood(m);
      await updateDailyStats(u.uid, todayStats.date, { mood: m });
      onClose();
    } catch (e) { console.error(e); }
  };

  const handleSleepToggle = async () => {
    try {
      const { updateDailyStats } = await import('@/lib/firebase/firestore');
      const { auth } = await import('@/lib/firebase/config');
      const u = auth.currentUser;
      if (isSleeping && sleepStartTime) {
        const hours = Math.round(((Date.now() - sleepStartTime) / 3600000) * 10) / 10;
        updateSleep(hours);
        if (u && todayStats) await updateDailyStats(u.uid, todayStats.date, { sleepHours: hours });
      }
      toggleSleep();
      onClose();
    } catch (e) { console.error(e); }
  };

  if (!isOpen || !dataKey) return null;

  const today_sleep  = todayStats?.sleepHours ?? 0;
  const today_mood   = todayStats?.mood ?? 0;
  const today_screen = todayStats?.screenTimeMinutes ?? 0;
  const today_focus  = todayStats?.focusMinutes ?? 0;

  const analysis =
    dataKey === 'sleepHours'       ? analyzeSleep(history, today_sleep) :
    dataKey === 'mood'             ? analyzeMood(history, today_mood) :
    dataKey === 'screenTimeMinutes'? analyzeScreenTime(history, today_screen) :
    dataKey === 'focusMinutes'     ? analyzeFocus(history, today_focus) : null;

  const META: Record<string, { title: string; inputTitle: string; color: string; unit: string; step: string }> = {
    sleepHours:        { title: 'Tidur',       inputTitle: 'Catat Durasi Tidur',   color: '#8B5CF6', unit: 'Jam',   step: '0.5' },
    mood:              { title: 'Mood',         inputTitle: 'Bagaimana Perasaanmu?',color: '#EC4899', unit: '',      step: '1'   },
    screenTimeMinutes: { title: 'Screen Time',  inputTitle: 'Catat Screen Time',    color: '#EF4444', unit: 'Menit', step: '1'   },
    focusMinutes:      { title: 'Fokus',        inputTitle: 'Catat Menit Fokus',    color: '#6366F1', unit: 'Menit', step: '1'   },
  };
  const meta = META[dataKey] ?? { title: '', inputTitle: '', color: '#6366F1', unit: '', step: '1' };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.95, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.95, y: 20 }}
          onClick={e => e.stopPropagation()}
          className="w-full max-w-md rounded-2xl shadow-2xl overflow-hidden"
          style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}
        >
          {/* ── Header ── */}
          <div
            className="flex items-center justify-between px-5 py-4"
            style={{ borderBottom: '1px solid var(--border)' }}
          >
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full" style={{ background: meta.color }} />
              <h3 className="font-bold text-sm" style={{ color: 'var(--text-primary)' }}>
                {meta.title}
              </h3>
            </div>
            <div className="flex items-center gap-2">
              {/* Tab switcher */}
              <div
                className="flex rounded-lg p-0.5 gap-0.5 text-xs font-semibold"
                style={{ background: 'var(--bg-secondary)' }}
              >
                <button
                  onClick={() => setTab('input')}
                  className="px-3 py-1.5 rounded-md transition-all"
                  style={{
                    background: tab === 'input' ? 'var(--bg-card)' : 'transparent',
                    color: tab === 'input' ? 'var(--text-primary)' : 'var(--text-muted)',
                    boxShadow: tab === 'input' ? 'var(--shadow-sm)' : 'none',
                  }}
                >
                  Input
                </button>
                <button
                  onClick={() => setTab('ai')}
                  className="px-3 py-1.5 rounded-md transition-all flex items-center gap-1"
                  style={{
                    background: tab === 'ai' ? 'var(--bg-card)' : 'transparent',
                    color: tab === 'ai' ? meta.color : 'var(--text-muted)',
                    boxShadow: tab === 'ai' ? 'var(--shadow-sm)' : 'none',
                  }}
                >
                  <Brain className="w-3 h-3" /> AI
                </button>
              </div>
              <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-white/10 transition-colors">
                <X className="w-4 h-4" style={{ color: 'var(--text-muted)' }} />
              </button>
            </div>
          </div>

          {/* ── Body ── */}
          <div className="p-5 max-h-[70vh] overflow-y-auto">
            <AnimatePresence mode="wait">

              {/* ── INPUT TAB ── */}
              {tab === 'input' && (
                <motion.div key="input" initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 10 }}>
                  <p className="text-xs font-semibold mb-4" style={{ color: 'var(--text-muted)' }}>
                    {meta.inputTitle}
                  </p>

                  {dataKey === 'mood' && (
                    <div className="grid grid-cols-5 gap-2">
                      {[
                        { icon: '😔', val: 1, label: 'Sangat Buruk', color: '#EF4444' },
                        { icon: '😕', val: 2, label: 'Buruk',        color: '#F97316' },
                        { icon: '😐', val: 3, label: 'Normal',       color: '#EAB308' },
                        { icon: '🙂', val: 4, label: 'Baik',         color: '#22C55E' },
                        { icon: '😄', val: 5, label: 'Sangat Baik',  color: '#10B981' },
                      ].map(m => (
                        <button
                          key={m.val}
                          onClick={() => handleMoodSelect(m.val)}
                          className="flex flex-col items-center p-3 rounded-xl transition-all hover:scale-105"
                          style={{
                            background: todayStats?.mood === m.val ? m.color + '20' : 'var(--bg-secondary)',
                            border: `1.5px solid ${todayStats?.mood === m.val ? m.color : 'var(--border)'}`,
                          }}
                        >
                          <span className="text-2xl mb-1">{m.icon}</span>
                          <span className="text-[9px] font-medium text-center leading-tight" style={{ color: 'var(--text-muted)' }}>
                            {m.label}
                          </span>
                        </button>
                      ))}
                    </div>
                  )}

                  {dataKey === 'sleepHours' && (
                    <div className="space-y-4">
                      <div className="flex items-center gap-3">
                        <input type="number" value={value} onChange={e => setValue(e.target.value)}
                          placeholder="0" min="0" step="0.5" autoFocus
                          className="flex-1 bg-transparent text-2xl font-bold border-b-2 outline-none p-2 text-center"
                          style={{ borderColor: 'var(--border)', color: 'var(--text-primary)' }} />
                        <span className="text-sm font-medium" style={{ color: 'var(--text-muted)' }}>Jam</span>
                      </div>
                      <button onClick={handleSave}
                        className="w-full py-3 rounded-xl font-bold text-white transition-opacity hover:opacity-90"
                        style={{ background: 'linear-gradient(135deg, #8B5CF6, #8B5CF6cc)' }}>
                        Simpan
                      </button>
                    </div>
                  )}

                  {(dataKey === 'screenTimeMinutes' || dataKey === 'focusMinutes') && (
                    <div className="space-y-4">
                      <div className="flex items-center gap-3">
                        <input type="number" value={value} onChange={e => setValue(e.target.value)}
                          placeholder="0" min="0" step="1" autoFocus
                          className="flex-1 bg-transparent text-2xl font-bold border-b-2 outline-none p-2 text-center"
                          style={{ borderColor: 'var(--border)', color: 'var(--text-primary)' }} />
                        <span className="text-sm font-medium" style={{ color: 'var(--text-muted)' }}>{meta.unit}</span>
                      </div>
                      <button onClick={handleSave}
                        className="w-full py-3 rounded-xl font-bold text-white transition-opacity hover:opacity-90"
                        style={{ background: `linear-gradient(135deg, ${meta.color}, ${meta.color}cc)` }}>
                        Simpan
                      </button>
                    </div>
                  )}
                </motion.div>
              )}

              {/* ── AI TAB ── */}
              {tab === 'ai' && (
                <motion.div key="ai" initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -10 }} className="space-y-4">
                  
                  {/* Mini bar chart */}
                  {history.length > 0 && (
                    <div>
                      <p className="text-[10px] font-bold uppercase tracking-widest mb-2" style={{ color: 'var(--text-muted)' }}>
                        7 Hari Terakhir
                      </p>
                      <MiniHistoryBar history={history} dataKey={dataKey} color={meta.color} />
                    </div>
                  )}

                  {/* AI insights */}
                  {analysis ? (
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 mb-3">
                        <Brain className="w-4 h-4" style={{ color: meta.color }} />
                        <p className="text-xs font-bold" style={{ color: 'var(--text-primary)' }}>
                          Analisis AI
                        </p>
                      </div>
                      {analysis.insights.map((ins, i) => (
                        <InsightCard key={i} type={ins.type} text={ins.text} />
                      ))}
                    </div>
                  ) : (
                    <div className="flex flex-col items-center py-8 gap-3">
                      <Brain className="w-10 h-10 opacity-20" style={{ color: meta.color }} />
                      <p className="text-xs text-center" style={{ color: 'var(--text-muted)' }}>
                        Belum ada data yang cukup untuk analisis.<br />Isi data beberapa hari untuk melihat insight AI.
                      </p>
                    </div>
                  )}
                </motion.div>
              )}

            </AnimatePresence>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
