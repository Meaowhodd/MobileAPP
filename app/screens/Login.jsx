import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { useState } from "react";
import { Image, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";

export default function LoginScreen() {
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");       // เก็บค่า email
  const [password, setPassword] = useState(""); // เก็บค่า password
  const router = useRouter(); 

  // 🚧 mock login ใช้แทน Firebase ชั่วคราว
  const handleLogin = async () => {
    // mock role จาก email
    let role = "student"; 
    if (email === "admin@uni.com") {
      role = "admin";
    }

    // ตรวจสอบ role แล้วเปลี่ยนหน้า
    if (role === "admin") {
      router.replace("/admin/AdminDashboard"); // ไปหน้าแอดมิน
    } else {
      router.replace("/(tabs)/Home"); // ไปหน้า user ปกติ
    }
  };

  return (
    <LinearGradient colors={["#6A5AE0", "#A18AFF"]} style={styles.container}>
      {/* Logo + Title */}
      <Text style={styles.title}>MeetEase</Text>

      {/* Email Input */}
      <TextInput
        placeholder="Enter your email"
        placeholderTextColor="#ddd"
        style={styles.input}
        keyboardType="email-address"
        value={email}
        onChangeText={setEmail}
      />

      {/* Password Input + toggle show/hide */}
      <View style={styles.passwordBox}>
        <TextInput
          placeholder="Enter your password"
          placeholderTextColor="#ddd"
          style={styles.passwordInput}
          secureTextEntry={!showPassword}
          value={password}
          onChangeText={setPassword}
        />
        <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
          <Ionicons name={showPassword ? "eye-off" : "eye"} size={20} color="#ddd" />
        </TouchableOpacity>
      </View>

      {/* Remember Me + Reset Password */}
      <View style={styles.row}>
        <Text style={styles.remember}>○ Remember Me</Text>
        <TouchableOpacity>
          <Text style={styles.reset}>Reset Password</Text>
        </TouchableOpacity>
      </View>

      {/* Sign in Button */}
      <TouchableOpacity style={styles.signinBtn} onPress={handleLogin}>
        <Text style={styles.signinText}>Sign in</Text>
      </TouchableOpacity>

      {/* Sign Up link */}
      <Text style={styles.signupText}>
        Don’t have an account?{" "}
        <Text style={styles.signupLink} onPress={() => router.push("/screens/Register")}>
          Sign Up
        </Text>
      </Text>

      {/* Divider */}
      <View style={styles.divider}>
        <View style={styles.line} />
        <Text style={styles.orText}>Or Sign In with</Text>
        <View style={styles.line} />
      </View>

      {/* Social Buttons (ยังไม่ได้เชื่อมจริง) */}
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

      {/* Terms */}
      <Text style={styles.terms}>
        By signing up you agree to our <Text style={styles.link}>Terms</Text> and{" "}
        <Text style={styles.link}>Conditions of Use</Text>
      </Text>
    </LinearGradient>
  );
}

// ✅ Styles เดิม
const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, justifyContent: "center" },
  title: {
    fontSize: 32,
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
    marginBottom: 15,
  },
  passwordInput: { flex: 1, color: "white", paddingVertical: 12 },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 20,
  },
  remember: { color: "white" },
  reset: { color: "white", textDecorationLine: "underline" },
  signinBtn: {
    backgroundColor: "#FFD700",
    padding: 15,
    borderRadius: 12,
    alignItems: "center",
    marginBottom: 20,
  },
  signinText: { color: "black", fontSize: 18, fontWeight: "bold" },
  signupText: { color: "white", textAlign: "center", marginBottom: 20 },
  signupLink: { color: "#FFD700", fontWeight: "bold" },
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
  terms: { color: "#ddd", textAlign: "center", fontSize: 12 },
  link: { color: "#FFD700", textDecorationLine: "underline" },
});
