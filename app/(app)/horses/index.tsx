import { Image } from "expo-image";
import { Link } from "expo-router";
import { ScrollView, StyleSheet, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { Card } from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/EmptyState";
import { SkeletonRow } from "@/components/ui/Skeleton";
import { StatusDot } from "@/components/ui/StatusDot";
import { Text } from "@/components/ui/Text";
import { colors } from "@/constants/colors";
import { spacing } from "@/constants/spacing";
import { useHorses } from "@/hooks/useHorses";
import { useBarnStore } from "@/stores/barnStore";

export default function Horses() {
  const barnId = useBarnStore((s) => s.currentBarnId);
  const barnName = useBarnStore((s) => s.currentBarnName);
  const { data, isLoading } = useHorses(barnId);
  const horses = data ?? [];

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <ScrollView contentContainerStyle={styles.body}>
        <Text variant="eyebrow" color="ink3">
          HORSES · {horses.length}
        </Text>
        <Text variant="display" style={{ marginBottom: spacing.s }}>
          {barnName ?? "Your barn"}.
        </Text>

        {isLoading ? (
          <Card padding="none">
            <SkeletonRow />
            <SkeletonRow />
            <SkeletonRow />
          </Card>
        ) : horses.length === 0 ? (
          <EmptyState
            emoji="🐴"
            title="No horses yet."
            subtitle="Add a horse to start tracking lessons, care, and ownership."
          />
        ) : (
          horses.map((h) => (
            <Link key={h.id} href={`/horses/${h.id}` as never} asChild>
              <Card padding="md" style={styles.row}>
                <View style={styles.avatar}>
                  {h.photo_url ? (
                    <Image source={{ uri: h.photo_url }} style={StyleSheet.absoluteFill} contentFit="cover" />
                  ) : (
                    <Text variant="bodyMedium" color="g700">
                      {h.name[0]?.toUpperCase()}
                    </Text>
                  )}
                </View>
                <View style={{ flex: 1 }}>
                  <Text variant="bodyMedium">{h.name}</Text>
                  <Text variant="caption" color="ink3">
                    {[h.breed, h.age ? `${h.age}y` : null, h.stall ? `Stall #${h.stall}` : null]
                      .filter(Boolean)
                      .join(" · ")}
                  </Text>
                </View>
                <StatusDot status="ok" size={8} />
              </Card>
            </Link>
          ))
        )}
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
    overflow: "hidden",
  },
});
