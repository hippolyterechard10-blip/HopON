import { useRouter } from "expo-router";
import { Pressable, StyleSheet, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { Text } from "@/components/ui/Text";
import { colors } from "@/constants/colors";
import { radii, spacing } from "@/constants/spacing";
import { useOnboardingStore } from "@/stores/onboardingStore";
import type { BarnRole } from "@/types/roles";

import { Progress } from "./_progress";

const OWNER_ROLES: BarnRole[] = ["barn_owner", "barn_manager"];

export default function BarnSetup() {
  const router = useRouter();
  const roles = useOnboardingStore((s) => s.roles);
  const isOwner = roles.some((r) => OWNER_ROLES.includes(r));

  return (
    <SafeAreaView style={styles.container} edges={["top", "bottom"]}>
      <View style={styles.content}>
        <Progress step={2} />
        <Text variant="eyebrow" color="ink3">
          STEP 2 OF 4
        </Text>
        <Text variant="hero" color="ink1">
          Your barn.
        </Text>
        <Text variant="body" color="ink2" style={{ marginTop: spacing.xs }}>
          {isOwner
            ? "Start a new barn on HopOn, or join one that's already here."
            : "Enter the invite code your barn shared with you."}
        </Text>

        <View style={styles.options}>
          {isOwner ? (
            <OptionCard
              title="Create a new barn"
              subtitle="You'll be the owner. You can invite trainers, grooms, and clients next."
              emoji="🏗️"
              onPress={() => router.push("/(onboarding)/barn-create")}
            />
          ) : null}
          <OptionCard
            title="Join an existing barn"
            subtitle="Use the invite code your barn owner sent you."
            emoji="🔑"
            onPress={() => router.push("/(onboarding)/barn-join")}
          />
        </View>
      </View>
    </SafeAreaView>
  );
}

function OptionCard({
  title,
  subtitle,
  emoji,
  onPress,
}: {
  title: string;
  subtitle: string;
  emoji: string;
  onPress: () => void;
}) {
  return (
    <Pressable onPress={onPress} style={styles.option}>
      <Text style={styles.emoji}>{emoji}</Text>
      <View style={{ flex: 1 }}>
        <Text variant="h3">{title}</Text>
        <Text variant="caption" color="ink3" style={{ marginTop: 4 }}>
          {subtitle}
        </Text>
      </View>
      <Text variant="h2" color="ink3">
        ›
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  content: { padding: spacing.lg, gap: spacing.s, flex: 1 },
  options: { gap: spacing.s, marginTop: spacing.xl },
  option: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
    padding: spacing.md,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radii.lg,
  },
  emoji: { fontSize: 28 },
});
