import { useQuery } from "@tanstack/react-query";

import { supabase } from "@/lib/supabase";
import type { Horse } from "@/types/app.types";

export type HorseSummary = {
  id: string;
  name: string;
  breed: string | null;
  age: number | null;
  stall: string | null;
  photo_url: string | null;
  owner_id: string | null;
};

export function useHorses(barnId: string | null | undefined) {
  return useQuery({
    queryKey: ["horses", barnId],
    enabled: Boolean(barnId),
    queryFn: async (): Promise<HorseSummary[]> => {
      const { data, error } = await supabase
        .from("horses")
        .select("id, name, breed, age, stall, photo_url, owner_id")
        .eq("barn_id", barnId!)
        .eq("is_active", true)
        .order("name");
      if (error) throw error;
      return (data ?? []) as HorseSummary[];
    },
  });
}

export function useHorse(horseId: string | null | undefined) {
  return useQuery({
    queryKey: ["horse", horseId],
    enabled: Boolean(horseId),
    queryFn: async (): Promise<Horse | null> => {
      const { data, error } = await supabase
        .from("horses")
        .select("*")
        .eq("id", horseId!)
        .single();
      if (error) throw error;
      return (data ?? null) as Horse | null;
    },
  });
}
