import { useQuery } from "@tanstack/react-query";

import { supabase } from "@/lib/supabase";

export type HorsePlanItem = {
  id: string;
  starts_at: string;
  title: string;
  kind: "lesson" | "event";
  status?: string | null;
};

export function useHorsePlanning(horseId: string | null | undefined) {
  return useQuery({
    queryKey: ["horsePlanning", horseId],
    enabled: Boolean(horseId),
    queryFn: async (): Promise<HorsePlanItem[]> => {
      const now = new Date().toISOString();
      const future = new Date(Date.now() + 30 * 24 * 3600 * 1000).toISOString();

      const [lessonsQ, eventsQ] = await Promise.all([
        supabase
          .from("lessons")
          .select("id, starts_at, discipline, level, status, trainer:trainer_id(full_name)")
          .eq("horse_id", horseId!)
          .gte("starts_at", now)
          .lte("starts_at", future)
          .order("starts_at"),
        supabase
          .from("calendar_events")
          .select("id, starts_at, title, event_type")
          .eq("horse_id", horseId!)
          .gte("starts_at", now)
          .lte("starts_at", future)
          .order("starts_at"),
      ]);
      if (lessonsQ.error) throw lessonsQ.error;
      if (eventsQ.error) throw eventsQ.error;

      const lessons = (lessonsQ.data ?? []).map(
        (l): HorsePlanItem => ({
          id: l.id as string,
          starts_at: l.starts_at as string,
          title: `Lesson · ${(l.discipline as string | null) ?? "Flat"}`.trim(),
          kind: "lesson",
          status: (l.status as string) ?? null,
        }),
      );
      const events = (eventsQ.data ?? []).map(
        (e): HorsePlanItem => ({
          id: e.id as string,
          starts_at: e.starts_at as string,
          title: e.title as string,
          kind: "event",
          status: null,
        }),
      );
      return [...lessons, ...events].sort((a, b) => a.starts_at.localeCompare(b.starts_at));
    },
  });
}
