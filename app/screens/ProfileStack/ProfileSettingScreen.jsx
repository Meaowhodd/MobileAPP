// screens/ProfileStack/ProfileSettingScreen.jsx
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import * as ImagePicker from "expo-image-picker";
import { doc, getDoc, serverTimestamp, setDoc } from "firebase/firestore";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { auth, db } from "../../../firebaseConfig";

const PRIMARY = "#6C63FF";
const CLOUDINARY_CLOUD_NAME = "dlknbn6pd";
const CLOUDINARY_UNSIGNED_PRESET = "unsigned_rooms";

export default function ProfileSettingScreen() {
  const navigation = useNavigation();
  const uid = auth.currentUser?.uid || null;
  const fallbackPhoto =
    "https://ui-avatars.com/api/?background=6C63FF&color=fff&name=" +
    encodeURIComponent(auth.currentUser?.displayName || "User");

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [dob, setDob] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState(auth.currentUser?.email || "");
  const [photoUrl, setPhotoUrl] = useState(fallbackPhoto);

  useEffect(() => {
    (async () => {
      if (!uid) {
        setLoading(false);
        return;
      }
      try {
        const snap = await getDoc(doc(db, "users", uid));
        if (snap.exists()) {
          const d = snap.data();
          setFirstName(d.firstName || "");
          setLastName(d.lastName || "");
          if (d.dob?.toDate) {
            const dt = d.dob.toDate();
            const dd = String(dt.getDate()).padStart(2, "0");
            const mm = String(dt.getMonth() + 1).padStart(2, "0");
            const yyyy = dt.getFullYear();
            setDob(`${dd}/${mm}/${yyyy}`);
          } else {
            setDob(d.dob || "");
          }
          setPhone(d.phone || "");
          setEmail(d.email || auth.currentUser?.email || "");
          setPhotoUrl(d.photoUrl || fallbackPhoto);
        } else {
          const display = auth.currentUser?.displayName || "";
          if (display) {
            const [fn, ...rest] = display.split(" ");
            setFirstName(fn || "");
            setLastName(rest.join(" "));
          }
        }
      } catch (e) {
        console.error("load profile error:", e);
      } finally {
        setLoading(false);
      }
    })();
  }, [uid]);

  const pickAndUploadImage = async () => {
    try {
      const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!perm.granted) {
        Alert.alert("ต้องการสิทธิ์", "กรุณาอนุญาตเข้าถึงรูปภาพ");
        return;
      }
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        quality: 0.85,
        base64: Platform.OS === "web",
      });
      if (result.canceled) return;
      const asset = result.assets?.[0];
      if (!asset?.uri) return;
      setSaving(true);

      const form = new FormData();
      const uploadUrl = `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`;
      const mime = asset.mimeType || "image/jpeg";
      const filename = asset.fileName || "avatar.jpg";

      if (Platform.OS === "web") {
        try {
          const res = await fetch(asset.uri);
          const blob = await res.blob();
          form.append("file", blob, filename);
        } catch {
          if (!asset.base64) throw new Error("Cannot read file on web");
          form.append("file", `data:${mime};base64,${asset.base64}`);
        }
      } else {
        form.append("file", { uri: asset.uri, type: mime, name: filename });
      }

      form.append("upload_preset", CLOUDINARY_UNSIGNED_PRESET);

      const res = await fetch(uploadUrl, { method: "POST", body: form });
      if (!res.ok) throw new Error(await res.text());
      const json = await res.json();
      if (!json.secure_url) throw new Error("No secure_url from Cloudinary");
      setPhotoUrl(json.secure_url);
      Alert.alert("สำเร็จ", "อัปโหลดรูปภาพแล้ว ✔️");
    } catch (e) {
      console.error("cloudinary upload error:", e);
      Alert.alert("อัปโหลดไม่สำเร็จ", "ตรวจค่า Cloudinary/preset และลองใหม่");
    } finally {
      setSaving(false);
    }
  };

  const onSave = async () => {
    if (!uid) {
      Alert.alert("ยังไม่ได้เข้าสู่ระบบ", "โปรดเข้าสู่ระบบก่อน");
      return;
    }
    if (!firstName.trim() || !lastName.trim()) {
      Alert.alert("ข้อมูลไม่ครบ", "กรุณากรอกชื่อและนามสกุล");
      return;
    }
    try {
      setSaving(true);
      await setDoc(
        doc(db, "users", uid),
        {
          email: email || auth.currentUser?.email || "",
          firstName: firstName.trim(),
          lastName: lastName.trim(),
          dob: dob.trim(),
          phone: phone.trim(),
          photoUrl,
          updatedAt: serverTimestamp(),
        },
        { merge: true }
      );
      Alert.alert("บันทึกแล้ว", "อัปเดตโปรไฟล์เรียบร้อย");
      navigation.goBack();
    } catch (e) {
      console.error("save profile error:", e);
      Alert.alert("บันทึกไม่สำเร็จ", "ลองใหม่อีกครั้ง");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <View style={[styles.container, { alignItems: "center", justifyContent: "center" }]}>
        <ActivityIndicator size="large" color={PRIMARY} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerText}>Settings</Text>
      </View>

      <ScrollView contentContainerStyle={{ paddingVertical: 20 }}>
        <View style={{ alignItems: "center", marginBottom: 20 }}>
          <Text style={styles.sectionTitle}>Profile</Text>
          <Text style={styles.subTitle}>Edit personal information</Text>

          <TouchableOpacity activeOpacity={0.9} onPress={pickAndUploadImage} style={styles.profileImageContainer}>
            <Image source={{ uri: photoUrl }} style={styles.profileImage} />
            <View style={styles.centerBadge}>
              <Ionicons name="camera-outline" size={28} color="#fff" />
            </View>
            {saving && (
              <View style={styles.uploadOverlay}>
                <ActivityIndicator color="#fff" />
              </View>
            )}
          </TouchableOpacity>
        </View>

        <Text style={styles.label}>First Name</Text>
        <TextInput style={styles.input} placeholder="Your first name..." value={firstName} onChangeText={setFirstName} />

        <Text style={styles.label}>Last Name</Text>
        <TextInput style={styles.input} placeholder="Your last name..." value={lastName} onChangeText={setLastName} />

        <Text style={styles.label}>Date of Birth</Text>
        <TextInput style={styles.input} placeholder="DD/MM/YYYY" value={dob} onChangeText={setDob} />

        <Text style={styles.label}>Phone Number</Text>
        <TextInput
          style={styles.input}
          placeholder="+66 123456789"
          keyboardType="phone-pad"
          value={phone}
          onChangeText={setPhone}
        />

        <Text style={[styles.sectionTitle, { marginTop: 30 }]}>Account</Text>

        <View style={styles.valueRow}>
          <Text style={styles.labelInline}>E-mail:</Text>
          <Text style={styles.valueText}>{email}</Text>
        </View>

        <TouchableOpacity style={styles.buttonPrimary} onPress={() => Alert.alert("เปลี่ยนอีเมล", "ยังไม่เชื่อม")}>
          <Text style={styles.buttonText}>Change E-mail</Text>
        </TouchableOpacity>

        <View style={styles.valueRow}>
          <Text style={styles.labelInline}>Password:</Text>
          <Text style={styles.valueText}>**********</Text>
        </View>

        <TouchableOpacity style={styles.buttonPrimary} onPress={() => Alert.alert("เปลี่ยนรหัสผ่าน", "ยังไม่เชื่อม")}>
          <Text style={styles.buttonText}>Change Password</Text>
        </TouchableOpacity>

        <View style={styles.actionRow}>
          <TouchableOpacity style={[styles.actionButton, { backgroundColor: "#FF4D4D" }]} onPress={() => navigation.goBack()}>
            <Text style={styles.actionButtonText}>Cancel</Text>
          </TouchableOpacity>

          <TouchableOpacity style={[styles.actionButton, { backgroundColor: PRIMARY }]} onPress={onSave} disabled={saving}>
            {saving ? <ActivityIndicator color="#fff" /> : <Text style={styles.actionButtonText}>Save</Text>}
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
}

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
  sectionTitle: { fontSize: 22, fontWeight: "bold", marginBottom: 6 },
  subTitle: { fontSize: 16, color: "#555", marginBottom: 10 },
  profileImageContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 2,
    borderColor: "#ddd",
    overflow: "hidden",
    marginBottom: 12,
    position: "relative",
    justifyContent: "center",
    alignItems: "center",
  },
  profileImage: { width: "100%", height: "100%" },
  centerBadge: {
    position: "absolute",
    top: "50%",
    left: "50%",
    transform: [{ translateX: -20 }, { translateY: -20 }],
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(0,0,0,0.35)",
    alignItems: "center",
    justifyContent: "center",
  },
  uploadOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.25)",
    alignItems: "center",
    justifyContent: "center",
  },
  label: {
    fontSize: 16,
    fontWeight: "bold",
    marginLeft: 24,
    marginBottom: 6,
    marginTop: 14,
  },
  labelInline: { fontSize: 16, fontWeight: "bold" },
  input: {
    marginHorizontal: 24,
    padding: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#ccc",
    backgroundColor: "#fafafa",
    fontSize: 16,
  },
  valueRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginHorizontal: 24,
    marginTop: 20,
    alignItems: "center",
  },
  valueText: { fontSize: 16, color: "#333" },
  buttonPrimary: {
    backgroundColor: PRIMARY,
    paddingVertical: 12,
    borderRadius: 10,
    marginHorizontal: 24,
    marginTop: 14,
    alignItems: "center",
  },
  buttonText: { color: "white", fontSize: 16, fontWeight: "600" },
  actionRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginHorizontal: 24,
    marginTop: 30,
    marginBottom: 24,
  },
  actionButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: "center",
    marginHorizontal: 5,
  },
  actionButtonText: { color: "white", fontSize: 16, fontWeight: "600" },
});
