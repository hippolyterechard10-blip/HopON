import { useQuery } from "@tanstack/react-query";

import { supabase } from "@/lib/supabase";

export type NextDueKind = "farrier" | "vaccine" | "vermifuge" | "osteo" | "physio" | "dentist";

export type NextDueRow = {
  id: string;
  horse_id: string;
  kind: NextDueKind;
  due_on: string; // YYYY-MM-DD
  notes: string | null;
  horse: { id: string; name: string; stall: string | null } | null;
  /** Computed urgency tier — neutral / warn / alert. */
  urgency: "neutral" | "warn" | "alert";
};

/**
 * Day 3 spec — appear on home 3 weeks before due.
 *   neutral  >2 weeks away
 *   warn     <2 weeks away
 *   alert    <3 days away
 */
export function useNextDue(barnId: string | null | undefined) {
  return useQuery({
    queryKey: ["nextDue", barnId],
    enabled: Boolean(barnId),
    queryFn: async (): Promise<NextDueRow[]> => {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const horizon = new Date(today);
      horizon.setDate(today.getDate() + 21); // 3 weeks

      const { data, error } = await supabase
        .from("next_due_reminders")
        .select("id, horse_id, kind, due_on, notes, horse:horses(id,name,stall)")
        .eq("barn_id", barnId!)
        .is("completed_at", null)
        .lte("due_on", horizon.toISOString().slice(0, 10))
        .order("due_on", { ascending: true });
      if (error) throw error;

      return ((data ?? []) as unknown as Omit<NextDueRow, "urgency">[]).map((r) => {
        const d = new Date(r.due_on);
        d.setHours(0, 0, 0, 0);
        const days = Math.round((d.getTime() - today.getTime()) / 86_400_000);
        const urgency: NextDueRow["urgency"] =
          days < 3 ? "alert" : days < 14 ? "warn" : "neutral";
        return { ...r, urgency };
      });
    },
  });
}
