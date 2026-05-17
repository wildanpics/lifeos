'use client';

import { motion } from 'framer-motion';
import { useAppStore } from '@/store/useAppStore';
import { getGreeting } from '@/lib/utils/time';

export function DynamicGreeting() {
  const { user } = useAppStore();
  const { greeting, greetingId, emoji } = getGreeting();
  const firstName = user?.displayName?.split(' ')[0] || 'Warrior';

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="mb-1"
    >
      <div className="flex items-center gap-2 mb-1">
        <motion.span
          animate={{ rotate: [0, 10, -5, 10, 0] }}
          transition={{ duration: 1.5, delay: 0.5 }}
          className="text-2xl"
        >
          {emoji}
        </motion.span>
        <p className="text-sm font-medium" style={{ color: 'var(--text-muted)' }}>
          {greetingId}
        </p>
      </div>
      <h1 className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>
        {firstName},{' '}
        <span className="gradient-text">ayo bangkit!</span>
      </h1>
      <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>
        Setiap hari adalah kesempatan baru untuk menjadi lebih baik.
      </p>
    </motion.div>
  );
}
