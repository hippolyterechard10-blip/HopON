import { useRouter } from "expo-router";
import { StyleSheet, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { Button } from "@/components/ui/Button";
import { Text } from "@/components/ui/Text";
import { colors } from "@/constants/colors";
import { spacing } from "@/constants/spacing";

export default function Welcome() {
  const router = useRouter();
  return (
    <SafeAreaView style={styles.container} edges={["top", "bottom"]}>
      <View style={styles.brand}>
        <View style={styles.logoMark}>
          <Text variant="display" color="white">
            H
          </Text>
        </View>
        <Text variant="display" color="white" style={styles.wordmark}>
          Hop<Text variant="display" color="g200">O</Text>n
        </Text>
      </View>

      <View style={styles.copy}>
        <Text variant="hero" color="white">
          Your barn. Calmer.
        </Text>
        <Text variant="body" color="g200" style={styles.subtitle}>
          The operating system for riding barns. Bookings, payments, and the team — on the same
          page.
        </Text>
      </View>

      <View style={styles.actions}>
        <Button
          label="Get started"
          variant="primary"
          size="lg"
          fullWidth
          onPress={() => router.push("/(auth)/sign-up")}
        />
        <Button
          label="I already have an account"
          variant="ghost"
          size="md"
          fullWidth
          onPress={() => router.push("/(auth)/sign-in")}
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.g900,
    paddingHorizontal: spacing.xl,
    paddingTop: spacing["3xl"],
    paddingBottom: spacing.xl,
    justifyContent: "space-between",
  },
  brand: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
  },
  logoMark: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: colors.g500,
    alignItems: "center",
    justifyContent: "center",
  },
  wordmark: {
    letterSpacing: -0.5,
  },
  copy: {
    gap: spacing.md,
  },
  subtitle: {
    maxWidth: 360,
  },
  actions: {
    gap: spacing.sm,
  },
});
