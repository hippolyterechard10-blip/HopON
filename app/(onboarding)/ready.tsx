import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { ActivityIndicator, StyleSheet, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { Button } from "@/components/ui/Button";
import { Text } from "@/components/ui/Text";
import { colors } from "@/constants/colors";
import { spacing } from "@/constants/spacing";
import { useOnboardingCommit } from "@/hooks/useOnboardingCommit";
import { useOnboardingStore } from "@/stores/onboardingStore";

export default function Ready() {
  const router = useRouter();
  const commit = useOnboardingCommit();
  const reset = useOnboardingStore((s) => s.reset);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Auto-commit on mount.
  useEffect(() => {
    commit
      .mutateAsync()
      .catch((err) => setErrorMsg(err instanceof Error ? err.message : "Could not finish setup."));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (commit.isPending) {
    return (
      <SafeAreaView style={[styles.container, styles.center]}>
        <ActivityIndicator color={colors.g500} size="large" />
        <Text variant="body" color="ink2" style={{ marginTop: spacing.md }}>
          Setting up your barn…
        </Text>
      </SafeAreaView>
    );
  }

  if (errorMsg) {
    return (
      <SafeAreaView style={[styles.container, styles.body]}>
        <Text variant="display">Something went wrong.</Text>
        <Text variant="body" color="ink2">
          {errorMsg}
        </Text>
        <View style={{ height: spacing.xl }} />
        <Button label="Try again" variant="primary" size="lg" fullWidth onPress={() => commit.mutateAsync().catch((e) => setErrorMsg(String(e)))} />
        <Button
          label="Start over"
          variant="ghost"
          size="md"
          fullWidth
          onPress={() => {
            reset();
            router.replace("/(onboarding)/role-select");
          }}
        />
      </SafeAreaView>
    );
  }

  const data = commit.data;
  return (
    <SafeAreaView style={[styles.container, styles.center]}>
      <View style={styles.check}>
        <Text style={styles.checkChar}>✓</Text>
      </View>
      <Text variant="hero" color="ink1" style={{ textAlign: "center", marginTop: spacing.lg }}>
        Welcome to{" "}
        <Text variant="hero" color="g600">
          {data?.barnName ?? "your barn"}
        </Text>
        .
      </Text>
      <Text variant="body" color="ink2" style={{ textAlign: "center", marginTop: spacing.s, maxWidth: 280 }}>
        Your team can see you now. Let's go.
      </Text>
      <View style={{ height: spacing["2xl"] }} />
      <Button
        label="Go to HopOn"
        variant="primary"
        size="lg"
        fullWidth
        onPress={() => {
          reset();
          router.replace("/(app)");
        }}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  body: { padding: spacing.xl, gap: spacing.sm, justifyContent: "center" },
  center: { padding: spacing.xl, justifyContent: "center", alignItems: "center" },
  check: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: colors.g500,
    alignItems: "center",
    justifyContent: "center",
  },
  checkChar: { color: colors.white, fontSize: 48, fontFamily: "DMSerifDisplay_400Regular_Italic" },
});
