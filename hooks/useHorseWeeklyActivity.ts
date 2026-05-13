import { useQuery } from "@tanstack/react-query";

import { supabase } from "@/lib/supabase";

export type ActivityKind = "lunge" | "flat" | "jump" | "rest" | "show";

export type ActivityItem = {
  id: string;
  starts_at: string;
  ends_at: string | null;
  kind: ActivityKind;
  source: "lesson" | "event";
  status: string | null;
  label: string | null;
};

/**
 * Lessons + calendar events for one horse, scoped to the Mon→Sun week
 * containing `anchor`. Used by the Activity tab on the horse profile.
 */
export function useHorseWeeklyActivity(horseId: string | null | undefined, anchor: Date) {
  const start = mondayOf(anchor);
  const end = new Date(start);
  end.setDate(start.getDate() + 7);

  return useQuery({
    queryKey: ["horseActivity", horseId, start.toISOString()],
    enabled: Boolean(horseId),
    queryFn: async (): Promise<ActivityItem[]> => {
      const [lessonsQ, eventsQ] = await Promise.all([
        supabase
          .from("lessons")
          .select("id, starts_at, ends_at, discipline, status")
          .eq("horse_id", horseId!)
          .gte("starts_at", start.toISOString())
          .lt("starts_at", end.toISOString())
          .order("starts_at"),
        supabase
          .from("calendar_events")
          .select("id, starts_at, ends_at, event_type, title")
          .eq("horse_id", horseId!)
          .gte("starts_at", start.toISOString())
          .lt("starts_at", end.toISOString())
          .order("starts_at"),
      ]);
      if (lessonsQ.error) throw lessonsQ.error;
      if (eventsQ.error) throw eventsQ.error;

      const lessons = (lessonsQ.data ?? []).map(
        (l): ActivityItem => ({
          id: l.id as string,
          starts_at: l.starts_at as string,
          ends_at: (l.ends_at as string | null) ?? null,
          kind: disciplineToKind((l.discipline as string | null) ?? ""),
          source: "lesson",
          status: (l.status as string) ?? null,
          label: (l.discipline as string | null) ?? null,
        }),
      );
      const events = (eventsQ.data ?? []).map(
        (e): ActivityItem => ({
          id: e.id as string,
          starts_at: e.starts_at as string,
          ends_at: (e.ends_at as string | null) ?? null,
          kind: (e.event_type as string) === "show" ? "show" : "rest",
          source: "event",
          status: null,
          label: (e.title as string) ?? null,
        }),
      );
      return [...lessons, ...events].sort((a, b) => a.starts_at.localeCompare(b.starts_at));
    },
  });
}

function mondayOf(d: Date): Date {
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  const day = x.getDay(); // 0=Sun..6=Sat
  const diff = (day + 6) % 7; // shift so Mon=0
  x.setDate(x.getDate() - diff);
  return x;
}

function disciplineToKind(s: string): ActivityKind {
  const v = s.toLowerCase();
  if (v.includes("lunge") || v.includes("longe")) return "lunge";
  if (v.includes("jump") || v.includes("obstacle")) return "jump";
  if (v.includes("flat") || v.includes("dressage")) return "flat";
  if (v.includes("show") || v.includes("concours")) return "show";
  if (v.includes("rest") || v.includes("repos") || v.includes("paddock")) return "rest";
  return "flat";
}
