import { StyleSheet, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { Card } from "@/components/ui/Card";
import { Text } from "@/components/ui/Text";
import { useRole } from "@/hooks/useRole";
import { colors } from "@/constants/colors";
import { spacing } from "@/constants/spacing";

export default function Home() {
  const { homeVariant, roles } = useRole();
  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <View style={styles.body}>
        <Text variant="eyebrow" color="ink3">
          Home · {homeVariant}
        </Text>
        <Text variant="display" color="ink1">
          Welcome to HopOn.
        </Text>
        <Card>
          <Text variant="bodyMedium" color="ink1">
            Role-adaptive home screens land in the next commit.
          </Text>
          <Text variant="caption" color="ink2" style={{ marginTop: spacing.s }}>
            Current roles: {roles.length ? roles.join(", ") : "none yet — finish onboarding"}
          </Text>
        </Card>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  body: { flex: 1, padding: spacing.xl, gap: spacing.lg },
});
