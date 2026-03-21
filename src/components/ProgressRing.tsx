import { useEffect, useRef, useState, useCallback } from 'react';
import { useTimerStore } from '@/stores/timerStore';
import { useTaskStore } from '@/stores/taskStore';
import { useStatsStore } from '@/stores/statsStore';
import { useIncrementTaskPomodoro } from '@/hooks/useTasks';
import { formatTime, playCompletionSound, MODE_LABELS, ACCENT_COLORS } from '@/lib/timer-utils';
import { RotateCcw, SkipForward } from 'lucide-react';
import { toast } from 'sonner';

const RING_SIZE = 280;
const STROKE_WIDTH = 10;
const RADIUS = (RING_SIZE - STROKE_WIDTH) / 2;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

const ProgressRing = () => {
  const { mode, secondsLeft, isRunning, sessionStartedAt, settings, start, pause, reset, tick, skipSession } = useTimerStore();
  const { activeTaskId } = useTaskStore();
  const { addPomodoro } = useStatsStore();
  const { mutate: incrementTaskPomodoro } = useIncrementTaskPomodoro();
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
      if (activeTaskId) incrementTaskPomodoro(activeTaskId);
    }
    setTimeout(() => { setCompleted(false); setParticles(false); }, 600);
  }, [settings, mode, addPomodoro, activeTaskId, incrementTaskPomodoro]);

  const handleStart = useCallback(() => {
    if (mode === 'focus' && !activeTaskId) {
      toast.warning('Please select a task before starting the timer.', { duration: 3000 });
      return;
    }
    start();
  }, [mode, activeTaskId, start]);

  const handleSkip = useCallback(() => {
    // Only increment local stats if the session was actually started (not idle skip)
    const { sessionStartedAt } = useTimerStore.getState();
    if (mode === 'focus' && sessionStartedAt) {
      addPomodoro(settings.focusMinutes);
      if (activeTaskId) incrementTaskPomodoro(activeTaskId);
    }
    skipSession();
  }, [mode, settings, activeTaskId, addPomodoro, incrementTaskPomodoro, skipSession]);

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

  const finishAtLabel = (() => {
    const finish = new Date(Date.now() + secondsLeft * 1000);
    const hh = finish.getHours().toString().padStart(2, '0');
    const mm = finish.getMinutes().toString().padStart(2, '0');
    const hrs = (secondsLeft / 3600).toFixed(1);
    return `${hh}:${mm} (${hrs}h)`;
  })();

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

      {/* Finish At */}
      <div className="text-xs text-white/35 tracking-wide">
        Finish At: {finishAtLabel}
      </div>

      <div className="flex items-center gap-3">
        <button
          onClick={reset}
          className="btn-pill p-3 bg-white/5 border border-white/15 text-white/60 hover:text-white hover:bg-white/10"
          title="Reset"
        >
          <RotateCcw size={16} />
        </button>
        <button
          onClick={isRunning ? pause : handleStart}
          className="btn-pill px-8 py-3 shadow-lg text-white"
          style={{ background: accentColor }}
        >
          {isRunning ? '⏸ Pause' : '▶ Start'}
        </button>
        {sessionStartedAt && (
          <button
            onClick={handleSkip}
            className="btn-pill p-3 bg-white/5 border border-white/15 text-white/60 hover:text-white hover:bg-white/10"
            title="Skip"
          >
            <SkipForward size={16} />
          </button>
        )}
      </div>
    </div>
  );
};

export default ProgressRing;
