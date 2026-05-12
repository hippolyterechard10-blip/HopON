import * as Clipboard from "expo-clipboard";
import { useState } from "react";
import { Alert, Pressable, ScrollView, Share, StyleSheet, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/EmptyState";
import { Tag } from "@/components/ui/Tag";
import { Text } from "@/components/ui/Text";
import { colors } from "@/constants/colors";
import { radii, spacing } from "@/constants/spacing";
import { useBarnMembers } from "@/hooks/useBarnMembers";
import { useCreateInvite, useInvites, useRevokeInvite } from "@/hooks/useInvites";
import { useBarnStore } from "@/stores/barnStore";
import { ROLE_LABELS, type BarnRole } from "@/types/roles";

const INVITE_ROLES: BarnRole[] = ["trainer", "groom", "barn_manager", "client", "parent"];

export default function TeamSettings() {
  const barnId = useBarnStore((s) => s.currentBarnId);
  const membersQ = useBarnMembers(barnId);
  const invitesQ = useInvites(barnId);
  const createInvite = useCreateInvite();
  const revokeInvite = useRevokeInvite();

  const [chosenRoles, setChosenRoles] = useState<Set<BarnRole>>(new Set(["groom"]));

  const toggleRole = (r: BarnRole) => {
    const next = new Set(chosenRoles);
    if (next.has(r)) next.delete(r);
    else next.add(r);
    setChosenRoles(next);
  };

  const onCreate = async () => {
    if (!barnId || chosenRoles.size === 0) return;
    const inv = await createInvite.mutateAsync({ barnId, roles: Array.from(chosenRoles) });
    Alert.alert("Invite created", `Code: ${inv.code}`);
  };

  const shareCode = async (code: string) => {
    const link = `hopon://barn/join/${code}`;
    await Share.share({ message: `Join the barn on HopOn: ${link} (code ${code})` });
  };

  const copyCode = async (code: string) => {
    await Clipboard.setStringAsync(code);
  };

  const members = membersQ.data ?? [];
  const invites = (invitesQ.data ?? []).filter((i) => !i.accepted_at);

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <ScrollView contentContainerStyle={styles.body}>
        <Text variant="eyebrow" color="ink3">
          TEAM · {members.length}
        </Text>
        <Text variant="display">Members.</Text>

        {members.length === 0 ? (
          <EmptyState emoji="👥" title="Just you for now." />
        ) : (
          <Card padding="none">
            {members.map((m, i) => (
              <View
                key={m.id}
                style={[styles.row, i !== 0 && { borderTopWidth: 1, borderTopColor: colors.border }]}
              >
                <View style={styles.avatar}>
                  <Text variant="bodyMedium" color="g700">
                    {(m.user?.full_name ?? "?").charAt(0).toUpperCase()}
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
              </View>
            ))}
          </Card>
        )}

        <Text variant="eyebrow" color="ink3" style={{ marginTop: spacing.lg }}>
          NEW INVITE
        </Text>
        <Card padding="md">
          <Text variant="caption" color="ink3" style={{ marginBottom: spacing.s }}>
            Pick roles for the person you're inviting.
          </Text>
          <View style={styles.chips}>
            {INVITE_ROLES.map((r) => {
              const selected = chosenRoles.has(r);
              return (
                <Pressable
                  key={r}
                  onPress={() => toggleRole(r)}
                  style={[styles.chip, selected && styles.chipSelected]}
                >
                  <Text variant="caption" color={selected ? "white" : "ink2"}>
                    {ROLE_LABELS[r]}
                  </Text>
                </Pressable>
              );
            })}
          </View>
          <View style={{ height: spacing.sm }} />
          <Button
            label={createInvite.isPending ? "Creating…" : "Create invite code"}
            variant="primary"
            size="md"
            fullWidth
            disabled={createInvite.isPending || chosenRoles.size === 0}
            onPress={onCreate}
          />
        </Card>

        {invites.length > 0 ? (
          <>
            <Text variant="eyebrow" color="ink3" style={{ marginTop: spacing.lg }}>
              ACTIVE CODES · {invites.length}
            </Text>
            <Card padding="none">
              {invites.map((inv, i) => (
                <View
                  key={inv.id}
                  style={[styles.row, i !== 0 && { borderTopWidth: 1, borderTopColor: colors.border }]}
                >
                  <View style={{ flex: 1 }}>
                    <Text variant="h3" style={{ letterSpacing: 2 }}>
                      {inv.code}
                    </Text>
                    <View style={styles.tagRow}>
                      {inv.roles.slice(0, 3).map((r) => (
                        <Tag key={r} label={ROLE_LABELS[r]} tone="brand" />
                      ))}
                    </View>
                  </View>
                  <Pressable onPress={() => copyCode(inv.code)} style={styles.iconBtn}>
                    <Text variant="caption" color="g600">
                      Copy
                    </Text>
                  </Pressable>
                  <Pressable onPress={() => shareCode(inv.code)} style={styles.iconBtn}>
                    <Text variant="caption" color="g600">
                      Share
                    </Text>
                  </Pressable>
                  <Pressable onPress={() => revokeInvite.mutate(inv.id)} style={styles.iconBtn}>
                    <Text variant="caption" color="alert">
                      Revoke
                    </Text>
                  </Pressable>
                </View>
              ))}
            </Card>
          </>
        ) : null}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  body: { padding: spacing.lg, gap: spacing.s, paddingBottom: spacing["3xl"] },
  row: { flexDirection: "row", alignItems: "center", gap: spacing.sm, padding: spacing.md },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.g100,
    alignItems: "center",
    justifyContent: "center",
  },
  tagRow: { flexDirection: "row", gap: 4, marginTop: 4, flexWrap: "wrap" },
  chips: { flexDirection: "row", flexWrap: "wrap", gap: spacing.xs },
  chip: {
    paddingVertical: 6,
    paddingHorizontal: spacing.sm,
    borderRadius: radii.full,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  chipSelected: { backgroundColor: colors.g500, borderColor: colors.g500 },
  iconBtn: { paddingHorizontal: spacing.s, paddingVertical: spacing.xs },
});
