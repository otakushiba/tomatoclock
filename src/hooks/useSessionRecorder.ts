import { useEffect } from "react";
import { useTimerStore } from "@/stores/timerStore";
import { useTaskStore } from "@/stores/taskStore";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/lib/supabase";

function getActiveTaskName() {
  const { tasks, activeTaskId } = useTaskStore.getState();
  return tasks.find((t) => t.id === activeTaskId)?.title ?? null;
}

export function useSessionRecorder() {
  const { user } = useAuth();

  useEffect(() => {
    const unsubscribe = useTimerStore.subscribe((state, prevState) => {
      if (!user) return;

      // focus 正常完成
      if (state.completedPomodoros > prevState.completedPomodoros) {
        const endedAt = new Date().toISOString();
        const startedAt = prevState.sessionStartedAt ?? endedAt;
        supabase.from("pomodoro_sessions").insert({
          user_id: user.id,
          task_name: getActiveTaskName(),
          started_at: startedAt,
          ended_at: endedAt,
          duration_min: prevState.settings.focusMinutes,
          status: "completed",
        }).then(({ error }) => {
          if (error) console.error("[SessionRecorder] insert error:", error.message, error.code);
        });
        return;
      }

      // 提早結束
      if (state.pendingInterruptedSession && !prevState.pendingInterruptedSession) {
        const { startedAt, endedAt, durationMin } = state.pendingInterruptedSession;
        supabase.from("pomodoro_sessions").insert({
          user_id: user.id,
          task_name: getActiveTaskName(),
          started_at: startedAt,
          ended_at: endedAt,
          duration_min: durationMin,
          status: "completed",
        }).then(({ error }) => {
          if (error) console.error("[SessionRecorder] insert error:", error.message, error.code);
        });
        useTimerStore.getState().clearPendingInterruptedSession();
      }
    });

    return unsubscribe;
  }, [user]);
}
