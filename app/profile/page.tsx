'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { useAppStore, CustomGoal } from '@/store/useAppStore';
import { signOutUser } from '@/lib/firebase/auth';
import { playMechanicalClick } from '@/lib/utils/sound';
import { getLevelFromXP, getProgressToNextLevel, getXPToNextLevel, getLevelBadgeStyle } from '@/lib/constants/levels';
import { CitySelectorModal } from '@/components/profile/CitySelectorModal';
import { useState, useEffect } from 'react';
import { 
  Sun, 
  Moon, 
  LogOut, 
  MapPin, 
  Star, 
  Zap, 
  Shield, 
  User, 
  ChevronRight, 
  Volume2, 
  VolumeX,
  Target, 
  Trophy, 
  Flame, 
  Rocket, 
  Heart,
  CheckCircle2, 
  Circle, 
  Trash2, 
  Search, 
  X, Lock, Gem, Eye, Swords,
  Plus,
  Sparkles,
  Terminal,
  Award,
  Medal,
  Crown,
  Timer,
  Sunrise,
  Droplets,
  Activity,
  Smartphone,
  LockKeyhole,
  HelpCircle
} from 'lucide-react';
import { getAllUserProfiles, PublicUserProfile } from '@/lib/firebase/firestore';
import { ACHIEVEMENTS } from '@/lib/constants/achievements';

const GOAL_ICONS: Record<string, any> = {
  Target,
  Trophy,
  Flame,
  Rocket,
  Star,
  Heart,
  Shield,
  Zap
};

const GOAL_SUGGESTIONS = [
  { label: 'Upload Pertama di Marketplace', iconName: 'Rocket', category: '💼 Produktivitas' },
  { label: 'Klien Freelance Pertama', iconName: 'Trophy', category: '💼 Produktivitas' },
  { label: 'Dana Darurat 1 Bulan', iconName: 'Shield', category: '💼 Produktivitas' },
  { label: 'Streak Olahraga 5 Hari', iconName: 'Flame', category: '💪 Kesehatan' },
  { label: 'Tidur Sebelum 22:30 selama 7 Hari', iconName: 'Heart', category: '💪 Kesehatan' },
  { label: 'Bebas Gula 3 Hari', iconName: 'Zap', category: '💪 Kesehatan' },
  { label: 'Membaca 5 Buku', iconName: 'Target', category: '📚 Belajar' },
  { label: 'Selesaikan 1 Kursus Online', iconName: 'Star', category: '📚 Belajar' },
  { label: 'Sholat Dhuha 7 Hari', iconName: 'Zap', category: '🧘 Spiritual' },
  { label: 'Tahajjud 3 Hari Beruntun', iconName: 'Star', category: '🧘 Spiritual' },
];

const getCategoryDetails = (category: string) => {
  switch (category) {
    case 'habit':
      return {
        label: 'Kebiasaan',
        icon: <Activity className="w-3 h-3" />,
        color: '#10B981', // Emerald
        badgeBg: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/10',
        glowColor: 'rgba(16, 185, 129, 0.15)'
      };
    case 'focus':
      return {
        label: 'Fokus',
        icon: <Timer className="w-3 h-3" />,
        color: '#6366F1', // Indigo
        badgeBg: 'bg-indigo-500/10 text-indigo-400 border-indigo-500/10',
        glowColor: 'rgba(99, 102, 241, 0.15)'
      };
    case 'milestone':
      return {
        label: 'Milestone',
        icon: <Zap className="w-3 h-3" />,
        color: '#06B6D4', // Cyan
        badgeBg: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/10',
        glowColor: 'rgba(6, 182, 212, 0.15)'
      };
    case 'special':
    default:
      return {
        label: 'Istimewa',
        icon: <Award className="w-3 h-3" />,
        color: '#F59E0B', // Amber
        badgeBg: 'bg-amber-500/10 text-amber-400 border-amber-500/10',
        glowColor: 'rgba(245, 158, 11, 0.15)'
      };
  }
};

const getAchievementIcon = (id: string, color?: string, sizeClass = "w-6 h-6 stroke-[1.75]") => {
  const defaultColor = (() => {
    switch (id) {
      case 'first_step': return '#ff7a00';
      case 'hydration_master': return '#38bdf8';
      case 'deep_worker': return '#a855f7';
      case 'focus_beast': return '#ef4444';
      case 'morning_champion': return '#eab308';
      case 'mindfulness_master': return '#f43f5e';
      case 'screen_time_slayer': return '#06b6d4';
      case 'loop_breaker': return '#3b82f6';
      case 'completionist': return '#f59e0b';
      case 'veteran': return '#8b5cf6';
      case 'perfect_day': return '#d97706';
      case 'night_owl_no_more': return '#94a3b8';
      default: return '#f59e0b';
    }
  })();
  
  const finalColor = color || defaultColor;

  switch (id) {
    case 'first_step':
      return <Sunrise className={sizeClass} style={{ color: finalColor }} />;
    case 'hydration_master':
      return <Droplets className={sizeClass} style={{ color: finalColor }} />;
    case 'deep_worker':
      return <Target className={sizeClass} style={{ color: finalColor }} />;
    case 'focus_beast':
      return <Flame className={sizeClass} style={{ color: finalColor }} />;
    case 'morning_champion':
      return <Sun className={sizeClass} style={{ color: finalColor }} />;
    case 'mindfulness_master':
      return <Heart className={sizeClass} style={{ color: finalColor }} />;
    case 'screen_time_slayer':
      return <Smartphone className={sizeClass} style={{ color: finalColor }} />;
    case 'loop_breaker':
      return <Shield className={sizeClass} style={{ color: finalColor }} />;
    case 'completionist':
      return <Trophy className={sizeClass} style={{ color: finalColor }} />;
    case 'veteran':
      return <Medal className={sizeClass} style={{ color: finalColor }} />;
    case 'perfect_day':
      return <Crown className={sizeClass} style={{ color: finalColor }} />;
    case 'night_owl_no_more':
      return <Moon className={sizeClass} style={{ color: finalColor }} />;
    default:
      return <Award className={sizeClass} style={{ color: finalColor }} />;
  }
};

const CommunityAvatar = ({ photoURL, displayName, className = "w-11 h-11" }: { photoURL: string | null; displayName: string; className?: string }) => {
  const [hasError, setHasError] = useState(false);

  if (!photoURL || photoURL === 'null' || photoURL === 'undefined' || hasError) {
    const charCodeSum = displayName.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    const hues = [200, 240, 280, 320, 360, 40];
    const hue1 = hues[charCodeSum % hues.length];
    const hue2 = (hue1 + 60) % 360;
    
    return (
      <div 
        className={`${className} rounded-xl flex items-center justify-center flex-shrink-0 text-white font-bold shadow-sm border border-white/10 select-none`}
        style={{ background: `linear-gradient(135deg, hsl(${hue1}, 70%, 50%), hsl(${hue2}, 70%, 45%))` }}
      >
        {displayName.charAt(0).toUpperCase()}
      </div>
    );
  }

  return (
    <div className={`${className} rounded-xl overflow-hidden flex-shrink-0 relative border border-white/5`}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img 
        src={photoURL} 
        alt={displayName} 
        referrerPolicy="no-referrer"
        onError={() => setHasError(true)}
        className="w-full h-full object-cover" 
      />
    </div>
  );
};

