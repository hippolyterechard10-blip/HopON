import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { supabase } from "@/lib/supabase";
import { useAuthStore } from "@/stores/authStore";

export type NotificationRow = {
  id: string;
  type: string;
  title: string;
  body: string | null;
  data: Record<string, unknown> | null;
  is_read: boolean;
  sent_at: string;
};

export function useNotifications(limit = 50) {
  const userId = useAuthStore((s) => s.user?.id);

  return useQuery({
    queryKey: ["notifications", userId, limit],
    enabled: Boolean(userId),
    queryFn: async (): Promise<NotificationRow[]> => {
      const { data, error } = await supabase
        .from("notifications")
        .select("id, type, title, body, data, is_read, sent_at")
        .eq("user_id", userId!)
        .order("sent_at", { ascending: false })
        .limit(limit);
      if (error) throw error;
      return (data ?? []) as NotificationRow[];
    },
  });
}

export function useMarkRead() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("notifications").update({ is_read: true }).eq("id", id);
      if (error) throw error;
    },
    onSettled: () => queryClient.invalidateQueries({ queryKey: ["notifications"] }),
  });
}

export function useMarkAllRead() {
  const queryClient = useQueryClient();
  const userId = useAuthStore((s) => s.user?.id);
  return useMutation({
    mutationFn: async () => {
      if (!userId) return;
      const { error } = await supabase
        .from("notifications")
        .update({ is_read: true })
        .eq("user_id", userId)
        .eq("is_read", false);
      if (error) throw error;
    },
    onSettled: () => queryClient.invalidateQueries({ queryKey: ["notifications"] }),
  });
}
