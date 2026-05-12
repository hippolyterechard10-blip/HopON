import { useQuery } from "@tanstack/react-query";

import { supabase } from "@/lib/supabase";

export type UpcomingItem = {
  id: string;
  starts_at: string;
  ends_at: string | null;
  title: string;
  kind: "lesson" | "event";
  status: string | null;
};

/**
 * Client-side "upcoming" merges their lessons + horse events from now → +14 days.
 */
export function useUpcomingForClient(barnId: string | null | undefined, clientId?: string) {
  return useQuery({
    queryKey: ["upcoming", barnId, clientId],
    enabled: Boolean(barnId && clientId),
    queryFn: async (): Promise<UpcomingItem[]> => {
      const now = new Date().toISOString();
      const future = new Date(Date.now() + 14 * 24 * 3600 * 1000).toISOString();

      const [lessonsQ, eventsQ] = await Promise.all([
        supabase
          .from("lessons")
          .select("id, starts_at, ends_at, level, discipline, status, trainer:trainer_id(full_name)")
          .eq("barn_id", barnId!)
          .eq("client_id", clientId!)
          .gte("starts_at", now)
          .lte("starts_at", future)
          .order("starts_at"),
        supabase
          .from("calendar_events")
          .select("id, starts_at, ends_at, title, event_type")
          .eq("barn_id", barnId!)
          .gte("starts_at", now)
          .lte("starts_at", future)
          .order("starts_at"),
      ]);

      if (lessonsQ.error) throw lessonsQ.error;
      if (eventsQ.error) throw eventsQ.error;

      const lessons = (lessonsQ.data ?? []).map(
        (l): UpcomingItem => ({
          id: l.id as string,
          starts_at: l.starts_at as string,
          ends_at: (l.ends_at as string | null) ?? null,
          title: `Lesson · ${(l.discipline as string | null) ?? ""}`.trim(),
          kind: "lesson",
          status: (l.status as string) ?? null,
        }),
      );

      const events = (eventsQ.data ?? []).map(
        (e): UpcomingItem => ({
          id: e.id as string,
          starts_at: e.starts_at as string,
          ends_at: (e.ends_at as string | null) ?? null,
          title: e.title as string,
          kind: "event",
          status: null,
        }),
      );

      return [...lessons, ...events].sort((a, b) => a.starts_at.localeCompare(b.starts_at));
    },
  });
}
