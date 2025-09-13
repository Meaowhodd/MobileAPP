// app/_layout.js
import { Stack } from "expo-router";

export default function RootLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      {/* กลุ่มแท็บทั้งหมด */}
      <Stack.Screen name="(tabs)" />
      {/* หน้าที่อยู่นอกแท็บ (จะไม่เห็น Tab Bar) */}
      <Stack.Screen name="screens/Booking" />
      <Stack.Screen name="screens/Login" />
    </Stack>
  );
}
