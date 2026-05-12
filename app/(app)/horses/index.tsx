import { ScrollView, StyleSheet, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { Card } from "@/components/ui/Card";
import { StatusDot } from "@/components/ui/StatusDot";
import { Text } from "@/components/ui/Text";
import { colors } from "@/constants/colors";
import { spacing } from "@/constants/spacing";
import { mockHorses } from "@/lib/mockData";

export default function Horses() {
  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <ScrollView contentContainerStyle={styles.body}>
        <Text variant="eyebrow" color="ink3">
          HORSES · {mockHorses.length}
        </Text>
        <Text variant="display" style={{ marginBottom: spacing.s }}>
          Wellington Park.
        </Text>
        {mockHorses.map((h) => (
          <Card key={h.id} padding="md" style={styles.row}>
            <View style={styles.avatar}>
              <Text variant="bodyMedium" color="g700">
                {h.name[0]}
              </Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text variant="bodyMedium">{h.name}</Text>
              <Text variant="caption" color="ink3">
                {h.breed} · {h.age}y · Stall #{h.stall}
              </Text>
            </View>
            <StatusDot status={h.status} size={8} />
          </Card>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  body: { padding: spacing.lg, gap: spacing.s, paddingBottom: spacing["3xl"] },
  row: { flexDirection: "row", alignItems: "center", gap: spacing.sm },
  avatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.g100,
    alignItems: "center",
    justifyContent: "center",
  },
});
