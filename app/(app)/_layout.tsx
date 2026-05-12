import { Tabs } from "expo-router";
import { Calendar, Home as HomeIcon, MoreHorizontal, NotebookText, Users } from "lucide-react-native";

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
        name="team"
        options={{
          title: "Team",
          tabBarIcon: ({ color, size }) => <Users color={color} size={size - 4} />,
        }}
      />
      <Tabs.Screen
        name="more"
        options={{
          title: "More",
          tabBarIcon: ({ color, size }) => <MoreHorizontal color={color} size={size - 4} />,
        }}
      />
    </Tabs>
  );
}
