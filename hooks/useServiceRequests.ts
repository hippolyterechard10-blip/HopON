import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { supabase } from "@/lib/supabase";
import { useAuthStore } from "@/stores/authStore";

export type ServiceRequestStatus = "pending" | "confirmed" | "completed" | "cancelled";

export type ServiceRequest = {
  id: string;
  barn_id: string;
  horse_id: string | null;
  requested_by: string | null;
  assigned_to: string | null;
  service_type: string;
  description: string | null;
  status: ServiceRequestStatus;
  scheduled_at: string | null;
  price_cents: number | null;
  is_billable: boolean;
  completed_at: string | null;
  created_at: string;
  horse?: { id: string; name: string; stall: string | null } | null;
};

export function useServiceRequests(barnId: string | null | undefined) {
  return useQuery({
    queryKey: ["serviceRequests", barnId],
    enabled: Boolean(barnId),
    queryFn: async (): Promise<ServiceRequest[]> => {
      const { data, error } = await supabase
        .from("service_requests")
        .select("*, horse:horses(id,name,stall)")
        .eq("barn_id", barnId!)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return (data ?? []) as unknown as ServiceRequest[];
    },
  });
}

export function useCreateServiceRequest() {
  const queryClient = useQueryClient();
  const userId = useAuthStore((s) => s.user?.id);

  return useMutation({
    mutationFn: async (input: {
      barnId: string;
      horseId: string | null;
      serviceType: string;
      description?: string;
      scheduledAt?: string;
      priceCents?: number;
    }) => {
      const { error } = await supabase.from("service_requests").insert({
        barn_id: input.barnId,
        horse_id: input.horseId,
        service_type: input.serviceType,
        description: input.description ?? null,
        requested_by: userId ?? null,
        scheduled_at: input.scheduledAt ?? null,
        price_cents: input.priceCents ?? null,
        status: "pending",
      });
      if (error) throw error;
    },
    onSettled: (_d, _e, vars) => {
      queryClient.invalidateQueries({ queryKey: ["serviceRequests", vars.barnId] });
    },
  });
}

export function useUpdateServiceRequestStatus() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (input: { id: string; status: ServiceRequestStatus }) => {
      const updates: Record<string, unknown> = { status: input.status };
      if (input.status === "completed") updates.completed_at = new Date().toISOString();
      const { error } = await supabase.from("service_requests").update(updates).eq("id", input.id);
      if (error) throw error;
    },
    onSettled: () => queryClient.invalidateQueries({ queryKey: ["serviceRequests"] }),
  });
}
