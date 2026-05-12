import { useState } from "react";
import { Pressable, ScrollView, StyleSheet, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Tag } from "@/components/ui/Tag";
import { Text } from "@/components/ui/Text";
import { colors } from "@/constants/colors";
import { radii, spacing } from "@/constants/spacing";

const LESSON_TYPES = [
  { id: "private", name: "Private lesson", duration: 60, price: 120 },
  { id: "group", name: "Group lesson", duration: 60, price: 75 },
  { id: "jump", name: "Jump training", duration: 90, price: 180 },
];

const SLOTS = [
  { day: "Today", time: "09:00", available: true },
  { day: "Today", time: "10:30", available: false },
  { day: "Today", time: "14:00", available: true },
  { day: "Today", time: "16:30", available: true },
  { day: "Fri", time: "09:00", available: true },
  { day: "Fri", time: "10:30", available: true },
  { day: "Fri", time: "14:00", available: false },
  { day: "Sat", time: "08:30", available: true },
];

export default function Booking() {
  const [typeId, setTypeId] = useState("private");
  const [slotIdx, setSlotIdx] = useState<number | null>(2);

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <ScrollView contentContainerStyle={styles.body}>
        <View>
          <Text variant="eyebrow" color="ink3">
            BOOK A LESSON
          </Text>
          <Text variant="display">Pick a lesson type.</Text>
        </View>

        <View style={{ gap: spacing.s }}>
          {LESSON_TYPES.map((t) => {
            const selected = typeId === t.id;
            return (
              <Pressable
                key={t.id}
                onPress={() => setTypeId(t.id)}
                style={[styles.typeCard, selected && styles.typeCardSelected]}
              >
                <View style={{ flex: 1 }}>
                  <Text variant="bodyMedium" color={selected ? "white" : "ink1"}>
                    {t.name}
                  </Text>
                  <Text variant="caption" color={selected ? "g100" : "ink3"}>
                    {t.duration} min
                  </Text>
                </View>
                <Text variant="h3" color={selected ? "white" : "ink1"}>
                  ${t.price}
                </Text>
              </Pressable>
            );
          })}
        </View>

        <View>
          <Text variant="eyebrow" color="ink3" style={{ marginBottom: spacing.s }}>
            AVAILABLE SLOTS
          </Text>
          <View style={styles.slots}>
            {SLOTS.map((s, i) => {
              const selected = slotIdx === i;
              return (
                <Pressable
                  key={`${s.day}-${s.time}`}
                  disabled={!s.available}
                  onPress={() => setSlotIdx(i)}
                  style={[
                    styles.slot,
                    selected && styles.slotSelected,
                    !s.available && styles.slotDisabled,
                  ]}
                >
                  <Text
                    variant="eyebrow"
                    color={selected ? "white" : !s.available ? "ink3" : "ink2"}
                  >
                    {s.day}
                  </Text>
                  <Text
                    variant="bodyMedium"
                    color={selected ? "white" : !s.available ? "ink3" : "ink1"}
                  >
                    {s.time}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        </View>

        <Card padding="md">
          <Text variant="eyebrow" color="ink3">
            YOUR HORSE
          </Text>
          <View style={styles.horseRow}>
            <View style={styles.avatar}>
              <Text variant="bodyMedium" color="g700">
                B
              </Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text variant="bodyMedium">Bella</Text>
              <Text variant="caption" color="ink3">
                Hanoverian · Stall #12
              </Text>
            </View>
            <Tag label="DEFAULT" tone="neutral" />
          </View>
        </Card>
      </ScrollView>

      <View style={styles.footer}>
        <View style={styles.priceRow}>
          <Text variant="caption" color="ink3">
            Prepay with Apple Pay
          </Text>
          <Text variant="h2">$120</Text>
        </View>
        <Button label="Confirm booking" variant="primary" size="lg" fullWidth />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  body: { padding: spacing.lg, gap: spacing.lg, paddingBottom: spacing["2xl"] },
  typeCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    padding: spacing.md,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radii.lg,
  },
  typeCardSelected: { backgroundColor: colors.g500, borderColor: colors.g500 },
  slots: { flexDirection: "row", flexWrap: "wrap", gap: spacing.s },
  slot: {
    flexBasis: "23%",
    flexGrow: 1,
    paddingVertical: spacing.s,
    paddingHorizontal: spacing.sm,
    borderRadius: radii.md,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: "center",
    gap: 2,
  },
  slotSelected: { backgroundColor: colors.g500, borderColor: colors.g500 },
  slotDisabled: { backgroundColor: colors.n50, borderColor: colors.n100 },
  horseRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    marginTop: spacing.s,
  },
  avatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.g100,
    alignItems: "center",
    justifyContent: "center",
  },
  footer: {
    padding: spacing.lg,
    backgroundColor: colors.surface,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    gap: spacing.sm,
  },
  priceRow: { flexDirection: "row", alignItems: "baseline", justifyContent: "space-between" },
});
