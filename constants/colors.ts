/**
 * HopOn color tokens.
 * Forest green primary · muted status signals · never alarming.
 */

export const colors = {
  // Forest green — primary brand
  g900: "#0D2018",
  g800: "#122A20",
  g700: "#193828",
  g600: "#224D35",
  g500: "#2E6644",
  g400: "#3E8258",
  g300: "#62A87A",
  g200: "#9ECFB0",
  g100: "#D4EDE0",
  g50: "#EDF7F2",

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
