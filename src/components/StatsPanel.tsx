import { useMemo, useState } from 'react';
import { useStatsStore } from '@/stores/statsStore';
import { useTimerStore } from '@/stores/timerStore';
import { ACCENT_COLORS } from '@/lib/timer-utils';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

const StatsPanel = () => {
  const { history } = useStatsStore();
  const { todayPomodoros, settings, mode } = useTimerStore();
  const [range, setRange] = useState<7 | 30>(7);
  const accentColor = ACCENT_COLORS[mode];

  const today = new Date().toISOString().slice(0, 10);
  const yesterday = new Date(Date.now() - 86400000).toISOString().slice(0, 10);

  const todayStats = history.find((d) => d.date === today);
  const yesterdayStats = history.find((d) => d.date === yesterday);
  const diff = (todayStats?.pomodoros ?? todayPomodoros) - (yesterdayStats?.pomodoros ?? 0);

  const chartData = useMemo(() => {
    const days: { date: string; label: string; pomodoros: number }[] = [];
    for (let i = range - 1; i >= 0; i--) {
      const d = new Date(Date.now() - i * 86400000);
      const dateStr = d.toISOString().slice(0, 10);
      const stat = history.find((h) => h.date === dateStr);
      days.push({
        date: dateStr,
        label: `${d.getMonth() + 1}/${d.getDate()}`,
        pomodoros: stat?.pomodoros ?? 0,
      });
    }
    return days;
  }, [history, range]);

  return (
    <div className="glass p-5 flex flex-col gap-4">
      <h2 className="text-lg font-bold text-white/90">📊 Statistics</h2>

      {/* Today summary */}
      <div className="flex gap-3">
        <div className="glass-sm p-4 flex-1 text-center">
          <div className="text-3xl font-extrabold text-white">{todayStats?.pomodoros ?? todayPomodoros}</div>
          <div className="text-xs mt-1 text-white/40">Completed</div>
        </div>
        <div className="glass-sm p-4 flex-1 text-center">
          <div className="text-3xl font-extrabold text-white">{todayStats?.focusMinutes ?? todayPomodoros * settings.focusMinutes}</div>
          <div className="text-xs mt-1 text-white/40">Focus Min</div>
        </div>
        <div className="glass-sm p-4 flex-1 text-center">
          <div className={`text-lg font-bold ${diff >= 0 ? '' : 'text-white/30'}`} style={diff >= 0 ? { color: ACCENT_COLORS.shortBreak } : {}}>
            {diff >= 0 ? `+${diff} 🔥` : `${diff}`}
          </div>
          <div className="text-xs mt-1 text-white/40">
            {diff >= 0 ? 'vs Yesterday' : 'Keep going!'}
          </div>
        </div>
      </div>

      {/* Range tabs */}
      <div className="flex gap-2">
        <button
          onClick={() => setRange(7)}
          className={`px-4 py-1 rounded-pill text-sm font-semibold transition-all ${range === 7 ? 'bg-white/15 text-white' : 'bg-white/5 text-white/40 hover:bg-white/10'}`}
        >
          7 Days
        </button>
        <button
          onClick={() => setRange(30)}
          className={`px-4 py-1 rounded-pill text-sm font-semibold transition-all ${range === 30 ? 'bg-white/15 text-white' : 'bg-white/5 text-white/40 hover:bg-white/10'}`}
        >
          30 Days
        </button>
      </div>

      {/* Chart */}
      <div className="h-48" style={{ minHeight: '192px' }}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData}>
            <defs>
              <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={accentColor} stopOpacity={0.9} />
                <stop offset="100%" stopColor={accentColor} stopOpacity={0.2} />
              </linearGradient>
            </defs>
            <XAxis dataKey="label" tick={{ fill: 'rgba(255,255,255,0.3)', fontSize: 11 }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fill: 'rgba(255,255,255,0.3)', fontSize: 11 }} axisLine={false} tickLine={false} allowDecimals={false} />
            <Tooltip
              contentStyle={{
                background: 'rgba(30,30,50,0.9)',
                border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: '12px',
                color: 'white',
                fontSize: '13px',
              }}
              formatter={(value: number) => [`${value} 🍅`, 'Pomodoros']}
            />
            <Bar dataKey="pomodoros" fill="url(#barGradient)" radius={[6, 6, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default StatsPanel;
