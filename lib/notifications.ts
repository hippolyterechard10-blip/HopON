import * as Device from "expo-device";
import * as Notifications from "expo-notifications";
import { useEffect } from "react";
import { Platform } from "react-native";

import { supabase } from "@/lib/supabase";
import { useAuthStore } from "@/stores/authStore";

// Behavior: show banners + play sound when in foreground.
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    // Older expo-notifications API
    shouldShowAlert: true,
    // Newer expo-notifications API
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

/**
 * Requests permission, fetches the Expo push token, and upserts it on the
 * device_tokens row for the current user. Idempotent — calling repeatedly
 * is safe.
 */
export function usePushRegistration() {
  const userId = useAuthStore((s) => s.user?.id);

  useEffect(() => {
    if (!userId) return;
    register(userId).catch((e) => console.warn("[push] register failed", e));
  }, [userId]);
}

async function register(userId: string) {
  if (!Device.isDevice) return;

  if (Platform.OS === "android") {
    await Notifications.setNotificationChannelAsync("default", {
      name: "default",
      importance: Notifications.AndroidImportance.DEFAULT,
      sound: "default",
    });
    await Notifications.setNotificationChannelAsync("urgent", {
      name: "Urgent",
      importance: Notifications.AndroidImportance.MAX,
      sound: "default",
    });
  }

  const existing = await Notifications.getPermissionsAsync();
  let status = existing.status;
  if (status !== "granted") {
    const ask = await Notifications.requestPermissionsAsync();
    status = ask.status;
  }
  if (status !== "granted") return;

  const token = await Notifications.getExpoPushTokenAsync();
  if (!token.data) return;

  await supabase.from("device_tokens").upsert(
    {
      user_id: userId,
      expo_push_token: token.data,
      platform: Platform.OS,
      device_name: Device.deviceName ?? null,
    },
    { onConflict: "user_id,expo_push_token" },
  );
}
