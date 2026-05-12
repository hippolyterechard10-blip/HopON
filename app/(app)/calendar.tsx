import { StyleSheet, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { Text } from "@/components/ui/Text";
import { colors } from "@/constants/colors";
import { spacing } from "@/constants/spacing";

export default function Calendar() {
  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <View style={styles.body}>
        <Text variant="eyebrow" color="ink3">
          CALENDAR
        </Text>
        <Text variant="display">Coming next.</Text>
        <Text variant="body" color="ink2">
          Day + week views, role-filtered, with FAB-driven event creation.
        </Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  body: { padding: spacing.xl, gap: spacing.s },
});
