import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { supabase } from "@/lib/supabase";
import { useAuthStore } from "@/stores/authStore";
import type { BarnRole } from "@/types/roles";

export type Invite = {
  id: string;
  code: string;
  email: string | null;
  roles: BarnRole[];
  expires_at: string | null;
  accepted_at: string | null;
  created_at: string;
};

export function useInvites(barnId: string | null | undefined) {
  return useQuery({
    queryKey: ["invites", barnId],
    enabled: Boolean(barnId),
    queryFn: async (): Promise<Invite[]> => {
      const { data, error } = await supabase
        .from("barn_invites")
        .select("id, code, email, roles, expires_at, accepted_at, created_at")
        .eq("barn_id", barnId!)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return (data ?? []) as Invite[];
    },
  });
}

function newCode(): string {
  const alphabet = "ABCDEFGHJKMNPQRSTUVWXYZ23456789";
  return Array.from({ length: 6 }, () =>
    alphabet[Math.floor(Math.random() * alphabet.length)],
  ).join("");
}

export function useCreateInvite() {
  const queryClient = useQueryClient();
  const userId = useAuthStore((s) => s.user?.id);

  return useMutation({
    mutationFn: async (input: { barnId: string; roles: BarnRole[]; email?: string }) => {
      const code = newCode();
      const expires = new Date(Date.now() + 14 * 24 * 3600 * 1000).toISOString();
      const { data, error } = await supabase
        .from("barn_invites")
        .insert({
          barn_id: input.barnId,
          code,
          email: input.email ?? null,
          roles: input.roles,
          invited_by: userId ?? null,
          expires_at: expires,
        })
        .select()
        .single();
      if (error) throw error;
      return data as Invite;
    },
    onSettled: (_d, _e, vars) => {
      queryClient.invalidateQueries({ queryKey: ["invites", vars.barnId] });
    },
  });
}

export function useRevokeInvite() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("barn_invites").delete().eq("id", id);
      if (error) throw error;
    },
    onSettled: () => queryClient.invalidateQueries({ queryKey: ["invites"] }),
  });
}
