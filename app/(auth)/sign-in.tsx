import { StyleSheet, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { Text } from "@/components/ui/Text";
import { colors } from "@/constants/colors";
import { spacing } from "@/constants/spacing";

export default function SignIn() {
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.body}>
        <Text variant="display" color="ink1">
          Welcome back.
        </Text>
        <Text variant="body" color="ink2">
          Sign-in flow lands in the next commit (magic link + email/password).
        </Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg, padding: spacing.xl },
  body: { flex: 1, gap: spacing.md, justifyContent: "center" },
});
