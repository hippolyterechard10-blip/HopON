import { Pressable, ScrollView, StyleSheet, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { Card } from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/EmptyState";
import { SkeletonRow } from "@/components/ui/Skeleton";
import { Tag } from "@/components/ui/Tag";
import { Text } from "@/components/ui/Text";
import { colors } from "@/constants/colors";
import { spacing } from "@/constants/spacing";
import { useInvoices } from "@/hooks/useInvoices";
import { useBarnStore } from "@/stores/barnStore";

export default function Invoices() {
  const barnId = useBarnStore((s) => s.currentBarnId);
  const { data, isLoading } = useInvoices(barnId);
  const rows = data ?? [];

  const totalOverdue = rows
    .filter((r) => r.status === "overdue")
    .reduce((s, r) => s + r.total_cents, 0);

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <ScrollView contentContainerStyle={styles.body}>
        <Text variant="eyebrow" color="ink3">
          INVOICES · {rows.length}
        </Text>
        <Text variant="display">Receivables.</Text>

        {totalOverdue > 0 ? (
          <Card padding="md" style={{ backgroundColor: colors.warnBg, borderColor: colors.warnBg }}>
            <Text variant="bodyMedium" color="warn">
              ${Math.round(totalOverdue / 100).toLocaleString()} overdue
            </Text>
            <Text variant="caption" color="warn" style={{ marginTop: 2 }}>
              Friendly nudges already sent — follow up if it lingers.
            </Text>
          </Card>
        ) : null}

        {isLoading ? (
          <Card padding="none">
            <SkeletonRow />
            <SkeletonRow />
            <SkeletonRow />
          </Card>
        ) : rows.length === 0 ? (
          <EmptyState
            emoji="🧾"
            title="No invoices yet."
            subtitle="Completed lessons auto-generate invoices once Stripe is connected."
          />
        ) : (
          <Card padding="none">
            {rows.map((inv, i) => {
              const tone =
                inv.status === "paid"
                  ? "ok"
                  : inv.status === "overdue"
                    ? "warn"
                    : inv.status === "sent"
                      ? "brand"
                      : "neutral";
              return (
                <Pressable
                  key={inv.id}
                  style={[styles.row, i !== 0 && { borderTopWidth: 1, borderTopColor: colors.border }]}
                >
                  <View style={{ flex: 1 }}>
                    <Text variant="bodyMedium">{inv.client?.full_name ?? "Client"}</Text>
                    <Text variant="caption" color="ink3">
                      {inv.due_date
                        ? `Due ${new Date(inv.due_date).toLocaleDateString()}`
                        : new Date(inv.created_at).toLocaleDateString()}
                    </Text>
                  </View>
                  <Text variant="bodyMedium">${Math.round(inv.total_cents / 100)}</Text>
                  <Tag label={inv.status} tone={tone} />
                </Pressable>
              );
            })}
          </Card>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  body: { padding: spacing.lg, gap: spacing.s, paddingBottom: spacing["3xl"] },
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    padding: spacing.md,
  },
});
