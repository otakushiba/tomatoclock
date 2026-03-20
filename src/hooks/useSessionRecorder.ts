import { useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { useTimerStore } from "@/stores/timerStore";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/lib/supabase";

export function useSessionRecorder() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  useEffect(() => {
    const unsubscribe = useTimerStore.subscribe((state, prevState) => {
      if (!user) return;

      if (state.pendingRecordSession && !prevState.pendingRecordSession) {
        const { startedAt, endedAt, durationMin, mode, status, taskId, taskName, projectId } =
          state.pendingRecordSession;

        if (mode !== "focus") {
          useTimerStore.getState().clearPendingRecordSession();
          return;
        }

        // Clear synchronously before async insert to prevent double-inserts
        useTimerStore.getState().clearPendingRecordSession();

        supabase
          .from("pomodoro_sessions")
          .insert({
            user_id: user.id,
            task_name: taskName,
            task_id: taskId,
            project_id: projectId,
            started_at: startedAt,
            ended_at: endedAt,
            duration_min: durationMin,
            status,
          })
          .then(({ error }) => {
            if (error) {
              console.error("[SessionRecorder] insert error:", error.message);
              toast.error(`Failed to save session: ${error.message}`, { duration: 8000 });
            } else {
              queryClient.invalidateQueries({ queryKey: ["report"] });
              toast.success("🍅 Session saved", { duration: 2000 });
            }
          });
      }
    });

    return unsubscribe;
  }, [user, queryClient]);
}
