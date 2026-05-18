'use client';

import { useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAppStore } from '@/store/useAppStore';
import { AppNotification, NotificationType } from '@/types/notification';
import { 
  Trophy, Clock, Flame, Lock, Target, Activity, Check, 
  Trash2, X, BellOff, Sunrise, MessageSquareCode
} from 'lucide-react';

interface NotificationCenterProps {
  isOpen: boolean;
  onClose: () => void;
  triggerRef?: React.RefObject<HTMLButtonElement | null>;
}

export function NotificationCenter({ isOpen, onClose, triggerRef }: NotificationCenterProps) {
  const dropdownRef = useRef<HTMLDivElement>(null);
  const { 
    notifications = [], 
    markAllAsRead, 
    clearAllNotifications, 
    removeNotification 
  } = useAppStore();

  const unreadCount = notifications.filter(n => !n.read).length;

  // Handle click outside to close
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      // If clicking the trigger button, ignore and let the button's toggle logic handle it
      if (triggerRef?.current && triggerRef.current.contains(event.target as Node)) {
        return;
      }

      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        onClose();
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, onClose, triggerRef]);

  // Map notification type to Lucide icons & color schemes
  const getIconAndStyle = (type: NotificationType) => {
    switch (type) {
      case 'achievement':
        return {
          icon: Trophy,
          color: '#EAB308', // gold/yellow
          bg: 'rgba(234, 179, 8, 0.15)',
          border: 'rgba(234, 179, 8, 0.3)'
        };
      case 'prayer':
        return {
          icon: Clock,
          color: '#06B6D4', // cyan
          bg: 'rgba(6, 182, 212, 0.15)',
          border: 'rgba(6, 182, 212, 0.3)'
        };
      case 'streak':
        return {
          icon: Flame,
          color: '#F97316', // orange
          bg: 'rgba(249, 115, 22, 0.15)',
          border: 'rgba(249, 115, 22, 0.3)'
        };
      case 'lock':
        return {
          icon: Lock,
          color: '#A855F7', // purple
          bg: 'rgba(168, 85, 247, 0.15)',
          border: 'rgba(168, 85, 247, 0.3)'
        };
      case 'focus':
        return {
          icon: Target,
          color: '#10B981', // green/emerald
          bg: 'rgba(16, 185, 129, 0.15)',
          border: 'rgba(16, 185, 129, 0.3)'
        };
      default:
        return {
          icon: Activity,
          color: '#6366F1', // indigo
          bg: 'rgba(99, 102, 241, 0.15)',
          border: 'rgba(99, 102, 241, 0.3)'
        };
    }
  };

  // Humanize timestamps in Indonesian
  const formatTime = (isoString: string) => {
    const date = new Date(isoString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);

    if (diffMins < 1) return 'Baru saja';
    if (diffMins < 60) return `${diffMins} menit lalu`;
    if (diffHours < 24) return `${diffHours} jam lalu`;
    return date.toLocaleDateString('id-ID', { day: 'numeric', month: 'short' });
  };

  // Indonesian inspiring empty state quotes
  const emptyQuotes = [
    "Hening & tenang. Seluruh tugas berada dalam genggamanmu. 🌸",
    "Hari baru, fokus baru. Lakukan yang terbaik hari ini! 🚀",
    "Semua rencana berjalan lancar. Tetap konsisten & disiplin! 💎",
    "Tidak ada gangguan di udara. Saatnya fokus dan deep work! 🧠"
  ];

  // Get a stable quote based on the current day to avoid flash on render
  const getEmptyQuote = () => {
    const day = new Date().getDay();
    return emptyQuotes[day % emptyQuotes.length];
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          ref={dropdownRef}
          initial={{ opacity: 0, y: 15, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 10, scale: 0.95 }}
          transition={{ duration: 0.2, ease: 'easeOut' }}
          className="fixed md:absolute left-4 right-4 md:left-auto md:right-0 top-16 md:top-auto md:mt-3 w-auto md:w-[400px] rounded-2xl overflow-hidden z-50"
          style={{
            background: 'var(--bg-secondary)',
            backdropFilter: 'blur(16px)',
            WebkitBackdropFilter: 'blur(16px)',
            border: '1px solid var(--border)',
            boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.5), 0 8px 10px -6px rgba(0, 0, 0, 0.5), 0 0 15px rgba(99, 102, 241, 0.07)'
          }}
        >
          {/* Header */}
          <div 
            className="flex items-center justify-between px-4 py-3"
            style={{ borderBottom: '1px solid var(--border)', background: 'rgba(255,255,255,0.01)' }}
          >
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>
                Notifikasi
              </h3>
              {unreadCount > 0 && (
                <span 
                  className="px-2 py-0.5 rounded-full text-[10px] font-bold text-white bg-indigo-600 shadow-[0_0_8px_rgba(99,102,241,0.5)] animate-pulse"
                >
                  {unreadCount} Baru
                </span>
              )}
            </div>

            {notifications.length > 0 && (
              <div className="flex items-center gap-3">
                <button
                  onClick={markAllAsRead}
                  className="text-xs flex items-center gap-1 transition-colors hover:text-indigo-400"
                  style={{ color: 'var(--text-muted)' }}
                  title="Tandai semua dibaca"
                >
                  <Check className="w-3.5 h-3.5" />
                  <span>Semua Dibaca</span>
                </button>
                <button
                  onClick={clearAllNotifications}
                  className="text-xs flex items-center gap-1 transition-colors hover:text-red-400"
                  style={{ color: 'var(--text-muted)' }}
                  title="Hapus semua"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Hapus</span>
                </button>
              </div>
            )}
          </div>

          {/* List Area */}
          <div className="max-h-[380px] overflow-y-auto custom-scrollbar">
            <AnimatePresence initial={false}>
              {notifications.length === 0 ? (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex flex-col items-center justify-center py-10 px-6 text-center"
                >
                  <div 
                    className="w-12 h-12 rounded-full flex items-center justify-center mb-3"
                    style={{ background: 'var(--bg-tertiary)', border: '1px solid var(--border)' }}
                  >
                    <BellOff className="w-5 h-5" style={{ color: 'var(--text-muted)' }} />
                  </div>
                  <p className="text-xs font-medium max-w-[250px]" style={{ color: 'var(--text-secondary)' }}>
                    {getEmptyQuote()}
                  </p>
                </motion.div>
              ) : (
                notifications.map((n) => {
                  const styleMeta = getIconAndStyle(n.type);
                  const Icon = styleMeta.icon;

                  return (
                    <motion.div
                      key={n.id}
                      initial={{ opacity: 0, height: 0, x: -10 }}
                      animate={{ opacity: 1, height: 'auto', x: 0 }}
                      exit={{ opacity: 0, height: 0, x: 20 }}
                      transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                      className={`relative group flex gap-3 p-4 transition-all duration-200 ${
                        !n.read ? 'bg-indigo-500/5' : 'hover:bg-white/5'
                      }`}
                      style={{ borderBottom: '1px solid var(--border)' }}
                    >
                      {/* Left color bar indicator for unread */}
                      {!n.read && (
                        <div 
                          className="absolute left-0 top-0 bottom-0 w-[3px]"
                          style={{ backgroundColor: styleMeta.color }}
                        />
                      )}

                      {/* Icon */}
                      <div 
                        className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
                        style={{ 
                          backgroundColor: styleMeta.bg, 
                          border: `1px solid ${styleMeta.border}`,
                          color: styleMeta.color
                        }}
                      >
                        <Icon className="w-4.5 h-4.5" />
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0 pr-4">
                        <div className="flex items-baseline justify-between mb-0.5">
                          <p className="text-xs font-semibold truncate" style={{ color: 'var(--text-primary)' }}>
                            {n.title}
                          </p>
                          <span className="text-[9px]" style={{ color: 'var(--text-muted)' }}>
                            {formatTime(n.timestamp)}
                          </span>
                        </div>
                        <p className="text-[11px] leading-relaxed break-words" style={{ color: 'var(--text-secondary)' }}>
                          {n.message}
                        </p>
                        {n.xpReward && (
                          <span 
                            className="inline-flex items-center mt-1 px-1.5 py-0.5 rounded text-[8px] font-bold"
                            style={{ 
                              background: 'rgba(234,179,8,0.1)', 
                              color: '#EAB308',
                              border: '1px solid rgba(234,179,8,0.2)' 
                            }}
                          >
                            +{n.xpReward} XP
                          </span>
                        )}
                      </div>

                      {/* Actions (Close/Delete Button) */}
                      <button
                        onClick={() => removeNotification(n.id)}
                        className="opacity-0 group-hover:opacity-100 transition-opacity absolute right-3 top-4 p-1 rounded hover:bg-white/10"
                        style={{ color: 'var(--text-muted)' }}
                        title="Hapus"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </motion.div>
                  );
                })
              )}
            </AnimatePresence>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
