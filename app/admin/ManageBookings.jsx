// app/admin/ManageBookings.jsx
import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect } from "@react-navigation/native";
import { useRouter } from "expo-router";
import { useCallback, useState } from "react";
import {
  Alert,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

import {
  addDoc,
  collection,
  doc,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  updateDoc,
} from "firebase/firestore";
import { db } from "../../firebaseConfig";

const fmtDate = (row) => {
  if (row?.date) return row.date;
  const ts = row?.slotStart?.toDate?.() ? row.slotStart.toDate() : null;
  if (!ts) return "-";
  return ts.toLocaleDateString("th-TH");
};
const fmtTime = (row) => {
  if (row?.time) return row.time;
  const s = row?.slotStart?.toDate?.() ? row.slotStart.toDate() : null;
  const e = row?.slotEnd?.toDate?.() ? row.slotEnd.toDate() : null;
  if (!s || !e) return "-";
  return `${s.toLocaleTimeString("th-TH", { hour: "2-digit", minute: "2-digit" })} - ${e.toLocaleTimeString("th-TH", { hour: "2-digit", minute: "2-digit" })}`;
};
const statusColor = (status) => {
  switch ((status || "").toLowerCase()) {
    case "approved": return "#16a34a";
    case "pending":  return "#f59e0b";
    default:         return "#6b7280";
  }
};
const normalizeAccessories = (bk) => {
  if (Array.isArray(bk?.accessories)) return bk.accessories.filter(Boolean).map(String);
  if (bk?.accessory) return [String(bk.accessory)];
  return [];
};

export default function ManageBookings() {
  const router = useRouter();

  const [bookings, setBookings] = useState([]);
  const [usersMap, setUsersMap] = useState({}); 

  // Confirm modal (approve/reject)
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [actionType, setActionType] = useState(null); 
  const [selected, setSelected] = useState(null);

  // Details modal (view)
  const [detailsOpen, setDetailsOpen] = useState(false);

  useFocusEffect(
    useCallback(() => {
      const unsubUsers = onSnapshot(collection(db, "users"), (snap) => {
        const map = {};
        snap.docs.forEach((d) => {
          const u = d.data();
          map[d.id] =
            `${u.firstName ?? ""} ${u.lastName ?? ""}`.trim() ||
            u.email ||
            d.id;
        });
        setUsersMap(map);
      });

      const q = query(collection(db, "bookings"), orderBy("slotStart", "desc"));
      const unsubBookings = onSnapshot(q, (snap) => {
        const rows = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
        setBookings(rows);
      });

      return () => {
        unsubUsers();
        unsubBookings();
      };
    }, [])
  );

  const openConfirm = (bk, type) => {
    setSelected(bk);
    setActionType(type); 
    setConfirmOpen(true);
  };
  const closeConfirm = () => {
    setConfirmOpen(false);
    setActionType(null);
    setSelected(null);
  };

  const openDetails = (bk) => {
    setSelected(bk);
    setDetailsOpen(true);
  };
  const closeDetails = () => {
    setDetailsOpen(false);
    setSelected(null);
  };

  async function pushUserNotification({ userId, booking, newStatus }) {
    if (!userId) return;
    const roomName = booking.roomName || booking.room || booking.roomId || "-";
    const roomCode = booking.roomCode || booking.room || "";
    const title =
      newStatus === "approved" ? "ยืนยันการจองแล้ว!" : "การจองถูกปฏิเสธ";
    const description = `${roomName}${roomCode ? ` (${roomCode})` : ""} • ${fmtDate(
      booking
    )} • ${fmtTime(booking)} — สถานะ: ${newStatus}`;

    await addDoc(collection(db, "users", userId, "notifications"), {
      type: newStatus === "approved" ? "booking_confirmed" : "booking_updated",
      title,
      description,
      createdAt: serverTimestamp(),
      read: false,
      roomName,
      roomCode,
      slotStart: booking.slotStart,
      slotEnd: booking.slotEnd,
      status: newStatus, 
    });
  }

  const applyAction = async () => {
    if (!selected || !actionType) return;
    const newStatus = actionType === "approve" ? "approved" : "rejected";

    try {
      await updateDoc(doc(db, "bookings", selected.id), { status: newStatus });

      await pushUserNotification({
        userId: selected.userId,
        booking: selected,
        newStatus,
      });

      closeConfirm();
    } catch (e) {
      console.error(e);
      Alert.alert("Error", "ไม่สามารถอัปเดตสถานะได้");
    }
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="white" />
        </TouchableOpacity>

        <Text style={styles.headerTitle}>Manage Bookings</Text>

        {/* ปุ่มไปหน้าดูประวัติ (ไม่มีปุ่มลบในหน้านี้) */}
        <TouchableOpacity
          onPress={() => router.push("/admin/BookingsHistory")}
          style={styles.historyBtn}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          <Ionicons name="time-outline" size={18} color="#6A5AE0" />
          <Text style={styles.historyText}>History</Text>
        </TouchableOpacity>
      </View>

      {/* Body */}
      <ScrollView contentContainerStyle={styles.body}>
        {bookings
          .filter((bk) =>
            ["approved", "pending"].includes((bk.status || "").toLowerCase())
          )
          .map((bk) => {
            const status = (bk.status || "pending").toLowerCase();
            const canAct = status === "pending";
            const fullName = usersMap[bk.userId] || "-";
            const roomName = bk.roomName || bk.room || bk.roomId || "-";
            const accList = normalizeAccessories(bk);
            const hasAccessory = accList.length > 0;

            return (
              <View key={bk.id} style={styles.bookingCard}>
                <View style={{ flex: 1, paddingRight: 8 }}>
                  <Text style={styles.bookingUser}>{fullName}</Text>
                  <Text style={styles.bookingDetail}>Room: {roomName}</Text>
                  <Text style={styles.bookingDetail}>Date: {fmtDate(bk)}</Text>
                  <Text style={styles.bookingDetail}>Time: {fmtTime(bk)}</Text>

                <View style={styles.statusRow}>
                  <View
                    style={[
                      styles.statusChip,
                      { borderColor: statusColor(status) },
                    ]}
                  >
                    <Text
                      style={[
                        styles.statusText,
                        { color: statusColor(status) },
                      ]}
                    >
                      {status.charAt(0).toUpperCase() + status.slice(1)}
                    </Text>
                  </View>

                  <View
                    style={[
                      styles.statusChip,
                      {
                        borderColor: hasAccessory ? "#16a34a" : "#ef4444",
                        marginLeft: 8,
                      },
                    ]}
                  >
                    <Text
                      style={[
                        styles.statusText,
                        { color: hasAccessory ? "#16a34a" : "#ef4444" },
                      ]}
                    >
                      {hasAccessory ? "Accessory" : "Accessory"}
                    </Text>
                  </View>
                </View>
              </View>

              {/* Actions: View / Approve / Reject  (ไม่มีปุ่มลบ) */}
              <View style={styles.actions}>
                <TouchableOpacity
                  style={styles.actionBtn}
                  onPress={() => openDetails(bk)}
                >
                  <Ionicons
                    name="information-circle-outline"
                    size={22}
                    color="#3b82f6"
                  />
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.actionBtn, !canAct && { opacity: 0.35 }]}
                  disabled={!canAct}
                  onPress={() => openConfirm(bk, "approve")}
                >
                  <Ionicons
                    name="checkmark-circle-outline"
                    size={22}
                    color="#16a34a"
                  />
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.actionBtn, !canAct && { opacity: 0.35 }]}
                  disabled={!canAct}
                  onPress={() => openConfirm(bk, "reject")}
                >
                  <Ionicons
                    name="close-circle-outline"
                    size={22}
                    color="#ef4444"
                  />
                </TouchableOpacity>
              </View>
            </View>
          );
        })}

        {bookings.filter((bk) =>
          ["approved", "pending"].includes((bk.status || "").toLowerCase())
        ).length === 0 && (
          <Text style={{ textAlign: "center", color: "#666", marginTop: 30 }}>
            No bookings found.
          </Text>
        )}
      </ScrollView>

      {/* ===== Details Modal ===== */}
      <Modal
        transparent
        visible={detailsOpen}
        animationType="fade"
        onRequestClose={closeDetails}
      >
        <View style={styles.modalBackdrop}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>Booking Details</Text>
            {selected && (
              <>
                <DetailRow
                  label="ชื่อผู้จอง"
                  value={usersMap[selected.userId] || "-"}
                />
                <DetailRow
                  label="ห้อง"
                  value={
                    selected.roomName ||
                    selected.room ||
                    selected.roomId ||
                    "-"
                  }
                />
                <DetailRow label="วันที่" value={fmtDate(selected)} />
                <DetailRow label="เวลา" value={fmtTime(selected)} />
                <DetailRow
                  label="สถานะ"
                  value={(selected.status || "pending").toUpperCase()}
                />
                <View style={{ marginTop: 8 }}>
                  <Text style={styles.detailLabel}>Accessory:</Text>
                  {normalizeAccessories(selected).length > 0 ? (
                    <View style={{ marginTop: 6 }}>
                      {normalizeAccessories(selected).map((a, idx) => (
                        <Text key={idx} style={styles.detailValue}>
                          • {a}
                        </Text>
                      ))}
                    </View>
                  ) : (
                    <Text style={[styles.detailValue, { color: "#999" }]}>
                      ไม่มีรายการ accessory
                    </Text>
                  )}
                </View>
              </>
            )}
            <View style={styles.modalActions}>
              <TouchableOpacity
                style={[styles.btn, styles.btnPrimary]}
                onPress={closeDetails}
              >
                <Text style={[styles.btnText, { color: "#fff" }]}>Close</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* ===== Confirm Modal (Approve / Reject) ===== */}
      <Modal
        transparent
        visible={confirmOpen}
        animationType="fade"
        onRequestClose={closeConfirm}
      >
        <View style={styles.modalBackdrop}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>
              {actionType === "approve" ? "Approve booking?" : "Reject booking?"}
            </Text>
            {selected && (
              <Text style={styles.modalSub}>
                {`ผู้ใช้: ${usersMap[selected.userId] || "-"}`}
                {`\nห้อง: ${
                  selected.roomName || selected.room || selected.roomId || "-"
                }`}
                {`\nวันที่: ${fmtDate(selected)}`}
                {`\nเวลา: ${fmtTime(selected)}`}
              </Text>
            )}

            <View style={styles.modalActions}>
              <TouchableOpacity
                style={[styles.btn, styles.btnGhost]}
                onPress={closeConfirm}
              >
                <Text style={[styles.btnText, { color: "#6A5AE0" }]}>
                  Cancel
                </Text>
              </TouchableOpacity>

              {actionType === "approve" ? (
                <TouchableOpacity
                  style={[styles.btn, styles.btnApprove]}
                  onPress={applyAction}
                >
                  <Text style={[styles.btnText, { color: "#fff" }]}>
                    Approve
                  </Text>
                </TouchableOpacity>
              ) : (
                <TouchableOpacity
                  style={[styles.btn, styles.btnReject]}
                  onPress={applyAction}
                >
                  <Text style={[styles.btnText, { color: "#fff" }]}>
                    Reject
                  </Text>
                </TouchableOpacity>
              )}
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

