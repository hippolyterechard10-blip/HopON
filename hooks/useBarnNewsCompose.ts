import { useMutation, useQueryClient } from "@tanstack/react-query";

import { supabase } from "@/lib/supabase";
import { useAuthStore } from "@/stores/authStore";

export type NewsTagKind = "all" | "team" | "owners" | "group";

export type NewsTag =
  | { kind: "all" }
  | { kind: "team" }
  | { kind: "owners" }
  | { kind: "group"; groupId: string };

export function useComposeBarnNews() {
  const queryClient = useQueryClient();
  const userId = useAuthStore((s) => s.user?.id);

  return useMutation({
    mutationFn: async (input: {
      barnId: string;
      title: string;
      content?: string;
      photoUrls?: string[];
      tags: NewsTag[];
    }) => {
      const { data: news, error: newsErr } = await supabase
        .from("barn_news")
        .insert({
          barn_id: input.barnId,
          author_id: userId ?? null,
          title: input.title,
          content: input.content ?? null,
          photo_urls: input.photoUrls ?? [],
        })
        .select("id")
        .single();
      if (newsErr || !news) throw newsErr ?? new Error("Could not save post.");

      // Tag rows — fan out for each tag picked.
      const tagRows = input.tags.map((t) => ({
        news_id: news.id as string,
        kind: t.kind,
        group_id: t.kind === "group" ? t.groupId : null,
      }));
      if (tagRows.length) {
        const { error: tagErr } = await supabase.from("news_post_tags").insert(tagRows);
        if (tagErr) throw tagErr;
      }
      return { id: news.id as string };
    },
    onSettled: (_d, _e, vars) => {
      queryClient.invalidateQueries({ queryKey: ["barnNews", vars.barnId] });
    },
  });
}
