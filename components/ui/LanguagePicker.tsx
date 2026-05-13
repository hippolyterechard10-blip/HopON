import { Pressable, StyleSheet, View } from "react-native";

import { Text } from "@/components/ui/Text";
import { colors } from "@/constants/colors";
import { radii, spacing } from "@/constants/spacing";
import { SUPPORTED_LOCALES, useI18nStore, useT } from "@/lib/i18n";

export function LanguagePicker() {
  const lng = useI18nStore((s) => s.lng);
  const setLanguage = useI18nStore((s) => s.setLanguage);
  const t = useT();

  return (
    <View style={styles.wrap}>
      <Text variant="eyebrow" color="ink3">
        {t("settings.language").toUpperCase()}
      </Text>
      <View style={styles.row}>
        {SUPPORTED_LOCALES.map((loc) => {
          const selected = loc.key === lng;
          return (
            <Pressable
              key={loc.key}
              onPress={() => setLanguage(loc.key)}
              style={[styles.chip, selected && styles.chipSelected]}
            >
              <Text style={styles.flag}>{loc.flag}</Text>
              <Text variant="label" color={selected ? "white" : "ink2"}>
                {t(loc.nameKey)}
              </Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { gap: spacing.s },
  row: { flexDirection: "row", gap: spacing.s, flexWrap: "wrap" },
  chip: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs,
    paddingVertical: spacing.s,
    paddingHorizontal: spacing.md,
    borderRadius: radii.full,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  chipSelected: { backgroundColor: colors.g500, borderColor: colors.g500 },
  flag: { fontSize: 16 },
});
