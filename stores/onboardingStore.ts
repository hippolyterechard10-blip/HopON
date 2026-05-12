import { create } from "zustand";

import type { BarnRole } from "@/types/roles";

type BarnChoice =
  | { kind: "create"; name: string; address: string; timezone: string }
  | { kind: "join"; code: string };

type OnboardingState = {
  roles: BarnRole[];
  barn: BarnChoice | null;
  fullName: string;
  phone: string;
  avatarUri: string | null;

  setRoles: (roles: BarnRole[]) => void;
  setBarnChoice: (choice: BarnChoice) => void;
  setProfile: (input: { fullName: string; phone: string; avatarUri: string | null }) => void;
  reset: () => void;
};

const initial = {
  roles: [] as BarnRole[],
  barn: null as BarnChoice | null,
  fullName: "",
  phone: "",
  avatarUri: null as string | null,
};

export const useOnboardingStore = create<OnboardingState>((set) => ({
  ...initial,
  setRoles: (roles) => set({ roles }),
  setBarnChoice: (barn) => set({ barn }),
  setProfile: ({ fullName, phone, avatarUri }) => set({ fullName, phone, avatarUri }),
  reset: () => set({ ...initial }),
}));
