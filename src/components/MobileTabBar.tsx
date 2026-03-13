import { useState } from 'react';
import { Timer, ClipboardList, BarChart3 } from 'lucide-react';

type MobileTab = 'timer' | 'tasks' | 'stats';

const MobileTabBar = ({ active, onChange }: { active: MobileTab; onChange: (tab: MobileTab) => void }) => {
  const tabs: { id: MobileTab; icon: typeof Timer; label: string }[] = [
    { id: 'timer', icon: Timer, label: '計時器' },
    { id: 'tasks', icon: ClipboardList, label: '任務' },
    { id: 'stats', icon: BarChart3, label: '統計' },
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 glass-sm rounded-none border-t border-white/20 flex md:hidden z-40" style={{ borderRadius: 0 }}>
      {tabs.map(({ id, icon: Icon, label }) => (
        <button
          key={id}
          onClick={() => onChange(id)}
          className={`flex-1 flex flex-col items-center py-3 gap-1 transition-all ${
            active === id ? 'text-white' : 'text-white/50'
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
