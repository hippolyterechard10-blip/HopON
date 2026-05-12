import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { supabase } from "@/lib/supabase";
import { useAuthStore } from "@/stores/authStore";
import type { Task, TaskPriority, TaskStatus } from "@/types/app.types";

export type TaskUpdate = {
  id: string;
  task_id: string;
  user_id: string | null;
  status: TaskStatus;
  note: string | null;
  photo_url: string | null;
  created_at: string;
  user: { id: string; full_name: string } | null;
};

export function useTask(taskId: string | null | undefined) {
  return useQuery({
    queryKey: ["task", taskId],
    enabled: Boolean(taskId),
    queryFn: async (): Promise<Task | null> => {
      const { data, error } = await supabase
        .from("tasks")
        .select("*")
        .eq("id", taskId!)
        .single();
      if (error) throw error;
      return (data ?? null) as Task | null;
    },
  });
}

export function useTaskUpdates(taskId: string | null | undefined) {
  return useQuery({
    queryKey: ["taskUpdates", taskId],
    enabled: Boolean(taskId),
    queryFn: async (): Promise<TaskUpdate[]> => {
      const { data, error } = await supabase
        .from("task_updates")
        .select("id, task_id, user_id, status, note, photo_url, created_at, user:profiles(id,full_name)")
        .eq("task_id", taskId!)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return (data ?? []) as unknown as TaskUpdate[];
    },
  });
}

type CreateTaskInput = {
  barnId: string;
  horseId: string | null;
  title: string;
  notes?: string;
  assignedTo: string | null;
  priority: TaskPriority;
  dueAt: string | null;
};

export function useCreateTask() {
  const queryClient = useQueryClient();
  const userId = useAuthStore((s) => s.user?.id);

  return useMutation({
    mutationFn: async (input: CreateTaskInput) => {
      const { data, error } = await supabase
        .from("tasks")
        .insert({
          barn_id: input.barnId,
          horse_id: input.horseId,
          title: input.title,
          notes: input.notes ?? null,
          assigned_to: input.assignedTo,
          created_by: userId ?? null,
          priority: input.priority,
          due_at: input.dueAt,
        })
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSettled: (_d, _e, vars) => {
      queryClient.invalidateQueries({ queryKey: ["tasks", "today", vars.barnId] });
    },
  });
}

export function useAddTaskUpdate() {
  const queryClient = useQueryClient();
  const userId = useAuthStore((s) => s.user?.id);

  return useMutation({
    mutationFn: async (input: { taskId: string; status: TaskStatus; note?: string; photoUrl?: string }) => {
      if (!userId) throw new Error("Not signed in.");
      const { error: tErr } = await supabase
        .from("tasks")
        .update({
          status: input.status,
          completed_at: input.status === "done" ? new Date().toISOString() : null,
        })
        .eq("id", input.taskId);
      if (tErr) throw tErr;

      const { error: uErr } = await supabase.from("task_updates").insert({
        task_id: input.taskId,
        user_id: userId,
        status: input.status,
        note: input.note ?? null,
        photo_url: input.photoUrl ?? null,
      });
      if (uErr) throw uErr;
    },
    onSettled: (_d, _e, vars) => {
      queryClient.invalidateQueries({ queryKey: ["task", vars.taskId] });
      queryClient.invalidateQueries({ queryKey: ["taskUpdates", vars.taskId] });
      queryClient.invalidateQueries({ queryKey: ["tasks", "today"] });
    },
  });
}
