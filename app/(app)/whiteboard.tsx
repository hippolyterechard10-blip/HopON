import { useMemo, useState } from "react";
import { Pressable, ScrollView, StyleSheet, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";

import { Card } from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/EmptyState";
import { SegmentedControl } from "@/components/ui/SegmentedControl";
import { Skeleton } from "@/components/ui/Skeleton";
import { Text } from "@/components/ui/Text";
import { colors } from "@/constants/colors";
import { radii, spacing } from "@/constants/spacing";
import { useBarnMembers } from "@/hooks/useBarnMembers";
import { useHorses } from "@/hooks/useHorses";
import { useTodayTasks, useUpdateTaskStatus, type TodayTask } from "@/hooks/useTodayTasks";
import { formatTime } from "@/lib/dateRange";
import { useBarnStore } from "@/stores/barnStore";

type GroupBy = "person" | "horse";

export default function Whiteboard() {
  const router = useRouter();
  const barnId = useBarnStore((s) => s.currentBarnId);
  const tasksQ = useTodayTasks({ barnId });
  const horsesQ = useHorses(barnId);
  const membersQ = useBarnMembers(barnId);
  const update = useUpdateTaskStatus();

  const [groupBy, setGroupBy] = useState<GroupBy>("person");

  const groups = useMemo(() => {
    const tasks = tasksQ.data ?? [];
    if (groupBy === "horse") {
      const byHorse = new Map<string, { label: string; tasks: TodayTask[] }>();
      const noHorse: TodayTask[] = [];
      for (const t of tasks) {
        if (!t.horse) {
          noHorse.push(t);
          continue;
        }
        const slot = byHorse.get(t.horse.id) ?? { label: t.horse.name, tasks: [] };
        slot.tasks.push(t);
        byHorse.set(t.horse.id, slot);
      }
      const out = Array.from(byHorse.entries()).map(([id, g]) => ({
        id,
        label: g.label,
        tasks: g.tasks,
      }));
      // Surface horses with no tasks too so the column board is complete
      for (const h of horsesQ.data ?? []) {
        if (!byHorse.has(h.id)) {
          out.push({ id: h.id, label: h.name, tasks: [] });
        }
      }
      if (noHorse.length) out.unshift({ id: "barn", label: "Barn", tasks: noHorse });
      return out;
    }

    // by person
    const byPerson = new Map<string, { label: string; tasks: TodayTask[] }>();
    const unassigned: TodayTask[] = [];
    for (const t of tasks) {
      if (!t.assigned_to) {
        unassigned.push(t);
        continue;
      }
      const slot = byPerson.get(t.assigned_to) ?? { label: "Member", tasks: [] };
      slot.tasks.push(t);
      byPerson.set(t.assigned_to, slot);
    }
    // Hydrate labels from members
    for (const m of membersQ.data ?? []) {
      const slot = byPerson.get(m.user_id);
      if (slot) slot.label = m.user?.full_name ?? "Member";
      else byPerson.set(m.user_id, { label: m.user?.full_name ?? "Member", tasks: [] });
    }
    const out = Array.from(byPerson.entries()).map(([id, g]) => ({
      id,
      label: g.label,
      tasks: g.tasks,
    }));
    if (unassigned.length) out.unshift({ id: "unassigned", label: "Unassigned", tasks: unassigned });
    return out;
  }, [tasksQ.data, horsesQ.data, membersQ.data, groupBy]);

  const today = new Date().toLocaleDateString(undefined, {
    weekday: "long",
    month: "long",
    day: "numeric",
  });

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <View style={styles.header}>
        <View>
          <Text variant="eyebrow" color="ink3">
            {today.toUpperCase()}
          </Text>
          <Text variant="display">Whiteboard.</Text>
        </View>
        <SegmentedControl
          options={[
            { key: "person", label: "By person" },
            { key: "horse", label: "By horse" },
          ]}
          value={groupBy}
          onChange={setGroupBy}
        />
      </View>

      {tasksQ.isLoading ? (
        <View style={styles.body}>
          <Skeleton height={120} />
        </View>
      ) : groups.length === 0 ? (
        <View style={styles.body}>
          <EmptyState
            emoji="📋"
            title="Empty whiteboard."
            subtitle="Add a task with the + button. Or wait — quiet days happen."
          />
        </View>
      ) : (
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.boardRow}>
          {groups.map((g) => (
            <Column
              key={g.id}
              label={g.label}
              tasks={g.tasks}
              onToggle={(t) =>
                update.mutate({ taskId: t.id, status: t.status === "done" ? "pending" : "done" })
              }
              onTaskPress={(t) => router.push(`/(app)/tasks/${t.id}` as never)}
              onAdd={() => router.push("/(app)/tasks/new" as never)}
            />
          ))}
        </ScrollView>
      )}
    </SafeAreaView>
  );
}

