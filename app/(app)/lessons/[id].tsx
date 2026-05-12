import { useLocalSearchParams, useRouter } from "expo-router";
import { ActivityIndicator, Alert, ScrollView, StyleSheet, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/EmptyState";
import { Tag } from "@/components/ui/Tag";
import { Text } from "@/components/ui/Text";
import { colors } from "@/constants/colors";
import { radii, spacing } from "@/constants/spacing";
import { useLesson, useUpdateLessonStatus } from "@/hooks/useLesson";
import { formatTime } from "@/lib/dateRange";

export default function LessonDetail() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { data: lesson, isLoading } = useLesson(id);
  const update = useUpdateLessonStatus();

  if (isLoading) {
    return (
      <SafeAreaView style={[styles.container, styles.loading]} edges={["top"]}>
        <ActivityIndicator color={colors.g500} />
      </SafeAreaView>
    );
  }
  if (!lesson) {
    return (
      <SafeAreaView style={styles.container} edges={["top"]}>
        <View style={{ padding: spacing.lg }}>
          <EmptyState emoji="📅" title="Lesson not found." />
        </View>
      </SafeAreaView>
    );
  }

  const day = new Date(lesson.starts_at).toLocaleDateString(undefined, {
    weekday: "long",
    month: "long",
    day: "numeric",
  });
  const isCancelled =
    lesson.status === "cancelled_client" || lesson.status === "cancelled_trainer";
  const isCompleted = lesson.status === "completed";

  const confirmCancel = () => {
    Alert.alert("Cancel lesson?", "This will notify the trainer and client.", [
      { text: "Keep it", style: "cancel" },
      {
        text: "Cancel lesson",
        style: "destructive",
        onPress: () => update.mutate({ lessonId: lesson.id, status: "cancelled_trainer" }),
      },
    ]);
  };

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <ScrollView contentContainerStyle={styles.body}>
        <View>
          <Text variant="eyebrow" color="ink3">
            {day.toUpperCase()}
          </Text>
          <Text style={styles.time}>{formatTime(lesson.starts_at)}</Text>
          <Text variant="h2" color="ink2">
            {lesson.client?.full_name ?? "—"} · {lesson.horse?.name ?? "—"}
          </Text>
        </View>

        <View style={styles.tagRow}>
          <Tag
            label={lesson.status.replace("_", " ")}
            tone={isCompleted ? "ok" : isCancelled ? "alert" : "neutral"}
          />
          {lesson.level ? <Tag label={lesson.level} tone="brand" /> : null}
          {lesson.discipline ? <Tag label={lesson.discipline} tone="brand" /> : null}
          <Tag label={lesson.is_paid ? "Paid" : "Unpaid"} tone={lesson.is_paid ? "ok" : "warn"} />
        </View>

        <Card padding="md">
          <Text variant="eyebrow" color="ink3">
            DETAILS
          </Text>
          <View style={styles.detailRow}>
            <Text variant="caption" color="ink3">
              Trainer
            </Text>
            <Text variant="body">{lesson.trainer?.full_name ?? "Unassigned"}</Text>
          </View>
          <View style={styles.detailRow}>
            <Text variant="caption" color="ink3">
              Location
            </Text>
            <Text variant="body">{lesson.location ?? "Not set"}</Text>
          </View>
          <View style={styles.detailRow}>
            <Text variant="caption" color="ink3">
              Lesson type
            </Text>
            <Text variant="body">
              {lesson.lesson_type?.name ?? "—"} · {lesson.lesson_type?.duration_minutes ?? "?"} min
            </Text>
          </View>
          {lesson.lesson_type?.price_cents != null ? (
            <View style={styles.detailRow}>
              <Text variant="caption" color="ink3">
                Price
              </Text>
              <Text variant="body">${Math.round(lesson.lesson_type.price_cents / 100)}</Text>
            </View>
          ) : null}
        </Card>

        {lesson.notes ? (
          <Card padding="md">
            <Text variant="eyebrow" color="ink3">
              NOTES
            </Text>
            <Text variant="body" style={{ marginTop: 4 }}>
              {lesson.notes}
            </Text>
          </Card>
        ) : null}

        {!isCancelled && !isCompleted ? (
          <View style={{ gap: spacing.s }}>
            <View style={styles.row}>
              <Button
                label="Start lesson"
                variant="primary"
                size="md"
                fullWidth
                onPress={() => update.mutate({ lessonId: lesson.id, status: "in_progress" })}
              />
              <Button
                label="Mark complete"
                variant="secondary"
                size="md"
                fullWidth
                onPress={() => update.mutate({ lessonId: lesson.id, status: "completed" })}
              />
            </View>
            <Button label="Cancel lesson" variant="destructive" size="md" fullWidth onPress={confirmCancel} />
          </View>
        ) : isCompleted ? (
          <Card padding="md">
            <Text variant="bodyMedium">Lesson complete.</Text>
            <Text variant="caption" color="ink3" style={{ marginTop: 2 }}>
              Charge already settled · receipt sent.
            </Text>
          </Card>
        ) : (
          <Card padding="md">
            <Text variant="bodyMedium" color="alert">
              Cancelled.
            </Text>
            {lesson.cancellation_reason ? (
              <Text variant="caption" color="ink2" style={{ marginTop: 2 }}>
                "{lesson.cancellation_reason}"
              </Text>
            ) : null}
          </Card>
        )}

        <Button label="Back" variant="ghost" size="md" fullWidth onPress={() => router.back()} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  loading: { justifyContent: "center", alignItems: "center" },
  body: { padding: spacing.lg, gap: spacing.md, paddingBottom: spacing["3xl"] },
  time: {
    fontFamily: "DMSerifDisplay_400Regular_Italic",
    fontSize: 48,
    color: colors.ink1,
    letterSpacing: -0.6,
    marginTop: 4,
  },
  tagRow: { flexDirection: "row", gap: spacing.xs, flexWrap: "wrap" },
  detailRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: spacing.xs,
    borderTopWidth: 0,
  },
  row: { flexDirection: "row", gap: spacing.s },
});
