import { Stack } from "expo-router";

export default function Layout() {
  return (
    <Stack>
      {/* หน้าแรก (Landing Page) */}
      <Stack.Screen name="index" options={{ headerShown: false }} />

      {/* หน้า Login & Register */}
      <Stack.Screen 
        name="screens/Login" 
        options={{ 
          headerShown: false,   // 🔹 ไม่แสดง header
          gestureEnabled: false // 🔹 ปิดการ swipe back บน iOS
        }} 
      />
      <Stack.Screen name="screens/Register" options={{ headerShown: false }} />

      {/* Admin */}
      <Stack.Screen name="admin/AdminDashboard" options={{ headerShown: false }} />

      {/* Tabs */}
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
    </Stack>
  );
}
