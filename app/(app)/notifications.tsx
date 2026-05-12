import { useRouter } from "expo-router";
import { Pressable, ScrollView, StyleSheet, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/EmptyState";
import { Skeleton } from "@/components/ui/Skeleton";
import { Text } from "@/components/ui/Text";
import { colors } from "@/constants/colors";
import { spacing } from "@/constants/spacing";
import { useMarkAllRead, useMarkRead, useNotifications } from "@/hooks/useNotifications";

export default function NotificationsScreen() {
  const router = useRouter();
  const { data, isLoading } = useNotifications();
  const markRead = useMarkRead();
  const markAll = useMarkAllRead();

  const rows = data ?? [];
  const unread = rows.filter((r) => !r.is_read).length;

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <View style={styles.header}>
        <View style={{ flex: 1 }}>
          <Text variant="eyebrow" color="ink3">
            NOTIFICATIONS · {unread} unread
          </Text>
          <Text variant="display">Activity.</Text>
        </View>
        {unread > 0 ? (
          <Button label="Mark all read" variant="ghost" size="sm" onPress={() => markAll.mutate()} />
        ) : null}
      </View>

      <ScrollView contentContainerStyle={styles.body}>
        {isLoading ? (
          <Card padding="md">
            <Skeleton height={48} />
            <View style={{ height: 8 }} />
            <Skeleton height={48} />
          </Card>
        ) : rows.length === 0 ? (
          <EmptyState
            emoji="🔕"
            title="All caught up."
            subtitle="Lesson reminders, urgent tasks, and barn news land here."
          />
        ) : (
          <Card padding="none">
            {rows.map((n, i) => (
              <Pressable
                key={n.id}
                onPress={() => {
                  if (!n.is_read) markRead.mutate(n.id);
                  const deepLink = (n.data?.path as string | undefined) ?? null;
                  if (deepLink) router.push(deepLink as never);
                }}
                style={[
                  styles.row,
                  i !== 0 && { borderTopWidth: 1, borderTopColor: colors.border },
                  !n.is_read && styles.rowUnread,
                ]}
              >
                {!n.is_read ? <View style={styles.dot} /> : <View style={{ width: 6 }} />}
                <View style={{ flex: 1 }}>
                  <Text variant="bodyMedium">{n.title}</Text>
                  {n.body ? (
                    <Text variant="caption" color="ink2" style={{ marginTop: 2 }}>
                      {n.body}
                    </Text>
                  ) : null}
                  <Text variant="caption" color="ink3" style={{ marginTop: 4 }}>
                    {new Date(n.sent_at).toLocaleString()}
                  </Text>
                </View>
              </Pressable>
            ))}
          </Card>
        )}
      </ScrollView>
    </SafeAreaView>
  );
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
  row: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: spacing.s,
    padding: spacing.md,
  },
  rowUnread: { backgroundColor: colors.g50 },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.g500,
    marginTop: 6,
  },
});
