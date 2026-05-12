/**
 * Barn membership roles.
 * Mirror of the Postgres `barn_role` enum.
 * A user may hold multiple roles within a single barn.
 */
export const BARN_ROLES = [
  "barn_owner",
  "trainer",
  "pro_rider",
  "groom",
  "barn_manager",
  "secretary",
  "client",
  "parent",
] as const;

export type BarnRole = (typeof BARN_ROLES)[number];

export type HomeVariant = "owner" | "owner_trainer" | "trainer" | "groom" | "client";

/**
 * Maps a user's set of roles to the correct home screen variant.
 * Logic mirrored from CLAUDE.md §6.
 */
export function computeHomeVariant(roles: readonly BarnRole[]): HomeVariant {
  const has = (r: BarnRole) => roles.includes(r);

  if (has("barn_owner") && (has("trainer") || has("pro_rider"))) {
    return "owner_trainer";
  }
  if (has("barn_owner") || has("barn_manager")) {
    return "owner";
  }
  if (has("trainer") || has("pro_rider")) {
    return "trainer";
  }
  if (has("groom")) {
    return "groom";
  }
  if (has("client") || has("parent")) {
    return "client";
  }
  return "owner";
}

export const ROLE_LABELS: Record<BarnRole, string> = {
  barn_owner: "Barn Owner",
  trainer: "Trainer",
  pro_rider: "Pro Rider",
  groom: "Groom",
  barn_manager: "Barn Manager",
  secretary: "Secretary",
  client: "Client",
  parent: "Parent",
};

export const ROLE_ICONS: Record<BarnRole, string> = {
  barn_owner: "home",
  trainer: "school",
  pro_rider: "trophy",
  groom: "shovel",
  barn_manager: "clipboard",
  secretary: "file-document",
  client: "account",
  parent: "account-multiple",
};
