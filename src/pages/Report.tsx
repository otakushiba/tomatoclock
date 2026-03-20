import { useNavigate } from "react-router-dom";
import { ArrowLeft, Loader2 } from "lucide-react";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
} from "recharts";
import {
  useTodaySummary, useWeeklyData, useTaskDistribution, useProjectDistribution,
} from "@/hooks/useReportData";

const ACCENT = "hsl(234 60% 60%)";
const COLORS = [
  "#7c9ef8", "#f87c9e", "#7cf8c2", "#f8c47c", "#c47cf8",
  "#f8f07c", "#7cd4f8", "#f8a07c",
];

function Card({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <div
      className={`rounded-2xl p-5 flex flex-col gap-4 ${className}`}
      style={{
        background: "hsl(234 30% 15% / 0.8)",
        border: "1px solid hsl(234 30% 30% / 0.4)",
      }}
    >
      {children}
    </div>
  );
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return <h2 className="text-sm font-bold text-white/50 uppercase tracking-widest">{children}</h2>;
}

function Skeleton() {
  return (
    <div className="h-8 rounded-lg animate-pulse" style={{ background: "hsl(234 30% 25%)" }} />
  );
}

// ── 今日摘要 ──────────────────────────────────────────────────
function TodaySection() {
  const { data, isLoading } = useTodaySummary();
  const isEmpty = !isLoading && (data?.pomodoros ?? 0) === 0;

  return (
    <Card>
      <SectionTitle>今日總覽</SectionTitle>
      {isLoading ? (
        <div className="flex gap-3">
          <div className="flex-1"><Skeleton /></div>
          <div className="flex-1"><Skeleton /></div>
        </div>
      ) : isEmpty ? (
        <div className="flex flex-col items-center gap-2 py-4 text-center">
          <span className="text-3xl">🍅</span>
          <p className="text-sm text-white/40">今天還沒有番茄紀錄</p>
          <p className="text-xs text-white/25">回到計時器開始專注吧！</p>
        </div>
      ) : (
        <div className="flex gap-3">
          <div className="flex-1 rounded-xl p-4 text-center" style={{ background: "hsl(234 30% 10%)" }}>
            <div className="text-4xl font-extrabold text-white">{data?.pomodoros ?? 0}</div>
            <div className="text-xs mt-1 text-white/40">🍅 番茄數</div>
          </div>
          <div className="flex-1 rounded-xl p-4 text-center" style={{ background: "hsl(234 30% 10%)" }}>
            <div className="text-4xl font-extrabold text-white">{data?.totalMinutes ?? 0}</div>
            <div className="text-xs mt-1 text-white/40">⏱ 專注分鐘</div>
          </div>
        </div>
      )}
    </Card>
  );
}

