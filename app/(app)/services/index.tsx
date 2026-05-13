import { useRouter } from "expo-router";
import { Pressable, ScrollView, StyleSheet, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/EmptyState";
import { SegmentedControl } from "@/components/ui/SegmentedControl";
import { SkeletonRow } from "@/components/ui/Skeleton";
import { Tag } from "@/components/ui/Tag";
import { Text } from "@/components/ui/Text";
import { colors } from "@/constants/colors";
import { spacing } from "@/constants/spacing";
import {
  useServiceRequests,
  useUpdateServiceRequestStatus,
  type ServiceRequest,
} from "@/hooks/useServiceRequests";
import { useBarnStore } from "@/stores/barnStore";

type Filter = "all" | "pending" | "confirmed" | "completed";

export default function ServicesList() {
  const router = useRouter();
  const barnId = useBarnStore((s) => s.currentBarnId);
  const { data, isLoading } = useServiceRequests(barnId);
  const update = useUpdateServiceRequestStatus();

  const filterOptions: ReadonlyArray<{ key: Filter; label: string }> = [
    { key: "all", label: "All" },
    { key: "pending", label: "Pending" },
    { key: "confirmed", label: "Confirmed" },
    { key: "completed", label: "Done" },
  ];
  // Static filter for now; just renders everything
  const filter: Filter = "all";

  const rows = (data ?? []).filter((r) => (filter === "all" ? true : r.status === filter));

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <View style={styles.header}>
        <View style={{ flex: 1 }}>
          <Text variant="eyebrow" color="ink3">
            SERVICE REQUESTS
          </Text>
          <Text variant="display">Partners.</Text>
        </View>
        <Button
          label="+ Request"
          variant="primary"
          size="sm"
          onPress={() => router.push("/(app)/services/new" as never)}
        />
      </View>

      <View style={{ padding: spacing.lg, paddingBottom: 0 }}>
        <SegmentedControl
          options={filterOptions}
          value={filter}
          onChange={() => {
            /* placeholder — re-renders need a state hook later */
          }}
        />
      </View>

      <ScrollView contentContainerStyle={styles.body}>
        {isLoading ? (
          <Card padding="none">
            <SkeletonRow />
            <SkeletonRow />
          </Card>
        ) : rows.length === 0 ? (
          <EmptyState
            emoji="🤝"
            title="No service requests yet."
            subtitle="Owners ask, the manager validates, the partner gets a QR-coded link to confirm. Tap + Request to start."
          />
        ) : (
          rows.map((r) => <ServiceRow key={r.id} request={r} onUpdate={update.mutate} />)
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

function ServiceRow({
  request,
  onUpdate,
}: {
  request: ServiceRequest;
  onUpdate: (i: { id: string; status: "confirmed" | "completed" | "cancelled" }) => void;
}) {
  const tone =
    request.status === "completed"
      ? "ok"
      : request.status === "cancelled"
        ? "alert"
        : request.status === "confirmed"
          ? "brand"
          : "warn";
  return (
    <Card padding="md" style={styles.row}>
      <View style={styles.avatar}>
        <Text style={styles.emoji}>{kindEmoji(request.service_type)}</Text>
      </View>
      <View style={{ flex: 1 }}>
        <Text variant="bodyMedium">
          {request.horse?.name ?? "—"} · {request.service_type}
        </Text>
        {request.description ? (
          <Text variant="caption" color="ink3" numberOfLines={2}>
            {request.description}
          </Text>
        ) : null}
        <View style={styles.tagRow}>
          <Tag label={request.status} tone={tone} />
          {request.price_cents != null && request.price_cents > 0 ? (
            <Tag label={`$${Math.round(request.price_cents / 100)}`} tone="neutral" />
          ) : null}
        </View>
      </View>
      {request.status === "pending" ? (
        <Pressable
          style={styles.confirmBtn}
          onPress={() => onUpdate({ id: request.id, status: "confirmed" })}
        >
          <Text variant="label" color="white">
            Confirm
          </Text>
        </Pressable>
      ) : request.status === "confirmed" ? (
        <Pressable
          style={[styles.confirmBtn, { backgroundColor: colors.ok }]}
          onPress={() => onUpdate({ id: request.id, status: "completed" })}
        >
          <Text variant="label" color="white">
            Done
          </Text>
        </Pressable>
      ) : null}
    </Card>
  );
}

function kindEmoji(s: string): string {
  const v = s.toLowerCase();
  if (v.includes("farrier") || v.includes("maréchal")) return "🐴";
  if (v.includes("vet") || v.includes("véto")) return "💉";
  if (v.includes("dentist")) return "🦷";
  if (v.includes("physio")) return "🏃";
  if (v.includes("osteo")) return "🦴";
  if (v.includes("braider")) return "✂️";
  return "🛠️";
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  header: {
    flexDirection: "row",
    alignItems: "flex-end",
    padding: spacing.lg,
    gap: spacing.sm,
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  body: { padding: spacing.lg, gap: spacing.s, paddingBottom: spacing["3xl"] },
  row: { flexDirection: "row", alignItems: "center", gap: spacing.sm },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.g50,
    alignItems: "center",
    justifyContent: "center",
  },
  emoji: { fontSize: 20 },
  tagRow: { flexDirection: "row", gap: spacing.xs, marginTop: 4, flexWrap: "wrap" },
  confirmBtn: {
    paddingVertical: spacing.s,
    paddingHorizontal: spacing.md,
    borderRadius: 999,
    backgroundColor: colors.g500,
  },
});
