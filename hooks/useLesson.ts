import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { supabase } from "@/lib/supabase";
import type { Lesson, LessonStatus } from "@/types/app.types";

export type LessonDetail = Lesson & {
  horse: { id: string; name: string; stall: string | null; photo_url: string | null } | null;
  client: { id: string; full_name: string; avatar_url: string | null } | null;
  trainer: { id: string; full_name: string; avatar_url: string | null } | null;
  lesson_type: { id: string; name: string; duration_minutes: number; price_cents: number | null } | null;
};

export function useLesson(lessonId: string | null | undefined) {
  return useQuery({
    queryKey: ["lesson", lessonId],
    enabled: Boolean(lessonId),
    queryFn: async (): Promise<LessonDetail | null> => {
      const { data, error } = await supabase
        .from("lessons")
        .select(
          "*, horse:horses(id,name,stall,photo_url), client:client_id(id,full_name,avatar_url), trainer:trainer_id(id,full_name,avatar_url), lesson_type:lesson_types(id,name,duration_minutes,price_cents)",
        )
        .eq("id", lessonId!)
        .single();
      if (error) throw error;
      return (data ?? null) as unknown as LessonDetail | null;
    },
  });
}

export function useUpdateLessonStatus() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (input: { lessonId: string; status: LessonStatus; reason?: string }) => {
      const updates: Record<string, unknown> = { status: input.status };
      if (input.status === "cancelled_client" || input.status === "cancelled_trainer") {
        updates.cancelled_at = new Date().toISOString();
        updates.cancellation_reason = input.reason ?? null;
      }
      const { error } = await supabase.from("lessons").update(updates).eq("id", input.lessonId);
      if (error) throw error;
    },
    onSettled: (_d, _e, vars) => {
      queryClient.invalidateQueries({ queryKey: ["lesson", vars.lessonId] });
      queryClient.invalidateQueries({ queryKey: ["lessons"] });
    },
  });
}
