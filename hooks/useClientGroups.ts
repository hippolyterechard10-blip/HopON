import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { supabase } from "@/lib/supabase";

export type ClientGroup = {
  id: string;
  barn_id: string;
  name: string;
  color: string | null;
  created_at: string;
};

export function useClientGroups(barnId: string | null | undefined) {
  return useQuery({
    queryKey: ["clientGroups", barnId],
    enabled: Boolean(barnId),
    queryFn: async (): Promise<ClientGroup[]> => {
      const { data, error } = await supabase
        .from("client_groups")
        .select("*")
        .eq("barn_id", barnId!)
        .order("name");
      if (error) throw error;
      return (data ?? []) as ClientGroup[];
    },
  });
}

export function useCreateClientGroup() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (input: { barnId: string; name: string; color?: string }) => {
      const { error } = await supabase.from("client_groups").insert({
        barn_id: input.barnId,
        name: input.name,
        color: input.color ?? null,
      });
      if (error) throw error;
    },
    onSettled: (_d, _e, vars) => {
      queryClient.invalidateQueries({ queryKey: ["clientGroups", vars.barnId] });
    },
  });
}
