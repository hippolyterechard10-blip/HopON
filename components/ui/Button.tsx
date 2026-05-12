import { Pressable, PressableProps, StyleSheet, View } from "react-native";

import { colors } from "@/constants/colors";
import { radii, spacing } from "@/constants/spacing";

import { Text } from "./Text";

type Variant = "primary" | "secondary" | "ghost" | "destructive";
type Size = "sm" | "md" | "lg";

type Props = Omit<PressableProps, "style" | "children"> & {
  label: string;
  variant?: Variant;
  size?: Size;
  leadingIcon?: React.ReactNode;
  trailingIcon?: React.ReactNode;
  fullWidth?: boolean;
};

export function Button({
  label,
  variant = "primary",
  size = "md",
  leadingIcon,
  trailingIcon,
  fullWidth,
  disabled,
  ...rest
}: Props) {
  return (
    <Pressable
      {...rest}
      disabled={disabled}
      style={({ pressed }) => [
        styles.base,
        sizeStyles[size],
        variantStyles[variant],
        fullWidth && styles.fullWidth,
        pressed && { opacity: 0.85 },
        disabled && { opacity: 0.4 },
      ]}
    >
      {leadingIcon ? <View style={styles.icon}>{leadingIcon}</View> : null}
      <Text variant="bodyMedium" color={textColorFor(variant)}>
        {label}
      </Text>
      {trailingIcon ? <View style={styles.icon}>{trailingIcon}</View> : null}
    </Pressable>
  );
}

function textColorFor(variant: Variant) {
  if (variant === "primary") return "white";
  if (variant === "destructive") return "white";
  if (variant === "secondary") return "ink1";
  return "ink2";
}

const styles = StyleSheet.create({
  base: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: radii.full,
    gap: spacing.s,
  },
  fullWidth: { alignSelf: "stretch" },
  icon: { flexShrink: 0 },
});

const sizeStyles = StyleSheet.create({
  sm: { paddingVertical: spacing.s, paddingHorizontal: spacing.md },
  md: { paddingVertical: spacing.sm, paddingHorizontal: spacing.lg },
  lg: { paddingVertical: spacing.md, paddingHorizontal: spacing.xl },
});

const variantStyles = StyleSheet.create({
  primary: { backgroundColor: colors.g500 },
  secondary: { backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border },
  ghost: { backgroundColor: colors.transparent },
  destructive: { backgroundColor: colors.alert },
});
