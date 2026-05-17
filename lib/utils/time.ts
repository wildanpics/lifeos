// Time utilities
export const getToday = (): string => {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
};

export const getCurrentHour = (): number => new Date().getHours();

export const getCurrentMinute = (): number => new Date().getMinutes();

export const getTimeString = (): string => {
  const now = new Date();
  return `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
};

export const parseTimeToDate = (timeStr: string, referenceDate?: Date): Date => {
  const [hours, minutes] = timeStr.split(':').map(Number);
  const date = referenceDate ? new Date(referenceDate) : new Date();
  date.setHours(hours, minutes, 0, 0);
  return date;
};

export const minutesUntil = (timeStr: string): number => {
  const target = parseTimeToDate(timeStr);
  const now = new Date();
  const diff = target.getTime() - now.getTime();
  return Math.round(diff / 60000);
};

export const getGreeting = (): { greeting: string; greetingId: string; emoji: string } => {
  const hour = getCurrentHour();
  if (hour >= 4 && hour < 12) {
    return { greeting: 'Good Morning', greetingId: 'Selamat Pagi', emoji: '🌅' };
  } else if (hour >= 12 && hour < 17) {
    return { greeting: 'Good Afternoon', greetingId: 'Selamat Siang', emoji: '☀️' };
  } else if (hour >= 17 && hour < 20) {
    return { greeting: 'Good Evening', greetingId: 'Selamat Sore', emoji: '🌆' };
  } else {
    return { greeting: 'Good Night', greetingId: 'Selamat Malam', emoji: '🌙' };
  }
};

export const formatDuration = (minutes: number): string => {
  if (minutes < 60) return `${minutes}m`;
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return m === 0 ? `${h}h` : `${h}h ${m}m`;
};

export const isAfterTime = (timeStr: string): boolean => {
  return minutesUntil(timeStr) < 0;
};

export const formatCountdown = (totalMinutes: number): string => {
  if (totalMinutes <= 0) return 'Now';
  const h = Math.floor(totalMinutes / 60);
  const m = totalMinutes % 60;
  if (h > 0) return `${h}h ${m}m`;
  return `${m}m`;
};

export const formatTime = (totalSeconds: number): string => {
  const m = Math.floor(totalSeconds / 60);
  const s = totalSeconds % 60;
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
};
