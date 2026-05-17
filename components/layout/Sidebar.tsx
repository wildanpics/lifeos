'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion } from 'framer-motion';
import {
  LayoutDashboard,
  Timer,
  CheckSquare,
  BarChart3,
  User,
  Zap,
  Moon,
  Sun,
} from 'lucide-react';
import { useAppStore } from '@/store/useAppStore';
import { getLevelFromXP, getProgressToNextLevel } from '@/lib/constants/levels';

const navItems = [
  { href: '/dashboard', icon: LayoutDashboard, label: 'Beranda' },
  { href: '/focus', icon: Timer, label: 'Fokus' },
  { href: '/habits', icon: CheckSquare, label: 'Kebiasaan' },
  { href: '/analytics', icon: BarChart3, label: 'Analitik' },
  { href: '/profile', icon: User, label: 'Profil' },
];

export function Sidebar() {
  const pathname = usePathname();
  const { theme, toggleTheme, totalXP, user } = useAppStore();
  const level = getLevelFromXP(totalXP);
  const progress = getProgressToNextLevel(totalXP);

  return (
    <aside
      className="hidden lg:flex"
      style={{
        position: 'fixed',
        left: 0,
        top: 0,
        height: '100%',
        width: '256px',
        zIndex: 40,
        flexDirection: 'column',
        background: 'var(--bg-card)',
        borderRight: '1px solid var(--border)',
        overflowY: 'auto',
      }}
    >
      {/* Logo */}
      <div style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid var(--border)', flexShrink: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div style={{
            width: '36px',
            height: '36px',
            borderRadius: '10px',
            background: 'linear-gradient(135deg, #6366F1, #8B5CF6)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
            boxShadow: '0 0 15px rgba(99, 102, 241, 0.4)',
          }}>
            <Zap style={{ width: '18px', height: '18px', color: 'white' }} />
          </div>
          <div>
            <h1 style={{ fontSize: '0.875rem', fontWeight: 700, color: 'var(--text-primary)', lineHeight: 1.2 }}>
              LIFE <span style={{ color: '#8B5CF6' }}>OS</span>
            </h1>
            <p style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: '1px' }}>
              Discipline Engine
            </p>
          </div>
        </div>
      </div>

      {/* User Info + XP */}
      <div style={{ padding: '1rem 1.25rem', borderBottom: '1px solid var(--border)', flexShrink: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.75rem' }}>
          <div style={{
            width: '36px',
            height: '36px',
            borderRadius: '10px',
            overflow: 'hidden',
            background: 'linear-gradient(135deg, #6366F1, #8B5CF6)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
          }}>
            {user?.photoURL ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={user.photoURL} alt="Avatar" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            ) : (
              <span style={{ color: 'white', fontSize: '0.875rem', fontWeight: 700 }}>
                {user?.displayName?.charAt(0)?.toUpperCase() || 'U'}
              </span>
            )}
          </div>
          <div style={{ minWidth: 0, flex: 1 }}>
            <p style={{
              fontSize: '0.8125rem',
              fontWeight: 600,
              color: 'var(--text-primary)',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
            }}>
              {user?.displayName || 'Life OS User'}
            </p>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', marginTop: '2px' }}>
              <span style={{ fontSize: '0.7rem', color: level.color, fontWeight: 600 }}>
                {level.emoji} Lv.{level.level}
              </span>
              <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                {level.titleId}
              </span>
            </div>
          </div>
        </div>

        {/* XP Bar */}
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
            <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>{totalXP.toLocaleString()} XP</span>
            <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>{progress}%</span>
          </div>
          <div style={{ background: 'var(--border)', borderRadius: '999px', height: '6px', overflow: 'hidden' }}>
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.8, ease: 'easeOut' }}
              style={{
                height: '100%',
                borderRadius: '999px',
                background: 'linear-gradient(135deg, #6366F1, #8B5CF6)',
              }}
            />
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav style={{ flex: 1, padding: '0.75rem', overflowY: 'auto' }}>
        <p style={{
          fontSize: '0.65rem',
          fontWeight: 700,
          textTransform: 'uppercase',
          letterSpacing: '0.1em',
          color: 'var(--text-muted)',
          padding: '0 0.5rem',
          marginBottom: '0.5rem',
        }}>
          Menu
        </p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
          {navItems.map((item) => {
            const active = pathname === item.href || pathname.startsWith(item.href + '/');
            return (
              <Link key={item.href} href={item.href} style={{ textDecoration: 'none' }}>
                <motion.div
                  whileHover={{ x: 3 }}
                  whileTap={{ scale: 0.97 }}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.75rem',
                    padding: '0.625rem 0.75rem',
                    borderRadius: '10px',
                    cursor: 'pointer',
                    background: active ? 'linear-gradient(135deg, #6366F1, #8B5CF6)' : 'transparent',
                    transition: 'background 0.15s ease',
                  }}
                  onMouseEnter={(e) => {
                    if (!active) (e.currentTarget as HTMLElement).style.background = 'var(--bg-card-hover)';
                  }}
                  onMouseLeave={(e) => {
                    if (!active) (e.currentTarget as HTMLElement).style.background = 'transparent';
                  }}
                >
                  <item.icon style={{
                    width: '16px',
                    height: '16px',
                    color: active ? 'white' : 'var(--text-secondary)',
                    flexShrink: 0,
                  }} />
                  <span style={{
                    fontSize: '0.875rem',
                    fontWeight: active ? 600 : 500,
                    color: active ? 'white' : 'var(--text-primary)',
                  }}>
                    {item.label}
                  </span>
                  {active && (
                    <div style={{
                      marginLeft: 'auto',
                      width: '6px',
                      height: '6px',
                      borderRadius: '50%',
                      background: 'white',
                      opacity: 0.8,
                    }} />
                  )}
                </motion.div>
              </Link>
            );
          })}
        </div>
      </nav>

      {/* Theme Toggle */}
      <div style={{ padding: '1rem', borderTop: '1px solid var(--border)', flexShrink: 0 }}>
        <button
          onClick={toggleTheme}
          style={{
            width: '100%',
            display: 'flex',
            alignItems: 'center',
            gap: '0.75rem',
            padding: '0.625rem 0.75rem',
            borderRadius: '10px',
            background: 'var(--bg-card-hover)',
            border: 'none',
            cursor: 'pointer',
            color: 'var(--text-secondary)',
            transition: 'background 0.15s ease',
          }}
        >
          {theme === 'dark' ? (
            <>
              <Sun style={{ width: '16px', height: '16px' }} />
              <span style={{ fontSize: '0.875rem', fontWeight: 500 }}>Light Mode</span>
            </>
          ) : (
            <>
              <Moon style={{ width: '16px', height: '16px' }} />
              <span style={{ fontSize: '0.875rem', fontWeight: 500 }}>Dark Mode</span>
            </>
          )}
        </button>
      </div>
    </aside>
  );
}
