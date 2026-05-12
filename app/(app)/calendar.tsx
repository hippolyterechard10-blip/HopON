import { ScrollView, StyleSheet, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { EmptyState } from "@/components/ui/EmptyState";
import { Text } from "@/components/ui/Text";
import { colors } from "@/constants/colors";
import { radii, spacing } from "@/constants/spacing";
import { useTodayLessons } from "@/hooks/useTodayLessons";
import { formatTime } from "@/lib/dateRange";
import { useBarnStore } from "@/stores/barnStore";

const HOURS = ["07", "08", "09", "10", "11", "12", "13", "14", "15", "16", "17", "18"];

export default function Calendar() {
  const barnId = useBarnStore((s) => s.currentBarnId);
  const { data, isLoading } = useTodayLessons(barnId);
  const lessons = data ?? [];

  const today = new Date();
  const todayLabel = today.toLocaleDateString(undefined, {
    weekday: "long",
    month: "long",
    day: "numeric",
  });

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <View style={styles.header}>
        <Text variant="eyebrow" color="ink3">
          {todayLabel.toUpperCase()}
        </Text>
        <Text variant="display">Today.</Text>
        <View style={styles.daysRow}>
          {[-1, 0, 1, 2, 3].map((offset) => {
            const d = new Date(today);
            d.setDate(today.getDate() + offset);
            const isToday = offset === 0;
            return (
              <View
                key={offset}
                style={[styles.dayChip, isToday && styles.dayChipActive]}
              >
                <Text variant="caption" color={isToday ? "white" : "ink3"}>
                  {d.toLocaleDateString(undefined, { weekday: "short" })}
                </Text>
                <Text variant="bodyMedium" color={isToday ? "white" : "ink1"}>
                  {d.getDate()}
                </Text>
              </View>
            );
          })}
        </View>
      </View>

      {isLoading ? (
        <View style={{ padding: spacing.lg }}>
          <Text variant="caption" color="ink3">
            Loading…
          </Text>
        </View>
      ) : lessons.length === 0 ? (
        <View style={{ padding: spacing.lg }}>
          <EmptyState
            emoji="🗓️"
            title="No lessons today."
            subtitle="Lessons appear here as they're booked."
          />
        </View>
      ) : (
        <ScrollView contentContainerStyle={styles.timeline}>
          {HOURS.map((h) => {
            const lesson = lessons.find((l) => formatTime(l.starts_at).startsWith(h));
            return (
              <View key={h} style={styles.hourRow}>
                <Text variant="caption" color="ink3" style={styles.hourLabel}>
                  {h}:00
                </Text>
                <View style={styles.hourLine} />
                {lesson ? (
                  <View
                    style={[
                      styles.lessonBlock,
                      !lesson.is_paid && styles.lessonUnpaid,
                    ]}
                  >
                    <Text variant="label" color={lesson.is_paid ? "g600" : "warn"}>
                      {(lesson.discipline ?? "LESSON").toUpperCase()}
                      {!lesson.is_paid ? " · UNPAID" : ""}
                    </Text>
                    <Text variant="bodyMedium" style={{ marginTop: 2 }}>
                      {(lesson.client?.full_name ?? "—")} · {(lesson.horse?.name ?? "—")}
                    </Text>
                    <Text variant="caption" color="ink3">
                      {(lesson.location ?? "Barn")} · {formatTime(lesson.starts_at)}
                    </Text>
                  </View>
                ) : null}
              </View>
            );
          })}
        </ScrollView>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  header: {
    padding: spacing.lg,
    gap: spacing.s,
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  daysRow: { flexDirection: "row", gap: spacing.xs, marginTop: spacing.s },
  dayChip: {
    flex: 1,
    paddingVertical: spacing.s,
    borderRadius: radii.md,
    backgroundColor: colors.n50,
    alignItems: "center",
  },
  dayChipActive: { backgroundColor: colors.g500 },
  timeline: { padding: spacing.lg, paddingBottom: spacing["3xl"] },
  hourRow: {
    flexDirection: "row",
    minHeight: 64,
    position: "relative",
    alignItems: "flex-start",
  },
  hourLabel: { width: 44, paddingTop: 2 },
  hourLine: {
    position: "absolute",
    top: 8,
    left: 56,
    right: 0,
    height: 1,
    backgroundColor: colors.border,
  },
  lessonBlock: {
    marginLeft: 12,
    marginTop: 2,
    flex: 1,
    backgroundColor: colors.g50,
    borderLeftWidth: 3,
    borderLeftColor: colors.g500,
    borderRadius: radii.md,
    padding: spacing.sm,
  },
  lessonUnpaid: {
    backgroundColor: colors.warnBg,
    borderLeftColor: colors.warnDot,
  },
});
