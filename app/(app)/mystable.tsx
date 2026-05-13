import { Link, useRouter } from "expo-router";
import { Image } from "expo-image";
import { useMemo, useState } from "react";
import { Linking, Pressable, ScrollView, StyleSheet, TextInput, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Search, Settings as SettingsIcon, Phone } from "lucide-react-native";

import { Card } from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/EmptyState";
import { SegmentedControl } from "@/components/ui/SegmentedControl";
import { SkeletonRow } from "@/components/ui/Skeleton";
import { StatusDot } from "@/components/ui/StatusDot";
import { Tag } from "@/components/ui/Tag";
import { Text } from "@/components/ui/Text";
import { colors } from "@/constants/colors";
import { radii, spacing } from "@/constants/spacing";
import { useBarnMembers } from "@/hooks/useBarnMembers";
import { useHorses } from "@/hooks/useHorses";
import { useBarnStore } from "@/stores/barnStore";
import { ROLE_LABELS } from "@/types/roles";

type SubTab = "horses" | "clients" | "team" | "partners";

const TABS = [
  { key: "horses", label: "Horses" },
  { key: "clients", label: "Clients" },
  { key: "team", label: "Team" },
  { key: "partners", label: "Partners" },
] as const;

export default function MyStable() {
  const router = useRouter();
  const barnName = useBarnStore((s) => s.currentBarnName);
  const [tab, setTab] = useState<SubTab>("horses");
  const [query, setQuery] = useState("");

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <View style={{ flex: 1 }}>
            <Text variant="eyebrow" color="ink3">
              {(barnName ?? "Your barn").toUpperCase()}
            </Text>
            <Text variant="display">My Stable.</Text>
          </View>
          <Pressable
            onPress={() => router.push("/(app)/settings/profile")}
            style={styles.iconBtn}
            accessibilityLabel="Settings"
          >
            <SettingsIcon color={colors.ink2} size={20} />
          </Pressable>
        </View>

        <SegmentedControl options={TABS} value={tab} onChange={setTab} />

        <View style={styles.searchRow}>
          <Search color={colors.ink3} size={16} />
          <TextInput
            value={query}
            onChangeText={setQuery}
            placeholder="Search…"
            placeholderTextColor={colors.ink3}
            style={styles.searchInput}
          />
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.body}>
        {tab === "horses" ? <HorsesPanel query={query} /> : null}
        {tab === "clients" ? <ClientsPanel query={query} /> : null}
        {tab === "team" ? <TeamPanel query={query} /> : null}
        {tab === "partners" ? <PartnersPanel query={query} /> : null}
      </ScrollView>
    </SafeAreaView>
  );
}

function HorsesPanel({ query }: { query: string }) {
  const barnId = useBarnStore((s) => s.currentBarnId);
  const { data, isLoading } = useHorses(barnId);
  const horses = useMemo(() => {
    const q = query.trim().toLowerCase();
    return (data ?? []).filter((h) =>
      !q ? true : h.name.toLowerCase().includes(q) || (h.breed ?? "").toLowerCase().includes(q),
    );
  }, [data, query]);

  if (isLoading) {
    return (
      <Card padding="none">
        <SkeletonRow />
        <SkeletonRow />
        <SkeletonRow />
      </Card>
    );
  }
  if (horses.length === 0) {
    return (
      <EmptyState
        emoji="🐴"
        title={query ? "No matches." : "No horses yet."}
        subtitle={query ? "Try a different search." : "Add a horse to start tracking."}
      />
    );
  }
  return (
    <View style={{ gap: spacing.s }}>
      {horses.map((h) => (
        <Link key={h.id} href={`/horses/${h.id}` as never} asChild>
          <Card padding="md" style={styles.row}>
            <View style={styles.avatar}>
              {h.photo_url ? (
                <Image
                  source={{ uri: h.photo_url }}
                  style={StyleSheet.absoluteFill}
                  contentFit="cover"
                />
              ) : (
                <Text variant="bodyMedium" color="g700">
                  {h.name[0]?.toUpperCase()}
                </Text>
              )}
            </View>
            <View style={{ flex: 1 }}>
              <Text variant="bodyMedium">{h.name}</Text>
              <Text variant="caption" color="ink3">
                {[h.breed, h.age ? `${h.age}y` : null, h.stall ? `Stall #${h.stall}` : null]
                  .filter(Boolean)
                  .join(" · ")}
              </Text>
            </View>
            <StatusDot status="ok" size={8} />
          </Card>
        </Link>
      ))}
    </View>
  );
}

