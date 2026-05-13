import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { supabase } from "@/lib/supabase";
import { useAuthStore } from "@/stores/authStore";

export type TreatmentStatus =
  | "requested"
  | "rejected"
  | "validated"
  | "in_progress"
  | "completed"
  | "cancelled";

export type Treatment = {
  id: string;
  horse_id: string;
  barn_id: string;
  title: string;
  notes: string | null;
  status: TreatmentStatus;
  requested_by: string | null;
  validated_by: string | null;
  validated_at: string | null;
  rejection_note: string | null;
  starts_on: string | null;
  ends_on: string | null;
  prescription_id: string | null;
  created_at: string;
};

export function useHorseTreatments(horseId: string | null | undefined) {
  return useQuery({
    queryKey: ["horseTreatments", horseId],
    enabled: Boolean(horseId),
    queryFn: async (): Promise<Treatment[]> => {
      const { data, error } = await supabase
        .from("horse_treatments")
        .select("*")
        .eq("horse_id", horseId!)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return (data ?? []) as Treatment[];
    },
  });
}

export function useRequestTreatment() {
  const queryClient = useQueryClient();
  const userId = useAuthStore((s) => s.user?.id);

  return useMutation({
    mutationFn: async (input: {
      barnId: string;
      horseId: string;
      title: string;
      notes?: string;
      startsOn?: string;
      endsOn?: string;
      prescriptionId?: string;
    }) => {
      const { error } = await supabase.from("horse_treatments").insert({
        barn_id: input.barnId,
        horse_id: input.horseId,
        title: input.title,
        notes: input.notes ?? null,
        status: "requested",
        requested_by: userId ?? null,
        starts_on: input.startsOn ?? null,
        ends_on: input.endsOn ?? null,
        prescription_id: input.prescriptionId ?? null,
      });
      if (error) throw error;
    },
    onSettled: (_d, _e, vars) => {
      queryClient.invalidateQueries({ queryKey: ["horseTreatments", vars.horseId] });
    },
  });
}

export function useValidateTreatment() {
  const queryClient = useQueryClient();
  const userId = useAuthStore((s) => s.user?.id);

  return useMutation({
    mutationFn: async (input: { treatmentId: string; horseId: string; accept: boolean; note?: string }) => {
      const { error } = await supabase
        .from("horse_treatments")
        .update({
          status: input.accept ? "validated" : "rejected",
          validated_by: userId ?? null,
          validated_at: new Date().toISOString(),
          rejection_note: input.accept ? null : input.note ?? null,
        })
        .eq("id", input.treatmentId);
      if (error) throw error;
    },
    onSettled: (_d, _e, vars) => {
      queryClient.invalidateQueries({ queryKey: ["horseTreatments", vars.horseId] });
    },
  });
}
