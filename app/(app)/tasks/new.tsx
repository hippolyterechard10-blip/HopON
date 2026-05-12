import { useRouter } from "expo-router";
import { useState } from "react";
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { z } from "zod";

import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Text } from "@/components/ui/Text";
import { colors } from "@/constants/colors";
import { radii, spacing } from "@/constants/spacing";
import { useBarnMembers } from "@/hooks/useBarnMembers";
import { useHorses } from "@/hooks/useHorses";
import { useCreateTask } from "@/hooks/useTask";
import { useBarnStore } from "@/stores/barnStore";
import type { TaskPriority } from "@/types/app.types";

const Schema = z.object({
  title: z.string().min(2, "What kind of task?"),
});

const PRIORITIES: { key: TaskPriority; label: string }[] = [
  { key: "normal", label: "Normal" },
  { key: "high", label: "High" },
  { key: "urgent", label: "Urgent" },
];

export default function NewTask() {
  const router = useRouter();
  const barnId = useBarnStore((s) => s.currentBarnId);
  const horsesQ = useHorses(barnId);
  const membersQ = useBarnMembers(barnId);
  const create = useCreateTask();

  const [title, setTitle] = useState("");
  const [notes, setNotes] = useState("");
  const [horseId, setHorseId] = useState<string | null>(null);
  const [assignee, setAssignee] = useState<string | null>(null);
  const [priority, setPriority] = useState<TaskPriority>("normal");
  const [hour, setHour] = useState<string>("");
  const [error, setError] = useState<string | null>(null);

  const submit = async () => {
    if (!barnId) return;
    const parsed = Schema.safeParse({ title });
    if (!parsed.success) {
      setError(parsed.error.issues[0]?.message ?? "Invalid input.");
      return;
    }
    setError(null);

    let dueAt: string | null = null;
    if (hour) {
      const [h, m] = hour.split(":").map((x) => Number(x));
      if (Number.isFinite(h)) {
        const d = new Date();
        d.setHours(h ?? 0, m ?? 0, 0, 0);
        dueAt = d.toISOString();
      }
    }

    try {
      await create.mutateAsync({
        barnId,
        horseId,
        title: parsed.data.title,
        notes: notes || undefined,
        assignedTo: assignee,
        priority,
        dueAt,
      });
      router.back();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not save.");
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={["top", "bottom"]}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        style={{ flex: 1 }}
      >
        <ScrollView contentContainerStyle={styles.body}>
          <Text variant="eyebrow" color="ink3">
            NEW TASK
          </Text>
          <Text variant="display">Add a task.</Text>

          <View style={styles.form}>
            <Input label="Title" value={title} onChangeText={setTitle} placeholder="Feeding · Bella" />
            <Input
              label="Notes (optional)"
              value={notes}
              onChangeText={setNotes}
              multiline
              placeholder="Anything the assignee should know"
            />

            <View>
              <Text variant="label" color="ink2" style={{ marginBottom: spacing.xs }}>
                HORSE
              </Text>
              <View style={styles.chipsRow}>
                <Chip label="None" selected={horseId === null} onPress={() => setHorseId(null)} />
                {(horsesQ.data ?? []).map((h) => (
                  <Chip
                    key={h.id}
                    label={h.name}
                    selected={horseId === h.id}
                    onPress={() => setHorseId(h.id)}
                  />
                ))}
              </View>
            </View>

            <View>
              <Text variant="label" color="ink2" style={{ marginBottom: spacing.xs }}>
                ASSIGN TO
              </Text>
              <View style={styles.chipsRow}>
                <Chip label="Anyone" selected={assignee === null} onPress={() => setAssignee(null)} />
                {(membersQ.data ?? []).map((m) => (
                  <Chip
                    key={m.id}
                    label={m.user?.full_name ?? "Member"}
                    selected={assignee === m.user_id}
                    onPress={() => setAssignee(m.user_id)}
                  />
                ))}
              </View>
            </View>

            <View>
              <Text variant="label" color="ink2" style={{ marginBottom: spacing.xs }}>
                PRIORITY
              </Text>
              <View style={styles.chipsRow}>
                {PRIORITIES.map((p) => (
                  <Chip
                    key={p.key}
                    label={p.label}
                    selected={priority === p.key}
                    onPress={() => setPriority(p.key)}
                  />
                ))}
              </View>
            </View>

            <Input
              label="Due time (HH:MM, optional)"
              value={hour}
              onChangeText={setHour}
              placeholder="14:30"
              keyboardType="numbers-and-punctuation"
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
            label={create.isPending ? "Saving…" : "Add task"}
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

function Chip({ label, selected, onPress }: { label: string; selected: boolean; onPress: () => void }) {
  return (
    <Pressable onPress={onPress} style={[styles.chip, selected && styles.chipSelected]}>
      <Text variant="caption" color={selected ? "white" : "ink2"}>
        {label}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  body: { padding: spacing.lg, gap: spacing.s, paddingBottom: spacing["2xl"] },
  form: { gap: spacing.sm, marginTop: spacing.md },
  chipsRow: { flexDirection: "row", flexWrap: "wrap", gap: spacing.xs },
  chip: {
    paddingVertical: 6,
    paddingHorizontal: spacing.sm,
    borderRadius: radii.full,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  chipSelected: { backgroundColor: colors.g500, borderColor: colors.g500 },
  footer: {
    padding: spacing.lg,
    backgroundColor: colors.surface,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    gap: spacing.xs,
  },
});
