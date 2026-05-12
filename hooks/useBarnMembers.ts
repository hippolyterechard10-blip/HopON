import { useQuery } from "@tanstack/react-query";

import { supabase } from "@/lib/supabase";
import type { BarnRole } from "@/types/roles";

export type BarnMember = {
  id: string;
  user_id: string;
  roles: BarnRole[];
  is_active: boolean;
  user: { id: string; full_name: string; avatar_url: string | null } | null;
};

export function useBarnMembers(barnId: string | null | undefined) {
  return useQuery({
    queryKey: ["barnMembers", barnId],
    enabled: Boolean(barnId),
    queryFn: async (): Promise<BarnMember[]> => {
      const { data, error } = await supabase
        .from("barn_memberships")
        .select("id, user_id, roles, is_active, user:profiles(id, full_name, avatar_url)")
        .eq("barn_id", barnId!)
        .eq("is_active", true);
      if (error) throw error;
      return (data ?? []) as unknown as BarnMember[];
    },
  });
}
