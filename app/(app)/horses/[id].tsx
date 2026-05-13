import { Image } from "expo-image";
import { useLocalSearchParams } from "expo-router";
import { useState } from "react";
import { ActivityIndicator, Alert, Pressable, ScrollView, StyleSheet, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/EmptyState";
import { Tag } from "@/components/ui/Tag";
import { Text } from "@/components/ui/Text";
import { colors } from "@/constants/colors";
import { radii, spacing } from "@/constants/spacing";
import { useHorseFeed } from "@/hooks/useHorseFeed";
import {
  useHorseWeeklyActivity,
  type ActivityItem,
  type ActivityKind,
} from "@/hooks/useHorseWeeklyActivity";
import { useHorse } from "@/hooks/useHorses";
import { formatTime } from "@/lib/dateRange";
import { uploadImage } from "@/lib/storage";
import { supabase } from "@/lib/supabase";
import type { Horse } from "@/types/app.types";

type Tab = "info" | "activity" | "health" | "feed";

export default function HorseDetail() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { data: horse, isLoading, refetch } = useHorse(id);
  const [tab, setTab] = useState<Tab>("info");

  const onChangePhoto = async () => {
    if (!horse) return;
    try {
      const { launchImageLibraryAsync, MediaTypeOptions, requestMediaLibraryPermissionsAsync } =
        await import("expo-image-picker");
      const perm = await requestMediaLibraryPermissionsAsync();
      if (!perm.granted) return;
      const res = await launchImageLibraryAsync({
        mediaTypes: MediaTypeOptions.Images,
        quality: 0.7,
        allowsEditing: true,
        aspect: [16, 9],
      });
      if (res.canceled || !res.assets[0]) return;
      const url = await uploadImage(
        "horse-photos",
        res.assets[0].uri,
        `${horse.id}/${Date.now()}.jpg`,
      );
      if (!url) {
        Alert.alert("Upload failed", "Could not upload photo. Is the bucket configured?");
        return;
      }
      const { error } = await supabase.from("horses").update({ photo_url: url }).eq("id", horse.id);
      if (error) {
        Alert.alert("Save failed", error.message);
        return;
      }
      await refetch();
    } catch (e) {
      Alert.alert("Photo error", e instanceof Error ? e.message : "Try again.");
    }
  };

  if (isLoading) {
    return (
      <SafeAreaView style={[styles.container, styles.loading]} edges={["top"]}>
        <ActivityIndicator color={colors.g500} />
      </SafeAreaView>
    );
  }
  if (!horse) {
    return (
      <SafeAreaView style={styles.container} edges={["top"]}>
        <View style={{ padding: spacing.lg }}>
          <EmptyState emoji="🐴" title="Horse not found." subtitle="It may have been removed from this barn." />
        </View>
      </SafeAreaView>
    );
  }

  // Day 3 header convention: "Tornado, 9 years, KWPN"
  const headerLine = [
    horse.age ? `${horse.age} ${horse.age === 1 ? "year" : "years"}` : null,
    horse.breed,
  ]
    .filter(Boolean)
    .join(", ");

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <ScrollView>
        <View style={styles.hero}>
          {horse.photo_url ? (
            <Image source={{ uri: horse.photo_url }} style={StyleSheet.absoluteFill} contentFit="cover" />
          ) : null}
          <View style={styles.heroGradient} />
          <View style={styles.heroOverlay}>
            {horse.stall ? (
              <Text variant="eyebrow" color="g200">
                STALL #{horse.stall}
              </Text>
            ) : null}
            <Text style={styles.heroName}>{horse.name}</Text>
            {headerLine ? (
              <Text variant="caption" color="g200">
                {headerLine}
              </Text>
            ) : null}
          </View>
          <Pressable onPress={onChangePhoto} style={styles.heroEdit}>
            <Text variant="label" color="white">
              {horse.photo_url ? "Change photo" : "Add photo"}
            </Text>
          </Pressable>
        </View>

        <View style={styles.tabs}>
          {(["info", "activity", "health", "feed"] as const).map((t) => (
            <Pressable key={t} onPress={() => setTab(t)} style={styles.tab}>
              <Text variant="bodyMedium" color={tab === t ? "ink1" : "ink3"}>
                {t === "info" ? "Info" : t === "activity" ? "Activity" : t === "health" ? "Health" : "Feed"}
              </Text>
              {tab === t ? <View style={styles.tabUnderline} /> : null}
            </Pressable>
          ))}
        </View>

        <View style={styles.body}>
          {tab === "info" ? <InfoTab horse={horse} /> : null}
          {tab === "activity" ? <ActivityTab horseId={horse.id} /> : null}
          {tab === "health" ? <HealthTab horse={horse} onChanged={refetch} /> : null}
          {tab === "feed" ? <FeedTab horseId={horse.id} /> : null}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function InfoTab({ horse }: { horse: Horse }) {
  return (
    <View style={{ gap: spacing.md }}>
      <Field label="Stall" value={horse.stall ? `#${horse.stall}` : "—"} />
      <Field label="Breed" value={horse.breed ?? "—"} />
      <Field label="Age" value={horse.age ? `${horse.age} years` : "—"} />
      <Field label="Feeding" value={horse.feeding_notes ?? "Not set"} />
      <Field label="Equipment" value={horse.equipment_notes ?? "Not set"} />
      <Field
        label="Vet"
        value={[horse.vet_name, horse.vet_phone].filter(Boolean).join(" · ") || "Not set"}
      />
      <Field
        label="Farrier"
        value={[horse.farrier_name, horse.farrier_phone].filter(Boolean).join(" · ") || "Not set"}
      />
    </View>
  );
}

const WEEKDAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"] as const;

function ActivityTab({ horseId }: { horseId: string }) {
  const [anchor] = useState(new Date());
  const { data, isLoading } = useHorseWeeklyActivity(horseId, anchor);
  const start = mondayOf(anchor);
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const grouped = new Array(7).fill(null).map((_, idx) => {
    const day = new Date(start);
    day.setDate(start.getDate() + idx);
    const items = (data ?? []).filter((it) => {
      const d = new Date(it.starts_at);
      d.setHours(0, 0, 0, 0);
      return d.getTime() === day.getTime();
    });
    return { date: day, items };
  });

  if (isLoading) {
    return (
      <View>
        <Text variant="caption" color="ink3">
          Loading week…
        </Text>
      </View>
    );
  }

  return (
    <View style={{ gap: spacing.md }}>
      <View style={styles.weekRow}>
        {grouped.map(({ date, items }, i) => {
          const isToday = date.getTime() === today.getTime();
          return (
            <View key={i} style={[styles.dayCell, isToday && styles.dayCellToday]}>
              <Text variant="eyebrow" color={isToday ? "g600" : "ink3"}>
                {WEEKDAYS[i]}
              </Text>
              <Text variant="bodyMedium" color={isToday ? "ink1" : "ink2"}>
                {date.getDate()}
              </Text>
              <View style={styles.daySessions}>
                {items.length === 0 ? (
                  <View style={[styles.sessionChip, styles.sessionRest]}>
                    <Text variant="label" color="ink3">
                      rest
                    </Text>
                  </View>
                ) : (
                  items.slice(0, 3).map((it) => <SessionChip key={it.id} item={it} />)
                )}
              </View>
            </View>
          );
        })}
      </View>

      <Text variant="eyebrow" color="ink3">
        LEGEND
      </Text>
      <View style={styles.legendRow}>
        {(["lunge", "flat", "jump", "rest", "show"] as ActivityKind[]).map((k) => (
          <View key={k} style={styles.legendItem}>
            <View style={[styles.legendDot, { backgroundColor: kindColor(k) }]} />
            <Text variant="caption" color="ink2">
              {k}
            </Text>
          </View>
        ))}
      </View>
    </View>
  );
}

function SessionChip({ item }: { item: ActivityItem }) {
  return (
    <View style={[styles.sessionChip, { backgroundColor: kindBg(item.kind) }]}>
      <Text variant="label" color={item.kind === "show" ? "alert" : item.kind === "rest" ? "ink3" : "g600"}>
        {item.kind}
      </Text>
    </View>
  );
}

function HealthTab({ horse, onChanged }: { horse: Horse; onChanged: () => Promise<unknown> }) {
  const [busy, setBusy] = useState(false);

  const onUploadPrescription = async () => {
    setBusy(true);
    try {
      const { launchImageLibraryAsync, MediaTypeOptions, requestMediaLibraryPermissionsAsync } =
        await import("expo-image-picker");
      const perm = await requestMediaLibraryPermissionsAsync();
      if (!perm.granted) return;
      const res = await launchImageLibraryAsync({
        mediaTypes: MediaTypeOptions.Images,
        quality: 0.8,
      });
      if (res.canceled || !res.assets[0]) return;
      const url = await uploadImage(
        "task-photos",
        res.assets[0].uri,
        `prescriptions/${horse.id}/${Date.now()}.jpg`,
      );
      if (!url) {
        Alert.alert("Upload failed", "Could not upload prescription.");
        return;
      }
      Alert.alert(
        "Prescription saved",
        "Treatment auto-creation lands in Wave D once the prescriptions schema is migrated.",
      );
    } catch (e) {
      Alert.alert("Photo error", e instanceof Error ? e.message : "Try again.");
    } finally {
      setBusy(false);
      await onChanged();
    }
  };

  return (
    <View style={{ gap: spacing.md }}>
      <View style={styles.healthIconRow}>
        <HealthIcon emoji="🐴" label="Farrier" subLabel="6 weeks" tone="neutral" />
        <HealthIcon emoji="💉" label="Vaccine" subLabel="3 months" tone="ok" />
        <HealthIcon emoji="💊" label="Vermifuge" subLabel="2 weeks" tone="warn" />
        <HealthIcon emoji="🦷" label="Dentist" subLabel="—" tone="neutral" />
      </View>

      <Field label="Medications" value={horse.medication_notes ?? "No daily medications recorded."} />

      <View style={{ gap: spacing.s }}>
        <Text variant="eyebrow" color="ink3">
          TREATMENTS
        </Text>
        <EmptyState
          emoji="📋"
          title="No treatments yet."
          subtitle="Upload a prescription to auto-create one — coming with the Day 3 schema migration."
        />
      </View>

      <Card padding="md">
        <Text variant="eyebrow" color="ink3">
          UPLOAD PRESCRIPTION
        </Text>
        <Text variant="caption" color="ink2" style={{ marginTop: 6, marginBottom: spacing.sm }}>
          PDF or photo. We archive it on the horse indefinitely. The owner gets notified when a
          related task is completed.
        </Text>
        <Button
          label={busy ? "Uploading…" : "Choose file"}
          variant="primary"
          size="md"
          fullWidth
          disabled={busy}
          onPress={onUploadPrescription}
        />
      </Card>
    </View>
  );
}

function HealthIcon({
  emoji,
  label,
  subLabel,
  tone,
}: {
  emoji: string;
  label: string;
  subLabel: string;
  tone: "ok" | "warn" | "alert" | "neutral";
}) {
  const ringColor =
    tone === "ok" ? colors.okDot : tone === "warn" ? colors.warnDot : tone === "alert" ? colors.alertDot : colors.n200;
  return (
    <View style={styles.healthIcon}>
      <View style={[styles.healthIconCircle, { borderColor: ringColor }]}>
        <Text style={styles.healthEmoji}>{emoji}</Text>
      </View>
      <Text variant="label" color="ink1" style={{ marginTop: 4 }}>
        {label}
      </Text>
      <Text variant="caption" color="ink3">
        {subLabel}
      </Text>
    </View>
  );
}

function FeedTab({ horseId }: { horseId: string }) {
  const { data, isLoading } = useHorseFeed(horseId);
  const items = data ?? [];

  if (isLoading) {
    return (
      <Text variant="caption" color="ink3">
        Loading…
      </Text>
    );
  }
  if (items.length === 0) {
    return (
      <EmptyState
        emoji="📓"
        title="No updates yet."
        subtitle="Care notes, photos, and vet reports will appear here."
      />
    );
  }
  return (
    <View style={{ gap: spacing.s }}>
      {items.map((item) => (
        <Card key={item.id} padding="md">
          <View style={{ flexDirection: "row", alignItems: "center", gap: spacing.xs }}>
            <Text variant="eyebrow" color="ink3">
              {new Date(item.created_at).toLocaleString()}
            </Text>
            {item.author ? (
              <Text variant="caption" color="ink2">
                · {item.author.full_name}
              </Text>
            ) : null}
          </View>
          <Text variant="body" style={{ marginTop: 6 }}>
            {item.content}
          </Text>
        </Card>
      ))}
    </View>
  );
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <Card padding="md">
      <Text variant="eyebrow" color="ink3">
        {label}
      </Text>
      <Text variant="body" style={{ marginTop: 4 }}>
        {value}
      </Text>
    </Card>
  );
}

