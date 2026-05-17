export type NotificationType = 'achievement' | 'prayer' | 'streak' | 'lock' | 'focus' | 'system';

export interface AppNotification {
  id: string;
  title: string;
  message: string;
  timestamp: string;
  type: NotificationType;
  read: boolean;
  xpReward?: number;
}
