'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { Sun, Moon, Bell, CalendarDays } from 'lucide-react';
import { useAppStore } from '@/store/useAppStore';
import { getLevelFromXP, getLevelBadgeStyle } from '@/lib/constants/levels';
import { useEffect, useState, useRef } from 'react';
import { NotificationCenter } from './NotificationCenter';
import { LevelRoadmapModal } from '@/components/dashboard/LevelRoadmapModal';

interface TopBarProps {
  title?: string;
}

export function TopBar({ title }: TopBarProps) {
  const { theme, toggleTheme, totalXP, notifications = [] } = useAppStore();
  const level = getLevelFromXP(totalXP);
  const [dateStr, setDateStr] = useState('');
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [isRoadmapOpen, setIsRoadmapOpen] = useState(false);
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);
  const triggerRef = useRef<HTMLButtonElement>(null);

  const unreadCount = notifications.filter(n => !n.read).length;

  useEffect(() => {
    const now = new Date();
    const formatter = new Intl.DateTimeFormat('id-ID', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
    setDateStr(formatter.format(now));
  }, []);

  // Collapse calendar back to icon after 5 seconds on mobile
  useEffect(() => {
    if (isCalendarOpen) {
      const timer = setTimeout(() => {
        setIsCalendarOpen(false);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [isCalendarOpen]);

  return (
    <header
      className="sticky top-0 z-30 flex items-center justify-between px-4 py-3 lg:px-6 mb-2"
      style={{
        background: 'transparent',
      }}
    >
      {/* Left side (flex-1 to help center the middle item) */}
      <div className="flex-1">
        {title && (
          <h2 className="text-base font-semibold lg:hidden" style={{ color: 'var(--text-primary)' }}>
            {title}
          </h2>
        )}
      </div>

      {/* Center: Empty to maintain space if needed or just remove */}
      <div className="hidden lg:flex flex-1 items-center justify-center"></div>

      {/* Right side */}
      <div className="flex-1 flex justify-end items-center gap-1.5 sm:gap-3">
        {/* Level badge - mobile only (interactive button) - SWAPPED to the left */}
        <motion.button
          whileTap={{ scale: 0.95 }}
          onClick={() => setIsRoadmapOpen(true)}
          className="lg:hidden flex items-center gap-1.5 px-2.5 py-1.5 rounded-full text-xs font-semibold cursor-pointer select-none active:scale-95 transition-all flex-shrink-0"
          style={getLevelBadgeStyle(level.level, level.color)}
        >
          <level.icon className="w-3.5 h-3.5" />
          <span>Lv.{level.level}</span>
        </motion.button>

        {/* Date Badge / Interactive Button - visible near notifications */}
        <div className="relative flex items-center justify-end">
          {/* Desktop version (always expanded) */}
          <div 
            className="hidden sm:flex items-center gap-1.5 px-4 py-1.5 rounded-2xl text-xs font-medium flex-shrink-0"
            style={{ 
              background: 'var(--bg-secondary)', 
              border: '1px solid var(--border)',
              color: 'var(--text-secondary)'
            }}
          >
            <CalendarDays className="w-3.5 h-3.5" />
            <span>{dateStr}</span>
          </div>

          {/* Mobile version (dynamic width-expanding button container) */}
          <motion.button
            layout
            whileTap={{ scale: 0.95 }}
            onClick={() => setIsCalendarOpen(!isCalendarOpen)}
            className="sm:hidden flex items-center justify-center h-8.5 rounded-xl transition-all duration-300 overflow-hidden px-2 flex-shrink-0"
            style={{ 
              background: 'var(--bg-secondary)', 
              border: isCalendarOpen ? '1px solid var(--text-primary)' : '1px solid var(--border)',
              width: isCalendarOpen ? 'auto' : '34px',
            }}
          >
            <CalendarDays className="w-4 h-4 flex-shrink-0" style={{ color: isCalendarOpen ? 'var(--text-primary)' : 'var(--text-secondary)' }} />
            <AnimatePresence initial={false}>
              {isCalendarOpen && (
                <motion.span
                  initial={{ opacity: 0, width: 0, marginLeft: 0 }}
                  animate={{ opacity: 1, width: 'auto', marginLeft: 6 }}
                  exit={{ opacity: 0, width: 0, marginLeft: 0 }}
                  transition={{ duration: 0.25, ease: 'easeInOut' }}
                  className="text-[10px] font-extrabold whitespace-nowrap overflow-hidden flex-shrink-0"
                  style={{ color: 'var(--text-primary)' }}
                >
                  {dateStr}
                </motion.span>
              )}
            </AnimatePresence>
          </motion.button>
        </div>

        {/* Notifications */}
        <div className="relative">
          <motion.button
            ref={triggerRef}
            whileTap={{ scale: 0.9 }}
            onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
            className="relative p-2 rounded-xl transition-colors hover:bg-white/5"
            style={{ 
              background: 'var(--bg-secondary)', 
              border: isNotificationsOpen ? '1px solid var(--text-primary)' : '1px solid var(--border)' 
            }}
          >
            <Bell className="w-4 h-4" style={{ color: isNotificationsOpen ? 'var(--text-primary)' : 'var(--text-secondary)' }} />
            {unreadCount > 0 && (
              <span 
                className="absolute -top-1.5 -right-1.5 px-1.5 py-0.5 min-w-[18px] h-[18px] rounded-full text-[9px] font-black text-white bg-red-500 shadow-md flex items-center justify-center animate-pulse"
              >
                {unreadCount}
              </span>
            )}
          </motion.button>
          
          <NotificationCenter 
            isOpen={isNotificationsOpen} 
            onClose={() => setIsNotificationsOpen(false)} 
            triggerRef={triggerRef}
          />
        </div>

        {/* Theme toggle */}
        <motion.button
          whileTap={{ scale: 0.9 }}
          onClick={toggleTheme}
          className="p-2 rounded-xl transition-colors"
          style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border)' }}
        >
          {theme === 'dark' ? (
            <Sun className="w-4 h-4" style={{ color: 'var(--text-secondary)' }} />
          ) : (
            <Moon className="w-4 h-4" style={{ color: 'var(--text-secondary)' }} />
          )}
        </motion.button>
      </div>

      {/* Discipline level roadmap modal overlay */}
      <LevelRoadmapModal 
        isOpen={isRoadmapOpen} 
        onClose={() => setIsRoadmapOpen(false)} 
      />
    </header>
  );
}
