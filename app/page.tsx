'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAppStore } from '@/store/useAppStore';
import { motion } from 'framer-motion';
import { Zap } from 'lucide-react';

export default function HomePage() {
  const router = useRouter();
  const { user, isLoading } = useAppStore();

  useEffect(() => {
    if (!isLoading) {
      if (user) {
        router.replace('/dashboard');
      } else {
        router.replace('/login');
      }
    }
  }, [user, isLoading, router]);

  return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: 'var(--bg-primary)' }}>
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        className="flex flex-col items-center gap-4"
      >
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
          className="w-16 h-16 rounded-2xl gradient-bg flex items-center justify-center glow-accent"
        >
          <Zap className="w-8 h-8 text-white" />
        </motion.div>
        <p className="text-sm font-medium" style={{ color: 'var(--text-muted)' }}>Loading LIFE OS...</p>
      </motion.div>
    </div>
  );
}
