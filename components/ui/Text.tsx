import { Text as RNText, TextProps, TextStyle, StyleSheet } from "react-native";

import { colors, type ColorToken } from "@/constants/colors";
import { textVariants, type TextVariant } from "@/constants/typography";

type Props = TextProps & {
  variant?: TextVariant;
  color?: ColorToken;
  style?: TextStyle | TextStyle[];
};

export function Text({ variant = "body", color = "ink1", style, ...rest }: Props) {
  return (
    <RNText
      {...rest}
      style={StyleSheet.flatten([textVariants[variant], { color: colors[color] }, style])}
    />
  );
}
