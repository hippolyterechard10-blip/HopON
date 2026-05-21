import { useRouter, useSegments } from "expo-router";
import { useMemo, useState } from "react";
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
import { useBarnStore } from "@/stores/barnStore";
import { computeHomeVariant } from "@/types/roles";

type PetalDef = {
  emoji: string;
  label: string;
  /** Path to navigate to. Mutually exclusive with `toast`. */
  path?: string;
  /** Composer placeholder until the real screen lands. */
  toast?: { title: string; body: string };
};

const PETALS: Record<string, PetalDef> = {
  lesson:  { emoji: "📚", label: "Lesson",  path: "/(app)/booking" },
  event:   { emoji: "📅", label: "Event",   path: "/(app)/calendar" },
  todo:    { emoji: "✅", label: "To-do",   path: "/(app)/tasks/new" },
  post:    { emoji: "💬", label: "Post",    path: "/(app)/news/new" },
  service: { emoji: "✨", label: "Service", path: "/(app)/services" },
  horse:   { emoji: "🐴", label: "Horse",   toast: { title: "Add horse", body: "Horse composer opens." } },
  client:  { emoji: "👤", label: "Client",  toast: { title: "Add client", body: "QR · link · CSV import." } },
  team:    { emoji: "🧑", label: "Team",    toast: { title: "Invite team", body: "Send invite link." } },
  partner: { emoji: "🤝", label: "Partner", toast: { title: "Add partner", body: "Vet · farrier · transport…" } },
  photo:   { emoji: "📷", label: "Photo",   toast: { title: "Photo", body: "Camera composer opens." } },
  poll:    { emoji: "📊", label: "Poll",    toast: { title: "Poll started", body: "Pick groups to ask." } },
  note:    { emoji: "📝", label: "Note",    toast: { title: "Note added", body: "Saved on horse timeline." } },
  health:  { emoji: "🩺", label: "Health",  toast: { title: "Health log", body: "Treatment composer opens." } },
  invoice: { emoji: "🧾", label: "Invoice", path: "/(app)/invoices" },
  payment: { emoji: "💰", label: "Payment", toast: { title: "Payment recorded", body: "Stripe · Zelle · Square." } },
};

// Bucket the home variants into 3 FAB permission groups.
type FabRole = "owner" | "team" | "client";

function fabRoleFor(variant: ReturnType<typeof computeHomeVariant>): FabRole {
  if (variant === "owner" || variant === "owner_trainer") return "owner";
  if (variant === "client") return "client";
  return "team"; // trainer · groom
}

// Reusable petal sets (matches docs/pitch.html FAB_MATRIX).
const INTERNAL_STD = ["lesson", "event", "todo", "post", "service"] as const;
const CLIENT_STD   = ["lesson", "event", "post", "service"] as const;
const STABLE_ADMIN = ["horse", "client", "team", "partner"] as const;
const FEED_ALL     = ["post", "photo", "poll"] as const;
const HORSE_TEAM   = ["note", "health", "photo", "todo"] as const;
const HORSE_CLIENT = ["note", "health", "photo", "service"] as const;
const DASHBOARD_OWNER = ["invoice", "payment", "note"] as const;

type ScreenKey =
  | "home"
  | "calendar"
  | "whiteboard"
  | "stable"
  | "feed"
  | "horse"
  | "dashboard";

const FAB_MATRIX: Record<ScreenKey, Partial<Record<FabRole, readonly string[]>>> = {
  home:       { owner: INTERNAL_STD, team: INTERNAL_STD, client: CLIENT_STD },
  calendar:   { owner: INTERNAL_STD, team: INTERNAL_STD, client: CLIENT_STD },
  whiteboard: { owner: INTERNAL_STD, team: INTERNAL_STD },
  stable:     { owner: STABLE_ADMIN, team: STABLE_ADMIN },
  feed:       { owner: FEED_ALL,     team: FEED_ALL,     client: FEED_ALL },
  horse:      { owner: HORSE_TEAM,   team: HORSE_TEAM,   client: HORSE_CLIENT },
  dashboard:  { owner: DASHBOARD_OWNER },
};

