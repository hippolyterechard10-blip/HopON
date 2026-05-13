import { useRouter } from "expo-router";
import { useState } from "react";
import { Alert, KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { z } from "zod";

import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Text } from "@/components/ui/Text";
import { colors } from "@/constants/colors";
import { radii, spacing } from "@/constants/spacing";
import { useHorses } from "@/hooks/useHorses";
import { useCreateServiceRequest } from "@/hooks/useServiceRequests";
import { useBarnStore } from "@/stores/barnStore";

const SERVICE_TYPES = [
  { key: "farrier", label: "Farrier", emoji: "🐴" },
  { key: "vet", label: "Vet", emoji: "💉" },
  { key: "dentist", label: "Dentist", emoji: "🦷" },
  { key: "physio", label: "Physio", emoji: "🏃" },
  { key: "osteo", label: "Osteo", emoji: "🦴" },
  { key: "braider", label: "Braider", emoji: "✂️" },
] as const;

const Schema = z.object({
  serviceType: z.string().min(2, "Pick a service type."),
});

export default function NewServiceRequest() {
  const router = useRouter();
  const barnId = useBarnStore((s) => s.currentBarnId);
  const horsesQ = useHorses(barnId);
  const create = useCreateServiceRequest();

  const [serviceType, setServiceType] = useState<string>("farrier");
  const [horseId, setHorseId] = useState<string | null>(null);
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [error, setError] = useState<string | null>(null);

  const submit = async () => {
    if (!barnId) return;
    const parsed = Schema.safeParse({ serviceType });
    if (!parsed.success) {
      setError(parsed.error.issues[0]?.message ?? "Invalid input.");
      return;
    }
    try {
      await create.mutateAsync({
        barnId,
        horseId,
        serviceType,
        description: description || undefined,
        priceCents: price ? Math.round(Number(price) * 100) : undefined,
      });
      router.back();
    } catch (e) {
      Alert.alert("Could not save", e instanceof Error ? e.message : "Try again.");
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={["top", "bottom"]}>
      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : undefined} style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={styles.body}>
          <Text variant="eyebrow" color="ink3">
            NEW SERVICE REQUEST
          </Text>
          <Text variant="display">Ask a partner.</Text>

          <View style={styles.form}>
            <View>
              <Text variant="label" color="ink2" style={{ marginBottom: spacing.xs }}>
                SERVICE
              </Text>
              <View style={styles.chipsRow}>
                {SERVICE_TYPES.map((s) => {
                  const selected = serviceType === s.key;
                  return (
                    <Pressable
                      key={s.key}
                      onPress={() => setServiceType(s.key)}
                      style={[styles.chip, selected && styles.chipSelected]}
                    >
                      <Text style={styles.chipEmoji}>{s.emoji}</Text>
                      <Text variant="label" color={selected ? "white" : "ink2"}>
                        {s.label}
                      </Text>
                    </Pressable>
                  );
                })}
              </View>
            </View>

            <View>
              <Text variant="label" color="ink2" style={{ marginBottom: spacing.xs }}>
                HORSE (optional)
              </Text>
              <View style={styles.chipsRow}>
                <Pressable
                  onPress={() => setHorseId(null)}
                  style={[styles.smallChip, horseId === null && styles.smallChipSelected]}
                >
                  <Text variant="caption" color={horseId === null ? "white" : "ink2"}>
                    Whole barn
                  </Text>
                </Pressable>
                {(horsesQ.data ?? []).map((h) => (
                  <Pressable
                    key={h.id}
                    onPress={() => setHorseId(h.id)}
                    style={[styles.smallChip, horseId === h.id && styles.smallChipSelected]}
                  >
                    <Text variant="caption" color={horseId === h.id ? "white" : "ink2"}>
                      {h.name}
                    </Text>
                  </Pressable>
                ))}
              </View>
            </View>

            <Input
              label="Description (optional)"
              value={description}
              onChangeText={setDescription}
              multiline
              placeholder="Limp on right hind. Has been padded for 2 days."
            />

            <Input
              label="Estimated price ($)"
              value={price}
              onChangeText={setPrice}
              keyboardType="decimal-pad"
              placeholder="200"
              helper="Optional. Confirmed by the partner before payment."
            />

            {error ? (
              <Text variant="caption" color="alert">
                {error}
              </Text>
            ) : null}
          </View>
        </ScrollView>
        <View style={styles.footer}>
          <Button
            label={create.isPending ? "Sending…" : "Send request"}
            variant="primary"
            size="lg"
            fullWidth
            disabled={create.isPending}
            onPress={submit}
          />
          <Button label="Cancel" variant="ghost" size="md" fullWidth onPress={() => router.back()} />
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  body: { padding: spacing.lg, gap: spacing.s, paddingBottom: spacing["2xl"] },
  form: { gap: spacing.md, marginTop: spacing.md },
  chipsRow: { flexDirection: "row", flexWrap: "wrap", gap: spacing.xs },
  chip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingVertical: 8,
    paddingHorizontal: spacing.sm,
    borderRadius: radii.full,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  chipSelected: { backgroundColor: colors.g500, borderColor: colors.g500 },
  chipEmoji: { fontSize: 16 },
  smallChip: {
    paddingVertical: 6,
    paddingHorizontal: spacing.sm,
    borderRadius: radii.full,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  smallChipSelected: { backgroundColor: colors.g500, borderColor: colors.g500 },
  footer: {
    padding: spacing.lg,
    backgroundColor: colors.surface,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    gap: spacing.xs,
  },
});
