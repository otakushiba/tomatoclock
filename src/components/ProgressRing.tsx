import { useEffect, useRef, useState, useCallback } from 'react';
import { useTimerStore } from '@/stores/timerStore';
import { useTaskStore } from '@/stores/taskStore';
import { useStatsStore } from '@/stores/statsStore';
import { formatTime, playCompletionSound, MODE_LABELS, ACCENT_COLORS } from '@/lib/timer-utils';

const RING_SIZE = 280;
const STROKE_WIDTH = 10;
const RADIUS = (RING_SIZE - STROKE_WIDTH) / 2;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

const ProgressRing = () => {
  const { mode, secondsLeft, isRunning, settings, start, pause, reset, tick } = useTimerStore();
  const { activeTaskId, incrementPomodoro } = useTaskStore();
  const { addPomodoro } = useStatsStore();
  const [completed, setCompleted] = useState(false);
  const [particles, setParticles] = useState(false);
  const prevMode = useRef(mode);
  const intervalRef = useRef<ReturnType<typeof setInterval>>();

  const totalSeconds = mode === 'focus' ? settings.focusMinutes * 60
    : mode === 'shortBreak' ? settings.shortBreakMinutes * 60
    : settings.longBreakMinutes * 60;

  const progress = 1 - secondsLeft / totalSeconds;
  const offset = CIRCUMFERENCE * (1 - progress);
  const isLastMinute = secondsLeft <= 60 && secondsLeft > 0;
  const accentColor = ACCENT_COLORS[mode];

  const handleComplete = useCallback(() => {
    setCompleted(true);
    setParticles(true);
    if (settings.soundEnabled) playCompletionSound();
    if (mode === 'focus') {
      addPomodoro(settings.focusMinutes);
      if (activeTaskId) incrementPomodoro(activeTaskId);
    }
    setTimeout(() => { setCompleted(false); setParticles(false); }, 600);
  }, [settings, mode, addPomodoro, activeTaskId, incrementPomodoro]);

  useEffect(() => {
    if (isRunning) {
      intervalRef.current = setInterval(() => tick(), 200);
    }
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [isRunning, tick]);

  useEffect(() => {
    if (secondsLeft === 0 && prevMode.current === mode) {
      handleComplete();
    }
  }, [secondsLeft, mode, handleComplete]);

  useEffect(() => {
    prevMode.current = mode;
  }, [mode]);

  // Update browser tab title
  useEffect(() => {
    const emoji = MODE_LABELS[mode].emoji;
    const tabTitle = MODE_LABELS[mode].tabTitle;
    document.title = isRunning || secondsLeft < totalSeconds
      ? `${formatTime(secondsLeft)} ${emoji} ${tabTitle}`
      : `🍅 FocusFlow`;
  }, [secondsLeft, mode, isRunning, totalSeconds]);

  const particleAngles = Array.from({ length: 8 }, (_, i) => (i * 360) / 8);

  return (
    <div className="flex flex-col items-center gap-6">
      <div className={`relative ${completed ? 'timer-complete' : ''}`}>
        <svg width={RING_SIZE} height={RING_SIZE} className="transform -rotate-90">
          {/* Track */}
          <circle
            cx={RING_SIZE / 2}
            cy={RING_SIZE / 2}
            r={RADIUS}
            fill="none"
            stroke="rgba(255,255,255,0.1)"
            strokeWidth={STROKE_WIDTH}
          />
          {/* Progress */}
          <circle
            cx={RING_SIZE / 2}
            cy={RING_SIZE / 2}
            r={RADIUS}
            fill="none"
            stroke={isLastMinute ? '#fff9c4' : accentColor}
            strokeWidth={STROKE_WIDTH}
            strokeLinecap="round"
            strokeDasharray={CIRCUMFERENCE}
            strokeDashoffset={offset}
            style={{ transition: 'stroke-dashoffset 0.9s linear, stroke 1s ease' }}
          />
        </svg>
        {/* Center text */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span
            key={secondsLeft}
            className="text-7xl font-extrabold tracking-tighter animate-fadeSlideUp text-white"
            style={{ letterSpacing: '-2px' }}
          >
            {formatTime(secondsLeft)}
          </span>
          <span className="text-sm mt-1 text-white/50">
            {MODE_LABELS[mode].emoji} {MODE_LABELS[mode].label}
          </span>
        </div>

        {/* Particles */}
        {particles && particleAngles.map((angle, i) => (
          <span
            key={i}
            className="particle"
            style={{
              top: '50%',
              left: '50%',
              background: accentColor,
              animation: `particle-burst 600ms ease-out forwards`,
              transform: `translate(-50%, -50%)`,
            }}
          />
        ))}
      </div>

      <div className="flex gap-3">
        <button
          onClick={isRunning ? pause : start}
          className="btn-pill px-8 py-3 shadow-lg text-white"
          style={{ background: accentColor }}
        >
          {isRunning ? '⏸ Pause' : '▶ Start'}
        </button>
        <button
          onClick={reset}
          className="btn-pill px-6 py-3 bg-white/5 border border-white/15 text-white/60 hover:text-white hover:bg-white/10 text-base"
        >
          ↺ Reset
        </button>
      </div>
    </div>
  );
};

export default ProgressRing;
