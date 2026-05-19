'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Sparkles, Plus, FolderPlus } from 'lucide-react';
import { useAppStore } from '@/store/useAppStore';
import { cn } from '@/lib/utils';

interface CustomHabitModalProps {
  onClose: () => void;
  activeCategoryId: string;
  activeCategoryLabel: string;
}

const POPULAR_EMOJIS = Array.from(new Set([
  // ☀️ Pagi & Kebiasaan Sehari-hari
  '🧹', '🚿', '🛏️', '🧼', '🌅', '☀️', '🌄', '☕', '🍵', '🥛', '🥤', '🍳', '🥞', '🥣', '🍽️', '🥢',
  // 🕌 Ibadah & Kerohanian
  '🕌', '📿', '📖', '🙏', '🌙', '⭐', '⛪', '🕍', '🕯️', '🕊️', '🕋',
  // 💪 Kesehatan, Diet & Olahraga
  '💪', '🏃', '🚶', '🚴', '🧘', '🤸', '🏊', '🏋️', '🧗', '⛹️', '🥊', '🥋', '👟', '🥗', '🍎', '🥦', '🥕', '💧', '🍌', '🍉', '🍇', '🍓', '🥑', '🍅', '🍒', '🍋',
  // 💻 Produktivitas, Kerja & Belajar
  '💻', '💼', '📝', '✍️', '📊', '📚', '🎓', '🎯', '⏱️', '⏰', '📅', '🗒️', '📁', '📌', '📎', '🚀', '🧠', '💡', '🔥', '✨', '📢', '📞', '🎙️', '🎧', '🔧',
  // 🎨 Hiburan, Kreativitas & Hobi
  '🎨', '🎵', '🎹', '🎸', '🎮', '🕹️', '♟️', '🎲', '🧩', '📸', '🎬', '🍿', '🏕️', '⛺', '✈️', '🚗', '🛵', '🚲',
  // 🏡 Rumah & Gaya Hidup
  '🏡', '🏠', '🛋️', '🌱', '🪴', '🌸', '🌼', '🌳', '🐾', '🐱', '🐶', '❤️', '💖', '🌈', '🎈', '🎁', '🎉', '🍀',
  // 📵 Disiplin, Pantangan & Keuangan
  '🚫', '📵', '🚭', '🔕', '🛑', '🔒', '🔑', '🔋', '🔌', '💤', '🛌', '🛀', '💆', '🩹', '💊', '💰', '💵', '💳', '🛡️', '💎'
]));

const EMOJI_MAPPING: Record<string, string> = {
  // Indonesian Keywords
  'sapu': '🧹',
  'bersih': '🧹',
  'rapi': '🧹',
  'mandi': '🚿',
  'sholat': '🕌',
  'pray': '🕌',
  'quran': '📖',
  'mengaji': '📿',
  'dzikir': '📿',
  'minum': '💧',
  'air': '💧',
  'makan': '🍽️',
  'buah': '🍎',
  'sayur': '🥦',
  'olahraga': '💪',
  'gym': '💪',
  'sepeda': '🚴',
  'lari': '🏃',
  'jalan': '🚶',
  'baca': '📖',
  'buku': '📚',
  'belajar': '🎓',
  'kerja': '💼',
  'freelance': '💻',
  'coding': '💻',
  'nulis': '✍️',
  'tulis': '✍️',
  'jurnal': '📝',
  'tidur': '😴',
  'istirahat': '🛌',
  'meditasi': '🧘',
  'tenang': '🧘',
  'kopi': '☕',
  'teh': '🍵',
  'pantang': '🚫',
  'tiktok': '📵',
  'sosmed': '📵',
  'hp': '📵',
  'game': '🎮',
  'main': '🎮',
  'musik': '🎵',
  'gambar': '🎨',
  'lukis': '🎨',
  'subuh': '🌅',
  'pagi': '☀️',
  'malam': '🌙',
  'tugas': '📝',

  // English Keywords
  'clean': '🧹',
  'sweep': '🧹',
  'shower': '🚿',
  'bath': '🚿',
  'water': '💧',
  'drink': '💧',
  'eat': '🍽️',
  'food': '🍽️',
  'fruit': '🍎',
  'exercise': '💪',
  'run': '🏃',
  'walk': '🚶',
  'read': '📖',
  'book': '📚',
  'study': '🎓',
  'work': '💼',
  'write': '✍️',
  'journal': '📝',
  'sleep': '😴',
  'bed': '🛌',
  'meditate': '🧘',
  'coffee': '☕',
  'tea': '🍵',
  'phone': '📵',
  'social': '📵',
  'music': '🎵',
  'draw': '🎨'
};

