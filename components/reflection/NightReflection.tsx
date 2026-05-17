'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { useAppStore } from '@/store/useAppStore';
import { saveReflection } from '@/lib/firebase/firestore';
import { getToday } from '@/lib/utils/time';
import { BookOpen, Send } from 'lucide-react';

export function NightReflection() {
  const { user } = useAppStore();
  const [form, setForm] = useState({ bestMoment: '', failure: '', planTomorrow: '' });
  const [saved, setSaved] = useState(false);

  // Only show after 21:00
  const hour = new Date().getHours();
  if (hour < 21) {
    return (
      <div className="card text-center py-8">
        <BookOpen className="w-8 h-8 mx-auto mb-2" style={{ color: 'var(--text-muted)' }} />
        <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
          Refleksi malam akan muncul setelah pukul 21:00
        </p>
      </div>
    );
  }

  const handleSave = async () => {
    if (!user || !form.bestMoment.trim()) return;
    try {
      await saveReflection({ date: getToday(), userId: user.uid, ...form, createdAt: new Date() });
      setSaved(true);
    } catch (e) { console.error(e); }
  };

  if (saved) {
    return (
      <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} className="card text-center py-8"
        style={{ background: 'rgba(16,185,129,0.08)', border: '1px solid rgba(16,185,129,0.3)' }}>
        <p className="text-2xl mb-2">🌙</p>
        <p className="font-bold text-sm text-green-400">Refleksi tersimpan!</p>
        <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>Tidur yang nyenyak. Besok lebih baik!</p>
      </motion.div>
    );
  }

  return (
    <div className="card">
      <div className="flex items-center gap-2 mb-4">
        <BookOpen className="w-4 h-4" style={{ color: 'var(--accent)' }} />
        <span className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>Refleksi Malam 🌙</span>
      </div>

      <div className="space-y-3">
        {[
          { key: 'bestMoment', label: 'Hal terbaik hari ini?', placeholder: 'Satu hal positif yang kamu capai...', emoji: '✨' },
          { key: 'failure', label: 'Apa yang bisa diperbaiki?', placeholder: 'Jujur dengan dirimu sendiri...', emoji: '📝' },
          { key: 'planTomorrow', label: 'Rencana besok?', placeholder: 'Satu hal penting yang harus dilakukan...', emoji: '🎯' },
        ].map(({ key, label, placeholder, emoji }) => (
          <div key={key}>
            <label className="text-xs font-medium mb-1 block" style={{ color: 'var(--text-secondary)' }}>
              {emoji} {label}
            </label>
            <textarea
              value={(form as any)[key]}
              onChange={(e) => setForm((f) => ({ ...f, [key]: e.target.value }))}
              placeholder={placeholder}
              rows={2}
              className="w-full text-sm px-3 py-2 rounded-xl resize-none outline-none transition-all"
              style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border)', color: 'var(--text-primary)' }}
            />
          </div>
        ))}

        <motion.button whileTap={{ scale: 0.97 }} onClick={handleSave}
          className="btn-primary w-full justify-center">
          <Send className="w-4 h-4" /> Simpan Refleksi
        </motion.button>
      </div>
    </div>
  );
}
