import { useQuery } from "@tanstack/react-query";

import { thisMonthIso } from "@/lib/dateRange";
import { supabase } from "@/lib/supabase";

export type BarnMetrics = {
  revenueMtd: number;
  lessonsMtd: number;
  openAlerts: number;
  teamTodos: number;
};

/**
 * Aggregates a few headline numbers for the Owner home in a single round trip.
 * Counts are issued in parallel; revenue sums on the client because Supabase
 * RPC isn't required for this small a workload.
 */
export function useBarnMetrics(barnId: string | null | undefined) {
  return useQuery({
    queryKey: ["barnMetrics", barnId],
    enabled: Boolean(barnId),
    queryFn: async (): Promise<BarnMetrics> => {
      const { from } = thisMonthIso();

      const [paymentsQ, lessonsQ, tasksQ] = await Promise.all([
        supabase
          .from("payments")
          .select("amount_cents", { count: "exact" })
          .eq("barn_id", barnId!)
          .eq("status", "succeeded")
          .gte("paid_at", from),
        supabase
          .from("lessons")
          .select("id", { count: "exact", head: true })
          .eq("barn_id", barnId!)
          .eq("status", "completed")
          .gte("starts_at", from),
        supabase
          .from("tasks")
          .select("id, status, priority", { count: "exact" })
          .eq("barn_id", barnId!)
          .in("status", ["pending", "in_progress", "delayed"]),
      ]);

      if (paymentsQ.error) throw paymentsQ.error;
      if (lessonsQ.error) throw lessonsQ.error;
      if (tasksQ.error) throw tasksQ.error;

      const revenueCents = (paymentsQ.data ?? []).reduce(
        (sum, row) => sum + (row.amount_cents ?? 0),
        0,
      );
      const openAlerts = (tasksQ.data ?? []).filter(
        (t) => t.priority === "urgent" || t.status === "delayed",
      ).length;

      return {
        revenueMtd: Math.round(revenueCents / 100),
        lessonsMtd: lessonsQ.count ?? 0,
        openAlerts,
        teamTodos: tasksQ.count ?? 0,
      };
    },
  });
}
