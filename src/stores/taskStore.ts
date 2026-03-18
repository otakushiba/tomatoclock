import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface TaskState {
  activeTaskId: string | null;
  activeTaskName: string | null;
  activeProjectId: string | null;
  setActiveTask: (id: string | null, name: string | null, projectId: string | null) => void;
}

export const useTaskStore = create<TaskState>()(
  persist(
    (set) => ({
      activeTaskId: null,
      activeTaskName: null,
      activeProjectId: null,
      setActiveTask: (id, name, projectId) =>
        set({ activeTaskId: id, activeTaskName: name, activeProjectId: projectId }),
    }),
    { name: 'pomodoro_active_task' }
  )
);
