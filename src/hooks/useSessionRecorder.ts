import { useEffect } from "react";
import { useTimerStore } from "@/stores/timerStore";
import { useTaskStore } from "@/stores/taskStore";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/lib/supabase";

function getActiveInfo() {
  const { activeTaskId, activeTaskName, activeProjectId } = useTaskStore.getState();
  return { taskId: activeTaskId, taskName: activeTaskName, projectId: activeProjectId };
}

export function useSessionRecorder() {
  const { user } = useAuth();

  useEffect(() => {
    const unsubscribe = useTimerStore.subscribe((state, prevState) => {
      if (!user) return;

      // Only record focus sessions (breaks are not pomodoros)
      if (state.pendingRecordSession && !prevState.pendingRecordSession) {
        const { startedAt, endedAt, durationMin, mode, status } = state.pendingRecordSession;
        if (mode !== 'focus') {
          useTimerStore.getState().clearPendingRecordSession();
          return;
        }
        const { taskId, taskName, projectId } = getActiveInfo();
        supabase.from("pomodoro_sessions").insert({
          user_id: user.id,
          task_name: mode === 'focus' ? taskName : null,
          task_id: mode === 'focus' ? taskId : null,
          project_id: mode === 'focus' ? projectId : null,
          started_at: startedAt,
          ended_at: endedAt,
          duration_min: durationMin,
          status,
        }).then(({ error }) => {
          if (error) console.error("[SessionRecorder] insert error:", error.message, error.code);
        });
        useTimerStore.getState().clearPendingRecordSession();
      }
    });

    return unsubscribe;
  }, [user]);
}
