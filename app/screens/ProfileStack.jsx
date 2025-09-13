import { createStackNavigator } from "@react-navigation/stack";
import ProfileScreen from "../(tabs)/Profile";
import ProfileSettingScreen from "./ProfileStack/ProfileSettingScreen";

const Stack = createStackNavigator();

export default function ProfileStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="ProfileMain" component={ProfileScreen} />
      <Stack.Screen name="ProfileSettingScreen" component={ProfileSettingScreen} />
      {/*เพิ่มหน้าจออื่น ๆ ที่เกี่ยวข้องกับโปรไฟล์ที่นี่*/}
    </Stack.Navigator>
  );
}