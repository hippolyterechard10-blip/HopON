import { useEffect, useState } from "react";
import { Alert, KeyboardAvoidingView, Platform, ScrollView, StyleSheet, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Text } from "@/components/ui/Text";
import { colors } from "@/constants/colors";
import { spacing } from "@/constants/spacing";
import { supabase } from "@/lib/supabase";
import { useBarnStore } from "@/stores/barnStore";

type BarnSettingsForm = {
  name: string;
  address: string;
  timezone: string;
  service_request_fee_cents: number;
};

export default function BarnSettings() {
  const barnId = useBarnStore((s) => s.currentBarnId);
  const setBarn = useBarnStore((s) => s.setBarn);
  const currentRoles = useBarnStore((s) => s.currentRoles);

  const [form, setForm] = useState<BarnSettingsForm>({
    name: "",
    address: "",
    timezone: "America/New_York",
    service_request_fee_cents: 0,
  });
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!barnId) return;
    supabase
      .from("barns")
      .select("name, address, timezone, service_request_fee_cents")
      .eq("id", barnId)
      .single()
      .then(({ data, error }) => {
        if (!error && data) {
          setForm({
            name: data.name ?? "",
            address: data.address ?? "",
            timezone: data.timezone ?? "America/New_York",
            service_request_fee_cents: data.service_request_fee_cents ?? 0,
          });
        }
      });
  }, [barnId]);

  const save = async () => {
    if (!barnId) return;
    setBusy(true);
    const { error } = await supabase
      .from("barns")
      .update({
        name: form.name,
        address: form.address || null,
        timezone: form.timezone,
        service_request_fee_cents: form.service_request_fee_cents,
      })
      .eq("id", barnId);
    setBusy(false);
    if (error) {
      Alert.alert("Could not save", error.message);
      return;
    }
    setBarn({ id: barnId, name: form.name, roles: currentRoles });
    Alert.alert("Saved", "Barn settings updated.");
  };

  return (
    <SafeAreaView style={styles.container} edges={["top", "bottom"]}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        style={{ flex: 1 }}
      >
        <ScrollView contentContainerStyle={styles.body}>
          <Text variant="eyebrow" color="ink3">
            BARN SETTINGS
          </Text>
          <Text variant="display">Your barn.</Text>

          <View style={styles.form}>
            <Input
              label="Name"
              value={form.name}
              onChangeText={(name) => setForm((f) => ({ ...f, name }))}
            />
            <Input
              label="Address"
              value={form.address}
              onChangeText={(address) => setForm((f) => ({ ...f, address }))}
            />
            <Input
              label="Timezone"
              value={form.timezone}
              onChangeText={(timezone) => setForm((f) => ({ ...f, timezone }))}
              autoCapitalize="none"
              helper="IANA name, e.g. America/New_York"
            />
            <Input
              label="Service request fee ($)"
              value={String(form.service_request_fee_cents / 100)}
              onChangeText={(v) =>
                setForm((f) => ({
                  ...f,
                  service_request_fee_cents: Math.max(0, Math.round(Number(v || 0) * 100)),
                }))
              }
              keyboardType="decimal-pad"
              helper='Charged per external service request ("Partners"). Set to 0 for free.'
            />
          </View>
        </ScrollView>
        <View style={styles.footer}>
          <Button
            label={busy ? "Saving…" : "Save"}
            variant="primary"
            size="lg"
            fullWidth
            disabled={busy}
            onPress={save}
          />
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  body: { padding: spacing.lg, gap: spacing.s },
  form: { gap: spacing.sm, marginTop: spacing.lg },
  footer: {
    padding: spacing.lg,
    backgroundColor: colors.surface,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
});
