'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, Swords, Timer, Zap, Trophy, ShieldAlert, 
  Crown, Play, Square, Award, Flame, AlertCircle 
} from 'lucide-react';
import { useAppStore } from '@/store/useAppStore';
import { playCrystalChime, playMechanicalClick } from '@/lib/utils/sound';

// Fallback math-based gradient HSL generator
const DuelAvatar = ({ photoURL, displayName, className = "w-16 h-16" }: { photoURL: string | null; displayName: string; className?: string }) => {
  if (photoURL) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={photoURL}
        alt={displayName}
        className={`${className} rounded-full object-cover border-2 border-indigo-500 shadow-md`}
      />
    );
  }

  let hash = 0;
  for (let i = 0; i < displayName.length; i++) {
    hash = displayName.charCodeAt(i) + ((hash << 5) - hash);
  }
  const h = Math.abs(hash % 360);
  const s = 65;
  const l = 45;
  const initial = displayName ? displayName.charAt(0).toUpperCase() : 'U';

  return (
    <div
      className={`${className} rounded-full border-2 border-indigo-500 flex items-center justify-center font-black text-white text-xl shadow-md`}
      style={{
        background: `linear-gradient(135deg, hsl(${h}, ${s}%, ${l}%), hsl(${(h + 40) % 360}, ${s}%, ${l - 10}%))`
      }}
    >
      {initial}
    </div>
  );
};

interface FocusDuelModalProps {
  isOpen: boolean;
  onClose: () => void;
  opponent: {
    uid: string;
    displayName: string;
    photoURL: string | null;
    totalXP: number;
    disciplineStreak?: number;
  };
}

const BATTLE_LOGS = [
  "⚔️ Duel dimulai! Konsentrasi penuh adalah kunci kemenangan.",
  "🔥 Kedua pejuang disiplin menunjukkan ritme fokus yang solid.",
  "⚡ Detak fokus Anda stabil! Lawan mencoba mengimbangi.",
  "🎯 Memasuki zona konsentrasi mendalam (Deep Work). Tetap tenang!",
  "🚀 Saling kejar-mengejar ritme! Keduanya bertarung luar biasa.",
  "👑 Menuju garis finish! Siap-siap mengklaim bonus XP kejayaan!"
];

