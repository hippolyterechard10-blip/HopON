import { useRouter } from "expo-router";
import { useState } from "react";
import { KeyboardAvoidingView, Platform, StyleSheet, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Text } from "@/components/ui/Text";
import { colors } from "@/constants/colors";
import { spacing } from "@/constants/spacing";
import { useOnboardingStore } from "@/stores/onboardingStore";

import { Progress } from "./_progress";

export default function BarnJoin() {
  const router = useRouter();
  const setBarnChoice = useOnboardingStore((s) => s.setBarnChoice);
  const [code, setCode] = useState("");
  const [error, setError] = useState<string | null>(null);

  const onContinue = () => {
    const trimmed = code.trim();
    if (trimmed.length < 4) {
      setError("Enter the invite code from your barn owner.");
      return;
    }
    setBarnChoice({ kind: "join", code: trimmed });
    router.push("/(onboarding)/profile-complete");
  };

  return (
    <SafeAreaView style={styles.container} edges={["top", "bottom"]}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        style={{ flex: 1 }}
      >
        <View style={styles.content}>
          <Progress step={2} />
          <Text variant="eyebrow" color="ink3">
            STEP 2 OF 4 · JOIN
          </Text>
          <Text variant="hero">Got an invite code?</Text>
          <Text variant="body" color="ink2" style={{ marginTop: spacing.xs }}>
            Paste the code your barn owner sent you. We'll match you to the right team.
          </Text>

          <View style={styles.form}>
            <Input
              label="Invite code"
              value={code}
              onChangeText={(v) => setCode(v.toUpperCase())}
              autoCapitalize="characters"
              placeholder="WELL-2027"
              error={error ?? undefined}
            />
          </View>
        </View>
        <View style={styles.footer}>
          <Button label="Continue" variant="primary" size="lg" fullWidth onPress={onContinue} />
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  content: { padding: spacing.lg, gap: spacing.s, flex: 1 },
  form: { gap: spacing.sm, marginTop: spacing.lg },
  footer: { padding: spacing.lg, backgroundColor: colors.surface, borderTopWidth: 1, borderTopColor: colors.border },
});
