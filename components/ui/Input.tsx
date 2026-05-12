import { forwardRef, useState } from "react";
import { StyleSheet, TextInput, TextInputProps, View } from "react-native";

import { colors } from "@/constants/colors";
import { radii, spacing } from "@/constants/spacing";
import { fontSizes, fonts } from "@/constants/typography";

import { Text } from "./Text";

type Props = TextInputProps & {
  label?: string;
  error?: string;
  helper?: string;
};

export const Input = forwardRef<TextInput, Props>(function Input(
  { label, error, helper, style, onFocus, onBlur, ...rest },
  ref,
) {
  const [focused, setFocused] = useState(false);

  return (
    <View style={{ gap: spacing.xs }}>
      {label ? (
        <Text variant="label" color="ink2">
          {label.toUpperCase()}
        </Text>
      ) : null}
      <TextInput
        ref={ref}
        {...rest}
        placeholderTextColor={colors.ink3}
        style={[
          styles.input,
          focused && styles.focused,
          Boolean(error) && styles.errored,
          style,
        ]}
        onFocus={(e) => {
          setFocused(true);
          onFocus?.(e);
        }}
        onBlur={(e) => {
          setFocused(false);
          onBlur?.(e);
        }}
      />
      {error ? (
        <Text variant="caption" color="alert">
          {error}
        </Text>
      ) : helper ? (
        <Text variant="caption" color="ink3">
          {helper}
        </Text>
      ) : null}
    </View>
  );
});

const styles = StyleSheet.create({
  input: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radii.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    fontSize: fontSizes.lg,
    fontFamily: fonts.sans,
    color: colors.ink1,
  },
  focused: { borderColor: colors.g500 },
  errored: { borderColor: colors.alertDot },
});
