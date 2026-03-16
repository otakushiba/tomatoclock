import { useEffect, useRef } from "react";
import { useTimerStore } from "@/stores/timerStore";
import { useTaskStore } from "@/stores/taskStore";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/lib/supabase";

export function useSessionRecorder() {
  const { user } = useAuth();
  const prevCompletedRef = useRef<number | null>(null);

  useEffect(() => {
    const unsubscribe = useTimerStore.subscribe((state, prevState) => {
      // focus 完成時 completedPomodoros 會增加
      if (state.completedPomodoros <= prevState.completedPomodoros) return;
      if (!user) return;

      const tasks = useTaskStore.getState().tasks;
      const activeTaskId = useTaskStore.getState().activeTaskId;
      const activeTask = tasks.find((t) => t.id === activeTaskId);

      const endedAt = new Date().toISOString();
      // sessionStartedAt 在 completeSession 前被記錄，完成後被清除
      // 所以從 prevState 取
      const startedAt = prevState.sessionStartedAt ?? endedAt;
      const durationMin = prevState.settings.focusMinutes;

      supabase.from("pomodoro_sessions").insert({
        user_id: user.id,
        task_name: activeTask?.title ?? null,
        started_at: startedAt,
        ended_at: endedAt,
        duration_min: durationMin,
        status: "completed",
      });
    });

    return unsubscribe;
  }, [user]);

  // 初始化 ref（避免第一次訂閱就誤判）
  useEffect(() => {
    prevCompletedRef.current = useTimerStore.getState().completedPomodoros;
  }, []);
}
