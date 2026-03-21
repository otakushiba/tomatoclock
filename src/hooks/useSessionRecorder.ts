import { useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { useTimerStore, type PendingRecordSession } from "@/stores/timerStore";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/lib/supabase";

export function useSessionRecorder() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!user) return;

    const saveSession = (session: PendingRecordSession) => {
      if (session.mode !== "focus") return;

      supabase
        .from("pomodoro_sessions")
        .insert({
          user_id: user.id,
          task_name: session.taskName,
          task_id: session.taskId,
          project_id: session.projectId,
          started_at: session.startedAt,
          ended_at: session.endedAt,
          duration_min: session.durationMin,
          status: session.status,
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
    };

    // Handle sessions persisted in localStorage (e.g., app reloaded mid-session or
    // auth was loading when the session completed — the null→non-null subscriber
    // transition never fires for already-rehydrated state, so we check here explicitly).
    const existing = useTimerStore.getState().pendingRecordSession;
    if (existing) {
      useTimerStore.getState().clearPendingRecordSession();
      saveSession(existing);
    }

    const unsubscribe = useTimerStore.subscribe((state, prevState) => {
      if (state.pendingRecordSession && !prevState.pendingRecordSession) {
        const session = state.pendingRecordSession;
        // Clear before async insert to prevent double-inserts on re-render
        useTimerStore.getState().clearPendingRecordSession();
        saveSession(session);
      }
    });

    return unsubscribe;
  }, [user, queryClient]);
}
