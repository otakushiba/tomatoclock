// Web Audio API sound generator — no external files required

function createContext(): AudioContext | null {
  try {
    return new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
  } catch {
    return null;
  }
}

function tone(
  ctx: AudioContext,
  freq: number,
  startTime: number,
  duration: number,
  type: OscillatorType = "sine",
  gain = 0.28
) {
  const osc = ctx.createOscillator();
  const gainNode = ctx.createGain();
  osc.connect(gainNode);
  gainNode.connect(ctx.destination);
  osc.type = type;
  osc.frequency.setValueAtTime(freq, startTime);
  gainNode.gain.setValueAtTime(0, startTime);
  gainNode.gain.linearRampToValueAtTime(gain, startTime + 0.01);
  gainNode.gain.exponentialRampToValueAtTime(0.001, startTime + duration);
  osc.start(startTime);
  osc.stop(startTime + duration + 0.05);
}

/** Three ascending tones — played when a focus session ends. */
export function playFocusComplete() {
  const ctx = createContext();
  if (!ctx) return;
  const t = ctx.currentTime;
  tone(ctx, 523.25, t, 0.45);        // C5
  tone(ctx, 659.25, t + 0.18, 0.45); // E5
  tone(ctx, 783.99, t + 0.36, 0.7);  // G5
}

/** Two descending tones — played when a break ends. */
export function playBreakComplete() {
  const ctx = createContext();
  if (!ctx) return;
  const t = ctx.currentTime;
  tone(ctx, 783.99, t, 0.45);        // G5
  tone(ctx, 523.25, t + 0.22, 0.65); // C5
}
