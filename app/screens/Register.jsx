// RegisterScreen.jsx
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { LinearGradient } from "expo-linear-gradient";
import { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

import { createUserWithEmailAndPassword, updateProfile } from "firebase/auth";
import { doc, serverTimestamp, setDoc } from "firebase/firestore";
import { auth, db } from "../../firebaseConfig";

export default function RegisterScreen() {
  const navigation = useNavigation();
  const [showPassword, setShowPassword] = useState(false);

  const [firstName, setFirstName] = useState("");
  const [lastName,  setLastName]  = useState("");
  const [email,     setEmail]     = useState("");
  const [password,  setPassword]  = useState("");
  const [loading,   setLoading]   = useState(false);

  const onRegister = async () => {
    if (!firstName.trim() || !lastName.trim() || !email.trim() || !password.trim()) {
      Alert.alert("ข้อมูลไม่ครบ", "กรุณากรอกชื่อ, นามสกุล, อีเมล และรหัสผ่าน");
      return;
    }
    try {
      setLoading(true);

      // 1) สมัครผู้ใช้
      const cred = await createUserWithEmailAndPassword(auth, email.trim(), password);
      const user = cred.user;

      // 2) ตั้ง displayName = "First Last"
      await updateProfile(user, { displayName: `${firstName.trim()} ${lastName.trim()}` });

      // 3) สร้างเอกสาร users/{uid}
      await setDoc(doc(db, "users", user.uid), {
        email: user.email,
        firstName: firstName.trim(),
        lastName:  lastName.trim(),
        role: "student",
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });

      Alert.alert("สำเร็จ", "Account created 🎉");
      navigation.replace("Login"); // หรือเปลี่ยนเป็นเส้นทางของคุณ
    } catch (err) {
      console.error("register error:", err);
      let msg = "สมัครสมาชิกไม่สำเร็จ";
      if (err.code === "auth/invalid-email") msg = "อีเมลไม่ถูกต้อง";
      if (err.code === "auth/email-already-in-use") msg = "อีเมลนี้ถูกใช้แล้ว";
      if (err.code === "auth/weak-password") msg = "รหัสผ่านต้องมีอย่างน้อย 6 ตัวอักษร";
      Alert.alert("Sign up failed", msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <LinearGradient colors={["#6A5AE0", "#A18AFF"]} style={styles.container}>
      <Text style={styles.title}>Sign up</Text>

      {/* First / Last name (แถวเดียว) */}
      <View style={styles.nameRowOneLine}>
        <TextInput
          placeholder="First name"
          placeholderTextColor="#ddd"
          style={[styles.input, styles.nameCell, styles.nameLeft]}
          value={firstName}
          onChangeText={setFirstName}
          autoCapitalize="words"
        />
        <TextInput
          placeholder="Last name"
          placeholderTextColor="#ddd"
          style={[styles.input, styles.nameCell]}
          value={lastName}
          onChangeText={setLastName}
          autoCapitalize="words"
        />
      </View>

      {/* Email */}
      <TextInput
        placeholder="Enter your email"
        placeholderTextColor="#ddd"
        style={styles.input}
        keyboardType="email-address"
        autoCapitalize="none"
        value={email}
        onChangeText={setEmail}
      />

      {/* Password */}
      <View style={styles.passwordBox}>
        <TextInput
          placeholder="Enter your password"
          placeholderTextColor="#ddd"
          style={styles.passwordInput}
          secureTextEntry={!showPassword}
          value={password}
          onChangeText={setPassword}
        />
        <TouchableOpacity onPress={() => setShowPassword((v) => !v)}>
          <Ionicons name={showPassword ? "eye-off" : "eye"} size={20} color="#ddd" />
        </TouchableOpacity>
      </View>

      {/* Sign up Button */}
      <TouchableOpacity style={styles.signupBtn} onPress={onRegister} disabled={loading}>
        {loading ? <ActivityIndicator color="#000" /> : <Text style={styles.signupText}>Sign up</Text>}
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
          <Image source={{ uri: "https://img.icons8.com/color/48/google-logo.png" }} style={styles.socialIcon} />
        </TouchableOpacity>
        <TouchableOpacity style={styles.socialBtn}>
          <Image source={{ uri: "https://img.icons8.com/ios-filled/50/mac-os.png" }} style={styles.socialIcon} />
        </TouchableOpacity>
        <TouchableOpacity style={styles.socialBtn}>
          <Image source={{ uri: "https://img.icons8.com/ios-filled/50/facebook.png" }} style={styles.socialIcon} />
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

  // input base
  input: {
    backgroundColor: "rgba(255,255,255,0.2)",
    color: "white",
    padding: 14,
    borderRadius: 12,
    marginBottom: 15,
  },

  // name row (หนึ่งแถวเสมอ)
  nameRowOneLine: {
    flexDirection: "row",
    alignItems: "center",
    flexWrap: "nowrap",   // ✅ บังคับให้อยู่บรรทัดเดียว
    marginBottom: 15,
  },
  nameCell: {
    flex: 1,              // แบ่งพื้นที่เท่า ๆ กัน
    minWidth: 0,          // กัน overflow บนจอแคบ
  },
  nameLeft: { marginRight: 10 },

  // password
  passwordBox: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.2)",
    borderRadius: 12,
    paddingHorizontal: 10,
    marginBottom: 20,
  },
  passwordInput: { flex: 1, color: "white", paddingVertical: 12 },

  // button
  signupBtn: {
    backgroundColor: "#FFD700",
    padding: 15,
    borderRadius: 12,
    alignItems: "center",
    marginBottom: 20,
  },
  signupText: { color: "black", fontSize: 18, fontWeight: "bold" },

  // divider & socials
  divider: { flexDirection: "row", alignItems: "center", marginBottom: 20 },
  line: { flex: 1, height: 1, backgroundColor: "#aaa" },
  orText: { color: "#ddd", marginHorizontal: 10 },
  socialRow: { flexDirection: "row", justifyContent: "center", marginBottom: 20 },
  socialBtn: { backgroundColor: "white", borderRadius: 50, padding: 10, marginHorizontal: 10 },
  socialIcon: { width: 30, height: 30 },
});