function mondayOf(d: Date): Date {
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  const day = x.getDay();
  const diff = (day + 6) % 7;
  x.setDate(x.getDate() - diff);
  return x;
}

function kindColor(k: ActivityKind): string {
  switch (k) {
    case "lunge":
      return colors.g300;
    case "flat":
      return colors.g500;
    case "jump":
      return colors.g700;
    case "rest":
      return colors.n200;
    case "show":
      return colors.alertDot;
  }
}

function kindBg(k: ActivityKind): string {
  switch (k) {
    case "lunge":
      return colors.g100;
    case "flat":
      return colors.g100;
    case "jump":
      return colors.g50;
    case "rest":
      return colors.n50;
    case "show":
      return colors.alertBg;
  }
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  loading: { justifyContent: "center", alignItems: "center" },
  hero: {
    height: 220,
    backgroundColor: colors.g500,
    justifyContent: "flex-end",
    position: "relative",
    overflow: "hidden",
  },
  heroGradient: { ...StyleSheet.absoluteFillObject, backgroundColor: "rgba(11,47,35,0.35)" },
  heroOverlay: { padding: spacing.lg, gap: 2 },
  heroName: {
    fontFamily: "DMSerifDisplay_400Regular_Italic",
    fontSize: 44,
    color: colors.white,
    letterSpacing: -0.5,
  },
  heroEdit: {
    position: "absolute",
    top: spacing.md,
    right: spacing.md,
    backgroundColor: "rgba(11,47,35,0.45)",
    paddingHorizontal: spacing.sm,
    paddingVertical: 6,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.18)",
  },
  tabs: {
    flexDirection: "row",
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  tab: {
    flex: 1,
    paddingVertical: spacing.md,
    alignItems: "center",
    position: "relative",
  },
  tabUnderline: {
    position: "absolute",
    bottom: 0,
    left: "25%",
    right: "25%",
    height: 2,
    backgroundColor: colors.g500,
  },
  body: { padding: spacing.lg, gap: spacing.md, paddingBottom: spacing["3xl"] },

  // Activity tab
  weekRow: {
    flexDirection: "row",
    gap: 4,
  },
  dayCell: {
    flex: 1,
    backgroundColor: colors.surface,
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: colors.border,
    paddingVertical: spacing.s,
    paddingHorizontal: 4,
    alignItems: "center",
    gap: 2,
    minHeight: 96,
  },
  dayCellToday: {
    borderColor: colors.g500,
    backgroundColor: colors.g50,
  },
  daySessions: { gap: 3, marginTop: spacing.xs, alignSelf: "stretch" },
  sessionChip: {
    paddingHorizontal: 4,
    paddingVertical: 3,
    borderRadius: radii.s,
    alignItems: "center",
  },
  sessionRest: { backgroundColor: colors.n50 },
  legendRow: { flexDirection: "row", flexWrap: "wrap", gap: spacing.md },
  legendItem: { flexDirection: "row", alignItems: "center", gap: 6 },
  legendDot: { width: 10, height: 10, borderRadius: 5 },

  // Health tab
  healthIconRow: { flexDirection: "row", gap: spacing.s, justifyContent: "space-between" },
  healthIcon: { flex: 1, alignItems: "center" },
  healthIconCircle: {
    width: 52,
    height: 52,
    borderRadius: 26,
    borderWidth: 2,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.surface,
  },
  healthEmoji: { fontSize: 24 },
});