function DetailRow({ label, value }) {
  return (
    <View style={{ marginTop: 8 }}>
      <Text style={styles.detailLabel}>{label}:</Text>
      <Text style={styles.detailValue}>{String(value ?? "-")}</Text>
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
  headerTitle: { fontSize: 20, fontWeight: "bold", color: "white", marginBottom: 5 },

  historyBtn: {
    backgroundColor: "#ffffff",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  historyText: { color: "#6A5AE0", fontWeight: "700" },

  body: { padding: 20 },

  bookingCard: {
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
  bookingUser: { fontSize: 16, fontWeight: "bold", color: "#333" },
  bookingDetail: { fontSize: 14, color: "#666" },
  statusRow: { flexDirection: "row", alignItems: "center", marginTop: 6 },
  statusChip: {
    alignSelf: "flex-start",
    borderWidth: 1,
    borderRadius: 999,
    paddingVertical: 4,
    paddingHorizontal: 10,
  },
  statusText: { fontSize: 12, fontWeight: "700" },

  actions: { flexDirection: "row" },
  actionBtn: { marginLeft: 10 },

  modalBackdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,.35)",
    justifyContent: "center",
    padding: 22,
  },
  modalCard: { backgroundColor: "#fff", borderRadius: 14, padding: 18 },
  modalTitle: { fontSize: 18, fontWeight: "700", color: "#333" },
  modalSub: { marginTop: 10, color: "#555", lineHeight: 20, whiteSpace: "pre-line" },
  modalActions: { flexDirection: "row", justifyContent: "flex-end", marginTop: 16 },

  btn: { paddingVertical: 10, paddingHorizontal: 16, borderRadius: 10, marginRight: 5 },
  btnGhost: { backgroundColor: "#fff", borderWidth: 1, borderColor: "#6A5AE0" },
  btnPrimary: { backgroundColor: "#6A5AE0" },
  btnApprove: { backgroundColor: "#3fde79ff" }, 
  btnReject: { backgroundColor: "#ef4444" },
  btnText: { fontSize: 14, fontWeight: "700" },

  detailLabel: { fontSize: 12, color: "#666" },
  detailValue: { fontSize: 14, color: "#333", marginTop: 2 },
});
