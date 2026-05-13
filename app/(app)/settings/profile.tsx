import { useEffect, useState } from "react";
import { Alert, KeyboardAvoidingView, Platform, ScrollView, StyleSheet, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { LanguagePicker } from "@/components/ui/LanguagePicker";
import { Text } from "@/components/ui/Text";
import { colors } from "@/constants/colors";
import { spacing } from "@/constants/spacing";
import { supabase } from "@/lib/supabase";
import { useAuthStore } from "@/stores/authStore";

type Form = {
  full_name: string;
  phone: string;
  notifications_quiet_start: string;
  notifications_quiet_end: string;
};

export default function ProfileSettings() {
  const user = useAuthStore((s) => s.user);
  const [form, setForm] = useState<Form>({
    full_name: "",
    phone: "",
    notifications_quiet_start: "22:00",
    notifications_quiet_end: "07:00",
  });
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!user) return;
    supabase
      .from("profiles")
      .select("full_name, phone, notifications_quiet_start, notifications_quiet_end")
      .eq("id", user.id)
      .single()
      .then(({ data, error }) => {
        if (!error && data) {
          setForm({
            full_name: data.full_name ?? "",
            phone: data.phone ?? "",
            notifications_quiet_start:
              typeof data.notifications_quiet_start === "string"
                ? data.notifications_quiet_start.slice(0, 5)
                : "22:00",
            notifications_quiet_end:
              typeof data.notifications_quiet_end === "string"
                ? data.notifications_quiet_end.slice(0, 5)
                : "07:00",
          });
        }
      });
  }, [user]);

  const save = async () => {
    if (!user) return;
    setBusy(true);
    const { error } = await supabase
      .from("profiles")
      .update({
        full_name: form.full_name,
        phone: form.phone || null,
        notifications_quiet_start: form.notifications_quiet_start,
        notifications_quiet_end: form.notifications_quiet_end,
      })
      .eq("id", user.id);
    setBusy(false);
    if (error) {
      Alert.alert("Could not save", error.message);
      return;
    }
    Alert.alert("Saved", "Profile updated.");
  };

  return (
    <SafeAreaView style={styles.container} edges={["top", "bottom"]}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        style={{ flex: 1 }}
      >
        <ScrollView contentContainerStyle={styles.body}>
          <Text variant="eyebrow" color="ink3">
            PROFILE
          </Text>
          <Text variant="display">You.</Text>

          <View style={styles.form}>
            <Input
              label="Full name"
              value={form.full_name}
              onChangeText={(v) => setForm((f) => ({ ...f, full_name: v }))}
            />
            <Input
              label="Phone"
              value={form.phone}
              onChangeText={(v) => setForm((f) => ({ ...f, phone: v }))}
              keyboardType="phone-pad"
            />

            <View style={{ marginTop: spacing.md }}>
              <LanguagePicker />
            </View>

            <Text variant="eyebrow" color="ink3" style={{ marginTop: spacing.md }}>
              QUIET HOURS
            </Text>
            <Text variant="caption" color="ink3">
              No push notifications during this window (except payment confirmations).
            </Text>
            <View style={styles.row}>
              <View style={{ flex: 1 }}>
                <Input
                  label="From"
                  value={form.notifications_quiet_start}
                  onChangeText={(v) => setForm((f) => ({ ...f, notifications_quiet_start: v }))}
                  placeholder="22:00"
                />
              </View>
              <View style={{ flex: 1 }}>
                <Input
                  label="To"
                  value={form.notifications_quiet_end}
                  onChangeText={(v) => setForm((f) => ({ ...f, notifications_quiet_end: v }))}
                  placeholder="07:00"
                />
              </View>
            </View>
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
  row: { flexDirection: "row", gap: spacing.s },
  footer: {
    padding: spacing.lg,
    backgroundColor: colors.surface,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
});
