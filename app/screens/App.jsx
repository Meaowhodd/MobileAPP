import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";

import LoginScreen from "./screens/LoginScreen"; // ปรับ path ให้ตรงกับไฟล์ของคุณ
import Tabs from "./Tab"; // ใช้โค้ดเพื่อน

const Stack = createNativeStackNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {/* หน้าแรก = Login */}
        <Stack.Screen name="Login" component={LoginScreen} />
        {/* ถ้า login สำเร็จ จะเข้า Tabs */}
        <Stack.Screen name="Main" component={Tabs} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
