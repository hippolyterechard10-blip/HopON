import { ScrollView, StyleSheet, View } from "react-native";

import { AlertBar } from "@/components/ui/AlertBar";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Tag } from "@/components/ui/Tag";
import { Text } from "@/components/ui/Text";
import { colors } from "@/constants/colors";
import { radii, spacing } from "@/constants/spacing";
import { mockClient } from "@/lib/mockData";

export function ClientHome() {
  return (
    <ScrollView style={styles.scroll} contentContainerStyle={styles.content}>
      <View style={styles.heroPhoto}>
        <View style={styles.heroOverlay}>
          <Text variant="eyebrow" color="g200">
            MY HORSE
          </Text>
          <Text style={styles.heroName}>{mockClient.myHorse.name}</Text>
          <Text variant="caption" color="g200">
            {mockClient.myHorse.breed} · {mockClient.myHorse.age}y · Stall #{mockClient.myHorse.stall}
          </Text>
        </View>
      </View>

      <View style={styles.statRow}>
        <MiniStat label="Health" value="Good" />
        <MiniStat label="Last care" value="1h ago" />
        <MiniStat label="Next show" value="May 24" />
      </View>

      <Card variant="dark" padding="lg" style={styles.bookCard}>
        <View style={{ flex: 1 }}>
          <Text variant="eyebrow" color="g200">
            BOOK A LESSON
          </Text>
          <Text variant="h2" color="white" style={{ marginTop: 2 }}>
            Your next ride is one tap away.
          </Text>
        </View>
        <Button label="Book" variant="secondary" size="md" />
      </Card>

      <Section title="Upcoming">
        <Card padding="none">
          {mockClient.upcoming.map((u, i) => (
            <View
              key={u.id}
              style={[styles.row, i !== 0 && { borderTopWidth: 1, borderTopColor: colors.border }]}
            >
              <View style={styles.dayCol}>
                <Text variant="eyebrow" color="ink3">
                  {u.day}
                </Text>
                <Text variant="bodyMedium">{u.time}</Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text variant="bodyMedium">{u.title}</Text>
                <Text variant="caption" color="ink3">
                  {u.status}
                </Text>
              </View>
              <Tag label={u.status} tone={u.status === "Confirmed" ? "ok" : "neutral"} />
            </View>
          ))}
        </Card>
      </Section>

      <AlertBar
        severity="warn"
        title={`Invoice — $${mockClient.invoice.amount}`}
        subtitle={`Due in ${mockClient.invoice.dueIn}`}
        right={<Button label="Pay" variant="primary" size="sm" />}
      />

      <Section title="From the barn">
        <Card padding="none">
          {mockClient.feed.map((f, i) => (
            <View
              key={f.id}
              style={[styles.feedRow, i !== 0 && { borderTopWidth: 1, borderTopColor: colors.border }]}
            >
              <Text variant="caption" color="ink3" style={{ width: 80 }}>
                {f.time}
              </Text>
              <Text variant="body" style={{ flex: 1 }}>
                {f.text}
              </Text>
            </View>
          ))}
        </Card>
      </Section>
    </ScrollView>
  );
}

function MiniStat({ label, value }: { label: string; value: string }) {
  return (
    <Card padding="sm" style={{ flex: 1 }}>
      <Text variant="label" color="ink3">
        {label}
      </Text>
      <Text variant="h3" style={{ marginTop: 2 }}>
        {value}
      </Text>
    </Card>
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
  heroPhoto: {
    height: 200,
    borderRadius: 20,
    backgroundColor: colors.g300,
    justifyContent: "flex-end",
    overflow: "hidden",
  },
  heroOverlay: { padding: spacing.lg, gap: 2 },
  heroName: {
    fontFamily: "DMSerifDisplay_400Regular_Italic",
    fontSize: 40,
    color: colors.white,
    letterSpacing: -0.5,
  },
  statRow: { flexDirection: "row", gap: spacing.s },
  bookCard: { flexDirection: "row", alignItems: "center", gap: spacing.sm },
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    padding: spacing.md,
  },
  dayCol: { width: 56 },
  feedRow: { flexDirection: "row", padding: spacing.md, gap: spacing.s },
});
