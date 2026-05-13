import { useQuery } from "@tanstack/react-query";

import { supabase } from "@/lib/supabase";

export type ChecklistItem = {
  id: "team" | "horse" | "client" | "lesson_type";
  label: string;
  done: boolean;
  path: string;
};

/**
 * Day 3 spec — post-onboarding progress bar on the homepage.
 * Steps: team member · horse · client · lesson type configured.
 * Each step is "done" the moment any row exists for the barn.
 */
export function useOnboardingChecklist(barnId: string | null | undefined) {
  return useQuery({
    queryKey: ["onboardingChecklist", barnId],
    enabled: Boolean(barnId),
    queryFn: async (): Promise<ChecklistItem[]> => {
      const [membersQ, horsesQ, lessonTypesQ] = await Promise.all([
        supabase
          .from("barn_memberships")
          .select("id, roles", { count: "exact", head: true })
          .eq("barn_id", barnId!),
        supabase
          .from("horses")
          .select("id", { count: "exact", head: true })
          .eq("barn_id", barnId!)
          .eq("is_active", true),
        supabase
          .from("lesson_types")
          .select("id, price_cents", { count: "exact", head: true })
          .eq("barn_id", barnId!)
          .eq("is_active", true),
      ]);

      // Team and client counts share the memberships table — query both
      // with explicit filters so we can distinguish.
      const [teamQ, clientQ] = await Promise.all([
        supabase
          .from("barn_memberships")
          .select("id", { count: "exact", head: true })
          .eq("barn_id", barnId!)
          .or("roles.cs.{trainer},roles.cs.{groom},roles.cs.{barn_manager},roles.cs.{secretary}"),
        supabase
          .from("barn_memberships")
          .select("id", { count: "exact", head: true })
          .eq("barn_id", barnId!)
          .or("roles.cs.{client},roles.cs.{parent}"),
      ]);

      const teamDone = (teamQ.count ?? 0) > 0;
      const horseDone = (horsesQ.count ?? 0) > 0;
      const clientDone = (clientQ.count ?? 0) > 0;
      const lessonTypeDone = (lessonTypesQ.count ?? 0) > 0;

      return [
        { id: "team", label: "Add your first team member", done: teamDone, path: "/(app)/settings/team" },
        { id: "horse", label: "Add your first horse", done: horseDone, path: "/(app)/mystable" },
        { id: "client", label: "Add your first client", done: clientDone, path: "/(app)/settings/team" },
        { id: "lesson_type", label: "Edit your lesson type", done: lessonTypeDone, path: "/(app)/settings/barn" },
      ];
    },
  });
}
