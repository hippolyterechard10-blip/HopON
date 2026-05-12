import { useQuery } from "@tanstack/react-query";

import { supabase } from "@/lib/supabase";
import type { BarnRole } from "@/types/roles";

export type MembershipRow = {
  id: string;
  barn_id: string;
  user_id: string;
  roles: BarnRole[];
  is_active: boolean;
  joined_at: string;
  barn: { id: string; name: string; slug: string } | null;
};

export function useMemberships(userId: string | undefined) {
  return useQuery({
    queryKey: ["memberships", userId],
    enabled: Boolean(userId),
    queryFn: async (): Promise<MembershipRow[]> => {
      const { data, error } = await supabase
        .from("barn_memberships")
        .select("id, barn_id, user_id, roles, is_active, joined_at, barn:barns(id,name,slug)")
        .eq("user_id", userId!)
        .eq("is_active", true);

      if (error) throw error;
      return (data ?? []) as unknown as MembershipRow[];
    },
  });
}