// ── 本週長條圖 ────────────────────────────────────────────────
function WeeklySection() {
  const { data, isLoading } = useWeeklyData();
  const hasData = data && data.some((d) => d.pomodoros > 0);

  return (
    <Card>
      <SectionTitle>本週番茄數</SectionTitle>
      {isLoading ? (
        <div className="h-48 flex items-center justify-center">
          <Loader2 size={24} className="animate-spin text-white/30" />
        </div>
      ) : !hasData ? (
        <div className="h-48 flex flex-col items-center justify-center gap-2">
          <span className="text-3xl">📊</span>
          <p className="text-sm text-white/40">本週還沒有紀錄</p>
        </div>
      ) : (
        <div className="h-48">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} barCategoryGap="30%">
              <defs>
                <linearGradient id="weekBarGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={ACCENT} stopOpacity={0.9} />
                  <stop offset="100%" stopColor={ACCENT} stopOpacity={0.2} />
                </linearGradient>
              </defs>
              <XAxis dataKey="label" tick={{ fill: "rgba(255,255,255,0.35)", fontSize: 12 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: "rgba(255,255,255,0.25)", fontSize: 11 }} axisLine={false} tickLine={false} allowDecimals={false} width={24} />
              <Tooltip
                contentStyle={{ background: "rgba(20,22,40,0.95)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "12px", color: "white", fontSize: "13px" }}
                formatter={(v: number) => [`${v} 🍅`, "番茄數"]}
                cursor={{ fill: "rgba(255,255,255,0.05)" }}
              />
              <Bar dataKey="pomodoros" fill="url(#weekBarGrad)" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}
    </Card>
  );
}

// ── 專案分佈 ──────────────────────────────────────────────────
function ProjectSection() {
  const { data, isLoading } = useProjectDistribution();

  return (
    <Card>
      <SectionTitle>專案專注分佈</SectionTitle>
      {isLoading ? (
        <div className="flex flex-col gap-3">
          {[1, 2, 3].map((i) => <Skeleton key={i} />)}
        </div>
      ) : !data || data.length === 0 ? (
        <p className="text-white/30 text-sm text-center py-4">還沒有任何專案紀錄</p>
      ) : (
        <div className="flex flex-col gap-3">
          {data.map((item) => (
            <div key={item.id} className="flex flex-col gap-1.5">
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2 min-w-0">
                  <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ background: item.color }} />
                  <span className="text-sm text-white/70 truncate">{item.name}</span>
                </div>
                <span className="text-xs text-white/40 shrink-0 ml-2">
                  {item.minutes} 分鐘 · {item.percent}%
                </span>
              </div>
              <div className="h-2 rounded-full overflow-hidden" style={{ background: "hsl(234 30% 10%)" }}>
                <div
                  className="h-full rounded-full transition-all duration-700"
                  style={{ width: `${item.percent}%`, background: item.color }}
                />
              </div>
            </div>
          ))}
        </div>
      )}
    </Card>
  );
}

// ── 任務分佈 ──────────────────────────────────────────────────
function DistributionSection() {
  const { data, isLoading } = useTaskDistribution();

  return (
    <Card>
      <SectionTitle>任務專注分佈</SectionTitle>
      {isLoading ? (
        <div className="flex flex-col gap-3">
          {[1, 2, 3].map((i) => <Skeleton key={i} />)}
        </div>
      ) : !data || data.length === 0 ? (
        <p className="text-white/30 text-sm text-center py-4">還沒有任何紀錄</p>
      ) : (
        <div className="flex flex-col gap-3">
          {data.map((item, i) => (
            <div key={item.name} className="flex flex-col gap-1.5">
              <div className="flex justify-between items-center">
                <span className="text-sm text-white/70 truncate max-w-[70%]">{item.name}</span>
                <span className="text-xs text-white/40 shrink-0">
                  {item.minutes} 分鐘 · {item.percent}%
                </span>
              </div>
              <div className="h-2 rounded-full overflow-hidden" style={{ background: "hsl(234 30% 10%)" }}>
                <div
                  className="h-full rounded-full transition-all duration-700"
                  style={{ width: `${item.percent}%`, background: COLORS[i % COLORS.length] }}
                />
              </div>
            </div>
          ))}
        </div>
      )}
    </Card>
  );
}

// ── 頁面主體 ──────────────────────────────────────────────────
export default function Report() {
  const navigate = useNavigate();

  return (
    <div className="min-h-[100dvh] font-primary text-white flex flex-col" style={{ background: "hsl(234 30% 10%)" }}>
      <header
        className="glass-sm flex items-center gap-3 px-6 py-3 mx-4 mt-4 md:mx-8"
        style={{ borderRadius: "16px" }}
      >
        <button onClick={() => navigate("/")} className="p-1.5 rounded-full hover:bg-white/10 transition-colors">
          <ArrowLeft size={20} className="text-white/60" />
        </button>
        <h1 className="text-lg font-extrabold tracking-tight text-white/90">📊 報告</h1>
      </header>

      <main className="flex-1 flex justify-center px-4 py-6">
        <div className="w-full max-w-lg flex flex-col gap-4">
          <TodaySection />
          <WeeklySection />
          <ProjectSection />
          <DistributionSection />
        </div>
      </main>
    </div>
  );
}
