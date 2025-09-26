// app/admin/ManageUsers.jsx
import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect } from "@react-navigation/native";
import { useRouter } from "expo-router";
import { useCallback, useState } from "react";
import {
  Alert,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

import { collection, deleteDoc, doc, onSnapshot, updateDoc } from "firebase/firestore";
import { auth, db } from "../../firebaseConfig";

// 🔴 ไม่มี guest แล้ว
const ROLE_CHOICES = ["student", "admin"];

export default function ManageUsers() {
  const router = useRouter();
  const [users, setUsers] = useState([]);

  // edit modal
  const [visible, setVisible] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    role: "student",
  });

  // delete confirm modal
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [targetUser, setTargetUser] = useState(null);
  const [deleting, setDeleting] = useState(false);

  // subscribe realtime
  useFocusEffect(
    useCallback(() => {
      const unsub = onSnapshot(collection(db, "users"), (snap) => {
        setUsers(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
      });
      return () => unsub();
    }, [])
  );

  const fullName = (u) =>
    [u.firstName, u.lastName].filter(Boolean).join(" ").trim() || "-";

  /* ===== Edit ===== */
  const openEdit = (u) => {
    setEditingId(u.id);
    setForm({
      firstName: u.firstName ?? "",
      lastName: u.lastName ?? "",
      email: u.email ?? "",
      role: u.role ?? "student",
    });
    setVisible(true);
  };

  const saveEdit = async () => {
    if (!form.email.trim()) {
      Alert.alert("Invalid", "กรุณากรอกอีเมล");
      return;
    }
    try {
      await updateDoc(doc(db, "users", editingId), {
        firstName: form.firstName.trim(),
        lastName: form.lastName.trim(),
        email: form.email.trim(),
        role: form.role,
      });
      setVisible(false);
      setEditingId(null);
    } catch (e) {
      console.error(e);
      Alert.alert("Error", "อัปเดตไม่สำเร็จ");
    }
  };

  /* ===== Delete with make-sure modal ===== */
  const openConfirmDelete = (u) => {
    setTargetUser(u);
    setConfirmOpen(true);
  };
  const closeConfirm = () => {
    if (deleting) return;
    setConfirmOpen(false);
    setTargetUser(null);
  };

  const doDelete = async () => {
    if (!targetUser) return;

    // กันลบตัวเอง (โดยเฉพาะ admin ที่กำลังใช้งาน)
    const currentUid = auth?.currentUser?.uid;
    if (currentUid && targetUser.id === currentUid) {
      Alert.alert("ไม่สามารถลบตัวเองได้");
      return;
    }

    try {
      setDeleting(true);
      await deleteDoc(doc(db, "users", targetUser.id));
      closeConfirm();
    } catch (e) {
      console.error(e);
      Alert.alert("Error", "ลบไม่สำเร็จ");
    } finally {
      setDeleting(false);
    }
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="white" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Manage Users</Text>
        <View style={{ width: 24 }} />
      </View>

      {/* Body */}
      <ScrollView contentContainerStyle={styles.body}>
        {users.length === 0 ? (
          <Text style={{ textAlign: "center", color: "#666", marginTop: 30 }}>
            No users found.
          </Text>
        ) : (
          users.map((u) => (
            <View key={u.id} style={styles.userCard}>
              <View style={{ flex: 1, paddingRight: 10 }}>
                <Text style={styles.userName}>{fullName(u)}</Text>
                <Text style={styles.userEmail}>{u.email ?? "-"}</Text>
                <Text style={styles.userRole}>Role: {u.role ?? "student"}</Text>
              </View>
              <View style={styles.actions}>
                <TouchableOpacity style={styles.actionBtn} onPress={() => openEdit(u)}>
                  <Ionicons name="create-outline" size={20} color="#6A5AE0" />
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.actionBtn}
                  onPress={() => openConfirmDelete(u)}
                >
                  <Ionicons name="trash-outline" size={20} color="#ef4444" />
                </TouchableOpacity>
              </View>
            </View>
          ))
        )}
      </ScrollView>

      {/* ===== Edit Modal ===== */}
      <Modal transparent visible={visible} animationType="fade" onRequestClose={() => setVisible(false)}>
        <View style={styles.modalBackdrop}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>Edit User</Text>

            <Text style={styles.inputLabel}>First name</Text>
            <TextInput
              style={styles.input}
              value={form.firstName}
              onChangeText={(t) => setForm((s) => ({ ...s, firstName: t }))}
            />

            <Text style={styles.inputLabel}>Last name</Text>
            <TextInput
              style={styles.input}
              value={form.lastName}
              onChangeText={(t) => setForm((s) => ({ ...s, lastName: t }))}
            />

            <Text style={styles.inputLabel}>Email</Text>
            <TextInput
              style={styles.input}
              value={form.email}
              autoCapitalize="none"
              keyboardType="email-address"
              onChangeText={(t) => setForm((s) => ({ ...s, email: t }))}
            />

            <Text style={styles.inputLabel}>Role</Text>
            <View style={styles.roleRow}>
              {ROLE_CHOICES.map((r) => {
                const active = form.role === r;
                return (
                  <Pressable
                    key={r}
                    onPress={() => setForm((s) => ({ ...s, role: r }))}
                    style={[
                      styles.roleChip,
                      active && { backgroundColor: "#6A5AE0" },
                    ]}
                  >
                    <Text style={[styles.roleText, active && { color: "#fff" }]}>{r}</Text>
                  </Pressable>
                );
              })}
            </View>

            <View style={styles.modalActions}>
              <TouchableOpacity style={[styles.btn, styles.btnGhost]} onPress={() => setVisible(false)}>
                <Text style={[styles.btnText, { color: "#6A5AE0" }]}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.btn, styles.btnPrimary]} onPress={saveEdit}>
                <Text style={[styles.btnText, { color: "#fff" }]}>Save</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* ===== Delete Confirm Modal (Make sure) ===== */}
      <Modal transparent visible={confirmOpen} animationType="fade" onRequestClose={closeConfirm}>
        <View style={styles.modalBackdrop}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>Delete this user?</Text>
            {targetUser && (
              <Text style={styles.modalSub}>
                {`ชื่อ: ${fullName(targetUser)}\nอีเมล: ${targetUser.email ?? "-" }\nบทบาท: ${targetUser.role ?? "-"}`}
              </Text>
            )}

            <View style={styles.modalActions}>
              <TouchableOpacity style={[styles.btn, styles.btnGhost]} onPress={closeConfirm} disabled={deleting}>
                <Text style={[styles.btnText, { color: "#6A5AE0" }]}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.btn, styles.btnDanger]}
                onPress={doDelete}
                disabled={deleting}
              >
                <Text style={[styles.btnText, { color: "#fff" }]}>{deleting ? "Deleting..." : "Delete"}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
      {/* ===== /Modals ===== */}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },

  header: {
    backgroundColor: "#6A5AE0",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingTop: 50,
    paddingHorizontal: 20,
    paddingBottom: 15,
    borderBottomLeftRadius: 16,
    borderBottomRightRadius: 16,
  },
  headerTitle: { fontSize: 22, fontWeight: "bold", color: "white",marginBottom: 5 },

  body: { padding: 20 },

  userCard: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 15,
    marginBottom: 15,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    elevation: 2,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 5,
    shadowOffset: { width: 0, height: 2 },
  },
  userName: { fontSize: 16, fontWeight: "bold", color: "#333" },
  userEmail: { fontSize: 14, color: "#666" },
  userRole: { fontSize: 12, color: "#999", marginTop: 2 },

  actions: { flexDirection: "row" },
  actionBtn: { marginLeft: 10 },

  // ===== Modal base =====
  modalBackdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,.35)",
    justifyContent: "center",
    padding: 22,
  },
  modalCard: {
    backgroundColor: "#fff",
    borderRadius: 14,
    padding: 18,
  },
  modalTitle: { fontSize: 18, fontWeight: "700", marginBottom: 8, color: "#333" },
  modalSub: { marginTop: 8, color: "#555", lineHeight: 20, whiteSpace: "pre-line" },

  inputLabel: { fontSize: 12, color: "#666", marginTop: 8, marginBottom: 4 },
  input: {
    borderWidth: 1,
    borderColor: "#e5e7eb",
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 14,
  },

  roleRow: { flexDirection: "row", flexWrap: "wrap", marginTop: 8 },
  roleChip: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: "#e5e7eb",
    marginRight: 8,
    marginBottom: 8,
  },
  roleText: { color: "#333", fontSize: 13, fontWeight: "600" },

  modalActions: {
    flexDirection: "row",
    justifyContent: "flex-end",
    marginTop: 16,
  },
  btn: { paddingVertical: 10, paddingHorizontal: 16, borderRadius: 10 , marginRight: 5 },
  btnGhost: { backgroundColor: "#fff", borderWidth: 1, borderColor: "#6A5AE0" },
  btnPrimary: { backgroundColor: "#6A5AE0" },
  btnDanger: { backgroundColor: "#ef4444" },
  btnText: { fontSize: 14, fontWeight: "700" },
});
