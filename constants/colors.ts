/**
 * HopOn color tokens.
 * Eucalyptus primary · muted status signals · never alarming.
 *
 * Locked Day 3 sprint (May 13, 2026): Eucalyptus is the official brand
 * color. Anchor #2A957F. Reference: Lululemon. Moderate use recommended —
 * primary CTAs only, the rest stays in ink/surface/border neutrals.
 */

export const colors = {
  // Eucalyptus — primary brand (Day 3 locked)
  g900: "#0B2F23",
  g800: "#114836",
  g700: "#18604F",
  g600: "#207A66",
  g500: "#2A957F", // anchor — primary CTA, brand fill
  g400: "#36B399",
  g300: "#5CC0A4",
  g200: "#95CDBA",
  g100: "#D6EFE1",
  g50: "#ECFBF6",

  // Surfaces
  bg: "#F3F5F3",
  surface: "#FFFFFF",
  border: "#E5E8E5",

  // Ink
  ink1: "#181D18",
  ink2: "#454A45",
  ink3: "#8A908A",

  // Status — muted, never alarming
  ok: "#2E7A4F",
  okBg: "#EDF7F2",
  okDot: "#4CAF73",
  warn: "#7A5F28",
  warnBg: "#FAF4E8",
  warnDot: "#C49540",
  alert: "#8A3D2E",
  alertBg: "#FAF0ED",
  alertDot: "#B86050",

  // Neutrals
  n50: "#F5F6F5",
  n100: "#ECEEED",
  n200: "#DADDDA",
  n400: "#ABABAB",
  n800: "#252825",

  white: "#FFFFFF",
  black: "#000000",
  transparent: "transparent",
} as const;

export type ColorToken = keyof typeof colors;
