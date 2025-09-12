import { NavigationContainer } from "@react-navigation/native";
import Tabs from "./Tab"; // ปรับ path ตามจริง

export default function App() {
  return (
    <NavigationContainer>
      <Tabs />
    </NavigationContainer>
  );
}