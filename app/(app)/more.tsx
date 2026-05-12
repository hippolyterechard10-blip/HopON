import { useRouter } from "expo-router";
import { Pressable, ScrollView, StyleSheet, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Text } from "@/components/ui/Text";
import { colors } from "@/constants/colors";
import { spacing } from "@/constants/spacing";
import { signOut } from "@/lib/auth";
import { useAuthStore } from "@/stores/authStore";
import { useBarnStore } from "@/stores/barnStore";

type Row = { label: string; sub?: string; emoji: string; path?: string };

export default function More() {
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const barnName = useBarnStore((s) => s.currentBarnName);

  const rows: Row[] = [
    { label: "Team", sub: "Members, roles & invites", emoji: "👥", path: "/(app)/settings/team" },
    { label: "Booking", sub: "Pick a lesson slot", emoji: "📅", path: "/(app)/booking" },
    { label: "Invoices", sub: "Paid, sent, overdue", emoji: "🧾", path: "/(app)/invoices" },
    { label: "Dashboard", sub: "Revenue & payments", emoji: "📈", path: "/(app)/dashboard" },
    { label: "Notifications", sub: "Activity & quiet hours", emoji: "🔔", path: "/(app)/notifications" },
    { label: "Profile", sub: "Name, phone, quiet hours", emoji: "👤", path: "/(app)/settings/profile" },
    { label: "Barn settings", sub: "Name, address, fees", emoji: "🏠", path: "/(app)/settings/barn" },
  ];

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <ScrollView contentContainerStyle={styles.body}>
        <Text variant="eyebrow" color="ink3">
          ACCOUNT
        </Text>
        <Card padding="md">
          <View style={styles.profile}>
            <View style={styles.avatar}>
              <Text variant="h2" color="g700">
                {(user?.email ?? "?").charAt(0).toUpperCase()}
              </Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text variant="bodyMedium">{user?.email ?? "Signed out"}</Text>
              {barnName ? (
                <Text variant="caption" color="ink3">
                  {barnName}
                </Text>
              ) : null}
            </View>
          </View>
        </Card>

        <Text variant="eyebrow" color="ink3" style={{ marginTop: spacing.lg }}>
          MORE
        </Text>
        <Card padding="none">
          {rows.map((r, i) => (
            <Pressable
              key={r.label}
              disabled={!r.path}
              onPress={() => r.path && router.push(r.path as never)}
              style={[styles.row, i !== 0 && { borderTopWidth: 1, borderTopColor: colors.border }]}
            >
              <Text style={styles.emoji}>{r.emoji}</Text>
              <View style={{ flex: 1 }}>
                <Text variant="bodyMedium">{r.label}</Text>
                {r.sub ? (
                  <Text variant="caption" color="ink3">
                    {r.sub}
                  </Text>
                ) : null}
              </View>
              <Text variant="h3" color="ink3">
                ›
              </Text>
            </Pressable>
          ))}
        </Card>

        <View style={{ height: spacing.lg }} />
        <Button label="Sign out" variant="secondary" fullWidth onPress={signOut} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  body: { padding: spacing.lg, gap: spacing.s, paddingBottom: spacing["3xl"] },
  profile: { flexDirection: "row", alignItems: "center", gap: spacing.sm },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.g100,
    alignItems: "center",
    justifyContent: "center",
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    padding: spacing.md,
  },
  emoji: { fontSize: 22, width: 28, textAlign: "center" },
});
