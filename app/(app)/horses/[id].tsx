import { useLocalSearchParams } from "expo-router";
import { useState } from "react";
import { Pressable, ScrollView, StyleSheet, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { Card } from "@/components/ui/Card";
import { Tag } from "@/components/ui/Tag";
import { Text } from "@/components/ui/Text";
import { colors } from "@/constants/colors";
import { radii, spacing } from "@/constants/spacing";
import { mockHorses } from "@/lib/mockData";

type Tab = "info" | "feed" | "planning";

export default function HorseDetail() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const horse = mockHorses.find((h) => h.id === id) ?? mockHorses[0];
  const [tab, setTab] = useState<Tab>("info");

  if (!horse) return null;

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <ScrollView>
        <View style={styles.hero}>
          <View style={styles.heroOverlay}>
            <Text variant="eyebrow" color="g200">
              STALL #{horse.stall}
            </Text>
            <Text style={styles.heroName}>{horse.name}</Text>
            <Text variant="caption" color="g200">
              {horse.breed} · {horse.age}y
            </Text>
          </View>
        </View>

        <View style={styles.tabs}>
          {(["info", "feed", "planning"] as const).map((t) => (
            <Pressable key={t} onPress={() => setTab(t)} style={styles.tab}>
              <Text variant="bodyMedium" color={tab === t ? "ink1" : "ink3"}>
                {t === "info" ? "Info" : t === "feed" ? "Feed" : "Planning"}
              </Text>
              {tab === t ? <View style={styles.tabUnderline} /> : null}
            </Pressable>
          ))}
        </View>

        <View style={styles.body}>
          {tab === "info" ? <InfoTab horse={horse} /> : null}
          {tab === "feed" ? <FeedTab /> : null}
          {tab === "planning" ? <PlanningTab /> : null}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function InfoTab({ horse }: { horse: (typeof mockHorses)[number] }) {
  return (
    <View style={{ gap: spacing.md }}>
      <Field label="Stall" value={`#${horse.stall}`} />
      <Field label="Breed" value={horse.breed} />
      <Field label="Age" value={`${horse.age} years`} />
      <Field label="Feeding" value="Morning + evening hay, beet pulp PM." />
      <Field label="Medication" value="None at the moment." />
      <Field label="Equipment" value="Saddle: jumping (Antares). Bit: D-ring snaffle." />
      <Field label="Vet" value="Dr. Torres · (561) 555-0124" />
      <Field label="Farrier" value="Mike Garcia · (561) 555-0177" />
    </View>
  );
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <Card padding="md">
      <Text variant="eyebrow" color="ink3">
        {label}
      </Text>
      <Text variant="body" style={{ marginTop: 4 }}>
        {value}
      </Text>
    </Card>
  );
}

function FeedTab() {
  const items = [
    { time: "1h ago", author: "Jess (Groom)", text: "Bella had a calm hack — went well." },
    { time: "Today 07:30", author: "Sam (Trainer)", text: "Lesson scheduled at 09:00." },
    { time: "Yesterday", author: "Dr. Torres", text: "Routine checkup — all good." },
    { time: "May 10", author: "Mike (Farrier)", text: "New shoes on front. Next visit June 7." },
  ];
  return (
    <View style={{ gap: spacing.s }}>
      {items.map((i, idx) => (
        <Card key={idx} padding="md">
          <View style={styles.feedHead}>
            <Text variant="eyebrow" color="ink3">
              {i.time}
            </Text>
            <Text variant="caption" color="ink2">
              · {i.author}
            </Text>
          </View>
          <Text variant="body" style={{ marginTop: 6 }}>
            {i.text}
          </Text>
        </Card>
      ))}
    </View>
  );
}

function PlanningTab() {
  const items = [
    { day: "Today", time: "09:00", title: "Lesson with Sam", tag: "Confirmed", tone: "ok" as const },
    { day: "Fri", time: "11:00", title: "Farrier — Mike", tag: "Scheduled", tone: "neutral" as const },
    { day: "Sat", time: "08:30", title: "Lesson with Sam", tag: "Confirmed", tone: "ok" as const },
    { day: "May 24", time: "All day", title: "Wellington Show", tag: "Registered", tone: "brand" as const },
  ];
  return (
    <Card padding="none">
      {items.map((i, idx) => (
        <View
          key={idx}
          style={[styles.planRow, idx !== 0 && { borderTopWidth: 1, borderTopColor: colors.border }]}
        >
          <View style={{ width: 60 }}>
            <Text variant="eyebrow" color="ink3">
              {i.day}
            </Text>
            <Text variant="bodyMedium">{i.time}</Text>
          </View>
          <Text variant="body" style={{ flex: 1 }}>
            {i.title}
          </Text>
          <Tag label={i.tag} tone={i.tone} />
        </View>
      ))}
    </Card>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  hero: {
    height: 220,
    backgroundColor: colors.g500,
    justifyContent: "flex-end",
  },
  heroOverlay: { padding: spacing.lg, gap: 2 },
  heroName: {
    fontFamily: "DMSerifDisplay_400Regular_Italic",
    fontSize: 44,
    color: colors.white,
    letterSpacing: -0.5,
  },
  tabs: {
    flexDirection: "row",
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  tab: {
    flex: 1,
    paddingVertical: spacing.md,
    alignItems: "center",
    position: "relative",
  },
  tabUnderline: {
    position: "absolute",
    bottom: 0,
    left: "30%",
    right: "30%",
    height: 2,
    backgroundColor: colors.g500,
  },
  body: { padding: spacing.lg, gap: spacing.md, paddingBottom: spacing["3xl"] },
  feedHead: { flexDirection: "row", alignItems: "center", gap: spacing.xs },
  planRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    padding: spacing.md,
  },
});
