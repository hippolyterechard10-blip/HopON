import { useLocalSearchParams, useRouter } from "expo-router";
import { useState } from "react";
import { ActivityIndicator, ScrollView, StyleSheet, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/EmptyState";
import { Input } from "@/components/ui/Input";
import { Tag } from "@/components/ui/Tag";
import { Text } from "@/components/ui/Text";
import { colors } from "@/constants/colors";
import { radii, spacing } from "@/constants/spacing";
import { useAddTaskUpdate, useTask, useTaskUpdates } from "@/hooks/useTask";
import { formatTime } from "@/lib/dateRange";
import { uploadImage } from "@/lib/storage";
import type { TaskStatus } from "@/types/app.types";

export default function TaskDetail() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { data: task, isLoading } = useTask(id);
  const updatesQ = useTaskUpdates(id);
  const addUpdate = useAddTaskUpdate();

  const [note, setNote] = useState("");

  if (isLoading) {
    return (
      <SafeAreaView style={[styles.container, styles.loading]} edges={["top"]}>
        <ActivityIndicator color={colors.g500} />
      </SafeAreaView>
    );
  }
  if (!task) {
    return (
      <SafeAreaView style={styles.container} edges={["top"]}>
        <View style={{ padding: spacing.lg }}>
          <EmptyState emoji="🧐" title="Task not found." />
        </View>
      </SafeAreaView>
    );
  }

  const post = async (status: TaskStatus, withPhoto = false) => {
    let photoUrl: string | undefined;
    if (withPhoto) {
      try {
        const { launchCameraAsync, MediaTypeOptions, requestCameraPermissionsAsync } =
          await import("expo-image-picker");
        const perm = await requestCameraPermissionsAsync();
        if (perm.granted) {
          const res = await launchCameraAsync({ mediaTypes: MediaTypeOptions.Images, quality: 0.7 });
          if (!res.canceled && res.assets[0]) {
            const url = await uploadImage(
              "task-photos",
              res.assets[0].uri,
              `${task.id}/${Date.now()}.jpg`,
            );
            if (url) photoUrl = url;
          }
        }
      } catch (_e) {
        // ignore — keep posting the status change without a photo
      }
    }
    await addUpdate.mutateAsync({ taskId: task.id, status, note: note || undefined, photoUrl });
    setNote("");
  };

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <ScrollView contentContainerStyle={styles.body}>
        <Text variant="eyebrow" color="ink3">
          TASK · {task.priority.toUpperCase()}
        </Text>
        <Text variant="display">{task.title}</Text>
        <View style={styles.tagRow}>
          <Tag label={task.status} tone={task.status === "done" ? "ok" : task.status === "issue" ? "alert" : "neutral"} />
          {task.due_at ? <Tag label={`Due ${formatTime(task.due_at)}`} tone="brand" /> : null}
        </View>

        {task.notes ? (
          <Card padding="md">
            <Text variant="eyebrow" color="ink3">
              NOTES
            </Text>
            <Text variant="body" style={{ marginTop: 6 }}>
              {task.notes}
            </Text>
          </Card>
        ) : null}

        <View style={styles.actionsRow}>
          <Button label="Done" variant="primary" size="md" fullWidth onPress={() => post("done")} />
          <Button label="Delayed" variant="secondary" size="md" fullWidth onPress={() => post("delayed")} />
        </View>
        <View style={styles.actionsRow}>
          <Button label="Issue" variant="destructive" size="md" fullWidth onPress={() => post("issue")} />
          <Button label="+ Photo" variant="ghost" size="md" fullWidth onPress={() => post(task.status, true)} />
        </View>

        <Input
          label="Add a note (optional)"
          value={note}
          onChangeText={setNote}
          placeholder="What happened?"
          multiline
        />

        <Text variant="eyebrow" color="ink3" style={{ marginTop: spacing.s }}>
          HISTORY
        </Text>
        {updatesQ.isLoading ? (
          <Text variant="caption" color="ink3">
            Loading…
          </Text>
        ) : (updatesQ.data ?? []).length === 0 ? (
          <EmptyState emoji="📭" title="No updates yet." />
        ) : (
          <Card padding="none">
            {(updatesQ.data ?? []).map((u, i) => (
              <View
                key={u.id}
                style={[styles.histRow, i !== 0 && { borderTopWidth: 1, borderTopColor: colors.border }]}
              >
                <View style={{ flex: 1 }}>
                  <Text variant="bodyMedium">
                    {u.user?.full_name ?? "Member"} marked as {u.status}.
                  </Text>
                  {u.note ? (
                    <Text variant="caption" color="ink2" style={{ marginTop: 2 }}>
                      "{u.note}"
                    </Text>
                  ) : null}
                  <Text variant="caption" color="ink3" style={{ marginTop: 2 }}>
                    {new Date(u.created_at).toLocaleString()}
                  </Text>
                </View>
              </View>
            ))}
          </Card>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  loading: { justifyContent: "center", alignItems: "center" },
  body: { padding: spacing.lg, gap: spacing.s, paddingBottom: spacing["3xl"] },
  tagRow: { flexDirection: "row", gap: spacing.xs, marginVertical: spacing.s },
  actionsRow: { flexDirection: "row", gap: spacing.s },
  histRow: { padding: spacing.md },
});
