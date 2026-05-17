'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAppStore } from '@/store/useAppStore';
import { AppShell } from '@/components/layout/AppShell';
import { motion } from 'framer-motion';
import { Zap } from 'lucide-react';

export default function ProfileLayout({ children }: { children: React.ReactNode }) {
  const { user, isLoading } = useAppStore();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !user) router.replace('/login');
  }, [user, isLoading, router]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4"
        style={{ background: 'var(--bg-primary)' }}>
        <motion.div
          animate={{ scale: [1, 1.08, 1] }}
          transition={{ duration: 1.5, repeat: Infinity }}
          className="w-14 h-14 rounded-2xl flex items-center justify-center"
          style={{ background: 'linear-gradient(135deg, #6366F1, #8B5CF6)' }}>
          <Zap className="w-7 h-7 text-white" />
        </motion.div>
        <p className="text-sm" style={{ color: 'var(--text-muted)' }}>Memuat LIFE OS...</p>
      </div>
    );
  }

  if (!user) return null;

  return <AppShell>{children}</AppShell>;
}
