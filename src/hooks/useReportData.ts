import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/contexts/AuthContext";
import { startOfWeek, eachDayOfInterval, format } from "date-fns";

// ── 今日摘要 ────────────────────────────────────────────────
async function fetchTodaySummary(userId: string) {
  const today = new Date().toISOString().slice(0, 10);
  const { data, error } = await supabase
    .from("pomodoro_sessions")
    .select("duration_min")
    .eq("user_id", userId)
    .eq("status", "completed")
    .gte("started_at", `${today}T00:00:00`)
    .lte("started_at", `${today}T23:59:59`);

  if (error) throw error;
  return {
    pomodoros: data.length,
    totalMinutes: data.reduce((sum, s) => sum + (s.duration_min ?? 0), 0),
  };
}

// ── 本週每天番茄數 ──────────────────────────────────────────
async function fetchWeeklyData(userId: string) {
  const weekStart = startOfWeek(new Date(), { weekStartsOn: 1 });
  const { data, error } = await supabase
    .from("pomodoro_sessions")
    .select("started_at")
    .eq("user_id", userId)
    .eq("status", "completed")
    .gte("started_at", weekStart.toISOString());

  if (error) throw error;

  const days = eachDayOfInterval({ start: weekStart, end: new Date() });
  const dayMap: Record<string, number> = {};
  days.forEach((d) => { dayMap[format(d, "yyyy-MM-dd")] = 0; });
  data.forEach((s) => {
    const date = (s.started_at as string).slice(0, 10);
    if (date in dayMap) dayMap[date]++;
  });

  const DAY_ZH = ["一", "二", "三", "四", "五", "六", "日"];
  return Object.entries(dayMap).map(([date, pomodoros]) => {
    const d = new Date(date + "T12:00:00");
    return { date, label: DAY_ZH[d.getDay() === 0 ? 6 : d.getDay() - 1], pomodoros };
  });
}

// ── 各任務專注時間分佈 ──────────────────────────────────────
async function fetchTaskDistribution(userId: string) {
  const { data, error } = await supabase
    .from("pomodoro_sessions")
    .select("task_name, duration_min")
    .eq("user_id", userId)
    .eq("status", "completed");

  if (error) throw error;

  const map: Record<string, number> = {};
  data.forEach((s) => {
    const key = s.task_name ?? "（未指定任務）";
    map[key] = (map[key] ?? 0) + (s.duration_min ?? 0);
  });

  const total = Object.values(map).reduce((a, b) => a + b, 0);
  return Object.entries(map)
    .map(([name, minutes]) => ({
      name,
      minutes,
      percent: total > 0 ? Math.round((minutes / total) * 100) : 0,
    }))
    .sort((a, b) => b.minutes - a.minutes)
    .slice(0, 8);
}

// ── 各專案專注時間分佈 ──────────────────────────────────────
async function fetchProjectDistribution(userId: string) {
  // Fetch sessions with project_id
  const [sessionsRes, projectsRes] = await Promise.all([
    supabase
      .from("pomodoro_sessions")
      .select("project_id, duration_min")
      .eq("user_id", userId)
      .eq("status", "completed")
      .not("project_id", "is", null),
    supabase
      .from("projects")
      .select("id, name, color")
      .eq("owner_id", userId),
  ]);

  if (sessionsRes.error) throw sessionsRes.error;
  if (projectsRes.error) throw projectsRes.error;

  const projectMap = new Map(projectsRes.data.map((p) => [p.id, p]));

  const minutesByProject: Record<string, number> = {};
  sessionsRes.data.forEach((s) => {
    if (!s.project_id) return;
    minutesByProject[s.project_id] = (minutesByProject[s.project_id] ?? 0) + (s.duration_min ?? 0);
  });

  const total = Object.values(minutesByProject).reduce((a, b) => a + b, 0);
  return Object.entries(minutesByProject)
    .map(([projectId, minutes]) => {
      const project = projectMap.get(projectId);
      return {
        id: projectId,
        name: project?.name ?? "（已刪除專案）",
        color: project?.color ?? "#666",
        minutes,
        percent: total > 0 ? Math.round((minutes / total) * 100) : 0,
      };
    })
    .sort((a, b) => b.minutes - a.minutes);
}

// ── Hooks ───────────────────────────────────────────────────
export function useTodaySummary() {
  const { user } = useAuth();
  return useQuery({
    queryKey: ["report", "today", user?.id],
    queryFn: () => fetchTodaySummary(user!.id),
    enabled: !!user,
  });
}

export function useWeeklyData() {
  const { user } = useAuth();
  return useQuery({
    queryKey: ["report", "weekly", user?.id],
    queryFn: () => fetchWeeklyData(user!.id),
    enabled: !!user,
  });
}

export function useTaskDistribution() {
  const { user } = useAuth();
  return useQuery({
    queryKey: ["report", "tasks", user?.id],
    queryFn: () => fetchTaskDistribution(user!.id),
    enabled: !!user,
  });
}

export function useProjectDistribution() {
  const { user } = useAuth();
  return useQuery({
    queryKey: ["report", "projects", user?.id],
    queryFn: () => fetchProjectDistribution(user!.id),
    enabled: !!user,
  });
}
