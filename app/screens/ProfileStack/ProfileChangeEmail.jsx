import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { verifyBeforeUpdateEmail } from "firebase/auth";
import { useState } from "react";
import {
  Alert,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { auth } from "../../../firebaseConfig";

export default function ProfileChangeEmail() {
  const navigation = useNavigation();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

  const isValidEmail = (e) =>
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(e).toLowerCase());

  const onConfirm = async () => {
    const user = auth.currentUser;
    if (!user) {
      Alert.alert("ยังไม่ได้เข้าสู่ระบบ", "กรุณาเข้าสู่ระบบก่อน");
      return;
    }
    if (!email.trim()) {
      Alert.alert("ข้อมูลไม่ครบ", "กรุณากรอกอีเมลใหม่");
      return;
    }
    if (!isValidEmail(email)) {
      Alert.alert("อีเมลไม่ถูกต้อง", "กรุณากรอกอีเมลในรูปแบบที่ถูกต้อง");
      return;
    }

    try {
      setLoading(true);
      await verifyBeforeUpdateEmail(user, email);
      Alert.alert(
        "ส่งอีเมลยืนยันแล้ว",
        "กรุณาเปิดกล่องจดหมายของอีเมลใหม่ แล้วกดยืนยันการเปลี่ยนแปลง"
      );
      navigation.goBack();
    } catch (e) {
      const code = e?.code || "";
      let msg = "ไม่สามารถเปลี่ยนอีเมลได้";
      if (code === "auth/invalid-email") msg = "รูปแบบอีเมลไม่ถูกต้อง";
      else if (code === "auth/email-already-in-use")
        msg = "อีเมลนี้ถูกใช้งานแล้ว";
      else if (code === "auth/requires-recent-login")
        msg = "เพื่อความปลอดภัย กรุณาออกและเข้าสู่ระบบใหม่ แล้วลองอีกครั้ง";
      else if (code === "auth/invalid-credential")
        msg = "สิทธิ์หมดอายุ กรุณาเข้าสู่ระบบใหม่";
      Alert.alert("ผิดพลาด", msg);
      console.error("change email error:", e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerText}>Settings</Text>
      </View>

      <View style={styles.content}>
        <Text style={styles.sectionTitle}>Change Email</Text>
        <View style={styles.divider} />

        <Text style={styles.label}>New Email</Text>
        <TextInput
          style={styles.input}
          placeholder="Your new email..."
          keyboardType="email-address"
          autoCapitalize="none"
          autoCorrect={false}
          value={email}
          onChangeText={setEmail}
        />

        <View style={styles.actionRow}>
          <TouchableOpacity
            style={[styles.actionButton, { backgroundColor: "#FF4D4D" }]}
            onPress={() => navigation.goBack()}
            disabled={loading}
          >
            <Text style={styles.actionButtonText}>Cancel</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.actionButton, { backgroundColor: "#6C63FF" }]}
            onPress={onConfirm}
            disabled={loading}
          >
            <Text style={styles.actionButtonText}>
              {loading ? "Please wait..." : "Confirm"}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const PRIMARY = "#6C63FF";

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#FFFFFF" },
  header: {
    backgroundColor: PRIMARY,
    borderBottomLeftRadius: 16,
    borderBottomRightRadius: 16,
    paddingTop: 50,
    paddingBottom: 20,
    alignItems: "center",
    position: "relative",
  },
  headerText: { color: "white", fontSize: 22, fontWeight: "bold" },
  backButton: { position: "absolute", left: 16, top: 50 },

  content: { padding: 24 },
  sectionTitle: { fontSize: 20, fontWeight: "bold", marginBottom: 8 },
  divider: {
    borderBottomColor: "#ccc",
    borderBottomWidth: StyleSheet.hairlineWidth,
    marginBottom: 24,
  },

  label: { fontSize: 16, fontWeight: "bold", marginBottom: 6 },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 10,
    padding: 12,
    fontSize: 16,
    backgroundColor: "#fafafa",
    marginBottom: 30,
  },

  actionRow: { flexDirection: "row", justifyContent: "space-between" },
  actionButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: "center",
    marginHorizontal: 5,
  },
  actionButtonText: { color: "white", fontSize: 16, fontWeight: "600" },
});
