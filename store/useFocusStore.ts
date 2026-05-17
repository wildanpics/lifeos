'use client';

import { create } from 'zustand';
import { FocusSession, FocusSessionStatus } from '@/types/focus';

interface FocusStore {
  activeSession: FocusSession | null;
  status: FocusSessionStatus;
  elapsedSeconds: number;
  plannedDuration: number; // minutes
  currentTask: string;

  startSession: (session: FocusSession) => void;
  pauseSession: () => void;
  resumeSession: () => void;
  completeSession: () => void;
  tick: () => void;
  setTask: (task: string) => void;
  setPlannedDuration: (min: number) => void;
  reset: () => void;
}

export const useFocusStore = create<FocusStore>((set, get) => ({
  activeSession: null,
  status: 'idle',
  elapsedSeconds: 0,
  plannedDuration: 25,
  currentTask: '',

  startSession: (session) =>
    set({ activeSession: session, status: 'running', elapsedSeconds: 0 }),

  pauseSession: () => set({ status: 'paused' }),

  resumeSession: () => set({ status: 'running' }),

  completeSession: () =>
    set((s) => ({
      status: 'completed',
      activeSession: s.activeSession
        ? { ...s.activeSession, endTime: new Date(), status: 'completed' }
        : null,
    })),

  tick: () =>
    set((s) => {
      if (s.status !== 'running') return {};
      const newElapsed = s.elapsedSeconds + 1;
      const plannedSeconds = s.plannedDuration * 60;
      if (newElapsed >= plannedSeconds) {
        return { elapsedSeconds: plannedSeconds, status: 'completed' };
      }
      return { elapsedSeconds: newElapsed };
    }),

  setTask: (task) => set({ currentTask: task }),
  setPlannedDuration: (min) => set({ plannedDuration: min }),

  reset: () =>
    set({
      activeSession: null,
      status: 'idle',
      elapsedSeconds: 0,
      currentTask: '',
    }),
}));