export default function ProfilePage() {
  const { 
    user, 
    totalXP, 
    todayStats, 
    theme, 
    toggleTheme, 
    setUser, 
    soundEnabled, 
    setSoundEnabled,
    customGoals,
    addCustomGoal,
    toggleCustomGoal,
    deleteCustomGoal,
    prayerCityName,
    unlockedAchievements,
    disciplineStreak,
    league
  } = useAppStore();

  const router = useRouter();
  const level = getLevelFromXP(totalXP);
  const progress = getProgressToNextLevel(totalXP);
  const xpToNext = getXPToNextLevel(totalXP);
  
  const [activeTab, setActiveTab] = useState<'me' | 'explore'>('me');
  const [isCityModalOpen, setIsCityModalOpen] = useState(false);
  const [avatarError, setAvatarError] = useState(false);

  // Custom Goal Form States
  const [isAddingGoal, setIsAddingGoal] = useState(false);
  const [newGoalLabel, setNewGoalLabel] = useState('');
  const [newGoalIcon, setNewGoalIcon] = useState('Target');

  // Explore Tab States
  const [searchQuery, setSearchQuery] = useState('');
  const [usersList, setUsersList] = useState<PublicUserProfile[]>([]);
  const [isLoadingUsers, setIsLoadingUsers] = useState(false);
  const [selectedUser, setSelectedUser] = useState<PublicUserProfile | null>(null);
  const [profileCardViewMode, setProfileCardViewMode] = useState<'profile' | 'cabinet'>('profile');
  const [profileCardSelectedAchievement, setProfileCardSelectedAchievement] = useState<any | null>(null);
  
  useEffect(() => {
    if (!selectedUser) {
      setProfileCardViewMode('profile');
      setProfileCardSelectedAchievement(null);
    }
  }, [selectedUser]);

  const [exploreError, setExploreError] = useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<{ uid: string; displayName: string } | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [selectedAchievement, setSelectedAchievement] = useState<any | null>(null);
  const [isAchievementsModalOpen, setIsAchievementsModalOpen] = useState(false);
  const [isUserAchievementsModalOpen, setIsUserAchievementsModalOpen] = useState(false);

  // Sync profile when XP, streak, league, or goals change
  useEffect(() => {
    if (user) {
      import('@/lib/firebase/firestore').then(({ syncUserProfile }) => {
        syncUserProfile(user.uid, {
          uid: user.uid,
          displayName: user.displayName || 'Life OS User',
          photoURL: user.photoURL || null,
          totalXP,
          customGoals,
          prayerCityName: prayerCityName || 'Kota Jakarta',
          unlockedAchievements,
          disciplineStreak,
          league
        });
      });
    }
  }, [user, totalXP, customGoals, prayerCityName, unlockedAchievements, disciplineStreak, league]);

  // Fetch users list when switching to explore tab
  useEffect(() => {
    if (activeTab === 'explore') {
      setIsLoadingUsers(true);
      setExploreError(null);
      getAllUserProfiles()
        .then((data) => {
          // Tetap tampilkan kartu jika user adalah developer, selain itu filter keluar diri sendiri
          setUsersList(data.filter(u => u.uid !== user?.uid || u.email === 'mwildanfiqri88@gmail.com'));
        })
        .catch((err: any) => {
          console.error('Failed to load users:', err);
          if (err?.message && err.message.toLowerCase().includes('permission')) {
            setExploreError('permission-denied');
          } else {
            setExploreError('generic-error');
          }
        })
        .finally(() => setIsLoadingUsers(false));
    }
  }, [activeTab, user]);

  const handleDeleteUserClick = (targetUid: string, targetName: string) => {
    setDeleteTarget({ uid: targetUid, displayName: targetName });
  };

  const handleSignOut = async () => {
    await signOutUser();
    setUser(null);
    router.replace('/login');
  };

  const handleCreateGoalSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newGoalLabel.trim()) return;
    addCustomGoal(newGoalLabel.trim(), newGoalIcon);
    setNewGoalLabel('');
    setIsAddingGoal(false);
  };

  const filteredUsers = usersList.filter(u => 
    u.displayName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const completedToday = todayStats?.completedHabits?.length || 0;
  const waterToday = todayStats?.waterGlasses || 0;
  const focusToday = todayStats?.focusMinutes || 0;

  return (
    <div className="space-y-6">
      
      {/* Navigation Tabs */}
      <div className="flex gap-2 p-1.5 rounded-2xl" style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border)' }}>
        <button
          onClick={() => setActiveTab('me')}
          className="flex-1 py-3 px-4 rounded-xl text-sm font-bold transition-all flex items-center justify-center gap-2"
          style={{
            background: activeTab === 'me' ? 'var(--bg-primary)' : 'transparent',
            color: activeTab === 'me' ? 'var(--text-primary)' : 'var(--text-secondary)',
            boxShadow: activeTab === 'me' ? '0 4px 12px rgba(0,0,0,0.1)' : 'none',
            border: activeTab === 'me' ? '1px solid var(--border)' : '1px solid transparent'
          }}
        >
          <User className="w-4 h-4" />
          Profil Saya
        </button>
        <button
          onClick={() => setActiveTab('explore')}
          className="flex-1 py-3 px-4 rounded-xl text-sm font-bold transition-all flex items-center justify-center gap-2"
          style={{
            background: activeTab === 'explore' ? 'var(--bg-primary)' : 'transparent',
            color: activeTab === 'explore' ? 'var(--text-primary)' : 'var(--text-secondary)',
            boxShadow: activeTab === 'explore' ? '0 4px 12px rgba(0,0,0,0.1)' : 'none',
            border: activeTab === 'explore' ? '1px solid var(--border)' : '1px solid transparent'
          }}
        >
          <Search className="w-4 h-4" />
          Eksplor Komunitas
        </button>
      </div>

      {activeTab === 'me' ? (
        <div className="space-y-4">
          
          {/* Profile Header */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="card text-center py-6 relative overflow-hidden">
            {/* Dynamic Background glow of active level */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-64 h-64 rounded-full blur-3xl pointer-events-none opacity-20"
              style={{ background: level.color }} />
            
            <CommunityAvatar 
              photoURL={user?.photoURL || null} 
              displayName={user?.displayName || 'U'} 
              className="w-20 h-20 mx-auto mb-3 relative z-10 text-3xl shadow-lg" 
            />
            
            <h2 className="text-lg font-bold relative z-10" style={{ color: 'var(--text-primary)' }}>
              {user?.displayName}
            </h2>
            <p className="text-sm relative z-10" style={{ color: 'var(--text-secondary)', fontWeight: 500 }}>
              {user?.email}
            </p>

            {/* Level & Gamification Badges */}
            <div className="flex flex-wrap items-center justify-center gap-2 mt-4 relative z-10">
              <span 
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all select-none border"
                style={getLevelBadgeStyle(level.level, level.color)}
              >
                <level.icon className="w-4 h-4 flex-shrink-0" />
                Lv.{level.level} — {level.titleId}
              </span>

              {/* League Badge */}
              <span className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all select-none border ${
                league === 'diamond' 
                  ? 'bg-cyan-500/10 border-cyan-500/30 text-cyan-400' 
                  : league === 'gold' 
                    ? 'bg-yellow-500/10 border-yellow-500/30 text-yellow-400' 
                    : league === 'silver' 
                      ? 'bg-slate-400/10 border-slate-450/30 text-slate-350' 
                      : 'bg-amber-600/10 border-amber-600/30 text-amber-500'
              }`}>
                {league === 'diamond' ? '💎' : league === 'gold' ? '🥇' : league === 'silver' ? '🥈' : '🥉'}
                <span>Liga {league ? league.charAt(0).toUpperCase() + league.slice(1) : 'Bronze'}</span>
              </span>

              {/* Streak Badge */}
              <span className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all select-none border ${
                disciplineStreak >= 7 
                  ? 'bg-orange-500/15 border-orange-500/30 text-orange-400 animate-pulse' 
                  : 'bg-neutral-800/40 border-neutral-750 text-neutral-400'
              }`}>
                🔥 {disciplineStreak || 0} Hari Streak
              </span>

              {/* Multiplier Badge */}
              {disciplineStreak >= 7 && (
                <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest bg-yellow-500/15 border border-yellow-500/35 text-yellow-500 animate-pulse shadow-sm shadow-yellow-500/5 select-none">
                  ⚡ 1.2x XP Aktif
                </span>
              )}
            </div>

            {/* XP bar */}
            <div className="mt-5 px-6 relative z-10">
              <div className="flex justify-between text-xs mb-1.5" style={{ color: 'var(--text-secondary)', fontWeight: 600 }}>
                <span>{totalXP.toLocaleString()} XP</span>
                <span>{xpToNext > 0 ? `${xpToNext} XP menuju Lv.${level.level + 1}` : '⚡ TINGKAT MAKSIMAL'}</span>
              </div>
              <div className="xp-bar-container h-3.5 rounded-full overflow-hidden" style={{ background: 'var(--bg-primary)', border: '1px solid var(--border)' }}>
                <motion.div 
                  className="xp-bar-fill h-full rounded-full" 
                  initial={{ width: 0 }} 
                  animate={{ width: `${progress}%` }}
                  transition={{ duration: 1, ease: 'easeOut' }} 
                  style={{ background: `linear-gradient(90deg, ${level.color}, ${level.color}cc)` }} 
                />
              </div>
            </div>
          </motion.div>

          {/* Today's Summary */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
            <h3 className="text-sm font-bold mb-3 flex items-center gap-2" style={{ color: 'var(--text-secondary)' }}>
              <Sparkles className="w-4 h-4 text-amber-400" /> Hari Ini
            </h3>
            <div className="grid grid-cols-3 gap-3">
              {[
                { label: 'Habit', value: completedToday, icon: CheckCircle2, color: '#10B981', bg: 'rgba(16,185,129,0.08)' },
                { label: 'Air (Gelas)', value: `${waterToday}/8`, icon: Heart, color: '#3B82F6', bg: 'rgba(59,130,246,0.08)' },
                { label: 'Fokus', value: `${focusToday}m`, icon: Target, color: '#8B5CF6', bg: 'rgba(139,92,246,0.08)' },
              ].map((s, i) => (
                <div key={i} className="card text-center py-4 px-2 flex flex-col items-center" style={{ border: `1px solid var(--border)` }}>
                  <div className="w-9 h-9 rounded-xl flex items-center justify-center mb-2" style={{ background: s.bg }}>
                    <s.icon className="w-5 h-5" style={{ color: s.color }} />
                  </div>
                  <p className="text-lg font-extrabold" style={{ color: s.color }}>{s.value}</p>
                  <p className="text-[10px] font-semibold mt-0.5" style={{ color: 'var(--text-secondary)' }}>{s.label}</p>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Achievements (Lemari Piala) Button */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.12 }}>
            <button 
              onClick={() => setIsAchievementsModalOpen(true)}
              className="w-full flex items-center justify-between p-4 rounded-2xl transition-all hover:scale-[1.01] active:scale-[0.99] border relative overflow-hidden group"
              style={{ 
                background: 'linear-gradient(135deg, rgba(245, 158, 11, 0.08) 0%, rgba(251, 191, 36, 0.03) 100%)',
                borderColor: 'rgba(245, 158, 11, 0.25)',
                boxShadow: '0 4px 20px rgba(245, 158, 11, 0.05)'
              }}
            >
              <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-r from-amber-500/10 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
              
              <div className="flex items-center gap-3.5 relative z-10">
                <div className="w-11 h-11 rounded-xl bg-amber-500/15 flex items-center justify-center border border-amber-500/20 shadow-inner group-hover:scale-110 transition-transform duration-300">
                  <Trophy className="w-5.5 h-5.5 text-amber-500" />
                </div>
                <div className="text-left">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-amber-500 flex items-center gap-1">
                    <Sparkles className="w-3 h-3 text-amber-400" /> Koleksi Trofi
                  </span>
                  <h4 className="text-sm font-black text-white mt-0.5">Lemari Piala Saya</h4>
                </div>
              </div>

              <div className="flex items-center gap-2 relative z-10">
                <span className="text-xs font-black text-amber-500 bg-amber-500/10 px-2.5 py-1 rounded-full border border-amber-500/10">
                  {unlockedAchievements.length} / {ACHIEVEMENTS.length}
                </span>
                <ChevronRight className="w-4 h-4 text-amber-500/60 group-hover:translate-x-0.5 transition-transform" />
              </div>
            </button>
          </motion.div>

          {/* Settings Section */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}>
            <h3 className="text-sm font-bold mb-3" style={{ color: 'var(--text-secondary)' }}> Pengaturan</h3>
            <div className="card p-2 space-y-1">
              {/* Theme toggle */}
              <button onClick={toggleTheme}
                className="w-full flex items-center justify-between p-3 rounded-xl transition-all hover:bg-neutral-800/20"
                style={{ background: 'var(--bg-secondary)' }}>
                <div className="flex items-center gap-3">
                  {theme === 'dark' ? <Sun className="w-4 h-4 text-yellow-400" /> : <Moon className="w-4 h-4 text-indigo-400" />}
                  <span className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>
                    {theme === 'dark' ? 'Light Mode' : 'Dark Mode'}
                  </span>
                </div>
                <div className="w-10 h-5 rounded-full relative transition-all"
                  style={{ background: theme === 'dark' ? 'var(--border)' : 'var(--accent)' }}>
                  <div className="absolute top-0.5 w-4 h-4 rounded-full bg-white transition-all shadow-md"
                    style={{ left: theme === 'dark' ? '2px' : 'calc(100% - 18px)' }} />
                </div>
              </button>

              {/* Sound toggle */}
              <button onClick={() => setSoundEnabled(!soundEnabled)}
                className="w-full flex items-center justify-between p-3 rounded-xl transition-all hover:bg-neutral-800/20"
                style={{ background: 'var(--bg-secondary)' }}>
                <div className="flex items-center gap-3">
                  {soundEnabled ? <Volume2 className="w-4 h-4 text-emerald-400" /> : <VolumeX className="w-4 h-4 text-slate-500" />}
                  <span className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>
                    Efek Suara Dopamin
                  </span>
                </div>
                <div className="w-10 h-5 rounded-full relative transition-all"
                  style={{ background: soundEnabled ? 'var(--accent)' : 'var(--border)' }}>
                  <div className="absolute top-0.5 w-4 h-4 rounded-full bg-white transition-all shadow-md"
                    style={{ left: soundEnabled ? 'calc(100% - 18px)' : '2px' }} />
                </div>
              </button>

              {/* City Location */}
              <button 
                onClick={() => setIsCityModalOpen(true)}
                className="w-full flex items-center justify-between p-3 rounded-xl transition-all hover:bg-neutral-800/20" 
                style={{ background: 'var(--bg-secondary)' }}
              >
                <div className="flex items-center gap-3">
                  <MapPin className="w-4 h-4 text-indigo-400" />
                  <span className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>
                    {prayerCityName || 'Pilih Lokasi'}
                  </span>
                </div>
                <ChevronRight className="w-4 h-4" style={{ color: 'var(--text-secondary)' }} />
              </button>
            </div>
          </motion.div>

          {/* Goals Tracker */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-bold" style={{ color: 'var(--text-secondary)' }}>🎯 Goals Disiplin</h3>
              <button 
                onClick={() => setIsAddingGoal(!isAddingGoal)}
                className="text-xs font-bold px-3 py-1.5 rounded-lg flex items-center gap-1 transition-all"
                style={{ 
                  background: 'rgba(99, 102, 241, 0.1)', 
                  border: '1px solid rgba(99, 102, 241, 0.3)', 
                  color: 'var(--accent)' 
                }}
              >
                {isAddingGoal ? <X className="w-3.5 h-3.5" /> : <Plus className="w-3.5 h-3.5" />}
                {isAddingGoal ? 'Batal' : 'Tambah Goal'}
              </button>
            </div>

            {/* Goal Creation Form inline */}
            {isAddingGoal && (
              <motion.form 
                initial={{ opacity: 0, height: 0 }} 
                animate={{ opacity: 1, height: 'auto' }} 
                onSubmit={handleCreateGoalSubmit}
                className="card p-4 mb-4 space-y-3"
                style={{ border: '1px dashed var(--accent)' }}
              >
                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider mb-1.5" style={{ color: 'var(--text-secondary)' }}>
                    Nama Goal
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Contoh: Klien Freelance Pertama..."
                    value={newGoalLabel}
                    onChange={(e) => setNewGoalLabel(e.target.value)}
                    className="w-full p-2.5 rounded-xl text-sm outline-none transition-all"
                    style={{ background: 'var(--bg-primary)', border: '1px solid var(--border)', color: 'var(--text-primary)' }}
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider mb-1.5" style={{ color: 'var(--text-secondary)' }}>
                    Pilih Ikon Premium
                  </label>
                  <div className="grid grid-cols-4 gap-2">
                    {Object.keys(GOAL_ICONS).map((iconName) => {
                      const IconComponent = GOAL_ICONS[iconName];
                      const isSelected = newGoalIcon === iconName;
                      return (
                        <button
                          key={iconName}
                          type="button"
                          onClick={() => setNewGoalIcon(iconName)}
                          className="p-3 rounded-xl flex flex-col items-center gap-1.5 transition-all"
                          style={{
                            background: isSelected ? 'rgba(99,102,241,0.15)' : 'var(--bg-primary)',
                            border: isSelected ? '1.5px solid var(--accent)' : '1px solid var(--border)',
                          }}
                        >
                          <IconComponent className={`w-5 h-5 ${isSelected ? 'text-indigo-400' : 'text-neutral-400'}`} />
                          <span className="text-[9px] font-semibold" style={{ color: isSelected ? 'var(--text-primary)' : 'var(--text-secondary)' }}>
                            {iconName}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                <button 
                  type="submit"
                  className="w-full py-2.5 rounded-xl text-sm font-bold text-white transition-all bg-indigo-600 hover:bg-indigo-500"
                >
                  Simpan Goal
                </button>
              </motion.form>
            )}

            {/* Goals List */}
            <div className="space-y-2.5">
              {customGoals.length === 0 ? (
                /* Empty state */
                <div className="card p-6 text-center space-y-3 flex flex-col items-center">
                  <div className="w-12 h-12 rounded-2xl bg-indigo-500/5 flex items-center justify-center border border-indigo-500/10">
                    <Target className="w-6 h-6 text-indigo-400 animate-pulse" />
                  </div>
                  <div>
                    <p className="text-sm font-bold" style={{ color: 'var(--text-primary)' }}>Belum Ada Goals</p>
                    <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>Ayo mulai target kedisiplinan barumu di bawah ini!</p>
                  </div>
                </div>
              ) : (
                customGoals.map((g) => {
                  const Icon = GOAL_ICONS[g.iconName] || Target;
                  return (
                    <div 
                      key={g.id} 
                      className="flex items-center gap-3 p-3 rounded-xl transition-all group"
                      style={{ 
                        background: 'var(--bg-secondary)', 
                        border: g.done ? '1px solid rgba(16,185,129,0.2)' : '1px solid var(--border)' 
                      }}
                    >
                      <button 
                        onClick={() => toggleCustomGoal(g.id)}
                        className="flex-shrink-0 transition-transform active:scale-95"
                      >
                        {g.done ? (
                          <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                        ) : (
                          <Circle className="w-5 h-5 text-neutral-500 hover:text-indigo-400" />
                        )}
                      </button>

                      <div className="flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center"
                        style={{ background: g.done ? 'rgba(16,185,129,0.06)' : 'rgba(255,255,255,0.03)' }}>
                        <Icon className={`w-4 h-4 ${g.done ? 'text-emerald-400/80' : 'text-indigo-400'}`} />
                      </div>

                      <span 
                        onClick={() => toggleCustomGoal(g.id)}
                        className="text-sm flex-1 cursor-pointer select-none font-medium leading-tight" 
                        style={{ 
                          color: g.done ? 'var(--text-secondary)' : 'var(--text-primary)', 
                          textDecoration: g.done ? 'line-through' : 'none' 
                        }}
                      >
                        {g.label}
                      </span>

                      <button
                        onClick={() => deleteCustomGoal(g.id)}
                        className="opacity-0 group-hover:opacity-100 p-1.5 rounded-lg hover:bg-red-500/10 text-red-400 transition-all flex-shrink-0"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  );
                })
              )}
            </div>

            {/* Recommendation Goals (Suggestions Tray) */}
            <div className="mt-6 card p-4 space-y-3">
              <div className="flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-yellow-400" />
                <h4 className="text-xs font-bold uppercase tracking-wider" style={{ color: 'var(--text-secondary)' }}>
                  Rekomendasi Goals Populer
                </h4>
              </div>

              <div className="grid grid-cols-2 gap-2 max-h-56 overflow-y-auto pr-1">
                {GOAL_SUGGESTIONS.map((sug, idx) => {
                  // Check if user already added this goal to avoid duplicate suggestions
                  const alreadyAdded = customGoals.some(cg => cg.label === sug.label);
                  if (alreadyAdded) return null;

                  const SugIcon = GOAL_ICONS[sug.iconName] || Target;
                  return (
                    <button
                      key={idx}
                      onClick={() => addCustomGoal(sug.label, sug.iconName)}
                      className="p-2.5 rounded-xl text-left transition-all border border-transparent hover:border-indigo-500/30 flex flex-col gap-1.5"
                      style={{ background: 'var(--bg-primary)' }}
                    >
                      <div className="flex items-center gap-1.5">
                        <SugIcon className="w-3.5 h-3.5 text-indigo-400 flex-shrink-0" />
                        <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-md" style={{ background: 'rgba(255,255,255,0.05)', color: 'var(--text-secondary)' }}>
                          {sug.category.split(' ')[1]}
                        </span>
                      </div>
                      <p className="text-xs font-bold leading-tight" style={{ color: 'var(--text-primary)' }}>
                        {sug.label}
                      </p>
                    </button>
                  );
                })}
              </div>
            </div>
          </motion.div>

          {/* Sign Out */}
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.25 }}>
            <button onClick={handleSignOut}
              className="w-full flex items-center justify-center gap-2 py-3 rounded-2xl font-bold text-sm transition-all"
              style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)', color: '#EF4444' }}>
              <LogOut className="w-4 h-4" /> Keluar Akun
            </button>
          </motion.div>

        </div>
      ) : (
        /* Explore Tab */
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
          
          {/* Search bar */}
          <div className="relative flex items-center">
            <Search className="w-5 h-5 absolute left-3 text-neutral-400" />
            <input
              type="text"
              placeholder="Cari pejuang disiplin lain..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-3 rounded-xl text-sm outline-none transition-all"
              style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border)', color: 'var(--text-primary)' }}
            />
            {searchQuery && (
              <button onClick={() => setSearchQuery('')} className="absolute right-3 text-neutral-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {isLoadingUsers ? (
            <div className="py-12 text-center text-sm font-semibold" style={{ color: 'var(--text-secondary)' }}>
              Memuat data komunitas...
            </div>
          ) : exploreError === 'permission-denied' ? (
            <div className="card p-5 space-y-4" style={{ border: '1px solid rgba(239, 68, 68, 0.3)', background: 'rgba(239, 68, 68, 0.05)' }}>
              <div className="flex items-start gap-3">
                <Shield className="w-5 h-5 text-red-400 mt-0.5 flex-shrink-0" />
                <div className="space-y-1">
                  <h4 className="text-sm font-bold text-red-400">Firebase Firestore Permission Denied</h4>
                  <p className="text-xs leading-relaxed text-neutral-300">
                    Fitur Eksplor Komunitas memerlukan izin akses baca publik pada koleksi <code className="bg-neutral-900 px-1 py-0.5 rounded text-red-300">users</code> di Firebase Console Anda agar Anda dapat melihat statistik dan goals kustom pejuang disiplin lainnya.
                  </p>
                </div>
              </div>
              
              <div className="border-t border-red-500/10 my-2" />
              
              <div className="space-y-2">
                <p className="text-[11px] font-bold text-neutral-400 uppercase tracking-wide">Cara Mengaktifkannya:</p>
                <ol className="text-xs list-decimal pl-4 space-y-2 text-neutral-300 leading-normal">
                  <li>Buka <strong>Firebase Console</strong> &gt; pilih proyek Anda.</li>
                  <li>Di menu samping kiri, buka <strong>Cloud Firestore</strong> &gt; pilih tab <strong>Rules</strong>.</li>
                  <li>Ganti Aturan Keamanan Anda dengan kode di bawah ini agar aman dan mendukung komunitas:</li>
                </ol>
                
                <pre className="p-3 rounded-lg text-[10px] bg-neutral-950 border border-neutral-800 text-emerald-400 overflow-x-auto font-mono">
{`rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Cocokkan dokumen user dan semua sub-koleksi di dalamnya secara rekursif
    match /users/{userId}/{document=**} {
      // Izinkan baca publik untuk melihat profil komunitas
      allow read: if request.auth != null;
      
      // Izinkan tulis/hapus jika pemilik dokumen ATAU merupakan Developer (mwildanfiqri88@gmail.com)
      allow write: if request.auth != null && (
        request.auth.uid == userId || 
        request.auth.token.email == 'mwildanfiqri88@gmail.com'
      );
    }
  }
}`}
                </pre>
                
                <p className="text-[10px] text-yellow-400 font-medium">
                  Setelah menyimpan, klik tombol <strong>Publish</strong> di Firebase Console, lalu segarkan halaman ini!
                </p>
              </div>
            </div>
          ) : filteredUsers.length === 0 ? (
            <div className="py-12 text-center text-sm font-semibold" style={{ color: 'var(--text-secondary)' }}>
              Tidak ada pengguna lain ditemukan.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {filteredUsers.map((u) => {
                const userLevel = getLevelFromXP(u.totalXP);
                const isDevCard = u.email === 'mwildanfiqri88@gmail.com';
                const isCurrentUserDev = user?.email === 'mwildanfiqri88@gmail.com';
                
                return (
                  <motion.div 
                    key={u.uid}
                    onClick={() => setSelectedUser(u)}
                    whileHover={{ y: -2 }}
                    className={`card p-4 flex items-center justify-between cursor-pointer transition-all ${
                      isDevCard ? 'hover:bg-violet-950/5' : 'hover:bg-neutral-800/10'
                    }`}
                    style={{ 
                      border: isDevCard ? '1.5px solid rgba(139, 92, 246, 0.7)' : '1px solid var(--border)',
                      background: isDevCard 
                        ? 'linear-gradient(135deg, rgba(139, 92, 246, 0.12), rgba(99, 102, 241, 0.05))' 
                        : 'var(--bg-secondary)',
                      boxShadow: isDevCard ? '0 4px 20px rgba(139, 92, 246, 0.15)' : 'none'
                    }}
                  >
                    <div className="flex items-center gap-3">
                      <CommunityAvatar photoURL={u.photoURL} displayName={u.displayName} className="w-11 h-11" />
                      <div>
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <p className="text-sm font-bold" style={{ color: 'var(--text-primary)' }}>{u.displayName}</p>
                          {isDevCard && (
                            <span className="inline-flex items-center gap-0.5 px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider bg-violet-600/35 text-violet-300 border border-violet-500/30 animate-pulse select-none">
                              <Terminal className="w-2.5 h-2.5 flex-shrink-0" /> Dev Creator
                            </span>
                          )}
                        </div>
                        {isCurrentUserDev && u.email && (
                          <p className="text-[9px] text-neutral-400 font-semibold select-all mt-0.5">
                            {u.email}
                          </p>
                        )}
                        <div className="flex items-center gap-1 mt-1 text-[10px]" style={{ color: 'var(--text-secondary)', fontWeight: 600 }}>
                          <MapPin className="w-3 h-3 text-indigo-400" />
                          <span>{u.prayerCityName}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <span 
                        className="flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold select-none"
                        style={getLevelBadgeStyle(userLevel.level, userLevel.color)}
                      >
                        Lv.{userLevel.level}
                      </span>
                      {isCurrentUserDev && u.uid !== user?.uid && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteUserClick(u.uid, u.displayName);
                          }}
                          onMouseDown={(e) => e.stopPropagation()}
                          onTouchStart={(e) => e.stopPropagation()}
                          className="p-1.5 rounded-lg bg-red-950/40 text-red-400 border border-red-500/20 hover:bg-red-900/40 hover:text-red-300 transition-all select-none flex items-center justify-center relative z-20"
                          title="Hapus akun dari komunitas"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}

          {/* Other User Detail Modal */}
          {selectedUser && (() => {
            const isSelf = selectedUser.uid === user?.uid;
            const level = getLevelFromXP(selectedUser.totalXP);
            const activeLeague = selectedUser.league || 'bronze';
            const streak = selectedUser.disciplineStreak || 0;
            const pialaTerbuka = selectedUser.unlockedAchievements?.length || 0;

            return (
              <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm">
                <motion.div
                  initial={{ opacity: 0, scale: 0.95, y: 20 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95, y: 20 }}
                  className="relative w-full max-w-md rounded-3xl p-6 shadow-2xl overflow-hidden bg-[#0e0e11] border border-neutral-800/40 text-white"
                >
                  {/* Subtle glowing color aura in the background */}
                  <div 
                    className="absolute -top-32 -left-32 w-64 h-64 rounded-full blur-3xl pointer-events-none opacity-20 transition-all duration-500"
                    style={{ background: profileCardViewMode === 'cabinet' ? '#d97706' : level.color }}
                  />

                  {/* Close button - sleek circle with X icon */}
                  <button
                    onClick={() => setSelectedUser(null)}
                    className="absolute top-5 right-5 p-2 rounded-full border border-neutral-855 bg-neutral-900/50 hover:bg-neutral-850 hover:text-white transition-all text-neutral-400 z-10"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>

                  {profileCardViewMode === 'profile' ? (
                    <motion.div
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 10 }}
                      className="space-y-6"
                    >
                      {/* Avatar & Info */}
                      <div className="flex flex-col items-center text-center space-y-3">
                        <div className="relative">
                          {/* Inner soft colored glowing aura */}
                          <div 
                            className="absolute inset-0 rounded-full blur animate-pulse"
                            style={{ 
                              background: `radial-gradient(circle, ${level.color} 0%, rgba(99, 102, 241, 0.4) 70%, transparent 100%)` 
                            }}
                          />
                          {/* Main Ring gradient border */}
                          <div className="relative p-[3px] rounded-full bg-gradient-to-tr from-cyan-500 to-indigo-500 shadow-xl">
                            <div className="w-16 h-16 rounded-full overflow-hidden border border-neutral-900 object-cover">
                              <CommunityAvatar 
                                photoURL={selectedUser.photoURL} 
                                displayName={selectedUser.displayName} 
                                className="w-full h-full"
                              />
                            </div>
                          </div>
                        </div>

                        <div className="space-y-1">
                          <h3 className="text-base font-black tracking-tight text-white flex items-center justify-center gap-1.5">
                            <span>{selectedUser.displayName}</span>
                            {isSelf && (
                              <span className="text-[8px] font-black uppercase bg-indigo-500/10 text-indigo-400 px-1.5 py-0.5 rounded border border-indigo-500/10 select-none">
                                Anda
                              </span>
                            )}
                          </h3>
                          {selectedUser.email && (
                            <p className="text-[9px] text-neutral-500 font-bold uppercase tracking-wider">
                              {selectedUser.email}
                            </p>
                          )}
                        </div>

                        {/* Badging Capsule */}
                        <div className="inline-flex">
                          <span 
                            className="flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider border transition-all select-none"
                            style={getLevelBadgeStyle(level.level, level.color)}
                          >
                            Lv.{level.level} — {level.titleId}
                          </span>
                        </div>
                      </div>

                      {/* Row containing 3 Statistics Box (XP, Streak, Piala) */}
                      <div className="grid grid-cols-3 gap-3">
                        {/* XP Stats Box */}
                        <div className="p-3 rounded-2xl border border-white/5 bg-[#16161a]/40 transition-all text-center flex flex-col justify-center min-h-[70px]">
                          <span className="text-[8px] font-black uppercase tracking-wider text-neutral-500">
                            Total XP
                          </span>
                          <span className="text-[11px] font-extrabold text-indigo-400 mt-1 select-none flex items-center justify-center gap-0.5">
                            <Gem className="w-3 h-3 animate-pulse text-indigo-400" />
                            {selectedUser.totalXP} XP
                          </span>
                        </div>

                        {/* Streak Stats Box */}
                        <div className="p-3 rounded-2xl border border-white/5 bg-[#16161a]/40 transition-all text-center flex flex-col justify-center min-h-[70px]">
                          <span className="text-[8px] font-black uppercase tracking-wider text-neutral-500">
                            Streak
                          </span>
                          <span className="text-[11px] font-extrabold text-orange-500 mt-1 select-none flex items-center justify-center gap-1.5">
                            <Flame className="w-3.5 h-3.5 text-orange-500" />
                            {streak} Hari
                          </span>
                        </div>

                        {/* Piala Stats Box (Clickable to change view to Trophy Cabinet) */}
                        <div 
                          onClick={() => {
                            playMechanicalClick();
                            setProfileCardViewMode('cabinet');
                          }}
                          className="p-3 rounded-2xl border border-white/5 bg-[#16161a]/40 hover:bg-amber-500/5 hover:border-amber-500/40 hover:scale-[1.04] hover:shadow-[0_0_15px_rgba(245,158,11,0.15)] active:scale-[0.98] transition-all text-center flex flex-col justify-center min-h-[70px] cursor-pointer group relative overflow-hidden"
                          title="Klik untuk membuka Lemari Piala"
                        >
                          {/* Sleek pulsing amber notification indicator */}
                          <span className="absolute top-1.5 right-1.5 flex h-1.5 w-1.5">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-amber-500"></span>
                          </span>

                          <span className="text-[8px] font-black uppercase tracking-wider text-neutral-500 group-hover:text-amber-400 transition-colors">
                            Piala
                          </span>
                          <span className="text-[11px] font-extrabold text-amber-500 mt-1 select-none flex items-center justify-center gap-1.5 group-hover:scale-105 transition-transform">
                            <Trophy className="w-3.5 h-3.5 text-amber-500" />
                            {pialaTerbuka}
                          </span>
                          <span className="text-[6.5px] font-black uppercase tracking-widest text-amber-500/80 animate-pulse mt-1 select-none flex items-center justify-center gap-0.5">
                            <Eye className="w-2.5 h-2.5 text-amber-500/85" />
                            LIHAT PIALA
                          </span>
                        </div>
                      </div>

                      {/* Liga Kejuaraan Block */}
                      <div className="p-4 rounded-2xl border border-white/5 bg-[#16161a]/40 flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-amber-500/10 border-2 border-amber-500 flex items-center justify-center flex-shrink-0 shadow-lg shadow-amber-500/10">
                          <Trophy className="w-5 h-5 text-amber-500" />
                        </div>
                        <div className="flex-1 text-left">
                          <span className="text-[8px] font-black uppercase tracking-widest text-neutral-500 block">
                            Liga Kejuaraan
                          </span>
                          <span className="text-xs font-black uppercase tracking-wider text-indigo-400 mt-0.5 block">
                            Liga {activeLeague}
                          </span>
                        </div>
                      </div>

                      {/* Target Kustom Pengguna (Active Goals) */}
                      <div className="space-y-2">
                        <div className="text-[10px] font-black uppercase tracking-widest text-neutral-500 text-left flex items-center gap-1.5">
                          <Target className="w-3.5 h-3.5 text-indigo-400" />
                          Target Kustom Pengguna ({selectedUser.customGoals.length})
                        </div>
                        <div className="max-h-[140px] overflow-y-auto pr-1 space-y-2 border border-white/5 bg-[#16161a]/20 p-2.5 rounded-2xl">
                          {selectedUser.customGoals.length === 0 ? (
                            <div className="text-center py-4 text-neutral-500 text-[10px] font-bold uppercase tracking-wider">
                              Belum ada target kustom aktif
                            </div>
                          ) : (
                            selectedUser.customGoals.map((g: any) => {
                              const IconComponent = GOAL_ICONS[g.iconName] || Target;
                              return (
                                <div 
                                  key={g.id} 
                                  className="flex items-center gap-2.5 p-2 bg-[#16161a]/40 border border-white/5 rounded-xl"
                                >
                                  <div className={`w-6 h-6 rounded-lg flex items-center justify-center ${g.done ? 'bg-emerald-500/10' : 'bg-indigo-500/10'}`}>
                                    <IconComponent className={`w-3.5 h-3.5 ${g.done ? 'text-emerald-400' : 'text-indigo-400'}`} />
                                  </div>
                                  <span className={`text-[11px] font-extrabold flex-1 text-left leading-tight ${g.done ? 'text-neutral-500 line-through' : 'text-neutral-200'}`}>
                                    {g.label}
                                  </span>
                                  {g.done && (
                                    <span className="text-[8px] font-extrabold uppercase px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/10">
                                      Selesai
                                    </span>
                                  )}
                                </div>
                              );
                            })
                          )}
                        </div>
                      </div>

                      {/* Modal Action Footer - Pill Gradient Purple */}
                      <div className="pt-2">
                        {isSelf ? (
                          <button
                            onClick={() => {
                              playMechanicalClick();
                              setSelectedUser(null);
                            }}
                            className="w-full py-3.5 px-6 rounded-full bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white font-extrabold text-xs tracking-widest uppercase transition-all shadow-lg shadow-indigo-600/20 hover:shadow-indigo-600/35 flex items-center justify-center gap-2"
                          >
                            Tutup Kartu <User className="w-3.5 h-3.5" />
                          </button>
                        ) : (
                          <button
                            onClick={() => {
                              playMechanicalClick();
                              setSelectedUser(null);
                              router.push(`/achievements?challenge=${selectedUser.uid}`);
                            }}
                            className="w-full py-3.5 px-6 rounded-full bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white font-extrabold text-xs tracking-widest uppercase transition-all shadow-lg shadow-indigo-600/20 hover:shadow-indigo-600/35 flex items-center justify-center gap-2"
                          >
                            Tantang Duel Fokus <Swords className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </motion.div>
                  ) : (
                    <motion.div
                      initial={{ opacity: 0, x: 10 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -10 }}
                      className="space-y-5"
                    >
                      {/* Header Cabinet */}
                      <div className="flex flex-col items-center text-center space-y-2 mt-2 mb-2">
                        <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center shadow-lg shadow-amber-500/5 animate-bounce">
                          <Trophy className="w-6 h-6 text-amber-500" />
                        </div>
                        <div>
                          <h3 className="text-base font-extrabold tracking-tight text-white">
                            🏆 Lemari Piala {selectedUser.displayName}
                          </h3>
                          <p className="text-[10px] text-neutral-500 font-bold uppercase tracking-wider">
                            {pialaTerbuka} dari {ACHIEVEMENTS.length} Piala Terbuka
                          </p>
                        </div>
                      </div>

                      {/* Piala Grid */}
                      <div className="grid grid-cols-4 gap-3">
                        {ACHIEVEMENTS.map((ach) => {
                          const isUnlocked = (selectedUser.unlockedAchievements || []).some(ua => ua.id === ach.id);
                          const isSelected = profileCardSelectedAchievement?.id === ach.id;
                          
                          return (
                            <div
                              key={ach.id}
                              onClick={() => {
                                playMechanicalClick();
                                setProfileCardSelectedAchievement(ach);
                              }}
                              className={`relative aspect-square rounded-2xl border flex items-center justify-center cursor-pointer transition-all ${
                                isUnlocked
                                  ? isSelected
                                    ? 'bg-amber-500/15 border-amber-500 shadow-md shadow-amber-500/10 scale-105'
                                    : 'bg-amber-500/5 border-amber-500/20 hover:bg-amber-500/10 hover:border-amber-500/40'
                                  : isSelected
                                    ? 'bg-neutral-800/40 border-neutral-600 scale-105'
                                    : 'bg-neutral-900/40 border-neutral-950 hover:border-neutral-700'
                              }`}
                              title={ach.title}
                            >
                              {/* Trophy Icon */}
                              <div className={`transition-transform duration-300 ${isUnlocked ? 'filter-none scale-110 drop-shadow-[0_0_8px_rgba(245,158,11,0.2)]' : 'filter grayscale opacity-25'}`}>
                                {getAchievementIcon(ach.id, undefined, "w-7 h-7")}
                              </div>
                              
                              {/* Lock icon overlay for locked */}
                              {!isUnlocked && (
                                <div className="absolute bottom-1 right-1 p-0.5 rounded-full bg-neutral-950/80 border border-neutral-800">
                                  <Lock className="w-2 h-2 text-neutral-500" />
                                </div>
                              )}
                              
                              {/* Active green dot for unlocked */}
                              {isUnlocked && (
                                <div className="absolute top-1 right-1 w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-sm shadow-emerald-500/50 animate-pulse" />
                              )}
                            </div>
                          );
                        })}
                      </div>

                      {/* Info Box for selected trophy */}
                      <div className="p-3.5 rounded-2xl border border-neutral-900/60 bg-[#16161a]/60 min-h-[92px] flex flex-col justify-center text-left">
                        {profileCardSelectedAchievement ? (
                          <div className="space-y-1">
                            <div className="flex items-center justify-between">
                              <h4 className="text-xs font-black text-white flex items-center gap-1.5">
                                <span>{getAchievementIcon(profileCardSelectedAchievement.id, undefined, "w-4 h-4")}</span>
                                <span>{profileCardSelectedAchievement.title}</span>
                              </h4>
                              <span className={`text-[8px] font-black uppercase tracking-widest px-2 py-0.5 rounded-md border ${
                                (selectedUser.unlockedAchievements || []).some(ua => ua.id === profileCardSelectedAchievement.id)
                                  ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                                  : 'bg-neutral-800/60 text-neutral-500 border-neutral-755'
                              }`}>
                                {(selectedUser.unlockedAchievements || []).some(ua => ua.id === profileCardSelectedAchievement.id) ? 'Terbuka' : 'Terkunci'}
                              </span>
                            </div>
                            <p className="text-[10px] text-neutral-400 font-medium leading-relaxed">
                              {profileCardSelectedAchievement.description}
                            </p>
                            <div className="text-[9px] font-black text-indigo-400 uppercase tracking-widest">
                              🎁 Reward: +{profileCardSelectedAchievement.xpReward} XP
                            </div>
                          </div>
                        ) : (
                          <div className="text-center py-2 w-full">
                            <p className="text-[9px] text-neutral-500 font-black uppercase tracking-wider">
                              💡 Klik salah satu piala di atas untuk info pencapaian
                            </p>
                          </div>
                        )}
                      </div>

                      {/* Cabinet Footer */}
                      <div className="pt-1">
                        <button
                          onClick={() => {
                            playMechanicalClick();
                            setProfileCardViewMode('profile');
                            setProfileCardSelectedAchievement(null);
                          }}
                          className="w-full py-3 px-6 rounded-full bg-neutral-900 border border-neutral-800 hover:bg-neutral-850 hover:text-white text-neutral-350 font-extrabold text-xs tracking-wider uppercase transition-all flex items-center justify-center gap-2"
                        >
                          Kembali ke Profil <User className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </motion.div>
                  )}
                </motion.div>
              </div>
            );
          })()}

        </motion.div>
      )}

      {/* City Selector Modal */}
      <CitySelectorModal 
        isOpen={isCityModalOpen} 
        onClose={() => setIsCityModalOpen(false)} 
      />

      {/* Custom Delete Confirmation Modal */}
      {deleteTarget && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[60] flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="card w-full max-w-sm p-6 relative space-y-4"
            style={{ 
              border: '1px solid rgba(239, 68, 68, 0.35)', 
              background: '#0B0B0F', 
              boxShadow: '0 10px 30px rgba(239, 68, 68, 0.15)' 
            }}
          >
            <div className="text-center space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-red-950/50 border border-red-500/30 flex items-center justify-center mx-auto text-red-400">
                <Trash2 className="w-6 h-6 animate-pulse" />
              </div>
              <h3 className="text-base font-extrabold text-red-400">Konfirmasi Hapus Akun</h3>
              <p className="text-xs text-neutral-300 leading-relaxed px-2">
                Apakah Anda yakin ingin menghapus akun <span className="font-bold text-white">"{deleteTarget.displayName}"</span> dari daftar komunitas?
              </p>
              <div className="p-3 bg-red-950/20 border border-red-500/10 rounded-xl text-[10px] text-red-300 leading-normal text-left">
                ⚠️ <strong>PERINGATAN:</strong> Tindakan ini akan menghapus secara permanen seluruh data profil Firestore, riwayat progres, tingkat level, dan goals kustom milik pengguna tersebut.
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2.5 pt-2">
              <button
                onClick={() => setDeleteTarget(null)}
                disabled={isDeleting}
                className="py-2.5 rounded-xl text-xs font-bold hover:bg-neutral-800/40 text-neutral-400 border border-neutral-800 transition-all select-none"
              >
                Batal
              </button>
              <button
                onClick={async () => {
                  setIsDeleting(true);
                  try {
                    const { deleteUserProfile } = await import('@/lib/firebase/firestore');
                    await deleteUserProfile(deleteTarget.uid);
                    setUsersList(prev => prev.filter(u => u.uid !== deleteTarget.uid));
                    setDeleteTarget(null);
                  } catch (err) {
                    console.error('Failed to delete user:', err);
                    alert('Gagal menghapus akun. Pastikan aturan keamanan Firebase Anda mengizinkan.');
                  } finally {
                    setIsDeleting(false);
                  }
                }}
                disabled={isDeleting}
                className="py-2.5 rounded-xl text-xs font-bold bg-red-600 hover:bg-red-500 text-white shadow-lg shadow-red-600/20 transition-all select-none flex items-center justify-center gap-1.5"
              >
                {isDeleting ? 'Menghapus...' : 'Ya, Hapus Akun'}
              </button>
            </div>
          </motion.div>
        </div>
      )}
      {/* Achievements Pop-Up Modal */}
      {(isAchievementsModalOpen || (isUserAchievementsModalOpen && selectedUser)) && (() => {
        const activeModal = isAchievementsModalOpen 
          ? { type: 'me', title: 'Lemari Piala Saya', list: unlockedAchievements, name: user?.displayName || 'Life OS User' } 
          : { type: 'user', title: `Lemari Piala ${selectedUser?.displayName}`, list: selectedUser?.unlockedAchievements || [], name: selectedUser?.displayName || 'Pengguna' };
        
        const modalUnlockedXP = ACHIEVEMENTS.reduce((sum, ach) => {
          const isUnlocked = activeModal.list.some(a => a.id === ach.id);
          return sum + (isUnlocked ? ach.xpReward : 0);
        }, 0);
        
        const totalPossibleXP = ACHIEVEMENTS.reduce((sum, ach) => sum + ach.xpReward, 0);
        const progressPercent = Math.round((activeModal.list.length / ACHIEVEMENTS.length) * 100);
        const isDark = theme === 'dark';

        return (
          <div className="fixed inset-0 bg-black/75 backdrop-blur-md z-[50] flex items-center justify-center p-3 md:p-4">
            <motion.div 
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              className="card w-full max-w-5xl p-4 md:p-6 relative max-h-[92vh] overflow-y-auto space-y-4 md:space-y-6"
              style={{ 
                border: isDark ? '1px solid var(--border)' : '1px solid rgba(0, 0, 0, 0.08)',
                background: isDark ? '#0B0B0F' : '#FFFFFF',
                boxShadow: isDark ? '0 20px 50px rgba(0,0,0,0.6)' : '0 20px 50px rgba(0,0,0,0.1)'
              }}
            >
              {/* Close Button */}
              <button 
                onClick={() => {
                  setIsAchievementsModalOpen(false);
                  setIsUserAchievementsModalOpen(false);
                }} 
                className={`absolute top-3.5 right-3.5 p-1.5 md:top-4 md:right-4 md:p-2 rounded-xl border transition-all z-10 ${
                  isDark 
                    ? 'bg-neutral-900/50 hover:bg-neutral-800/50 border-neutral-800/40 text-neutral-400 hover:text-white' 
                    : 'bg-neutral-100 hover:bg-neutral-200 border-neutral-200 text-neutral-500 hover:text-neutral-900'
                }`}
              >
                <X className="w-4 h-4 md:w-5 h-5" />
              </button>

              {/* Main Header Container */}
              <div 
                className="flex flex-col md:flex-row items-center md:items-start justify-between p-4 md:p-6 rounded-2xl gap-4 md:gap-6 relative overflow-hidden"
                style={{ 
                  background: isDark 
                    ? 'linear-gradient(135deg, rgba(245, 158, 11, 0.05) 0%, rgba(251, 191, 36, 0.01) 100%)' 
                    : 'linear-gradient(135deg, rgba(245, 158, 11, 0.08) 0%, rgba(251, 191, 36, 0.03) 100%)',
                  border: isDark ? '1px solid rgba(245, 158, 11, 0.15)' : '1px solid rgba(245, 158, 11, 0.25)'
                }}
              >
                {/* Glow behind trophy */}
                <div className="absolute top-[-50px] left-[-50px] w-40 h-40 bg-amber-500/10 rounded-full blur-[80px] pointer-events-none" />

                {/* Left section: Trophy icon & titles */}
                <div className="flex flex-row items-center md:items-start gap-3 md:gap-4.5 text-left w-full md:w-auto">
                  <div className="w-10 h-10 md:w-14 md:h-14 rounded-xl md:rounded-2xl bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center shadow-lg shadow-amber-500/20 flex-shrink-0">
                    <Trophy className="w-5.5 h-5.5 md:w-8 md:h-8 text-neutral-955 stroke-[2]" />
                  </div>
                  <div className="space-y-0.5 md:space-y-1">
                    <h3 className={`text-base md:text-xl font-black flex items-center gap-2 ${isDark ? 'text-white' : 'text-neutral-955'}`}>
                      Lemari Piala <span className="text-[10px] md:text-xs font-bold text-amber-500 bg-amber-500/10 px-2 py-0.5 rounded-full border border-amber-500/10">{activeModal.type === 'me' ? 'Saya' : activeModal.name}</span>
                    </h3>
                    <p className={`text-[10px] md:text-xs max-w-lg leading-relaxed hidden sm:block ${isDark ? 'text-neutral-400' : 'text-neutral-600'}`}>
                      Galeri pencapaian kedisiplinan dan produktivitas {activeModal.type === 'me' ? 'Anda' : activeModal.name}. Selesaikan target harian untuk membuka piala bergengsi.
                    </p>
                  </div>
                </div>

                {/* Right section: High-fidelity Stats count */}
                <div className={`flex items-center gap-2 md:gap-6 border-t md:border-t-0 pt-3 md:pt-0 w-full md:w-auto ${
                  isDark ? 'border-neutral-800/40' : 'border-neutral-200/60'
                }`}>
                  <div className="flex-1 md:w-28 text-center">
                    <span className={`text-[8px] md:text-[9px] font-bold tracking-wider uppercase block ${isDark ? 'text-neutral-550' : 'text-neutral-400'}`}>Piala Terbuka</span>
                    <span className={`text-lg md:text-2xl font-black mt-0.5 md:mt-1 block ${isDark ? 'text-white' : 'text-neutral-950'}`}>
                      <span className="text-amber-500">{activeModal.list.length}</span><span className={`text-sm md:text-lg ${isDark ? 'text-neutral-500' : 'text-neutral-450'}`}> / {ACHIEVEMENTS.length}</span>
                    </span>
                  </div>

                  {/* Vertical Divider Line */}
                  <div className={`h-8 w-[1px] flex-shrink-0 mx-2 md:mx-0 ${
                    isDark ? 'bg-neutral-800' : 'bg-neutral-200'
                  }`} />

                  <div className="flex-1 md:w-36 text-center">
                    <span className={`text-[8px] md:text-[9px] font-bold tracking-wider uppercase block ${isDark ? 'text-neutral-550' : 'text-neutral-400'}`}>XP Diperoleh</span>
                    <span className="text-lg md:text-2xl font-black text-amber-500 mt-0.5 md:mt-1 block">
                      {modalUnlockedXP} <span className={`text-[10px] md:text-xs font-semibold ${isDark ? 'text-neutral-550' : 'text-neutral-400'}`}>/ {totalPossibleXP} XP</span>
                    </span>
                  </div>
                </div>
              </div>

              {/* Progress Slider */}
              <div className="space-y-1.5 md:space-y-2.5">
                <div className={`flex justify-between text-[10px] md:text-xs font-bold ${isDark ? 'text-neutral-400' : 'text-neutral-600'}`}>
                  <span>Kemajuan Koleksi</span>
                  <span className="text-amber-500">{progressPercent}% Terkumpul</span>
                </div>
                <div className={`w-full h-2 md:h-3 rounded-full border p-0.5 relative overflow-hidden ${
                  isDark ? 'border-neutral-800/45 bg-neutral-950' : 'border-neutral-200 bg-neutral-100'
                }`}>
                  <motion.div 
                    className="h-full rounded-full relative"
                    style={{ background: 'linear-gradient(90deg, #F59E0B, #FBBF24, #F59E0B)' }}
                    initial={{ width: 0 }}
                    animate={{ width: `${progressPercent}%` }}
                    transition={{ duration: 0.8, ease: 'easeOut' }}
                  >
                    <div className="absolute inset-0 bg-white/20 animate-pulse rounded-full" />
                  </motion.div>
                </div>
              </div>

              {/* High-Fidelity Grid of Achievements - Responsive 2 Columns in Mobile */}
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3 md:gap-4.5">
                {ACHIEVEMENTS.map((ach) => {
                  const unlockRecord = activeModal.list.find(a => a.id === ach.id);
                  const isUnlocked = !!unlockRecord;
                  const isSecret = ach.secret && !isUnlocked;
                  const cat = getCategoryDetails(ach.category);

                  return (
                    <motion.div
                      key={ach.id}
                      whileHover={{ scale: 1.02, y: -2 }}
                      className={`relative p-3.5 md:p-5 rounded-xl md:rounded-2xl border flex flex-col items-center text-center cursor-pointer transition-all ${
                        isUnlocked 
                          ? (isDark 
                              ? 'bg-neutral-900/40 border-yellow-500/10 hover:border-yellow-500/20' 
                              : 'bg-amber-50/20 border-yellow-500/20 hover:border-yellow-500/40')
                          : (isDark 
                              ? 'bg-neutral-950/40 border-neutral-900/60 opacity-60 hover:opacity-80' 
                              : 'bg-neutral-100/50 border-neutral-200/80 opacity-70 hover:opacity-90')
                      }`}
                      style={{
                        boxShadow: isUnlocked ? `0 4px 20px ${cat.glowColor}` : 'none'
                      }}
                      onClick={() => {
                        setSelectedAchievement(ach);
                      }}
                    >
                      {/* Top Badges Row */}
                      <div className="flex justify-between items-center w-full mb-3 md:mb-4 gap-1">
                        <span className={`text-[8px] md:text-[9px] font-black uppercase px-1.5 py-0.5 md:px-2.5 md:py-0.5 rounded-full border tracking-widest inline-flex items-center gap-1 ${
                          isUnlocked 
                            ? cat.badgeBg 
                            : (isDark ? "bg-neutral-900/60 text-neutral-500 border-neutral-900/40" : "bg-neutral-200/55 text-neutral-500 border-neutral-200/40")
                        }`}>
                          {isSecret ? <LockKeyhole className="w-2 md:w-2.5 h-2 md:h-2.5" /> : cat.icon}
                          <span className="hidden xs:inline">{isSecret ? 'Misteri' : cat.label}</span>
                        </span>
                        
                        <span className="text-[8px] md:text-[9px] font-black text-amber-500 bg-amber-500/10 px-1.5 py-0.5 rounded border border-amber-500/10 whitespace-nowrap">
                          +{ach.xpReward} XP
                        </span>
                      </div>

                      {/* Center Trophy Icon Box */}
                      <div 
                        className={`relative w-12 h-12 md:w-16 md:h-16 mx-auto flex items-center justify-center rounded-xl md:rounded-2xl border transition-all mb-2.5 md:mb-3 ${
                          isUnlocked 
                            ? (isDark ? 'bg-neutral-950 border-amber-500/20 shadow-lg shadow-amber-500/5' : 'bg-white border-amber-500/30 shadow-md shadow-amber-500/5') 
                            : (isDark ? 'bg-neutral-950 border-neutral-900' : 'bg-neutral-50 border-neutral-200')
                        }`}
                      >
                        {isUnlocked ? (
                          <>
                            {getAchievementIcon(ach.id, cat.color, "w-6 h-6 md:w-8 md:h-8")}
                            <Sparkles className="absolute -top-1 -right-1 w-3 h-3 md:w-4 h-4 text-yellow-500 animate-pulse" />
                          </>
                        ) : isSecret ? (
                          <HelpCircle className="w-6 h-6 md:w-8 md:h-8 text-purple-400/60" />
                        ) : (
                          <LockKeyhole className={`w-6 h-6 md:w-8 md:h-8 ${isDark ? 'text-neutral-600' : 'text-neutral-400'}`} />
                        )}
                      </div>

                      {/* Title & Description */}
                      <div className="space-y-1 flex-1 flex flex-col justify-center">
                        <h4 className={`text-[10px] md:text-xs font-black leading-tight ${isDark ? 'text-white' : 'text-neutral-950'}`}>
                          {isSecret ? 'Pencapaian Misterius' : ach.title}
                        </h4>
                        <p className={`text-[9px] md:text-[10px] leading-relaxed px-0.5 line-clamp-2 ${isDark ? 'text-neutral-400' : 'text-neutral-600'}`}>
                          {isSecret ? 'Teruslah berdisiplin untuk mengungkap piala ini.' : ach.description}
                        </p>
                      </div>

                      {/* Bottom Status */}
                      <div className={`w-full border-t mt-3 md:mt-4 pt-2.5 md:pt-3 flex items-center justify-center gap-1 ${isDark ? 'border-neutral-800/40' : 'border-neutral-200'}`}>
                        {isUnlocked && unlockRecord ? (
                          <>
                            <CheckCircle2 className="w-2.5 h-2.5 text-emerald-500 flex-shrink-0" />
                            <span className="text-[7px] md:text-[8px] font-bold text-amber-500/80 uppercase tracking-wider">
                              {new Date(unlockRecord.unlockedAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })}
                            </span>
                          </>
                        ) : (
                          <>
                            <LockKeyhole className={`w-2 h-2 md:w-2.5 md:h-2.5 flex-shrink-0 ${isDark ? 'text-neutral-600' : 'text-neutral-400'}`} />
                            <span className={`text-[7px] md:text-[8px] font-bold uppercase tracking-widest ${isDark ? 'text-neutral-600' : 'text-neutral-400'}`}>
                              TERKUNCI
                            </span>
                          </>
                        )}
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </motion.div>
          </div>
        );
      })()}
      {/* Achievement Detail Modal */}
      {selectedAchievement && (() => {
        const isDark = theme === 'dark';
        return (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[70] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="card w-full max-w-sm p-6 relative space-y-4 shadow-2xl"
              style={{ 
                border: isDark ? '1px solid var(--border)' : '1px solid rgba(0, 0, 0, 0.08)', 
                background: isDark ? '#0B0B0F' : '#FFFFFF', 
                boxShadow: '0 10px 30px rgba(0,0,0,0.3)' 
              }}
            >
              <button 
                onClick={() => setSelectedAchievement(null)} 
                className={`absolute top-4 right-4 p-1.5 rounded-lg border transition-all ${
                  isDark 
                    ? 'hover:bg-neutral-800/40 border-transparent text-neutral-400' 
                    : 'bg-neutral-100 hover:bg-neutral-200 border-neutral-200 text-neutral-500'
                }`}
              >
                <X className="w-4 h-4" />
              </button>

              {(() => {
                const ach = selectedAchievement;
                const targetUnlockedList = selectedUser 
                  ? (selectedUser.unlockedAchievements || []) 
                  : unlockedAchievements;
                
                const unlockRecord = targetUnlockedList.find(a => a.id === ach.id);
                const isUnlocked = !!unlockRecord;
                const isSecret = ach.secret && !isUnlocked;
                const cat = getCategoryDetails(ach.category);

                return (
                  <div className="text-center space-y-4 pt-2">
                    <span className={`text-[9px] font-extrabold uppercase px-2.5 py-0.5 rounded-full border tracking-widest inline-flex items-center gap-1 ${
                      isUnlocked 
                        ? cat.badgeBg 
                        : (isDark ? "bg-neutral-800/50 text-neutral-500 border-neutral-800/40" : "bg-neutral-100 text-neutral-400 border-neutral-200")
                    }`}>
                      {isSecret ? <LockKeyhole className="w-2.5 h-2.5" /> : cat.icon}
                      <span>{isSecret ? 'Misteri' : cat.label}</span>
                    </span>

                    <div className={`relative w-20 h-20 mx-auto flex items-center justify-center rounded-2xl border shadow-inner ${
                      isDark ? 'bg-neutral-900 border-neutral-800' : 'bg-neutral-50 border-neutral-200'
                    }`}>
                      {isUnlocked ? (
                        <>
                          {getAchievementIcon(ach.id, cat.color, "w-10 h-10")}
                          <Sparkles className="absolute -top-2 -right-2 w-5 h-5 text-yellow-500 animate-pulse" />
                        </>
                      ) : isSecret ? (
                        <HelpCircle className="w-10 h-10 text-purple-400 opacity-60" />
                      ) : (
                        <LockKeyhole className={`w-10 h-10 ${isDark ? 'text-neutral-600' : 'text-neutral-400'}`} />
                      )}
                    </div>

                    <div className="space-y-1.5">
                      <h4 className={`text-sm font-extrabold ${isDark ? 'text-white' : 'text-neutral-950'}`}>
                        {isSecret ? 'Pencapaian Misterius' : ach.title}
                      </h4>
                      <p className={`text-xs leading-relaxed px-4 ${isDark ? 'text-neutral-400' : 'text-neutral-600'}`}>
                        {isSecret ? 'Teruslah berdisiplin dan konsisten untuk mengungkap pencapaian rahasia ini.' : ach.description}
                      </p>
                    </div>

                    <div className={`border-t my-1 ${isDark ? 'border-neutral-800/40' : 'border-neutral-200'}`} />

                    <div className={`flex justify-between items-center px-2 text-[10px] font-bold ${isDark ? 'text-neutral-400' : 'text-neutral-500'}`}>
                      <span>Hadiah XP:</span>
                      <span className="text-yellow-500 font-extrabold">+{ach.xpReward} XP</span>
                    </div>

                    <div className={`p-3 border rounded-xl text-[10px] leading-normal ${
                      isDark 
                        ? 'bg-neutral-900/60 border-neutral-800/40 text-neutral-400' 
                        : 'bg-neutral-50 border-neutral-200 text-neutral-600'
                    }`}>
                      {isUnlocked && unlockRecord ? (
                        <div className="flex items-center justify-center gap-1.5 font-bold uppercase tracking-wider text-emerald-400/80">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 flex-shrink-0" />
                          <span>
                            DIBUKA PADA {new Date(unlockRecord.unlockedAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' }).toUpperCase()}
                          </span>
                        </div>
                      ) : (
                        <div className={`flex items-center justify-center gap-1.5 font-bold uppercase tracking-wider ${isDark ? 'text-neutral-500' : 'text-neutral-400'}`}>
                          <LockKeyhole className="w-3.5 h-3.5 flex-shrink-0" />
                          <span>
                            BELUM TERBUKA
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })()}
            </motion.div>
          </div>
        );
      })()}
    </div>
  );
}
