import { View, StyleSheet } from "react-native";

import { colors } from "@/constants/colors";

type Status = "ok" | "warn" | "alert" | "neutral";

type Props = {
  status: Status;
  size?: number;
};

export function StatusDot({ status, size = 6 }: Props) {
  return (
    <View
      style={[
        styles.dot,
        { width: size, height: size, borderRadius: size / 2, backgroundColor: dotColor(status) },
      ]}
    />
  );
}

function dotColor(status: Status) {
  switch (status) {
    case "ok":
      return colors.okDot;
    case "warn":
      return colors.warnDot;
    case "alert":
      return colors.alertDot;
    case "neutral":
      return colors.n400;
  }
}

const styles = StyleSheet.create({
  dot: { flexShrink: 0 },
});
