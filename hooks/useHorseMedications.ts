import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { supabase } from "@/lib/supabase";

export type HorseMedication = {
  id: string;
  horse_id: string;
  barn_id: string;
  name: string;
  dosage: string | null;
  times_per_day: number;
  schedule: { morning?: boolean; midday?: boolean; evening?: boolean; night?: boolean } | null;
  notes: string | null;
  is_active: boolean;
  created_at: string;
};

export function useHorseMedications(horseId: string | null | undefined) {
  return useQuery({
    queryKey: ["horseMedications", horseId],
    enabled: Boolean(horseId),
    queryFn: async (): Promise<HorseMedication[]> => {
      const { data, error } = await supabase
        .from("horse_medications")
        .select("*")
        .eq("horse_id", horseId!)
        .eq("is_active", true)
        .order("name");
      if (error) throw error;
      return (data ?? []) as HorseMedication[];
    },
  });
}

export function useAddHorseMedication() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (input: {
      barnId: string;
      horseId: string;
      name: string;
      dosage?: string;
      timesPerDay?: number;
      schedule?: HorseMedication["schedule"];
      notes?: string;
    }) => {
      const { error } = await supabase.from("horse_medications").insert({
        barn_id: input.barnId,
        horse_id: input.horseId,
        name: input.name,
        dosage: input.dosage ?? null,
        times_per_day: input.timesPerDay ?? 1,
        schedule: input.schedule ?? null,
        notes: input.notes ?? null,
      });
      if (error) throw error;
    },
    onSettled: (_d, _e, vars) => {
      queryClient.invalidateQueries({ queryKey: ["horseMedications", vars.horseId] });
    },
  });
}
