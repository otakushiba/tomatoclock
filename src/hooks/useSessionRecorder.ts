import { useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
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
  const queryClient = useQueryClient();

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

        // Clear pending session synchronously so a second completion can't
        // be double-inserted while the async insert is in-flight.
        useTimerStore.getState().clearPendingRecordSession();

        const { taskId, taskName, projectId } = getActiveInfo();
        supabase.from("pomodoro_sessions").insert({
          user_id: user.id,
          task_name: taskName,
          task_id: taskId,
          project_id: projectId,
          started_at: startedAt,
          ended_at: endedAt,
          duration_min: durationMin,
          status,
        }).then(({ error }) => {
          if (error) {
            console.error("[SessionRecorder] insert error:", error.message, error.code, error.details);
            toast.error(`無法儲存番茄紀錄: ${error.message}`, { duration: 8000 });
          } else {
            // Invalidate report cache so the Report page reflects the new
            // session immediately — fixes "count not updating in real-time".
            queryClient.invalidateQueries({ queryKey: ["report"] });
            toast.success("🍅 番茄紀錄已儲存", { duration: 2000 });
          }
        });
      }
    });

    return unsubscribe;
  }, [user, queryClient]);
}
