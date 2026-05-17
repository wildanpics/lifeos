// Focus Mode Types
export type FocusSessionStatus = 'idle' | 'running' | 'paused' | 'completed';

export interface FocusSession {
  id: string;
  userId: string;
  date: string;
  startTime: Date;
  endTime?: Date;
  plannedDuration: number; // minutes
  actualDuration?: number; // minutes
  status: FocusSessionStatus;
  task?: string;
  xpEarned: number;
}

export interface FocusStats {
  totalMinutesToday: number;
  totalSessionsToday: number;
  totalMinutesWeek: number;
  longestSession: number;
}
