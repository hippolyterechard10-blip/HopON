import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { supabase } from "@/lib/supabase";
import { useAuthStore } from "@/stores/authStore";

export type HorseFeedItem = {
  id: string;
  content: string;
  photo_urls: string[];
  update_type: string | null;
  created_at: string;
  author: { id: string; full_name: string } | null;
};

export function useHorseFeed(horseId: string | null | undefined) {
  return useQuery({
    queryKey: ["horseFeed", horseId],
    enabled: Boolean(horseId),
    queryFn: async (): Promise<HorseFeedItem[]> => {
      const { data, error } = await supabase
        .from("horse_updates")
        .select("id, content, photo_urls, update_type, created_at, author:created_by(id,full_name)")
        .eq("horse_id", horseId!)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return (data ?? []) as unknown as HorseFeedItem[];
    },
  });
}

export function usePostHorseUpdate() {
  const queryClient = useQueryClient();
  const userId = useAuthStore((s) => s.user?.id);

  return useMutation({
    mutationFn: async (input: {
      horseId: string;
      barnId: string;
      content: string;
      photoUrls?: string[];
      updateType?: string;
    }) => {
      const { error } = await supabase.from("horse_updates").insert({
        horse_id: input.horseId,
        barn_id: input.barnId,
        created_by: userId ?? null,
        content: input.content,
        photo_urls: input.photoUrls ?? [],
        update_type: input.updateType ?? "general",
      });
      if (error) throw error;
    },
    onSettled: (_d, _e, vars) => {
      queryClient.invalidateQueries({ queryKey: ["horseFeed", vars.horseId] });
    },
  });
}
