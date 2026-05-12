import { useRouter } from "expo-router";
import { useState } from "react";
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { z } from "zod";

import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Text } from "@/components/ui/Text";
import { colors } from "@/constants/colors";
import { spacing } from "@/constants/spacing";
import { useOnboardingStore } from "@/stores/onboardingStore";

import { Progress } from "./_progress";

const Schema = z.object({
  name: z.string().min(2, "Barn name is too short."),
  address: z.string().optional(),
});

export default function BarnCreate() {
  const router = useRouter();
  const setBarnChoice = useOnboardingStore((s) => s.setBarnChoice);

  const [name, setName] = useState("");
  const [address, setAddress] = useState("");
  const [error, setError] = useState<string | null>(null);

  const onContinue = () => {
    const parsed = Schema.safeParse({ name, address });
    if (!parsed.success) {
      setError(parsed.error.issues[0]?.message ?? "Invalid input.");
      return;
    }
    setBarnChoice({
      kind: "create",
      name: parsed.data.name,
      address: parsed.data.address ?? "",
      timezone: "America/New_York",
    });
    router.push("/(onboarding)/profile-complete");
  };

  return (
    <SafeAreaView style={styles.container} edges={["top", "bottom"]}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        style={{ flex: 1 }}
      >
        <ScrollView contentContainerStyle={styles.content}>
          <Progress step={2} />
          <Text variant="eyebrow" color="ink3">
            STEP 2 OF 4 · CREATE
          </Text>
          <Text variant="hero">Name your barn.</Text>
          <Text variant="body" color="ink2" style={{ marginTop: spacing.xs }}>
            This is what your team and clients will see in HopOn.
          </Text>

          <View style={styles.form}>
            <Input
              label="Barn name"
              value={name}
              onChangeText={setName}
              placeholder="Wellington Park Equestrian"
            />
            <Input
              label="Address (optional)"
              value={address}
              onChangeText={setAddress}
              placeholder="13500 South Shore Blvd, Wellington FL"
            />
            {error ? (
              <Text variant="caption" color="alert">
                {error}
              </Text>
            ) : null}
          </View>
        </ScrollView>
        <View style={styles.footer}>
          <Button label="Continue" variant="primary" size="lg" fullWidth onPress={onContinue} />
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  content: { padding: spacing.lg, gap: spacing.s },
  form: { gap: spacing.sm, marginTop: spacing.lg },
  footer: { padding: spacing.lg, backgroundColor: colors.surface, borderTopWidth: 1, borderTopColor: colors.border },
});
