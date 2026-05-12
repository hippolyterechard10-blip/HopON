import { ScrollView, StyleSheet, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { Text } from "@/components/ui/Text";
import { colors } from "@/constants/colors";
import { radii, spacing } from "@/constants/spacing";
import { mockLessons } from "@/lib/mockData";

const HOURS = ["07", "08", "09", "10", "11", "12", "13", "14", "15", "16", "17", "18"];

export default function Calendar() {
  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <View style={styles.header}>
        <Text variant="eyebrow" color="ink3">
          THURSDAY · MAY 13
        </Text>
        <Text variant="display">Today.</Text>
        <View style={styles.daysRow}>
          {["Wed", "Thu", "Fri", "Sat", "Sun"].map((d, i) => (
            <View key={d} style={[styles.dayChip, i === 1 && styles.dayChipActive]}>
              <Text variant="caption" color={i === 1 ? "white" : "ink3"}>
                {d}
              </Text>
              <Text variant="bodyMedium" color={i === 1 ? "white" : "ink1"}>
                {12 + i}
              </Text>
            </View>
          ))}
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.timeline}>
        {HOURS.map((h) => {
          const lesson = mockLessons.find((l) => l.time.startsWith(h));
          return (
            <View key={h} style={styles.hourRow}>
              <Text variant="caption" color="ink3" style={styles.hourLabel}>
                {h}:00
              </Text>
              <View style={styles.hourLine} />
              {lesson ? (
                <View style={styles.lessonBlock}>
                  <Text variant="label" color="g600">
                    {lesson.discipline.toUpperCase()}
                  </Text>
                  <Text variant="bodyMedium" style={{ marginTop: 2 }}>
                    {lesson.client} · {lesson.horse}
                  </Text>
                  <Text variant="caption" color="ink3">
                    {lesson.location} · {lesson.time}
                  </Text>
                </View>
              ) : null}
            </View>
          );
        })}
      </ScrollView>
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
});
