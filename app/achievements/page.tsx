'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useAppStore } from '@/store/useAppStore';
import { ACHIEVEMENTS } from '@/lib/constants/achievements';
import { 
  Trophy, Lock, Sparkles, Award, Star, Zap, Search,
  Sunrise, Droplets, Target, Medal, Crown, Moon, Timer, Activity,
  Flame, Sun, Heart, Smartphone, Shield, Terminal, ArrowUp, AlertCircle, RefreshCw, ChevronRight,
  Swords, ArrowDown, ShieldAlert, Gem, X, Eye, User, Clock, CheckCircle2
} from 'lucide-react';
import { useState, useEffect } from 'react';
import { getAllUserProfiles, PublicUserProfile } from '@/lib/firebase/firestore';
import { getLevelFromXP, getLevelBadgeStyle } from '@/lib/constants/levels';
import { playMechanicalClick } from '@/lib/utils/sound';
import FocusDuelModal from '@/components/focus/FocusDuelModal';
import { useRouter } from 'next/navigation';

// Smart community avatar fallback component with interactive click support
const CommunityAvatar = ({ 
  photoURL, 
  displayName, 
  className = "w-10 h-10",
  onClick
}: { 
  photoURL: string | null; 
  displayName: string; 
  className?: string;
  onClick?: () => void;
}) => {
  const [imgError, setImgError] = useState(false);

  useEffect(() => {
    setImgError(false);
  }, [photoURL]);

  const clickClass = onClick ? 'cursor-pointer hover:scale-105 active:scale-95 transition-all duration-200' : '';

  if (photoURL && !imgError) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={photoURL}
        alt={displayName}
        referrerPolicy="no-referrer"
        onError={() => setImgError(true)}
        onClick={onClick}
        className={`${className} ${clickClass} rounded-full object-cover border border-[var(--border)] shadow-sm`}
      />
    );
  }

  let hash = 0;
  for (let i = 0; i < displayName.length; i++) {
    hash = displayName.charCodeAt(i) + ((hash << 5) - hash);
  }
  const h = Math.abs(hash % 360);
  const s = 60;
  const l = 45;
  const initial = displayName ? displayName.charAt(0).toUpperCase() : 'U';

  return (
    <div
      onClick={onClick}
      className={`${className} ${clickClass} rounded-full border border-neutral-350 dark:border-neutral-750 flex items-center justify-center font-black text-white text-xs select-none shadow-sm`}
      style={{
        background: `linear-gradient(135deg, hsl(${h}, ${s}%, ${l}%), hsl(${(h + 40) % 360}, ${s}%, ${l - 10}%))`
      }}
    >
      {initial}
    </div>
  );
};const getAchievementIcon = (id: string, color?: string, sizeClass = "w-6 h-6 stroke-[1.75]") => {
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

interface UserProfileCardModalProps {
  isOpen: boolean;
  onClose: () => void;
  profileUser: PublicUserProfile;
  isSelf: boolean;
  onChallenge: () => void;
  isDark: boolean;
}

const UserProfileCardModal = ({ 
  isOpen, 
  onClose, 
  profileUser, 
  isSelf, 
  onChallenge,
  isDark 
}: UserProfileCardModalProps) => {
  const router = useRouter();
  const { user } = useAppStore();
  const [viewMode, setViewMode] = useState<'profile' | 'cabinet'>('profile');
  const [selectedCabinetAchievement, setSelectedCabinetAchievement] = useState<any | null>(null);
  
  if (!isOpen) return null;

  const level = getLevelFromXP(profileUser.totalXP);
  
  const handleViewFullProfile = () => {
    playMechanicalClick();
    onClose();
    router.push('/profile');
  };

  const activeLeague = profileUser.league || 'bronze';
  const streak = profileUser.disciplineStreak || 0;
  const pialaTerbuka = profileUser.unlockedAchievements?.length || 0;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className={`relative w-full max-w-md rounded-3xl p-6 shadow-2xl overflow-hidden border ${isDark ? 'bg-[#0e0e11] border-neutral-800/40 text-white' : 'bg-white border-neutral-200 text-neutral-900 shadow-neutral-300/30'}`}
        >
          {/* Subtle glowing color aura in the background */}
          <div 
            className={`absolute -top-32 -left-32 w-64 h-64 rounded-full blur-3xl pointer-events-none transition-all duration-500 ${isDark ? 'opacity-20' : 'opacity-10'}`}
            style={{ background: viewMode === 'cabinet' ? '#d97706' : level.color }}
          />

          {/* Close button - sleek circle with X icon */}
          <button
            onClick={onClose}
            className={`absolute top-5 right-5 p-2 rounded-full border transition-all z-10 ${isDark ? 'border-neutral-800 bg-neutral-900/50 hover:bg-neutral-800 hover:text-white text-neutral-400' : 'border-neutral-200 bg-neutral-50 hover:bg-neutral-100 hover:text-neutral-950 text-neutral-500'}`}
          >
            <X className="w-3.5 h-3.5" />
          </button>

          {viewMode === 'profile' ? (
            <motion.div
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 10 }}
              className="space-y-5"
            >
              {/* User Visual Card Info - Styled pixel-perfect to mockup */}
              <div className="flex flex-col items-center text-center space-y-2.5 mt-2">
                <div className="relative mb-1 flex items-center justify-center">
                  {/* Glowing pendar background ring */}
                  <div className="absolute w-24 h-24 rounded-full bg-gradient-to-tr from-cyan-500 to-indigo-500 blur-md opacity-60 animate-pulse" />
                  <div className="relative z-10">
                    <CommunityAvatar 
                      photoURL={profileUser.photoURL} 
                      displayName={profileUser.displayName} 
                      className="w-20 h-20 text-3xl shadow-lg border-2 border-indigo-500/30 object-cover rounded-full"
                    />
                  </div>
                </div>
                <div>
                  <h3 className={`text-lg font-black tracking-tight flex items-center justify-center gap-1.5 leading-snug flex-wrap ${isDark ? 'text-white' : 'text-neutral-900'}`}>
                    {profileUser.displayName}
                    {renderCustomTitleBadge(profileUser.customTitle, isDark)}
                    {isSelf && (
                      <span className="text-[9px] font-black uppercase tracking-wider bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 px-1.5 py-0.5 rounded-md">
                        Anda
                      </span>
                    )}
                  </h3>
                  {(isSelf || user?.email === 'mwildanfiqri88@gmail.com') && (
                    <p className={`text-xs font-semibold tracking-wide ${isDark ? 'text-neutral-500' : 'text-neutral-455'}`}>
                      {profileUser.email || 'pejuang.disiplin@lifeos.com'}
                    </p>
                  )}
                </div>

                {/* Level Badge - Pill Capsule Retro */}
                <span 
                  className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[9px] font-bold tracking-widest uppercase select-none mt-2 shadow-sm border transition-all"
                  style={getLevelBadgeStyle(level.level, level.color)}
                >
                  <level.icon className="w-3.5 h-3.5 flex-shrink-0" />
                  LV.{level.level} — {level.titleId.toUpperCase()}
                </span>
              </div>

              {/* Gamifikasi Stats Grid (TOTAL XP, STREAK, PIALA) */}
              <div className="grid grid-cols-3 gap-3">
                {/* TOTAL XP Box */}
                <div className={`p-3.5 rounded-2xl border transition-all text-center flex flex-col items-center justify-center ${isDark ? 'border-white/5 bg-[#16161a] text-white' : 'border-neutral-200 bg-neutral-50 text-neutral-900'}`}>
                  <span className="text-[8px] font-black tracking-widest uppercase text-neutral-500">Total XP</span>
                  <span className={`text-xs font-black mt-1 block tracking-tight ${isDark ? 'text-indigo-400' : 'text-indigo-650'}`}>
                    {profileUser.totalXP.toLocaleString()} XP
                  </span>
                </div>

                {/* STREAK Box */}
                <div className={`p-3.5 rounded-2xl border transition-all text-center flex flex-col items-center justify-center ${isDark ? 'border-white/5 bg-[#16161a] text-white' : 'border-neutral-200 bg-neutral-50 text-neutral-900'}`}>
                  <span className="text-[8px] font-black tracking-widest uppercase text-neutral-500">Streak</span>
                  <span className={`text-xs font-black mt-1 flex items-center justify-center gap-1.5 tracking-tight ${isDark ? 'text-orange-500' : 'text-orange-655'}`}>
                    <Flame className={`w-3.5 h-3.5 ${isDark ? 'text-orange-500' : 'text-orange-600'}`} />
                    {streak} Hari
                  </span>
                </div>

                {/* PIALA Box (Interactive to open Lemari Piala) */}
                <div 
                  onClick={() => {
                    playMechanicalClick();
                    setViewMode('cabinet');
                  }}
                  className={`p-3.5 rounded-2xl border hover:bg-amber-500/5 active:scale-[0.98] transition-all text-center flex flex-col items-center justify-center cursor-pointer group relative overflow-hidden ${isDark ? 'border-white/5 bg-[#16161a] hover:border-amber-500/40 hover:scale-[1.04]' : 'border-neutral-200 bg-neutral-50 hover:bg-amber-500/5 hover:border-amber-500/30 hover:scale-[1.04] hover:shadow-[0_0_15px_rgba(245,158,11,0.08)]'}`}
                  title="Klik untuk membuka Lemari Piala"
                >
                  {/* Sleek pulsing amber notification indicator */}
                  <span className="absolute top-1.5 right-1.5 flex h-1.5 w-1.5">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-amber-500"></span>
                  </span>

                  <span className={`text-[8px] font-black tracking-widest uppercase transition-colors ${isDark ? 'text-neutral-500 group-hover:text-amber-400' : 'text-neutral-500 group-hover:text-amber-600'}`}>Piala</span>
                  <span className={`text-xs font-black mt-1 flex items-center justify-center gap-1.5 group-hover:scale-105 transition-transform tracking-tight ${isDark ? 'text-amber-500' : 'text-amber-655'}`}>
                    <Trophy className={`w-3.5 h-3.5 ${isDark ? 'text-amber-500' : 'text-amber-600'}`} />
                    {pialaTerbuka}
                  </span>
                  <span className={`text-[6.5px] font-black uppercase tracking-widest animate-pulse mt-1 select-none flex items-center justify-center gap-0.5 ${isDark ? 'text-amber-500/80' : 'text-amber-655/80'}`}>
                    <Eye className={`w-2.5 h-2.5 ${isDark ? 'text-amber-500/85' : 'text-amber-600/85'}`} />
                    LIHAT PIALA
                  </span>
                </div>
              </div>

              {/* Active League Section */}
              <div className={`p-4 rounded-2xl border flex items-center justify-between ${isDark ? 'border-white/5 bg-[#121215]' : 'border-neutral-200 bg-neutral-50'}`}>
                <div className="flex items-center gap-3">
                  {/* Rounded icon block orange border */}
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${isDark ? 'bg-amber-500/10 border border-amber-500/30 text-amber-500' : 'bg-amber-50 border border-amber-300 text-amber-600 shadow-amber-500/5'}`}>
                    {(() => {
                      const LeagueIcon = activeLeague === 'diamond' ? Gem : activeLeague === 'gold' ? Trophy : activeLeague === 'silver' ? Award : Medal;
                      return <LeagueIcon className={`w-5.5 h-5.5 ${isDark ? '' : 'animate-pulse'}`} />;
                    })()}
                  </div>
                  <div className="text-left">
                    <h4 className="text-[9px] font-black uppercase tracking-wider text-neutral-500">Liga Kejuaraan</h4>
                    <p className={`text-xs font-black uppercase tracking-wider mt-0.5 ${isDark ? 'text-indigo-400' : 'text-indigo-650'}`}>
                      Liga {activeLeague ? activeLeague.charAt(0).toUpperCase() + activeLeague.slice(1) : 'Bronze'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Target Kustom / Goals Section */}
              <div className="space-y-2">
                <h4 className="text-[9px] font-black uppercase tracking-widest text-left text-neutral-500">Target Kustom Pengguna</h4>
                <div className={`rounded-2xl border p-3 text-center min-h-[58px] flex items-center justify-center ${isDark ? 'border-white/5 bg-[#121215]' : 'border-neutral-200 bg-neutral-50/50'}`}>
                  {!profileUser.customGoals || profileUser.customGoals.length === 0 ? (
                    <p className="text-xs text-neutral-500 py-1 font-semibold">
                      Belum menetapkan target kustom aktif.
                    </p>
                  ) : (
                    <div className="max-h-24 overflow-y-auto w-full space-y-1.5 text-left">
                      {profileUser.customGoals.map((goal) => (
                        <div 
                          key={goal.id} 
                          className={`flex items-center justify-between p-2 rounded-xl text-[10px] font-bold ${
                            goal.done
                              ? (isDark ? 'bg-emerald-500/5 text-emerald-400 border border-emerald-500/10' : 'bg-emerald-50 text-emerald-700 border border-emerald-250')
                              : (isDark ? 'bg-neutral-900/60 text-neutral-400 border border-white/5' : 'bg-white text-neutral-600 border border-neutral-150')
                          }`}
                        >
                          <span className={`flex items-center gap-1.5 leading-none ${goal.done ? 'text-neutral-450 line-through' : (isDark ? 'text-neutral-200' : 'text-neutral-700')}`}>
                            <Target className={`w-3.5 h-3.5 ${goal.done ? 'text-emerald-400' : (isDark ? 'text-indigo-400' : 'text-indigo-650')}`} />
                            {goal.label}
                          </span>
                          <span className="flex items-center gap-1">
                            {goal.done ? (
                              <>
                                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                                Selesai
                              </>
                            ) : (
                              <>
                                <Timer className="w-3.5 h-3.5 text-amber-500 animate-pulse" />
                                Aktif
                              </>
                            )}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Modal Action Footer - Pill Gradient Purple */}
              <div className="pt-2">
                {isSelf ? (
                  <button
                    onClick={handleViewFullProfile}
                    className="w-full py-3.5 px-6 rounded-full bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white font-extrabold text-xs tracking-widest uppercase transition-all shadow-lg shadow-indigo-600/20 hover:shadow-indigo-600/35 flex items-center justify-center gap-2"
                  >
                    Lihat Profil Lengkap Saya <User className="w-3.5 h-3.5" />
                  </button>
                ) : (
                  <button
                    onClick={() => {
                      onChallenge();
                      onClose();
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
                  <h3 className={`text-base font-extrabold tracking-tight ${isDark ? 'text-white' : 'text-neutral-900'}`}>
                    🏆 Lemari Piala {profileUser.displayName}
                  </h3>
                  <p className="text-[10px] text-neutral-500 font-bold uppercase tracking-wider">
                    {pialaTerbuka} dari 12 Piala Terbuka
                  </p>
                </div>
              </div>

              {/* Piala Grid */}
              <div className="grid grid-cols-4 gap-3">
                {ACHIEVEMENTS.map((ach) => {
                  const isUnlocked = (profileUser.unlockedAchievements || []).some(ua => ua.id === ach.id);
                  const isSelected = selectedCabinetAchievement?.id === ach.id;
                  
                  return (
                    <div
                      key={ach.id}
                      onClick={() => {
                        playMechanicalClick();
                        setSelectedCabinetAchievement(ach);
                      }}
                      className={`relative aspect-square rounded-2xl border flex items-center justify-center cursor-pointer transition-all ${
                        isUnlocked
                          ? isSelected
                            ? 'bg-amber-500/15 border-amber-500 shadow-md shadow-amber-500/10 scale-105'
                            : (isDark ? 'bg-amber-500/5 border-amber-500/20 hover:bg-amber-500/10 hover:border-amber-500/40' : 'bg-amber-50 border-amber-200/50 hover:bg-amber-100/50 hover:border-amber-400')
                          : isSelected
                            ? (isDark ? 'bg-neutral-800/40 border-neutral-600 scale-105' : 'bg-neutral-100 border-neutral-350 scale-105')
                            : (isDark ? 'bg-neutral-900/40 border-neutral-850 hover:border-neutral-700' : 'bg-neutral-50/50 border-neutral-200 hover:border-neutral-300')
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
              <div className={`p-3.5 rounded-2xl border min-h-[92px] flex flex-col justify-center text-left ${isDark ? 'border-neutral-850 bg-[#121215]' : 'border-neutral-200 bg-neutral-50'}`}>
                {selectedCabinetAchievement ? (
                  <div className="space-y-1">
                    <div className="flex items-center justify-between">
                      <h4 className={`text-xs font-black flex items-center gap-1.5 ${isDark ? 'text-white' : 'text-neutral-900'}`}>
                        <span>{getAchievementIcon(selectedCabinetAchievement.id, undefined, "w-4 h-4")}</span>
                        <span>{selectedCabinetAchievement.title}</span>
                      </h4>
                      <span className={`text-[8px] font-black uppercase tracking-widest px-2 py-0.5 rounded-md border ${
                        (profileUser.unlockedAchievements || []).some(ua => ua.id === selectedCabinetAchievement.id)
                          ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                          : (isDark ? 'bg-neutral-800/60 text-neutral-500 border-neutral-750' : 'bg-neutral-100 text-neutral-500 border-neutral-250')
                      }`}>
                        {(profileUser.unlockedAchievements || []).some(ua => ua.id === selectedCabinetAchievement.id) ? 'Terbuka' : 'Terkunci'}
                      </span>
                    </div>
                    <p className={`text-[10px] font-medium leading-relaxed ${isDark ? 'text-neutral-400' : 'text-neutral-600'}`}>
                      {selectedCabinetAchievement.description}
                    </p>
                    <div className={`text-[9px] font-black uppercase tracking-widest ${isDark ? 'text-indigo-400' : 'text-indigo-650'}`}>
                      🎁 Reward: +{selectedCabinetAchievement.xpReward} XP
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
                    setViewMode('profile');
                    setSelectedCabinetAchievement(null);
                  }}
                  className={`w-full py-3 px-6 rounded-full border font-extrabold text-xs tracking-wider uppercase transition-all flex items-center justify-center gap-2 ${isDark ? 'bg-neutral-900 border-neutral-800 hover:bg-neutral-850 hover:text-white text-neutral-350' : 'bg-neutral-100 border-neutral-200 hover:bg-neutral-200 hover:text-neutral-950 text-neutral-700'}`}
                >
                  Kembali ke Profil <User className="w-3.5 h-3.5" />
                </button>
              </div>
            </motion.div>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

const renderCustomTitleBadge = (title: string | undefined | null, isDark: boolean) => {
  if (!title) return null;
  const upper = title.toUpperCase();
  
  // Clean emojis and trim extra spacing
  const cleanTitle = title
    .replace(/👑|🔥|⭐|🎯|🛡️/g, '')
    .replace(/[\u{1F300}-\u{1F9FF}]|[\u{2700}-\u{27BF}]|[\u{1F600}-\u{1F64F}]|[\u{1F680}-\u{1F6FF}]|[\u{2600}-\u{26FF}]/gu, '')
    .trim();

  if (upper.includes('DEVELOPER') || upper.includes('DEV')) {
    return (
      <motion.span 
        animate={{ 
          boxShadow: isDark 
            ? ["0 0 4px rgba(239,68,68,0.2)", "0 0 12px rgba(239,68,68,0.5)", "0 0 4px rgba(239,68,68,0.2)"]
            : ["0 0 2px rgba(239,68,68,0.1)", "0 0 8px rgba(239,68,68,0.25)", "0 0 2px rgba(239,68,68,0.1)"]
        }}
        transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
        className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 text-[8.5px] font-black tracking-widest uppercase rounded-md border select-none relative overflow-hidden ${
          isDark 
            ? 'bg-red-500/10 border-red-500/40 text-red-400' 
            : 'bg-red-50 border-red-200 text-red-650 shadow-red-200/20'
        }`}
      >
        <Terminal className="w-2.5 h-2.5 text-red-500 animate-pulse" />
        <span>{cleanTitle}</span>
      </motion.span>
    );
  }

  if (upper.includes('SUHU') || upper.includes('🔥') || upper.includes('FIRE')) {
    return (
      <motion.span 
        animate={{ 
          boxShadow: isDark 
            ? ["0 0 4px rgba(245,158,11,0.2)", "0 0 12px rgba(245,158,11,0.5)", "0 0 4px rgba(245,158,11,0.2)"]
            : ["0 0 2px rgba(245,158,11,0.1)", "0 0 8px rgba(245,158,11,0.25)", "0 0 2px rgba(245,158,11,0.1)"]
        }}
        transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
        className={`inline-flex items-center gap-1 px-2 py-0.5 text-[8.5px] font-black tracking-wider uppercase rounded-md border select-none relative overflow-hidden ${
          isDark 
            ? 'bg-amber-500/10 border-amber-500/40 text-amber-400' 
            : 'bg-amber-50 border-amber-200 text-amber-650 shadow-amber-200/20'
        }`}
      >
        <Flame className="w-2.5 h-2.5 text-amber-500 animate-bounce" />
        <span>{cleanTitle}</span>
      </motion.span>
    );
  }

  if (upper.includes('VIP') || upper.includes('👑') || upper.includes('⭐') || upper.includes('CROWN')) {
    return (
      <motion.span 
        animate={{ 
          boxShadow: isDark 
            ? ["0 0 4px rgba(139,92,246,0.2)", "0 0 12px rgba(139,92,246,0.5)", "0 0 4px rgba(139,92,246,0.2)"]
            : ["0 0 2px rgba(139,92,246,0.1)", "0 0 8px rgba(139,92,246,0.25)", "0 0 2px rgba(139,92,246,0.1)"]
        }}
        transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
        className={`inline-flex items-center gap-1 px-2 py-0.5 text-[8.5px] font-black tracking-wider uppercase rounded-md border select-none relative overflow-hidden ${
          isDark 
            ? 'bg-violet-500/10 border-violet-500/40 text-violet-300' 
            : 'bg-violet-50 border-violet-200 text-violet-650 shadow-violet-200/20'
        }`}
      >
        <Crown className="w-2.5 h-2.5 text-violet-400" />
        <span>{cleanTitle}</span>
      </motion.span>
    );
  }

  return (
    <span className={`inline-flex items-center gap-1 px-1.5 py-0.5 text-[8.5px] font-black tracking-wider uppercase rounded-md border select-none ${
      isDark 
        ? 'bg-violet-650/45 border-violet-500/35 text-violet-300 shadow-sm' 
        : 'bg-violet-50 border-violet-200 text-violet-650 shadow-sm'
    }`}>
      <Sparkles className="w-2.5 h-2.5 text-violet-400" />
      <span>{cleanTitle}</span>
    </span>
  );
};

export default function LeaderboardPage() {
  const router = useRouter();
  const { user, theme, league } = useAppStore();
  const isDark = theme === 'dark';
  const [usersList, setUsersList] = useState<PublicUserProfile[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [error, setError] = useState<string | null>(null);

  // Weekly Countdown state
  const [weeklyTimeLeft, setWeeklyTimeLeft] = useState('');
  
  // League Selector state
  const [selectedLeague, setSelectedLeague] = useState<'bronze' | 'silver' | 'gold' | 'diamond'>('bronze');

  // Duel Fokus Modal states
  const [isDuelOpen, setIsDuelOpen] = useState(false);
  const [selectedDuelOpponent, setSelectedDuelOpponent] = useState<any>(null);

  // Profile Card Modal states
  const [isProfileCardOpen, setIsProfileCardOpen] = useState(false);
  const [selectedProfileCardUser, setSelectedProfileCardUser] = useState<PublicUserProfile | null>(null);

  const handleAvatarClick = (clickedUser: PublicUserProfile) => {
    playMechanicalClick();
    setSelectedProfileCardUser(clickedUser);
    setIsProfileCardOpen(true);
  };

  // Sync user's selected league to their own current league initially
  useEffect(() => {
    if (league) {
      setSelectedLeague(league);
    }
  }, [league]);

  // Weekly reset countdown timer (counting down to next Sunday 23:59:59)
  useEffect(() => {
    const updateCountdown = () => {
      const now = new Date();
      const nextSunday = new Date();
      nextSunday.setDate(now.getDate() + (7 - now.getDay()) % 7);
      nextSunday.setHours(23, 59, 59, 999);
      
      if (nextSunday.getTime() <= now.getTime()) {
        nextSunday.setDate(nextSunday.getDate() + 7);
      }

      const diff = nextSunday.getTime() - now.getTime();
      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);

      setWeeklyTimeLeft(`${days}h ${hours}j ${minutes}m ${seconds}d`);
    };

    updateCountdown();
    const interval = setInterval(updateCountdown, 1000);
    return () => clearInterval(interval);
  }, []);

  const fetchLeaderboard = () => {
    setIsLoading(true);
    setError(null);
    getAllUserProfiles()
      .then((profiles) => {
        // Sort users by totalXP descending
        const sorted = profiles.sort((a, b) => b.totalXP - a.totalXP);
        setUsersList(sorted);
      })
      .catch((err) => {
        console.error(err);
        setError('Gagal memuat papan peringkat. Pastikan aturan keamanan Firebase Anda mengizinkan.');
      })
      .finally(() => setIsLoading(false));
  };

  useEffect(() => {
    fetchLeaderboard();
  }, []);

  const handleStartDuel = (opponentUser: any) => {
    playMechanicalClick();
    setSelectedDuelOpponent(opponentUser);
    setIsDuelOpen(true);
  };

  // Helper to categorize users into leagues based on XP range if league is missing
  const getUserLeague = (u: PublicUserProfile): 'bronze' | 'silver' | 'gold' | 'diamond' => {
    if (u.league) return u.league;
    if (u.totalXP <= 250) return 'bronze';
    if (u.totalXP <= 750) return 'silver';
    if (u.totalXP <= 1500) return 'gold';
    return 'diamond';
  };

  // Filter list by search query
  const filteredUsers = usersList.filter(u => 
    u.displayName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Filter users inside the selected league
  const leagueUsers = filteredUsers.filter(u => getUserLeague(u) === selectedLeague);

  // Top 3 Podium in this league
  const top1 = leagueUsers[0];
  const top2 = leagueUsers[1];
  const top3 = leagueUsers[2];
  
  // Other ranked users in this league
  const restUsers = leagueUsers.slice(3);

  // Get current user rank index within selected league
  const currentUserRankInLeague = leagueUsers.findIndex(u => u.uid === user?.uid) + 1;

  return (
    <div className="space-y-6 pb-16">
      
      {/* Header Premium Glassmorphism */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="card-glass border p-6 relative overflow-hidden"
        style={{
          boxShadow: 'var(--shadow-md)',
          background: 'var(--glass-bg)',
          borderColor: 'var(--glass-border)'
        }}
      >
        <div className="absolute -top-24 -right-24 w-64 h-64 bg-violet-600/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -left-24 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col md:flex-row items-center md:items-start justify-between gap-6 relative z-10">
          <div className="flex flex-col md:flex-row items-center md:items-start gap-4 text-center md:text-left">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center shadow-lg shadow-indigo-500/20">
              <Crown className="w-7 h-7 text-white animate-pulse" />
            </div>
            <div>
              <h1 className="text-xl font-bold flex items-center justify-center md:justify-start gap-2" style={{ color: 'var(--text-primary)' }}>
                Liga Disiplin Utama
              </h1>
              <p className="text-xs mt-1 max-w-sm" style={{ color: 'var(--text-secondary)' }}>
                Papan peringkat liga pejuang disiplin komunitas. Tingkatkan XP dengan kebiasaan harian dan tantang pejuang lain untuk duel fokus!
              </p>
            </div>
          </div>

          <div className="flex items-center gap-6 divide-x divide-[var(--border)] border-t md:border-t-0 pt-4 md:pt-0 w-full md:w-auto justify-around md:justify-end">
            {user && currentUserRankInLeague > 0 && (
              <div className="text-center md:text-right px-4 first:pl-0">
                <span className="text-[9px] uppercase font-bold tracking-wider" style={{ color: 'var(--text-muted)' }}>
                  Peringkat Liga Anda
                </span>
                <div className="text-2xl font-extrabold flex items-center justify-center md:justify-end gap-1 mt-0.5 text-indigo-400">
                  <span>#{currentUserRankInLeague}</span>
                  <span className="text-[10px] text-[var(--text-muted)] font-medium">dari {leagueUsers.length}</span>
                </div>
              </div>
            )}
            
            <div className="text-center md:text-right px-4">
              <button 
                onClick={fetchLeaderboard}
                className={`p-2 rounded-xl border transition-all flex items-center gap-1.5 text-xs font-bold ${
                  isDark
                    ? 'border-neutral-800 bg-neutral-900/60 hover:bg-neutral-800/60 text-indigo-400 hover:text-indigo-300'
                    : 'border-neutral-250 bg-white hover:bg-neutral-50 text-indigo-600 hover:text-indigo-700 shadow-sm'
                }`}
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
                Segarkan
              </button>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Hitung Mundur Reset Liga & Pemilih Liga */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        
        {/* Reset Countdown Card */}
        <motion.div
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          className={`p-4 rounded-2xl border flex items-center justify-between gap-4 px-5 ${
            isDark 
              ? 'bg-neutral-900/40 border-neutral-800' 
              : 'bg-white border-neutral-200 shadow-sm'
          }`}
        >
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-indigo-500/10 flex items-center justify-center">
              <Timer className="w-4 h-4 text-indigo-500" />
            </div>
            <div>
              <h3 className="text-[10px] font-black uppercase tracking-wider text-neutral-500">Hitung Mundur Reset Liga</h3>
              <p className={`text-[10px] ${isDark ? 'text-neutral-400' : 'text-neutral-500'}`}>
                Promosi & degradasi dieksekusi setiap hari Minggu pukul 23:59.
              </p>
            </div>
          </div>
          <div className={`px-3 py-1.5 rounded-xl font-black text-xs tracking-wider tabular-nums border flex items-center gap-1.5 ${
            isDark 
              ? 'bg-neutral-950 border-neutral-800 text-indigo-400' 
              : 'bg-indigo-50 border-indigo-150 text-indigo-600'
          }`}>
            <Clock className="w-3.5 h-3.5" />
            {weeklyTimeLeft}
          </div>
        </motion.div>

        {/* League Selector Card */}
        <motion.div
          initial={{ opacity: 0, x: 10 }}
          animate={{ opacity: 1, x: 0 }}
          className={`p-1.5 rounded-2xl border flex items-center justify-around gap-1 ${
            isDark 
              ? 'bg-neutral-900/40 border-neutral-800' 
              : 'bg-white border-neutral-200 shadow-sm'
          }`}
        >
          {[
            { id: 'bronze', label: 'Perunggu', icon: Medal, color: 'text-amber-650' },
            { id: 'silver', label: 'Perak', icon: Award, color: 'text-slate-400' },
            { id: 'gold', label: 'Emas', icon: Trophy, color: 'text-yellow-500' },
            { id: 'diamond', label: 'Berlian', icon: Gem, color: 'text-cyan-400' }
          ].map((l) => {
            const isActive = selectedLeague === l.id;
            const isUserLeague = league === l.id;
            const IconComponent = l.icon;

            return (
              <button
                key={l.id}
                onClick={() => {
                  playMechanicalClick();
                  setSelectedLeague(l.id as any);
                }}
                className={`flex-1 py-2 px-1 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all flex flex-col sm:flex-row items-center justify-center gap-1.5 relative ${
                  isActive
                    ? (isDark ? 'bg-neutral-800 text-white border border-neutral-700' : 'bg-neutral-100 text-neutral-950 shadow-sm border border-neutral-250')
                    : 'text-neutral-500 hover:text-neutral-450'
                }`}
              >
                <IconComponent className="w-4 h-4 flex-shrink-0" />
                <span className={`hidden sm:inline ${l.color}`}>{l.label}</span>
                {isUserLeague && (
                  <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-pulse sm:absolute sm:top-2 sm:right-2" />
                )}
              </button>
            );
          })}
        </motion.div>

      </div>

      {error ? (
        <div className="card border border-red-500/30 p-5 bg-red-950/10 text-center space-y-3">
          <AlertCircle className="w-8 h-8 text-red-400 mx-auto animate-bounce" />
          <p className="text-sm font-bold text-red-400">{error}</p>
          <button 
            onClick={fetchLeaderboard}
            className="px-4 py-2 bg-red-950/40 text-red-300 border border-red-500/20 rounded-xl hover:bg-red-900/40 text-xs font-semibold"
          >
            Coba Lagi
          </button>
        </div>
      ) : isLoading ? (
        <div className="space-y-6 py-12 text-center">
          <div className="w-10 h-10 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-sm text-neutral-400 font-semibold animate-pulse">Menghubungkan ke Liga Disiplin...</p>
        </div>
      ) : (
        <div className="space-y-8">
          
          {/* Top 3 Podium Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-end pt-8 px-2">
            
            {/* 2nd Place */}
            {top2 && (
              <motion.div 
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className={`card p-5 relative flex flex-col items-center text-center order-2 md:order-1 ${
                  isDark ? 'border-indigo-500/10' : 'border-slate-200 shadow-sm'
                }`}
                style={{ 
                  background: isDark 
                    ? 'linear-gradient(180deg, rgba(226, 232, 240, 0.05) 0%, rgba(10, 10, 10, 0.9) 100%)' 
                    : 'linear-gradient(180deg, rgba(148, 163, 184, 0.06) 0%, rgba(248, 250, 252, 0.95) 100%)',
                  boxShadow: isDark ? '0 8px 30px rgba(226, 232, 240, 0.03)' : '0 8px 30px rgba(0, 0, 0, 0.04)'
                }}
              >
                <div className="absolute -top-5 w-9 h-9 rounded-full bg-slate-400 flex items-center justify-center shadow-lg font-black text-slate-900 border-2 border-slate-300 text-xs">
                  2
                </div>
                <CommunityAvatar photoURL={top2.photoURL} displayName={top2.displayName} className="w-14 h-14 border-2 border-slate-400 mb-3" onClick={() => handleAvatarClick(top2)} />
                <h3 className={`text-xs font-black truncate w-full px-1 text-center block ${isDark ? 'text-white' : 'text-neutral-900'}`} title={top2.displayName}>{top2.displayName}</h3>
                {top2.customTitle && (
                  <div className="mt-1.5 flex justify-center">
                    {renderCustomTitleBadge(top2.customTitle, isDark)}
                  </div>
                )}
                {top2.email === 'mwildanfiqri88@gmail.com' && (
                  <span className="text-[8px] uppercase tracking-wider font-extrabold text-violet-500 flex items-center gap-0.5 mt-0.5 select-none">
                    <Terminal className="w-2.5 h-2.5" /> Dev Creator
                  </span>
                )}
                <div className="mt-3 flex flex-wrap justify-center gap-1.5">
                  <span className="px-2 py-0.5 rounded-full text-[9px] font-bold" style={getLevelBadgeStyle(getLevelFromXP(top2.totalXP).level, getLevelFromXP(top2.totalXP).color)}>
                    Lv.{getLevelFromXP(top2.totalXP).level}
                  </span>
                  <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold border ${
                    isDark 
                      ? 'bg-neutral-900 border-neutral-800 text-slate-300' 
                      : 'bg-neutral-100 border-neutral-200 text-slate-650'
                  }`}>
                    🏆 {(top2.unlockedAchievements || []).length} Piala
                  </span>
                </div>
                <p className={`text-xs font-black mt-2.5 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>{top2.totalXP.toLocaleString()} XP</p>
                
                {/* Challenge button */}
                {top2.uid !== user?.uid && (
                  <button
                    onClick={() => handleStartDuel(top2)}
                    className={`mt-3 px-3 py-1.5 rounded-xl border flex items-center gap-1.5 text-[9px] font-black uppercase tracking-wider transition-all select-none ${
                      isDark 
                        ? 'border-indigo-500/20 bg-indigo-950/20 hover:bg-indigo-900/30 text-indigo-400' 
                        : 'border-indigo-100 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 shadow-sm'
                    }`}
                  >
                    <Swords className="w-3 h-3" />
                    Tantang Duel
                  </button>
                )}
              </motion.div>
            )}

            {/* 1st Place */}
            {top1 && (
              <motion.div 
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                className={`card p-6 relative flex flex-col items-center text-center order-1 md:order-2 ${
                  isDark ? 'border-yellow-500/30' : 'border-yellow-400 shadow-md shadow-yellow-500/5'
                }`}
                style={{ 
                  background: isDark 
                    ? 'linear-gradient(180deg, rgba(234, 179, 8, 0.08) 0%, rgba(10, 10, 10, 0.9) 100%)' 
                    : 'linear-gradient(180deg, rgba(234, 179, 8, 0.12) 0%, rgba(254, 253, 247, 0.95) 100%)',
                  boxShadow: isDark ? '0 12px 40px rgba(234, 179, 8, 0.1)' : '0 12px 40px rgba(234, 179, 8, 0.12)'
                }}
              >
                <div className="absolute -top-6 w-10 h-10 rounded-full bg-yellow-500 flex items-center justify-center shadow-lg font-black text-slate-900 border-2 border-yellow-300 animate-bounce text-xs">
                  <Crown className="w-4.5 h-4.5" />
                </div>
                <CommunityAvatar photoURL={top1.photoURL} displayName={top1.displayName} className="w-16 h-16 border-2 border-yellow-500 mb-3 shadow-lg shadow-yellow-500/20" onClick={() => handleAvatarClick(top1)} />
                <h3 className={`text-sm font-black truncate w-full px-1 text-center block ${isDark ? 'text-white' : 'text-neutral-900'}`} title={top1.displayName}>{top1.displayName}</h3>
                {top1.customTitle && (
                  <div className="mt-1.5 flex justify-center">
                    {renderCustomTitleBadge(top1.customTitle, isDark)}
                  </div>
                )}
                {top1.email === 'mwildanfiqri88@gmail.com' && (
                  <span className="text-[8px] uppercase tracking-wider font-extrabold text-violet-500 flex items-center gap-0.5 mt-0.5 select-none animate-pulse">
                    <Terminal className="w-2.5 h-2.5" /> Dev Creator
                  </span>
                )}
                <div className="mt-3 flex flex-wrap justify-center gap-1.5">
                  <span className="px-2.5 py-0.5 rounded-full text-[9px] font-bold" style={getLevelBadgeStyle(getLevelFromXP(top1.totalXP).level, getLevelFromXP(top1.totalXP).color)}>
                    Lv.{getLevelFromXP(top1.totalXP).level}
                  </span>
                  <span className={`px-2.5 py-0.5 rounded-full text-[9px] font-bold border ${
                    isDark 
                      ? 'bg-neutral-900 border-neutral-800 text-yellow-400' 
                      : 'bg-amber-50 border-amber-200 text-amber-700'
                  }`}>
                    🏆 {(top1.unlockedAchievements || []).length} Piala
                  </span>
                </div>
                <p className="text-sm font-black text-amber-500 mt-2.5">{top1.totalXP.toLocaleString()} XP</p>

                {/* Challenge button */}
                {top1.uid !== user?.uid && (
                  <button
                    onClick={() => handleStartDuel(top1)}
                    className={`mt-3 px-4 py-1.5 rounded-xl border flex items-center gap-1.5 text-[9px] font-black uppercase tracking-wider transition-all select-none ${
                      isDark 
                        ? 'border-yellow-500/20 bg-yellow-950/20 hover:bg-yellow-900/30 text-yellow-400' 
                        : 'border-yellow-100 bg-amber-50 hover:bg-amber-100 text-amber-700 shadow-sm shadow-yellow-500/5'
                    }`}
                  >
                    <Swords className="w-3 h-3 animate-pulse" />
                    Tantang Juara
                  </button>
                )}
              </motion.div>
            )}

            {/* 3rd Place */}
            {top3 && (
              <motion.div 
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.15 }}
                className={`card p-5 relative flex flex-col items-center text-center order-3 ${
                  isDark ? 'border-amber-600/10' : 'border-amber-500/20 shadow-sm'
                }`}
                style={{ 
                  background: isDark 
                    ? 'linear-gradient(180deg, rgba(217, 119, 6, 0.05) 0%, rgba(10, 10, 10, 0.9) 100%)' 
                    : 'linear-gradient(180deg, rgba(217, 119, 6, 0.08) 0%, rgba(254, 250, 246, 0.95) 100%)',
                  boxShadow: isDark ? '0 8px 30px rgba(217, 119, 6, 0.03)' : '0 8px 30px rgba(0, 0, 0, 0.04)'
                }}
              >
                <div className="absolute -top-5 w-9 h-9 rounded-full bg-amber-600 flex items-center justify-center shadow-lg font-black text-slate-900 border-2 border-amber-500 text-xs">
                  3
                </div>
                <CommunityAvatar photoURL={top3.photoURL} displayName={top3.displayName} className="w-14 h-14 border-2 border-amber-600 mb-3" onClick={() => handleAvatarClick(top3)} />
                <h3 className={`text-xs font-black truncate w-full px-1 text-center block ${isDark ? 'text-white' : 'text-neutral-900'}`} title={top3.displayName}>{top3.displayName}</h3>
                {top3.customTitle && (
                  <div className="mt-1.5 flex justify-center">
                    {renderCustomTitleBadge(top3.customTitle, isDark)}
                  </div>
                )}
                {top3.email === 'mwildanfiqri88@gmail.com' && (
                  <span className="text-[8px] uppercase tracking-wider font-extrabold text-violet-500 flex items-center gap-0.5 mt-0.5 select-none">
                    <Terminal className="w-2.5 h-2.5" /> Dev Creator
                  </span>
                )}
                <div className="mt-3 flex flex-wrap justify-center gap-1.5">
                  <span className="px-2.5 py-0.5 rounded-full text-[9px] font-bold" style={getLevelBadgeStyle(getLevelFromXP(top3.totalXP).level, getLevelFromXP(top3.totalXP).color)}>
                    Lv.{getLevelFromXP(top3.totalXP).level}
                  </span>
                  <span className={`px-2.5 py-0.5 rounded-full text-[9px] font-bold border ${
                    isDark 
                      ? 'bg-neutral-900 border-neutral-800 text-amber-500' 
                      : 'bg-orange-50 border-orange-200 text-orange-705'
                  }`}>
                    🏆 {(top3.unlockedAchievements || []).length} Piala
                  </span>
                </div>
                <p className="text-xs font-black text-amber-600 mt-2.5">{top3.totalXP.toLocaleString()} XP</p>

                {/* Challenge button */}
                {top3.uid !== user?.uid && (
                  <button
                    onClick={() => handleStartDuel(top3)}
                    className={`mt-3 px-3 py-1.5 rounded-xl border flex items-center gap-1.5 text-[9px] font-black uppercase tracking-wider transition-all select-none ${
                      isDark 
                        ? 'border-amber-500/20 bg-amber-950/20 hover:bg-amber-900/30 text-amber-500' 
                        : 'border-amber-100 bg-orange-50 hover:bg-orange-100 text-orange-700 shadow-sm'
                    }`}
                  >
                    <Swords className="w-3 h-3" />
                    Tantang Duel
                  </button>
                )}
              </motion.div>
            )}

          </div>

          {/* Search bar */}
          <div className="relative flex items-center max-w-md mx-auto w-full px-2">
            <Search className="absolute left-5 w-4 h-4 text-neutral-400 pointer-events-none" />
            <input
              type="text"
              placeholder="Cari kedudukan pejuang disiplin..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-11 pr-4 py-3 rounded-2xl text-xs outline-none transition-all"
              style={{
                background: 'var(--bg-secondary)',
                border: '1px solid var(--border)',
                color: 'var(--text-primary)',
              }}
            />
          </div>

          {/* Leaderboard Rankings List */}
          <div className="space-y-3 px-2">
            {leagueUsers.length === 0 ? (
              <div className="card p-8 text-center text-neutral-400 font-semibold">
                Tidak ada pejuang disiplin yang ditemukan di Liga {selectedLeague.toUpperCase()}.
              </div>
            ) : (
              <div className="card p-2 space-y-1">
                
                {/* Header row */}
                <div className={`grid grid-cols-12 gap-2 px-4 py-2.5 text-[10px] font-black uppercase tracking-wider text-neutral-500 border-b ${
                  isDark ? 'border-neutral-800/40' : 'border-neutral-200'
                }`}>
                  <div className="col-span-2 sm:col-span-2 text-center">
                    <span className="hidden sm:inline">Peringkat</span>
                    <span className="sm:hidden">#</span>
                  </div>
                  <div className="col-span-6 sm:col-span-4">Pengguna</div>
                  <div className="hidden sm:block sm:col-span-2 text-center">Level</div>
                  <div className="col-span-2 sm:col-span-2 text-right">
                    <span className="hidden sm:inline">Total XP</span>
                    <span className="sm:hidden">XP</span>
                  </div>
                  <div className="col-span-2 sm:col-span-2 text-center">Duel</div>
                </div>

                {/* Rest of the list */}
                {leagueUsers.map((u, index) => {
                  const rank = index + 1;
                  const isSelf = u.uid === user?.uid;
                  const levelInfo = getLevelFromXP(u.totalXP);

                  return (
                    <div 
                      key={u.uid}
                      className={`grid grid-cols-12 gap-2 items-center px-4 py-3 rounded-xl transition-all border ${
                        isSelf 
                          ? (isDark ? 'bg-indigo-950/20 border-indigo-500/20' : 'bg-indigo-50 border-indigo-200') 
                          : (isDark ? 'hover:bg-neutral-800/10 border-transparent' : 'hover:bg-neutral-50 border-transparent')
                      }`}
                    >
                      {/* Rank Indicator with promotion/demotion labels */}
                      <div className="col-span-2 sm:col-span-2 flex flex-col items-center justify-center">
                        <span className="font-black text-xs text-neutral-400">#{rank}</span>
                        {rank <= 3 ? (
                          <span className="text-[7px] font-black uppercase tracking-widest text-emerald-500 flex items-center gap-0.5 mt-0.5">
                            ▲ Promosi
                          </span>
                        ) : rank <= 5 ? (
                          <span className="text-[7px] font-black uppercase tracking-widest text-slate-400 flex items-center gap-0.5 mt-0.5">
                            • Aman
                          </span>
                        ) : (
                          <span className="text-[7px] font-black uppercase tracking-widest text-rose-550 flex items-center gap-0.5 mt-0.5">
                            ▼ Turun
                          </span>
                        )}
                      </div>

                      {/* User Info */}
                      <div className="col-span-6 sm:col-span-4 flex items-center gap-3 min-w-0">
                        <CommunityAvatar photoURL={u.photoURL} displayName={u.displayName} className="w-8 h-8 flex-shrink-0" onClick={() => handleAvatarClick(u)} />
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <p className={`text-xs font-bold truncate ${isDark ? 'text-white' : 'text-neutral-900'}`}>{u.displayName}</p>
                            {renderCustomTitleBadge(u.customTitle, isDark)}
                            {u.email === 'mwildanfiqri88@gmail.com' && (
                              <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded bg-violet-600/20 text-violet-300 border border-violet-500/20 text-[8px] font-black uppercase select-none">
                                Dev
                              </span>
                            )}
                            <span className="inline-block sm:hidden px-1.5 py-0.5 rounded-full text-[8px] font-bold" style={getLevelBadgeStyle(levelInfo.level, levelInfo.color)}>
                              Lv.{levelInfo.level}
                            </span>
                          </div>
                          <span className="text-[9px] font-semibold text-neutral-500">
                            🏆 {(u.unlockedAchievements || []).length} Piala
                          </span>
                        </div>
                      </div>

                      {/* Level */}
                      <div className="hidden sm:block sm:col-span-2 text-center">
                        <span className="px-2 py-0.5 rounded-full text-[9px] font-bold" style={getLevelBadgeStyle(levelInfo.level, levelInfo.color)}>
                          Lv.{levelInfo.level}
                        </span>
                      </div>

                      {/* Total XP */}
                      <div className={`col-span-2 sm:col-span-2 text-right text-xs font-extrabold ${isDark ? 'text-neutral-300' : 'text-neutral-700'}`}>
                        {u.totalXP.toLocaleString()} XP
                      </div>

                      {/* Duel Action Button */}
                      <div className="col-span-2 sm:col-span-2 flex justify-center">
                        {!isSelf ? (
                          <button 
                            onClick={() => handleStartDuel(u)}
                            className={`p-2 rounded-xl border flex items-center justify-center gap-1 text-[9px] font-black uppercase tracking-wider transition-all select-none ${
                              isDark 
                                ? 'border-indigo-500/20 bg-indigo-950/20 hover:bg-indigo-900/30 text-indigo-400' 
                                : 'border-indigo-100 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 shadow-sm'
                            }`}
                            title={`Tantang ${u.displayName} Duel Fokus`}
                          >
                            <Swords className="w-3.5 h-3.5" />
                            <span className="hidden sm:inline">Tantang</span>
                          </button>
                        ) : (
                          <span className="text-[9px] font-black text-neutral-500 uppercase tracking-widest select-none">
                            Anda
                          </span>
                        )}
                      </div>

                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Active Features Info Tray */}
          <div className={`card p-6 border space-y-4 px-4 max-w-4xl mx-auto ${
            isDark 
              ? 'bg-indigo-950/5 border-indigo-950/40' 
              : 'bg-indigo-50/50 border-indigo-100'
          }`}>
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-yellow-500 animate-pulse" />
              <h3 className={`text-sm font-extrabold ${isDark ? 'text-white' : 'text-indigo-950'}`}>
                Sistem Gamifikasi Liga Disiplin
              </h3>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className={`p-3 rounded-2xl border space-y-1.5 ${
                isDark 
                  ? 'bg-neutral-900/60 border-neutral-800/40' 
                  : 'bg-white border-neutral-200 shadow-sm'
              }`}>
                <Crown className="w-4 h-4 text-yellow-500 animate-bounce" />
                <h4 className={`text-xs font-bold ${isDark ? 'text-white' : 'text-neutral-900'}`}>1. Liga Mingguan</h4>
                <p className={`text-[10px] leading-relaxed ${isDark ? 'text-neutral-400' : 'text-neutral-500'}`}>
                  Membagi kedudukan pejuang dalam 4 tingkat liga (Bronze, Silver, Gold, Diamond) dengan lencana promosi & degradasi interaktif!
                </p>
              </div>

              <div className={`p-3 rounded-2xl border space-y-1.5 ${
                isDark 
                  ? 'bg-neutral-900/60 border-neutral-800/40' 
                  : 'bg-white border-neutral-200 shadow-sm'
              }`}>
                <Flame className="w-4 h-4 text-orange-500 animate-pulse" />
                <h4 className={`text-xs font-bold ${isDark ? 'text-white' : 'text-neutral-900'}`}>2. Streak XP Multiplier 1.2x</h4>
                <p className={`text-[10px] leading-relaxed ${isDark ? 'text-neutral-400' : 'text-neutral-500'}`}>
                  Jaga streak disiplin harian Anda minimal 7 hari berturut-turut untuk mengaktifkan pelipat ganda XP 1.2x pada seluruh perolehan!
                </p>
              </div>

              <div className={`p-3 rounded-2xl border space-y-1.5 ${
                isDark 
                  ? 'bg-neutral-900/60 border-neutral-800/40' 
                  : 'bg-white border-neutral-200 shadow-sm'
              }`}>
                <Swords className="w-4 h-4 text-rose-500" />
                <h4 className={`text-xs font-bold ${isDark ? 'text-white' : 'text-neutral-900'}`}>3. Duel Fokus 1v1 Pomodoro</h4>
                <p className={`text-[10px] leading-relaxed ${isDark ? 'text-neutral-400' : 'text-neutral-500'}`}>
                  Tantang pejuang lain dalam sesi fokus Pomodoro 25 Menit live. Tuntaskan tanpa gangguan untuk mengklaim **+100 XP Bonus Liga**!
                </p>
              </div>
            </div>
          </div>

        </div>
      )}

      {/* Focus Duel Modal Container */}
      {selectedDuelOpponent && (
        <FocusDuelModal
          isOpen={isDuelOpen}
          onClose={() => {
            setIsDuelOpen(false);
            setSelectedDuelOpponent(null);
            fetchLeaderboard(); // Refresh scores in case they completed a duel!
          }}
          opponent={{
            uid: selectedDuelOpponent.uid,
            displayName: selectedDuelOpponent.displayName,
            photoURL: selectedDuelOpponent.photoURL,
            totalXP: selectedDuelOpponent.totalXP,
            disciplineStreak: selectedDuelOpponent.disciplineStreak || 0
          }}
        />
      )}

      {/* User Profile Card Modal Container */}
      {selectedProfileCardUser && (
        <UserProfileCardModal
          isOpen={isProfileCardOpen}
          onClose={() => {
            setIsProfileCardOpen(false);
            setSelectedProfileCardUser(null);
          }}
          profileUser={selectedProfileCardUser}
          isSelf={selectedProfileCardUser.uid === user?.uid}
          onChallenge={() => {
            handleStartDuel(selectedProfileCardUser);
          }}
          isDark={isDark}
        />
      )}

    </div>
  );
}
