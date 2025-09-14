// นำเข้า Stack จาก expo-router
// ใช้สำหรับกำหนด Stack Navigation (การสลับหน้าต่าง ๆ แบบ stack)
import { Stack } from "expo-router";

// สร้าง layout สำหรับโฟลเดอร์ screens/
// expo-router จะมองไฟล์ _layout.js ว่าเป็นตัวกำหนดโครงสร้าง navigation ของโฟลเดอร์นี้
export default function ScreensLayout() {
  return (
    // กำหนด Stack Navigation
    // screenOptions={{ headerShown: false }} = ไม่แสดง header ด้านบน
    <Stack screenOptions={{ headerShown: false }}>
      
      {/* ลงทะเบียนหน้า Login.jsx ให้เป็นหนึ่งใน stack */}
      {/* name="Login" หมายถึงไฟล์ Login.jsx ในโฟลเดอร์ screens */}
      <Stack.Screen name="Login" />

      {/* ลงทะเบียนหน้า Register.jsx ให้เป็นหนึ่งใน stack */}
      {/* name="Register" หมายถึงไฟล์ Register.jsx ในโฟลเดอร์ screens */}
      <Stack.Screen name="Register" />
    </Stack>
  );
}
