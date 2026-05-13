import { useRouter } from "expo-router";
import { useState } from "react";
import { Alert, Pressable, StyleSheet, View } from "react-native";
import Animated, {
  interpolate,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
  type SharedValue,
} from "react-native-reanimated";

import { Text } from "@/components/ui/Text";
import { colors } from "@/constants/colors";
import { radii, spacing } from "@/constants/spacing";

type Petal = {
  id: string;
  label: string;
  emoji: string;
  path?: string;
};

const PETALS: Petal[] = [
  { id: "lesson", label: "Lesson", emoji: "🎯", path: "/(app)/booking" },
  { id: "event", label: "Event", emoji: "📅" },
  { id: "todo", label: "To-Do", emoji: "✅", path: "/(app)/tasks/new" },
  { id: "post", label: "Post", emoji: "📝" },
];

const FAB_SIZE = 56;
const PETAL_RADIUS = 112;

/**
 * Day 3 spec — bottom-right FAB that opens a quarter-circle petal menu
 * with spring + stagger. Standard items: Lesson · Event · To-Do · Post.
 * Tap anywhere on the backdrop (or the FAB) to close.
 *
 * Rendered once at the (app) layout level so it persists across tabs.
 */
export function FAB() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const progress = useSharedValue(0);

  const toggle = (next?: boolean) => {
    const target = next ?? !open;
    setOpen(target);
    progress.value = target
      ? withSpring(1, { damping: 14, stiffness: 200, mass: 0.6 })
      : withTiming(0, { duration: 180 });
  };

  const onPick = (petal: Petal) => {
    toggle(false);
    if (petal.path) {
      // Slight delay so the close animation can breathe.
      setTimeout(() => router.push(petal.path as never), 120);
    } else {
      setTimeout(() => Alert.alert(petal.label, `${petal.label} composer lands in the next wave.`), 120);
    }
  };

  const backdropStyle = useAnimatedStyle(() => ({
    opacity: progress.value,
  }));

  const fabIconStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${interpolate(progress.value, [0, 1], [0, 45])}deg` }],
  }));

  return (
    <>
      <Animated.View
        pointerEvents={open ? "auto" : "none"}
        style={[StyleSheet.absoluteFill, styles.backdrop, backdropStyle]}
      >
        <Pressable style={StyleSheet.absoluteFill} onPress={() => toggle(false)} />
      </Animated.View>

      <View style={styles.petalsAnchor} pointerEvents={open ? "box-none" : "none"}>
        {PETALS.map((p, i) => (
          <PetalView
            key={p.id}
            index={i}
            total={PETALS.length}
            progress={progress}
            petal={p}
            onPress={onPick}
          />
        ))}
      </View>

      <Pressable onPress={() => toggle()} style={styles.fab} accessibilityLabel={open ? "Close menu" : "Open menu"}>
        <Animated.View style={fabIconStyle}>
          <Text style={styles.fabIcon}>＋</Text>
        </Animated.View>
      </Pressable>
    </>
  );
}

function PetalView({
  index,
  total,
  progress,
  petal,
  onPress,
}: {
  index: number;
  total: number;
  progress: SharedValue<number>;
  petal: Petal;
  onPress: (p: Petal) => void;
}) {
  // Quarter-circle arc from straight-up (index 0) to straight-left (last index).
  // t in [0, π/2]; x leftwards, y upwards on screen.
  const t = (Math.PI / 2) * (index / (total - 1));
  const tx = -Math.sin(t) * PETAL_RADIUS;
  const ty = -Math.cos(t) * PETAL_RADIUS;

  const style = useAnimatedStyle(() => {
    const staggered = Math.max(0, Math.min(1, (progress.value - index * 0.06) / (1 - index * 0.06)));
    return {
      transform: [
        { translateX: tx * staggered },
        { translateY: ty * staggered },
        { scale: staggered },
      ],
      opacity: progress.value,
    };
  });

  return (
    <Animated.View style={[styles.petal, style]} pointerEvents="box-none">
      <Pressable onPress={() => onPress(petal)} style={styles.petalBtn} accessibilityLabel={petal.label}>
        <Text style={styles.petalEmoji}>{petal.emoji}</Text>
      </Pressable>
      <View style={styles.petalLabelWrap}>
        <Text variant="label" color="white">
          {petal.label}
        </Text>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    backgroundColor: "rgba(11, 47, 35, 0.55)", // eucalyptus g900-ish overlay
  },
  petalsAnchor: {
    position: "absolute",
    right: 20 + FAB_SIZE / 2 - 24, // align petal anchor to FAB center
    bottom: 84 + FAB_SIZE / 2 - 24,
    width: 48,
    height: 48,
  },
  petal: {
    position: "absolute",
    width: 48,
    height: 48,
    alignItems: "center",
  },
  petalBtn: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.surface,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.18,
    shadowRadius: 10,
    elevation: 6,
  },
  petalEmoji: { fontSize: 22 },
  petalLabelWrap: {
    marginTop: 6,
    paddingHorizontal: spacing.s,
    paddingVertical: 2,
    borderRadius: radii.full,
    backgroundColor: "rgba(11, 47, 35, 0.85)",
  },
  fab: {
    position: "absolute",
    right: 20,
    bottom: 84,
    width: FAB_SIZE,
    height: FAB_SIZE,
    borderRadius: FAB_SIZE / 2,
    backgroundColor: colors.g500,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: colors.g900,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.32,
    shadowRadius: 16,
    elevation: 10,
  },
  fabIcon: {
    color: colors.white,
    fontSize: 32,
    lineHeight: 32,
    fontWeight: "300",
    marginTop: -2,
  },
});
