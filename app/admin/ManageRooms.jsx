// app/admin/ManageRooms.jsx
import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect } from "@react-navigation/native";
import { useRouter } from "expo-router";
import { useCallback, useState } from "react";
import {
  Alert,
  Image,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

import { collection, deleteDoc, doc, onSnapshot } from "firebase/firestore";
import { db } from "../../firebaseConfig";

const PLACEHOLDER =
  "https://images.unsplash.com/photo-1551292831-023188e78222?w=640&q=60&auto=format&fit=crop";

export default function ManageRooms() {
  const router = useRouter();
  const [rooms, setRooms] = useState([]);

  // confirm modal
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [selected, setSelected] = useState(null); // {id, name, code, image}

  useFocusEffect(
    useCallback(() => {
      const unsub = onSnapshot(collection(db, "rooms"), (snap) => {
        const rows = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
        setRooms(rows);
      });
      return () => unsub();
    }, [])
  );

  const openConfirm = (room) => {
    setSelected(room);
    setConfirmOpen(true);
  };
  const closeConfirm = () => {
    setConfirmOpen(false);
    setSelected(null);
  };

  const applyDelete = async () => {
    if (!selected) return;
    try {
      await deleteDoc(doc(db, "rooms", selected.id));
      closeConfirm();
    } catch (e) {
      console.error(e);
      Alert.alert("Error", "ลบไม่สำเร็จ");
    }
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Manage Rooms</Text>
        <TouchableOpacity onPress={() => router.push("/admin/AddRoomForm")}>
          <Ionicons name="add-circle-outline" size={26} color="#fff" />
        </TouchableOpacity>
      </View>

      {/* List */}
      <ScrollView contentContainerStyle={styles.body}>
        {rooms.length === 0 ? (
          <Text style={styles.empty}>No rooms found.</Text>
        ) : (
          rooms.map((r) => {
            const img = r.image || r.imageUrl || PLACEHOLDER;
            return (
              <View key={r.id} style={styles.card}>
                <Image source={{ uri: img }} style={styles.thumb} />
                <View style={{ flex: 1 }}>
                  <Text style={styles.roomName} numberOfLines={1}>
                    {r.name || "-"}
                  </Text>
                  <Text style={styles.roomCode} numberOfLines={1}>
                    Room Code: {r.code || "-"}
                  </Text>
                </View>

                {/* Actions */}
                <View style={styles.actions}>
                  <Pressable
                    style={[styles.iconBtn, styles.editBtn]}
                    onPress={() => router.push({ pathname: "/admin/EditRoomForm", params: { id: r.id } })}
                    android_ripple={{ color: "#e9e9ff", borderless: true }}
                  >
                    <Ionicons name="create-outline" size={20} color="#6A5AE0" />
                  </Pressable>
                  <Pressable
                    style={[styles.iconBtn, styles.deleteBtn]}
                    onPress={() => openConfirm(r)}
                    android_ripple={{ color: "#ffe9e9", borderless: true }}
                  >
                    <Ionicons name="trash-outline" size={20} color="#EF4444" />
                  </Pressable>
                </View>
              </View>
            );
          })
        )}
      </ScrollView>

      {/* Confirm Delete Modal */}
      <Modal transparent visible={confirmOpen} animationType="fade" onRequestClose={closeConfirm}>
        <View style={styles.modalBackdrop}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>Delete this room?</Text>
            {selected && (
              <Text style={styles.modalSub}>
                {`• ${selected.name || "-"}`}
                {selected.code ? `\n• Code: ${selected.code}` : ""}
              </Text>
            )}

            <View style={styles.modalActions}>
              <TouchableOpacity style={[styles.btn, styles.btnGhost]} onPress={closeConfirm}>
                <Text style={[styles.btnText, { color: "#6A5AE0" }]}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.btn, styles.btnDanger]} onPress={applyDelete}>
                <Text style={[styles.btnText, { color: "#fff" }]}>Delete</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

/* ===== Styles ===== */
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
  },
  headerTitle: { fontSize: 20, fontWeight: "bold", color: "#fff" },

  body: { padding: 16, paddingBottom: 24 },

  card: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    borderRadius: 14,
    padding: 10,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#ececf5",
    // ใช้ทั้งเงอ native และเว็บ
    shadowColor: "#000",
    shadowOpacity: 0.06,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 3 },
    elevation: 2,
  },
  thumb: {
    width: 64,
    height: 64,
    borderRadius: 10,
    marginRight: 12,
    backgroundColor: "#eee",
  },
  roomName: { fontSize: 16, fontWeight: "700", color: "#111827" },
  roomCode: { fontSize: 13, fontWeight: "600", color: "#6B7280", marginTop: 2 },

  actions: { flexDirection: "row", marginLeft: 10 },
  iconBtn: {
    padding: 8,
    borderRadius: 10,
    borderWidth: 1,
    marginLeft: 8,
  },
  editBtn: { borderColor: "#E6E8FF", backgroundColor: "#F7F7FF" },
  deleteBtn: { borderColor: "#FFE4E4", backgroundColor: "#FFF7F7" },

  empty: { textAlign: "center", color: "#666", marginTop: 30 },

  // Modal
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
  modalTitle: { fontSize: 18, fontWeight: "700", color: "#333" },
  modalSub: { marginTop: 10, color: "#555", lineHeight: 20, whiteSpace: "pre-line" },
  modalActions: { flexDirection: "row", justifyContent: "flex-end", marginTop: 14 },
  btn: { paddingVertical: 10, paddingHorizontal: 16, borderRadius: 10, marginRight: 5 },
  btnGhost: { backgroundColor: "#fff", borderWidth: 1, borderColor: "#6A5AE0" },
  btnDanger: { backgroundColor: "#EF4444" },
  btnText: { fontSize: 14, fontWeight: "700" },
});
