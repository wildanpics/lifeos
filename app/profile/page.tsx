'use client';

import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { useAppStore } from '@/store/useAppStore';
import { signOutUser } from '@/lib/firebase/auth';
import { getLevelFromXP, getProgressToNextLevel, getXPToNextLevel } from '@/lib/constants/levels';
import { CitySelectorModal } from '@/components/profile/CitySelectorModal';
import { useState } from 'react';
import { Sun, Moon, LogOut, MapPin, Star, Zap, Shield, User, ChevronRight } from 'lucide-react';

export default function ProfilePage() {
  const { user, totalXP, todayStats, theme, toggleTheme, setUser } = useAppStore();
  const router = useRouter();
  const level = getLevelFromXP(totalXP);
  const progress = getProgressToNextLevel(totalXP);
  const xpToNext = getXPToNextLevel(totalXP);
  const [isCityModalOpen, setIsCityModalOpen] = useState(false);
  const { prayerCityName } = useAppStore();
  const [avatarError, setAvatarError] = useState(false);

  const handleSignOut = async () => {
    await signOutUser();
    setUser(null);
    router.replace('/login');
  };

  const completedToday = todayStats?.completedHabits?.length || 0;
  const waterToday = todayStats?.waterGlasses || 0;
  const focusToday = todayStats?.focusMinutes || 0;

  return (
    <div className="space-y-4">
      {/* Profile Header */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="card text-center py-6">
        <div className="w-20 h-20 rounded-2xl overflow-hidden mx-auto mb-3 flex items-center justify-center"
          style={{ background: 'linear-gradient(135deg, #6366F1, #8B5CF6)' }}>
          {user?.photoURL && !avatarError ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img 
              src={user.photoURL} 
              alt="Avatar" 
              className="w-full h-full object-cover" 
              referrerPolicy="no-referrer"
              onError={() => setAvatarError(true)}
            />
          ) : (
            <span className="text-white text-3xl font-bold">{user?.displayName?.charAt(0) || 'U'}</span>
          )}
        </div>
        <h2 className="text-lg font-bold" style={{ color: 'var(--text-primary)' }}>{user?.displayName}</h2>
        <p className="text-sm" style={{ color: 'var(--text-muted)' }}>{user?.email}</p>

        {/* Level badge */}
        <div className="inline-flex items-center gap-2 mt-3 px-4 py-2 rounded-full"
          style={{ background: `${level.color}20`, border: `1px solid ${level.color}40` }}>
          <level.icon className="w-4 h-4" style={{ color: level.color }} />
          <span className="font-bold text-sm" style={{ color: level.color }}>
            Lv.{level.level} — {level.titleId}
          </span>
        </div>

        {/* XP bar */}
        <div className="mt-4 px-4">
          <div className="flex justify-between text-xs mb-1" style={{ color: 'var(--text-muted)' }}>
            <span>{totalXP.toLocaleString()} XP</span>
            <span>{xpToNext > 0 ? `${xpToNext} XP to Lv.${level.level + 1}` : '⚡ MAX'}</span>
          </div>
          <div className="xp-bar-container">
            <motion.div className="xp-bar-fill" initial={{ width: 0 }} animate={{ width: `${progress}%` }}
              transition={{ duration: 1 }} style={{ background: `linear-gradient(90deg, ${level.color}, ${level.color}99)` }} />
          </div>
        </div>
      </motion.div>

      {/* Today's Summary */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
        <h3 className="text-sm font-semibold mb-2" style={{ color: 'var(--text-secondary)' }}>📊 Hari Ini</h3>
        <div className="grid grid-cols-3 gap-2">
          {[
            { label: 'Habit', value: completedToday, icon: '✅', color: '#10B981' },
            { label: 'Air', value: `${waterToday}/8`, icon: '💧', color: '#3B82F6' },
            { label: 'Fokus', value: `${focusToday}m`, icon: '🎯', color: '#6366F1' },
          ].map((s, i) => (
            <div key={i} className="card text-center py-3">
              <span className="text-xl">{s.icon}</span>
              <p className="text-base font-bold mt-1" style={{ color: s.color }}>{s.value}</p>
              <p className="text-[10px]" style={{ color: 'var(--text-muted)' }}>{s.label}</p>
            </div>
          ))}
        </div>
      </motion.div>

      {/* Settings */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}>
        <h3 className="text-sm font-semibold mb-2" style={{ color: 'var(--text-secondary)' }}>⚙️ Pengaturan</h3>
        <div className="card space-y-1">
          {/* Theme toggle */}
          <button onClick={toggleTheme}
            className="w-full flex items-center justify-between p-3 rounded-xl transition-all"
            style={{ background: 'var(--bg-secondary)' }}>
            <div className="flex items-center gap-3">
              {theme === 'dark' ? <Sun className="w-4 h-4 text-yellow-400" /> : <Moon className="w-4 h-4" style={{ color: 'var(--accent)' }} />}
              <span className="text-sm" style={{ color: 'var(--text-primary)' }}>
                {theme === 'dark' ? 'Light Mode' : 'Dark Mode'}
              </span>
            </div>
            <div className="w-10 h-5 rounded-full relative transition-all"
              style={{ background: theme === 'dark' ? 'var(--border)' : 'var(--accent)' }}>
              <div className="absolute top-0.5 w-4 h-4 rounded-full bg-white transition-all"
                style={{ left: theme === 'dark' ? '2px' : 'calc(100% - 18px)' }} />
            </div>
          </button>

          {/* City */}
          <button 
            onClick={() => setIsCityModalOpen(true)}
            className="w-full flex items-center justify-between p-3 rounded-xl transition-all" 
            style={{ background: 'var(--bg-secondary)' }}
          >
            <div className="flex items-center gap-3">
              <MapPin className="w-4 h-4" style={{ color: 'var(--accent)' }} />
              <span className="text-sm" style={{ color: 'var(--text-primary)' }}>
                {prayerCityName || 'Pilih Lokasi'}
              </span>
            </div>
            <ChevronRight className="w-4 h-4" style={{ color: 'var(--text-muted)' }} />
          </button>
        </div>
      </motion.div>

      {/* Freelance / Goals */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
        <h3 className="text-sm font-semibold mb-2" style={{ color: 'var(--text-secondary)' }}>🎯 Goals</h3>
        <div className="card space-y-3">
          {[
            { label: 'Upload Pertama di Marketplace', done: false, icon: '🚀' },
            { label: 'Klien Freelance Pertama', done: false, icon: '🤝' },
            { label: 'Streak 7 Hari', done: false, icon: '🔥' },
            { label: 'Naik ke Level 5', done: false, icon: '⚡' },
          ].map((g, i) => (
            <div key={i} className="flex items-center gap-3 p-2.5 rounded-xl"
              style={{ background: 'var(--bg-secondary)', border: `1px solid ${g.done ? 'rgba(16,185,129,0.3)' : 'var(--border)'}` }}>
              <span className="text-base">{g.done ? '✅' : g.icon}</span>
              <span className="text-sm flex-1" style={{ color: g.done ? 'var(--success)' : 'var(--text-primary)', textDecoration: g.done ? 'line-through' : 'none' }}>
                {g.label}
              </span>
            </div>
          ))}
        </div>
      </motion.div>

      {/* Sign Out */}
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.25 }}>
        <button onClick={handleSignOut}
          className="w-full flex items-center justify-center gap-2 py-3 rounded-2xl font-semibold text-sm transition-all"
          style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', color: '#EF4444' }}>
          <LogOut className="w-4 h-4" /> Keluar
        </button>
      </motion.div>

      {/* City Selector Modal */}
      <CitySelectorModal 
        isOpen={isCityModalOpen} 
        onClose={() => setIsCityModalOpen(false)} 
      />
    </div>
  );
}
