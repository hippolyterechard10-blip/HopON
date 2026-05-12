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
import { signInWithMagicLink, signInWithPassword } from "@/lib/auth";

type Mode = "magic" | "password";

const EmailSchema = z.string().email("Enter a valid email.");

export default function SignIn() {
  const router = useRouter();
  const [mode, setMode] = useState<Mode>("magic");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const submit = async () => {
    setError(null);
    const parsed = EmailSchema.safeParse(email);
    if (!parsed.success) {
      setError(parsed.error.issues[0]?.message ?? "Invalid email.");
      return;
    }
    setBusy(true);
    const res = mode === "magic"
      ? await signInWithMagicLink(email)
      : await signInWithPassword(email, password);
    setBusy(false);
    if (!res.ok) {
      setError(res.message);
      return;
    }
    if (mode === "magic") {
      router.push({ pathname: "/(auth)/check-email", params: { email } });
    }
    // Password sign-in: auth state listener handles redirect.
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
            Welcome back.
          </Text>
          <Text variant="body" color="ink2" style={{ marginTop: spacing.xs }}>
            {mode === "magic"
              ? "Get a one-time sign-in link by email. No password to remember."
              : "Use the password you set up at the barn."}
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
            {mode === "password" ? (
              <Input
                label="Password"
                value={password}
                onChangeText={setPassword}
                secureTextEntry
                autoComplete="password"
              />
            ) : null}
            {error ? (
              <Text variant="caption" color="alert">
                {error}
              </Text>
            ) : null}
          </View>

          <Button
            label={busy ? "One moment…" : mode === "magic" ? "Send magic link" : "Sign in"}
            variant="primary"
            size="lg"
            fullWidth
            disabled={busy}
            onPress={submit}
          />

          <Pressable
            onPress={() => {
              setError(null);
              setMode((m) => (m === "magic" ? "password" : "magic"));
            }}
            style={styles.toggle}
          >
            <Text variant="bodyMedium" color="g600">
              {mode === "magic" ? "Use password instead" : "Use magic link instead"}
            </Text>
          </Pressable>

          <View style={styles.footer}>
            <Text variant="caption" color="ink3">
              New to HopOn?
            </Text>
            <Pressable onPress={() => router.replace("/(auth)/sign-up")}>
              <Text variant="bodyMedium" color="g600">
                Create an account
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
  toggle: { alignSelf: "center", paddingVertical: spacing.sm },
  footer: { flexDirection: "row", justifyContent: "center", gap: 6, marginTop: spacing.lg },
});
