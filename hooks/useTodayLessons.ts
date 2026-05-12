import { useQuery } from "@tanstack/react-query";

import { todayIso } from "@/lib/dateRange";
import { supabase } from "@/lib/supabase";

export type TodayLesson = {
  id: string;
  starts_at: string;
  ends_at: string;
  location: string | null;
  level: string | null;
  discipline: string | null;
  is_paid: boolean;
  status: string;
  horse: { id: string; name: string; stall: string | null } | null;
  client: { id: string; full_name: string } | null;
  trainer: { id: string; full_name: string } | null;
};

export function useTodayLessons(barnId: string | null | undefined, trainerId?: string) {
  return useQuery({
    queryKey: ["lessons", "today", barnId, trainerId ?? null],
    enabled: Boolean(barnId),
    queryFn: async (): Promise<TodayLesson[]> => {
      const { from, to } = todayIso();
      let q = supabase
        .from("lessons")
        .select(
          "id, starts_at, ends_at, location, level, discipline, is_paid, status, horse:horses(id,name,stall), client:client_id(id,full_name), trainer:trainer_id(id,full_name)",
        )
        .eq("barn_id", barnId!)
        .gte("starts_at", from)
        .lte("starts_at", to)
        .order("starts_at", { ascending: true });

      if (trainerId) q = q.eq("trainer_id", trainerId);

      const { data, error } = await q;
      if (error) throw error;
      return (data ?? []) as unknown as TodayLesson[];
    },
  });
}
