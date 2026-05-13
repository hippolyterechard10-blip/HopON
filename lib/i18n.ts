import AsyncStorage from "@react-native-async-storage/async-storage";
import { create } from "zustand";

import en from "@/locales/en.json";
import es from "@/locales/es.json";
import fr from "@/locales/fr.json";

export type Locale = "en" | "fr" | "es";

const dictionaries: Record<Locale, Record<string, string>> = { en, fr, es };

const STORAGE_KEY = "hopon-lng";

type I18nState = {
  lng: Locale;
  hydrated: boolean;
  setLanguage: (lng: Locale) => Promise<void>;
  hydrate: () => Promise<void>;
};

export const useI18nStore = create<I18nState>((set) => ({
  lng: "en",
  hydrated: false,
  setLanguage: async (lng) => {
    set({ lng });
    try {
      await AsyncStorage.setItem(STORAGE_KEY, lng);
    } catch (_e) {
      /* ignore */
    }
  },
  hydrate: async () => {
    let chosen: Locale = "en";
    try {
      const stored = (await AsyncStorage.getItem(STORAGE_KEY)) as Locale | null;
      if (stored && dictionaries[stored]) {
        chosen = stored;
      } else {
        const sys =
          typeof Intl !== "undefined"
            ? (Intl.DateTimeFormat().resolvedOptions().locale ?? "en").split("-")[0]
            : "en";
        if (sys && (sys as Locale) in dictionaries) chosen = sys as Locale;
      }
    } catch (_e) {
      /* ignore */
    }
    set({ lng: chosen, hydrated: true });
  },
}));

/**
 * Lightweight `t()` hook — looks up a key in the active locale, falls
 * back to English, then to the key itself if it doesn't exist. Supports
 * `{{name}}` interpolation.
 *
 * Designed to be swappable for react-i18next later; the call site
 * (`const t = useT(); t("key")`) matches the i18next API.
 */
export function useT() {
  const lng = useI18nStore((s) => s.lng);
  return (key: string, params?: Record<string, string | number>): string => {
    const raw = dictionaries[lng]?.[key] ?? dictionaries.en[key] ?? key;
    if (!params) return raw;
    let out = raw;
    for (const [k, v] of Object.entries(params)) {
      out = out.replace(new RegExp(`{{\\s*${k}\\s*}}`, "g"), String(v));
    }
    return out;
  };
}

export const SUPPORTED_LOCALES: { key: Locale; flag: string; nameKey: string }[] = [
  { key: "en", flag: "🇬🇧", nameKey: "settings.language.en" },
  { key: "fr", flag: "🇫🇷", nameKey: "settings.language.fr" },
  { key: "es", flag: "🇪🇸", nameKey: "settings.language.es" },
];
