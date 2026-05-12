import { useEffect, useState } from "react";
import { Pressable, ScrollView, StyleSheet, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { ClientHome } from "@/components/home/ClientHome";
import { GroomHome } from "@/components/home/GroomHome";
import { OwnerHome } from "@/components/home/OwnerHome";
import { OwnerTrainerHome } from "@/components/home/OwnerTrainerHome";
import { TrainerHome } from "@/components/home/TrainerHome";
import { Text } from "@/components/ui/Text";
import { colors } from "@/constants/colors";
import { spacing } from "@/constants/spacing";
import { useBarnStore } from "@/stores/barnStore";
import { computeHomeVariant, type BarnRole, type HomeVariant } from "@/types/roles";

/**
 * Dev presets used by the role switcher.
 * In production, roles come from barn_memberships.roles[].
 */
const PRESETS: Array<{ label: string; roles: BarnRole[] }> = [
  { label: "Owner", roles: ["barn_owner"] },
  { label: "Trainer", roles: ["trainer"] },
  { label: "Owner+Trainer", roles: ["barn_owner", "trainer"] },
  { label: "Groom", roles: ["groom"] },
  { label: "Client", roles: ["client"] },
];

export default function Home() {
  const currentRoles = useBarnStore((s) => s.currentRoles);
  const setBarn = useBarnStore((s) => s.setBarn);
  const [activePreset, setActivePreset] = useState(0);

  // Seed a mock barn on first mount so all variants are previewable
  // without finishing onboarding. Removed once auth+onboarding land.
  useEffect(() => {
    if (currentRoles.length === 0) {
      const preset = PRESETS[0];
      if (preset) {
        setBarn({ id: "demo", name: "Wellington Park", roles: preset.roles });
      }
    }
  }, [currentRoles.length, setBarn]);

  const variant: HomeVariant = computeHomeVariant(currentRoles);

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <View style={styles.devBar}>
        <Text variant="eyebrow" color="ink3">
          PREVIEW
        </Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.devScroll}>
          {PRESETS.map((p, i) => (
            <Pressable
              key={p.label}
              onPress={() => {
                setActivePreset(i);
                setBarn({ id: "demo", name: "Wellington Park", roles: p.roles });
              }}
              style={[styles.devChip, activePreset === i && styles.devChipActive]}
            >
              <Text variant="label" color={activePreset === i ? "white" : "ink2"}>
                {p.label}
              </Text>
            </Pressable>
          ))}
        </ScrollView>
      </View>
      {renderVariant(variant)}
    </SafeAreaView>
  );
}

function renderVariant(v: HomeVariant) {
  switch (v) {
    case "owner":
      return <OwnerHome />;
    case "trainer":
      return <TrainerHome />;
    case "owner_trainer":
      return <OwnerTrainerHome />;
    case "groom":
      return <GroomHome />;
    case "client":
      return <ClientHome />;
  }
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  devBar: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.s,
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    gap: spacing.xs,
  },
  devScroll: { gap: spacing.xs },
  devChip: {
    paddingVertical: 6,
    paddingHorizontal: spacing.sm,
    borderRadius: 999,
    backgroundColor: colors.n100,
  },
  devChipActive: { backgroundColor: colors.g500 },
});
