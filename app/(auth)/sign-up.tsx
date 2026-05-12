import { StyleSheet, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { Text } from "@/components/ui/Text";
import { colors } from "@/constants/colors";
import { spacing } from "@/constants/spacing";

export default function SignUp() {
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.body}>
        <Text variant="display" color="ink1">
          Join HopOn.
        </Text>
        <Text variant="body" color="ink2">
          Sign-up flow lands in the next commit.
        </Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg, padding: spacing.xl },
  body: { flex: 1, gap: spacing.md, justifyContent: "center" },
});
