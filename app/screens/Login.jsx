// LoginScreen.jsx
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  ToastAndroid,
  TouchableOpacity,
  View,
} from "react-native";

import { sendPasswordResetEmail, signInWithEmailAndPassword } from "firebase/auth";
import { doc, getDoc, serverTimestamp, setDoc } from "firebase/firestore";
import { auth, db } from "../../firebaseConfig";

export default function LoginScreen() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  // state สำหรับ error UI
  const [errorMsg, setErrorMsg] = useState("");        // แสดงเป็น banner
  const [emailError, setEmailError] = useState("");    // ใต้ช่อง email
  const [passError, setPassError] = useState("");      // ใต้ช่อง password

  const showToast = (msg) => {
    if (Platform.OS === "android") ToastAndroid.show(msg, ToastAndroid.SHORT);
    else Alert.alert("", msg);
  };

  const ensureUserDoc = async (uid, mail) => {
    const ref = doc(db, "users", uid);
    const snap = await getDoc(ref);
    if (!snap.exists()) {
      await setDoc(ref, {
        email: mail,
        role: "student",
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
      return { role: "student" };
    }
    return snap.data();
  };

  const resetErrors = () => {
    setErrorMsg("");
    setEmailError("");
    setPassError("");
  };

  const handleLogin = async () => {
    resetErrors();

    if (!email.trim() || !password.trim()) {
      if (!email.trim()) setEmailError("กรุณากรอกอีเมล");
      if (!password.trim()) setPassError("กรุณากรอกรหัสผ่าน");
      setErrorMsg("กรุณากรอกข้อมูลให้ครบ");
      return;
    }

    try {
      setLoading(true);
      const cred = await signInWithEmailAndPassword(auth, email.trim(), password);
      const { uid } = cred.user;

      const userData = await ensureUserDoc(uid, cred.user.email ?? email.trim());
      const role = String(userData?.role || "student").toLowerCase();

      if (role === "admin") router.replace("/admin/AdminDashboard");
      else router.replace("/(tabs)/Home");
    } catch (err) {
      console.error("login error:", err);
      const code = err?.code || "";

      // map error → ข้อความไทย + ไฮไลต์ช่อง
      if (code === "auth/invalid-email") {
        setEmailError("รูปแบบอีเมลไม่ถูกต้อง");
        setErrorMsg("อีเมลไม่ถูกต้อง");
      } else if (
        code === "auth/invalid-credential" || // v10 รวม wrong-password / user-not-found
        code === "auth/wrong-password" ||
        code === "auth/user-not-found"
      ) {
        setPassError("อีเมลหรือรหัสผ่านไม่ถูกต้อง");
        setEmailError("ตรวจสอบอีเมลอีกครั้ง");
        setErrorMsg("อีเมลหรือรหัสผ่านไม่ถูกต้อง");
      } else if (code === "auth/too-many-requests") {
        setErrorMsg("พยายามมากเกินไป ลองใหม่ภายหลัง");
      } else if (code === "auth/operation-not-allowed") {
        setErrorMsg("โหมด Email/Password ยังไม่ถูกเปิดใช้งาน");
      } else {
        setErrorMsg("ไม่สามารถเข้าสู่ระบบได้");
      }

      // แจ้งเตือนสั้น ๆ เพิ่ม (toast/alert)
      showToast("เข้าสู่ระบบไม่สำเร็จ");
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async () => {
    resetErrors();
    if (!email.trim()) {
      setEmailError("กรุณากรอกอีเมลก่อนรีเซ็ต");
      setErrorMsg("ระบุอีเมลเพื่อรีเซ็ตรหัสผ่าน");
      return;
    }
    try {
      await sendPasswordResetEmail(auth, email.trim());
      showToast("ส่งอีเมลรีเซ็ตรหัสผ่านแล้ว");
    } catch (err) {
      console.error("reset error:", err);
      setErrorMsg("ไม่สามารถส่งอีเมลรีเซ็ตได้");
    }
  };

  return (
    <LinearGradient colors={["#6A5AE0", "#A18AFF"]} style={styles.container}>
      <Text style={styles.title}>MeetEase</Text>

      {/* Error banner */}
      {!!errorMsg && (
        <View style={styles.errorBanner}>
          <Ionicons name="alert-circle" size={18} color="#991b1b" style={{ marginRight: 6 }} />
          <Text style={styles.errorBannerText}>{errorMsg}</Text>
        </View>
      )}

      {/* Email */}
      <TextInput
        placeholder="Enter your email"
        placeholderTextColor="#ddd"
        style={[styles.input, !!emailError && styles.inputError]}
        keyboardType="email-address"
        autoCapitalize="none"
        value={email}
        onChangeText={(t) => {
          setEmail(t);
          if (emailError) setEmailError("");
          if (errorMsg) setErrorMsg("");
        }}
      />
      {!!emailError && <Text style={styles.fieldError}>{emailError}</Text>}

      {/* Password */}
      <View style={[styles.passwordBox, !!passError && styles.inputError]}>
        <TextInput
          placeholder="Enter your password"
          placeholderTextColor="#ddd"
          style={styles.passwordInput}
          secureTextEntry={!showPassword}
          value={password}
          onChangeText={(t) => {
            setPassword(t);
            if (passError) setPassError("");
            if (errorMsg) setErrorMsg("");
          }}
        />
        <TouchableOpacity onPress={() => setShowPassword((v) => !v)}>
          <Ionicons name={showPassword ? "eye-off" : "eye"} size={20} color="#ddd" />
        </TouchableOpacity>
      </View>
      {!!passError && <Text style={styles.fieldError}>{passError}</Text>}

      {/* Remember + Reset */}
      <View style={styles.row}>
        <Text style={styles.remember}>○ Remember Me</Text>
      </View>

      {/* Sign in */}
      <TouchableOpacity style={styles.signinBtn} onPress={handleLogin} disabled={loading}>
        {loading ? <ActivityIndicator color="#000" /> : <Text style={styles.signinText}>Sign in</Text>}
      </TouchableOpacity>

      {/* Sign up */}
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

      {/* Social (ยังไม่ได้เชื่อมจริง) */}
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

      <Text style={styles.terms}>
        By signing up you agree to our <Text style={styles.link}>Terms</Text> and{" "}
        <Text style={styles.link}>Conditions of Use</Text>
      </Text>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, justifyContent: "center" },
  title: {
    fontSize: 32,
    fontWeight: "bold",
    color: "white",
    textAlign: "center",
    marginBottom: 24,
  },

  // Error banner
  errorBanner: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fee2e2",
    borderColor: "#fecaca",
    borderWidth: 1,
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderRadius: 10,
    marginBottom: 12,
  },
  errorBannerText: { color: "#991b1b", fontSize: 13, flex: 1 },

  // Inputs
  input: {
    backgroundColor: "rgba(255,255,255,0.2)",
    color: "white",
    padding: 14,
    borderRadius: 12,
    marginBottom: 6,
    borderWidth: 1,
    borderColor: "transparent",
  },
  inputError: {
    borderColor: "#fecaca",
    backgroundColor: "rgba(255, 0, 0, 0.06)",
  },
  fieldError: { color: "#fee2e2", marginBottom: 8, fontSize: 12 },

  passwordBox: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.2)",
    borderRadius: 12,
    paddingHorizontal: 10,
    marginTop: 6,
    marginBottom: 6,
    borderWidth: 1,
    borderColor: "transparent",
  },
  passwordInput: { flex: 1, color: "white", paddingVertical: 12 },

  // Row
  row: { flexDirection: "row", justifyContent: "space-between", marginBottom: 20 },
  remember: { color: "white" },
  reset: { color: "white", textDecorationLine: "underline" },

  // Buttons
  signinBtn: {
    backgroundColor: "#FFD700",
    padding: 15,
    borderRadius: 12,
    alignItems: "center",
    marginBottom: 20,
  },
  signinText: { color: "black", fontSize: 18, fontWeight: "bold" },

  // Bottom
  signupText: { color: "white", textAlign: "center", marginBottom: 20 },
  signupLink: { color: "#FFD700", fontWeight: "bold" },
  divider: { flexDirection: "row", alignItems: "center", marginBottom: 20 },
  line: { flex: 1, height: 1, backgroundColor: "#aaa" },
  orText: { color: "#ddd", marginHorizontal: 10 },
  socialRow: { flexDirection: "row", justifyContent: "center", marginBottom: 20 },
  socialBtn: { backgroundColor: "white", borderRadius: 50, padding: 10, marginHorizontal: 10 },
  socialIcon: { width: 30, height: 30 },
  terms: { color: "#ddd", textAlign: "center", fontSize: 12 },
  link: { color: "#FFD700", textDecorationLine: "underline" },
});
