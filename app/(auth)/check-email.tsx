import { useLocalSearchParams, useRouter } from "expo-router";
import { Pressable, StyleSheet, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { Button } from "@/components/ui/Button";
import { Text } from "@/components/ui/Text";
import { colors } from "@/constants/colors";
import { spacing } from "@/constants/spacing";

export default function CheckEmail() {
  const router = useRouter();
  const { email } = useLocalSearchParams<{ email?: string }>();

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.body}>
        <View style={styles.icon}>
          <Text style={styles.iconChar}>✉</Text>
        </View>
        <Text variant="hero" color="ink1" style={{ textAlign: "center" }}>
          Check your email.
        </Text>
        <Text variant="body" color="ink2" style={{ textAlign: "center" }}>
          We sent a sign-in link to {email ? `${email}.` : "your inbox."} Tap it on this device to
          finish signing in.
        </Text>

        <Button
          label="Open Mail"
          variant="primary"
          size="lg"
          fullWidth
          onPress={() => {
            // Best-effort — falls through if no mail app handler is registered.
            import("expo-linking").then(({ openURL }) => openURL("mailto:")).catch(() => {});
          }}
        />
        <Pressable onPress={() => router.replace("/(auth)/sign-in")}>
          <Text variant="bodyMedium" color="g600" style={{ textAlign: "center" }}>
            Use a different email
          </Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  body: { flex: 1, padding: spacing.xl, gap: spacing.lg, justifyContent: "center", alignItems: "center" },
  icon: {
    width: 88,
    height: 88,
    borderRadius: 44,
    backgroundColor: colors.g50,
    alignItems: "center",
    justifyContent: "center",
  },
  iconChar: { fontSize: 40, color: colors.g600 },
});
