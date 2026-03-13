import { TimerMode } from '@/stores/timerStore';

export const ACCENT_COLORS: Record<TimerMode, string> = {
  focus: '#f953c6',
  shortBreak: '#43e97b',
  longBreak: '#4facfe',
};

export const MODE_LABELS: Record<TimerMode, { emoji: string; label: string; tabTitle: string }> = {
  focus: { emoji: '🍅', label: 'Focus', tabTitle: 'Focusing' },
  shortBreak: { emoji: '☕', label: 'Short Break', tabTitle: 'Short Break' },
  longBreak: { emoji: '🌿', label: 'Long Break', tabTitle: 'Long Break' },
};

export const getGradientStyle = (_mode: TimerMode) => ({
  background: 'hsl(234 30% 10%)',
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
