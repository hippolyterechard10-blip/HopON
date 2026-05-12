import { ScrollView, StyleSheet, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { Card } from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/EmptyState";
import { SkeletonRow } from "@/components/ui/Skeleton";
import { Tag } from "@/components/ui/Tag";
import { Text } from "@/components/ui/Text";
import { colors } from "@/constants/colors";
import { spacing } from "@/constants/spacing";
import { useBarnMembers } from "@/hooks/useBarnMembers";
import { useBarnStore } from "@/stores/barnStore";
import { ROLE_LABELS } from "@/types/roles";

export default function Team() {
  const barnId = useBarnStore((s) => s.currentBarnId);
  const { data, isLoading } = useBarnMembers(barnId);
  const members = data ?? [];

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <ScrollView contentContainerStyle={styles.body}>
        <Text variant="eyebrow" color="ink3">
          TEAM · {members.length}
        </Text>
        <Text variant="display" style={{ marginBottom: spacing.s }}>
          Your barn.
        </Text>

        {isLoading ? (
          <Card padding="none">
            <SkeletonRow />
            <SkeletonRow />
            <SkeletonRow />
          </Card>
        ) : members.length === 0 ? (
          <EmptyState
            emoji="👥"
            title="Just you for now."
            subtitle="Invite trainers, grooms, and clients to share the load."
          />
        ) : (
          members.map((m) => (
            <Card key={m.id} padding="md" style={styles.row}>
              <View style={styles.avatar}>
                <Text variant="bodyMedium" color="g700">
                  {(m.user?.full_name ?? "?").charAt(0).toUpperCase()}
                </Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text variant="bodyMedium">{m.user?.full_name ?? "Member"}</Text>
                <View style={styles.tagRow}>
                  {m.roles.slice(0, 3).map((r) => (
                    <Tag key={r} label={ROLE_LABELS[r]} tone="brand" />
                  ))}
                </View>
              </View>
            </Card>
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
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.g100,
    alignItems: "center",
    justifyContent: "center",
  },
  tagRow: { flexDirection: "row", gap: 4, marginTop: 4, flexWrap: "wrap" },
});
