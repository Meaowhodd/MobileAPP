import { useNavigation } from "@react-navigation/native";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

export default function WelcomeScreen() {
  const navigation = useNavigation();

  return (
    <View style={styles.container}>
      <Text style={styles.title}>MeetEase</Text>
      <Text style={styles.subtitle}>Simple Booking, Smooth Meetings</Text>

      <TouchableOpacity
        style={styles.button}
        onPress={() => navigation.navigate("Login")}   // ✅ ไปหน้า Login
      >
        <Text style={styles.buttonText}>Get Started</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: "#6A5AE0" },
  title: { fontSize: 32, color: "white", fontWeight: "bold", marginBottom: 10 },
  subtitle: { fontSize: 16, color: "#ddd", marginBottom: 40 },
  button: { backgroundColor: "white", padding: 15, borderRadius: 10 },
  buttonText: { fontSize: 16, fontWeight: "bold", color: "#6A5AE0" }
});
