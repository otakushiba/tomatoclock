import { useTimerStore } from '@/stores/timerStore';
import { ACCENT_COLORS } from '@/lib/timer-utils';
import { X } from 'lucide-react';

const SettingsModal = ({ open, onClose }: { open: boolean; onClose: () => void }) => {
  const { settings, updateSettings, mode } = useTimerStore();
  const accentColor = ACCENT_COLORS[mode];

  if (!open) return null;

  const NumberInput = ({ label, value, onChange, min = 1 }: { label: string; value: number; onChange: (v: number) => void; min?: number }) => (
    <div className="flex items-center justify-between">
      <span className="text-sm font-semibold text-white/80">{label}</span>
      <div className="flex items-center gap-2">
        <button onClick={() => onChange(Math.max(min, value - 1))} className="w-8 h-8 rounded-full bg-white/8 text-white/60 font-bold hover:bg-white/15 transition-colors">-</button>
        <span className="w-8 text-center font-bold text-white">{value}</span>
        <button onClick={() => onChange(value + 1)} className="w-8 h-8 rounded-full bg-white/8 text-white/60 font-bold hover:bg-white/15 transition-colors">+</button>
      </div>
    </div>
  );

  const Toggle = ({ label, value, onChange }: { label: string; value: boolean; onChange: (v: boolean) => void }) => (
    <div className="flex items-center justify-between">
      <span className="text-sm font-semibold text-white/80">{label}</span>
      <button
        onClick={() => onChange(!value)}
        className={`w-12 h-7 rounded-full relative transition-all duration-200 ${value ? '' : 'bg-white/15'}`}
        style={value ? { background: `${accentColor}40` } : {}}
      >
        <span
          className="absolute top-1 w-5 h-5 rounded-full transition-all duration-200"
          style={{
            left: value ? '26px' : '4px',
            background: value ? accentColor : 'rgba(255,255,255,0.4)',
          }}
        />
      </button>
    </div>
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="absolute inset-0 bg-black/60 animate-in fade-in duration-200" />
      <div
        className="glass relative z-10 w-full max-w-md p-6 flex flex-col gap-5 animate-in slide-in-from-bottom-4 duration-250"
        style={{ background: 'rgba(26, 26, 46, 0.95)', borderColor: 'rgba(255,255,255,0.12)' }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold text-white">⚙️ Settings</h2>
          <button onClick={onClose} className="p-2 rounded-full hover:bg-white/10 transition-colors">
            <X size={20} className="text-white/60" />
          </button>
        </div>

        <div className="flex flex-col gap-4">
          <NumberInput label="Focus (min)" value={settings.focusMinutes} onChange={(v) => updateSettings({ focusMinutes: v })} />
          <NumberInput label="Short Break (min)" value={settings.shortBreakMinutes} onChange={(v) => updateSettings({ shortBreakMinutes: v })} />
          <NumberInput label="Long Break (min)" value={settings.longBreakMinutes} onChange={(v) => updateSettings({ longBreakMinutes: v })} />
          <NumberInput label="Long Break Every" value={settings.longBreakInterval} onChange={(v) => updateSettings({ longBreakInterval: v })} />
          <div className="h-px bg-white/10" />
          <Toggle label="Auto-start next session" value={settings.autoStartNextSession} onChange={(v) => updateSettings({ autoStartNextSession: v })} />
          <Toggle label="Sound" value={settings.soundEnabled} onChange={(v) => updateSettings({ soundEnabled: v })} />
        </div>
      </div>
    </div>
  );
};

export default SettingsModal;
