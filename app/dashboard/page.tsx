'use client';

import { motion } from 'framer-motion';
import { DynamicGreeting } from '@/components/dashboard/DynamicGreeting';
import { ProgressRing } from '@/components/dashboard/ProgressRing';
import { QuickStats } from '@/components/dashboard/QuickStats';
import { DopamineStatus } from '@/components/dashboard/DopamineStatus';
import { EmergencyPanel } from '@/components/dashboard/EmergencyPanel';
import { PrayerCountdown } from '@/components/prayer/PrayerCountdown';
import { XPBar } from '@/components/gamification/XPBar';
import { WaterTracker } from '@/components/hydration/WaterTracker';
import { NightReflection } from '@/components/reflection/NightReflection';

const section = (delay: number) => ({
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { delay, duration: 0.4 },
});

export default function DashboardPage() {
  return (
    <div className="space-y-5">
      {/* Header: Greeting + Progress Ring */}
      <motion.div {...section(0)} className="flex items-start justify-between gap-4">
        <div className="flex-1">
          <DynamicGreeting />
        </div>
        <div className="flex-shrink-0">
          <ProgressRing />
        </div>
      </motion.div>

      {/* XP Bar */}
      <motion.div {...section(0.1)}>
        <XPBar />
      </motion.div>

      {/* Prayer Countdown */}
      <motion.div {...section(0.15)}>
        <PrayerCountdown />
      </motion.div>

      {/* Emergency Panel (conditional) */}
      <EmergencyPanel />

      {/* Dopamine Status */}
      <motion.div {...section(0.2)}>
        <DopamineStatus />
      </motion.div>

      {/* Quick Stats */}
      <motion.div {...section(0.25)}>
        <h2 className="text-sm font-semibold mb-2" style={{ color: 'var(--text-secondary)' }}>
          📊 Stats Hari Ini
        </h2>
        <QuickStats />
      </motion.div>

      {/* Water Tracker */}
      <motion.div {...section(0.3)}>
        <WaterTracker />
      </motion.div>

      {/* Night Reflection (conditional) */}
      <motion.div {...section(0.35)}>
        <NightReflection />
      </motion.div>
    </div>
  );
}
