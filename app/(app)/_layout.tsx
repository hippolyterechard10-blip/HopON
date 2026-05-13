import { Tabs } from "expo-router";
import {
  BarChart3,
  Calendar,
  ClipboardList,
  Home as HomeIcon,
  Warehouse,
} from "lucide-react-native";
import { View } from "react-native";

import { FAB } from "@/components/ui/FAB";
import { colors } from "@/constants/colors";
import { useT } from "@/lib/i18n";

/**
 * Day 3 navigation architecture (sprint May 13, 2026):
 *
 *   Home · Calendar · Whiteboard · MyStable · Dashboard
 *
 * Whiteboard replaces the old "Tasks" tab — same data, different framing
 * (operational columns by person/horse instead of a flat list).
 * MyStable consolidates the old Horses + Team + Clients + Partners tabs
 * into a single screen with a segmented control.
 *
 * The FAB sits at the (app) layer so it persists across tabs.
 *
 * Anything outside the 5 tabs (booking, lessons, settings, notifications,
 * legacy /horses route, /tasks/* deep links, /invoices) stays reachable
 * via router.push but is hidden from the tab bar with `href: null`.
 */
export default function AppLayout() {
  const t = useT();
  return (
    <View style={{ flex: 1, backgroundColor: colors.bg }}>
      <Tabs
        screenOptions={{
          headerShown: false,
          tabBarStyle: {
            backgroundColor: colors.surface,
            borderTopColor: colors.border,
            height: 64,
            paddingTop: 6,
            paddingBottom: 8,
          },
          tabBarLabelStyle: { fontSize: 10, fontFamily: "DMSans_500Medium" },
          tabBarActiveTintColor: colors.g600,
          tabBarInactiveTintColor: colors.ink3,
        }}
      >
        <Tabs.Screen
          name="index"
          options={{
            title: t("tabs.home"),
            tabBarIcon: ({ color, size }) => <HomeIcon color={color} size={size - 4} />,
          }}
        />
        <Tabs.Screen
          name="calendar"
          options={{
            title: t("tabs.calendar"),
            tabBarIcon: ({ color, size }) => <Calendar color={color} size={size - 4} />,
          }}
        />
        <Tabs.Screen
          name="whiteboard"
          options={{
            title: t("tabs.whiteboard"),
            tabBarIcon: ({ color, size }) => <ClipboardList color={color} size={size - 4} />,
          }}
        />
        <Tabs.Screen
          name="mystable"
          options={{
            title: t("tabs.mystable"),
            tabBarIcon: ({ color, size }) => <Warehouse color={color} size={size - 4} />,
          }}
        />
        <Tabs.Screen
          name="dashboard"
          options={{
            title: t("tabs.dashboard"),
            tabBarIcon: ({ color, size }) => <BarChart3 color={color} size={size - 4} />,
          }}
        />

        {/* Reachable via router.push, hidden from the tab bar */}
        <Tabs.Screen name="booking" options={{ href: null }} />
        <Tabs.Screen name="horses" options={{ href: null }} />
        <Tabs.Screen name="news" options={{ href: null }} />
        <Tabs.Screen name="services" options={{ href: null }} />
        <Tabs.Screen name="lessons" options={{ href: null }} />
        <Tabs.Screen name="invoices" options={{ href: null }} />
        <Tabs.Screen name="notifications" options={{ href: null }} />
        <Tabs.Screen name="settings" options={{ href: null }} />
        <Tabs.Screen name="tasks" options={{ href: null }} />
        <Tabs.Screen name="team" options={{ href: null }} />
      </Tabs>

      <FAB />
    </View>
  );
}
