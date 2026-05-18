import { useRouter } from "expo-router";
import { Image } from "expo-image";
import { Pressable, ScrollView, StyleSheet, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { Card } from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/EmptyState";
import { SkeletonRow } from "@/components/ui/Skeleton";
import { Tag } from "@/components/ui/Tag";
import { Text } from "@/components/ui/Text";
import { colors } from "@/constants/colors";
import { radii, spacing } from "@/constants/spacing";
import { useBarnNews } from "@/hooks/useBarnNews";
import { useAuthStore } from "@/stores/authStore";
import { useBarnStore } from "@/stores/barnStore";

/**
 * Day 3 sprint refinement — Feed = the barn-wide chat. Posts (text + photos)
 * with @-tag audience (@all / @team / @owners / @[custom group]). Chronological
 * stream, newest at top. Retains everything for documentation + traceability
 * (decision: feed wins over chat).
 */
export default function Feed() {
  const router = useRouter();
  const barnId = useBarnStore((s) => s.currentBarnId);
  const user = useAuthStore((s) => s.user);
  const { data, isLoading } = useBarnNews(barnId, 30);
  const posts = data ?? [];

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <View style={styles.header}>
        <View>
          <Text variant="eyebrow" color="ink3">
            BARN FEED
          </Text>
          <Text variant="display">Hop News.</Text>
        </View>
      </View>

      <Pressable style={styles.compose} onPress={() => router.push("/(app)/news/new")}>
        <View style={styles.composeAvatar}>
          <Text variant="bodyMedium" color="g700">
            {(user?.email ?? "?").charAt(0).toUpperCase()}
          </Text>
        </View>
        <Text variant="body" color="ink3" style={{ flex: 1 }}>
          Share something with the barn…
        </Text>
        <View style={styles.composeBtn}>
          <Text variant="label" color="white">
            Post
          </Text>
        </View>
      </Pressable>

      <ScrollView contentContainerStyle={styles.body}>
        {isLoading ? (
          <Card padding="none">
            <SkeletonRow />
            <SkeletonRow />
            <SkeletonRow />
          </Card>
        ) : posts.length === 0 ? (
          <EmptyState
            emoji="📰"
            title="Quiet barn today."
            subtitle="Be the first to post — tag @all to reach everyone, @team for the staff, @owners for the boarders."
          />
        ) : (
          posts.map((p) => <PostCard key={p.id} post={p} />)
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

function PostCard({
  post,
}: {
  post: {
    id: string;
    title: string;
    content: string | null;
    created_at: string;
    author: { id: string; full_name: string } | null;
  };
}) {
  const date = new Date(post.created_at);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const postDay = new Date(date);
  postDay.setHours(0, 0, 0, 0);
  const isToday = postDay.getTime() === today.getTime();
  const timeLabel = isToday
    ? date.toLocaleTimeString(undefined, { hour: "2-digit", minute: "2-digit", hour12: false })
    : date.toLocaleDateString(undefined, { month: "short", day: "numeric" });

  return (
    <Card padding="md" style={styles.post}>
      <View style={styles.postHead}>
        <View style={styles.postAvatar}>
          <Text variant="bodyMedium" color="g700">
            {(post.author?.full_name ?? "?").charAt(0).toUpperCase()}
          </Text>
        </View>
        <View style={{ flex: 1 }}>
          <Text variant="bodyMedium">{post.author?.full_name ?? "Member"}</Text>
          <Text variant="caption" color="ink3">
            {timeLabel}
          </Text>
        </View>
        <Tag label="@all" tone="brand" />
      </View>
      <Text variant="bodyMedium" style={{ marginTop: spacing.s }}>
        {post.title}
      </Text>
      {post.content ? (
        <Text variant="body" color="ink2" style={{ marginTop: 4 }}>
          {post.content}
        </Text>
      ) : null}
    </Card>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  header: {
    padding: spacing.lg,
    paddingBottom: spacing.sm,
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  compose: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    padding: spacing.md,
    margin: spacing.lg,
    marginBottom: 0,
    backgroundColor: colors.surface,
    borderRadius: radii.full,
    borderWidth: 1,
    borderColor: colors.border,
  },
  composeAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.g100,
    alignItems: "center",
    justifyContent: "center",
  },
  composeBtn: {
    paddingVertical: 6,
    paddingHorizontal: spacing.sm,
    borderRadius: radii.full,
    backgroundColor: colors.g500,
  },
  body: { padding: spacing.lg, gap: spacing.s, paddingBottom: spacing["3xl"] },
  post: {},
  postHead: { flexDirection: "row", alignItems: "center", gap: spacing.sm },
  postAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.g100,
    alignItems: "center",
    justifyContent: "center",
  },
});
