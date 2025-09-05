import { NavigationContainer } from "@react-navigation/native";
import React from "react";
import Tabs from "./Tab"; // ปรับ path ตามจริง

export default function App() {
  return (
    <NavigationContainer>
      <Tabs />
    </NavigationContainer>
  );
}