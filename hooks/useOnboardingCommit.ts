import { useMutation } from "@tanstack/react-query";

import { supabase } from "@/lib/supabase";
import { useAuthStore } from "@/stores/authStore";
import { useBarnStore } from "@/stores/barnStore";
import { useOnboardingStore } from "@/stores/onboardingStore";

/**
 * Commits the in-memory onboarding draft to Supabase in one transaction-like
 * sequence: upsert profile, then create-or-join a barn, then create the
 * barn_membership row. Leaves the local stores hydrated so the app can
 * skip onboarding on next launch.
 */
export function useOnboardingCommit() {
  const setBarn = useBarnStore((s) => s.setBarn);

  return useMutation({
    mutationFn: async () => {
      const user = useAuthStore.getState().user;
      const draft = useOnboardingStore.getState();
      if (!user) throw new Error("Not signed in.");
      if (draft.roles.length === 0) throw new Error("No roles selected.");
      if (!draft.barn) throw new Error("No barn chosen.");

      // 1. Upsert profile (idempotent — RLS scoped to self)
      const profileErr = await supabase.from("profiles").upsert({
        id: user.id,
        full_name: draft.fullName || (user.email ?? "Member"),
        phone: draft.phone || null,
      });
      if (profileErr.error) throw profileErr.error;

      // 2. Resolve target barn
      let barnId: string;
      let barnName: string;
      if (draft.barn.kind === "create") {
        const slug = draft.barn.name
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, "-")
          .replace(/^-|-$/g, "")
          .slice(0, 50) + "-" + Math.random().toString(36).slice(2, 6);

        const { data, error } = await supabase
          .from("barns")
          .insert({
            name: draft.barn.name,
            slug,
            address: draft.barn.address || null,
            timezone: draft.barn.timezone || "America/New_York",
            owner_id: user.id,
          })
          .select("id, name")
          .single();
        if (error || !data) throw error ?? new Error("Could not create barn.");
        barnId = data.id;
        barnName = data.name;
      } else {
        const { data, error } = await supabase
          .from("barn_invites")
          .select("barn_id, roles, barn:barns(id,name)")
          .eq("code", draft.barn.code)
          .is("accepted_at", null)
          .single();
        if (error || !data) throw error ?? new Error("Invalid invite code.");
        const barn = data.barn as unknown as { id: string; name: string } | null;
        if (!barn) throw new Error("Invite refers to a missing barn.");
        barnId = barn.id;
        barnName = barn.name;
      }

      // 3. Create membership
      const { error: mErr } = await supabase.from("barn_memberships").upsert(
        { barn_id: barnId, user_id: user.id, roles: draft.roles, is_active: true },
        { onConflict: "barn_id,user_id" },
      );
      if (mErr) throw mErr;

      // 4. Hydrate local stores
      setBarn({ id: barnId, name: barnName, roles: draft.roles });

      return { barnId, barnName };
    },
  });
}
