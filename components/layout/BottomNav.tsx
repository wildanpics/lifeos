'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion } from 'framer-motion';
import { LayoutDashboard, Timer, CheckSquare, BarChart3, User } from 'lucide-react';
import { cn } from '@/lib/utils';

const navItems = [
  { href: '/dashboard', icon: LayoutDashboard, label: 'Beranda' },
  { href: '/focus', icon: Timer, label: 'Fokus' },
  { href: '/habits', icon: CheckSquare, label: 'Habit' },
  { href: '/analytics', icon: BarChart3, label: 'Analitik' },
  { href: '/profile', icon: User, label: 'Profil' },
];

export function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="bottom-nav lg:hidden">
      <div className="flex items-center justify-around px-2 py-2">
        {navItems.map((item) => {
          const active = pathname === item.href || pathname.startsWith(item.href + '/');
          return (
            <Link key={item.href} href={item.href} className="flex-1">
              <motion.div
                whileTap={{ scale: 0.9 }}
                className="flex flex-col items-center gap-1 py-1.5 px-1 rounded-xl transition-all"
              >
                <div className={cn(
                  'p-2 rounded-xl transition-all',
                  active ? 'gradient-bg' : ''
                )}>
                  <item.icon
                    className="w-5 h-5"
                    style={{ color: active ? 'white' : 'var(--text-muted)' }}
                  />
                </div>
                <span
                  className="text-[10px] font-medium"
                  style={{ color: active ? 'var(--accent)' : 'var(--text-muted)' }}
                >
                  {item.label}
                </span>
              </motion.div>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
