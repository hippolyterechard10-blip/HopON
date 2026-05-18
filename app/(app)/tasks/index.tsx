import { Link, useRouter } from "expo-router";
import { Pressable, ScrollView, StyleSheet, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/EmptyState";
import { SkeletonRow } from "@/components/ui/Skeleton";
import { StatusDot } from "@/components/ui/StatusDot";
import { Text } from "@/components/ui/Text";
import { colors } from "@/constants/colors";
import { spacing } from "@/constants/spacing";
import { useTodayTasks, useUpdateTaskStatus } from "@/hooks/useTodayTasks";
import { useBarnStore } from "@/stores/barnStore";

export default function Tasks() {
  const router = useRouter();
  const barnId = useBarnStore((s) => s.currentBarnId);
  const { data, isLoading } = useTodayTasks({ barnId });
  const update = useUpdateTaskStatus();
  const tasks = data ?? [];

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <View style={styles.header}>
        <View style={{ flex: 1 }}>
          <Text variant="eyebrow" color="ink3">
            TODAY
          </Text>
          <Text variant="display">Tasks.</Text>
        </View>
        <Button label="+ New" variant="primary" size="sm" onPress={() => router.push("/(app)/tasks/new")} />
      </View>

      <ScrollView contentContainerStyle={styles.body}>
        {isLoading ? (
          <Card padding="none">
            <SkeletonRow />
            <SkeletonRow />
            <SkeletonRow />
          </Card>
        ) : tasks.length === 0 ? (
          <EmptyState
            emoji="✨"
            title="All clear."
            subtitle="No tasks on the board today. Add one with the + button."
          />
        ) : (
          <Card padding="none">
            {tasks.map((t, i) => {
              const isDone = t.status === "done";
              const isUrgent = t.priority === "urgent" && !isDone;
              return (
                <Pressable
                  key={t.id}
                  onPress={() => router.push(`/(app)/tasks/${t.id}` as never)}
                  style={[
                    styles.row,
                    i !== 0 && { borderTopWidth: 1, borderTopColor: colors.border },
                    isUrgent && styles.urgent,
                  ]}
                >
                  {isUrgent ? <View style={styles.urgentBar} /> : null}
                  <Pressable
                    onPress={(e) => {
                      e.stopPropagation?.();
                      update.mutate({ taskId: t.id, status: isDone ? "pending" : "done" });
                    }}
                    style={[styles.checkbox, isDone && styles.checkboxDone]}
                  >
                    {isDone ? <Text style={{ color: colors.white, fontSize: 12 }}>✓</Text> : null}
                  </Pressable>
                  <View style={{ flex: 1 }}>
                    <Text
                      variant="bodyMedium"
                      color={isDone ? "ink3" : "ink1"}
                      style={isDone ? { textDecorationLine: "line-through", opacity: 0.5 } : undefined}
                    >
                      {(t.horse?.name ?? "Barn") + " · " + t.title}
                    </Text>
                  </View>
                  <StatusDot status={isUrgent ? "alert" : isDone ? "ok" : "neutral"} />
                </Pressable>
              );
            })}
          </Card>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  header: {
    flexDirection: "row",
    alignItems: "flex-end",
    padding: spacing.lg,
    gap: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    backgroundColor: colors.surface,
  },
  body: { padding: spacing.lg, gap: spacing.s, paddingBottom: spacing["3xl"] },
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    position: "relative",
  },
  urgent: { backgroundColor: colors.warnBg, paddingLeft: spacing.md + 2 },
  urgentBar: {
    position: "absolute",
    left: 0,
    top: 0,
    bottom: 0,
    width: 2.5,
    backgroundColor: colors.alertDot,
  },
  checkbox: {
    width: 22,
    height: 22,
    borderRadius: 6,
    borderWidth: 1.5,
    borderColor: colors.n200,
    alignItems: "center",
    justifyContent: "center",
  },
  checkboxDone: { backgroundColor: colors.ok, borderColor: colors.ok },
});
