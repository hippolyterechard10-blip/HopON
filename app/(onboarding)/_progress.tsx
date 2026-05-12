import { StyleSheet, View } from "react-native";

import { colors } from "@/constants/colors";
import { spacing } from "@/constants/spacing";

export function Progress({ step }: { step: 1 | 2 | 3 | 4 }) {
  return (
    <View style={styles.row}>
      {[1, 2, 3, 4].map((n) => (
        <View key={n} style={[styles.dot, n <= step && styles.active]} />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: "row", gap: spacing.xs, marginBottom: spacing.lg },
  dot: { flex: 1, height: 3, borderRadius: 2, backgroundColor: colors.n200 },
  active: { backgroundColor: colors.g500 },
});