const CATEGORY_EMOJI_MAPPING: Record<string, string> = {
  'pagi': '🌅',
  'siang': '☀️',
  'sore': '🌇',
  'malam': '🌙',
  'sholat': '🕌',
  'ibadah': '🕌',
  'sehat': '💪',
  'kesehatan': '💪',
  'freelance': '💻',
  'kerja': '💼',
  'belajar': '📚',
  'hobi': '🎨',
  'olahraga': '🏃',
  'keuangan': '💰',
  'money': '💰',
  'rutinitas': '🔄',
  'fokus': '🎯'
};

interface Suggestion {
  name: string;
  emoji: string;
  deadline?: string;
}

const CATEGORY_SUGGESTIONS: Record<string, Suggestion[]> = {
  morning: [
    { name: 'Merapikan Kasur', emoji: '🛏️', deadline: '07:30' },
    { name: 'Meditasi Pagi', emoji: '🧘', deadline: '08:00' },
    { name: 'Minum Air Hangat', emoji: '🍵', deadline: '07:00' },
    { name: 'Jurnal Kesyukuran', emoji: '✍️', deadline: '08:30' },
  ],
  focus: [
    { name: 'Belajar Coding', emoji: '💻' },
    { name: 'Membaca Buku Bisnis', emoji: '📖' },
    { name: 'Menulis Rencana Kerja', emoji: '📝' },
    { name: 'Teknik Pomodoro 2x', emoji: '⏱️' },
  ],
  night: [
    { name: 'Digital Detox (No Phone)', emoji: '📵', deadline: '22:00' },
    { name: 'Menulis Catatan Harian', emoji: '✍️', deadline: '22:30' },
    { name: 'Membaca Novel / Fiksi', emoji: '📖', deadline: '23:00' },
    { name: 'Peregangan Malam', emoji: '🧘', deadline: '22:45' },
  ],
  default: [
    { name: 'Minum Air Putih', emoji: '💧' },
    { name: 'Olahraga Ringan', emoji: '💪' },
    { name: 'Berjalan Kaki 5K Langkah', emoji: '🚶' },
    { name: 'Makan Buah & Sayur', emoji: '🍎' },
  ]
};

const SUBMENU_TEMPLATES = [
  { id: 'prayer', label: 'Sholat & Ibadah', emoji: '🕌', desc: 'Jadwal & habit sholat harian' },
  { id: 'health', label: 'Kesehatan & Diet', emoji: '💪', desc: 'Minum air & makan sehat' },
  { id: 'morning', label: 'Ritual Pagi', emoji: '🌅', desc: 'Ritual & bangun tidur' },
  { id: 'focus', label: 'Fokus & Kerja', emoji: '🎯', desc: 'Belajar & produktivitas' },
  { id: 'night', label: 'Ritual Malam', emoji: '🌙', desc: 'Detoks digital & tidur' }
];

