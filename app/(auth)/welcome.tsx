import { useRouter } from "expo-router";
import { StyleSheet, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { Button } from "@/components/ui/Button";
import { Text } from "@/components/ui/Text";
import { colors } from "@/constants/colors";
import { spacing } from "@/constants/spacing";
import { useT } from "@/lib/i18n";

export default function Welcome() {
  const router = useRouter();
  const t = useT();
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
          {t("welcome.title")}
        </Text>
        <Text variant="body" color="g200" style={styles.subtitle}>
          {t("welcome.subtitle")}
        </Text>
      </View>

      <View style={styles.actions}>
        <Button
          label={t("welcome.getStarted")}
          variant="primary"
          size="lg"
          fullWidth
          onPress={() => router.push("/(auth)/sign-up")}
        />
        <Button
          label={t("welcome.haveAccount")}
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
