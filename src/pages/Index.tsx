import { useState, useEffect, useCallback } from 'react';
import { useTimerStore } from '@/stores/timerStore';
import { useTaskStore } from '@/stores/taskStore';
import ModeTabs from '@/components/ModeTabs';
import ProgressRing from '@/components/ProgressRing';
import TaskList from '@/components/TaskList';
import SettingsModal from '@/components/SettingsModal';
import MobileTabBar, { type MobileTab } from '@/components/MobileTabBar';
import { Settings, LogOut, UserCircle, BarChart2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useProfile } from '@/hooks/useProfile';

const MODE_BG: Record<string, string> = {
  focus:      'hsl(322 28% 10%)',
  shortBreak: 'hsl(155 22% 10%)',
  longBreak:  'hsl(200 28% 10%)',
};

const Index = () => {
  const { todayPomodoros, mode, isRunning, start, pause } = useTimerStore();
  const { activeTaskName } = useTaskStore();
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [mobileTab, setMobileTab] = useState<MobileTab>('timer');
  const { signOut } = useAuth();
  const { profile } = useProfile();
  const navigate = useNavigate();

  // Keyboard shortcut: Space to start/pause
  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (e.code === 'Space' && e.target === document.body) {
      e.preventDefault();
      if (isRunning) pause();
      else start();
    }
  }, [isRunning, start, pause]);

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  return (
    <div
      className="min-h-[100dvh] font-primary text-white flex flex-col transition-colors duration-700"
      style={{ background: MODE_BG[mode] }}
    >
      {/* Header */}
      <header className="glass-sm flex items-center justify-between px-6 py-3 mx-4 mt-4 md:mx-8" style={{ borderRadius: '16px' }}>
        <h1 className="text-xl font-extrabold tracking-tight text-white/90">🍅 FocusFlow</h1>
        <div className="flex items-center gap-1">
          <button
            onClick={() => navigate('/report')}
            className="p-2 rounded-full hover:bg-white/10 transition-colors"
            title="Report"
          >
            <BarChart2 size={22} className="text-white/50" />
          </button>
          <button
            onClick={() => setSettingsOpen(true)}
            className="p-2 rounded-full hover:bg-white/10 transition-colors"
          >
            <Settings size={22} className="text-white/50" />
          </button>
          <button
            onClick={() => navigate('/profile')}
            className="p-1 rounded-full hover:bg-white/10 transition-colors"
            title="Profile"
          >
            {profile?.avatar_url ? (
              <img
                src={profile.avatar_url}
                alt="avatar"
                className="w-7 h-7 rounded-full object-cover"
              />
            ) : (
              <UserCircle size={26} className="text-white/50" />
            )}
          </button>
          <button
            onClick={() => signOut()}
            className="p-2 rounded-full hover:bg-white/10 transition-colors"
            title="Sign Out"
          >
            <LogOut size={22} className="text-white/50" />
          </button>
        </div>
      </header>

      {/* Desktop layout */}
      <main className="flex-1 hidden md:flex gap-6 p-8 max-w-6xl mx-auto w-full">
        {/* Left: Timer */}
        <div className="flex-1 flex flex-col items-center gap-8 justify-center">
          <ModeTabs />
          <ProgressRing />
          {/* Active task display */}
          {activeTaskName ? (
            <div className="flex flex-col items-center gap-1 text-center">
              <div className="text-xs text-white/30 uppercase tracking-widest font-semibold">Now Focusing On</div>
              <div className="text-sm font-bold text-white/70 max-w-xs truncate">{activeTaskName}</div>
            </div>
          ) : (
            <div className="text-sm font-semibold text-white/30">
              Today: 🍅 × {todayPomodoros}
            </div>
          )}
          <div className="text-xs text-white/20">
            Press <kbd className="px-1.5 py-0.5 rounded bg-white/10 text-white/40 font-mono text-xs">Space</kbd> to start/pause
          </div>
        </div>
        {/* Right: Tasks */}
        <div className="w-[380px] flex flex-col gap-6">
          <TaskList />
        </div>
      </main>

      {/* Mobile layout */}
      <main className="flex-1 md:hidden p-4 pb-24">
        {mobileTab === 'timer' && (
          <div className="flex flex-col items-center gap-6 pt-4">
            <ModeTabs />
            <ProgressRing />
            {/* Active task display */}
            {activeTaskName ? (
              <div className="flex flex-col items-center gap-1 text-center">
                <div className="text-xs text-white/30 uppercase tracking-widest font-semibold">Now Focusing On</div>
                <div className="text-sm font-bold text-white/70 max-w-xs truncate">{activeTaskName}</div>
              </div>
            ) : (
              <div className="text-sm font-semibold text-white/30">
                Today: 🍅 × {todayPomodoros}
              </div>
            )}
          </div>
        )}
        {mobileTab === 'tasks' && <TaskList />}
      </main>

      <MobileTabBar active={mobileTab} onChange={setMobileTab} />
      <SettingsModal open={settingsOpen} onClose={() => setSettingsOpen(false)} />
    </div>
  );
};

export default Index;
