import { useRouter } from "expo-router";
import { useState } from "react";
import { KeyboardAvoidingView, Platform, Pressable, StyleSheet, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { z } from "zod";

import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Text } from "@/components/ui/Text";
import { colors } from "@/constants/colors";
import { spacing } from "@/constants/spacing";
import { signUpWithPassword } from "@/lib/auth";

const Schema = z.object({
  email: z.string().email("Enter a valid email."),
  password: z.string().min(8, "Use at least 8 characters."),
});

export default function SignUp() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const submit = async () => {
    setError(null);
    const parsed = Schema.safeParse({ email, password });
    if (!parsed.success) {
      setError(parsed.error.issues[0]?.message ?? "Invalid input.");
      return;
    }
    setBusy(true);
    const res = await signUpWithPassword(email, password);
    setBusy(false);
    if (!res.ok) {
      setError(res.message);
      return;
    }
    router.push({ pathname: "/(auth)/check-email", params: { email } });
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        style={{ flex: 1 }}
      >
        <View style={styles.body}>
          <Text variant="eyebrow" color="ink3">
            HOPON
          </Text>
          <Text variant="hero" color="ink1">
            Join HopOn.
          </Text>
          <Text variant="body" color="ink2" style={{ marginTop: spacing.xs }}>
            One account, every role you wear at the barn.
          </Text>

          <View style={styles.form}>
            <Input
              label="Email"
              value={email}
              onChangeText={setEmail}
              autoCapitalize="none"
              autoComplete="email"
              keyboardType="email-address"
              placeholder="you@barn.com"
            />
            <Input
              label="Password"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              autoComplete="new-password"
              helper="Minimum 8 characters."
            />
            {error ? (
              <Text variant="caption" color="alert">
                {error}
              </Text>
            ) : null}
          </View>

          <Button
            label={busy ? "Creating…" : "Create account"}
            variant="primary"
            size="lg"
            fullWidth
            disabled={busy}
            onPress={submit}
          />

          <View style={styles.footer}>
            <Text variant="caption" color="ink3">
              Already on HopOn?
            </Text>
            <Pressable onPress={() => router.replace("/(auth)/sign-in")}>
              <Text variant="bodyMedium" color="g600">
                Sign in
              </Text>
            </Pressable>
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  body: { flex: 1, padding: spacing.xl, gap: spacing.sm, justifyContent: "center" },
  form: { gap: spacing.sm, marginVertical: spacing.lg },
  footer: { flexDirection: "row", justifyContent: "center", gap: 6, marginTop: spacing.lg },
});
