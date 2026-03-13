import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface DailyStats {
  date: string;
  pomodoros: number;
  focusMinutes: number;
}

interface StatsState {
  history: DailyStats[];
  addPomodoro: (minutes: number) => void;
}

const getToday = () => new Date().toISOString().slice(0, 10);

export const useStatsStore = create<StatsState>()(
  persist(
    (set) => ({
      history: [],
      addPomodoro: (minutes) => set((s) => {
        const today = getToday();
        const existing = s.history.find((d) => d.date === today);
        if (existing) {
          return {
            history: s.history.map((d) =>
              d.date === today
                ? { ...d, pomodoros: d.pomodoros + 1, focusMinutes: d.focusMinutes + minutes }
                : d
            ),
          };
        }
        return {
          history: [...s.history, { date: today, pomodoros: 1, focusMinutes: minutes }],
        };
      }),
    }),
    { name: 'pomodoro_stats' }
  )
);
