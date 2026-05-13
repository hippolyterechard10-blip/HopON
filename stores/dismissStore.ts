import AsyncStorage from "@react-native-async-storage/async-storage";
import { create } from "zustand";

const KEY = "hopon-dismissed";

type DismissState = {
  dismissed: Record<string, true>;
  hydrated: boolean;
  hydrate: () => Promise<void>;
  dismiss: (id: string) => Promise<void>;
};

/**
 * Tracks "don't show again" cards (the 0/4 onboarding checklist for now,
 * but reusable for any dismissable hint). Persisted via AsyncStorage so
 * the dismissal survives reloads.
 */
export const useDismissStore = create<DismissState>((set, get) => ({
  dismissed: {},
  hydrated: false,
  hydrate: async () => {
    try {
      const raw = await AsyncStorage.getItem(KEY);
      const dismissed = raw ? (JSON.parse(raw) as Record<string, true>) : {};
      set({ dismissed, hydrated: true });
    } catch (_e) {
      set({ hydrated: true });
    }
  },
  dismiss: async (id: string) => {
    const next = { ...get().dismissed, [id]: true as const };
    set({ dismissed: next });
    try {
      await AsyncStorage.setItem(KEY, JSON.stringify(next));
    } catch (_e) {
      /* ignore */
    }
  },
}));
