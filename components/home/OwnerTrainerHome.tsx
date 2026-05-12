import { StyleSheet, View } from "react-native";

import { StatusDot } from "@/components/ui/StatusDot";
import { Text } from "@/components/ui/Text";
import { colors } from "@/constants/colors";
import { spacing } from "@/constants/spacing";
import { useBarnMetrics } from "@/hooks/useBarnMetrics";
import { useBarnStore } from "@/stores/barnStore";

import { TrainerHome } from "./TrainerHome";

export function OwnerTrainerHome() {
  return <TrainerHome topStrip={<BarnStrip />} />;
}

function BarnStrip() {
  const barnId = useBarnStore((s) => s.currentBarnId);
  const { data } = useBarnMetrics(barnId);

  const alerts = data?.openAlerts ?? 0;
  const todos = data?.teamTodos ?? 0;

  return (
    <View style={styles.strip}>
      <StatusDot status={alerts > 0 ? "warn" : "ok"} size={5} />
      <Text variant="caption" color="ink2">
        Barn {alerts > 0 ? "needs attention" : "OK"} · {todos} tasks · {alerts} alerts
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
