// Sleep scoring utility

export interface SleepScore {
  score: number; // 0-100
  quality: 'Excellent' | 'Good' | 'Fair' | 'Poor';
  qualityId: string;
  color: string;
  bonus: boolean;
  message: string;
}

export const calculateSleepScore = (
  bedtime: string | undefined,
  wakeTime: string | undefined,
  hours: number
): SleepScore => {
  let score = 0;

  // Duration scoring
  if (hours >= 7 && hours <= 8.5) {
    score += 60; // Optimal
  } else if (hours >= 6 && hours < 7) {
    score += 40;
  } else if (hours > 8.5 && hours <= 9.5) {
    score += 45;
  } else if (hours >= 5 && hours < 6) {
    score += 20;
  } else {
    score += 10;
  }

  // Bedtime bonus: sleep before 23:00
  let bonus = false;
  if (bedtime) {
    const [bh] = bedtime.split(':').map(Number);
    if (bh < 23 || (bh === 22)) {
      score += 40;
      bonus = true;
    } else if (bh === 23) {
      score += 20;
    }
  }

  score = Math.min(100, score);

  let quality: SleepScore['quality'];
  let qualityId: string;
  let color: string;
  let message: string;

  if (score >= 85) {
    quality = 'Excellent';
    qualityId = 'Sangat Baik';
    color = '#10B981';
    message = 'Perfect sleep! You\'re fully recharged. 🌟';
  } else if (score >= 65) {
    quality = 'Good';
    qualityId = 'Baik';
    color = '#3B82F6';
    message = 'Good rest. Try to sleep a bit earlier tonight.';
  } else if (score >= 40) {
    quality = 'Fair';
    qualityId = 'Cukup';
    color = '#F59E0B';
    message = 'Average sleep. Aim for 7–8h and sleep before 23:00.';
  } else {
    quality = 'Poor';
    qualityId = 'Buruk';
    color = '#EF4444';
    message = 'Poor sleep detected. Rest is critical for discipline.';
  }

  return { score, quality, qualityId, color, bonus, message };
};
