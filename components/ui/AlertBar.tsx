import { View, StyleSheet } from "react-native";

import { colors } from "@/constants/colors";
import { radii, spacing } from "@/constants/spacing";

import { Text } from "./Text";

type Severity = "alert" | "warn" | "info";

type Props = {
  severity: Severity;
  title: string;
  subtitle?: string;
  right?: React.ReactNode;
};

/**
 * Left-accent alert row from CLAUDE.md §3.
 * Never a full red background — muted tint + 2px left bar.
 */
export function AlertBar({ severity, title, subtitle, right }: Props) {
  const { bg, bar, fg } = severityColors(severity);
  return (
    <View style={[styles.row, { backgroundColor: bg }]}>
      <View style={[styles.bar, { backgroundColor: bar }]} />
      <View style={styles.content}>
        <Text variant="bodyMedium" color="ink1">
          {severity === "alert" ? "! " : ""}
          {title}
        </Text>
        {subtitle ? (
          <Text variant="caption" style={{ color: fg }}>
            {subtitle}
          </Text>
        ) : null}
      </View>
      {right}
    </View>
  );
}

function severityColors(severity: Severity) {
  switch (severity) {
    case "alert":
      return { bg: colors.alertBg, bar: colors.alertDot, fg: colors.alert };
    case "warn":
      return { bg: colors.warnBg, bar: colors.warnDot, fg: colors.warn };
    case "info":
    default:
      return { bg: colors.n50, bar: colors.n400, fg: colors.ink2 };
  }
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "stretch",
    borderRadius: radii.md,
    overflow: "hidden",
  },
  bar: {
    width: 2,
  },
  content: {
    flex: 1,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    gap: spacing.xxs,
  },
});
