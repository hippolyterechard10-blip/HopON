import { useRouter } from "expo-router";
import { useMemo, useState } from "react";
import { Alert, Pressable, ScrollView, StyleSheet, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/EmptyState";
import { Skeleton } from "@/components/ui/Skeleton";
import { Tag } from "@/components/ui/Tag";
import { Text } from "@/components/ui/Text";
import { colors } from "@/constants/colors";
import { radii, spacing } from "@/constants/spacing";
import { useAvailableSlots } from "@/hooks/useAvailableSlots";
import { useBookLesson } from "@/hooks/useBookLesson";
import { useHorses } from "@/hooks/useHorses";
import { useLessonTypes } from "@/hooks/useLessonTypes";
import { formatDayLabel, formatTime } from "@/lib/dateRange";
import { useAuthStore } from "@/stores/authStore";
import { useBarnStore } from "@/stores/barnStore";

export default function Booking() {
  const router = useRouter();
  const barnId = useBarnStore((s) => s.currentBarnId);
  const userId = useAuthStore((s) => s.user?.id);

  const typesQ = useLessonTypes(barnId);
  const horsesQ = useHorses(barnId);

  const [typeId, setTypeId] = useState<string | null>(null);
  const selected = useMemo(
    () => (typesQ.data ?? []).find((t) => t.id === typeId) ?? typesQ.data?.[0],
    [typesQ.data, typeId],
  );

  const slotsQ = useAvailableSlots(barnId, selected?.duration_minutes ?? 60);
  const [slotIdx, setSlotIdx] = useState<number | null>(null);

  const myHorses = (horsesQ.data ?? []).filter((h) => h.owner_id === userId);
  const [horseId, setHorseId] = useState<string | null>(null);
  const chosenHorse = horseId ? myHorses.find((h) => h.id === horseId) ?? null : myHorses[0] ?? null;

  const book = useBookLesson();

  const onConfirm = async () => {
    if (!barnId || !selected || slotIdx === null) return;
    const slot = (slotsQ.data ?? [])[slotIdx];
    if (!slot || !slot.available) return;

    try {
      await book.mutateAsync({
        barnId,
        lessonTypeId: selected.id,
        horseId: chosenHorse?.id ?? null,
        trainerId: null,
        startsAt: slot.startsAt,
        endsAt: slot.endsAt,
        priceCents: selected.price_cents ?? 0,
      });
      router.replace("/(app)");
      Alert.alert("Booked", "We saved it to your calendar.");
    } catch (e) {
      Alert.alert("Booking failed", e instanceof Error ? e.message : "Try again.");
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={["top", "bottom"]}>
      <ScrollView contentContainerStyle={styles.body}>
        <View>
          <Text variant="eyebrow" color="ink3">
            BOOK A LESSON
          </Text>
          <Text variant="display">Pick a lesson type.</Text>
        </View>

        {typesQ.isLoading ? (
          <Skeleton height={56} />
        ) : (typesQ.data ?? []).length === 0 ? (
          <EmptyState
            emoji="🎯"
            title="No lesson types set up yet."
            subtitle="Your barn owner needs to add lesson types first."
          />
        ) : (
          <View style={{ gap: spacing.s }}>
            {(typesQ.data ?? []).map((t) => {
              const isSelected = (selected?.id ?? null) === t.id;
              return (
                <Pressable
                  key={t.id}
                  onPress={() => {
                    setTypeId(t.id);
                    setSlotIdx(null);
                  }}
                  style={[styles.typeCard, isSelected && styles.typeCardSelected]}
                >
                  <View style={{ flex: 1 }}>
                    <Text variant="bodyMedium" color={isSelected ? "white" : "ink1"}>
                      {t.name}
                    </Text>
                    <Text variant="caption" color={isSelected ? "g100" : "ink3"}>
                      {t.duration_minutes} min{t.is_group ? " · group" : ""}
                    </Text>
                  </View>
                  <Text variant="h3" color={isSelected ? "white" : "ink1"}>
                    {t.price_cents != null ? `$${Math.round(t.price_cents / 100)}` : "—"}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        )}

        <View>
          <Text variant="eyebrow" color="ink3" style={{ marginBottom: spacing.s }}>
            AVAILABLE SLOTS
          </Text>
          {slotsQ.isLoading ? (
            <Skeleton height={72} />
          ) : (
            <View style={styles.slots}>
              {(slotsQ.data ?? []).slice(0, 16).map((s, i) => {
                const isSelected = slotIdx === i;
                return (
                  <Pressable
                    key={`${s.startsAt}`}
                    disabled={!s.available}
                    onPress={() => setSlotIdx(i)}
                    style={[
                      styles.slot,
                      isSelected && styles.slotSelected,
                      !s.available && styles.slotDisabled,
                    ]}
                  >
                    <Text
                      variant="eyebrow"
                      color={isSelected ? "white" : !s.available ? "ink3" : "ink2"}
                    >
                      {formatDayLabel(s.startsAt).toUpperCase()}
                    </Text>
                    <Text
                      variant="bodyMedium"
                      color={isSelected ? "white" : !s.available ? "ink3" : "ink1"}
                    >
                      {formatTime(s.startsAt)}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
          )}
        </View>

        {chosenHorse ? (
          <Card padding="md">
            <Text variant="eyebrow" color="ink3">
              YOUR HORSE
            </Text>
            <View style={styles.horseRow}>
              <View style={styles.avatar}>
                <Text variant="bodyMedium" color="g700">
                  {chosenHorse.name[0]?.toUpperCase()}
                </Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text variant="bodyMedium">{chosenHorse.name}</Text>
                <Text variant="caption" color="ink3">
                  {[chosenHorse.breed, chosenHorse.stall ? `Stall #${chosenHorse.stall}` : null]
                    .filter(Boolean)
                    .join(" · ")}
                </Text>
              </View>
              <Tag label="DEFAULT" tone="neutral" />
            </View>
          </Card>
        ) : null}
      </ScrollView>

      <View style={styles.footer}>
        <View style={styles.priceRow}>
          <Text variant="caption" color="ink3">
            Prepay with Apple Pay or card
          </Text>
          <Text variant="h2">
            {selected?.price_cents != null ? `$${Math.round(selected.price_cents / 100)}` : "—"}
          </Text>
        </View>
        <Button
          label={book.isPending ? "Processing…" : "Confirm booking"}
          variant="primary"
          size="lg"
          fullWidth
          disabled={book.isPending || slotIdx === null || !selected}
          onPress={onConfirm}
        />
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
  slotDisabled: { backgroundColor: colors.n50, borderColor: colors.n100, opacity: 0.6 },
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
