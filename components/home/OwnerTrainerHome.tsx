import { StyleSheet, View } from "react-native";

import { StatusDot } from "@/components/ui/StatusDot";
import { Text } from "@/components/ui/Text";
import { colors } from "@/constants/colors";
import { spacing } from "@/constants/spacing";
import { mockBarn } from "@/lib/mockData";

import { TrainerHome } from "./TrainerHome";

export function OwnerTrainerHome() {
  return <TrainerHome topStrip={<BarnStrip />} />;
}

function BarnStrip() {
  return (
    <View style={styles.strip}>
      <StatusDot status={mockBarn.openAlerts > 0 ? "warn" : "ok"} size={5} />
      <Text variant="caption" color="ink2">
        Barn {mockBarn.openAlerts > 0 ? "needs attention" : "OK"} · {mockBarn.teamTodos} tasks · {mockBarn.openAlerts} alerts
      </Text>
      <View style={{ flex: 1 }} />
      <Text variant="caption" color="g600">
        Dashboard ›
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  strip: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.s,
    paddingVertical: spacing.s,
    paddingHorizontal: spacing.sm,
    backgroundColor: colors.surface,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
  },
});
