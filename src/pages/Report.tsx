import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, ChevronLeft, ChevronRight, Download } from "lucide-react";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
} from "recharts";
import {
  startOfWeek, startOfMonth, startOfYear,
  addWeeks, addMonths, addYears, addDays,
  eachDayOfInterval, eachMonthOfInterval,
  format,
} from "date-fns";
import {
  useReportSessions,
  type PeriodType,
  type ReportSession,
  type ReportProject,
} from "@/hooks/useReportData";
import { useTimerStore } from "@/stores/timerStore";
import { useStatsStore } from "@/stores/statsStore";

// ── Helpers ─────────────────────────────────────────────────────────────────

function fmtHHMM(mins: number): string {
  const h = Math.floor(mins / 60);
  const m = Math.round(mins % 60);
  return `${h}:${m.toString().padStart(2, "0")}`;
}

const NO_PROJECT_KEY = "__np__";
const NO_PROJECT_COLOR = "#6b7280";
const NO_PROJECT_NAME = "Unassigned";

function getPeriodBounds(type: PeriodType, offset: number) {
  const now = new Date();
  let start: Date, end: Date, label: string;

  if (type === "week") {
    start = startOfWeek(addWeeks(now, offset), { weekStartsOn: 1 });
    end = addWeeks(start, 1);
    label = `${format(start, "MMM d")} – ${format(addDays(end, -1), "MMM d, yyyy")}`;
  } else if (type === "month") {
    const base = addMonths(now, offset);
    start = startOfMonth(base);
    end = addMonths(start, 1);
    label = format(start, "MMMM yyyy");
  } else {
    const base = addYears(now, offset);
    start = startOfYear(base);
    end = addYears(start, 1);
    label = format(start, "yyyy");
  }

  return { start, end, label };
}

// ── Chart tooltip ────────────────────────────────────────────────────────────

interface TooltipPayloadEntry {
  dataKey: string;
  value: number;
  fill: string;
  name: string;
}

function ChartTooltip({
  active,
  payload,
  label,
}: {
  active?: boolean;
  payload?: TooltipPayloadEntry[];
  label?: string;
}) {
  if (!active || !payload?.length) return null;
  const nonZero = payload.filter((p) => p.value > 0);
  if (!nonZero.length) return null;
  const total = nonZero.reduce((s, p) => s + p.value, 0);

  return (
    <div
      className="text-xs rounded-xl p-3 shadow-xl"
      style={{
        background: "hsl(234 30% 12%)",
        border: "1px solid rgba(255,255,255,0.12)",
        minWidth: 140,
      }}
    >
      <p className="text-white/50 mb-2 font-semibold">{label}</p>
      {nonZero.map((p) => (
        <div key={p.dataKey} className="flex items-center gap-2 mb-1">
          <span
            className="w-2 h-2 rounded-full flex-shrink-0"
            style={{ background: p.fill }}
          />
          <span className="text-white/70 flex-1">{p.name}</span>
          <span className="text-white font-medium">
            {fmtHHMM(Math.round(p.value * 60))}
          </span>
        </div>
      ))}
      {nonZero.length > 1 && (
        <div className="flex justify-between pt-1.5 mt-1 border-t border-white/10">
          <span className="text-white/40">Total</span>
          <span className="text-white font-semibold">
            {fmtHHMM(Math.round(total * 60))}
          </span>
        </div>
      )}
    </div>
  );
}

// ── Today card (always visible, reads from local stores) ─────────────────────

