import { useQuery } from "@tanstack/react-query";

import { supabase } from "@/lib/supabase";

export type LessonType = {
  id: string;
  name: string;
  duration_minutes: number;
  price_cents: number | null;
  max_riders: number;
  color: string | null;
  is_group: boolean;
};

export function useLessonTypes(barnId: string | null | undefined) {
  return useQuery({
    queryKey: ["lessonTypes", barnId],
    enabled: Boolean(barnId),
    queryFn: async (): Promise<LessonType[]> => {
      const { data, error } = await supabase
        .from("lesson_types")
        .select("id, name, duration_minutes, price_cents, max_riders, color, is_group")
        .eq("barn_id", barnId!)
        .eq("is_active", true)
        .order("price_cents", { nullsFirst: true });
      if (error) throw error;
      return (data ?? []) as LessonType[];
    },
  });
}
