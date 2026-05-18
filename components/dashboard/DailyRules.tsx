'use client';

import { useState, useEffect } from 'react';
import { useAppStore } from '@/store/useAppStore';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  CheckCircle2, Ban, Clock, Droplets, Plus, Trash2, X, 
  BookOpen, Heart, Trophy, Laptop, Flame, Sparkles 
} from 'lucide-react';
import { playMechanicalClick, playCrystalChime } from '@/lib/utils/sound';
import confetti from 'canvas-confetti';

interface RuleItem {
  id: string;
  label: string;
  iconName: string;
  colorTheme: 'emerald' | 'indigo' | 'blue' | 'red' | 'amber' | 'purple';
  completed: boolean;
  isCustom?: boolean;
}

const ICON_MAP: Record<string, any> = {
  CheckCircle2,
  Ban,
  Clock,
  Droplets,
  BookOpen,
  Heart,
  Trophy,
  Laptop,
  Flame
};

const COLOR_MAP = {
  emerald: { text: 'text-emerald-400', bg: 'bg-emerald-500/10', border: 'rgba(16, 185, 129, 0.2)' },
  indigo: { text: 'text-indigo-400', bg: 'bg-indigo-500/10', border: 'rgba(99, 102, 241, 0.2)' },
  blue: { text: 'text-blue-400', bg: 'bg-blue-500/10', border: 'rgba(59, 130, 246, 0.2)' },
  red: { text: 'text-red-400', bg: 'bg-red-500/10', border: 'rgba(239, 68, 68, 0.2)' },
  amber: { text: 'text-amber-400', bg: 'bg-amber-500/10', border: 'rgba(245, 158, 11, 0.2)' },
  purple: { text: 'text-purple-400', bg: 'bg-purple-500/10', border: 'rgba(139, 92, 246, 0.2)' }
};

const DEFAULT_RULES: RuleItem[] = [];

const SUGGESTED_RULES = [
  { label: 'Mandi dulu sebelum main HP', iconName: 'CheckCircle2', colorTheme: 'emerald' },
  { label: 'No TikTok sebelum mandi', iconName: 'Ban', colorTheme: 'red' },
  { label: 'Tidur sebelum 23:00', iconName: 'Clock', colorTheme: 'amber' },
  { label: 'Minum 8 gelas air hari ini', iconName: 'Droplets', colorTheme: 'blue' },
  { label: 'Baca Buku 15 Menit', iconName: 'BookOpen', colorTheme: 'purple' },
  { label: 'Digital detox: screen time < 120m', iconName: 'Laptop', colorTheme: 'indigo' }
];

