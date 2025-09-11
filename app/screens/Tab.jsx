// app/screens/Tabs.jsx
import Entypo from "@expo/vector-icons/Entypo";
import Ionicons from "@expo/vector-icons/Ionicons";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";

import BookScreen from "./Book";
import HomeScreen from "./Home";
import InboxScreen from "./Inbox";
import ProfileStack from "./ProfileStack";


const Tab = createBottomTabNavigator();

export default function Tabs() {
  

  return (
    <Tab.Navigator
      initialRouteName="Home"
      screenOptions={{
        headerShown: false,
        tabBarShowLabel: true,
        tabBarLabelStyle: { fontSize: 12 },
        tabBarStyle: {
          
          backgroundColor: "#F2F2F2",
          height: 62,
          borderTopWidth: 0,
          elevation: 10, // Shadow effect
          paddingBottom: 10
        },
        tabBarActiveTintColor: "#1f66f2",
        tabBarInactiveTintColor: "#777",
      }}
    >
      <Tab.Screen
        name="Home"
        component={HomeScreen}
        options={{
          tabBarIcon: ({ color, size }) => (
            <Entypo name="home" size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="Book"
        component={BookScreen}
        options={{
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="bookmarks" size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="Inbox"
        component={InboxScreen}
        options={{
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="bell" size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="Profile"
        component={ProfileStack}
        options={{
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="person" size={size} color={color} />
          ),
        }}
      />
    </Tab.Navigator>
  );
}
