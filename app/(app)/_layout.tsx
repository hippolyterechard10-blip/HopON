import { Tabs } from "expo-router";
import { Calendar, Home as HomeIcon, ListChecks, MoreHorizontal, NotebookText } from "lucide-react-native";

import { colors } from "@/constants/colors";

export default function AppLayout() {
  return (
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
          title: "Home",
          tabBarIcon: ({ color, size }) => <HomeIcon color={color} size={size - 4} />,
        }}
      />
      <Tabs.Screen
        name="calendar"
        options={{
          title: "Calendar",
          tabBarIcon: ({ color, size }) => <Calendar color={color} size={size - 4} />,
        }}
      />
      <Tabs.Screen
        name="horses"
        options={{
          title: "Horses",
          tabBarIcon: ({ color, size }) => <NotebookText color={color} size={size - 4} />,
        }}
      />
      <Tabs.Screen
        name="tasks"
        options={{
          title: "Tasks",
          tabBarIcon: ({ color, size }) => <ListChecks color={color} size={size - 4} />,
        }}
      />
      <Tabs.Screen
        name="more"
        options={{
          title: "More",
          tabBarIcon: ({ color, size }) => <MoreHorizontal color={color} size={size - 4} />,
        }}
      />
      {/* Hidden from the tab bar but reachable via router.push */}
      <Tabs.Screen name="booking" options={{ href: null }} />
      <Tabs.Screen name="team" options={{ href: null }} />
      <Tabs.Screen name="notifications" options={{ href: null }} />
      <Tabs.Screen name="settings" options={{ href: null }} />
    </Tabs>
  );
}
