import { StyleSheet, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { Text } from "@/components/ui/Text";
import { colors } from "@/constants/colors";
import { spacing } from "@/constants/spacing";

export default function BarnSetup() {
  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <View style={styles.body}>
        <Text variant="eyebrow" color="ink3">
          STEP 2 OF 4
        </Text>
        <Text variant="display">Your barn.</Text>
        <Text variant="body" color="ink2">
          Create a new barn or join one with an invite code. Coming next commit.
        </Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  body: { padding: spacing.xl, gap: spacing.s },
});
