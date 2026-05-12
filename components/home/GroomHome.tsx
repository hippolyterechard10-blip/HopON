import { ScrollView, StyleSheet, View } from "react-native";

import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { StatusDot } from "@/components/ui/StatusDot";
import { Text } from "@/components/ui/Text";
import { colors } from "@/constants/colors";
import { radii, spacing } from "@/constants/spacing";
import { mockHorses, mockTasks } from "@/lib/mockData";

export function GroomHome() {
  const urgent = mockTasks.filter((t) => t.status === "urgent").length;
  const done = mockTasks.filter((t) => t.status === "done").length;
  const todo = mockTasks.length - done;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text variant="eyebrow" color="g200">
          GOOD MORNING, JESS
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

        <Card padding="none">
          {mockTasks.map((t, i) => (
            <View
              key={t.id}
              style={[
                styles.taskRow,
                t.status === "urgent" && styles.taskUrgent,
                i !== 0 && { borderTopWidth: 1, borderTopColor: colors.border },
              ]}
            >
              {t.status === "urgent" ? <View style={styles.urgentBar} /> : null}
              <View style={[styles.checkbox, t.status === "done" && styles.checkboxDone]}>
                {t.status === "done" ? (
                  <Text style={{ color: colors.white, fontSize: 12 }}>✓</Text>
                ) : null}
              </View>
              <Text
                variant="compressed"
                color={t.status === "done" ? "ink3" : "ink1"}
                style={[
                  { flex: 1 },
                  t.status === "done" && { textDecorationLine: "line-through", opacity: 0.5 },
                ]}
              >
                {t.status === "urgent" ? "! " : ""}
                {t.horse} · {t.type} · {t.time}
              </Text>
            </View>
          ))}
          <View style={[styles.taskRow, styles.addRow]}>
            <Text variant="caption" color="ink3">
              + Add quick task
            </Text>
          </View>
        </Card>

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
          {mockHorses.map((h) => (
            <Card key={h.id} padding="sm" style={styles.horseCard}>
              <View style={styles.horseTop}>
                <StatusDot status={h.status} />
                <Text variant="caption" color="ink3">
                  #{h.stall}
                </Text>
              </View>
              <Text variant="bodyMedium" style={{ marginTop: spacing.xs }}>
                {h.name}
              </Text>
              <Text variant="caption" color="ink3">
                {h.breed}
              </Text>
            </Card>
          ))}
        </ScrollView>
      </ScrollView>
    </View>
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