// Map the (app)/ route segment to a ScreenKey. Routes not listed → FAB hidden.
function screenFromSegment(segment: string | undefined): ScreenKey | null {
  switch (segment) {
    case undefined:
    case "":
    case "index":
      return "home";
    case "calendar":   return "calendar";
    case "whiteboard": return "whiteboard";
    case "mystable":   return "stable";
    case "feed":       return "feed";
    case "horses":     return "horse";
    case "dashboard":  return "dashboard";
    default:           return null; // booking, news, settings, tasks, etc.
  }
}

const FAB_SIZE = 56;
const PETAL_RADIUS = 144;

/**
 * Adaptive FAB — pétales déterminés par (écran, rôle).
 * Règle d'or : le "+" n'est jamais remplacé par une autre action.
 * Il ouvre toujours les pétales — ou se masque si rien à proposer.
 * Voir docs/pitch.html FAB_MATRIX pour la matrice de référence.
 */
export function FAB() {
  const router = useRouter();
  const segments = useSegments();
  const roles = useBarnStore((s) => s.currentRoles);
  const [open, setOpen] = useState(false);
  const progress = useSharedValue(0);

  const petalIds = useMemo<readonly string[]>(() => {
    // Inside the (app) group: segments[0] === "(app)", segments[1] === route.
    const route = segments.find((s) => s && !s.startsWith("("));
    const screen = screenFromSegment(route);
    if (!screen) return [];
    const variant = computeHomeVariant(roles.length ? roles : ["barn_owner"]);
    const ids = FAB_MATRIX[screen][fabRoleFor(variant)];
    return ids ?? [];
  }, [segments, roles]);

  const toggle = (next?: boolean) => {
    const target = next ?? !open;
    setOpen(target);
    progress.value = target
      ? withSpring(1, { damping: 14, stiffness: 200, mass: 0.6 })
      : withTiming(0, { duration: 180 });
  };

  const onPick = (id: string) => {
    toggle(false);
    const petal = PETALS[id];
    if (!petal) return;
    if (petal.path) {
      setTimeout(() => router.push(petal.path as never), 120);
    } else if (petal.toast) {
      setTimeout(() => Alert.alert(petal.toast!.title, petal.toast!.body), 120);
    }
  };

  const backdropStyle = useAnimatedStyle(() => ({ opacity: progress.value }));
  const fabIconStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${interpolate(progress.value, [0, 1], [0, 45])}deg` }],
  }));

  if (petalIds.length === 0) return null;

  return (
    <>
      <Animated.View
        pointerEvents={open ? "auto" : "none"}
        style={[StyleSheet.absoluteFill, styles.backdrop, backdropStyle]}
      >
        <Pressable style={StyleSheet.absoluteFill} onPress={() => toggle(false)} />
      </Animated.View>

      <View style={styles.petalsAnchor} pointerEvents={open ? "box-none" : "none"}>
        {petalIds.map((id, i) => (
          <PetalView
            key={id}
            index={i}
            total={petalIds.length}
            progress={progress}
            id={id}
            onPress={onPick}
          />
        ))}
      </View>

      <Pressable
        onPress={() => toggle()}
        style={styles.fab}
        accessibilityLabel={open ? "Close menu" : "Open menu"}
      >
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
  id,
  onPress,
}: {
  index: number;
  total: number;
  progress: SharedValue<number>;
  id: string;
  onPress: (id: string) => void;
}) {
  const petal = PETALS[id];
  // Quarter-arc: index 0 straight up, last index straight left.
  const t = total === 1 ? Math.PI / 4 : (Math.PI / 2) * (index / (total - 1));
  const tx = -Math.sin(t) * PETAL_RADIUS;
  const ty = -Math.cos(t) * PETAL_RADIUS;

  const style = useAnimatedStyle(() => {
    const staggered = Math.max(
      0,
      Math.min(1, (progress.value - index * 0.06) / (1 - index * 0.06)),
    );
    return {
      transform: [
        { translateX: tx * staggered },
        { translateY: ty * staggered },
        { scale: staggered },
      ],
      opacity: progress.value,
    };
  });

  if (!petal) return null;

  return (
    <Animated.View style={[styles.petal, style]} pointerEvents="box-none">
      <Pressable
        onPress={() => onPress(id)}
        style={styles.petalBtn}
        accessibilityLabel={petal.label}
      >
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
    backgroundColor: "rgba(11, 47, 35, 0.55)",
  },
  petalsAnchor: {
    position: "absolute",
    right: 20 + FAB_SIZE / 2 - 24,
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