function ClientsPanel({ query }: { query: string }) {
  // Clients = members with role "client" or "parent" — derived from useBarnMembers
  const barnId = useBarnStore((s) => s.currentBarnId);
  const { data, isLoading } = useBarnMembers(barnId);
  const clients = useMemo(() => {
    const q = query.trim().toLowerCase();
    return (data ?? [])
      .filter((m) => m.roles.includes("client") || m.roles.includes("parent"))
      .filter((m) =>
        !q ? true : (m.user?.full_name ?? "").toLowerCase().includes(q),
      );
  }, [data, query]);

  if (isLoading) {
    return (
      <Card padding="none">
        <SkeletonRow />
        <SkeletonRow />
      </Card>
    );
  }
  if (clients.length === 0) {
    return (
      <EmptyState
        emoji="👤"
        title={query ? "No matches." : "No clients yet."}
        subtitle={query ? "Try a different search." : "Invite your boarders and riders."}
      />
    );
  }
  return (
    <View style={{ gap: spacing.s }}>
      {clients.map((m) => (
        <Card key={m.id} padding="md" style={styles.row}>
          <View style={styles.avatar}>
            <Text variant="bodyMedium" color="g700">
              {(m.user?.full_name ?? "?")[0]?.toUpperCase()}
            </Text>
          </View>
          <View style={{ flex: 1 }}>
            <Text variant="bodyMedium">{m.user?.full_name ?? "Client"}</Text>
            <View style={styles.tagRow}>
              {m.roles.slice(0, 2).map((r) => (
                <Tag key={r} label={ROLE_LABELS[r]} tone="brand" />
              ))}
            </View>
          </View>
        </Card>
      ))}
    </View>
  );
}

function TeamPanel({ query }: { query: string }) {
  const barnId = useBarnStore((s) => s.currentBarnId);
  const router = useRouter();
  const { data, isLoading } = useBarnMembers(barnId);
  const team = useMemo(() => {
    const q = query.trim().toLowerCase();
    const STAFF_ROLES = ["barn_owner", "barn_manager", "trainer", "groom", "pro_rider", "secretary"] as const;
    return (data ?? [])
      .filter((m) => m.roles.some((r) => STAFF_ROLES.includes(r as (typeof STAFF_ROLES)[number])))
      .filter((m) => !q ? true : (m.user?.full_name ?? "").toLowerCase().includes(q));
  }, [data, query]);

  if (isLoading) return <SkeletonRow />;
  if (team.length === 0) {
    return (
      <EmptyState
        emoji="👥"
        title={query ? "No matches." : "Just you for now."}
        subtitle={query ? "Try a different search." : "Invite trainers and grooms."}
        right={null}
      />
    );
  }
  return (
    <View style={{ gap: spacing.s }}>
      {team.map((m) => (
        <Card key={m.id} padding="md" style={styles.row}>
          <View style={styles.avatar}>
            <Text variant="bodyMedium" color="g700">
              {(m.user?.full_name ?? "?")[0]?.toUpperCase()}
            </Text>
          </View>
          <View style={{ flex: 1 }}>
            <Text variant="bodyMedium">{m.user?.full_name ?? "Member"}</Text>
            <View style={styles.tagRow}>
              {m.roles.slice(0, 3).map((r) => (
                <Tag key={r} label={ROLE_LABELS[r]} tone="brand" />
              ))}
            </View>
          </View>
          <Pressable onPress={() => router.push("/(app)/settings/team")}>
            <Text variant="caption" color="g600">
              Manage
            </Text>
          </Pressable>
        </Card>
      ))}
    </View>
  );
}

