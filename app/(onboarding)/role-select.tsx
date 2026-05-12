import { useRouter } from "expo-router";
import { useState } from "react";
import { Pressable, ScrollView, StyleSheet, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { Button } from "@/components/ui/Button";
import { Text } from "@/components/ui/Text";
import { colors } from "@/constants/colors";
import { radii, spacing } from "@/constants/spacing";
import { useOnboardingStore } from "@/stores/onboardingStore";
import { ROLE_LABELS, type BarnRole } from "@/types/roles";

import { Progress } from "./_progress";

type RoleOption = {
  role: BarnRole;
  emoji: string;
  description: string;
};

const OPTIONS: RoleOption[] = [
  { role: "barn_owner", emoji: "🏇", description: "I own or manage a barn." },
  { role: "trainer", emoji: "🎯", description: "I teach lessons." },
  { role: "groom", emoji: "🧤", description: "I care for the horses." },
  { role: "pro_rider", emoji: "🏆", description: "I ride professionally." },
  { role: "client", emoji: "👤", description: "I take lessons or board." },
  { role: "parent", emoji: "👨‍👩‍👧", description: "I book for my child." },
];

export default function RoleSelect() {
  const router = useRouter();
  const setRoles = useOnboardingStore((s) => s.setRoles);
  const saved = useOnboardingStore((s) => s.roles);
  const [selected, setSelected] = useState<Set<BarnRole>>(new Set(saved));

  const toggle = (r: BarnRole) => {
    const next = new Set(selected);
    if (next.has(r)) next.delete(r);
    else next.add(r);
    setSelected(next);
  };

  const onContinue = () => {
    setRoles(Array.from(selected));
    router.push("/(onboarding)/barn-setup");
  };

  return (
    <SafeAreaView style={styles.container} edges={["top", "bottom"]}>
      <ScrollView contentContainerStyle={styles.content}>
        <Progress step={1} />
        <Text variant="eyebrow" color="ink3">
          STEP 1 OF 4
        </Text>
        <Text variant="hero" color="ink1" style={styles.title}>
          Who are you at the barn?
        </Text>
        <Text variant="body" color="ink2" style={{ marginTop: spacing.xs }}>
          Pick everything that applies. You can adjust this later.
        </Text>

        <View style={styles.grid}>
          {OPTIONS.map((o) => {
            const isSelected = selected.has(o.role);
            return (
              <Pressable
                key={o.role}
                onPress={() => toggle(o.role)}
                style={[styles.card, isSelected && styles.cardSelected]}
              >
                <Text style={styles.emoji}>{o.emoji}</Text>
                <Text variant="bodyMedium" color={isSelected ? "white" : "ink1"}>
                  {ROLE_LABELS[o.role]}
                </Text>
                <Text variant="caption" color={isSelected ? "g100" : "ink3"}>
                  {o.description}
                </Text>
              </Pressable>
            );
          })}
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <Button
          label="Continue"
          variant="primary"
          size="lg"
          fullWidth
          disabled={selected.size === 0}
          onPress={onContinue}
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  content: { padding: spacing.lg, paddingBottom: spacing["2xl"] },
  title: { marginTop: spacing.xs, letterSpacing: -0.5 },
  grid: { marginTop: spacing.xl, gap: spacing.s, flexDirection: "row", flexWrap: "wrap" },
  card: {
    flexBasis: "48%",
    flexGrow: 1,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radii.lg,
    padding: spacing.md,
    gap: spacing.xs,
    minHeight: 110,
  },
  cardSelected: { backgroundColor: colors.g500, borderColor: colors.g500 },
  emoji: { fontSize: 24 },
  footer: {
    padding: spacing.lg,
    backgroundColor: colors.surface,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
});
