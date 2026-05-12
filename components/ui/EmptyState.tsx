import { StyleSheet, View } from "react-native";

import { colors } from "@/constants/colors";
import { radii, spacing } from "@/constants/spacing";

import { Text } from "./Text";

type Props = {
  emoji?: string;
  title: string;
  subtitle?: string;
  right?: React.ReactNode;
};

export function EmptyState({ emoji = "✦", title, subtitle, right }: Props) {
  return (
    <View style={styles.wrap}>
      <Text style={styles.emoji}>{emoji}</Text>
      <Text variant="bodyMedium">{title}</Text>
      {subtitle ? (
        <Text variant="caption" color="ink3" style={{ textAlign: "center", maxWidth: 260 }}>
          {subtitle}
        </Text>
      ) : null}
      {right}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radii.lg,
    padding: spacing.xl,
    alignItems: "center",
    gap: spacing.s,
  },
  emoji: { fontSize: 28 },
});
