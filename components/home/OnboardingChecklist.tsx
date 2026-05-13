import { useRouter } from "expo-router";
import { useEffect } from "react";
import { Pressable, StyleSheet, View } from "react-native";

import { Text } from "@/components/ui/Text";
import { colors } from "@/constants/colors";
import { radii, spacing } from "@/constants/spacing";
import { useOnboardingChecklist } from "@/hooks/useOnboardingChecklist";
import { useBarnStore } from "@/stores/barnStore";
import { useDismissStore } from "@/stores/dismissStore";

const DISMISS_KEY = "onboarding-checklist";

/**
 * Day 3 spec — 0/4 → 4/4 progress bar surfaced on the homepage for
 * owners + trainers who haven't finished setting their barn up yet.
 * Auto-hides when all 4 steps are done or the user taps "Don't show again".
 */
export function OnboardingChecklist() {
  const router = useRouter();
  const barnId = useBarnStore((s) => s.currentBarnId);
  const { data, isLoading } = useOnboardingChecklist(barnId);
  const dismissed = useDismissStore((s) => s.dismissed);
  const hydrated = useDismissStore((s) => s.hydrated);
  const hydrate = useDismissStore((s) => s.hydrate);
  const dismiss = useDismissStore((s) => s.dismiss);

  useEffect(() => {
    if (!hydrated) hydrate();
  }, [hydrated, hydrate]);

  if (isLoading || !data || !hydrated) return null;
  if (dismissed[DISMISS_KEY]) return null;
  const done = data.filter((d) => d.done).length;
  if (done === data.length) return null;

  return (
    <View style={styles.wrap}>
      <View style={styles.head}>
        <Text variant="eyebrow" color="g600">
          GET YOUR BARN UP · {done}/{data.length}
        </Text>
        <Pressable onPress={() => dismiss(DISMISS_KEY)}>
          <Text variant="caption" color="ink3">
            Don't show again
          </Text>
        </Pressable>
      </View>

      <View style={styles.bar}>
        <View style={[styles.barFill, { width: `${(done / data.length) * 100}%` }]} />
      </View>

      <View style={styles.list}>
        {data.map((item) => (
          <Pressable
            key={item.id}
            onPress={() => !item.done && router.push(item.path as never)}
            style={styles.row}
          >
            <View style={[styles.bullet, item.done && styles.bulletDone]}>
              {item.done ? <Text style={styles.bulletCheck}>✓</Text> : null}
            </View>
            <Text
              variant="body"
              color={item.done ? "ink3" : "ink1"}
              style={item.done ? { textDecorationLine: "line-through" } : undefined}
            >
              {item.label}
            </Text>
            {!item.done ? (
              <View style={{ flex: 1, alignItems: "flex-end" }}>
                <Text variant="caption" color="g600">
                  ›
                </Text>
              </View>
            ) : null}
          </Pressable>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    backgroundColor: colors.g50,
    borderRadius: radii.lg,
    padding: spacing.md,
    gap: spacing.s,
    borderWidth: 1,
    borderColor: colors.g100,
  },
  head: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  bar: {
    height: 4,
    backgroundColor: colors.g100,
    borderRadius: 2,
    overflow: "hidden",
  },
  barFill: { height: "100%", backgroundColor: colors.g500 },
  list: { gap: spacing.xs },
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.s,
    paddingVertical: 4,
  },
  bullet: {
    width: 18,
    height: 18,
    borderRadius: 9,
    borderWidth: 1.5,
    borderColor: colors.g300,
    alignItems: "center",
    justifyContent: "center",
  },
  bulletDone: { backgroundColor: colors.g500, borderColor: colors.g500 },
  bulletCheck: { color: colors.white, fontSize: 10 },
});
