import { create } from "zustand";

type UIState = {
  lastTabIndex: number;
  setLastTabIndex: (i: number) => void;
};

export const useUIStore = create<UIState>((set) => ({
  lastTabIndex: 0,
  setLastTabIndex: (i) => set({ lastTabIndex: i }),
}));
