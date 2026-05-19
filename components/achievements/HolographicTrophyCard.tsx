'use client';

import React, { useState, useEffect, useRef } from 'react';
import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion';
import { 
  Sun, Moon, Target, Trophy, Flame, Sunrise, Droplets, Smartphone, Shield, Medal, Crown, Award,
  Lock, LockKeyhole, Sparkles, Activity, Timer, HelpCircle, CheckCircle2, Zap
} from 'lucide-react';
import { Achievement } from '@/types/achievement';
import { TrophyParticleCanvas } from './TrophyParticleCanvas';
import { playMechanicalClick } from '@/lib/utils/sound';

// Helper to get achievement icons exactly like existing system
export const getAchievementIcon = (id: string, color?: string, sizeClass = "w-6 h-6 stroke-[1.75]") => {
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
      case 'fajr_ascended': return '#059669';
      case 'midnight_caller': return '#6366f1';
      case 'focus_gladiator': return '#f43f5e';
      case 'time_alchemist': return '#8b5cf6';
      case 'dopamine_sovereign': return '#10b981';
      case 'loop_shatterer': return '#f59e0b';
      case 'league_conqueror': return '#06b6d4';
      case 'multiplier_deity': return '#ef4444';
      case 'radiant_faith': return '#ff7a00';
      case 'zenith_mind': return '#8b5cf6';
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
      return <HeartIcon className={sizeClass} style={{ color: finalColor }} />;
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
    case 'fajr_ascended':
      return <Trophy className={sizeClass} style={{ color: finalColor }} />;
    case 'midnight_caller':
      return <Moon className={sizeClass} style={{ color: finalColor }} />;
    case 'focus_gladiator':
      return <Award className={sizeClass} style={{ color: finalColor }} />;
    case 'time_alchemist':
      return <Award className={sizeClass} style={{ color: finalColor }} />;
    case 'dopamine_sovereign':
      return <Crown className={sizeClass} style={{ color: finalColor }} />;
    case 'loop_shatterer':
      return <Shield className={sizeClass} style={{ color: finalColor }} />;
    case 'league_conqueror':
      return <Crown className={sizeClass} style={{ color: finalColor }} />;
    case 'multiplier_deity':
      return <Flame className={sizeClass} style={{ color: finalColor }} />;
    case 'radiant_faith':
      return <Sunrise className={sizeClass} style={{ color: finalColor }} />;
    case 'zenith_mind':
      return <Target className={sizeClass} style={{ color: finalColor }} />;
    default:
      return <Award className={sizeClass} style={{ color: finalColor }} />;
  }
};

// Simple Fallback Heart Icon
const HeartIcon = ({ className, style }: { className?: string; style?: React.CSSProperties }) => (
  <svg 
    xmlns="http://www.w3.org/2000/svg" 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="1.75" 
    strokeLinecap="round" 
    strokeLinejoin="round" 
    className={className} 
    style={style}
  >
    <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" />
  </svg>
);

