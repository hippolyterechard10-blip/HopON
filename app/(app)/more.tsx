import { StyleSheet, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { Button } from "@/components/ui/Button";
import { Text } from "@/components/ui/Text";
import { colors } from "@/constants/colors";
import { spacing } from "@/constants/spacing";
import { supabase } from "@/lib/supabase";

export default function More() {
  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <View style={styles.body}>
        <Text variant="eyebrow" color="ink3">
          MORE
        </Text>
        <Text variant="display">Settings.</Text>
        <Text variant="body" color="ink2">
          Profile, barn config, payments, notifications — all settled here.
        </Text>
        <View style={{ height: spacing.xl }} />
        <Button
          label="Sign out"
          variant="secondary"
          fullWidth
          onPress={() => supabase.auth.signOut()}
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  body: { padding: spacing.xl, gap: spacing.s },
});
