import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { LinearGradient } from "expo-linear-gradient";
import { useState } from "react";
import { Image, StyleSheet, Text, TextInput, TouchableOpacity, View, } from "react-native";

export default function RegisterScreen() {
  const navigation = useNavigation();
  const [showPassword, setShowPassword] = useState(false);

  return (
    <LinearGradient
      colors={["#6A5AE0", "#A18AFF"]}
      style={styles.container}
    >
      {/* Title */}
      <Text style={styles.title}>Sign up</Text>

      {/* Name */}
      <TextInput
        placeholder="Enter your name"
        placeholderTextColor="#ddd"
        style={styles.input}
      />

      {/* Email */}
      <TextInput
        placeholder="Enter your email"
        placeholderTextColor="#ddd"
        style={styles.input}
        keyboardType="email-address"
      />

      {/* Password */}
      <View style={styles.passwordBox}>
        <TextInput
          placeholder="Enter your password"
          placeholderTextColor="#ddd"
          style={styles.passwordInput}
          secureTextEntry={!showPassword}
        />
        <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
          <Ionicons
            name={showPassword ? "eye-off" : "eye"}
            size={20}
            color="#ddd"
          />
        </TouchableOpacity>
      </View>

      {/* Sign up Button */}
      <TouchableOpacity
        style={styles.signupBtn}
        onPress={() => {
          alert("Account created 🎉");
          navigation.replace("Login"); // หลังสมัครเสร็จ กลับไป Login
        }}
      >
        <Text style={styles.signupText}>Sign up</Text>
      </TouchableOpacity>

      {/* Divider */}
      <View style={styles.divider}>
        <View style={styles.line} />
        <Text style={styles.orText}>Or Sign In with</Text>
        <View style={styles.line} />
      </View>

      {/* Social Buttons */}
      <View style={styles.socialRow}>
        <TouchableOpacity style={styles.socialBtn}>
          <Image
            source={{ uri: "https://img.icons8.com/color/48/google-logo.png" }}
            style={styles.socialIcon}
          />
        </TouchableOpacity>
        <TouchableOpacity style={styles.socialBtn}>
          <Image
            source={{ uri: "https://img.icons8.com/ios-filled/50/mac-os.png" }}
            style={styles.socialIcon}
          />
        </TouchableOpacity>
        <TouchableOpacity style={styles.socialBtn}>
          <Image
            source={{ uri: "https://img.icons8.com/ios-filled/50/facebook.png" }}
            style={styles.socialIcon}
          />
        </TouchableOpacity>
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, justifyContent: "center" },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: "white",
    textAlign: "center",
    marginBottom: 40,
  },
  input: {
    backgroundColor: "rgba(255,255,255,0.2)",
    color: "white",
    padding: 14,
    borderRadius: 12,
    marginBottom: 15,
  },
  passwordBox: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.2)",
    borderRadius: 12,
    paddingHorizontal: 10,
    marginBottom: 20,
  },
  passwordInput: { flex: 1, color: "white", paddingVertical: 12 },
  signupBtn: {
    backgroundColor: "#FFD700",
    padding: 15,
    borderRadius: 12,
    alignItems: "center",
    marginBottom: 20,
  },
  signupText: { color: "black", fontSize: 18, fontWeight: "bold" },
  divider: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
  },
  line: { flex: 1, height: 1, backgroundColor: "#aaa" },
  orText: { color: "#ddd", marginHorizontal: 10 },
  socialRow: {
    flexDirection: "row",
    justifyContent: "center",
    marginBottom: 20,
  },
  socialBtn: {
    backgroundColor: "white",
    borderRadius: 50,
    padding: 10,
    marginHorizontal: 10,
  },
  socialIcon: { width: 30, height: 30 },
});
