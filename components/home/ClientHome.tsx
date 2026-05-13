import { useRouter } from "expo-router";
import { Image } from "expo-image";
import { Pressable, ScrollView, StyleSheet, View } from "react-native";

import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/EmptyState";
import { Tag } from "@/components/ui/Tag";
import { Text } from "@/components/ui/Text";
import { colors } from "@/constants/colors";
import { radii, spacing } from "@/constants/spacing";
import { useBarnNews } from "@/hooks/useBarnNews";
import { useHorses } from "@/hooks/useHorses";
import { useUpcomingForClient } from "@/hooks/useUpcomingForClient";
import { formatDayLabel, formatTime } from "@/lib/dateRange";
import { useAuthStore } from "@/stores/authStore";
import { useBarnStore } from "@/stores/barnStore";

export function ClientHome() {
  const router = useRouter();
  const barnId = useBarnStore((s) => s.currentBarnId);
  const userId = useAuthStore((s) => s.user?.id);
  const horsesQ = useHorses(barnId);
  const upcomingQ = useUpcomingForClient(barnId, userId);
  const newsQ = useBarnNews(barnId, 3);

  // A client's horse is the first horse where owner_id matches them.
  const myHorse = (horsesQ.data ?? []).find((h) => h.owner_id === userId) ?? null;
  const upcoming = (upcomingQ.data ?? []).slice(0, 5);
  const lessonsThisMonth = (upcomingQ.data ?? []).filter((u) => u.kind === "lesson").length;
  const next = upcoming[0];

  return (
    <ScrollView style={styles.scroll} contentContainerStyle={styles.content}>
      <View style={styles.heroPhoto}>
        {myHorse?.photo_url ? (
          <Image source={{ uri: myHorse.photo_url }} style={StyleSheet.absoluteFill} contentFit="cover" />
        ) : null}
        <View style={styles.heroGradient} />
        <View style={styles.heroOverlay}>
          <Text variant="eyebrow" color="g200">
            MY HORSE
          </Text>
          <Text style={styles.heroName}>{myHorse?.name ?? "—"}</Text>
          <Text variant="caption" color="g200">
            {(myHorse?.breed ?? "")} {myHorse?.age ? `· ${myHorse.age}y` : ""} {myHorse?.stall ? `· Stall #${myHorse.stall}` : ""}
          </Text>
        </View>
      </View>

      <View style={styles.statRow}>
        <Stat label="Health" value="Good" tone="ok" />
        <Stat label="Lessons booked" value={String(lessonsThisMonth)} />
        <Stat
          label="Next ride"
          value={next ? formatDayLabel(next.starts_at) : "—"}
        />
      </View>

      <Pressable onPress={() => router.push("/(app)/booking")}>
        <Card variant="dark" padding="lg" style={styles.bookCard}>
          <View style={{ flex: 1 }}>
            <Text variant="eyebrow" color="g200">
              BOOK A LESSON
            </Text>
            <Text variant="h2" color="white" style={{ marginTop: 2 }}>
              Your next ride is one tap away.
            </Text>
            <Text variant="caption" color="g200" style={{ marginTop: 6 }}>
              Lessons, jump sessions, or a farrier visit.
            </Text>
          </View>
          <Button label="Book" variant="secondary" size="md" onPress={() => router.push("/(app)/booking")} />
        </Card>
      </Pressable>

      <Section title="Upcoming">
        {upcomingQ.isLoading ? (
          <Card padding="md">
            <Text variant="caption" color="ink3">
              Loading…
            </Text>
          </Card>
        ) : upcoming.length === 0 ? (
          <EmptyState
            emoji="🐴"
            title="Nothing booked yet."
            subtitle="Tap Book to pick a lesson slot."
          />
        ) : (
          <Card padding="none">
            {upcoming.map((u, i) => (
              <View
                key={u.id}
                style={[styles.row, i !== 0 && { borderTopWidth: 1, borderTopColor: colors.border }]}
              >
                <View style={styles.dayCol}>
                  <Text variant="eyebrow" color="ink3">
                    {formatDayLabel(u.starts_at)}
                  </Text>
                  <Text variant="bodyMedium">{formatTime(u.starts_at)}</Text>
                </View>
                <View style={{ flex: 1 }}>
                  <Text variant="bodyMedium">{u.title}</Text>
                  <Text variant="caption" color="ink3">
                    {u.kind === "lesson" ? "Lesson" : "Event"}
                  </Text>
                </View>
                <Tag
                  label={u.status === "confirmed" ? "Confirmed" : u.status === "completed" ? "Done" : "Scheduled"}
                  tone={u.status === "confirmed" ? "ok" : "neutral"}
                />
              </View>
            ))}
          </Card>
        )}
      </Section>

      <Section title="From the barn">
        {newsQ.isLoading ? (
          <Card padding="md">
            <Text variant="caption" color="ink3">
              Loading…
            </Text>
          </Card>
        ) : (newsQ.data ?? []).length === 0 ? (
          <EmptyState
            emoji="📰"
            title="Quiet at the barn."
            subtitle="Announcements from your trainer will appear here."
          />
        ) : (
          <Card padding="none">
            {(newsQ.data ?? []).map((n, i) => (
              <View
                key={n.id}
                style={[styles.newsRow, i !== 0 && { borderTopWidth: 1, borderTopColor: colors.border }]}
              >
                <Text variant="caption" color="ink3" style={{ width: 64 }}>
                  {new Date(n.created_at).toLocaleDateString(undefined, { month: "short", day: "numeric" })}
                </Text>
                <Text variant="body" style={{ flex: 1 }}>
                  {n.title}
                </Text>
              </View>
            ))}
          </Card>
        )}
      </Section>
    </ScrollView>
  );
}

function Stat({ label, value, tone = "neutral" }: { label: string; value: string; tone?: "neutral" | "ok" }) {
  return (
    <Card padding="sm" style={{ flex: 1 }}>
      <Text variant="label" color="ink3">
        {label.toUpperCase()}
      </Text>
      <Text variant="h3" color={tone === "ok" ? "ok" : "ink1"} style={{ marginTop: 2 }}>
        {value}
      </Text>
    </Card>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <View style={{ gap: spacing.s }}>
      <Text variant="eyebrow" color="ink3">
        {title}
      </Text>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  scroll: { flex: 1, backgroundColor: colors.bg },
  content: { padding: spacing.lg, gap: spacing.lg, paddingBottom: spacing["3xl"] },
  heroPhoto: {
    height: 200,
    borderRadius: radii.xl,
    backgroundColor: colors.g300,
    justifyContent: "flex-end",
    overflow: "hidden",
    position: "relative",
  },
  heroGradient: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(13,32,24,0.35)",
  },
  heroOverlay: { padding: spacing.lg, gap: 2 },
  heroName: {
    fontFamily: "DMSerifDisplay_400Regular_Italic",
    fontSize: 40,
    color: colors.white,
    letterSpacing: -0.5,
  },
  statRow: { flexDirection: "row", gap: spacing.s },
  bookCard: { flexDirection: "row", alignItems: "center", gap: spacing.sm },
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    padding: spacing.md,
  },
  dayCol: { width: 56 },
  newsRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
  },
});
