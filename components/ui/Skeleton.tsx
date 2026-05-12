import { useEffect, useRef } from "react";
import { Animated, StyleSheet, View } from "react-native";

import { colors } from "@/constants/colors";

type Props = { width?: number | "100%"; height?: number; radius?: number };

export function Skeleton({ width = "100%", height = 14, radius = 6 }: Props) {
  const opacity = useRef(new Animated.Value(0.5)).current;

  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, { toValue: 1, duration: 700, useNativeDriver: true }),
        Animated.timing(opacity, { toValue: 0.5, duration: 700, useNativeDriver: true }),
      ]),
    );
    loop.start();
    return () => loop.stop();
  }, [opacity]);

  return (
    <Animated.View
      style={[
        styles.base,
        { width, height, borderRadius: radius, opacity },
      ]}
    />
  );
}

export function SkeletonRow() {
  return (
    <View style={styles.row}>
      <Skeleton width={36} height={36} radius={18} />
      <View style={{ flex: 1, gap: 6 }}>
        <Skeleton width={180} height={14} />
        <Skeleton width={120} height={12} />
      </View>
      <Skeleton width={40} height={14} />
    </View>
  );
}

const styles = StyleSheet.create({
  base: { backgroundColor: colors.n100 },
  row: { flexDirection: "row", alignItems: "center", gap: 12, paddingVertical: 12, paddingHorizontal: 14 },
});
