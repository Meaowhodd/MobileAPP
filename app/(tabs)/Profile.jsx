import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

import { signOut } from "firebase/auth";
import { doc, getDoc, onSnapshot } from "firebase/firestore";
import { auth, db } from "../../firebaseConfig";

const PRIMARY = "#6C63FF";

export default function ProfileScreen() {
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [userDoc, setUserDoc] = useState(null);

  const uid = auth.currentUser?.uid || null;

  useEffect(() => {
    let unsub;
    (async () => {
      if (!uid) {
        setLoading(false);
        return;
      }
      // subscribe realtime ที่ users/{uid}
      const ref = doc(db, "users", uid);
      unsub = onSnapshot(
        ref,
        (snap) => {
          setUserDoc(snap.exists() ? snap.data() : null);
          setLoading(false);
        },
        (err) => {
          console.error("profile onSnapshot error:", err);
          setLoading(false);
        }
      );
    })();
    return () => unsub && unsub();
  }, [uid]);

  const onRefresh = async () => {
    if (!uid) return;
    setRefreshing(true);
    try {
      const ref = doc(db, "users", uid);
      const snap = await getDoc(ref);
      setUserDoc(snap.exists() ? snap.data() : null);
    } catch (e) {
      console.error("refresh profile error:", e);
    } finally {
      setRefreshing(false);
    }
  };

  const fullName = useMemo(() => {
    const display = auth.currentUser?.displayName || "";
    const first = userDoc?.firstName || display.split(" ")[0] || "—";
    const last =
      userDoc?.lastName ||
      (display.split(" ").length > 1 ? display.split(" ").slice(1).join(" ") : "");
    return `${first}${last ? " " + last : ""}`;
  }, [userDoc]);

  const email = auth.currentUser?.email || userDoc?.email || "—";
  const phone = userDoc?.phone || auth.currentUser?.phoneNumber || "—";

  // dob อาจเก็บเป็น string หรือ Firestore Timestamp
  const dob = useMemo(() => {
    const val = userDoc?.dob;
    if (!val) return "—";
    try {
      // ถ้าเป็น timestamp (มี toDate)
      if (val?.toDate) {
        const d = val.toDate();
        return d.toLocaleDateString("en-GB", { day: "2-digit", month: "long", year: "numeric" });
      }
      // ถ้าเป็น string อยู่แล้ว
      return String(val);
    } catch {
      return String(val);
    }
  }, [userDoc]);

  const photo =
    userDoc?.photoUrl ||
    auth.currentUser?.photoURL ||
    "https://ui-avatars.com/api/?name=" +
      encodeURIComponent(fullName || "User") +
      "&background=6C63FF&color=fff";

  const handleLogout = async () => {
    try {
      await signOut(auth);
      router.replace("/screens/Login"); // ปรับเส้นทางให้ตรงโปรเจ็กต์คุณ
    } catch (e) {
      console.error("signOut error:", e);
      Alert.alert("ออกจากระบบไม่สำเร็จ", "ลองใหม่อีกครั้ง");
    }
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerText}>My Profile</Text>
        {/* ปุ่ม Logout มุมขวา */}
        <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
          <Ionicons name="log-out-outline" size={27} color="#fbf6f6ff" />
        </TouchableOpacity>
      </View>

      {loading ? (
        <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
          <ActivityIndicator size="large" color={PRIMARY} />
        </View>
      ) : (
        <ScrollView
          contentContainerStyle={{ paddingVertical: 20 }}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        >
          {/* Avatar + Name */}
          <View style={{ alignItems: "center" }}>
            <View style={styles.profileImageContainer}>
              <Image source={{ uri: photo }} style={styles.profileImage} />
            </View>
            <Text style={styles.nameText}>{fullName}</Text>
          </View>

          {/* Info Fields */}
          <View style={{ marginTop: 30 }}>
            <Text style={styles.label}>First Name</Text>
            <View style={styles.contentBox}>
              <Text style={styles.contentText}>{userDoc?.firstName || fullName.split(" ")[0] || "—"}</Text>
            </View>

            <Text style={styles.label}>Last Name</Text>
            <View style={styles.contentBox}>
              <Text style={styles.contentText}>
                {userDoc?.lastName || (fullName.split(" ").slice(1).join(" ") || "—")}
              </Text>
            </View>

            <Text style={styles.label}>Date of Birth</Text>
            <View style={styles.contentBox}>
              <Text style={styles.contentText}>{dob}</Text>
            </View>

            <Text style={styles.label}>Phone Number</Text>
            <View style={styles.contentBox}>
              <Text style={styles.contentText}>{phone}</Text>
            </View>

            <Text style={styles.label}>Email Address</Text>
            <View style={styles.contentBox}>
              <Text style={styles.contentText}>{email}</Text>
            </View>
          </View>

          {/* Edit Button */}
          <TouchableOpacity
            style={styles.editButton}
            onPress={() =>
              router.push({
                pathname: "/screens/ProfileStack/ProfileSettingScreen",
                params: {
                  // ส่งค่าปัจจุบันไปหน้าแก้ไข
                  firstName: userDoc?.firstName || "",
                  lastName: userDoc?.lastName || "",
                  phone: userDoc?.phone || "",
                  dob: userDoc?.dob?.toDate ? userDoc.dob.toDate().toISOString() : userDoc?.dob || "",
                  photoUrl: userDoc?.photoUrl || "",
                },
              })
            }
          >
            <Text style={styles.editButtonText}>Edit Your Profile</Text>
          </TouchableOpacity>
        </ScrollView>
      )}
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
  headerText: { color: "white", fontSize: 24, fontWeight: "bold" },
  backButton: { position: "absolute", left: 16, top: 50 },
  logoutBtn: { position: "absolute", right: 16, top: 50 ,},

  profileImageContainer: {
    width: 150,
    height: 150,
    borderRadius: 75,
    borderWidth: 3,
    borderColor: "#000000ff",
    overflow: "hidden",
    marginBottom: 12,
  },
  profileImage: { width: "100%", height: "100%" },
  nameText: { fontSize: 22, fontWeight: "bold", marginTop: 6 },

  label: {
    fontSize: 16,
    fontWeight: "bold",
    marginLeft: 24,
    marginBottom: 6,
    marginTop: 14,
  },
  contentBox: {
    marginHorizontal: 24,
    padding: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#ccc",
    backgroundColor: "#fafafa",
  },
  contentText: { fontSize: 16, color: "#333" },

  editButton: {
    backgroundColor: PRIMARY,
    paddingVertical: 14,
    borderRadius: 12,
    marginTop: 30,
    marginHorizontal: 40,
    alignItems: "center",
  },
  editButtonText: { color: "white", fontSize: 18, fontWeight: "600" },
});
