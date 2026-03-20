export interface Project {
  id: string;
  owner_id: string;
  name: string;
  color: string;
  description: string | null;
  created_at: string;
}

export interface Task {
  id: string;
  user_id: string;
  project_id: string | null;
  title: string;
  estimated_pomodoros: number;
  actual_pomodoros: number;
  completed: boolean;
  created_at: string;
}
