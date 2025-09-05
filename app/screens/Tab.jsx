// app/screens/Tabs.jsx
import Entypo from "@expo/vector-icons/Entypo";
import Ionicons from "@expo/vector-icons/Ionicons";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import React from "react";
// ถ้าไฟล์ Book/Home/Inbox/Profile อยู่โฟลเดอร์เดียวกัน ใช้ ./ ได้เลย
import BookScreen from "./Book";
import HomeScreen from "./Home";
import InboxScreen from "./Inbox";
import ProfileScreen from "./Profile";
// (ถ้ามี ThemeContext และวางนอก app/) import { useTheme } from "../../context/ThemeContext";

const Tab = createBottomTabNavigator();

export default function Tabs() {
  // ถ้ามีธีม:
  // const { theme } = useTheme();

  return (
    <Tab.Navigator
      initialRouteName="Home"
      screenOptions={{
        headerShown: false,
        tabBarShowLabel: true,
        tabBarLabelStyle: { fontSize: 12 },
        tabBarStyle: {
          // ถ้ามีธีม: backgroundColor: theme === "light" ? "#fff" : "#111",
          backgroundColor: "#F2F2F2",
          height: 60,
        },
        tabBarActiveTintColor: "#1f66f2",
        tabBarInactiveTintColor: "#777",
      }}
    >
      <Tab.Screen
        name="Home"
        component={HomeScreen}
        options={{
          tabBarIcon: ({ color, size }) => (
            <Entypo name="home" size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="Book"
        component={BookScreen}
        options={{
          tabBarIcon: ({ color, size }) => (
            <Entypo name="compass" size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="Inbox"
        component={InboxScreen}
        options={{
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="lightning-bolt" size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="Profile"
        component={ProfileScreen}
        options={{
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="person" size={size} color={color} />
          ),
        }}
      />
    </Tab.Navigator>
  );
}
