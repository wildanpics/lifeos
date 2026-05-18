'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useAppStore } from '@/store/useAppStore';
import { getRecentStats } from '@/lib/firebase/firestore';
import { DailyStats } from '@/types/user';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  LineChart, Line, ScatterChart, Scatter, CartesianGrid, Legend,
} from 'recharts';
import { BarChart3, TrendingUp, Moon, Brain } from 'lucide-react';
import { AIInsights } from '@/components/dashboard/AIInsights';

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-xl px-3 py-2 text-xs shadow-lg" style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}>
      <p className="font-semibold mb-1" style={{ color: 'var(--text-primary)' }}>{label}</p>
      {payload.map((p: any) => (
        <p key={p.name} style={{ color: p.color }}>{p.name}: {p.value}</p>
      ))}
    </div>
  );
};

export default function AnalyticsPage() {
  const { user, theme } = useAppStore();
  const [stats, setStats] = useState<DailyStats[]>([]);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState<7 | 14 | 30>(7);

  useEffect(() => {
    if (!user) return;
    setLoading(true);
    getRecentStats(user.uid, period).then((data) => {
      setStats(data.reverse());
      setLoading(false);
    }).catch(() => setLoading(false));
  }, [user, period]);

  const chartData = stats.map((s) => ({
    date: s.date.slice(5), // MM-DD
    habits: s.completedHabits?.length || 0,
    focus: Math.round((s.focusMinutes || 0) / 6) / 10, // hours
    sleep: s.sleepHours || 0,
    xp: s.xpEarned || 0,
    mood: s.mood || 0,
    screen: Math.round((s.screenTimeMinutes || 0) / 60 * 10) / 10,
  }));

  const avgXP = chartData.length ? Math.round(chartData.reduce((a, b) => a + b.xp, 0) / chartData.length) : 0;
  const avgSleep = chartData.length ? Math.round(chartData.reduce((a, b) => a + b.sleep, 0) / chartData.length * 10) / 10 : 0;
  const avgFocus = chartData.length ? Math.round(chartData.reduce((a, b) => a + b.focus, 0) / chartData.length * 10) / 10 : 0;
  const habitRate = chartData.length ? Math.round(chartData.reduce((a, b) => a + b.habits, 0) / chartData.length) : 0;

  return (
    <div className="space-y-5">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-xl font-bold flex items-center gap-2" style={{ color: 'var(--text-primary)' }}>
            <BarChart3 className="w-5 h-5 text-indigo-500" />
            Analitik
          </h1>
          <p className="text-sm" style={{ color: 'var(--text-muted)' }}>Pantau tren dan pola hidupmu.</p>
        </div>
        <div className="flex gap-1 rounded-xl p-1" style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}>
          {([7, 14, 30] as const).map((d) => (
            <button key={d} onClick={() => setPeriod(d)}
              className="px-2.5 py-1 rounded-lg text-xs font-medium transition-all"
              style={{ background: period === d ? 'var(--accent)' : 'transparent', color: period === d ? 'white' : 'var(--text-muted)' }}>
              {d}h
            </button>
          ))}
        </div>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { icon: BarChart3, label: 'Avg XP/hari', value: `${avgXP} XP`, color: '#6366F1' },
          { icon: Moon, label: 'Avg Tidur', value: `${avgSleep}h`, color: '#8B5CF6' },
          { icon: TrendingUp, label: 'Avg Fokus', value: `${avgFocus}h`, color: '#10B981' },
          { icon: Brain, label: 'Avg Habit', value: `${habitRate}/hari`, color: '#F59E0B' },
        ].map((s, i) => (
          <motion.div key={i} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.08 }} className="card">
            <s.icon className="w-4 h-4 mb-2" style={{ color: s.color }} />
            <p className="text-lg font-bold" style={{ color: 'var(--text-primary)' }}>{s.value}</p>
            <p className="text-[10px]" style={{ color: 'var(--text-muted)' }}>{s.label}</p>
          </motion.div>
        ))}
      </div>

      {/* AI Smart Correlation Insights Panel */}
      {!loading && stats.length > 0 && (
        <AIInsights stats={stats} theme={theme} />
      )}

      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => <div key={i} className="skeleton h-48 rounded-2xl" />)}
        </div>
      ) : chartData.length === 0 ? (
        <div className="card text-center py-12">
          <p className="text-3xl mb-2">📈</p>
          <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
            Mulai track kebiasaan untuk melihat analitik!
          </p>
        </div>
      ) : (
        <>
          {/* XP & Habits bar chart */}
          <div className="card">
            <p className="text-sm font-semibold mb-4" style={{ color: 'var(--text-primary)' }}>⚡ XP & Habit Harian</p>
            <ResponsiveContainer width="100%" height={180}>
              <BarChart data={chartData} barGap={2}>
                <XAxis dataKey="date" tick={{ fontSize: 10, fill: 'var(--text-muted)' }} axisLine={false} tickLine={false} />
                <YAxis hide />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="xp" name="XP" fill="#6366F1" radius={[4, 4, 0, 0]} />
                <Bar dataKey="habits" name="Habit" fill="#10B981" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Sleep chart */}
          <div className="card">
            <p className="text-sm font-semibold mb-4" style={{ color: 'var(--text-primary)' }}>😴 Durasi Tidur</p>
            <ResponsiveContainer width="100%" height={150}>
              <LineChart data={chartData}>
                <XAxis dataKey="date" tick={{ fontSize: 10, fill: 'var(--text-muted)' }} axisLine={false} tickLine={false} />
                <YAxis domain={[0, 10]} hide />
                <Tooltip content={<CustomTooltip />} />
                <Line type="monotone" dataKey="sleep" name="Tidur (jam)" stroke="#8B5CF6" strokeWidth={2}
                  dot={{ fill: '#8B5CF6', r: 3 }} activeDot={{ r: 5 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Mood vs Focus scatter */}
          <div className="card">
            <p className="text-sm font-semibold mb-4" style={{ color: 'var(--text-primary)' }}>😊 Mood vs Fokus</p>
            <ResponsiveContainer width="100%" height={160}>
              <ScatterChart>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                <XAxis dataKey="mood" name="Mood" domain={[1, 5]} tick={{ fontSize: 10, fill: 'var(--text-muted)' }} label={{ value: 'Mood', position: 'bottom', fontSize: 10 }} />
                <YAxis dataKey="focus" name="Fokus (h)" tick={{ fontSize: 10, fill: 'var(--text-muted)' }} />
                <Tooltip cursor={{ strokeDasharray: '3 3' }} content={<CustomTooltip />} />
                <Scatter data={chartData} fill="#EC4899" />
              </ScatterChart>
            </ResponsiveContainer>
          </div>
        </>
      )}
    </div>
  );
}
