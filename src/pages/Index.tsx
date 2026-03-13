import { useState } from 'react';
import { useTimerStore } from '@/stores/timerStore';
import { getGradientStyle } from '@/lib/timer-utils';
import ModeTabs from '@/components/ModeTabs';
import ProgressRing from '@/components/ProgressRing';
import TaskList from '@/components/TaskList';
import StatsPanel from '@/components/StatsPanel';
import SettingsModal from '@/components/SettingsModal';
import MobileTabBar, { type MobileTab } from '@/components/MobileTabBar';
import { Settings } from 'lucide-react';

const Index = () => {
  const { mode, todayPomodoros } = useTimerStore();
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [mobileTab, setMobileTab] = useState<MobileTab>('timer');

  return (
    <div
      className="min-h-[100dvh] font-primary text-white flex flex-col"
      style={getGradientStyle(mode)}
    >
      {/* Header */}
      <header className="glass-sm flex items-center justify-between px-6 py-3 mx-4 mt-4 md:mx-8" style={{ borderRadius: '16px' }}>
        <h1 className="text-xl font-extrabold tracking-tight">🍅 FocusFlow</h1>
        <button
          onClick={() => setSettingsOpen(true)}
          className="p-2 rounded-full hover:bg-white/15 transition-colors"
        >
          <Settings size={22} />
        </button>
      </header>

      {/* Desktop layout */}
      <main className="flex-1 hidden md:flex gap-6 p-8 max-w-6xl mx-auto w-full">
        {/* Left: Timer */}
        <div className="flex-1 flex flex-col items-center gap-8 justify-center">
          <ModeTabs />
          <ProgressRing />
          <div className="text-sm font-semibold" style={{ color: 'rgba(255,255,255,0.7)' }}>
            今日完成：🍅 × {todayPomodoros}
          </div>
        </div>
        {/* Right: Tasks + Stats */}
        <div className="w-[380px] flex flex-col gap-6">
          <TaskList />
          <StatsPanel />
        </div>
      </main>

      {/* Mobile layout */}
      <main className="flex-1 md:hidden p-4 pb-24">
        {mobileTab === 'timer' && (
          <div className="flex flex-col items-center gap-6 pt-4">
            <ModeTabs />
            <ProgressRing />
            <div className="text-sm font-semibold" style={{ color: 'rgba(255,255,255,0.7)' }}>
              今日完成：🍅 × {todayPomodoros}
            </div>
          </div>
        )}
        {mobileTab === 'tasks' && <TaskList />}
        {mobileTab === 'stats' && <StatsPanel />}
      </main>

      <MobileTabBar active={mobileTab} onChange={setMobileTab} />
      <SettingsModal open={settingsOpen} onClose={() => setSettingsOpen(false)} />
    </div>
  );
};

export default Index;
