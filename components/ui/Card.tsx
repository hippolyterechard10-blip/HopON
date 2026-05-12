import { View, ViewProps, StyleSheet } from "react-native";

import { colors } from "@/constants/colors";
import { radii, shadows, spacing } from "@/constants/spacing";

type Props = ViewProps & {
  variant?: "default" | "elevated" | "dark";
  padding?: keyof typeof spacing;
};

export function Card({ variant = "default", padding = "md", style, children, ...rest }: Props) {
  const variantStyle =
    variant === "dark"
      ? styles.dark
      : variant === "elevated"
        ? styles.elevated
        : styles.default;

  return (
    <View {...rest} style={[styles.base, variantStyle, { padding: spacing[padding] }, style]}>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  base: {
    borderRadius: radii.lg,
  },
  default: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  elevated: {
    backgroundColor: colors.surface,
    ...shadows.soft,
  },
  dark: {
    backgroundColor: colors.g700,
  },
});