export function DailyRules() {
  const { addXP } = useAppStore();
  const [rules, setRules] = useState<RuleItem[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  // Form States for custom rules
  const [newLabel, setNewLabel] = useState('');
  const [newIcon, setNewIcon] = useState('CheckCircle2');
  const [newColor, setNewColor] = useState<'emerald' | 'indigo' | 'blue' | 'red' | 'amber' | 'purple'>('indigo');

  // Load from local storage on mount
  useEffect(() => {
    const saved = localStorage.getItem('life_os_daily_rules');
    if (saved) {
      try {
        setRules(JSON.parse(saved));
      } catch (e) {
        setRules(DEFAULT_RULES);
      }
    } else {
      setRules(DEFAULT_RULES);
    }
  }, []);

  // Save to local storage whenever rules change
  const saveRules = (updated: RuleItem[]) => {
    setRules(updated);
    localStorage.setItem('life_os_daily_rules', JSON.stringify(updated));
  };

  // Toggle single rule completion
  const handleToggle = (id: string) => {
    playMechanicalClick();

    const nextRules = rules.map((r) => {
      if (r.id === id) {
        const nextState = !r.completed;
        // Award +10 XP for completion, or deduct 10 XP if unchecked
        addXP(nextState ? 10 : -10);
        return { ...r, completed: nextState };
      }
      return r;
    });

    saveRules(nextRules);

    // Check if ALL rules are completed now
    const allCompleted = nextRules.every(r => r.completed);
    const checkingCompleted = nextRules.find(r => r.id === id)?.completed;

    if (allCompleted && checkingCompleted) {
      playCrystalChime();
      confetti({
        particleCount: 80,
        spread: 60,
        origin: { y: 0.85 }
      });
    }
  };

  // Add custom rule
  const handleAddRule = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newLabel.trim()) return;

    const newRule: RuleItem = {
      id: `rule_custom_${Date.now()}`,
      label: newLabel.trim(),
      iconName: newIcon,
      colorTheme: newColor,
      completed: false,
      isCustom: true
    };

    const nextRules = [...rules, newRule];
    saveRules(nextRules);
    
    // Reset Form
    setNewLabel('');
    setIsModalOpen(false);
    playCrystalChime();
  };

  // Delete custom rule
  const handleDeleteRule = (id: string, e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent toggling when clicking delete icon
    playMechanicalClick();
    const nextRules = rules.filter((r) => r.id !== id);
    saveRules(nextRules);
  };

  // Add suggested popular rule
  const handleAddSuggestedRule = (s: typeof SUGGESTED_RULES[0]) => {
    playCrystalChime();
    const newRule: RuleItem = {
      id: `rule_suggested_${Date.now()}_${Math.random()}`,
      label: s.label,
      iconName: s.iconName,
      colorTheme: s.colorTheme as any,
      completed: false,
      isCustom: true
    };
    const nextRules = [...rules, newRule];
    saveRules(nextRules);
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-semibold" style={{ color: 'var(--text-secondary)' }}>
          Rule Hari Ini
        </h2>
        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-1 text-[10px] font-black text-indigo-400 hover:text-indigo-300 bg-indigo-500/10 px-2 py-0.5 rounded-full transition-all border border-indigo-500/20"
        >
          <Plus className="w-2.5 h-2.5" /> Atur Aturan
        </button>
      </div>

      <div className="flex items-center gap-3 overflow-x-auto pb-2 -mx-4 px-4 md:mx-0 md:px-0 hide-scrollbar w-full">
        <AnimatePresence mode="wait">
          {rules.length === 0 ? (
            <motion.div
              key="onboarding"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="flex flex-col gap-4 w-full p-6 rounded-2xl border border-dashed select-none"
              style={{ background: 'var(--bg-secondary)', borderColor: 'var(--border)' }}
            >
              <div className="flex items-start gap-3">
                <div className="p-2.5 rounded-xl bg-indigo-500/10 text-indigo-400 flex-shrink-0">
                  <Flame className="w-5 h-5 animate-pulse" />
                </div>
                <div className="space-y-1">
                  <h3 className="text-sm font-extrabold" style={{ color: 'var(--text-primary)' }}>
                    Mulai Komitmen Disiplinmu 🛡️
                  </h3>
                  <p className="text-xs leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
                    Aturan harian adalah komitmen personal untuk menjaga produktivitas Anda. 
                    Klik salah satu **rekomendasi aturan populer** di bawah untuk ditambahkan secara instan, atau buat aturan kustom Anda sendiri!
                  </p>
                </div>
              </div>

              {/* Suggestions Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5 mt-2">
                {SUGGESTED_RULES.map((s, idx) => {
                  const Icon = ICON_MAP[s.iconName] || CheckCircle2;
                  const theme = COLOR_MAP[s.colorTheme as keyof typeof COLOR_MAP];
                  return (
                    <motion.div
                      key={idx}
                      whileHover={{ scale: 1.015, y: -1 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => handleAddSuggestedRule(s)}
                      className="flex items-center gap-3 px-4 py-3 rounded-xl cursor-pointer border hover:bg-indigo-500/5 transition-all text-left group"
                      style={{ borderColor: 'var(--border)', background: 'var(--bg-primary)' }}
                    >
                      <div className={`p-2 rounded-lg transition-all group-hover:scale-105 ${theme.bg}`}>
                        <Icon className={`w-4 h-4 ${theme.text}`} />
                      </div>
                      <div className="flex-1">
                        <p className="text-xs font-bold leading-tight" style={{ color: 'var(--text-primary)' }}>
                          {s.label}
                        </p>
                        <span className="text-[9px] font-black text-indigo-400 opacity-60">
                          + Klik Tambah
                        </span>
                      </div>
                    </motion.div>
                  );
                })}
              </div>

              <div className="flex justify-start pt-1">
                <button
                  onClick={() => setIsModalOpen(true)}
                  className="flex items-center gap-1.5 text-xs font-black text-indigo-400 hover:text-indigo-300 bg-indigo-500/10 px-4 py-2.5 rounded-xl transition-all border border-indigo-500/20 active:scale-[0.98]"
                >
                  <Plus className="w-4 h-4" /> Buat Aturan Kustom Sendiri
                </button>
              </div>
            </motion.div>
          ) : (
            rules.map((rule) => {
              const Icon = ICON_MAP[rule.iconName] || CheckCircle2;
              const theme = COLOR_MAP[rule.colorTheme];
              
              return (
                <motion.div
                  key={rule.id}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  onClick={() => handleToggle(rule.id)}
                  className="group flex items-center gap-2.5 px-4 py-3 rounded-xl flex-shrink-0 cursor-pointer relative select-none border transition-all hover:translate-y-[-1px]"
                  style={{ 
                    background: rule.completed ? 'rgba(16, 185, 129, 0.04)' : 'var(--bg-secondary)', 
                    borderColor: rule.completed ? 'rgba(16, 185, 129, 0.3)' : 'var(--border)'
                  }}
                >
                  <div className={`p-1.5 rounded-lg transition-all ${rule.completed ? 'bg-emerald-500/20' : theme.bg}`}>
                    <Icon className={`w-4 h-4 transition-all ${rule.completed ? 'text-emerald-400' : theme.text}`} />
                  </div>
                  <span 
                    className={`text-xs font-semibold whitespace-nowrap transition-all ${rule.completed ? 'line-through opacity-40 text-emerald-400' : ''}`} 
                    style={{ color: rule.completed ? undefined : 'var(--text-primary)' }}
                  >
                    {rule.label}
                  </span>
  
                  {/* Floating Reward Indicator */}
                  {!rule.completed && (
                    <div className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-all text-[8px] font-black text-indigo-400 bg-indigo-500/10 px-1 rounded">
                      +10 XP
                    </div>
                  )}
  
                  {/* Delete button (For all rules on hover) */}
                  <button
                    onClick={(e) => handleDeleteRule(rule.id, e)}
                    className="ml-2 w-4 h-4 rounded-full bg-red-500/10 text-red-400 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all hover:bg-red-500/20"
                  >
                    <Trash2 className="w-2.5 h-2.5" />
                  </button>
                </motion.div>
              );
            })
          )}
        </AnimatePresence>
      </div>

      {/* Floating neon glassmorphic Custom Rule Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              className="w-full max-w-sm rounded-3xl p-6 relative overflow-hidden border"
              style={{ background: 'var(--bg-secondary)', borderColor: 'var(--border)' }}
            >
              <div className="absolute -top-12 -right-12 w-28 h-28 bg-indigo-500/10 rounded-full blur-2xl pointer-events-none" />

              {/* Close Button */}
              <button
                onClick={() => setIsModalOpen(false)}
                className="absolute top-4 right-4 w-7 h-7 rounded-full flex items-center justify-center bg-white/5 border border-white/10 hover:bg-white/10 transition-all text-white/60 hover:text-white"
              >
                <X className="w-3.5 h-3.5" />
              </button>

              <div className="flex items-center gap-2 mb-4">
                <div className="w-7 h-7 rounded-lg bg-indigo-500/10 text-indigo-400 flex items-center justify-center">
                  <Sparkles className="w-4 h-4 animate-pulse" />
                </div>
                <h3 className="text-sm font-extrabold text-white" style={{ color: 'var(--text-primary)' }}>
                  Tambah Aturan Disiplin
                </h3>
              </div>

              <form onSubmit={handleAddRule} className="space-y-4">
                {/* Input Label */}
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-white/40 uppercase tracking-wider block">
                    Nama Aturan
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Contoh: No Instagram sebelum jam 12:00..."
                    value={newLabel}
                    onChange={(e) => setNewLabel(e.target.value)}
                    className="w-full text-xs px-3.5 py-3 rounded-xl border bg-black/20 text-white placeholder-white/30 focus:outline-none focus:border-indigo-500 transition-all"
                    style={{ borderColor: 'var(--border)' }}
                  />
                </div>

                {/* Color Theme Selector */}
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-white/40 uppercase tracking-wider block">
                    Tema Warna
                  </label>
                  <div className="flex items-center gap-2">
                    {(Object.keys(COLOR_MAP) as Array<keyof typeof COLOR_MAP>).map((c) => (
                      <button
                        key={c}
                        type="button"
                        onClick={() => setNewColor(c)}
                        className={`w-6 h-6 rounded-full border-2 transition-all ${
                          newColor === c ? 'scale-110 border-white' : 'border-transparent'
                        }`}
                        style={{ backgroundColor: c === 'emerald' ? '#10B981' : c === 'indigo' ? '#6366F1' : c === 'blue' ? '#3B82F6' : c === 'red' ? '#EF4444' : c === 'amber' ? '#F59E0B' : '#8B5CF6' }}
                      />
                    ))}
                  </div>
                </div>

                {/* Icon Selector */}
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-white/40 uppercase tracking-wider block">
                    Pilih Ikon
                  </label>
                  <div className="grid grid-cols-5 gap-2 bg-black/10 p-2.5 rounded-2xl border" style={{ borderColor: 'var(--border)' }}>
                    {Object.keys(ICON_MAP).map((iconName) => {
                      const Icon = ICON_MAP[iconName];
                      return (
                        <button
                          key={iconName}
                          type="button"
                          onClick={() => setNewIcon(iconName)}
                          className={`p-2.5 rounded-lg flex items-center justify-center transition-all ${
                            newIcon === iconName ? 'bg-indigo-500 text-white' : 'bg-white/5 text-white/60 hover:bg-white/10 hover:text-white'
                          }`}
                        >
                          <Icon className="w-4 h-4" />
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Submit button */}
                <button
                  type="submit"
                  className="w-full text-xs font-black py-3 rounded-xl bg-indigo-500 hover:bg-indigo-600 active:scale-[0.98] transition-all text-white shadow-lg shadow-indigo-500/20"
                >
                  Simpan Aturan Baru
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
