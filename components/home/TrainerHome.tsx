import { ScrollView, StyleSheet, View } from "react-native";

import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { StatusDot } from "@/components/ui/StatusDot";
import { Tag } from "@/components/ui/Tag";
import { Text } from "@/components/ui/Text";
import { colors } from "@/constants/colors";
import { radii, spacing } from "@/constants/spacing";
import { mockHorses, mockLessons } from "@/lib/mockData";

type Props = {
  /** Header strip slot (used by OwnerTrainerHome to show the barn strip). */
  topStrip?: React.ReactNode;
};

export function TrainerHome({ topStrip }: Props) {
  const next = mockLessons[0];
  if (!next) return null;
  const rest = mockLessons.slice(1, 4);

  return (
    <ScrollView style={styles.scroll} contentContainerStyle={styles.content}>
      {topStrip}

      <View style={styles.greeting}>
        <Text variant="eyebrow" color="ink3">
          THURSDAY · MAY 13
        </Text>
        <Text variant="display" color="ink1">
          Good morning, Sam.
        </Text>
      </View>

      <Card variant="dark" padding="lg">
        <Text variant="eyebrow" color="g200">
          NEXT LESSON
        </Text>
        <Text style={styles.bigTime}>{next.time}</Text>
        <View style={styles.lessonMeta}>
          <View style={styles.avatar}>
            <Text variant="bodyMedium" color="g700">
              {next.horse[0]}
            </Text>
          </View>
          <View style={{ flex: 1 }}>
            <Text variant="bodyMedium" color="white">
              {next.client} · {next.horse}
            </Text>
            <Text variant="caption" color="g200">
              {next.location}
            </Text>
          </View>
        </View>
        <View style={styles.tagRow}>
          <Tag label={next.level} tone="brand" />
          <Tag label={next.discipline} tone="brand" />
          <Tag label={next.paid ? "Paid" : "Unpaid"} tone={next.paid ? "ok" : "warn"} />
        </View>
        <View style={styles.heroActions}>
          <Button label="Start lesson" variant="primary" size="md" fullWidth />
          <Button label="Running late" variant="secondary" size="md" fullWidth />
        </View>
      </Card>

      <Section title="Today's schedule">
        <Card padding="none">
          {rest.map((l, i) => (
            <View
              key={l.id}
              style={[styles.row, i !== 0 && { borderTopWidth: 1, borderTopColor: colors.border }]}
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

      <View style={styles.twoCol}>
        <View style={{ flex: 1, gap: spacing.s }}>
          <Text variant="eyebrow" color="ink3">
            Horses
          </Text>
          <Card padding="sm">
            {mockHorses.slice(0, 3).map((h) => (
              <View key={h.id} style={styles.miniRow}>
                <StatusDot status={h.status} />
                <Text variant="body" style={{ flex: 1 }}>
                  {h.name}
                </Text>
                <Text variant="caption" color="ink3">
                  #{h.stall}
                </Text>
              </View>
            ))}
          </Card>
        </View>
        <View style={{ flex: 1, gap: spacing.s }}>
          <Text variant="eyebrow" color="ink3">
            Clients
          </Text>
          <Card padding="sm">
            <View style={styles.miniRow}>
              <StatusDot status="ok" />
              <Text variant="body" style={{ flex: 1 }}>
                Emma C.
              </Text>
              <Text variant="caption" color="ink3">
                Paid
              </Text>
            </View>
            <View style={styles.miniRow}>
              <StatusDot status="ok" />
              <Text variant="body" style={{ flex: 1 }}>
                Sofia R.
              </Text>
              <Text variant="caption" color="ink3">
                Paid
              </Text>
            </View>
            <View style={styles.miniRow}>
              <StatusDot status="warn" />
              <Text variant="body" style={{ flex: 1 }}>
                Mateo B.
              </Text>
              <Text variant="caption" color="warn">
                Due
              </Text>
            </View>
          </Card>
        </View>
      </View>

      <View style={styles.quickActions}>
        {(["Add lesson", "Move lesson", "Charge", "Message"] as const).map((a) => (
          <Card key={a} padding="sm" style={styles.quickAction}>
            <Text variant="label" color="ink2">
              {a}
            </Text>
          </Card>
        ))}
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
  quickActions: { flexDirection: "row", gap: spacing.s, flexWrap: "wrap" },
  quickAction: { flexBasis: "48%", flexGrow: 1, alignItems: "center" },
});
