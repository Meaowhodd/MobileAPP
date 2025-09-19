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
    tabBarLabelStyle: { fontSize: 12, marginTop: -4 }, // ✅ ดึง text ขึ้นมาใกล้ icon
    tabBarIconStyle: { marginBottom: -2 },             // ✅ icon ขยับลงมาเล็กน้อย
    tabBarItemStyle: {
      paddingVertical: 8,   // ✅ เพิ่มพื้นที่กดในแต่ละปุ่ม
    },
    tabBarStyle: {
      backgroundColor: "#fff",
      height: 80,           // ✅ สูงขึ้นชัดๆ
      borderTopWidth: 1,
      borderTopColor: "#ddd",
    },
    tabBarActiveTintColor: "#1f66f2",
    tabBarInactiveTintColor: "#777",
  }}
>

      {/* หน้าแรกให้ใช้ index.jsx */}
      <Tabs.Screen
        name="Home"
        options={{
          title: "Home",
          tabBarIcon: ({ color, size }) => (
            <Entypo name="home" size={size} color={color} />
          ),
        }}
      />

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