// Unified Category Theming Helper
export const getCategoryTheme = (category: string, isDark: boolean) => {
  switch (category) {
    case 'habit':
      return {
        label: 'Kebiasaan',
        icon: <Activity className="w-3 h-3" />,
        color: '#10B981',
        badgeBg: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/10',
        glowColor: 'rgba(16, 185, 129, 0.25)',
        gradient: isDark 
          ? 'linear-gradient(135deg, rgba(2, 44, 34, 0.75) 0%, rgba(6, 78, 59, 0.4) 50%, rgba(2, 44, 34, 0.75) 100%)' 
          : 'linear-gradient(135deg, #e6f4ea 0%, #d1e7dd 50%, #e6f4ea 100%)',
        foilGradient: 'linear-gradient(105deg, rgba(52, 211, 153, 0.15) 0%, rgba(255,255,255,0.3) 40%, rgba(255, 255, 255, 0.45) 50%, rgba(16, 185, 129, 0.15) 60%, rgba(52, 211, 153, 0.15) 100%)'
      };
    case 'focus':
      return {
        label: 'Fokus',
        icon: <Timer className="w-3 h-3" />,
        color: '#6366F1',
        badgeBg: 'bg-indigo-500/10 text-indigo-400 border-indigo-500/10',
        glowColor: 'rgba(99, 102, 241, 0.25)',
        gradient: isDark 
          ? 'linear-gradient(135deg, rgba(30, 27, 75, 0.75) 0%, rgba(49, 46, 129, 0.4) 50%, rgba(30, 27, 75, 0.75) 100%)' 
          : 'linear-gradient(135deg, #e0e7ff 0%, #c7d2fe 50%, #e0e7ff 100%)',
        foilGradient: 'linear-gradient(105deg, rgba(139, 92, 246, 0.15) 0%, rgba(255,255,255,0.3) 40%, rgba(255, 255, 255, 0.45) 50%, rgba(99, 102, 241, 0.15) 60%, rgba(139, 92, 246, 0.15) 100%)'
      };
    case 'milestone':
      return {
        label: 'Milestone',
        icon: <Zap className="w-3 h-3" />,
        color: '#06B6D4',
        badgeBg: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/10',
        glowColor: 'rgba(6, 182, 212, 0.25)',
        gradient: isDark 
          ? 'linear-gradient(135deg, rgba(8, 51, 68, 0.75) 0%, rgba(21, 94, 117, 0.4) 50%, rgba(8, 51, 68, 0.75) 100%)' 
          : 'linear-gradient(135deg, #ecfeff 0%, #cffafe 50%, #ecfeff 100%)',
        foilGradient: 'linear-gradient(105deg, rgba(34, 211, 238, 0.15) 0%, rgba(255,255,255,0.3) 40%, rgba(255, 255, 255, 0.45) 50%, rgba(6, 182, 212, 0.15) 60%, rgba(34, 211, 238, 0.15) 100%)'
      };
    case 'special':
    default:
      return {
        label: 'Istimewa',
        icon: <Award className="w-3 h-3" />,
        color: '#F59E0B',
        badgeBg: 'bg-amber-500/10 text-amber-400 border-amber-500/10',
        glowColor: 'rgba(245, 158, 11, 0.28)',
        gradient: isDark 
          ? 'linear-gradient(135deg, rgba(28, 17, 3, 0.75) 0%, rgba(69, 26, 3, 0.4) 50%, rgba(28, 17, 3, 0.75) 100%)' 
          : 'linear-gradient(135deg, #fef3c7 0%, #fde68a 50%, #fef3c7 100%)',
        foilGradient: 'linear-gradient(105deg, rgba(245, 158, 11, 0.2) 0%, rgba(251, 191, 36, 0.25) 30%, rgba(255, 255, 255, 0.45) 50%, rgba(217, 119, 6, 0.2) 70%, rgba(245, 158, 11, 0.2) 100%)'
      };
  }
};

interface HolographicTrophyCardProps {
  achievement: Achievement;
  isUnlocked: boolean;
  unlockRecord?: { unlockedAt: string | number } | null;
  isDark: boolean;
  onClick?: () => void;
  simulateUnlockTrigger?: number;
  compact?: boolean;
}

