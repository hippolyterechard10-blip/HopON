import { useQuery } from "@tanstack/react-query";

import { supabase } from "@/lib/supabase";

export type AvailableSlot = {
  startsAt: string;     // ISO
  endsAt: string;       // ISO
  available: boolean;
  reason?: "booked" | "past";
};

/**
 * MVP slot generator: walks the next `days` days × `hours` slots and marks any
 * slot that overlaps an existing scheduled/confirmed lesson as unavailable.
 * Real availability (trainer working hours, arena capacity) lands in a later
 * iteration via a SQL function.
 */
export function useAvailableSlots(
  barnId: string | null | undefined,
  durationMin: number,
  days = 7,
  hours: number[] = [9, 10, 11, 14, 15, 16],
) {
  return useQuery({
    queryKey: ["availableSlots", barnId, durationMin, days, hours.join(",")],
    enabled: Boolean(barnId),
    queryFn: async (): Promise<AvailableSlot[]> => {
      const start = new Date();
      start.setHours(0, 0, 0, 0);
      const end = new Date(start);
      end.setDate(start.getDate() + days);

      const { data: booked, error } = await supabase
        .from("lessons")
        .select("starts_at, ends_at, status")
        .eq("barn_id", barnId!)
        .in("status", ["scheduled", "confirmed", "in_progress"])
        .gte("starts_at", start.toISOString())
        .lte("starts_at", end.toISOString());
      if (error) throw error;

      const slots: AvailableSlot[] = [];
      const now = Date.now();

      for (let d = 0; d < days; d++) {
        const day = new Date(start);
        day.setDate(start.getDate() + d);
        for (const h of hours) {
          const s = new Date(day);
          s.setHours(h, 0, 0, 0);
          const e = new Date(s);
          e.setMinutes(s.getMinutes() + durationMin);
          const isPast = s.getTime() < now;
          const overlaps = (booked ?? []).some((b) => {
            const bs = new Date(b.starts_at as string).getTime();
            const be = new Date(b.ends_at as string).getTime();
            return bs < e.getTime() && be > s.getTime();
          });
          slots.push({
            startsAt: s.toISOString(),
            endsAt: e.toISOString(),
            available: !isPast && !overlaps,
            reason: isPast ? "past" : overlaps ? "booked" : undefined,
          });
        }
      }
      return slots;
    },
  });
}
