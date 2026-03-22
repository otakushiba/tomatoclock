import { useEffect } from "react";
import { useTimerStore } from "@/stores/timerStore";
import { playFocusComplete, playBreakComplete } from "@/lib/sounds";

export function useSoundPlayer() {
  useEffect(() => {
    const unsubscribe = useTimerStore.subscribe((state, prevState) => {
      if (!state.settings.soundEnabled) return;
      if (state.mode === prevState.mode) return;

      if (prevState.mode === "focus") {
        // focus → break: focus session ended
        playFocusComplete();
      } else {
        // break → focus: break ended
        playBreakComplete();
      }
    });

    return unsubscribe;
  }, []);
}
