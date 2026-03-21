import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/contexts/AuthContext";

export type PeriodType = "week" | "month" | "year";

export interface ReportSession {
  id: string;
  started_at: string;
  ended_at: string | null;
  duration_min: number;
  task_id: string | null;
  task_name: string | null;
  project_id: string | null;
}

export interface ReportProject {
  id: string;
  name: string;
  color: string;
}

export interface ReportData {
  sessions: ReportSession[];
  projects: ReportProject[];
}

export function useUpdateSessionProject() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ sessionId, projectId }: { sessionId: string; projectId: string | null }) => {
      const { error } = await supabase
        .from("pomodoro_sessions")
        .update({ project_id: projectId })
        .eq("id", sessionId)
        .eq("user_id", user!.id);
      if (error) throw error;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["report"] }),
  });
}

// Uses LOCAL time boundaries so the user's "today/this week" is correct
// regardless of their UTC offset.
// started_at is stored as UTC timestamptz, so toISOString() gives the correct UTC comparison.
export function useReportSessions(start: Date, end: Date) {
  const { user } = useAuth();
  return useQuery<ReportData>({
    queryKey: ["report", "sessions", user?.id, start.toISOString(), end.toISOString()],
    queryFn: async () => {
      const [sessRes, projRes] = await Promise.all([
        supabase
          .from("pomodoro_sessions")
          .select("id, started_at, ended_at, duration_min, task_id, task_name, project_id, status")
          .eq("user_id", user!.id)
          .gte("started_at", start.toISOString())
          .lt("started_at", end.toISOString())
          .order("started_at", { ascending: false }),
        supabase
          .from("projects")
          .select("id, name, color")
          .eq("owner_id", user!.id),
      ]);
      if (sessRes.error) {
        console.error("[Report] sessions query error:", sessRes.error);
        throw sessRes.error;
      }
      if (projRes.error) {
        console.error("[Report] projects query error:", projRes.error);
        throw projRes.error;
      }
      return {
        sessions: sessRes.data as ReportSession[],
        projects: projRes.data as ReportProject[],
      };
    },
    enabled: !!user,
    staleTime: 0,
    refetchOnMount: "always",
    refetchInterval: 30_000,
  });
}