export default function FocusDuelModal({ isOpen, onClose, opponent }: FocusDuelModalProps) {
  const { user, addXP, addNotification, theme } = useAppStore();
  const isDark = theme === 'dark';

  const [duelActive, setDuelActive] = useState(false);
  const [timeLeft, setTimeLeft] = useState(1500); // 25 minutes = 1500s
  const [opponentProgress, setOpponentProgress] = useState(0);
  const [battleLog, setBattleLog] = useState(BATTLE_LOGS[0]);
  const [duelCompleted, setDuelCompleted] = useState(false);
  const [surrendered, setSurrendered] = useState(false);

  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Format MM:SS
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const startDuel = () => {
    playMechanicalClick();
    setDuelActive(true);
    setSurrendered(false);
    setDuelCompleted(false);
    setTimeLeft(1500);
    setOpponentProgress(0);
    setBattleLog(BATTLE_LOGS[0]);
  };

  const surrenderDuel = () => {
    playMechanicalClick();
    if (timerRef.current) clearInterval(timerRef.current);
    setDuelActive(false);
    setSurrendered(true);
    addNotification(
      '⚠️ Duel Dibatalkan',
      `Anda menyerah dalam duel melawan ${opponent.displayName}. Terus latih disiplin Anda!`,
      'focus'
    );
  };

  useEffect(() => {
    if (duelActive && timeLeft > 0) {
      timerRef.current = setInterval(() => {
        setTimeLeft((prev) => {
          const nextVal = prev - 1;

          // Dynamically calculate simulated opponent's progress (with small random factor to feel real!)
          const myProgressPercent = ((1500 - nextVal) / 1500) * 100;
          const opponentRandomModifier = (Math.sin(nextVal / 30) * 2) + (Math.random() * 2 - 1);
          const opponentNextPercent = Math.min(100, Math.max(0, myProgressPercent + opponentRandomModifier));
          setOpponentProgress(opponentNextPercent);

          // Rotate battle logs every 4 minutes/240s
          const elapsed = 1500 - nextVal;
          const logIdx = Math.min(BATTLE_LOGS.length - 1, Math.floor(elapsed / 250));
          setBattleLog(BATTLE_LOGS[logIdx]);

          if (nextVal <= 0) {
            if (timerRef.current) clearInterval(timerRef.current);
            setDuelActive(false);
            setDuelCompleted(true);
            playCrystalChime();
            
            // Trigger Confetti
            import('canvas-confetti').then((confetti) => {
              confetti.default({
                particleCount: 100,
                spread: 80,
                origin: { y: 0.5 }
              });
            });

            // Reward
            addXP(100);
            addNotification(
              '🏆 Kemenangan Duel!',
              `Luar biasa! Anda memenangkan duel fokus melawan ${opponent.displayName}. +100 XP diperoleh!`,
              'achievement',
              100
            );
          }
          return nextVal;
        });
      }, 1000);
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [duelActive, timeLeft, opponent.displayName, addXP, addNotification]);

  if (!isOpen) return null;

  const myProgress = ((1500 - timeLeft) / 1500) * 100;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className={`relative w-full max-w-2xl rounded-3xl p-6 md:p-8 border shadow-2xl overflow-hidden ${
            isDark 
              ? 'bg-neutral-950 border-neutral-800 text-white' 
              : 'bg-white border-neutral-200 text-neutral-900'
          }`}
        >
          {/* Header Glows */}
          <div className="absolute -top-32 -left-32 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -bottom-32 -right-32 w-64 h-64 bg-violet-600/10 rounded-full blur-3xl pointer-events-none" />

          {/* Close button */}
          {!duelActive && (
            <button
              onClick={onClose}
              className={`absolute top-4 right-4 p-2 rounded-full border transition-all ${
                isDark 
                  ? 'border-neutral-800 bg-neutral-900/60 text-neutral-400 hover:text-white' 
                  : 'border-neutral-200 bg-neutral-50 text-neutral-500 hover:text-neutral-900'
              }`}
            >
              <X className="w-5 h-5" />
            </button>
          )}

          {/* Duel Title */}
          <div className="flex flex-col items-center text-center space-y-2 mb-6">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center shadow-lg shadow-indigo-500/20">
              <Swords className="w-6 h-6 text-white animate-pulse" />
            </div>
            <h2 className="text-xl font-extrabold tracking-tight">Arena Duel Fokus 1v1</h2>
            <p className={`text-xs max-w-sm ${isDark ? 'text-neutral-400' : 'text-neutral-500'}`}>
              Uji ketangguhan disiplin Anda langsung melawan pejuang lain di komunitas. Selesaikan 25 menit fokus untuk meraih piala & bonus ganda!
            </p>
          </div>

          {/* Battle Simulator Dashboard */}
          <div className={`p-5 rounded-2xl border space-y-6 ${
            isDark ? 'bg-neutral-900/40 border-neutral-800' : 'bg-neutral-50/50 border-neutral-200'
          }`}>
            
            {/* Split Screen View */}
            <div className="grid grid-cols-1 md:grid-cols-11 items-center gap-6 md:gap-2">
              
              {/* You Panel */}
              <div className="col-span-5 flex flex-col items-center space-y-3 p-3">
                <DuelAvatar photoURL={user?.photoURL || null} displayName={user?.displayName || 'Anda'} />
                <div className="text-center">
                  <h4 className="text-sm font-extrabold">{user?.displayName || 'Anda'}</h4>
                  <span className="text-[10px] uppercase font-bold tracking-wider text-indigo-500 flex items-center justify-center gap-0.5 mt-0.5">
                    <Zap className="w-3 h-3" /> Penantang
                  </span>
                </div>
                
                {/* Timer Box */}
                <div className={`px-4 py-2.5 rounded-xl font-black text-xl tracking-wider tabular-nums border ${
                  duelActive 
                    ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400 animate-pulse'
                    : (isDark ? 'bg-neutral-900 border-neutral-800 text-neutral-400' : 'bg-white border-neutral-200 text-neutral-500')
                }`}>
                  {formatTime(timeLeft)}
                </div>
              </div>

              {/* VS Divider */}
              <div className="col-span-1 flex flex-col items-center justify-center text-center">
                <span className="text-xs font-black uppercase text-indigo-500 bg-indigo-500/10 border border-indigo-500/20 px-2 py-1 rounded-lg">
                  VS
                </span>
              </div>

              {/* Opponent Panel */}
              <div className="col-span-5 flex flex-col items-center space-y-3 p-3">
                <DuelAvatar photoURL={opponent.photoURL} displayName={opponent.displayName} />
                <div className="text-center">
                  <h4 className="text-sm font-extrabold">{opponent.displayName}</h4>
                  <span className="text-[10px] uppercase font-bold tracking-wider text-violet-500 flex items-center justify-center gap-0.5 mt-0.5">
                    <Flame className="w-3 h-3 animate-pulse" /> Streak {opponent.disciplineStreak || 0}
                  </span>
                </div>

                {/* Opponent Timer box */}
                <div className={`px-4 py-2.5 rounded-xl font-black text-xl tracking-wider tabular-nums border ${
                  duelActive 
                    ? 'bg-violet-500/10 border-violet-500/30 text-violet-400 animate-pulse'
                    : (isDark ? 'bg-neutral-900 border-neutral-800 text-neutral-400' : 'bg-white border-neutral-200 text-neutral-500')
                }`}>
                  {duelActive ? formatTime(timeLeft) : "25:00"}
                </div>
              </div>

            </div>

            {/* Battle Progress Bar */}
            {duelActive && (
              <div className="space-y-2">
                <div className="flex justify-between text-[10px] font-black uppercase tracking-wider text-neutral-500">
                  <span>Progres Anda: {Math.round(myProgress)}%</span>
                  <span>Progres Lawan: {Math.round(opponentProgress)}%</span>
                </div>
                
                {/* Visual Tug-of-war Bar */}
                <div className={`h-3 w-full rounded-full overflow-hidden flex ${
                  isDark ? 'bg-neutral-900' : 'bg-neutral-200'
                }`}>
                  <div 
                    className="h-full bg-gradient-to-r from-emerald-500 to-indigo-500 transition-all duration-1000"
                    style={{ width: `${(myProgress / (myProgress + opponentProgress || 1)) * 100}%` }}
                  />
                  <div 
                    className="h-full bg-gradient-to-r from-violet-500 to-fuchsia-500 transition-all duration-1000"
                    style={{ width: `${(opponentProgress / (myProgress + opponentProgress || 1)) * 100}%` }}
                  />
                </div>

                {/* Live Battle Feed */}
                <div className={`px-3 py-2 rounded-xl border text-[10px] font-semibold text-center animate-pulse mt-2 flex items-center justify-center gap-1.5 ${
                  isDark 
                    ? 'bg-indigo-950/20 border-indigo-500/20 text-indigo-300' 
                    : 'bg-indigo-50 border-indigo-100 text-indigo-700'
                }`}>
                  {battleLog}
                </div>
              </div>
            )}

            {/* Duel Completed state screen */}
            {duelCompleted && (
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-center space-y-2"
              >
                <Award className="w-10 h-10 text-emerald-400 mx-auto animate-bounce" />
                <h4 className="text-base font-extrabold text-emerald-400">🔥 Kemenangan Milik Anda!</h4>
                <p className={`text-xs leading-relaxed max-w-md mx-auto ${isDark ? 'text-neutral-400' : 'text-neutral-500'}`}>
                  Selamat! Anda berhasil menuntaskan duel fokus Pomodoro 25 Menit dengan integritas disiplin 100%. Papan peringkat Liga Disiplin merayakan kejayaan Anda!
                </p>
                <div className="text-xs font-black text-yellow-500 flex items-center justify-center gap-1">
                  <Trophy className="w-4 h-4 text-yellow-500" /> +100 XP Bonus Ditambahkan
                </div>
              </motion.div>
            )}

            {/* Surrendered state screen */}
            {surrendered && (
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-center space-y-1"
              >
                <ShieldAlert className="w-8 h-8 text-rose-500 mx-auto animate-pulse" />
                <h4 className="text-sm font-extrabold text-rose-500">Pertempuran Berakhir</h4>
                <p className={`text-[10px] leading-relaxed max-w-sm mx-auto ${isDark ? 'text-neutral-400' : 'text-neutral-500'}`}>
                  Anda memilih untuk membatalkan duel. Untuk menjadi pejuang utama di liga disiplin, cobalah untuk tidak menyerah pada kesempatan berikutnya!
                </p>
              </motion.div>
            )}

          </div>

          {/* Action buttons */}
          <div className="flex justify-center gap-4 mt-6">
            {!duelActive && !duelCompleted && (
              <button
                onClick={startDuel}
                className="w-full max-w-xs py-3 px-6 rounded-2xl bg-gradient-to-r from-indigo-500 to-violet-600 hover:from-indigo-600 hover:to-violet-700 text-white font-extrabold text-xs tracking-wider uppercase transition-all shadow-md shadow-indigo-500/20 hover:shadow-lg flex items-center justify-center gap-2"
              >
                <Play className="w-4 h-4 fill-white" /> Mulai Duel Fokus
              </button>
            )}

            {duelActive && (
              <button
                onClick={surrenderDuel}
                className="w-full max-w-xs py-3 px-6 rounded-2xl bg-rose-600 hover:bg-rose-700 text-white font-extrabold text-xs tracking-wider uppercase transition-all flex items-center justify-center gap-2"
              >
                <Square className="w-4 h-4 fill-white" /> Menyerah (Batalkan)
              </button>
            )}

            {(duelCompleted || surrendered) && (
              <button
                onClick={onClose}
                className={`py-3 px-8 rounded-2xl border text-xs font-black uppercase tracking-wider transition-all ${
                  isDark 
                    ? 'border-neutral-800 bg-neutral-900/60 hover:bg-neutral-800/60 text-white' 
                    : 'border-neutral-200 bg-neutral-50 hover:bg-neutral-100 text-neutral-700'
                }`}
              >
                Tutup Arena
              </button>
            )}
          </div>

        </motion.div>
      </div>
    </AnimatePresence>
  );
}
