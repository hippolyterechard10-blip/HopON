import { Pressable, ScrollView, StyleSheet, View } from "react-native";

import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/EmptyState";
import { Skeleton } from "@/components/ui/Skeleton";
import { StatusDot } from "@/components/ui/StatusDot";
import { Text } from "@/components/ui/Text";
import { colors } from "@/constants/colors";
import { spacing } from "@/constants/spacing";
import { useHorses } from "@/hooks/useHorses";
import { useTodayTasks, useUpdateTaskStatus, type TodayTask } from "@/hooks/useTodayTasks";
import { useBarnStore } from "@/stores/barnStore";

export function GroomHome() {
  const barnId = useBarnStore((s) => s.currentBarnId);
  const tasksQ = useTodayTasks({ barnId, mineOnly: true });
  const horsesQ = useHorses(barnId);
  const update = useUpdateTaskStatus();

  const tasks = tasksQ.data ?? [];
  const urgent = tasks.filter((t) => t.priority === "urgent" && t.status !== "done").length;
  const done = tasks.filter((t) => t.status === "done").length;
  const todo = tasks.length - done;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text variant="eyebrow" color="g200">
          GOOD MORNING
        </Text>
        <View style={styles.headerStats}>
          <HeaderStat label="Tasks" value={String(todo)} />
          <HeaderStat label="Urgent" value={String(urgent)} tone="warn" />
          <HeaderStat label="Done" value={String(done)} tone="ok" />
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.body}>
        <Text variant="eyebrow" color="ink3">
          My tasks today
        </Text>

        {tasksQ.isLoading ? (
          <Card padding="md">
            <Skeleton height={18} />
            <View style={{ height: 8 }} />
            <Skeleton height={18} />
            <View style={{ height: 8 }} />
            <Skeleton height={18} />
          </Card>
        ) : tasks.length === 0 ? (
          <EmptyState
            emoji="✅"
            title="Nothing on your list right now."
            subtitle="Tasks assigned to you will show up here. You can also add a quick one."
          />
        ) : (
          <Card padding="none">
            {tasks.map((t, i) => (
              <TaskRow
                key={t.id}
                task={t}
                first={i === 0}
                onToggle={() =>
                  update.mutate({
                    taskId: t.id,
                    status: t.status === "done" ? "pending" : "done",
                  })
                }
              />
            ))}
            <View style={[styles.taskRow, styles.addRow]}>
              <Text variant="caption" color="ink3">
                + Add quick task
              </Text>
            </View>
          </Card>
        )}

        <View style={styles.quickBar}>
          <Button label="Done" variant="primary" size="sm" fullWidth />
          <Button label="Delayed" variant="secondary" size="sm" fullWidth />
          <Button label="Issue" variant="destructive" size="sm" fullWidth />
          <Button label="Photo" variant="ghost" size="sm" fullWidth />
        </View>

        <Text variant="eyebrow" color="ink3" style={{ marginTop: spacing.s }}>
          Horses at a glance
        </Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.horseStrip}>
          {(horsesQ.data ?? []).map((h) => (
            <Card key={h.id} padding="sm" style={styles.horseCard}>
              <View style={styles.horseTop}>
                <StatusDot status="ok" />
                <Text variant="caption" color="ink3">
                  {h.stall ? `#${h.stall}` : ""}
                </Text>
              </View>
              <Text variant="bodyMedium" style={{ marginTop: spacing.xs }}>
                {h.name}
              </Text>
              <Text variant="caption" color="ink3">
                {h.breed ?? ""}
              </Text>
            </Card>
          ))}
        </ScrollView>
      </ScrollView>
    </View>
  );
}

function TaskRow({
  task,
  first,
  onToggle,
}: {
  task: TodayTask;
  first: boolean;
  onToggle: () => void;
}) {
  const isUrgent = task.priority === "urgent" && task.status !== "done";
  const isDone = task.status === "done";
  const compressed = [
    task.horse?.name?.toUpperCase() ?? "BARN",
    task.title.toUpperCase(),
  ]
    .filter(Boolean)
    .join(" · ");

  return (
    <Pressable
      onPress={onToggle}
      style={[
        styles.taskRow,
        isUrgent && styles.taskUrgent,
        !first && { borderTopWidth: 1, borderTopColor: colors.border },
      ]}
    >
      {isUrgent ? <View style={styles.urgentBar} /> : null}
      <View style={[styles.checkbox, isDone && styles.checkboxDone]}>
        {isDone ? <Text style={{ color: colors.white, fontSize: 12 }}>✓</Text> : null}
      </View>
      <Text
        variant="compressed"
        color={isDone ? "ink3" : "ink1"}
        style={[
          { flex: 1 },
          isDone && { textDecorationLine: "line-through", opacity: 0.5 },
        ]}
      >
        {isUrgent ? "! " : ""}
        {compressed}
      </Text>
    </Pressable>
  );
}

function HeaderStat({
  label,
  value,
  tone = "neutral",
}: {
  label: string;
  value: string;
  tone?: "neutral" | "ok" | "warn";
}) {
  const color = tone === "ok" ? colors.g200 : tone === "warn" ? colors.warnDot : colors.white;
  return (
    <View style={styles.headerStat}>
      <Text variant="eyebrow" color="g200">
        {label}
      </Text>
      <Text style={[styles.headerStatValue, { color }]}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  header: {
    backgroundColor: colors.g800,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
    paddingBottom: spacing.lg,
    gap: spacing.md,
  },
  headerStats: { flexDirection: "row", gap: spacing.lg },
  headerStat: { gap: 2 },
  headerStatValue: {
    fontFamily: "DMSerifDisplay_400Regular_Italic",
    fontSize: 32,
    lineHeight: 36,
    letterSpacing: -0.5,
  },
  body: { padding: spacing.lg, gap: spacing.s, paddingBottom: spacing["3xl"] },
  taskRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    position: "relative",
  },
  taskUrgent: { backgroundColor: colors.warnBg, paddingLeft: spacing.md + 2 },
  urgentBar: {
    position: "absolute",
    left: 0,
    top: 0,
    bottom: 0,
    width: 2.5,
    backgroundColor: colors.alertDot,
  },
  checkbox: {
    width: 18,
    height: 18,
    borderRadius: 4,
    borderWidth: 1.5,
    borderColor: colors.n200,
    alignItems: "center",
    justifyContent: "center",
  },
  checkboxDone: { backgroundColor: colors.ok, borderColor: colors.ok },
  addRow: { borderStyle: "dashed", borderColor: colors.n200, justifyContent: "center" },
  quickBar: { flexDirection: "row", gap: spacing.xs, marginTop: spacing.s },
  horseStrip: { gap: spacing.s, paddingVertical: spacing.s },
  horseCard: { width: 120 },
  horseTop: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
});
