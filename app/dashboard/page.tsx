'use client';

import { motion } from 'framer-motion';
import { HeroCard } from '@/components/dashboard/HeroCard';
import { DailyRules } from '@/components/dashboard/DailyRules';
import { QuickStats } from '@/components/dashboard/QuickStats';
import { DopamineStatus } from '@/components/dashboard/DopamineStatus';
import { PrayerList } from '@/components/prayer/PrayerList';
import { BreakTheLoop } from '@/components/dashboard/BreakTheLoop';
import { FocusList } from '@/components/dashboard/FocusList';
import { PomodoroWidget } from '@/components/dashboard/PomodoroWidget';
import { QuoteFooter } from '@/components/dashboard/QuoteFooter';
import { EmergencyPanel } from '@/components/dashboard/EmergencyPanel';
import { DailyQuestsWidget } from '@/components/dashboard/DailyQuestsWidget';
import { OnboardingTutorial } from '@/components/dashboard/OnboardingTutorial';

export default function DashboardPage() {
  return (
    <div className="flex flex-col gap-6 pb-24 lg:pb-8">
      {/* Onboarding Tutorial Guide for New Users */}
      <OnboardingTutorial />

      {/* Emergency Panel (conditional) */}
      <EmergencyPanel />

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
        {/* Left Column (Main Content) */}
        <div className="xl:col-span-8 2xl:col-span-9 flex flex-col gap-6">
          <HeroCard />
          <DailyRules />
          
          <div>
            <h2 className="text-sm font-semibold mb-3" style={{ color: 'var(--text-secondary)' }}>
              Statistik Cepat
            </h2>
            <QuickStats />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-3">
              <BreakTheLoop />
            </div>
            <div className="lg:col-span-1">
              <FocusList />
            </div>
            <div className="lg:col-span-2">
              <PomodoroWidget />
            </div>
          </div>
        </div>

        {/* Right Column (Sidebar-ish) */}
        <div className="xl:col-span-4 2xl:col-span-3 flex flex-col gap-6">
          <DailyQuestsWidget />
          <DopamineStatus />
          <PrayerList />
        </div>
      </div>

      <QuoteFooter />
    </div>
  );
}
