// app/(tabs)/_layout.js
import Entypo from "@expo/vector-icons/Entypo";
import Ionicons from "@expo/vector-icons/Ionicons";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import { Tabs } from "expo-router";

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarShowLabel: true,
        tabBarLabelStyle: { fontSize: 12 },
        tabBarStyle: {
          backgroundColor: "#F2F2F2",
          height: 62,
          borderTopWidth: 0,
          elevation: 10,
          paddingBottom: 10,
        },
        tabBarActiveTintColor: "#1f66f2",
        tabBarInactiveTintColor: "#777",
      }}
    >
      {/* หน้าแรกให้ใช้ index.jsx */}
      <Tabs.Screen
        name="index"
        options={{
          title: "Home",
          tabBarIcon: ({ color, size }) => (
            <Entypo name="home" size={size} color={color} />
          ),
        }}
      />
      {/* ถ้าคุณยังมี Home.jsx อยู่ในโฟลเดอร์เดียวกัน ให้ซ่อนไว้กันซ้ำ */}
      <Tabs.Screen name="Home" options={{ href: null }} />

      <Tabs.Screen
        name="Book"
        options={{
          title: "Book",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="bookmarks" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="Inbox"
        options={{
          title: "Inbox",
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="bell" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="Profile"
        options={{
          title: "Profile",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="person" size={size} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}
