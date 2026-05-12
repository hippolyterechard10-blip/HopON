import { TextStyle } from "react-native";

export const fonts = {
  sans: "DMSans_400Regular",
  sansMedium: "DMSans_500Medium",
  sansSemibold: "DMSans_600SemiBold",
  serif: "DMSerifDisplay_400Regular_Italic",
} as const;

export const fontSizes = {
  xxs: 8,
  xs: 9,
  s: 10,
  sm: 11,
  base: 12,
  md: 14,
  lg: 16,
  xl: 18,
  "2xl": 24,
  "3xl": 32,
  "4xl": 40,
} as const;

/**
 * Variant styles — apply via the Text primitive.
 * Letter-spacing tuned for premium feel; large headings tightened.
 */
export const textVariants = {
  // Editorial / hero — serif italic
  hero: {
    fontFamily: fonts.serif,
    fontSize: fontSizes["4xl"],
    lineHeight: 44,
    letterSpacing: -0.5,
  },
  display: {
    fontFamily: fonts.serif,
    fontSize: fontSizes["3xl"],
    lineHeight: 36,
    letterSpacing: -0.4,
  },
  // Section headings — sans
  h1: {
    fontFamily: fonts.sansSemibold,
    fontSize: fontSizes["2xl"],
    lineHeight: 28,
    letterSpacing: -0.3,
  },
  h2: {
    fontFamily: fonts.sansSemibold,
    fontSize: fontSizes.xl,
    lineHeight: 24,
  },
  h3: {
    fontFamily: fonts.sansMedium,
    fontSize: fontSizes.lg,
    lineHeight: 22,
  },
  body: {
    fontFamily: fonts.sans,
    fontSize: fontSizes.md,
    lineHeight: 20,
  },
  bodyMedium: {
    fontFamily: fonts.sansMedium,
    fontSize: fontSizes.md,
    lineHeight: 20,
  },
  // Small UI text
  caption: {
    fontFamily: fonts.sans,
    fontSize: fontSizes.base,
    lineHeight: 16,
  },
  label: {
    fontFamily: fonts.sansMedium,
    fontSize: fontSizes.sm,
    lineHeight: 14,
    letterSpacing: 0.2,
  },
  // Eyebrow — uppercased tag
  eyebrow: {
    fontFamily: fonts.sansMedium,
    fontSize: fontSizes.s,
    lineHeight: 12,
    letterSpacing: 1.2,
    textTransform: "uppercase" as TextStyle["textTransform"],
  },
  // Compressed mono-feel for `HORSE · TYPE · TIME`
  compressed: {
    fontFamily: fonts.sansMedium,
    fontSize: fontSizes.md,
    lineHeight: 18,
    letterSpacing: 0.4,
  },
} as const satisfies Record<string, TextStyle>;

export type TextVariant = keyof typeof textVariants;
