import { create } from "zustand";

import type { BarnRole } from "@/types/roles";

type BarnState = {
  currentBarnId: string | null;
  currentBarnName: string | null;
  currentRoles: BarnRole[];
  setBarn: (input: { id: string; name: string; roles: BarnRole[] }) => void;
  clear: () => void;
};

export const useBarnStore = create<BarnState>((set) => ({
  currentBarnId: null,
  currentBarnName: null,
  currentRoles: [],
  setBarn: ({ id, name, roles }) =>
    set({ currentBarnId: id, currentBarnName: name, currentRoles: roles }),
  clear: () => set({ currentBarnId: null, currentBarnName: null, currentRoles: [] }),
}));
