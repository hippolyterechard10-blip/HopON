import { Tabs } from "expo-router";
import {
  BarChart3,
  Calendar,
  Home as HomeIcon,
  MessageSquare,
  Warehouse,
} from "lucide-react-native";
import { View } from "react-native";

import { FAB } from "@/components/ui/FAB";
import { colors } from "@/constants/colors";
import { useT } from "@/lib/i18n";

/**
 * Day 3 navigation — revised after the post-sprint design pass:
 *
 *   Home · Calendar · Feed · MyStable · Dashboard
 *
 * Feed (the barn-wide chat with @-tagging) takes the third slot.
 * Whiteboard moves out of the tab bar — still reachable via deep link
 * from the Home "Team view" section and from the Tasks screen.
 *
 * The FAB sits at the (app) layer so it persists across tabs.
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
          name="feed"
          options={{
            title: t("tabs.feed"),
            tabBarIcon: ({ color, size }) => <MessageSquare color={color} size={size - 4} />,
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
        <Tabs.Screen name="whiteboard" options={{ href: null }} />
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
