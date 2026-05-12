import { useBarnStore } from "@/stores/barnStore";
import { computeHomeVariant, type BarnRole, type HomeVariant } from "@/types/roles";

export function useRole(): {
  roles: BarnRole[];
  homeVariant: HomeVariant;
  is: (role: BarnRole) => boolean;
} {
  const roles = useBarnStore((s) => s.currentRoles);
  return {
    roles,
    homeVariant: computeHomeVariant(roles),
    is: (role) => roles.includes(role),
  };
}
