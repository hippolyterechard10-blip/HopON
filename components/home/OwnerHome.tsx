import { ScrollView, StyleSheet, View } from "react-native";

import { AlertBar } from "@/components/ui/AlertBar";
import { Card } from "@/components/ui/Card";
import { StatusDot } from "@/components/ui/StatusDot";
import { Text } from "@/components/ui/Text";
import { colors } from "@/constants/colors";
import { radii, spacing } from "@/constants/spacing";
import { mockAlerts, mockBarn, mockLessons, mockNews } from "@/lib/mockData";

export function OwnerHome() {
  return (
    <ScrollView style={styles.scroll} contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <Text variant="eyebrow" color="ink3">
          {mockBarn.name.toUpperCase()}
        </Text>
        <Text variant="display" color="ink1" style={styles.greeting}>
          Your barn is running well today.
        </Text>
      </View>

      <View style={styles.metrics}>
        <Metric label="Revenue MTD" value={`$${mockBarn.revenueMtd.toLocaleString()}`} delta={`+${mockBarn.revenueDelta}%`} />
        <Metric label="Open alerts" value={String(mockBarn.openAlerts)} tone="warn" />
        <Metric label="Tasks" value={String(mockBarn.teamTodos)} />
        <Metric label="Lessons" value={String(mockBarn.lessonsMtd)} delta={`+${mockBarn.lessonsDelta}%`} />
      </View>

      <Section title="Alerts">
        <View style={{ gap: spacing.s }}>
          {mockAlerts.map((a) => (
            <AlertBar key={a.id} severity={a.severity} title={a.title} subtitle={a.subtitle} />
          ))}
        </View>
      </Section>

      <Section title="Next up · Today">
        <Card padding="none">
          {mockLessons.slice(0, 4).map((l, i) => (
            <View
              key={l.id}
              style={[styles.eventRow, i !== 0 && { borderTopWidth: 1, borderTopColor: colors.border }]}
            >
              <StatusDot status={l.paid ? "ok" : "warn"} />
              <View style={{ flex: 1 }}>
                <Text variant="bodyMedium">{l.client} · {l.horse}</Text>
                <Text variant="caption" color="ink3">
                  {l.location} · {l.discipline}
                </Text>
              </View>
              <Text variant="bodyMedium" color="ink2">
                {l.time}
              </Text>
            </View>
          ))}
        </Card>
      </Section>

      <Section title="Team">
        <View style={styles.teamGrid}>
          <TeamCell label="Grooms active" value="3" />
          <TeamCell label="Lessons done" value="2 of 5" />
          <TeamCell label="Tasks late" value="1" tone="warn" />
        </View>
      </Section>

      <Section title="Hop News">
        <Card padding="none">
          {mockNews.map((n, i) => (
            <View
              key={n.id}
              style={[styles.newsRow, i !== 0 && { borderTopWidth: 1, borderTopColor: colors.border }]}
            >
              <Text variant="caption" color="ink3" style={{ width: 56 }}>
                {n.date}
              </Text>
              <Text variant="body" style={{ flex: 1 }}>
                {n.title}
              </Text>
            </View>
          ))}
        </Card>
      </Section>
    </ScrollView>
  );
}

function Metric({
  label,
  value,
  delta,
  tone = "neutral",
}: {
  label: string;
  value: string;
  delta?: string;
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
      {delta ? (
        <Text variant="caption" color="ok">
          {delta}
        </Text>
      ) : null}
    </Card>
  );
}

function TeamCell({
  label,
  value,
  tone = "neutral",
}: {
  label: string;
  value: string;
  tone?: "neutral" | "warn";
}) {
  return (
    <Card padding="sm" style={styles.teamCell}>
      <Text variant="label" color="ink3">
        {label}
      </Text>
      <Text variant="h2" color={tone === "warn" ? "warn" : "ink1"} style={{ marginTop: 2 }}>
        {value}
      </Text>
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
  section: { gap: spacing.s },
  eventRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
  },
  teamGrid: { flexDirection: "row", gap: spacing.s },
  teamCell: { flex: 1 },
  newsRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
  },
});
