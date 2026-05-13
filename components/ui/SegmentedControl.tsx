import { Pressable, StyleSheet, View } from "react-native";

import { Text } from "@/components/ui/Text";
import { colors } from "@/constants/colors";
import { radii, spacing } from "@/constants/spacing";

type Option<T extends string> = { key: T; label: string };

type Props<T extends string> = {
  options: ReadonlyArray<Option<T>>;
  value: T;
  onChange: (key: T) => void;
};

export function SegmentedControl<T extends string>({ options, value, onChange }: Props<T>) {
  return (
    <View style={styles.wrap}>
      {options.map((o) => {
        const selected = o.key === value;
        return (
          <Pressable
            key={o.key}
            onPress={() => onChange(o.key)}
            style={[styles.segment, selected && styles.segmentActive]}
          >
            <Text
              variant="label"
              color={selected ? "white" : "ink2"}
              style={selected ? styles.labelActive : undefined}
            >
              {o.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    flexDirection: "row",
    backgroundColor: colors.n100,
    borderRadius: radii.full,
    padding: 3,
    gap: 2,
  },
  segment: {
    flex: 1,
    paddingVertical: spacing.s,
    borderRadius: radii.full,
    alignItems: "center",
    justifyContent: "center",
  },
  segmentActive: {
    backgroundColor: colors.g500,
  },
  labelActive: {
    color: colors.white,
  },
});
