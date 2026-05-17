'use client';

import { motion } from 'framer-motion';
import { Sun, Moon, Bell } from 'lucide-react';
import { useAppStore } from '@/store/useAppStore';
import { getLevelFromXP } from '@/lib/constants/levels';

interface TopBarProps {
  title?: string;
}

export function TopBar({ title }: TopBarProps) {
  const { theme, toggleTheme, totalXP } = useAppStore();
  const level = getLevelFromXP(totalXP);

  return (
    <header
      className="sticky top-0 z-30 flex items-center justify-between px-4 py-3 lg:px-6"
      style={{
        background: 'var(--bg-primary)',
        borderBottom: '1px solid var(--border)',
        backdropFilter: 'blur(12px)',
      }}
    >
      <div>
        {title && (
          <h2 className="text-base font-semibold lg:text-lg" style={{ color: 'var(--text-primary)' }}>
            {title}
          </h2>
        )}
      </div>

      <div className="flex items-center gap-2">
        {/* Level badge - mobile only */}
        <div
          className="lg:hidden flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold"
          style={{
            background: `${level.color}20`,
            color: level.color,
            border: `1px solid ${level.color}40`,
          }}
        >
          <span>{level.emoji}</span>
          <span>Lv.{level.level}</span>
        </div>

        {/* Notifications */}
        <motion.button
          whileTap={{ scale: 0.9 }}
          className="relative p-2 rounded-xl transition-colors"
          style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}
        >
          <Bell className="w-4 h-4" style={{ color: 'var(--text-secondary)' }} />
          <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-red-500" />
        </motion.button>

        {/* Theme toggle */}
        <motion.button
          whileTap={{ scale: 0.9 }}
          onClick={toggleTheme}
          className="p-2 rounded-xl transition-colors"
          style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}
        >
          {theme === 'dark' ? (
            <Sun className="w-4 h-4" style={{ color: 'var(--warning)' }} />
          ) : (
            <Moon className="w-4 h-4" style={{ color: 'var(--accent)' }} />
          )}
        </motion.button>
      </div>
    </header>
  );
}