type Partner = {
  id: string;
  name: string;
  phone: string | null;
  kind: "vet" | "farrier";
  horseCount: number;
};

function PartnersPanel({ query }: { query: string }) {
  const barnId = useBarnStore((s) => s.currentBarnId);
  const { data, isLoading } = useHorses(barnId);

  // Aggregate distinct providers from horses table (Day 3 spec — Partners
  // gets its own table later). Each provider tracks horse count.
  const partners = useMemo<Partner[]>(() => {
    const map = new Map<string, Partner>();
    for (const h of data ?? []) {
      const horse = h as typeof h & {
        vet_name?: string | null;
        vet_phone?: string | null;
        farrier_name?: string | null;
        farrier_phone?: string | null;
      };
      if (horse.vet_name) {
        const k = `vet:${horse.vet_name}`;
        const p = map.get(k) ?? {
          id: k,
          name: horse.vet_name,
          phone: horse.vet_phone ?? null,
          kind: "vet" as const,
          horseCount: 0,
        };
        p.horseCount += 1;
        map.set(k, p);
      }
      if (horse.farrier_name) {
        const k = `farrier:${horse.farrier_name}`;
        const p = map.get(k) ?? {
          id: k,
          name: horse.farrier_name,
          phone: horse.farrier_phone ?? null,
          kind: "farrier" as const,
          horseCount: 0,
        };
        p.horseCount += 1;
        map.set(k, p);
      }
    }
    const list = Array.from(map.values());
    const q = query.trim().toLowerCase();
    return q ? list.filter((p) => p.name.toLowerCase().includes(q)) : list;
  }, [data, query]);

  if (isLoading) return <SkeletonRow />;
  if (partners.length === 0) {
    return (
      <EmptyState
        emoji="🤝"
        title={query ? "No matches." : "No partners yet."}
        subtitle={
          query
            ? "Try a different search."
            : "Add vet and farrier details on each horse — they'll appear here."
        }
      />
    );
  }
  return (
    <View style={{ gap: spacing.s }}>
      {partners.map((p) => (
        <Card key={p.id} padding="md" style={styles.row}>
          <View style={styles.avatar}>
            <Text variant="bodyMedium" color="g700">
              {p.kind === "vet" ? "💉" : "🐴"}
            </Text>
          </View>
          <View style={{ flex: 1 }}>
            <Text variant="bodyMedium">{p.name}</Text>
            <Text variant="caption" color="ink3">
              {p.kind === "vet" ? "Veterinarian" : "Farrier"} · {p.horseCount}{" "}
              {p.horseCount === 1 ? "horse" : "horses"}
              {p.phone ? ` · ${p.phone}` : ""}
            </Text>
          </View>
          {p.phone ? (
            <Pressable
              style={styles.callBtn}
              onPress={() => Linking.openURL(`tel:${p.phone!.replace(/\s+/g, "")}`)}
              accessibilityLabel={`Call ${p.name}`}
            >
              <Phone color={colors.white} size={16} />
            </Pressable>
          ) : null}
        </Card>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  header: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
    paddingBottom: spacing.md,
    gap: spacing.md,
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  headerTop: { flexDirection: "row", alignItems: "flex-end", gap: spacing.s },
  iconBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.n50,
    alignItems: "center",
    justifyContent: "center",
  },
  searchRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.s,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.s,
    backgroundColor: colors.n50,
    borderRadius: radii.full,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    color: colors.ink1,
    padding: 0,
  },
  body: { padding: spacing.lg, gap: spacing.s, paddingBottom: spacing["3xl"] },
  row: { flexDirection: "row", alignItems: "center", gap: spacing.sm },
  avatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.g100,
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
  },
  tagRow: { flexDirection: "row", gap: 4, marginTop: 4, flexWrap: "wrap" },
  callBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.alert,
    alignItems: "center",
    justifyContent: "center",
  },
});
