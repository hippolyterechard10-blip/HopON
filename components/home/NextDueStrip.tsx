import { useRouter } from "expo-router";
import { Pressable, ScrollView, StyleSheet, View } from "react-native";

import { Text } from "@/components/ui/Text";
import { colors } from "@/constants/colors";
import { radii, spacing } from "@/constants/spacing";
import { useNextDue, type NextDueKind, type NextDueRow } from "@/hooks/useNextDue";
import { useBarnStore } from "@/stores/barnStore";

/**
 * Day 3 spec §9 — surfaces on the home 3 weeks before due.
 * Urgency colors: neutral (>2 weeks) → amber (<2 weeks) → terracotta (<3 days).
 * Tap a chip → opens the horse profile (Health tab in a future polish).
 */
export function NextDueStrip() {
  const router = useRouter();
  const barnId = useBarnStore((s) => s.currentBarnId);
  const { data, isLoading } = useNextDue(barnId);
  const items = data ?? [];

  if (isLoading || items.length === 0) return null;

  return (
    <View style={styles.wrap}>
      <Text variant="eyebrow" color="ink3">
        NEXT DUE
      </Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.row}>
        {items.map((it) => (
          <Pressable
            key={it.id}
            onPress={() => router.push(`/horses/${it.horse_id}` as never)}
            style={[styles.chip, chipStyle(it.urgency)]}
          >
            <Text style={styles.emoji}>{kindEmoji(it.kind)}</Text>
            <View style={{ flex: 1 }}>
              <Text variant="label" color={urgencyTextColor(it.urgency)}>
                {it.horse?.name ?? "Horse"} · {it.kind.toUpperCase()}
              </Text>
              <Text variant="caption" color={urgencyTextColor(it.urgency)}>
                {dueLabel(it.due_on)}
              </Text>
            </View>
          </Pressable>
        ))}
      </ScrollView>
    </View>
  );
}

function kindEmoji(k: NextDueKind): string {
  switch (k) {
    case "farrier":
      return "🐴";
    case "vaccine":
      return "💉";
    case "vermifuge":
      return "💊";
    case "osteo":
      return "🦴";
    case "physio":
      return "🏃";
    case "dentist":
      return "🦷";
  }
}

function urgencyTextColor(u: NextDueRow["urgency"]) {
  if (u === "alert") return "alert";
  if (u === "warn") return "warn";
  return "ink2";
}

function chipStyle(u: NextDueRow["urgency"]) {
  if (u === "alert") return { backgroundColor: colors.alertBg, borderColor: colors.alertDot };
  if (u === "warn") return { backgroundColor: colors.warnBg, borderColor: colors.warnDot };
  return { backgroundColor: colors.surface, borderColor: colors.border };
}

function dueLabel(dueOn: string): string {
  const d = new Date(dueOn);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  d.setHours(0, 0, 0, 0);
  const days = Math.round((d.getTime() - today.getTime()) / 86_400_000);
  if (days < 0) return `${Math.abs(days)}d overdue`;
  if (days === 0) return "Due today";
  if (days === 1) return "Due tomorrow";
  if (days < 14) return `In ${days} days`;
  return d.toLocaleDateString(undefined, { month: "short", day: "numeric" });
}

const styles = StyleSheet.create({
  wrap: { gap: spacing.s },
  row: { gap: spacing.s, paddingVertical: 2 },
  chip: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.s,
    paddingVertical: spacing.s,
    paddingHorizontal: spacing.sm,
    borderRadius: radii.md,
    borderWidth: 1,
    minWidth: 200,
  },
  emoji: { fontSize: 20 },
});