function Column({
  label,
  tasks,
  onToggle,
  onTaskPress,
  onAdd,
}: {
  label: string;
  tasks: TodayTask[];
  onToggle: (t: TodayTask) => void;
  onTaskPress: (t: TodayTask) => void;
  onAdd: () => void;
}) {
  const doneCount = tasks.filter((t) => t.status === "done").length;
  const urgentCount = tasks.filter((t) => t.priority === "urgent" && t.status !== "done").length;

  return (
    <View style={styles.column}>
      <View style={styles.columnHead}>
        <Text variant="bodyMedium">{label}</Text>
        <Text variant="caption" color={urgentCount > 0 ? "warn" : "ink3"}>
          {doneCount}/{tasks.length} · {urgentCount}!
        </Text>
      </View>
      <Card padding="none" style={styles.columnBody}>
        {tasks.length === 0 ? (
          <View style={styles.emptyRow}>
            <Text variant="caption" color="ink3">
              Nothing to do
            </Text>
          </View>
        ) : (
          tasks.map((t, i) => (
            <TaskRow
              key={t.id}
              task={t}
              first={i === 0}
              onToggle={() => onToggle(t)}
              onPress={() => onTaskPress(t)}
            />
          ))
        )}
        <Pressable onPress={onAdd} style={[styles.taskRow, styles.addRow]}>
          <Text variant="caption" color="ink3">
            + Add
          </Text>
        </Pressable>
      </Card>
    </View>
  );
}

function TaskRow({
  task,
  first,
  onToggle,
  onPress,
}: {
  task: TodayTask;
  first: boolean;
  onToggle: () => void;
  onPress: () => void;
}) {
  const isDone = task.status === "done";
  const isUrgent = task.priority === "urgent" && !isDone;

  return (
    <Pressable
      onPress={onPress}
      style={[
        styles.taskRow,
        !first && { borderTopWidth: 1, borderTopColor: colors.border },
        isUrgent && styles.urgent,
      ]}
    >
      {isUrgent ? <View style={styles.urgentBar} /> : null}
      <Pressable
        onPress={(e) => {
          e.stopPropagation?.();
          onToggle();
        }}
        style={[styles.checkbox, isDone && styles.checkboxDone]}
      >
        {isDone ? <Text style={{ color: colors.white, fontSize: 10 }}>✓</Text> : null}
      </Pressable>
      <View style={{ flex: 1 }}>
        <Text
          variant="compressed"
          color={isDone ? "ink3" : "ink1"}
          numberOfLines={1}
          style={isDone ? { textDecorationLine: "line-through", opacity: 0.5 } : undefined}
        >
          {isUrgent ? "! " : ""}
          {(task.horse?.name?.toUpperCase() ?? "BARN") + " · " + task.title.toUpperCase()}
        </Text>
        {task.due_at ? (
          <Text variant="caption" color="ink3">
            {formatTime(task.due_at)}
          </Text>
        ) : null}
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  header: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
    paddingBottom: spacing.md,
    gap: spacing.md,
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  body: { padding: spacing.lg },
  boardRow: {
    padding: spacing.lg,
    gap: spacing.s,
  },
  column: {
    width: 260,
    gap: spacing.s,
  },
  columnHead: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: spacing.xs,
  },
  columnBody: {},
  emptyRow: { padding: spacing.md, alignItems: "center" },
  taskRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.s,
    paddingVertical: spacing.s,
    paddingHorizontal: spacing.sm,
    position: "relative",
  },
  urgent: { backgroundColor: colors.warnBg, paddingLeft: spacing.sm + 2 },
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
  addRow: {
    borderStyle: "dashed",
    justifyContent: "center",
    borderTopWidth: 1,
    borderTopColor: colors.n200,
  },
});
