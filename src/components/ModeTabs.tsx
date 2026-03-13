import { useTimerStore, TimerMode } from '@/stores/timerStore';
import { MODE_LABELS } from '@/lib/timer-utils';

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
              ? 'bg-white/90 shadow-md'
              : 'text-white/80 hover:text-white hover:bg-white/10'
          } disabled:opacity-60`}
          style={mode === m ? { color: m === 'focus' ? '#b91d73' : m === 'shortBreak' ? '#2db87a' : '#0086d1' } : {}}
        >
          {MODE_LABELS[m].emoji} {MODE_LABELS[m].label}
        </button>
      ))}
    </div>
  );
};

export default ModeTabs;
