import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { useState } from "react";
import {
  Alert,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

import {
  EmailAuthProvider,
  reauthenticateWithCredential,
  updatePassword,
} from "firebase/auth";
import { auth } from "../../../firebaseConfig";

export default function ProfileChangePassword() {
  const navigation = useNavigation();

  const [currentPwd, setCurrentPwd] = useState("");
  const [newPwd, setNewPwd] = useState("");
  const [confirmPwd, setConfirmPwd] = useState("");
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);

  const onConfirm = async () => {
    const user = auth.currentUser;
    if (!user?.email) {
      Alert.alert("ยังไม่ได้เข้าสู่ระบบ", "กรุณาล็อกอินใหม่");
      return;
    }

    if (!currentPwd.trim() || !newPwd.trim() || !confirmPwd.trim()) {
      Alert.alert("ข้อมูลไม่ครบ", "กรุณากรอกรหัสผ่านให้ครบทุกช่อง");
      return;
    }

    if (newPwd.length < 6) {
      Alert.alert("รหัสสั้นเกินไป", "รหัสผ่านใหม่อย่างน้อย 6 ตัวอักษร");
      return;
    }

    if (newPwd !== confirmPwd) {
      Alert.alert("รหัสไม่ตรงกัน", "กรุณายืนยันรหัสผ่านใหม่ให้ตรงกัน");
      return;
    }

    if (newPwd === currentPwd) {
      Alert.alert("รหัสซ้ำ", "รหัสใหม่ต้องไม่เหมือนรหัสปัจจุบัน");
      return;
    }

    try {
      setLoading(true);

      const cred = EmailAuthProvider.credential(user.email, currentPwd);
      await reauthenticateWithCredential(user, cred);

      await updatePassword(user, newPwd);

      Alert.alert("สำเร็จ", "เปลี่ยนรหัสผ่านเรียบร้อย");
      navigation.goBack();
    } catch (e) {
      let msg = "เปลี่ยนรหัสผ่านไม่สำเร็จ";
      const code = e?.code || "";
      if (code === "auth/wrong-password") msg = "รหัสผ่านปัจจุบันไม่ถูกต้อง";
      else if (code === "auth/too-many-requests") msg = "พยายามมากเกินไป กรุณาลองใหม่ภายหลัง";
      else if (code === "auth/requires-recent-login")
        msg = "กรุณาเข้าสู่ระบบใหม่เพื่อความปลอดภัย แล้วลองอีกครั้ง";
      Alert.alert("ผิดพลาด", msg);
      console.error("change password error:", e);
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
        <Text style={styles.sectionTitle}>Change Password</Text>
        <View style={styles.divider} />

        <Text style={styles.label}>Current Password</Text>
        <View style={styles.inputWrap}>
          <TextInput
            style={styles.input}
            placeholder="Your current password..."
            secureTextEntry={!showCurrent}
            value={currentPwd}
            onChangeText={setCurrentPwd}
            autoCapitalize="none"
          />
          <TouchableOpacity onPress={() => setShowCurrent((v) => !v)}>
            <Ionicons name={showCurrent ? "eye-off" : "eye"} size={20} color="#666" />
          </TouchableOpacity>
        </View>

        <Text style={styles.label}>New Password</Text>
        <View style={styles.inputWrap}>
          <TextInput
            style={styles.input}
            placeholder="Your new password..."
            secureTextEntry={!showNew}
            value={newPwd}
            onChangeText={setNewPwd}
            autoCapitalize="none"
          />
          <TouchableOpacity onPress={() => setShowNew((v) => !v)}>
            <Ionicons name={showNew ? "eye-off" : "eye"} size={20} color="#666" />
          </TouchableOpacity>
        </View>

        <Text style={styles.label}>Confirm New Password</Text>
        <View style={styles.inputWrap}>
          <TextInput
            style={styles.input}
            placeholder="Confirm new password..."
            secureTextEntry={!showConfirm}
            value={confirmPwd}
            onChangeText={setConfirmPwd}
            autoCapitalize="none"
          />
          <TouchableOpacity onPress={() => setShowConfirm((v) => !v)}>
            <Ionicons name={showConfirm ? "eye-off" : "eye"} size={20} color="#666" />
          </TouchableOpacity>
        </View>

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
            <Text style={styles.actionButtonText}>{loading ? "Please wait..." : "Confirm"}</Text>
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

  inputWrap: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 10,
    paddingHorizontal: 12,
    backgroundColor: "#fafafa",
    marginBottom: 16,
  },
  input: { flex: 1, paddingVertical: 12, fontSize: 16 },

  actionRow: { flexDirection: "row", justifyContent: "space-between", marginTop: 20 },
  actionButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: "center",
    marginHorizontal: 5,
  },
  actionButtonText: { color: "white", fontSize: 16, fontWeight: "600" },
});
