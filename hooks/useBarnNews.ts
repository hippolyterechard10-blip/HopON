import { useQuery } from "@tanstack/react-query";

import { supabase } from "@/lib/supabase";

export type BarnNewsItem = {
  id: string;
  title: string;
  content: string | null;
  created_at: string;
  author: { id: string; full_name: string } | null;
};

export function useBarnNews(barnId: string | null | undefined, limit = 5) {
  return useQuery({
    queryKey: ["barnNews", barnId, limit],
    enabled: Boolean(barnId),
    queryFn: async (): Promise<BarnNewsItem[]> => {
      const { data, error } = await supabase
        .from("barn_news")
        .select("id, title, content, created_at, author:author_id(id,full_name)")
        .eq("barn_id", barnId!)
        .order("created_at", { ascending: false })
        .limit(limit);
      if (error) throw error;
      return (data ?? []) as unknown as BarnNewsItem[];
    },
  });
}
