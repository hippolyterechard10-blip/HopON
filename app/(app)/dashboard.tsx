import { ScrollView, StyleSheet, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { Card } from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/EmptyState";
import { Skeleton, SkeletonRow } from "@/components/ui/Skeleton";
import { StatusDot } from "@/components/ui/StatusDot";
import { Tag } from "@/components/ui/Tag";
import { Text } from "@/components/ui/Text";
import { colors } from "@/constants/colors";
import { spacing } from "@/constants/spacing";
import { useBarnMetrics } from "@/hooks/useBarnMetrics";
import { useRecentPayments } from "@/hooks/useRecentPayments";
import { useBarnStore } from "@/stores/barnStore";

export default function Dashboard() {
  const barnId = useBarnStore((s) => s.currentBarnId);
  const barnName = useBarnStore((s) => s.currentBarnName);
  const metricsQ = useBarnMetrics(barnId);
  const paymentsQ = useRecentPayments(barnId);

  const succeeded = (paymentsQ.data ?? []).filter((p) => p.status === "succeeded").length;
  const pending = (paymentsQ.data ?? []).filter((p) => p.status === "pending").length;

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <ScrollView contentContainerStyle={styles.body}>
        <View>
          <Text variant="eyebrow" color="ink3">
            {(barnName ?? "Your barn").toUpperCase()} · DASHBOARD
          </Text>
          <Text variant="display">This month.</Text>
        </View>

        {metricsQ.isLoading ? (
          <Skeleton height={120} />
        ) : (
          <View style={styles.bigCard}>
            <Text variant="eyebrow" color="g200">
              REVENUE MTD
            </Text>
            <Text style={styles.bigRevenue}>
              ${(metricsQ.data?.revenueMtd ?? 0).toLocaleString()}
            </Text>
            <View style={styles.bigStats}>
              <Stat label="Lessons" value={String(metricsQ.data?.lessonsMtd ?? 0)} />
              <Stat label="Tasks" value={String(metricsQ.data?.teamTodos ?? 0)} />
              <Stat label="Alerts" value={String(metricsQ.data?.openAlerts ?? 0)} tone="warn" />
            </View>
          </View>
        )}

        <View style={styles.metricGrid}>
          <Card padding="sm" style={styles.metricCard}>
            <Text variant="label" color="ink3">
              SUCCEEDED PAYMENTS
            </Text>
            <Text variant="h1" style={{ marginTop: 2 }}>
              {succeeded}
            </Text>
          </Card>
          <Card padding="sm" style={styles.metricCard}>
            <Text variant="label" color="ink3">
              PENDING
            </Text>
            <Text variant="h1" color={pending > 0 ? "warn" : "ink1"} style={{ marginTop: 2 }}>
              {pending}
            </Text>
          </Card>
        </View>

        <Text variant="eyebrow" color="ink3" style={{ marginTop: spacing.s }}>
          RECENT PAYMENTS
        </Text>
        {paymentsQ.isLoading ? (
          <Card padding="none">
            <SkeletonRow />
            <SkeletonRow />
            <SkeletonRow />
          </Card>
        ) : (paymentsQ.data ?? []).length === 0 ? (
          <EmptyState
            emoji="💳"
            title="No payments yet."
            subtitle="Lesson prepayments and manual charges land here."
          />
        ) : (
          <Card padding="none">
            {(paymentsQ.data ?? []).map((p, i) => {
              const tone =
                p.status === "succeeded" ? "ok" : p.status === "failed" ? "alert" : "neutral";
              return (
                <View
                  key={p.id}
                  style={[styles.row, i !== 0 && { borderTopWidth: 1, borderTopColor: colors.border }]}
                >
                  <StatusDot status={p.status === "succeeded" ? "ok" : p.status === "failed" ? "alert" : "warn"} />
                  <View style={{ flex: 1 }}>
                    <Text variant="bodyMedium">
                      {p.payer?.full_name ?? "—"}
                      {p.lesson?.horse?.name ? ` · ${p.lesson.horse.name}` : ""}
                    </Text>
                    <Text variant="caption" color="ink3">
                      {new Date(p.paid_at ?? p.created_at).toLocaleString()}
                    </Text>
                  </View>
                  <Text variant="bodyMedium">${Math.round(p.amount_cents / 100)}</Text>
                  <Tag label={p.status} tone={tone} />
                </View>
              );
            })}
          </Card>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

function Stat({
  label,
  value,
  tone,
}: {
  label: string;
  value: string;
  tone?: "warn";
}) {
  return (
    <View style={{ alignItems: "center", gap: 2 }}>
      <Text variant="eyebrow" color="g200">
        {label}
      </Text>
      <Text style={{
        fontFamily: "DMSerifDisplay_400Regular_Italic",
        fontSize: 26,
        color: tone === "warn" ? colors.warnDot : colors.white,
      }}>
        {value}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  body: { padding: spacing.lg, gap: spacing.lg, paddingBottom: spacing["3xl"] },
  bigCard: {
    backgroundColor: colors.g700,
    borderRadius: 20,
    padding: spacing.lg,
    gap: spacing.s,
  },
  bigRevenue: {
    fontFamily: "DMSerifDisplay_400Regular_Italic",
    fontSize: 56,
    color: colors.white,
    letterSpacing: -1,
  },
  bigStats: { flexDirection: "row", justifyContent: "space-around", marginTop: spacing.s },
  metricGrid: { flexDirection: "row", gap: spacing.s },
  metricCard: { flex: 1 },
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    padding: spacing.md,
  },
});
