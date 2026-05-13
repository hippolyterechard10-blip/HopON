import { useRouter } from "expo-router";
import { useState } from "react";
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { z } from "zod";

import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/EmptyState";
import { Input } from "@/components/ui/Input";
import { Text } from "@/components/ui/Text";
import { colors } from "@/constants/colors";
import { radii, spacing } from "@/constants/spacing";
import { useClientGroups, useCreateClientGroup } from "@/hooks/useClientGroups";
import { useComposeBarnNews, type NewsTag } from "@/hooks/useBarnNewsCompose";
import { useBarnStore } from "@/stores/barnStore";

const Schema = z.object({
  title: z.string().min(2, "What's the headline?"),
});

type SelectedTag = NewsTag;

function tagId(t: SelectedTag): string {
  return t.kind === "group" ? `group:${t.groupId}` : t.kind;
}

export default function NewBarnPost() {
  const router = useRouter();
  const barnId = useBarnStore((s) => s.currentBarnId);
  const groupsQ = useClientGroups(barnId);
  const createGroup = useCreateClientGroup();
  const compose = useComposeBarnNews();

  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [tags, setTags] = useState<SelectedTag[]>([{ kind: "all" }]);
  const [groupDraft, setGroupDraft] = useState("");
  const [error, setError] = useState<string | null>(null);

  const isSelected = (t: SelectedTag) => tags.some((x) => tagId(x) === tagId(t));
  const toggle = (t: SelectedTag) => {
    setTags((prev) => {
      if (prev.some((x) => tagId(x) === tagId(t))) {
        return prev.filter((x) => tagId(x) !== tagId(t));
      }
      // @all is mutually exclusive with the others (broadcast wins)
      if (t.kind === "all") return [{ kind: "all" }];
      return [...prev.filter((x) => x.kind !== "all"), t];
    });
  };

  const onAddGroup = async () => {
    if (!barnId || groupDraft.trim().length < 2) return;
    await createGroup.mutateAsync({ barnId, name: groupDraft.trim() });
    setGroupDraft("");
  };

  const submit = async () => {
    if (!barnId) return;
    const parsed = Schema.safeParse({ title });
    if (!parsed.success) {
      setError(parsed.error.issues[0]?.message ?? "Invalid input.");
      return;
    }
    if (tags.length === 0) {
      setError("Pick at least one audience.");
      return;
    }
    setError(null);
    try {
      await compose.mutateAsync({
        barnId,
        title: parsed.data.title,
        content: content || undefined,
        tags,
      });
      router.back();
    } catch (e) {
      Alert.alert("Could not post", e instanceof Error ? e.message : "Try again.");
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
            NEW POST
          </Text>
          <Text variant="display">Post to the barn.</Text>

          <View style={styles.form}>
            <Input
              label="Headline"
              value={title}
              onChangeText={setTitle}
              placeholder="Show this Saturday"
            />
            <Input
              label="Details (optional)"
              value={content}
              onChangeText={setContent}
              multiline
              placeholder="Anything to share?"
            />

            <View>
              <Text variant="label" color="ink2" style={{ marginBottom: spacing.xs }}>
                AUDIENCE
              </Text>
              <View style={styles.chips}>
                <TagChip
                  label="@all"
                  selected={isSelected({ kind: "all" })}
                  onPress={() => toggle({ kind: "all" })}
                />
                <TagChip
                  label="@team"
                  selected={isSelected({ kind: "team" })}
                  onPress={() => toggle({ kind: "team" })}
                />
                <TagChip
                  label="@owners"
                  selected={isSelected({ kind: "owners" })}
                  onPress={() => toggle({ kind: "owners" })}
                />
                {(groupsQ.data ?? []).map((g) => (
                  <TagChip
                    key={g.id}
                    label={`@${g.name}`}
                    selected={isSelected({ kind: "group", groupId: g.id })}
                    onPress={() => toggle({ kind: "group", groupId: g.id })}
                  />
                ))}
              </View>
              {(groupsQ.data ?? []).length === 0 ? (
                <Text variant="caption" color="ink3" style={{ marginTop: spacing.xs }}>
                  No custom groups yet. Add Competition / Beginners / Boarders below.
                </Text>
              ) : null}
            </View>

            <Card padding="md">
              <Text variant="eyebrow" color="ink3">
                CUSTOM GROUPS
              </Text>
              <Text variant="caption" color="ink2" style={{ marginTop: 4 }}>
                Create a tag like "Competition" or "Beginners" so posts can target a subset.
              </Text>
              <View style={[styles.row, { marginTop: spacing.s }]}>
                <View style={{ flex: 1 }}>
                  <Input
                    value={groupDraft}
                    onChangeText={setGroupDraft}
                    placeholder="Competition"
                  />
                </View>
                <Button
                  label="Add"
                  variant="secondary"
                  size="md"
                  onPress={onAddGroup}
                  disabled={createGroup.isPending || groupDraft.trim().length < 2}
                />
              </View>
            </Card>

            {error ? (
              <Text variant="caption" color="alert">
                {error}
              </Text>
            ) : null}
          </View>
        </ScrollView>

        <View style={styles.footer}>
          <Button
            label={compose.isPending ? "Posting…" : "Post"}
            variant="primary"
            size="lg"
            fullWidth
            disabled={compose.isPending}
            onPress={submit}
          />
          <Button label="Cancel" variant="ghost" size="md" fullWidth onPress={() => router.back()} />
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

function TagChip({ label, selected, onPress }: { label: string; selected: boolean; onPress: () => void }) {
  return (
    <Pressable onPress={onPress} style={[styles.tagChip, selected && styles.tagChipSelected]}>
      <Text variant="label" color={selected ? "white" : "g600"}>
        {label}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  body: { padding: spacing.lg, gap: spacing.s, paddingBottom: spacing["2xl"] },
  form: { gap: spacing.sm, marginTop: spacing.md },
  chips: { flexDirection: "row", flexWrap: "wrap", gap: spacing.xs },
  tagChip: {
    paddingVertical: 6,
    paddingHorizontal: spacing.sm,
    borderRadius: radii.full,
    backgroundColor: colors.g50,
    borderWidth: 1,
    borderColor: colors.g100,
  },
  tagChipSelected: { backgroundColor: colors.g500, borderColor: colors.g500 },
  row: { flexDirection: "row", gap: spacing.s, alignItems: "flex-end" },
  footer: {
    padding: spacing.lg,
    backgroundColor: colors.surface,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    gap: spacing.xs,
  },
});
