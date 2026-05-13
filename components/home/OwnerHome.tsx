import { useRouter } from "expo-router";
import { Pressable, ScrollView, StyleSheet, View } from "react-native";

import { AlertBar } from "@/components/ui/AlertBar";
import { Card } from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/EmptyState";
import { Skeleton, SkeletonRow } from "@/components/ui/Skeleton";
import { StatusDot } from "@/components/ui/StatusDot";
import { Text } from "@/components/ui/Text";
import { NextDueStrip } from "./NextDueStrip";
import { colors } from "@/constants/colors";
import { spacing } from "@/constants/spacing";
import { useBarnMetrics } from "@/hooks/useBarnMetrics";
import { useBarnNews } from "@/hooks/useBarnNews";
import { useTodayLessons } from "@/hooks/useTodayLessons";
import { useTodayTasks } from "@/hooks/useTodayTasks";
import { formatTime } from "@/lib/dateRange";
import { useBarnStore } from "@/stores/barnStore";

export function OwnerHome() {
  const router = useRouter();
  const barnId = useBarnStore((s) => s.currentBarnId);
  const barnName = useBarnStore((s) => s.currentBarnName);

  const metricsQ = useBarnMetrics(barnId);
  const lessonsQ = useTodayLessons(barnId);
  const tasksQ = useTodayTasks({ barnId });
  const newsQ = useBarnNews(barnId);

  const alerts = (tasksQ.data ?? []).filter(
    (t) => t.priority === "urgent" || t.status === "delayed",
  );

  return (
    <ScrollView style={styles.scroll} contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <Text variant="eyebrow" color="ink3">
          {(barnName ?? "Your barn").toUpperCase()}
        </Text>
        <Text variant="display" color="ink1" style={styles.greeting}>
          {alerts.length > 0
            ? "Your barn needs a moment today."
            : "Your barn is running well today."}
        </Text>
      </View>

      <View style={styles.metrics}>
        {metricsQ.isLoading ? (
          <>
            <MetricSkeleton />
            <MetricSkeleton />
            <MetricSkeleton />
            <MetricSkeleton />
          </>
        ) : (
          <>
            <Pressable onPress={() => router.push("/(app)/dashboard")} style={styles.metricCardWrap}>
              <Metric label="Revenue MTD" value={`$${(metricsQ.data?.revenueMtd ?? 0).toLocaleString()}`} />
            </Pressable>
            <Metric
              label="Open alerts"
              value={String(metricsQ.data?.openAlerts ?? 0)}
              tone={metricsQ.data?.openAlerts ? "warn" : "neutral"}
            />
            <Metric label="Tasks" value={String(metricsQ.data?.teamTodos ?? 0)} />
            <Metric label="Lessons" value={String(metricsQ.data?.lessonsMtd ?? 0)} />
          </>
        )}
      </View>

      <NextDueStrip />

      {alerts.length > 0 ? (
        <Section title="Alerts">
          <View style={{ gap: spacing.s }}>
            {alerts.slice(0, 3).map((a) => (
              <Pressable key={a.id} onPress={() => router.push(`/(app)/tasks/${a.id}` as never)}>
                <AlertBar
                  severity={a.priority === "urgent" ? "alert" : "warn"}
                  title={a.title}
                  subtitle={a.horse ? `Horse: ${a.horse.name}` : undefined}
                />
              </Pressable>
            ))}
          </View>
        </Section>
      ) : null}

      <Section title="Next up · Today">
        {lessonsQ.isLoading ? (
          <Card padding="none">
            <SkeletonRow />
            <SkeletonRow />
          </Card>
        ) : (lessonsQ.data ?? []).length === 0 ? (
          <EmptyState emoji="🐴" title="Nothing on the board." subtitle="Lessons added today will appear here." />
        ) : (
          <Card padding="none">
            {(lessonsQ.data ?? []).slice(0, 5).map((l, i) => (
              <Pressable
                key={l.id}
                onPress={() => router.push(`/(app)/lessons/${l.id}` as never)}
                style={[styles.eventRow, i !== 0 && { borderTopWidth: 1, borderTopColor: colors.border }]}
              >
                <StatusDot status={l.is_paid ? "ok" : "warn"} />
                <View style={{ flex: 1 }}>
                  <Text variant="bodyMedium">
                    {l.client?.full_name ?? "—"} · {l.horse?.name ?? "—"}
                  </Text>
                  <Text variant="caption" color="ink3">
                    {(l.location ?? "Barn")} · {(l.discipline ?? "Lesson")}
                  </Text>
                </View>
                <Text variant="bodyMedium" color="ink2">
                  {formatTime(l.starts_at)}
                </Text>
              </Pressable>
            ))}
          </Card>
        )}
      </Section>

      <Section title="Hop News">
        {newsQ.isLoading ? (
          <Card padding="none">
            <SkeletonRow />
            <SkeletonRow />
          </Card>
        ) : (newsQ.data ?? []).length === 0 ? (
          <EmptyState emoji="📰" title="No news yet." subtitle="Post an update so your team and clients stay in the loop." />
        ) : (
          <Card padding="none">
            {(newsQ.data ?? []).map((n, i) => (
              <View
                key={n.id}
                style={[styles.newsRow, i !== 0 && { borderTopWidth: 1, borderTopColor: colors.border }]}
              >
                <Text variant="caption" color="ink3" style={{ width: 64 }}>
                  {new Date(n.created_at).toLocaleDateString(undefined, { month: "short", day: "numeric" })}
                </Text>
                <Text variant="body" style={{ flex: 1 }}>
                  {n.title}
                </Text>
              </View>
            ))}
          </Card>
        )}
      </Section>
    </ScrollView>
  );
}

function Metric({
  label,
  value,
  tone = "neutral",
}: {
  label: string;
  value: string;
  tone?: "neutral" | "warn";
}) {
  return (
    <Card padding="sm" style={styles.metricCard}>
      <Text variant="label" color="ink3">
        {label}
      </Text>
      <Text variant="h1" color={tone === "warn" ? "warn" : "ink1"} style={{ marginTop: 2 }}>
        {value}
      </Text>
    </Card>
  );
}

function MetricSkeleton() {
  return (
    <Card padding="sm" style={styles.metricCard}>
      <Skeleton width={70} height={10} />
      <View style={{ height: 8 }} />
      <Skeleton width={90} height={20} />
    </Card>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <View style={styles.section}>
      <Text variant="eyebrow" color="ink3">
        {title}
      </Text>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  scroll: { flex: 1, backgroundColor: colors.bg },
  content: { padding: spacing.lg, gap: spacing.lg, paddingBottom: spacing["3xl"] },
  header: { gap: spacing.xs },
  greeting: { letterSpacing: -0.4 },
  metrics: { flexDirection: "row", flexWrap: "wrap", gap: spacing.s },
  metricCard: { flexBasis: "48%", flexGrow: 1 },
  metricCardWrap: { flexBasis: "48%", flexGrow: 1 },
  section: { gap: spacing.s },
  eventRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
  },
  newsRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
  },
});
