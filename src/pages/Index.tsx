import { useState } from 'react';
import { useTimerStore } from '@/stores/timerStore';
import ModeTabs from '@/components/ModeTabs';
import ProgressRing from '@/components/ProgressRing';
import TaskList from '@/components/TaskList';
import StatsPanel from '@/components/StatsPanel';
import SettingsModal from '@/components/SettingsModal';
import MobileTabBar, { type MobileTab } from '@/components/MobileTabBar';
import { Settings, LogOut, UserCircle, BarChart2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useProfile } from '@/hooks/useProfile';
import { useSessionRecorder } from '@/hooks/useSessionRecorder';

const MODE_BG: Record<string, string> = {
  focus:      'hsl(322 28% 10%)',
  shortBreak: 'hsl(155 22% 10%)',
  longBreak:  'hsl(200 28% 10%)',
};

const Index = () => {
  const { todayPomodoros, mode } = useTimerStore();
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [mobileTab, setMobileTab] = useState<MobileTab>('timer');
  const { signOut } = useAuth();
  const { profile } = useProfile();
  const navigate = useNavigate();
  useSessionRecorder();

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
            title="報告"
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
            title="個人資料"
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
            title="登出"
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
          <div className="text-sm font-semibold text-white/30">
            Today: 🍅 × {todayPomodoros}
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
            <div className="text-sm font-semibold text-white/30">
              Today: 🍅 × {todayPomodoros}
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
