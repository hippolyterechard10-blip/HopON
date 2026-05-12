import { Image } from "expo-image";
import { useLocalSearchParams } from "expo-router";
import { useState } from "react";
import { ActivityIndicator, Alert, Pressable, ScrollView, StyleSheet, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { Card } from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/EmptyState";
import { Tag } from "@/components/ui/Tag";
import { Text } from "@/components/ui/Text";
import { colors } from "@/constants/colors";
import { spacing } from "@/constants/spacing";
import { useHorseFeed } from "@/hooks/useHorseFeed";
import { useHorsePlanning } from "@/hooks/useHorsePlanning";
import { useHorse } from "@/hooks/useHorses";
import { formatDayLabel, formatTime } from "@/lib/dateRange";
import { uploadImage } from "@/lib/storage";
import { supabase } from "@/lib/supabase";
import type { Horse } from "@/types/app.types";

type Tab = "info" | "feed" | "planning";

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
            <Text variant="caption" color="g200">
              {[horse.breed, horse.age ? `${horse.age}y` : null].filter(Boolean).join(" · ")}
            </Text>
          </View>
          <Pressable onPress={onChangePhoto} style={styles.heroEdit}>
            <Text variant="label" color="white">
              {horse.photo_url ? "Change photo" : "Add photo"}
            </Text>
          </Pressable>
        </View>

        <View style={styles.tabs}>
          {(["info", "feed", "planning"] as const).map((t) => (
            <Pressable key={t} onPress={() => setTab(t)} style={styles.tab}>
              <Text variant="bodyMedium" color={tab === t ? "ink1" : "ink3"}>
                {t === "info" ? "Info" : t === "feed" ? "Feed" : "Planning"}
              </Text>
              {tab === t ? <View style={styles.tabUnderline} /> : null}
            </Pressable>
          ))}
        </View>

        <View style={styles.body}>
          {tab === "info" ? <InfoTab horse={horse} /> : null}
          {tab === "feed" ? <FeedTab horseId={horse.id} /> : null}
          {tab === "planning" ? <PlanningTab horseId={horse.id} /> : null}
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
      <Field label="Medication" value={horse.medication_notes ?? "None recorded."} />
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
          <View style={styles.feedHead}>
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

function PlanningTab({ horseId }: { horseId: string }) {
  const { data, isLoading } = useHorsePlanning(horseId);
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
        emoji="🗓️"
        title="Nothing scheduled."
        subtitle="Upcoming lessons, farrier, vet and shows will appear here."
      />
    );
  }
  return (
    <Card padding="none">
      {items.map((it, i) => (
        <View
          key={it.id}
          style={[styles.planRow, i !== 0 && { borderTopWidth: 1, borderTopColor: colors.border }]}
        >
          <View style={{ width: 64 }}>
            <Text variant="eyebrow" color="ink3">
              {formatDayLabel(it.starts_at)}
            </Text>
            <Text variant="bodyMedium">{formatTime(it.starts_at)}</Text>
          </View>
          <Text variant="body" style={{ flex: 1 }}>
            {it.title}
          </Text>
          <Tag
            label={it.kind === "lesson" ? "Lesson" : "Event"}
            tone={it.kind === "lesson" ? "brand" : "neutral"}
          />
        </View>
      ))}
    </Card>
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
  heroGradient: { ...StyleSheet.absoluteFillObject, backgroundColor: "rgba(13,32,24,0.35)" },
  heroOverlay: { padding: spacing.lg, gap: 2 },
  heroEdit: {
    position: "absolute",
    top: spacing.md,
    right: spacing.md,
    backgroundColor: "rgba(13,32,24,0.45)",
    paddingHorizontal: spacing.sm,
    paddingVertical: 6,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.18)",
  },
  heroName: {
    fontFamily: "DMSerifDisplay_400Regular_Italic",
    fontSize: 44,
    color: colors.white,
    letterSpacing: -0.5,
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
    left: "30%",
    right: "30%",
    height: 2,
    backgroundColor: colors.g500,
  },
  body: { padding: spacing.lg, gap: spacing.md, paddingBottom: spacing["3xl"] },
  feedHead: { flexDirection: "row", alignItems: "center", gap: spacing.xs },
  planRow: { flexDirection: "row", alignItems: "center", gap: spacing.sm, padding: spacing.md },
});
