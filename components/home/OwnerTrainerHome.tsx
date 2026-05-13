import { useRouter } from "expo-router";
import { Pressable, StyleSheet, View } from "react-native";

import { StatusDot } from "@/components/ui/StatusDot";
import { Text } from "@/components/ui/Text";
import { colors } from "@/constants/colors";
import { radii, spacing } from "@/constants/spacing";
import { useBarnMembers } from "@/hooks/useBarnMembers";
import { useBarnMetrics } from "@/hooks/useBarnMetrics";
import { useBarnStore } from "@/stores/barnStore";

import { TrainerHome } from "./TrainerHome";

export function OwnerTrainerHome() {
  return <TrainerHome topStrip={<OwnerStrip />} />;
}

/**
 * Compact owner dashboard surfaced above the TrainerHome content.
 * Money + lessons + team — the three things an owner-trainer wants to
 * read at a glance the moment the app opens.
 */
function OwnerStrip() {
  const router = useRouter();
  const barnId = useBarnStore((s) => s.currentBarnId);
  const { data: metrics } = useBarnMetrics(barnId);
  const { data: members } = useBarnMembers(barnId);

  const revenue = metrics?.revenueMtd ?? 0;
  const lessons = metrics?.lessonsMtd ?? 0;
  const alerts = metrics?.openAlerts ?? 0;
  const teamCount = (members ?? []).length;

  return (
    <Pressable onPress={() => router.push("/(app)/dashboard")} style={styles.card}>
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <StatusDot status={alerts > 0 ? "warn" : "ok"} size={6} />
          <Text variant="eyebrow" color="g200">
            {alerts > 0 ? "BARN NEEDS A MOMENT" : "BARN OK"}
          </Text>
        </View>
        <Text variant="caption" color="g200">
          Dashboard ›
        </Text>
      </View>

      <View style={styles.statsRow}>
        <Stat label="Revenue MTD" value={`$${revenue.toLocaleString()}`} />
        <View style={styles.divider} />
        <Stat label="Lessons MTD" value={String(lessons)} />
        <View style={styles.divider} />
        <Stat label="Team" value={String(teamCount)} />
      </View>
    </Pressable>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <View style={{ flex: 1, alignItems: "center", gap: 2 }}>
      <Text variant="eyebrow" color="g200">
        {label}
      </Text>
      <Text style={styles.statValue}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.g700,
    borderRadius: radii.lg,
    padding: spacing.sm,
    gap: spacing.s,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: spacing.xs,
  },
  headerLeft: { flexDirection: "row", alignItems: "center", gap: spacing.xs },
  statsRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: spacing.xs,
  },
  divider: {
    width: 1,
    height: 32,
    backgroundColor: "rgba(255,255,255,0.12)",
  },
  statValue: {
    fontFamily: "DMSerifDisplay_400Regular_Italic",
    fontSize: 26,
    lineHeight: 30,
    letterSpacing: -0.5,
    color: colors.white,
  },
});
