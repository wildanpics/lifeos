import { DailyStats } from '@/types/user';

export type DopamineStatus = 'clean' | 'distracted' | 'overstimulated';

export interface DopamineAnalysis {
  status: DopamineStatus;
  score: number; // 0-100, higher = cleaner
  message: string;
  messageId: string;
  recommendation: string;
  recommendationId: string;
}

export const analyzeDopamine = (stats: Partial<DailyStats>): DopamineAnalysis => {
  let score = 100;

  // Deduct for high screen time
  const screenTime = stats.screenTimeMinutes || 0;
  if (screenTime > 360) score -= 40; // 6+ hours
  else if (screenTime > 240) score -= 25; // 4+ hours
  else if (screenTime > 120) score -= 10; // 2+ hours

  // Deduct for bad sleep
  const sleep = stats.sleepHours || 7;
  if (sleep < 5) score -= 30;
  else if (sleep < 6) score -= 15;
  else if (sleep < 7) score -= 5;

  // Deduct for missed habits
  const habitsCompleted = stats.completedHabits?.length || 0;
  if (habitsCompleted === 0) score -= 20;
  else if (habitsCompleted < 3) score -= 10;

  // Bonus for focus time
  const focusMin = stats.focusMinutes || 0;
  if (focusMin >= 60) score += 10;
  if (focusMin >= 120) score += 5;

  score = Math.max(0, Math.min(100, score));

  if (score >= 70) {
    return {
      status: 'clean',
      score,
      message: 'Dopamine Clean',
      messageId: 'Dopamin Bersih',
      recommendation: 'Keep it up! Your mind is clear.',
      recommendationId: 'Pertahankan! Pikiran kamu jernih.',
    };
  } else if (score >= 40) {
    return {
      status: 'distracted',
      score,
      message: 'Slightly Distracted',
      messageId: 'Sedikit Terganggu',
      recommendation: 'Reduce screen time. Try a 25-min focus session.',
      recommendationId: 'Kurangi layar. Coba sesi fokus 25 menit.',
    };
  } else {
    return {
      status: 'overstimulated',
      score,
      message: 'Overstimulated!',
      messageId: 'Kelebihan Stimulasi!',
      recommendation: 'Put your phone down. Breathe. Start with 1 task.',
      recommendationId: 'Letakkan HP. Tarik napas. Mulai 1 tugas.',
    };
  }
};

export const getDopamineColor = (status: DopamineStatus): string => {
  switch (status) {
    case 'clean': return '#10B981';
    case 'distracted': return '#F59E0B';
    case 'overstimulated': return '#EF4444';
  }
};
