import { Timer, ClipboardList } from 'lucide-react';

type MobileTab = 'timer' | 'tasks';

const MobileTabBar = ({ active, onChange }: { active: MobileTab; onChange: (tab: MobileTab) => void }) => {
  const tabs: { id: MobileTab; icon: typeof Timer; label: string }[] = [
    { id: 'timer', icon: Timer, label: 'Timer' },
    { id: 'tasks', icon: ClipboardList, label: 'Tasks' },
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 flex md:hidden z-40" style={{ background: 'rgba(26,26,46,0.9)', backdropFilter: 'blur(20px)', borderTop: '1px solid rgba(255,255,255,0.08)', borderRadius: 0 }}>
      {tabs.map(({ id, icon: Icon, label }) => (
        <button
          key={id}
          onClick={() => onChange(id)}
          className={`flex-1 flex flex-col items-center py-3 gap-1 transition-all ${
            active === id ? 'text-white' : 'text-white/30'
          }`}
        >
          <Icon size={20} />
          <span className="text-xs font-semibold">{label}</span>
          {active === id && <div className="w-1 h-1 rounded-full bg-white" />}
        </button>
      ))}
    </div>
  );
};

export default MobileTabBar;
export type { MobileTab };
