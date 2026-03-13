import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface Task {
  id: string;
  title: string;
  estimatedPomodoros: number;
  actualPomodoros: number;
  completed: boolean;
  createdAt: string;
}

interface TaskState {
  tasks: Task[];
  activeTaskId: string | null;
  addTask: (title: string, estimated: number) => void;
  removeTask: (id: string) => void;
  toggleComplete: (id: string) => void;
  setActiveTask: (id: string | null) => void;
  incrementPomodoro: (id: string) => void;
}

export const useTaskStore = create<TaskState>()(
  persist(
    (set) => ({
      tasks: [],
      activeTaskId: null,
      addTask: (title, estimated) => set((s) => ({
        tasks: [{
          id: crypto.randomUUID(),
          title,
          estimatedPomodoros: estimated,
          actualPomodoros: 0,
          completed: false,
          createdAt: new Date().toISOString(),
        }, ...s.tasks],
      })),
      removeTask: (id) => set((s) => ({
        tasks: s.tasks.filter((t) => t.id !== id),
        activeTaskId: s.activeTaskId === id ? null : s.activeTaskId,
      })),
      toggleComplete: (id) => set((s) => ({
        tasks: s.tasks.map((t) => t.id === id ? { ...t, completed: !t.completed } : t),
      })),
      setActiveTask: (id) => set({ activeTaskId: id }),
      incrementPomodoro: (id) => set((s) => ({
        tasks: s.tasks.map((t) => t.id === id ? { ...t, actualPomodoros: t.actualPomodoros + 1 } : t),
      })),
    }),
    { name: 'pomodoro_tasks' }
  )
);
