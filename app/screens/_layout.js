// app/screens/_layout.js
import { Stack } from "expo-router";

export default function ScreensLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      
      <Stack.Screen name="Login" />

      <Stack.Screen name="Register" />
    </Stack>
  );
}