function TodayCard() {
  const todayPomodoros = useTimerStore((s) => s.todayPomodoros);
  const todayDate = useTimerStore((s) => s.todayDate);
  const history = useStatsStore((s) => s.history);

  const today = new Date().toISOString().slice(0, 10);
  // Use the timer store's todayPomodoros (most up-to-date), but get focusMinutes
  // from statsStore history which tracks accumulated minutes per day
  const statsToday = history.find((d) => d.date === today || d.date === todayDate);
  const focusMins = statsToday?.focusMinutes ?? todayPomodoros * 25;

  const fmtFocus = (mins: number) => {
    const h = Math.floor(mins / 60);
    const m = mins % 60;
    return h > 0 ? `${h}h ${m}m` : `${m}m`;
  };

  return (
    <div
      className="rounded-2xl px-5 py-4 flex items-center justify-between gap-4"
      style={{
        background: "hsl(234 30% 13%)",
        border: "1px solid rgba(255,255,255,0.07)",
      }}
    >
      <div className="flex items-center gap-2">
        <span className="text-base">🍅</span>
        <span className="text-sm font-semibold text-white/60">Today</span>
      </div>
      <div className="flex items-center gap-6">
        <div className="text-center">
          <div className="text-2xl font-extrabold text-white">{todayPomodoros}</div>
          <div className="text-xs text-white/35 mt-0.5">pomodoros</div>
        </div>
        <div className="w-px h-8 bg-white/10" />
        <div className="text-center">
          <div className="text-2xl font-extrabold text-white">{fmtFocus(focusMins)}</div>
          <div className="text-xs text-white/35 mt-0.5">focus time</div>
        </div>
      </div>
    </div>
  );
}

// ── Period header ────────────────────────────────────────────────────────────

function PeriodHeader({
  periodType,
  offset,
  label,
  onTypeChange,
  onOffsetChange,
}: {
  periodType: PeriodType;
  offset: number;
  label: string;
  onTypeChange: (t: PeriodType) => void;
  onOffsetChange: (o: number) => void;
}) {
  const TYPES: { id: PeriodType; label: string }[] = [
    { id: "week", label: "Week" },
    { id: "month", label: "Month" },
    { id: "year", label: "Year" },
  ];

  return (
    <div className="flex flex-col gap-3">
      {/* Filter buttons */}
      <div className="flex items-center gap-1 self-start">
        {TYPES.map((t) => (
          <button
            key={t.id}
            onClick={() => onTypeChange(t.id)}
            className="px-4 py-1.5 rounded-lg text-xs font-semibold transition-all"
            style={{
              background:
                periodType === t.id
                  ? "rgba(255,255,255,0.15)"
                  : "transparent",
              color:
                periodType === t.id
                  ? "rgba(255,255,255,0.9)"
                  : "rgba(255,255,255,0.35)",
            }}
          >
            {t.label}
          </button>
        ))}
      </div>
      {/* Navigation */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => onOffsetChange(offset - 1)}
          className="p-1.5 rounded-lg hover:bg-white/10 text-white/40 hover:text-white/80 transition-colors"
        >
          <ChevronLeft size={16} />
        </button>
        <span className="text-sm font-semibold text-white/80 min-w-[160px] text-center">
          {label}
        </span>
        <button
          onClick={() => onOffsetChange(offset + 1)}
          disabled={offset >= 0}
          className="p-1.5 rounded-lg hover:bg-white/10 text-white/40 hover:text-white/80 transition-colors disabled:opacity-25 disabled:cursor-not-allowed"
        >
          <ChevronRight size={16} />
        </button>
      </div>
    </div>
  );
}

// ── Summary tab ──────────────────────────────────────────────────────────────

