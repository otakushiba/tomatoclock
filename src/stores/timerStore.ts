import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type TimerMode = 'focus' | 'shortBreak' | 'longBreak';

export interface Settings {
  focusMinutes: number;
  shortBreakMinutes: number;
  longBreakMinutes: number;
  longBreakInterval: number;
  autoStartNextSession: boolean;
  soundEnabled: boolean;
}

interface TimerState {
  mode: TimerMode;
  secondsLeft: number;
  isRunning: boolean;
  startTimestamp: number | null;
  pausedSecondsLeft: number | null;
  completedPomodoros: number;
  todayPomodoros: number;
  todayDate: string;
  sessionStartedAt: string | null;
  pendingInterruptedSession: { startedAt: string; endedAt: string; durationMin: number } | null;
  settings: Settings;
  setMode: (mode: TimerMode) => void;
  start: () => void;
  pause: () => void;
  reset: () => void;
  tick: () => void;
  completeSession: () => void;
  interruptSession: () => void;
  clearPendingInterruptedSession: () => void;
  updateSettings: (settings: Partial<Settings>) => void;
}

const getToday = () => new Date().toISOString().slice(0, 10);

const getModeSeconds = (mode: TimerMode, settings: Settings) => {
  switch (mode) {
    case 'focus': return settings.focusMinutes * 60;
    case 'shortBreak': return settings.shortBreakMinutes * 60;
    case 'longBreak': return settings.longBreakMinutes * 60;
  }
};

export const useTimerStore = create<TimerState>()(
  persist(
    (set, get) => ({
      mode: 'focus',
      secondsLeft: 25 * 60,
      isRunning: false,
      startTimestamp: null,
      pausedSecondsLeft: null,
      completedPomodoros: 0,
      todayPomodoros: 0,
      todayDate: getToday(),
      sessionStartedAt: null,
      pendingInterruptedSession: null,
      settings: {
        focusMinutes: 25,
        shortBreakMinutes: 5,
        longBreakMinutes: 15,
        longBreakInterval: 4,
        autoStartNextSession: false,
        soundEnabled: true,
      },
      setMode: (mode) => {
        const s = get().settings;
        set({ mode, secondsLeft: getModeSeconds(mode, s), isRunning: false, startTimestamp: null, pausedSecondsLeft: null });
      },
      start: () => {
        const { secondsLeft, mode, sessionStartedAt } = get();
        const newSessionStartedAt = mode === 'focus' && !sessionStartedAt
          ? new Date().toISOString()
          : sessionStartedAt;
        set({ isRunning: true, startTimestamp: Date.now(), pausedSecondsLeft: secondsLeft, sessionStartedAt: newSessionStartedAt });
      },
      pause: () => {
        set({ isRunning: false, startTimestamp: null, pausedSecondsLeft: get().secondsLeft });
      },
      reset: () => {
        const { mode, settings } = get();
        set({ secondsLeft: getModeSeconds(mode, settings), isRunning: false, startTimestamp: null, pausedSecondsLeft: null });
      },
      tick: () => {
        const { isRunning, startTimestamp, pausedSecondsLeft } = get();
        if (!isRunning || !startTimestamp || pausedSecondsLeft === null) return;
        const elapsed = Math.floor((Date.now() - startTimestamp) / 1000);
        const newSeconds = Math.max(0, pausedSecondsLeft - elapsed);
        set({ secondsLeft: newSeconds });
        if (newSeconds <= 0) {
          get().completeSession();
        }
      },
      completeSession: () => {
        const { mode, settings, completedPomodoros, todayDate } = get();
        const today = getToday();
        let newTodayPomodoros = todayDate === today ? get().todayPomodoros : 0;

        if (mode === 'focus') {
          const newCompleted = completedPomodoros + 1;
          newTodayPomodoros += 1;
          const nextMode = newCompleted % settings.longBreakInterval === 0 ? 'longBreak' : 'shortBreak';
          set({
            isRunning: false,
            startTimestamp: null,
            pausedSecondsLeft: null,
            completedPomodoros: newCompleted,
            todayPomodoros: newTodayPomodoros,
            todayDate: today,
            mode: nextMode,
            secondsLeft: getModeSeconds(nextMode, settings),
            sessionStartedAt: null,
          });
          if (settings.autoStartNextSession) {
            setTimeout(() => get().start(), 500);
          }
        } else {
          set({
            isRunning: false,
            startTimestamp: null,
            pausedSecondsLeft: null,
            mode: 'focus',
            secondsLeft: getModeSeconds('focus', settings),
            todayPomodoros: newTodayPomodoros,
            todayDate: today,
          });
          if (settings.autoStartNextSession) {
            setTimeout(() => get().start(), 500);
          }
        }
      },
      interruptSession: () => {
        const { settings, sessionStartedAt, secondsLeft } = get();
        const endedAt = new Date().toISOString();
        const elapsedSeconds = settings.focusMinutes * 60 - secondsLeft;
        const durationMin = Math.max(1, Math.floor(elapsedSeconds / 60));
        const startedAt = sessionStartedAt ?? endedAt;
        set({
          isRunning: false,
          startTimestamp: null,
          pausedSecondsLeft: null,
          sessionStartedAt: null,
          secondsLeft: getModeSeconds('focus', settings),
          pendingInterruptedSession: { startedAt, endedAt, durationMin },
        });
      },
      clearPendingInterruptedSession: () => {
        set({ pendingInterruptedSession: null });
      },
      updateSettings: (partial) => {
        const newSettings = { ...get().settings, ...partial };
        const { mode, isRunning } = get();
        set({ settings: newSettings });
        if (!isRunning) {
          set({ secondsLeft: getModeSeconds(mode, newSettings) });
        }
      },
    }),
    { name: 'pomodoro_timer' }
  )
);
