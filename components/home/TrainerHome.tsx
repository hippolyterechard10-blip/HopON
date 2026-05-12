import { useRouter } from "expo-router";
import { Pressable, ScrollView, StyleSheet, View } from "react-native";

import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/EmptyState";
import { SkeletonRow } from "@/components/ui/Skeleton";
import { StatusDot } from "@/components/ui/StatusDot";
import { Tag } from "@/components/ui/Tag";
import { Text } from "@/components/ui/Text";
import { colors } from "@/constants/colors";
import { spacing } from "@/constants/spacing";
import { useHorses } from "@/hooks/useHorses";
import { useTodayLessons } from "@/hooks/useTodayLessons";
import { formatTime } from "@/lib/dateRange";
import { useAuthStore } from "@/stores/authStore";
import { useBarnStore } from "@/stores/barnStore";

type Props = {
  topStrip?: React.ReactNode;
};

export function TrainerHome({ topStrip }: Props) {
  const router = useRouter();
  const barnId = useBarnStore((s) => s.currentBarnId);
  const userId = useAuthStore((s) => s.user?.id);
  const lessonsQ = useTodayLessons(barnId, userId);
  const horsesQ = useHorses(barnId);

  const lessons = lessonsQ.data ?? [];
  const next = lessons[0];
  const rest = lessons.slice(1, 4);
  const horses = (horsesQ.data ?? []).slice(0, 3);

  const today = new Date().toLocaleDateString(undefined, {
    weekday: "long",
    month: "long",
    day: "numeric",
  });

  return (
    <ScrollView style={styles.scroll} contentContainerStyle={styles.content}>
      {topStrip}

      <View style={styles.greeting}>
        <Text variant="eyebrow" color="ink3">
          {today.toUpperCase()}
        </Text>
        <Text variant="display" color="ink1">
          Good morning.
        </Text>
      </View>

      {lessonsQ.isLoading ? (
        <Card variant="dark" padding="lg">
          <SkeletonRow />
        </Card>
      ) : !next ? (
        <Card variant="dark" padding="lg">
          <Text variant="eyebrow" color="g200">
            NEXT LESSON
          </Text>
          <Text variant="h2" color="white" style={{ marginTop: spacing.s }}>
            Nothing on the schedule today.
          </Text>
          <Text variant="caption" color="g200" style={{ marginTop: spacing.xs }}>
            Add a lesson to fill the day.
          </Text>
        </Card>
      ) : (
        <Card variant="dark" padding="lg">
          <Text variant="eyebrow" color="g200">
            NEXT LESSON
          </Text>
          <Text style={styles.bigTime}>{formatTime(next.starts_at)}</Text>
          <View style={styles.lessonMeta}>
            <View style={styles.avatar}>
              <Text variant="bodyMedium" color="g700">
                {next.horse?.name?.[0] ?? "H"}
              </Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text variant="bodyMedium" color="white">
                {next.client?.full_name ?? "—"} · {next.horse?.name ?? "—"}
              </Text>
              <Text variant="caption" color="g200">
                {next.location ?? "Barn"}
              </Text>
            </View>
          </View>
          <View style={styles.tagRow}>
            {next.level ? <Tag label={next.level} tone="brand" /> : null}
            {next.discipline ? <Tag label={next.discipline} tone="brand" /> : null}
            <Tag label={next.is_paid ? "Paid" : "Unpaid"} tone={next.is_paid ? "ok" : "warn"} />
          </View>
          <View style={styles.heroActions}>
            <Button
              label="Start lesson"
              variant="primary"
              size="md"
              fullWidth
              onPress={() => router.push(`/(app)/lessons/${next.id}` as never)}
            />
            <Button label="Running late" variant="secondary" size="md" fullWidth />
          </View>
        </Card>
      )}

      <Section title="Today's schedule">
        {lessonsQ.isLoading ? (
          <Card padding="none">
            <SkeletonRow />
            <SkeletonRow />
          </Card>
        ) : rest.length === 0 ? (
          <EmptyState emoji="🗓️" title="Open afternoon." subtitle="Either a quiet day or time to book another." />
        ) : (
          <Card padding="none">
            {rest.map((l, i) => (
              <Pressable
                key={l.id}
                onPress={() => router.push(`/(app)/lessons/${l.id}` as never)}
                style={[styles.row, i !== 0 && { borderTopWidth: 1, borderTopColor: colors.border }]}
              >
                <StatusDot status={l.is_paid ? "ok" : "warn"} />
                <View style={{ flex: 1 }}>
                  <Text variant="bodyMedium">
                    {l.client?.full_name ?? "—"} · {l.horse?.name ?? "—"}
                  </Text>
                  <Text variant="caption" color="ink3">
                    {(l.location ?? "Barn")} · {l.discipline ?? "Lesson"}
                  </Text>
                </View>
                <Text variant="bodyMedium" color="ink2">
                  {formatTime(l.starts_at)}
                </Text>
              </View>
            ))}
          </Card>
        )}
      </Section>

      <View style={styles.twoCol}>
        <View style={{ flex: 1, gap: spacing.s }}>
          <Text variant="eyebrow" color="ink3">
            Horses
          </Text>
          <Card padding="sm">
            {horses.length === 0 ? (
              <Text variant="caption" color="ink3">
                No horses yet.
              </Text>
            ) : (
              horses.map((h) => (
                <View key={h.id} style={styles.miniRow}>
                  <StatusDot status="ok" />
                  <Text variant="body" style={{ flex: 1 }}>
                    {h.name}
                  </Text>
                  <Text variant="caption" color="ink3">
                    {h.stall ? `#${h.stall}` : ""}
                  </Text>
                </View>
              ))
            )}
          </Card>
        </View>
        <View style={{ flex: 1, gap: spacing.s }}>
          <Text variant="eyebrow" color="ink3">
            Clients
          </Text>
          <Card padding="sm">
            <Text variant="caption" color="ink3">
              Detail view lands next wave.
            </Text>
          </Card>
        </View>
      </View>
    </ScrollView>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <View style={{ gap: spacing.s }}>
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
  greeting: { gap: spacing.xs },
  bigTime: {
    fontFamily: "DMSerifDisplay_400Regular_Italic",
    fontSize: 56,
    color: colors.white,
    letterSpacing: -1,
    marginTop: spacing.xs,
  },
  lessonMeta: { flexDirection: "row", alignItems: "center", gap: spacing.sm, marginTop: spacing.sm },
  avatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.g200,
    alignItems: "center",
    justifyContent: "center",
  },
  tagRow: { flexDirection: "row", gap: spacing.xs, marginTop: spacing.sm, flexWrap: "wrap" },
  heroActions: { flexDirection: "row", gap: spacing.s, marginTop: spacing.md },
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
  },
  twoCol: { flexDirection: "row", gap: spacing.s },
  miniRow: { flexDirection: "row", alignItems: "center", gap: spacing.s, paddingVertical: 6 },
});
