// Prayer Time Types
export interface PrayerTime {
  name: string;
  nameId: string;
  time: string; // HH:mm
  timestamp?: Date;
}

export interface DailyPrayerSchedule {
  date: string;
  cityId: number;
  cityName: string;
  prayers: {
    fajr: string;
    sunrise: string;
    dhuhr: string;
    asr: string;
    maghrib: string;
    isya: string;
  };
}

export type PrayerAlertLevel = 'info' | 'warning' | 'urgent' | 'now';

export interface PrayerAlert {
  prayer: string;
  level: PrayerAlertLevel;
  minutesUntil: number;
}

export type PrayerName = 'fajr' | 'sunrise' | 'dhuhr' | 'asr' | 'maghrib' | 'isya';