export function HolographicTrophyCard({
  achievement,
  isUnlocked: initialUnlocked,
  unlockRecord,
  isDark,
  onClick,
  simulateUnlockTrigger = 0,
  compact = false
}: HolographicTrophyCardProps) {
  // Local state to facilitate simulated unlocking sequences
  const [visualUnlocked, setVisualUnlocked] = useState(initialUnlocked);
  const [isShaking, setIsShaking] = useState(false);
  const [isCracking, setIsCracking] = useState(false);
  const [particleTrigger, setParticleTrigger] = useState(0);
  const triggerRef = useRef(simulateUnlockTrigger);

  // Synced with initial prop modifications
  useEffect(() => {
    setVisualUnlocked(initialUnlocked);
  }, [initialUnlocked]);

  // Pemicu simulasi buka kunci (Unlock Preview Sequence)
  useEffect(() => {
    if (simulateUnlockTrigger > 0 && simulateUnlockTrigger !== triggerRef.current) {
      triggerRef.current = simulateUnlockTrigger;
      handleSimulateUnlock();
    }
  }, [simulateUnlockTrigger]);

  const handleSimulateUnlock = () => {
    setIsShaking(true);
    setVisualUnlocked(false);
    setIsCracking(false);

    // Step 1: Padlock shakes intensely
    setTimeout(() => {
      setIsShaking(false);
      setIsCracking(true); // Step 2: Lock shatters / splits apart
      setParticleTrigger(p => p + 1); // Trigger massive HTML5 canvas particle pop

      // Step 3: Reveal shiny trophy inside
      setTimeout(() => {
        setIsCracking(false);
        setVisualUnlocked(true);
      }, 700);

    }, 850);
  };

  const handleCardClick = () => {
    if (!visualUnlocked && !isShaking && !isCracking) {
      // Shake padlock if clicked while locked to express "locked" state
      setIsShaking(true);
      setTimeout(() => setIsShaking(false), 500);
      playMechanicalClick();
    }
    if (onClick) {
      onClick();
    }
  };

  // ─── 3D Tilt Setup ────────────────────────────────────────────────────────
  const x = useMotionValue(0.5);
  const y = useMotionValue(0.5);

  const springConfig = { damping: 22, stiffness: 140, mass: 0.5 };
  const xSpring = useSpring(x, springConfig);
  const ySpring = useSpring(y, springConfig);

  // Dynamic transforms mapping to exact degrees of rotation
  const rotateX = useTransform(ySpring, [0, 1], [15, -15]);
  const rotateY = useTransform(xSpring, [0, 1], [-15, 15]);

  // Separate inner icon parallax calculation
  const iconRotateX = useTransform(ySpring, [0, 1], [6, -6]);
  const iconRotateY = useTransform(xSpring, [0, 1], [-6, 6]);

  // Shimmer foil position offsets (linear metallic shininess shifts opposite to tilt)
  const foilBgX = useTransform(xSpring, [0, 1], ['100%', '0%']);
  const foilBgY = useTransform(ySpring, [0, 1], ['100%', '0%']);
  const foilOpacity = useTransform(xSpring, [0, 0.5, 1], [0.35, 0.12, 0.35]);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;
    x.set(mouseX / rect.width);
    y.set(mouseY / rect.height);
  };

  const handleMouseLeave = () => {
    x.set(0.5);
    y.set(0.5);
  };

  // Mobile Device Orientation Gyroscope
  useEffect(() => {
    const handleOrientation = (e: DeviceOrientationEvent) => {
      if (e.gamma !== null && e.beta !== null) {
        // Clamp gamma (horizontal phone tilt: -22 to 22 degrees mapped to 0 -> 1)
        const gammaClamped = Math.max(-22, Math.min(22, e.gamma));
        const targetX = (gammaClamped + 22) / 44;

        // Clamp beta (vertical phone tilt: 25 to 65 degrees mapped to 0 -> 1)
        const betaClamped = Math.max(25, Math.min(65, e.beta));
        const targetY = (betaClamped - 25) / 40;

        x.set(targetX);
        y.set(targetY);
      }
    };

    window.addEventListener('deviceorientation', handleOrientation);
    return () => window.removeEventListener('deviceorientation', handleOrientation);
  }, [x, y]);

  // Core Visual Elements
  const cat = getCategoryTheme(achievement.category, isDark);
  const isSecret = achievement.secret && !visualUnlocked;
  
  // Custom Rainbow Oil-Slick spectrum foil for elite milestones / secret achievements
  const isElite = achievement.secret || achievement.id === 'completionist' || achievement.id === 'perfect_day' || achievement.id === 'league_conqueror';

  // ─── Render Compact Mode (Simplified Square) ─────────────────────────────
  if (compact) {
    return (
      <motion.div
        style={{
          perspective: 800,
          transformStyle: 'preserve-3d',
        }}
        className="w-full h-full relative"
      >
        <motion.div
          onMouseMove={handleMouseMove}
          onMouseLeave={handleMouseLeave}
          onClick={handleCardClick}
          style={{
            rotateX,
            rotateY,
            transformStyle: 'preserve-3d',
            background: cat.gradient,
            borderColor: visualUnlocked 
              ? `${cat.color}35` 
              : (isDark ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.06)'),
            boxShadow: visualUnlocked 
              ? `0 6px 18px rgba(0,0,0,0.3), 0 0 10px ${cat.color}10, inset 0 1px 0 rgba(255,255,255,0.08)` 
              : `0 3px 10px rgba(0,0,0,0.1), inset 0 1px 0 rgba(255,255,255,0.02)`
          }}
          className={`relative aspect-square w-full rounded-2xl border flex items-center justify-center cursor-pointer transition-[background,border-color,box-shadow,opacity] duration-300 group select-none overflow-hidden ${
            visualUnlocked 
              ? 'hover:scale-[1.04] hover:shadow-md' 
              : 'opacity-70 hover:opacity-85'
          }`}
        >
          {/* Particle Canvas embedded inside card container */}
          <TrophyParticleCanvas triggerCount={particleTrigger} />

          {/* Holographic Refractive Sheen Overlay */}
          {visualUnlocked && (
            <motion.div
              style={{
                background: cat.foilGradient,
                backgroundPositionX: foilBgX,
                backgroundPositionY: foilBgY,
                opacity: foilOpacity,
                mixBlendMode: 'color-dodge',
              }}
              className="absolute inset-0 pointer-events-none z-10 rounded-2xl"
            />
          )}

          {/* Elite Spectrum Overlay */}
          {visualUnlocked && isElite && (
            <motion.div
              style={{
                background: 'linear-gradient(115deg, transparent 0%, rgba(239, 68, 68, 0.05) 20%, rgba(245, 158, 11, 0.05) 40%, rgba(16, 185, 129, 0.05) 60%, rgba(6, 182, 212, 0.05) 80%, rgba(99, 102, 241, 0.05) 100%)',
                backgroundPositionX: foilBgY,
                backgroundPositionY: foilBgX,
                mixBlendMode: 'overlay',
              }}
              className="absolute inset-0 pointer-events-none z-15 rounded-2xl animate-pulse"
            />
          )}

          {/* Parallax Floating Trophy Ikon */}
          <div 
            style={{ transform: 'translateZ(18px)' }}
            className="w-full h-full flex items-center justify-center relative z-20"
          >
            <motion.div
              style={{
                rotateX: iconRotateX,
                rotateY: iconRotateY,
                transformStyle: 'preserve-3d',
              }}
              className={`transition-[opacity,filter] duration-300 ${visualUnlocked ? 'filter-none scale-110 drop-shadow-[0_0_8px_rgba(245,158,11,0.25)]' : 'filter grayscale opacity-25'}`}
            >
              {isShaking && (
                <motion.div 
                  animate={{ x: [-2, 2, -2, 2, 0] }}
                  transition={{ duration: 0.15, repeat: 2 }}
                  className="text-red-400"
                >
                  <LockKeyhole className="w-6 h-6" />
                </motion.div>
              )}

              {isCracking && (
                <div className="relative overflow-hidden w-6 h-6 flex items-center justify-center">
                  <motion.div 
                    animate={{ y: -15, opacity: 0 }}
                    className="text-yellow-400"
                  >
                    <LockKeyhole className="w-5 h-5" />
                  </motion.div>
                </div>
              )}

              {!isShaking && !isCracking && (
                <>
                  {visualUnlocked ? (
                    <div className="relative">
                      {getAchievementIcon(achievement.id, cat.color, "w-7 h-7 md:w-8 md:h-8")}
                      <Sparkles className="absolute -top-1.5 -right-1.5 w-2.5 h-2.5 text-yellow-400 animate-pulse" />
                    </div>
                  ) : isSecret ? (
                    <HelpCircle className="w-6 h-6 text-purple-400/50" />
                  ) : (
                    <Lock className={`w-6 h-6 ${isDark ? 'text-neutral-600' : 'text-neutral-400'}`} />
                  )}
                </>
              )}
            </motion.div>
          </div>

          {/* Corner badge status indicators */}
          {visualUnlocked ? (
            <div className="absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-sm shadow-emerald-500/50 animate-pulse z-25" />
          ) : (
            <div className="absolute bottom-1 right-1 p-0.5 rounded-full bg-neutral-950/80 border border-neutral-800 z-25">
              <Lock className="w-2 h-2 text-neutral-500" />
            </div>
          )}
        </motion.div>
      </motion.div>
    );
  }

  // ─── Render Full Detailed Mode ───────────────────────────────────────────
  const iconTranslateZ = 30; // 3D translateZ push
  return (
    <motion.div
      style={{
        perspective: 1000,
        transformStyle: 'preserve-3d',
      }}
      className="w-full h-full relative"
    >
      <motion.div
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        onClick={handleCardClick}
        style={{
          rotateX,
          rotateY,
          transformStyle: 'preserve-3d',
          background: cat.gradient,
          borderColor: visualUnlocked 
            ? `${cat.color}35` 
            : (isDark ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.06)'),
          boxShadow: visualUnlocked 
            ? `0 10px 30px rgba(0,0,0,0.3), 0 0 15px ${cat.color}15, inset 0 1px 0 rgba(255,255,255,0.08)` 
            : `0 4px 15px rgba(0,0,0,0.1), inset 0 1px 0 rgba(255,255,255,0.02)`
        }}
        className={`relative p-4 md:p-5 rounded-2xl border flex flex-col items-center text-center cursor-pointer transition-[background,border-color,box-shadow,opacity] duration-300 group select-none overflow-hidden h-full min-h-[220px] md:min-h-[240px] ${
          visualUnlocked 
            ? 'hover:scale-[1.025] hover:shadow-xl' 
            : 'opacity-70 hover:opacity-85'
        }`}
      >
        {/* Particle Canvas embedded inside card container */}
        <TrophyParticleCanvas triggerCount={particleTrigger} />

        {/* ─── Premium Holographic Overlays ─────────────────────────────────── */}
        {/* Dynamic Refractive Light Sheen Foil Overlay */}
        {visualUnlocked && (
          <motion.div
            style={{
              background: cat.foilGradient,
              backgroundPositionX: foilBgX,
              backgroundPositionY: foilBgY,
              opacity: foilOpacity,
              mixBlendMode: 'color-dodge',
            }}
            className="absolute inset-0 pointer-events-none z-10 rounded-2xl"
          />
        )}

        {/* Oil-Slick Spectrum Hologram overlay for Elite Achievements */}
        {visualUnlocked && isElite && (
          <motion.div
            style={{
              background: 'linear-gradient(115deg, transparent 0%, rgba(239, 68, 68, 0.06) 20%, rgba(245, 158, 11, 0.06) 40%, rgba(16, 185, 129, 0.06) 60%, rgba(6, 182, 212, 0.06) 80%, rgba(99, 102, 241, 0.06) 100%)',
              backgroundPositionX: foilBgY,
              backgroundPositionY: foilBgX,
              mixBlendMode: 'overlay',
            }}
            className="absolute inset-0 pointer-events-none z-15 rounded-2xl animate-pulse"
          />
        )}

        {/* Outer ambient colored soft glowing background */}
        <div 
          className="absolute -inset-10 opacity-0 group-hover:opacity-10 blur-2xl rounded-3xl pointer-events-none transition-opacity duration-500"
          style={{
            background: `radial-gradient(circle, ${cat.color} 0%, transparent 70%)`
          }}
        />

        {/* ─── Card Header Info ────────────────────────────────────────────── */}
        <div className="flex justify-between items-center w-full mb-3 md:mb-4 gap-1 relative z-25">
          <span className={`text-[8px] md:text-[9.5px] font-black uppercase px-2.5 py-0.5 rounded-full border tracking-widest inline-flex items-center gap-1.5 select-none ${
            visualUnlocked 
              ? cat.badgeBg 
              : (isDark ? "bg-neutral-900/60 text-neutral-500 border-neutral-900/40" : "bg-neutral-200/55 text-neutral-500 border-neutral-200/40")
          }`}>
            {isSecret ? <LockKeyhole className="w-2.5 h-2.5" /> : cat.icon}
            <span className="hidden xs:inline">{isSecret ? 'Misteri' : cat.label}</span>
          </span>
          
          <span className={`text-[8.5px] md:text-[9.5px] font-black px-2 py-0.5 rounded border select-none transition-colors ${
            visualUnlocked
              ? 'text-amber-500 bg-amber-500/10 border-amber-500/10'
              : 'text-neutral-500 bg-neutral-900/30 border-neutral-900/30'
          }`}>
            +{achievement.xpReward} XP
          </span>
        </div>

        {/* ─── Parallax 3D Center Icon Box ──────────────────────────────────── */}
        <div 
          className="flex-1 flex items-center justify-center w-full"
          style={{ transform: `translateZ(${iconTranslateZ}px)` }}
        >
          <motion.div 
            style={{ 
              rotateX: iconRotateX, 
              rotateY: iconRotateY,
              transformStyle: 'preserve-3d',
              borderColor: visualUnlocked ? `${cat.color}30` : 'rgba(255,255,255,0.02)',
              boxShadow: visualUnlocked ? `0 8px 24px rgba(0,0,0,0.4), inset 0 2px 5px rgba(255,255,255,0.05)` : 'none'
            }}
            className={`relative w-14 h-14 md:w-16 md:h-16 flex items-center justify-center rounded-2xl border transition-[background-color,border-color,box-shadow] duration-300 ${
              visualUnlocked 
                ? (isDark ? 'bg-neutral-950/60 backdrop-blur-sm' : 'bg-white') 
                : (isDark ? 'bg-neutral-900/20' : 'bg-neutral-100')
            } ${isShaking ? 'animate-bounce' : ''}`}
          >
            {/* Shaking & Cracking Lock States */}
            {isShaking && (
              <motion.div 
                animate={{ x: [-3, 3, -3, 3, 0] }}
                transition={{ duration: 0.15, repeat: 2 }}
                className="absolute inset-0 flex items-center justify-center z-20 text-red-400"
              >
                <LockKeyhole className="w-8 h-8 drop-shadow-[0_0_8px_rgba(239,68,68,0.5)]" />
              </motion.div>
            )}

            {isCracking && (
              <div className="absolute inset-0 flex items-center justify-center z-20 overflow-hidden">
                <motion.div 
                  initial={{ y: 0, rotate: 0, opacity: 1 }}
                  animate={{ y: -25, rotate: -20, opacity: 0 }}
                  transition={{ duration: 0.6 }}
                  className="absolute text-yellow-400"
                >
                  <LockKeyhole className="w-6 h-6" />
                </motion.div>
                  <div className="absolute inset-0 bg-white/60 animate-ping rounded-2xl" />
              </div>
            )}

            {/* Default Rendering */}
            {!isShaking && !isCracking && (
              <>
                {visualUnlocked ? (
                  <div className="relative group-hover:scale-110 transition-transform duration-300 drop-shadow-[0_0_10px_rgba(245,158,11,0.25)]">
                    {getAchievementIcon(achievement.id, cat.color, "w-7 h-7 md:w-9 md:h-9")}
                    {/* Retro mini sparkles glowing */}
                    <Sparkles className="absolute -top-2.5 -right-2.5 w-3.5 h-3.5 text-yellow-400 animate-pulse" />
                  </div>
                ) : isSecret ? (
                  <HelpCircle className="w-7 h-7 md:w-9 md:h-9 text-purple-400/50 filter blur-[0.5px]" />
                ) : (
                  <Lock className={`w-7 h-7 md:w-9 md:h-9 ${isDark ? 'text-neutral-600' : 'text-neutral-400'} opacity-75`} />
                )}
              </>
            )}
          </motion.div>
        </div>

        {/* ─── Title & Description ─────────────────────────────────────────── */}
        <div className="space-y-1.5 flex-1 flex flex-col justify-end w-full relative z-25 mt-3">
          <h4 className={`text-[11px] md:text-[13px] font-black leading-tight select-none ${
            visualUnlocked 
              ? (isDark ? 'text-white' : 'text-neutral-900') 
              : 'text-neutral-500'
          }`}>
            {isSecret ? 'Pencapaian Misterius' : achievement.title}
          </h4>
          <p className={`text-[9.5px] md:text-[10.5px] leading-relaxed line-clamp-2 select-none ${
            visualUnlocked 
              ? (isDark ? 'text-neutral-400' : 'text-neutral-600') 
              : 'text-neutral-500/75'
          }`}>
            {isSecret ? 'Teruslah berdisiplin untuk mengungkap piala rahasia ini.' : achievement.description}
          </p>
        </div>

        {/* ─── Bottom Status Divider ───────────────────────────────────────── */}
        <div className={`w-full border-t mt-3.5 pt-2.5 flex items-center justify-center gap-1.5 relative z-20 ${
          isDark ? 'border-neutral-800/40' : 'border-neutral-200'
        }`}>
          {visualUnlocked ? (
            <>
              <CheckCircle2 className="w-3 h-3 text-emerald-500 flex-shrink-0" />
              <span className="text-[7.5px] md:text-[8.5px] font-black text-amber-500/80 uppercase tracking-widest select-none">
                {unlockRecord?.unlockedAt 
                  ? new Date(unlockRecord.unlockedAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })
                  : 'TERBUKA'}
              </span>
            </>
          ) : (
            <>
              <Lock className={`w-2.5 h-2.5 flex-shrink-0 ${isDark ? 'text-neutral-600' : 'text-neutral-400'}`} />
              <span className={`text-[7.5px] md:text-[8.5px] font-black uppercase tracking-widest select-none ${
                isDark ? 'text-neutral-600' : 'text-neutral-400'
              }`}>
                TERKUNCI
              </span>
            </>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
}
