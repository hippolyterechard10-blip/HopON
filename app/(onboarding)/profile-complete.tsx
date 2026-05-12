import { useRouter } from "expo-router";
import { useState } from "react";
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { z } from "zod";

import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Text } from "@/components/ui/Text";
import { colors } from "@/constants/colors";
import { radii, spacing } from "@/constants/spacing";
import { useOnboardingStore } from "@/stores/onboardingStore";

import { Progress } from "./_progress";

const Schema = z.object({
  fullName: z.string().min(2, "Tell us how you'd like to be addressed."),
  phone: z.string().optional(),
});

export default function ProfileComplete() {
  const router = useRouter();
  const setProfile = useOnboardingStore((s) => s.setProfile);
  const draft = useOnboardingStore((s) => ({
    fullName: s.fullName,
    phone: s.phone,
    avatarUri: s.avatarUri,
  }));

  const [fullName, setFullName] = useState(draft.fullName);
  const [phone, setPhone] = useState(draft.phone);
  const [avatarUri, setAvatarUri] = useState<string | null>(draft.avatarUri);
  const [error, setError] = useState<string | null>(null);

  const pickAvatar = async () => {
    try {
      const { launchImageLibraryAsync, MediaTypeOptions, requestMediaLibraryPermissionsAsync } =
        await import("expo-image-picker");
      const perm = await requestMediaLibraryPermissionsAsync();
      if (!perm.granted) return;
      const res = await launchImageLibraryAsync({
        mediaTypes: MediaTypeOptions.Images,
        quality: 0.7,
        allowsEditing: true,
        aspect: [1, 1],
      });
      if (!res.canceled && res.assets[0]) {
        setAvatarUri(res.assets[0].uri);
      }
    } catch (_e) {
      // expo-image-picker may not be loaded in some envs; ignore
    }
  };

  const onContinue = () => {
    const parsed = Schema.safeParse({ fullName, phone });
    if (!parsed.success) {
      setError(parsed.error.issues[0]?.message ?? "Invalid input.");
      return;
    }
    setProfile({ fullName, phone, avatarUri });
    router.push("/(onboarding)/ready");
  };

  return (
    <SafeAreaView style={styles.container} edges={["top", "bottom"]}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        style={{ flex: 1 }}
      >
        <ScrollView contentContainerStyle={styles.content}>
          <Progress step={3} />
          <Text variant="eyebrow" color="ink3">
            STEP 3 OF 4
          </Text>
          <Text variant="hero">A few details about you.</Text>

          <Pressable onPress={pickAvatar} style={styles.avatar}>
            {avatarUri ? (
              <View style={[styles.avatarRing, { overflow: "hidden" }]}>
                {/* Avatar preview rendered as a static colored circle for simplicity */}
                <View style={[styles.avatarRing, { backgroundColor: colors.g300 }]} />
              </View>
            ) : (
              <View style={styles.avatarPlaceholder}>
                <Text variant="h2" color="g600">
                  +
                </Text>
              </View>
            )}
            <Text variant="caption" color="g600">
              {avatarUri ? "Change photo" : "Add photo (optional)"}
            </Text>
          </Pressable>

          <View style={styles.form}>
            <Input
              label="Full name"
              value={fullName}
              onChangeText={setFullName}
              placeholder="Sam Carter"
            />
            <Input
              label="Phone (optional)"
              value={phone}
              onChangeText={setPhone}
              keyboardType="phone-pad"
              placeholder="(561) 555-0100"
            />
            {error ? (
              <Text variant="caption" color="alert">
                {error}
              </Text>
            ) : null}
          </View>
        </ScrollView>
        <View style={styles.footer}>
          <Button label="Continue" variant="primary" size="lg" fullWidth onPress={onContinue} />
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  content: { padding: spacing.lg, gap: spacing.s, alignItems: "stretch" },
  avatar: { alignItems: "center", gap: spacing.s, marginTop: spacing.xl },
  avatarRing: {
    width: 96,
    height: 96,
    borderRadius: 48,
  },
  avatarPlaceholder: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: colors.g50,
    borderWidth: 1,
    borderColor: colors.border,
    borderStyle: "dashed",
    alignItems: "center",
    justifyContent: "center",
  },
  form: { gap: spacing.sm, marginTop: spacing.xl },
  footer: { padding: spacing.lg, backgroundColor: colors.surface, borderTopWidth: 1, borderTopColor: colors.border },
});