function SummaryTab({
  sessions,
  projects,
  periodType,
  start,
  end,
}: {
  sessions: ReportSession[];
  projects: ReportProject[];
  periodType: PeriodType;
  start: Date;
  end: Date;
}) {
  // Build lookup: project id → project
  const projectMap = useMemo(
    () => new Map(projects.map((p) => [p.id, p])),
    [projects]
  );

  // Determine which projects appear in this period's sessions (+ unassigned)
  const activeProjectIds = useMemo(() => {
    const ids = new Set<string>();
    sessions.forEach((s) => ids.add(s.project_id ?? NO_PROJECT_KEY));
    return Array.from(ids);
  }, [sessions]);

  const activeProjects = useMemo(
    () =>
      activeProjectIds.map((id) =>
        id === NO_PROJECT_KEY
          ? { id: NO_PROJECT_KEY, name: NO_PROJECT_NAME, color: NO_PROJECT_COLOR }
          : (projectMap.get(id) ?? { id, name: "Deleted Project", color: "#666" })
      ),
    [activeProjectIds, projectMap]
  );

  // Build chart data
  const chartData = useMemo(() => {
    const units: Date[] =
      periodType === "year"
        ? eachMonthOfInterval({ start, end: addDays(end, -1) })
        : eachDayOfInterval({ start, end: addDays(end, -1) });

    const getUnitKey = (d: Date) =>
      periodType === "year" ? format(d, "yyyy-MM") : format(d, "yyyy-MM-dd");

    const getLabel = (d: Date) =>
      periodType === "year"
        ? format(d, "MMM")
        : periodType === "week"
        ? format(d, "EEE")
        : format(d, "d");

    // Initialize
    const dataMap: Record<string, Record<string, number | string>> = {};
    units.forEach((u) => {
      const key = getUnitKey(u);
      const entry: Record<string, number | string> = { label: getLabel(u) };
      activeProjectIds.forEach((id) => (entry[id] = 0));
      dataMap[key] = entry;
    });

    // Fill sessions (use local date for grouping — fixes timezone bug)
    sessions.forEach((s) => {
      const localDate = new Date(s.started_at);
      const key =
        periodType === "year"
          ? format(localDate, "yyyy-MM")
          : format(localDate, "yyyy-MM-dd");
      const entry = dataMap[key];
      if (!entry) return;
      const pid = s.project_id ?? NO_PROJECT_KEY;
      entry[pid] = ((entry[pid] as number) ?? 0) + s.duration_min / 60;
    });

    return Object.values(dataMap);
  }, [sessions, periodType, start, end, activeProjectIds]);

  // Project totals for table
  const projectMinutes = useMemo(() => {
    const map: Record<string, number> = {};
    sessions.forEach((s) => {
      const key = s.project_id ?? NO_PROJECT_KEY;
      map[key] = (map[key] ?? 0) + s.duration_min;
    });
    return map;
  }, [sessions]);

  const totalMinutes = Object.values(projectMinutes).reduce((a, b) => a + b, 0);

  if (sessions.length === 0) {
    return (
      <div className="flex flex-col items-center gap-3 py-16 text-center">
        <span className="text-4xl">📊</span>
        <p className="text-sm text-white/40">No focus sessions in this period</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Stacked bar chart */}
      <div className="rounded-2xl p-5" style={{ background: "hsl(234 30% 13%)", border: "1px solid rgba(255,255,255,0.07)" }}>
        <ResponsiveContainer width="100%" height={220}>
          <BarChart data={chartData} barCategoryGap="30%" margin={{ top: 4, right: 4, left: -8, bottom: 0 }}>
            <XAxis
              dataKey="label"
              tick={{ fill: "rgba(255,255,255,0.35)", fontSize: 11 }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis
              tickFormatter={(v: number) => (v === 0 ? "0" : `${v}h`)}
              tick={{ fill: "rgba(255,255,255,0.25)", fontSize: 11 }}
              axisLine={false}
              tickLine={false}
              allowDecimals={false}
              width={32}
            />
            <Tooltip content={<ChartTooltip />} cursor={{ fill: "rgba(255,255,255,0.04)" }} />
            {activeProjects.map((p) => (
              <Bar
                key={p.id}
                dataKey={p.id}
                stackId="s"
                fill={p.color}
                name={p.name}
                radius={
                  activeProjects[activeProjects.length - 1].id === p.id
                    ? [4, 4, 0, 0]
                    : [0, 0, 0, 0]
                }
              />
            ))}
          </BarChart>
        </ResponsiveContainer>

        {/* Legend */}
        <div className="flex flex-wrap gap-3 mt-3 pt-3" style={{ borderTop: "1px solid rgba(255,255,255,0.07)" }}>
          {activeProjects.map((p) => (
            <div key={p.id} className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-sm flex-shrink-0" style={{ background: p.color }} />
              <span className="text-xs text-white/50">{p.name}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Project table */}
      <div className="rounded-2xl overflow-hidden" style={{ border: "1px solid rgba(255,255,255,0.07)" }}>
        <table className="w-full text-sm">
          <thead>
            <tr style={{ background: "hsl(234 30% 11%)" }}>
              <th className="text-left px-5 py-3 text-xs font-semibold text-white/35 uppercase tracking-wider">
                Project
              </th>
              <th className="text-right px-5 py-3 text-xs font-semibold text-white/35 uppercase tracking-wider">
                Time
              </th>
            </tr>
          </thead>
          <tbody>
            {activeProjects
              .filter((p) => (projectMinutes[p.id] ?? 0) > 0)
              .sort((a, b) => (projectMinutes[b.id] ?? 0) - (projectMinutes[a.id] ?? 0))
              .map((p) => (
                <tr
                  key={p.id}
                  style={{ borderTop: "1px solid rgba(255,255,255,0.05)" }}
                >
                  <td className="px-5 py-3 text-white/70">
                    <div className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ background: p.color }} />
                      {p.name}
                    </div>
                  </td>
                  <td className="px-5 py-3 text-right text-white/70 tabular-nums">
                    {fmtHHMM(projectMinutes[p.id] ?? 0)}
                  </td>
                </tr>
              ))}
          </tbody>
          <tfoot>
            <tr style={{ borderTop: "1px solid rgba(255,255,255,0.12)", background: "hsl(234 30% 11%)" }}>
              <td className="px-5 py-3 font-semibold text-white/60">Total</td>
              <td className="px-5 py-3 text-right font-bold text-white tabular-nums">
                {fmtHHMM(totalMinutes)}
              </td>
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  );
}

// ── Detail tab ───────────────────────────────────────────────────────────────

function exportCSV(
  sessions: ReportSession[],
  projects: ReportProject[],
  label: string
) {
  const projectMap = new Map(projects.map((p) => [p.id, p]));
  const headers = ["Date", "Start", "End", "Project", "Task", "Duration (min)"];
  const rows = sessions.map((s) => [
    format(new Date(s.started_at), "yyyy-MM-dd"),
    format(new Date(s.started_at), "HH:mm"),
    s.ended_at ? format(new Date(s.ended_at), "HH:mm") : "",
    s.project_id
      ? (projectMap.get(s.project_id)?.name ?? "Unknown")
      : NO_PROJECT_NAME,
    s.task_name ?? "",
    String(s.duration_min),
  ]);
  const csv = [headers, ...rows]
    .map((r) => r.map((c) => `"${c}"`).join(","))
    .join("\n");
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `pomodoro-${label.replace(/[\s–,]/g, "-")}.csv`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

function DetailTab({
  sessions,
  projects,
  periodLabel,
}: {
  sessions: ReportSession[];
  projects: ReportProject[];
  periodLabel: string;
}) {
  const projectMap = useMemo(
    () => new Map(projects.map((p) => [p.id, p])),
    [projects]
  );

  if (sessions.length === 0) {
    return (
      <div className="flex flex-col items-center gap-3 py-16 text-center">
        <span className="text-4xl">🍅</span>
        <p className="text-sm text-white/40">No sessions in this period</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      {/* Export button */}
      <div className="flex justify-end">
        <button
          onClick={() => exportCSV(sessions, projects, periodLabel)}
          className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold text-white/50 hover:text-white/80 transition-colors"
          style={{ background: "hsl(234 30% 13%)", border: "1px solid rgba(255,255,255,0.08)" }}
        >
          <Download size={13} />
          Export CSV
        </button>
      </div>

      {/* Sessions list */}
      <div
        className="rounded-2xl overflow-hidden"
        style={{ border: "1px solid rgba(255,255,255,0.07)" }}
      >
        {/* Header */}
        <div
          className="grid text-xs font-semibold text-white/35 uppercase tracking-wider px-4 py-3"
          style={{
            background: "hsl(234 30% 11%)",
            gridTemplateColumns: "1fr 1.6fr auto",
            gap: "0 12px",
          }}
        >
          <span>Date</span>
          <span>Task</span>
          <span className="text-right">Min</span>
        </div>

        {sessions.map((s, i) => {
          const project = s.project_id ? projectMap.get(s.project_id) : null;
          const startDate = new Date(s.started_at);
          const endDate = s.ended_at ? new Date(s.ended_at) : null;

          return (
            <div
              key={s.id}
              className="grid px-4 py-3 items-start"
              style={{
                gridTemplateColumns: "1fr 1.6fr auto",
                gap: "0 12px",
                borderTop: i === 0 ? "none" : "1px solid rgba(255,255,255,0.05)",
              }}
            >
              {/* Date + time range */}
              <div className="flex flex-col gap-0.5">
                <span className="text-xs font-semibold text-white/70">
                  {format(startDate, "MMM d")}
                </span>
                <span className="text-xs text-white/30">
                  {format(startDate, "HH:mm")}
                  {endDate ? ` ~ ${format(endDate, "HH:mm")}` : ""}
                </span>
              </div>

              {/* Project badge + task name */}
              <div className="flex flex-col gap-1 min-w-0">
                {project ? (
                  <span
                    className="self-start text-xs font-semibold px-2 py-0.5 rounded-full truncate max-w-full"
                    style={{
                      background: `${project.color}22`,
                      color: project.color,
                      border: `1px solid ${project.color}44`,
                    }}
                  >
                    {project.name}
                  </span>
                ) : (
                  <span className="self-start text-xs text-white/20 px-2 py-0.5 rounded-full"
                    style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)" }}>
                    No Project
                  </span>
                )}
                {s.task_name && (
                  <span className="text-xs text-white/55 truncate">{s.task_name}</span>
                )}
              </div>

              {/* Duration */}
              <span className="text-xs text-white/50 tabular-nums text-right pt-0.5">
                {s.duration_min}m
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ── Main Report page ─────────────────────────────────────────────────────────

export default function Report() {
  const navigate = useNavigate();
  const [tab, setTab] = useState<"summary" | "detail">("summary");
  const [periodType, setPeriodType] = useState<PeriodType>("week");
  const [offset, setOffset] = useState(0);

  const { start, end, label } = useMemo(
    () => getPeriodBounds(periodType, offset),
    [periodType, offset]
  );

  const { data, isLoading } = useReportSessions(start, end);

  const sessions = data?.sessions ?? [];
  const projects = data?.projects ?? [];

  function handleTypeChange(t: PeriodType) {
    setPeriodType(t);
    setOffset(0);
  }

  return (
    <div
      className="min-h-[100dvh] font-primary text-white flex flex-col"
      style={{ background: "hsl(234 30% 9%)" }}
    >
      {/* Header */}
      <header
        className="flex items-center gap-3 px-5 py-4 mx-4 mt-4"
        style={{
          background: "hsl(234 30% 12%)",
          border: "1px solid rgba(255,255,255,0.07)",
          borderRadius: "16px",
        }}
      >
        <button
          onClick={() => navigate("/")}
          className="p-1.5 rounded-full hover:bg-white/10 transition-colors"
        >
          <ArrowLeft size={18} className="text-white/60" />
        </button>
        <h1 className="text-base font-extrabold tracking-tight text-white/90">
          📊 Report
        </h1>
      </header>

      <main className="flex-1 flex justify-center px-4 py-5">
        <div className="w-full max-w-2xl flex flex-col gap-5">
          {/* Tab bar */}
          <div
            className="flex gap-1 p-1 rounded-xl self-start"
            style={{ background: "hsl(234 30% 13%)" }}
          >
            {(["summary", "detail"] as const).map((t) => (
              <button
                key={t}
                onClick={() => setTab(t)}
                className="px-5 py-2 rounded-lg text-sm font-semibold transition-all capitalize"
                style={{
                  background:
                    tab === t ? "rgba(255,255,255,0.12)" : "transparent",
                  color:
                    tab === t
                      ? "rgba(255,255,255,0.9)"
                      : "rgba(255,255,255,0.35)",
                }}
              >
                {t}
              </button>
            ))}
          </div>

          {/* Today — always visible, sourced from local stores */}
          <TodayCard />

          {/* Period header */}
          <PeriodHeader
            periodType={periodType}
            offset={offset}
            label={label}
            onTypeChange={handleTypeChange}
            onOffsetChange={setOffset}
          />

          {/* Tab content */}
          {isLoading ? (
            <div className="flex flex-col gap-3 pt-4">
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="h-10 rounded-xl animate-pulse"
                  style={{ background: "rgba(255,255,255,0.05)" }}
                />
              ))}
            </div>
          ) : tab === "summary" ? (
            <SummaryTab
              sessions={sessions}
              projects={projects}
              periodType={periodType}
              start={start}
              end={end}
            />
          ) : (
            <DetailTab
              sessions={sessions}
              projects={projects}
              periodLabel={label}
            />
          )}
        </div>
      </main>
    </div>
  );
}
