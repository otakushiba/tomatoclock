import { useTimerStore, TimerMode } from '@/stores/timerStore';
import { MODE_LABELS, ACCENT_COLORS } from '@/lib/timer-utils';

const modes: TimerMode[] = ['focus', 'shortBreak', 'longBreak'];

const ModeTabs = () => {
  const { mode, setMode, isRunning } = useTimerStore();

  return (
    <div className="flex gap-2 p-1 glass-sm rounded-pill mx-auto w-fit">
      {modes.map((m) => (
        <button
          key={m}
          onClick={() => !isRunning && setMode(m)}
          disabled={isRunning}
          className={`px-5 py-2 rounded-pill font-bold text-sm transition-all duration-200 ${
            mode === m
              ? 'shadow-md'
              : 'text-white/50 hover:text-white/80 hover:bg-white/5'
          } disabled:opacity-60`}
          style={mode === m ? { background: ACCENT_COLORS[m], color: 'white' } : {}}
        >
          {MODE_LABELS[m].emoji} {MODE_LABELS[m].label}
        </button>
      ))}
    </div>
  );
};

export default ModeTabs;
