'use client';

import { useState, useEffect, useCallback } from 'react';
import { DailyPrayerSchedule, PrayerAlert, PrayerAlertLevel } from '@/types/prayer';
import { getToday, minutesUntil } from '@/lib/utils/time';

const CITY_ID = process.env.NEXT_PUBLIC_PRAYER_CITY_ID || '29';

export const usePrayer = () => {
  const [schedule, setSchedule] = useState<DailyPrayerSchedule | null>(null);
  const [nextPrayer, setNextPrayer] = useState<{ name: string; time: string } | null>(null);
  const [alert, setAlert] = useState<PrayerAlert | null>(null);
  const [countdown, setCountdown] = useState<number>(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchPrayerTimes = useCallback(async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/prayer?cityId=${CITY_ID}`);
      if (!response.ok) throw new Error('Failed to fetch prayer times');
      const data: DailyPrayerSchedule = await response.json();
      setSchedule(data);
    } catch (err) {
      setError('Could not load prayer times');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  const updateNextPrayer = useCallback(() => {
    if (!schedule) return;

    const prayers = [
      { name: 'Fajr', nameId: 'Subuh', time: schedule.prayers.fajr },
      { name: 'Dhuhr', nameId: 'Dzuhur', time: schedule.prayers.dhuhr },
      { name: 'Asr', nameId: 'Ashar', time: schedule.prayers.asr },
      { name: 'Maghrib', nameId: 'Maghrib', time: schedule.prayers.maghrib },
      { name: 'Isya', nameId: 'Isya', time: schedule.prayers.isya },
    ];

    let next = null;
    for (const prayer of prayers) {
      const mins = minutesUntil(prayer.time);
      if (mins > 0) {
        next = { name: prayer.nameId, time: prayer.time };
        setCountdown(mins);

        let level: PrayerAlertLevel = 'info';
        if (mins <= 15) level = 'urgent';
        else if (mins <= 30) level = 'warning';
        else if (mins <= 120) level = 'info';

        setAlert({ prayer: prayer.nameId, level, minutesUntil: mins });
        break;
      }
    }

    if (!next) {
      // All prayers done for today
      setNextPrayer({ name: 'Subuh', time: schedule.prayers.fajr });
      setAlert(null);
    } else {
      setNextPrayer(next);
    }
  }, [schedule]);

  useEffect(() => {
    fetchPrayerTimes();
  }, [fetchPrayerTimes]);

  useEffect(() => {
    if (!schedule) return;
    updateNextPrayer();
    const interval = setInterval(updateNextPrayer, 30000); // Update every 30s
    return () => clearInterval(interval);
  }, [schedule, updateNextPrayer]);

  return { schedule, nextPrayer, alert, countdown, loading, error };
};
