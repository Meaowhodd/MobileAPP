// app/_layout.js
import { Stack } from "expo-router";
import { GestureHandlerRootView } from "react-native-gesture-handler";

export default function RootLayout() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <Stack screenOptions={{ headerShown: false }}>
        {/* Landing Page */}
        <Stack.Screen name="index" />

        {/* Login & Register */}
        <Stack.Screen name="screens/Login" />
        <Stack.Screen name="screens/Register" />

        {/* Admin */}
        <Stack.Screen name="admin/AdminDashboard" />
        <Stack.Screen name="admin/ManageUsers" />
        <Stack.Screen name="admin/ManageRooms" />
        <Stack.Screen name="admin/ManageBookings" />
        <Stack.Screen name="admin/Reports" />

        {/* Tabs */}
        <Stack.Screen name="(tabs)" />
      </Stack>
    </GestureHandlerRootView>
  );
}
