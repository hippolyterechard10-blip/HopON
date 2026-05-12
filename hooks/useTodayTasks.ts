import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";

import { todayIso } from "@/lib/dateRange";
import { supabase } from "@/lib/supabase";
import { useAuthStore } from "@/stores/authStore";
import type { TaskPriority, TaskStatus } from "@/types/app.types";

export type TodayTask = {
  id: string;
  title: string;
  status: TaskStatus;
  priority: TaskPriority;
  due_at: string | null;
  assigned_to: string | null;
  horse: { id: string; name: string } | null;
};

type Options = {
  barnId: string | null | undefined;
  mineOnly?: boolean;
};

export function useTodayTasks({ barnId, mineOnly }: Options) {
  const userId = useAuthStore((s) => s.user?.id);
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ["tasks", "today", barnId, mineOnly ? userId : "all"],
    enabled: Boolean(barnId),
    queryFn: async (): Promise<TodayTask[]> => {
      const { from, to } = todayIso();
      let q = supabase
        .from("tasks")
        .select("id, title, status, priority, due_at, assigned_to, horse:horses(id,name)")
        .eq("barn_id", barnId!)
        .or(`due_at.gte.${from},due_at.is.null`)
        .lte("due_at", to)
        .order("due_at", { ascending: true, nullsFirst: false });

      if (mineOnly && userId) q = q.eq("assigned_to", userId);

      const { data, error } = await q;
      if (error) throw error;
      return (data ?? []) as unknown as TodayTask[];
    },
  });

  // Realtime: refresh on any task change in this barn.
  useEffect(() => {
    if (!barnId) return;
    const channel = supabase
      .channel(`tasks:${barnId}`)
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "tasks", filter: `barn_id=eq.${barnId}` },
        () => {
          queryClient.invalidateQueries({ queryKey: ["tasks", "today", barnId] });
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [barnId, queryClient]);

  return query;
}

/**
 * Optimistic task status change. Used by the swipe / quick-update bar
 * in the groom flow so the row reflects the change instantly.
 */
export function useUpdateTaskStatus() {
  const queryClient = useQueryClient();
  const userId = useAuthStore((s) => s.user?.id);

  return useMutation({
    mutationFn: async (input: { taskId: string; status: TaskStatus; note?: string }) => {
      const { error: taskErr } = await supabase
        .from("tasks")
        .update({
          status: input.status,
          completed_at: input.status === "done" ? new Date().toISOString() : null,
        })
        .eq("id", input.taskId);
      if (taskErr) throw taskErr;

      if (userId) {
        await supabase.from("task_updates").insert({
          task_id: input.taskId,
          user_id: userId,
          status: input.status,
          note: input.note ?? null,
        });
      }
    },
    onMutate: async (input) => {
      await queryClient.cancelQueries({ queryKey: ["tasks", "today"] });
      const previous = queryClient.getQueriesData<TodayTask[]>({ queryKey: ["tasks", "today"] });
      queryClient.setQueriesData<TodayTask[]>(
        { queryKey: ["tasks", "today"] },
        (rows) =>
          rows?.map((r) => (r.id === input.taskId ? { ...r, status: input.status } : r)) ?? rows,
      );
      return { previous };
    },
    onError: (_e, _input, ctx) => {
      ctx?.previous.forEach(([key, data]) => queryClient.setQueryData(key, data));
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["tasks", "today"] });
    },
  });
}
