import { Tabs } from "expo-router";
import { DollarSign } from "lucide-react-native";
import React from "react";

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: "#8A2BE2",
        headerShown: true,
        tabBarStyle: {
          backgroundColor: "#1E1E2E",
          borderTopColor: "#333",
        },
        headerStyle: {
          backgroundColor: "#1E1E2E",
        },
        headerTitleStyle: {
          color: "#fff",
        },
        headerTintColor: "#fff",
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "XRP-LIVE",
          tabBarIcon: ({ color }) => <DollarSign color={color} />,
        }}
      />
    </Tabs>
  );
}