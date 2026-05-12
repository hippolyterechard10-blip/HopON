import { View, StyleSheet } from "react-native";

import { colors } from "@/constants/colors";
import { radii, spacing } from "@/constants/spacing";

import { Text } from "./Text";

type Tone = "neutral" | "ok" | "warn" | "alert" | "brand";

type Props = {
  label: string;
  tone?: Tone;
};

export function Tag({ label, tone = "neutral" }: Props) {
  const { bg, fg } = toneColors(tone);
  return (
    <View style={[styles.tag, { backgroundColor: bg }]}>
      <Text variant="eyebrow" style={{ color: fg }}>
        {label}
      </Text>
    </View>
  );
}

function toneColors(tone: Tone): { bg: string; fg: string } {
  switch (tone) {
    case "ok":
      return { bg: colors.okBg, fg: colors.ok };
    case "warn":
      return { bg: colors.warnBg, fg: colors.warn };
    case "alert":
      return { bg: colors.alertBg, fg: colors.alert };
    case "brand":
      return { bg: colors.g50, fg: colors.g600 };
    case "neutral":
    default:
      return { bg: colors.n100, fg: colors.ink2 };
  }
}

const styles = StyleSheet.create({
  tag: {
    alignSelf: "flex-start",
    paddingHorizontal: spacing.s,
    paddingVertical: spacing.xxs,
    borderRadius: radii.s,
  },
});
