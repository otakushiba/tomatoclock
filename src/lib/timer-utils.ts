import { TimerMode } from '@/stores/timerStore';

export const GRADIENTS: Record<TimerMode, { from: string; to: string }> = {
  focus: { from: '#f953c6', to: '#b91d73' },
  shortBreak: { from: '#43e97b', to: '#38f9d7' },
  longBreak: { from: '#4facfe', to: '#00f2fe' },
};

export const MODE_LABELS: Record<TimerMode, { emoji: string; label: string }> = {
  focus: { emoji: '🍅', label: '專注' },
  shortBreak: { emoji: '☕', label: '短休' },
  longBreak: { emoji: '🌿', label: '長休' },
};

export const getGradientStyle = (mode: TimerMode) => ({
  background: `linear-gradient(135deg, ${GRADIENTS[mode].from}, ${GRADIENTS[mode].to})`,
  transition: 'background 0.8s ease',
});

export const playCompletionSound = () => {
  try {
    const ctx = new AudioContext();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.frequency.setValueAtTime(800, ctx.currentTime);
    osc.frequency.setValueAtTime(1000, ctx.currentTime + 0.1);
    osc.frequency.setValueAtTime(1200, ctx.currentTime + 0.2);
    gain.gain.setValueAtTime(0.3, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.5);
    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + 0.5);
  } catch (e) {
    // Audio not available
  }
};

export const formatTime = (seconds: number) => {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
};
