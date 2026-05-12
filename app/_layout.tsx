import { QueryClientProvider } from "@tanstack/react-query";
import { Stack, useRouter, useSegments } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { StatusBar } from "expo-status-bar";
import { useEffect } from "react";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { SafeAreaProvider } from "react-native-safe-area-context";

import { useAuth, useAuthBootstrap } from "@/hooks/useAuth";
import { useMemberships } from "@/hooks/useMemberships";
import { queryClient } from "@/lib/queryClient";
import { useBarnStore } from "@/stores/barnStore";

SplashScreen.preventAutoHideAsync().catch(() => {
  /* no-op */
});

export default function RootLayout() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <QueryClientProvider client={queryClient}>
          <RootNavigation />
          <StatusBar style="dark" />
        </QueryClientProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}

function RootNavigation() {
  useAuthBootstrap();
  const { user, isSignedIn, isLoading } = useAuth();
  const memberships = useMemberships(user?.id);
  const setBarn = useBarnStore((s) => s.setBarn);

  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    if (isLoading) return;
    SplashScreen.hideAsync().catch(() => {});

    const group = segments[0];

    if (!isSignedIn) {
      if (group !== "(auth)") {
        router.replace("/(auth)/welcome");
      }
      return;
    }

    // Signed in — wait for memberships to load
    if (memberships.isLoading) return;

    const rows = memberships.data ?? [];
    if (rows.length === 0) {
      // No barn yet — push through onboarding
      if (group !== "(onboarding)") {
        router.replace("/(onboarding)/role-select");
      }
      return;
    }

    // Hydrate the first active membership into the barn store
    const first = rows[0];
    if (first?.barn) {
      setBarn({ id: first.barn_id, name: first.barn.name, roles: first.roles });
    }

    if (group !== "(app)") {
      router.replace("/(app)");
    }
  }, [
    isLoading,
    isSignedIn,
    memberships.isLoading,
    memberships.data,
    segments,
    router,
    setBarn,
  ]);

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="(auth)" />
      <Stack.Screen name="(onboarding)" />
      <Stack.Screen name="(app)" />
    </Stack>
  );
}
