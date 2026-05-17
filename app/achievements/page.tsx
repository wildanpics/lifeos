'use client';

import { motion } from 'framer-motion';
import { useAppStore } from '@/store/useAppStore';
import { ACHIEVEMENTS } from '@/lib/constants/achievements';
import { 
  Trophy, Lock, Sparkles, Award, Star, Zap, HelpCircle, LockKeyhole,
  Sunrise, Droplets, Target, Medal, Crown, Moon, Timer, Activity,
  Flame, Sun, Heart, Smartphone, Shield
} from 'lucide-react';
import { cn } from '@/lib/utils';

export default function AchievementsPage() {
  const { unlockedAchievements } = useAppStore();
  
  const unlockedIds = unlockedAchievements.map(a => a.id);
  const total = ACHIEVEMENTS.length;
  const unlocked = unlockedIds.length;
  const percentage = Math.round((unlocked / total) * 100);

  const getCategoryDetails = (category: string) => {
    switch (category) {
      case 'habit':
        return {
          label: 'Kebiasaan',
          icon: <Activity className="w-3.5 h-3.5" />,
          color: '#10B981', // Emerald
          gradient: 'from-emerald-500 to-teal-600',
          bgClass: 'from-emerald-500/5 via-transparent to-transparent',
          borderClass: 'hover:border-emerald-500/40 focus:border-emerald-500/40',
          badgeBg: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20 dark:border-emerald-500/10',
          glowColor: 'rgba(16, 185, 129, 0.15)'
        };
      case 'focus':
        return {
          label: 'Fokus',
          icon: <Timer className="w-3.5 h-3.5" />,
          color: '#6366F1', // Indigo
          gradient: 'from-indigo-500 to-purple-600',
          bgClass: 'from-indigo-500/5 via-transparent to-transparent',
          borderClass: 'hover:border-indigo-500/40 focus:border-indigo-500/40',
          badgeBg: 'bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border-indigo-500/20 dark:border-indigo-500/10',
          glowColor: 'rgba(99, 102, 241, 0.15)'
        };
      case 'milestone':
        return {
          label: 'Milestone',
          icon: <Zap className="w-3.5 h-3.5" />,
          color: '#06B6D4', // Cyan
          gradient: 'from-cyan-500 to-blue-600',
          bgClass: 'from-cyan-500/5 via-transparent to-transparent',
          borderClass: 'hover:border-cyan-500/40 focus:border-cyan-500/40',
          badgeBg: 'bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border-cyan-500/20 dark:border-cyan-500/10',
          glowColor: 'rgba(6, 182, 212, 0.15)'
        };
      case 'special':
      default:
        return {
          label: 'Istimewa',
          icon: <Award className="w-3.5 h-3.5" />,
          color: '#F59E0B', // Amber
          gradient: 'from-amber-500 to-yellow-600',
          bgClass: 'from-amber-500/5 via-transparent to-transparent',
          borderClass: 'hover:border-amber-500/40 focus:border-amber-500/40',
          badgeBg: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20 dark:border-amber-500/10',
          glowColor: 'rgba(245, 158, 11, 0.15)'
        };
    }
  };

  const getAchievementIcon = (id: string, color: string) => {
    const sizeClass = "w-9 h-9 stroke-[1.75]";
    switch (id) {
      case 'first_step':
        return <Sunrise className={sizeClass} style={{ color }} />;
      case 'hydration_master':
        return <Droplets className={sizeClass} style={{ color }} />;
      case 'deep_worker':
        return <Target className={sizeClass} style={{ color }} />;
      case 'focus_beast':
        return <Flame className={sizeClass} style={{ color }} />;
      case 'morning_champion':
        return <Sun className={sizeClass} style={{ color }} />;
      case 'mindfulness_master':
        return <Heart className={sizeClass} style={{ color }} />;
      case 'screen_time_slayer':
        return <Smartphone className={sizeClass} style={{ color }} />;
      case 'loop_breaker':
        return <Shield className={sizeClass} style={{ color }} />;
      case 'completionist':
        return <Trophy className={sizeClass} style={{ color }} />;
      case 'veteran':
        return <Medal className={sizeClass} style={{ color }} />;
      case 'perfect_day':
        return <Crown className={sizeClass} style={{ color }} />;
      case 'night_owl_no_more':
        return <Moon className={sizeClass} style={{ color }} />;
      default:
        return <Award className={sizeClass} style={{ color }} />;
    }
  };

  const totalXPAwarded = ACHIEVEMENTS.reduce((sum, ach) => sum + ach.xpReward, 0);
  const userXPAwarded = ACHIEVEMENTS.reduce((sum, ach) => {
    return sum + (unlockedIds.includes(ach.id) ? ach.xpReward : 0);
  }, 0);

  // Framer Motion layout variants
  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.08 }
    }
  };

  const cardVariants = {
    hidden: { opacity: 0, y: 30 },
    show: { 
      opacity: 1, 
      y: 0,
      transition: { type: 'spring', stiffness: 100, damping: 15 }
    }
  };

  return (
    <div className="space-y-6 pb-16">
      {/* Premium Glassmorphic Stats Header Card */}
      <motion.div 
        initial={{ opacity: 0, y: -25 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
        className="card-glass border p-6 relative overflow-hidden"
        style={{
          boxShadow: 'var(--shadow-md)',
          background: 'var(--glass-bg)',
          borderColor: 'var(--glass-border)'
        }}
      >
        {/* Subtle glowing mesh in background */}
        <div className="absolute -top-24 -right-24 w-64 h-64 bg-yellow-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -left-24 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col md:flex-row items-center md:items-start justify-between gap-6 relative z-10">
          <div className="flex flex-col md:flex-row items-center md:items-start gap-4 text-center md:text-left">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-amber-400 to-yellow-600 flex items-center justify-center shadow-lg shadow-yellow-500/20">
              <Trophy className="w-8 h-8 text-white animate-bounce-slow" />
            </div>
            <div>
              <h1 className="text-2xl font-bold flex items-center justify-center md:justify-start gap-2" style={{ color: 'var(--text-primary)' }}>
                Lemari Piala
              </h1>
              <p className="text-sm mt-1 max-w-md" style={{ color: 'var(--text-secondary)' }}>
                Galeri pencapaian kedisiplinan dan produktivitas Anda. Selesaikan target harian untuk membuka piala bergengsi!
              </p>
            </div>
          </div>

          <div className="flex items-center gap-6 divide-x divide-[var(--border)] border-t md:border-t-0 pt-4 md:pt-0 w-full md:w-auto justify-around md:justify-end">
            <div className="text-center md:text-right px-4 first:pl-0">
              <span className="text-[10px] uppercase font-bold tracking-wider" style={{ color: 'var(--text-muted)' }}>
                Piala Terbuka
              </span>
              <div className="text-3xl font-extrabold flex items-center justify-center md:justify-end gap-1 mt-0.5">
                <span className="gradient-text">{unlocked}</span>
                <span className="text-lg text-[var(--text-muted)] font-semibold">/{total}</span>
              </div>
            </div>
            
            <div className="text-center md:text-right px-4">
              <span className="text-[10px] uppercase font-bold tracking-wider" style={{ color: 'var(--text-muted)' }}>
                XP Diperoleh
              </span>
              <div className="text-3xl font-extrabold flex items-center justify-center md:justify-end gap-1 mt-0.5 text-yellow-500">
                <span>{userXPAwarded}</span>
                <span className="text-xs text-[var(--text-muted)] font-medium">/{totalXPAwarded} XP</span>
              </div>
            </div>
          </div>
        </div>

        {/* Custom Glowing Progress Bar */}
        <div className="mt-6 space-y-2">
          <div className="flex justify-between items-center text-xs font-semibold">
            <span style={{ color: 'var(--text-secondary)' }}>Kemajuan Koleksi</span>
            <span style={{ color: 'var(--accent)' }}>{percentage}% Terkumpul</span>
          </div>
          <div className="w-full h-3.5 rounded-full p-0.5 overflow-hidden border border-[var(--border)] bg-slate-900/10 dark:bg-black/20">
            <motion.div 
              className="h-full rounded-full relative"
              style={{ background: 'linear-gradient(90deg, #F59E0B, #FBBF24, #F59E0B)' }}
              initial={{ width: 0 }}
              animate={{ width: `${percentage}%` }}
              transition={{ duration: 1.2, ease: 'easeOut' }}
            >
              {/* Inner glowing pulse */}
              <div className="absolute inset-0 bg-white/20 animate-pulse rounded-full" />
              <div className="absolute top-0 right-0 w-2 h-full bg-white/60 blur-[1px] rounded-full" />
            </motion.div>
          </div>
        </div>
      </motion.div>

      {/* Staggered Grid */}
      <motion.div 
        variants={containerVariants}
        initial="hidden"
        animate="show"
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5"
      >
        {ACHIEVEMENTS.map((ach) => {
          const isUnlocked = unlockedIds.includes(ach.id);
          const unlockRecord = unlockedAchievements.find(a => a.id === ach.id);
          const isSecret = ach.secret && !isUnlocked;
          const cat = getCategoryDetails(ach.category);

          return (
            <motion.div
              key={ach.id}
              variants={cardVariants}
              whileHover={{ 
                y: -6, 
                boxShadow: isUnlocked ? `0 12px 30px ${cat.glowColor}` : '0 8px 25px rgba(0,0,0,0.15)',
                borderColor: isUnlocked ? cat.color : 'rgba(255,255,255,0.1)'
              }}
              className={cn(
                "relative p-6 rounded-2xl border transition-all duration-300 flex flex-col items-center text-center gap-4 overflow-hidden group select-none",
                isUnlocked 
                  ? "card shadow-sm hover:shadow-lg" 
                  : isSecret
                    ? "bg-gradient-to-br from-purple-950/20 via-slate-900/60 to-indigo-950/20 border-purple-900/20 dark:border-purple-900/10 opacity-70"
                    : "bg-slate-950/5 dark:bg-black/20 border-[var(--border)] opacity-60"
              )}
              style={{
                background: isUnlocked ? 'var(--bg-card)' : undefined,
                borderColor: isUnlocked ? `${cat.color}20` : undefined,
              }}
            >
              {/* Top border highlight glow */}
              {isUnlocked && (
                <div 
                  className="absolute top-0 left-0 w-full h-[3px] opacity-70 group-hover:opacity-100 transition-opacity"
                  style={{ background: `linear-gradient(90deg, transparent, ${cat.color}, transparent)` }}
                />
              )}

              {/* Background gradient fade on hover for unlocked cards */}
              {isUnlocked && (
                <div className={cn(
                  "absolute inset-0 bg-gradient-to-b opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none",
                  cat.bgClass
                )} />
              )}

              {/* Header Badges row */}
              <div className="w-full flex items-center justify-between z-10">
                <span className={cn(
                  "text-[9px] font-extrabold uppercase px-2.5 py-0.5 rounded-full border tracking-widest flex items-center gap-1",
                  isUnlocked ? cat.badgeBg : "bg-slate-500/10 text-slate-500 border-slate-500/10"
                )}>
                  {isSecret ? (
                    <>
                      <Lock className="w-3 h-3" />
                      <span>Misteri</span>
                    </>
                  ) : (
                    <>
                      {cat.icon}
                      <span>{cat.label}</span>
                    </>
                  )}
                </span>
                
                <span className={cn(
                  "text-[10px] font-bold px-2 py-0.5 rounded-full",
                  isUnlocked ? "bg-yellow-500/10 text-yellow-500" : "bg-slate-500/10 text-slate-500"
                )}>
                  +{ach.xpReward} XP
                </span>
              </div>

              {/* Icon Container */}
              <div className="relative my-2 z-10">
                {isUnlocked ? (
                  <motion.div 
                    whileHover={{ scale: 1.15, rotate: [0, -5, 5, 0] }}
                    transition={{ 
                      scale: { type: 'spring', stiffness: 300, damping: 10 },
                      rotate: { type: 'tween', ease: 'easeInOut', duration: 0.4 }
                    }}
                    className={cn(
                      "w-20 h-20 rounded-2xl flex items-center justify-center shadow-md border relative z-10 transition-transform duration-300",
                      "bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-800 dark:to-slate-900 border-yellow-500/20"
                    )}
                  >
                    <span className="drop-shadow-sm select-none">
                      {getAchievementIcon(ach.id, cat.color)}
                    </span>
                    
                    {/* Glowing golden outer ring */}
                    <div className="absolute inset-0 -m-[1px] border border-yellow-400/40 rounded-2xl animate-pulse pointer-events-none" />
                    
                    {/* Sparkle effects on corners */}
                    <Sparkles className="absolute -top-2 -right-2 w-5 h-5 text-yellow-500 animate-pulse drop-shadow-[0_0_8px_rgba(245,158,11,0.5)]" />
                    <Sparkles className="absolute -bottom-2 -left-2 w-3.5 h-3.5 text-yellow-400 animate-pulse-slow delay-75 opacity-70" />
                  </motion.div>
                ) : (
                  <div className={cn(
                    "w-20 h-20 rounded-2xl flex items-center justify-center border relative transition-colors duration-300",
                    isSecret 
                      ? "bg-purple-950/20 border-purple-500/20 text-purple-400 group-hover:border-purple-500/40" 
                      : "bg-slate-100 dark:bg-slate-900/60 border-[var(--border)] text-slate-400 group-hover:text-slate-300"
                  )}>
                    {isSecret ? (
                      <HelpCircle className="w-8 h-8 opacity-80 animate-pulse" />
                    ) : (
                      <LockKeyhole className="w-8 h-8 opacity-80 transition-transform group-hover:scale-110" />
                    )}
                  </div>
                )}

                {/* Decorative background glow for unlocked cards */}
                {isUnlocked && (
                  <div 
                    className="absolute inset-0 w-20 h-20 rounded-2xl blur-xl opacity-30 group-hover:opacity-50 transition-opacity pointer-events-none"
                    style={{ background: cat.color }}
                  />
                )}
              </div>

              {/* Title & Description */}
              <div className="space-y-1.5 z-10 flex-1 flex flex-col justify-center">
                <h3 className={cn(
                  "font-bold text-base tracking-wide transition-colors",
                  isUnlocked 
                    ? "text-[var(--text-primary)] group-hover:text-yellow-500" 
                    : isSecret
                      ? "text-purple-300"
                      : "text-[var(--text-muted)]"
                )}>
                  {isSecret ? 'Pencapaian Misterius' : ach.title}
                </h3>
                <p 
                  className="text-xs max-w-[240px] mx-auto leading-relaxed" 
                  style={{ color: isUnlocked ? 'var(--text-secondary)' : 'var(--text-muted)' }}
                >
                  {isSecret ? 'Teruslah berdisiplin dan konsisten untuk mengungkap pencapaian rahasia ini.' : ach.description}
                </p>
              </div>

              {/* Footer Date or Locked Status */}
              <div 
                className="mt-4 pt-3 border-t w-full flex items-center justify-center text-[10px] tracking-wide font-medium z-10" 
                style={{ borderColor: isUnlocked ? 'rgba(255, 255, 255, 0.05)' : 'var(--border)' }}
              >
                {isUnlocked && unlockRecord ? (
                  <div className="flex items-center gap-1.5 text-yellow-600 dark:text-yellow-400/80">
                    <Award className="w-3.5 h-3.5" />
                    <span>
                      DIBUKA PADA {new Date(unlockRecord.unlockedAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' }).toUpperCase()}
                    </span>
                  </div>
                ) : (
                  <span className={cn(
                    "uppercase tracking-wider font-semibold",
                    isSecret ? "text-purple-400" : "text-slate-400"
                  )}>
                    {isSecret ? 'Belum Terkuak' : 'Terkunci'}
                  </span>
                )}
              </div>
            </motion.div>
          );
        })}
      </motion.div>
    </div>
  );
}
