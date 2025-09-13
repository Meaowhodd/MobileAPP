import { createStackNavigator } from "@react-navigation/stack";
import LoginScreen from "./Login";
import RegisterScreen from "./Register";
import Tabs from "./Tab";
import WelcomeScreen from "./Welcome";

const Stack = createStackNavigator();

export default function App() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }} initialRouteName="Welcome">
      <Stack.Screen name="Welcome" component={WelcomeScreen} />
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen name="Register" component={RegisterScreen} />
      <Stack.Screen name="Main" component={Tabs} />
    </Stack.Navigator>
  );
}