export function CustomHabitModal({ onClose, activeCategoryId, activeCategoryLabel }: CustomHabitModalProps) {
  const { addCustomCategory, addCustomHabit, customCategories } = useAppStore();
  const [activeTab, setActiveTab] = useState<'habit' | 'category'>('habit');

  const handleApplyTemplate = (tmpl: typeof SUBMENU_TEMPLATES[0]) => {
    addCustomCategory(tmpl.label.split(' & ')[0], tmpl.emoji, tmpl.id);
    onClose();
  };
  
  // Habit State
  const allowedCategories = (customCategories || []).filter((c) => c.id !== 'prayer' && c.id !== 'health');
  const initialCategoryId = (activeCategoryId === 'prayer' || activeCategoryId === 'health')
    ? (allowedCategories[0]?.id || '')
    : activeCategoryId;

  const [selectedCategoryId, setSelectedCategoryId] = useState(initialCategoryId);
  const [habitName, setHabitName] = useState('');
  const [habitEmoji, setHabitEmoji] = useState('✨');
  const [habitDeadline, setHabitDeadline] = useState('');
  const [isManualEmoji, setIsManualEmoji] = useState(false);

  // Category State
  const [categoryName, setCategoryName] = useState('');
  const [categoryEmoji, setCategoryEmoji] = useState('📂');
  const [isManualCategoryEmoji, setIsManualCategoryEmoji] = useState(false);

  // Load suggestions dynamically based on active selected category
  const suggestions = CATEGORY_SUGGESTIONS[selectedCategoryId] || CATEGORY_SUGGESTIONS.default;

  // Intelligent Emoji Auto-Suggestion for Habit Name
  useEffect(() => {
    if (isManualEmoji || !habitName.trim()) return;
    const nameLower = habitName.toLowerCase();
    for (const [keyword, emoji] of Object.entries(EMOJI_MAPPING)) {
      if (nameLower.includes(keyword)) {
        setHabitEmoji(emoji);
        break;
      }
    }
  }, [habitName, isManualEmoji]);

  // Intelligent Emoji Auto-Suggestion for Category Name
  useEffect(() => {
    if (isManualCategoryEmoji || !categoryName.trim()) return;
    const nameLower = categoryName.toLowerCase();
    for (const [keyword, emoji] of Object.entries(CATEGORY_EMOJI_MAPPING)) {
      if (nameLower.includes(keyword)) {
        setCategoryEmoji(emoji);
        break;
      }
    }
  }, [categoryName, isManualCategoryEmoji]);

  const handleHabitNameChange = (val: string) => {
    // Match actual colorful emojis
    const emojiRegex = /\p{Emoji_Presentation}/gu;
    const match = val.match(emojiRegex);
    
    if (match) {
      const extractedEmoji = match[0];
      setHabitEmoji(extractedEmoji);
      setIsManualEmoji(true);
      
      // Clean and strip the emoji from input field
      const cleanVal = val.replace(emojiRegex, '');
      setHabitName(cleanVal);
    } else {
      setHabitName(val);
    }
  };

  const handleCategoryNameChange = (val: string) => {
    const emojiRegex = /\p{Emoji_Presentation}/gu;
    const match = val.match(emojiRegex);
    
    if (match) {
      const extractedEmoji = match[0];
      setCategoryEmoji(extractedEmoji);
      setIsManualCategoryEmoji(true);
      
      // Clean and strip the emoji from input field
      const cleanVal = val.replace(emojiRegex, '');
      setCategoryName(cleanVal);
    } else {
      setCategoryName(val);
    }
  };

  const handleCreateHabit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!habitName.trim()) return;

    addCustomHabit(selectedCategoryId, habitName.trim(), habitEmoji, habitDeadline || undefined);
    onClose();
  };

  const handleCreateCategory = (e: React.FormEvent) => {
    e.preventDefault();
    if (!categoryName.trim()) return;

    const catId = 'cat_' + Date.now();
    addCustomCategory(categoryName.trim(), categoryEmoji, catId);
    
    // Switch to "+ Kebiasaan Baru" tab so they can immediately add habits to their new sub-menu!
    setSelectedCategoryId(catId);
    setActiveTab('habit');

    // Reset only category inputs
    setCategoryName('');
    setCategoryEmoji('📂');
  };

  const applySuggestion = (sug: Suggestion) => {
    setHabitName(sug.name);
    setHabitEmoji(sug.emoji);
    setIsManualEmoji(true);
    if (sug.deadline) {
      setHabitDeadline(sug.deadline);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2, ease: 'easeOut' }}
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-[2px]"
    >
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 16 }}
        transition={{ type: 'tween', ease: [0.16, 1, 0.3, 1], duration: 0.35 }}
        className="w-full max-w-md rounded-2xl overflow-hidden shadow-2xl relative"
            style={{ 
              background: 'var(--bg-card)', 
              border: '1px solid var(--border)',
              boxShadow: '0 20px 25px -5px rgba(0,0,0,0.5), 0 10px 10px -5px rgba(0,0,0,0.5)'
            }}
          >
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b" style={{ borderColor: 'var(--border)' }}>
              <div className="flex items-center gap-1.5">
                <Sparkles className="w-5 h-5 text-amber-500" />
                <h3 className="text-base font-bold" style={{ color: 'var(--text-primary)' }}>
                  Kelola Kebiasaan & Sub-Menu
                </h3>
              </div>
              <button onClick={onClose} className="p-1 rounded-lg transition-colors hover:bg-white/10">
                <X className="w-5 h-5" style={{ color: 'var(--text-muted)' }} />
              </button>
            </div>

            {/* Tabs */}
            <div className="flex p-1 m-4 rounded-xl" style={{ background: 'var(--bg-secondary)' }}>
              <button
                onClick={() => setActiveTab('habit')}
                className={cn(
                  "flex-1 py-2 text-xs font-semibold rounded-lg transition-all",
                  activeTab === 'habit' 
                    ? "shadow-md bg-[var(--bg-card)] text-[var(--accent)]" 
                    : "text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
                )}
              >
                + Kebiasaan Baru
              </button>
              <button
                onClick={() => setActiveTab('category')}
                className={cn(
                  "flex-1 py-2 text-xs font-semibold rounded-lg transition-all",
                  activeTab === 'category' 
                    ? "shadow-md bg-[var(--bg-card)] text-[var(--accent)]" 
                    : "text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
                )}
              >
                + Sub-Menu Baru
              </button>
            </div>

            {/* Body */}
            <div className="p-4 pt-0 max-h-[70vh] overflow-y-auto">
              {activeTab === 'habit' ? (
                (!customCategories || customCategories.length === 0) ? (
                  <div className="flex flex-col items-center justify-center py-8 px-4 text-center space-y-4">
                    <div className="w-16 h-16 rounded-full bg-amber-500/10 flex items-center justify-center border border-amber-500/20 text-amber-500 animate-pulse">
                      <FolderPlus className="w-7 h-7 text-amber-500" />
                    </div>
                    <div className="space-y-1">
                      <h4 className="text-sm font-bold" style={{ color: 'var(--text-primary)' }}>
                        Belum Ada Sub-Menu Kustom
                      </h4>
                      <p className="text-xs max-w-xs leading-normal" style={{ color: 'var(--text-muted)' }}>
                        Anda perlu membuat setidaknya satu sub-menu kustom (seperti Pagi, Belajar, Kerja) terlebih dahulu sebelum dapat menambahkan kebiasaan baru.
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setActiveTab('category')}
                      className="px-4 py-2.5 rounded-xl text-xs font-semibold text-white transition-all bg-amber-500 hover:bg-amber-600 shadow-lg shadow-amber-500/10 flex items-center gap-1"
                    >
                      <Plus className="w-3.5 h-3.5" /> Buat Sub-Menu Sekarang
                    </button>
                  </div>
                ) : (
                  <form onSubmit={handleCreateHabit} className="space-y-4">
                    {/* Category Selector Dropdown */}
                    <div className="space-y-1">
                      <label className="text-[11px] font-bold" style={{ color: 'var(--text-secondary)' }}>SUB-MENU TUJUAN</label>
                      <select
                        value={selectedCategoryId}
                        onChange={(e) => setSelectedCategoryId(e.target.value)}
                        className="w-full px-3 py-2.5 rounded-xl border text-sm font-semibold focus:outline-none focus:ring-1 focus:ring-amber-500"
                        style={{ background: 'var(--bg-secondary)', borderColor: 'var(--border)', color: 'var(--text-primary)' }}
                      >
                        {(customCategories || [])
                          .filter((cat) => cat.id !== 'prayer' && cat.id !== 'health')
                          .map((cat) => (
                            <option key={cat.id} value={cat.id}>
                              {cat.emoji} {cat.label}
                            </option>
                          ))}
                      </select>
                    </div>

                    {/* Habit Name Input */}
                    <div className="space-y-1">
                      <label className="text-[11px] font-bold" style={{ color: 'var(--text-secondary)' }}>NAMA KEBIASAAN</label>
                      <div className="flex gap-2">
                        <span className="text-2xl p-2 rounded-xl flex items-center justify-center border" style={{ background: 'var(--bg-secondary)', borderColor: 'var(--border)' }}>
                          {habitEmoji}
                        </span>
                        <input
                          type="text"
                          placeholder="Contoh: Belajar UI/UX Design..."
                          value={habitName}
                          onChange={(e) => handleHabitNameChange(e.target.value)}
                          className="flex-1 px-3 rounded-xl border text-sm focus:outline-none focus:ring-1 focus:ring-amber-500"
                          style={{ background: 'var(--bg-secondary)', borderColor: 'var(--border)', color: 'var(--text-primary)' }}
                          required
                        />
                      </div>
                    </div>

                    {/* Suggestions Panel */}
                    <div className="space-y-1">
                      <label className="text-[11px] font-bold flex items-center gap-1" style={{ color: 'var(--text-secondary)' }}>
                        💡 REKOMENDASI POPULER
                      </label>
                      <div className="grid grid-cols-2 gap-2">
                        {suggestions.map((sug, i) => (
                          <button
                            key={i}
                            type="button"
                            onClick={() => applySuggestion(sug)}
                            className="flex items-center gap-1.5 p-2 rounded-lg text-left text-xs transition-all hover:bg-white/5 border border-dashed hover:border-amber-500/30"
                            style={{ background: 'var(--bg-secondary)', borderColor: 'var(--border)', color: 'var(--text-primary)' }}
                          >
                            <span>{sug.emoji}</span>
                            <span className="truncate">{sug.name}</span>
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Popular Emoji Selector */}
                    <div className="space-y-1">
                      <label className="text-[11px] font-bold" style={{ color: 'var(--text-secondary)' }}>PILIH EMOJI</label>
                      <div className="grid grid-cols-8 gap-1.5 p-2 rounded-xl border max-h-44 overflow-y-auto" style={{ background: 'var(--bg-secondary)', borderColor: 'var(--border)' }}>
                        {POPULAR_EMOJIS.map((emoji) => (
                          <button
                            key={emoji}
                            type="button"
                            onClick={() => {
                              setHabitEmoji(emoji);
                              setIsManualEmoji(true);
                            }}
                            className={cn(
                              "text-xl p-1 rounded-lg transition-transform hover:scale-110",
                              habitEmoji === emoji ? "bg-amber-500/20 border border-amber-500/50" : ""
                            )}
                          >
                            {emoji}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Target Time / Deadline */}
                    <div className="space-y-1">
                      <label className="text-[11px] font-bold" style={{ color: 'var(--text-secondary)' }}>TARGET WAKTU / DEADLINE (OPSIONAL)</label>
                      <input
                        type="time"
                        value={habitDeadline}
                        onChange={(e) => setHabitDeadline(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl border text-sm focus:outline-none"
                        style={{ background: 'var(--bg-secondary)', borderColor: 'var(--border)', color: 'var(--text-primary)' }}
                      />
                    </div>

                    {/* Reward Badge */}
                    <div className="flex items-center justify-between p-3 rounded-xl text-xs font-semibold" style={{ background: 'rgba(99,102,241,0.08)', border: '1px solid rgba(99,102,241,0.2)' }}>
                      <span style={{ color: 'var(--text-secondary)' }}>Hadiah Penyelesaian:</span>
                      <span className="px-2.5 py-0.5 rounded-full font-bold" style={{ background: 'rgba(99,102,241,0.15)', color: 'var(--accent)' }}>
                        +15 XP ⚡
                      </span>
                    </div>

                    {/* Submit Button */}
                    <button
                      type="submit"
                      className="w-full py-3 rounded-xl font-semibold text-sm transition-all hover:brightness-110 flex items-center justify-center gap-1 text-white shadow-lg shadow-amber-500/10"
                      style={{ background: 'var(--accent)' }}
                    >
                      <Plus className="w-4 h-4" /> Buat Kebiasaan
                    </button>
                  </form>
                )
              ) : (
                <div className="space-y-4">
                  {/* Preset Templates */}
                  <div className="space-y-1">
                    <label className="text-[11px] font-bold flex items-center gap-1" style={{ color: 'var(--text-secondary)' }}>
                      ✨ TEMPLATE SUB-MENU REKOMENDASI
                    </label>
                    <div className="grid grid-cols-1 gap-2 max-h-44 overflow-y-auto pr-1">
                      {SUBMENU_TEMPLATES.map((tmpl) => {
                        const exists = (customCategories || []).some(c => c.id === tmpl.id);
                        return (
                          <button
                            key={tmpl.id}
                            type="button"
                            onClick={() => handleApplyTemplate(tmpl)}
                            disabled={exists}
                            className={cn(
                              "flex items-center justify-between p-2.5 rounded-xl text-left text-xs transition-all border border-dashed w-full",
                              exists 
                                ? "opacity-50 cursor-not-allowed bg-white/5 border-transparent" 
                                : "hover:bg-white/5 hover:border-amber-500/30"
                            )}
                            style={{ 
                              background: 'var(--bg-secondary)', 
                              borderColor: 'var(--border)', 
                              color: 'var(--text-primary)' 
                            }}
                          >
                            <div className="flex items-center gap-2.5 min-w-0">
                              <span className="text-xl shrink-0">{tmpl.emoji}</span>
                              <div className="min-w-0">
                                <p className="font-bold truncate" style={{ color: 'var(--text-primary)' }}>{tmpl.label}</p>
                                <p className="text-[9px] truncate" style={{ color: 'var(--text-muted)' }}>{tmpl.desc}</p>
                              </div>
                            </div>
                            {exists ? (
                              <span className="text-[9px] text-emerald-400 font-bold shrink-0 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">Aktif</span>
                            ) : (
                              <span className="text-[9px] text-amber-400 font-bold shrink-0 bg-amber-500/10 px-2 py-0.5 rounded-full border border-amber-500/20">+ Pasang</span>
                            )}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  <div className="h-[1px] w-full bg-gradient-to-r from-transparent via-[var(--border)] to-transparent my-1" />

                  <form onSubmit={handleCreateCategory} className="space-y-4">
                    {/* Category Name Input */}
                    <div className="space-y-1">
                      <label className="text-[11px] font-bold" style={{ color: 'var(--text-secondary)' }}>ATAU BUAT SUB-MENU KUSTOM</label>
                    <div className="flex gap-2">
                      <span className="text-2xl p-2 rounded-xl flex items-center justify-center border" style={{ background: 'var(--bg-secondary)', borderColor: 'var(--border)' }}>
                        {categoryEmoji}
                      </span>
                      <input
                        type="text"
                        placeholder="Contoh: Belajar, Olahraga, Hobi..."
                        value={categoryName}
                        onChange={(e) => handleCategoryNameChange(e.target.value)}
                        className="flex-1 px-3 rounded-xl border text-sm focus:outline-none focus:ring-1 focus:ring-amber-500"
                        style={{ background: 'var(--bg-secondary)', borderColor: 'var(--border)', color: 'var(--text-primary)' }}
                        required
                      />
                    </div>
                  </div>

                  {/* Popular Emoji Selector */}
                  <div className="space-y-1">
                    <label className="text-[11px] font-bold" style={{ color: 'var(--text-secondary)' }}>PILIH EMOJI SUB-MENU</label>
                    <div className="grid grid-cols-8 gap-1.5 p-2 rounded-xl border max-h-44 overflow-y-auto" style={{ background: 'var(--bg-secondary)', borderColor: 'var(--border)' }}>
                      {POPULAR_EMOJIS.map((emoji) => (
                        <button
                          key={emoji}
                          type="button"
                          onClick={() => {
                            setCategoryEmoji(emoji);
                            setIsManualCategoryEmoji(true);
                          }}
                          className={cn(
                            "text-xl p-1 rounded-lg transition-transform hover:scale-110",
                            categoryEmoji === emoji ? "bg-amber-500/20 border border-amber-500/50" : ""
                          )}
                        >
                          {emoji}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Submit Button */}
                  <button
                    type="submit"
                    className="w-full py-3 rounded-xl font-semibold text-sm transition-all hover:brightness-110 flex items-center justify-center gap-1 text-white shadow-lg shadow-amber-500/10"
                    style={{ background: 'var(--accent)' }}
                  >
                    <Plus className="w-4 h-4" /> Buat Sub-Menu
                  </button>
                  </form>
                </div>
              )}
            </div>
          </motion.div>
    </motion.div>
  );
}
