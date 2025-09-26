// app/(tabs)/Book.jsx
import Ionicons from "@expo/vector-icons/Ionicons";
import { useFocusEffect } from "@react-navigation/native";
import { useRouter } from "expo-router";
import { onAuthStateChanged } from "firebase/auth";
import {
  addDoc,
  collection,
  doc,
  getDocs,
  limit,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  startAfter,
  updateDoc,
  where,
  writeBatch,
} from "firebase/firestore";
import { useCallback, useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
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
import { auth, db } from "../../firebaseConfig";

const COLOR = {
  primary: "#6C63FF",
  headerDot: "#e9e9ef",
  bg: "#FFFFFF",
  text: "#111827",
  muted: "#6B7280",
  chipActive: "#ECE9FF",
  cancelBtn: "#3E3E3E",
  // status colors
  pending: "#F59E0B", // ส้ม
  approved: "#10B981", // เขียว
  completed: "#3B82F6", // น้ำเงิน
  canceled: "#EF4444", // แดง
  rejected: "#DC2626", // แดงเข้ม
};

const chunk = (arr, size) => {
  const out = [];
  for (let i = 0; i < arr.length; i += size) out.push(arr.slice(i, i + size));
  return out;
};

/** เติมข้อมูลห้องให้ booking ชุดหนึ่ง (คืน array ใหม่) */
async function hydrateRooms(items) {
  if (!items.length) return [];

  const idKeys = Array.from(new Set(items.map((x) => x.roomId).filter(Boolean)));
  const codeKeys = Array.from(
    new Set(items.filter((x) => !x.roomId && x.roomCode).map((x) => x.roomCode))
  );
  const nameKeys = Array.from(
    new Set(items.filter((x) => !x.roomId && !x.roomCode && x.roomName).map((x) => x.roomName))
  );

  const roomMap = new Map();
  // by document id
  for (const ids of chunk(idKeys, 10)) {
    const qRooms = query(collection(db, "rooms"), where("__name__", "in", ids));
    const rs = await getDocs(qRooms);
    rs.forEach((r) => roomMap.set(r.id, { id: r.id, ...r.data() }));
  }
  // by code
  for (const codes of chunk(codeKeys, 10)) {
    const qRooms = query(collection(db, "rooms"), where("code", "in", codes));
    const rs = await getDocs(qRooms);
    rs.forEach((r) => roomMap.set(r.id, { id: r.id, ...r.data() }));
  }
  // by name
  for (const names of chunk(nameKeys, 10)) {
    const qRooms = query(collection(db, "rooms"), where("name", "in", names));
    const rs = await getDocs(qRooms);
    rs.forEach((r) => roomMap.set(r.id, { id: r.id, ...r.data() }));
  }

  return items.map((b) => {
    let r = null;
    if (b.roomId && roomMap.has(b.roomId)) r = roomMap.get(b.roomId);
    else if (b.roomCode) r = [...roomMap.values()].find((x) => x.code === b.roomCode) || null;
    else if (b.roomName) r = [...roomMap.values()].find((x) => x.name === b.roomName) || null;

    return {
      ...b,
      _roomImage: r?.image || r?.imageUrl || null,
      _floor: r?.floor ?? b.floor ?? null,
      _roomDocId: r?.id || null,
    };
  });
}

/** อัปเดต bookings ที่หมดเวลา + ส่ง notifications:
 * - approved -> completed (type: booking_completed)
 * - pending  -> rejected  (type: booking_rejected)
 * ทำฝั่ง client (จะทำงานเมื่อเปิดหน้า/โฟกัสเท่านั้น)
 */
async function autoCompleteOverdue(uid) {
  if (!uid) return;
  const now = new Date();

  // 1) approved ที่หมดเวลา -> completed
  {
    let lastDoc = null;
    while (true) {
      const constraints = [
        where("userId", "==", uid),
        where("status", "==", "approved"),
        where("slotEnd", "<=", now),
        orderBy("slotEnd", "asc"),
        limit(50),
      ];
      if (lastDoc) constraints.splice(4, 0, startAfter(lastDoc));
      const q = query(collection(db, "bookings"), ...constraints);
      const snap = await getDocs(q);
      if (snap.empty) break;

      const batch = writeBatch(db);
      snap.forEach((ds) => {
        const d = ds.data();
        // update booking
        batch.update(ds.ref, { status: "completed", updatedAt: new Date() });
        // add notification
        const nref = doc(collection(db, "users", uid, "notifications"));
        batch.set(nref, {
          type: "booking_completed",
          title: "จบการใช้งานแล้ว",
          description: `${d.roomName || d.roomCode || "Room"} • ${
            (d.slotStart?.toDate?.() ?? new Date(d.slotStart)).toLocaleDateString("th-TH")
          } • สถานะ: completed`,
          createdAt: serverTimestamp(),
          read: false,
          roomName: d.roomName || null,
          roomCode: d.roomCode || null,
          slotStart: d.slotStart || null,
          slotEnd: d.slotEnd || null,
          status: "completed",
        });
      });
      await batch.commit();
      lastDoc = snap.docs[snap.docs.length - 1];
    }
  }

  // 2) pending ที่หมดเวลา -> rejected
  {
    let lastDoc = null;
    while (true) {
      const constraints = [
        where("userId", "==", uid),
        where("status", "==", "pending"),
        where("slotEnd", "<=", now),
        orderBy("slotEnd", "asc"),
        limit(50),
      ];
      if (lastDoc) constraints.splice(4, 0, startAfter(lastDoc));
      const q = query(collection(db, "bookings"), ...constraints);
      const snap = await getDocs(q);
      if (snap.empty) break;

      const batch = writeBatch(db);
      snap.forEach((ds) => {
        const d = ds.data();
        // update booking
        batch.update(ds.ref, { status: "rejected", updatedAt: new Date() });
        // add notification
        const nref = doc(collection(db, "users", uid, "notifications"));
        batch.set(nref, {
          type: "booking_rejected",
          title: "คำขอหมดเวลา",
          description: `${d.roomName || d.roomCode || "Room"} • ${
            (d.slotStart?.toDate?.() ?? new Date(d.slotStart)).toLocaleDateString("th-TH")
          } • สถานะ: rejected`,
          createdAt: serverTimestamp(),
          read: false,
          roomName: d.roomName || null,
          roomCode: d.roomCode || null,
          slotStart: d.slotStart || null,
          slotEnd: d.slotEnd || null,
          status: "rejected",
        });
      });
      await batch.commit();
      lastDoc = snap.docs[snap.docs.length - 1];
    }
  }
}

export default function Book() {
  const router = useRouter();
  const [tab, setTab] = useState("operation"); // operation | completed | canceled

  // รอ Auth พร้อม
  const [uid, setUid] = useState(null);
  const [authReady, setAuthReady] = useState(false);
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (user) => {
      setUid(user?.uid || null);
      setAuthReady(true);
    });
    return () => unsub();
  }, []);

  const [pendingBookings, setPendingBookings] = useState([]);
  const [approvedBookings, setApprovedBookings] = useState([]);
  const [completedBookings, setCompletedBookings] = useState([]);
  const [canceledBookings, setCanceledBookings] = useState([]);
  const [rejectedBookings, setRejectedBookings] = useState([]); // ใหม่
  const [loading, setLoading] = useState(true);

  // สำหรับ confirm cancel
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [selected, setSelected] = useState(null);

  // Subscribe Firestore หลัง auth พร้อม + uid มีค่า
  useEffect(() => {
    if (!authReady) return;

    if (!uid) {
      setPendingBookings([]);
      setApprovedBookings([]);
      setCompletedBookings([]);
      setCanceledBookings([]);
      setRejectedBookings([]);
      setLoading(false);
      return;
    }

    const base = (status) =>
      query(
        collection(db, "bookings"),
        where("userId", "==", uid),
        where("status", "==", status),
        orderBy("slotStart", "desc")
      );

    const onErr = (e) => {
      console.error("snapshot error:", e);
      Alert.alert("ดึงข้อมูลไม่สำเร็จ", e?.message || "ลองใหม่อีกครั้ง");
      setLoading(false);
    };

    const unsubPending = onSnapshot(
      base("pending"),
      async (snap) => {
        const items = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
        setPendingBookings(await hydrateRooms(items));
        setLoading(false);
      },
      onErr
    );

    const unsubApproved = onSnapshot(
      base("approved"),
      async (snap) => {
        const items = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
        setApprovedBookings(await hydrateRooms(items));
      },
      onErr
    );

    const unsubCompleted = onSnapshot(
      base("completed"),
      async (snap) => {
        const items = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
        setCompletedBookings(await hydrateRooms(items));
      },
      onErr
    );

    const unsubCanceled = onSnapshot(
      base("canceled"),
      async (snap) => {
        const items = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
        setCanceledBookings(await hydrateRooms(items));
      },
      onErr
    );

    // listen สถานะ rejected (ใหม่)
    const unsubRejected = onSnapshot(
      base("rejected"),
      async (snap) => {
        const items = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
        setRejectedBookings(await hydrateRooms(items));
      },
      onErr
    );

    return () => {
      unsubPending();
      unsubApproved();
      unsubCompleted();
      unsubCanceled();
      unsubRejected();
    };
  }, [authReady, uid]);

  // เรียก auto-complete/reject เมื่อเข้าหน้า/โฟกัส + ทุก ๆ 1 นาที
  useFocusEffect(
    useCallback(() => {
      if (!uid) return;
      autoCompleteOverdue(uid);
      const t = setInterval(() => autoCompleteOverdue(uid), 60 * 1000);
      return () => clearInterval(t);
    }, [uid])
  );

  const now = new Date();

  // Operation = pending + approved ที่ยังไม่หมดเวลา
  const opBookings = useMemo(() => {
    const merged = [...pendingBookings, ...approvedBookings].filter((b) => {
      const end = b.slotEnd?.toDate?.() ?? new Date(b.slotEnd);
      return end >= now;
    });
    merged.sort(
      (a, b) =>
        (b.slotStart?.seconds ?? new Date(b.slotStart).getTime() / 1000) -
        (a.slotStart?.seconds ?? new Date(a.slotStart).getTime() / 1000)
    );
    return merged;
  }, [pendingBookings, approvedBookings, now]);

  // Completed แสดง: completed จริงใน DB + approved ที่หมดเวลา
  const completedInstant = useMemo(() => {
    const overdueApproved = [...approvedBookings].filter((b) => {
      const end = b.slotEnd?.toDate?.() ?? new Date(b.slotEnd);
      return end < now;
    });
    const merged = [...completedBookings, ...overdueApproved];
    const m = new Map(merged.map((x) => [x.id, x]));
    const deduped = Array.from(m.values());
    deduped.sort(
      (a, b) =>
        (b.slotEnd?.seconds ?? new Date(b.slotEnd).getTime() / 1000) -
        (a.slotEnd?.seconds ?? new Date(a.slotEnd).getTime() / 1000)
    );
    return deduped;
  }, [approvedBookings, completedBookings, now]);

  // แท็บ Canceled รวม canceled + rejected
  const canceledPlusRejected = useMemo(() => {
    const merged = [...canceledBookings, ...rejectedBookings];
    const m = new Map(merged.map((x) => [x.id, x]));
    return Array.from(m.values()).sort(
      (a, b) =>
        (b.slotStart?.seconds ?? new Date(b.slotStart).getTime() / 1000) -
        (a.slotStart?.seconds ?? new Date(a.slotStart).getTime() / 1000)
    );
  }, [canceledBookings, rejectedBookings]);

  const listToShow = useMemo(() => {
    if (tab === "operation") return opBookings;
    if (tab === "completed") return completedInstant;
    return canceledPlusRejected; // "canceled" tab
  }, [tab, opBookings, completedInstant, canceledPlusRejected]);

  const fmtDate = (d) =>
    d.toLocaleDateString("th-TH", { day: "2-digit", month: "2-digit", year: "numeric" });
  const fmtTime = (d) => `${d.getHours()}.${String(d.getMinutes()).padStart(2, "0")}`;

  const statusColor = (status) =>
    status === "pending"
      ? COLOR.pending
      : status === "approved"
      ? COLOR.approved
      : status === "completed"
      ? COLOR.completed
      : status === "rejected"
      ? COLOR.rejected
      : COLOR.canceled;

  function openConfirm(b) {
    setSelected(b);
    setConfirmOpen(true);
  }
  function closeConfirm() {
    setSelected(null);
    setConfirmOpen(false);
  }

  // ยกเลิก + เพิ่ม notification ให้ user
  async function applyCancel() {
    if (!selected) return;
    try {
      await updateDoc(doc(db, "bookings", selected.id), {
        status: "canceled",
        updatedAt: new Date(),
      });

      const uid = auth.currentUser?.uid;
      if (uid) {
        const start = selected.slotStart?.toDate?.() ?? new Date(selected.slotStart);
        const end = selected.slotEnd?.toDate?.() ?? new Date(selected.slotEnd);

        await addDoc(collection(db, "users", uid, "notifications"), {
          type: "booking_cancelled",
          title: "การจองถูกยกเลิก",
          description: `${selected.roomName || selected.roomCode || "Room"} • ${fmtDate(start)} • ${fmtTime(
            start
          )}-${fmtTime(end)} — สถานะ: canceled`,
          createdAt: serverTimestamp(),
          read: false,
          roomName: selected.roomName || null,
          roomCode: selected.roomCode || null,
          slotStart: selected.slotStart || null,
          slotEnd: selected.slotEnd || null,
          status: "canceled",
        });
      }

      closeConfirm();
    } catch (e) {
      console.error(e);
      Alert.alert("ยกเลิกไม่สำเร็จ", e?.message || "ลองใหม่อีกครั้ง");
    }
  }

  return (
    <View style={{ flex: 1, backgroundColor: COLOR.bg }}>
      {/* Header */}
      <View style={styles.headerWrap}>
        <View style={styles.headerRow}>
          <Text style={styles.headerTitle}>My Booking</Text>
        </View>

        {/* Segmented */}
        <View style={styles.segment}>
          {["operation", "completed", "canceled"].map((k) => {
            const label =
              k === "operation" ? "Operation" : k === "completed" ? "Completed" : "Canceled";
            const active = tab === k;
            return (
              <Pressable
                key={k}
                onPress={() => setTab(k)}
                style={[styles.segItem, active && styles.segItemActive]}
              >
                <Text style={[styles.segText, active && styles.segTextActive]}>{label}</Text>
              </Pressable>
            );
          })}
        </View>
      </View>

      {/* Body */}
      {loading ? (
        <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
          <ActivityIndicator />
        </View>
      ) : (
        <ScrollView style={{ flex: 1 }}>
          {listToShow.map((b) => {
            const start = b.slotStart?.toDate?.() ?? new Date(b.slotStart);
            const end = b.slotEnd?.toDate?.() ?? new Date(b.slotEnd);
            const sColor = statusColor(b.status);

            return (
              <View key={b.id} style={styles.card}>
                <View style={styles.cardRow}>
                  <Image
                    source={{
                      uri:
                        b._roomImage ||
                        "https://images.unsplash.com/photo-1551292831-023188e78222?w=640&q=60&auto=format&fit=crop",
                    }}
                    style={styles.thumb}
                  />
                  <View style={{ flex: 1 }}>
                    <Text style={styles.roomName}>{b.roomName || b.roomCode || "Room"}</Text>

                    {/* STATUS */}
                    <View style={styles.statusRow}>
                      <View style={[styles.statusDot, { backgroundColor: sColor }]} />
                      <Text style={[styles.statusText, { color: sColor }]}>
                        {b.status.charAt(0).toUpperCase() + b.status.slice(1)}
                      </Text>
                    </View>

                    {/* icon row */}
                    <View style={styles.iconRow}>
                      <Ionicons name="people-outline" size={14} color={COLOR.muted} />
                      <Text style={styles.iconText}>
                        {" "}
                        {(b.capacityMin ?? "?")}–{(b.capacityMax ?? "?")} people
                      </Text>
                      <View style={{ width: 14 }} />
                      <Ionicons name="business-outline" size={14} color={COLOR.muted} />
                      <Text style={styles.iconText}>  Floor {b._floor ?? "?"}</Text>
                    </View>

                    <View style={{ height: 8 }} />
                    <Text style={styles.label}>Date</Text>
                    <Text style={styles.value}>{fmtDate(start)}</Text>

                    <View style={styles.timeRow}>
                      <View style={{ flex: 1 }}>
                        <Text style={styles.label}>Start Time</Text>
                        <Text style={styles.value}>{fmtTime(start)}</Text>
                      </View>
                      <View style={{ flex: 1, alignItems: "flex-end" }}>
                        <Text style={styles.label}>End Time</Text>
                        <Text style={styles.value}>{fmtTime(end)}</Text>
                      </View>
                    </View>

                    <Pressable
                      style={styles.cancelBtn}
                      onPress={() => (tab === "operation" ? openConfirm(b) : null)}
                      disabled={tab !== "operation"}
                    >
                      <Text style={styles.cancelText}>
                        {tab === "operation"
                          ? "Cancel"
                          : tab === "completed"
                          ? "Completed"
                          : b.status === "rejected"
                          ? "Rejected"
                          : "Canceled"}
                      </Text>
                    </Pressable>
                  </View>
                </View>
              </View>
            );
          })}
          {!listToShow.length && (
            <View style={{ alignItems: "center", paddingVertical: 40 }}>
              <Text style={{ color: COLOR.muted }}>ไม่พบรายการ</Text>
            </View>
          )}
        </ScrollView>
      )}

      {/* ===== Confirm Cancel Modal ===== */}
      <Modal transparent visible={confirmOpen} animationType="fade" onRequestClose={closeConfirm}>
        <View style={styles.modalBackdrop}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>Cancel booking?</Text>
            {selected && (
              <Text style={styles.modalSub}>
                {`ห้อง: ${selected.roomName || selected.roomCode || "-"}`}
                {`\nวันที่: ${fmtDate(selected.slotStart?.toDate?.() ?? new Date(selected.slotStart))}`}
                {`\nเวลา: ${fmtTime(selected.slotStart?.toDate?.() ?? new Date(selected.slotStart))} - ${fmtTime(
                  selected.slotEnd?.toDate?.() ?? new Date(selected.slotEnd)
                )}`}
              </Text>
            )}

            <View style={styles.modalActions}>
              <TouchableOpacity style={[styles.btn, styles.btnGhost]} onPress={closeConfirm}>
                <Text style={[styles.btnText, { color: COLOR.primary }]}>Back</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.btn, styles.btnReject]} onPress={applyCancel}>
                <Text style={[styles.btnText, { color: "#fff" }]}>Cancel</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  headerWrap: {
    backgroundColor: COLOR.primary,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    paddingTop: 50,
    paddingBottom: 16,
    paddingHorizontal: 16,
  },
  headerRow: { flexDirection: "row", alignItems: "center", justifyContent: "center" },
  headerTitle: { color: "#fff", fontWeight: "bold", fontSize: 26 },

  segment: { marginTop: 14, backgroundColor: "#fff", borderRadius: 999, padding: 4, flexDirection: "row" },
  segItem: { flex: 1, paddingVertical: 8, borderRadius: 999, alignItems: "center" },
  segItemActive: {
    backgroundColor: COLOR.chipActive,
    shadowColor: "#000",
    shadowOpacity: 0.06,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  segText: { color: COLOR.muted, fontWeight: "600" },
  segTextActive: { color: "#111827" },

  card: {
    backgroundColor: "#fff",
    marginHorizontal: 16,
    marginTop: 16,
    borderRadius: 16,
    padding: 12,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 2,
  },
  cardRow: { flexDirection: "row", gap: 12 },
  thumb: { width: 90, height: 70, borderRadius: 12, backgroundColor: "#ddd", marginRight: 8 },

  roomName: { fontSize: 16, fontWeight: "700", color: COLOR.text, marginBottom: 2 },

  statusRow: { flexDirection: "row", alignItems: "center", marginBottom: 6, marginTop: 2 },
  statusDot: { width: 10, height: 10, borderRadius: 5, marginRight: 6 },
  statusText: { fontWeight: "700" },

  iconRow: { flexDirection: "row", alignItems: "center" },
  iconText: { color: COLOR.muted, fontSize: 12 },

  label: { color: COLOR.muted, fontSize: 12, marginTop: 6 },
  value: { color: COLOR.text, fontSize: 14, fontWeight: "600", marginTop: 2 },

  timeRow: { flexDirection: "row", alignItems: "flex-start", marginTop: 8 },

  cancelBtn: {
    marginTop: 12,
    height: 44,
    borderRadius: 999,
    backgroundColor: COLOR.cancelBtn,
    alignItems: "center",
    justifyContent: "center",
  },
  cancelText: { color: "#fff", fontSize: 16, fontWeight: "700" },

  // modal
  modalBackdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.35)",
    justifyContent: "center",
    padding: 22,
  },
  modalCard: {
    backgroundColor: "#fff",
    borderRadius: 14,
    padding: 18,
  },
  modalTitle: { fontSize: 18, fontWeight: "700", color: "#333" },
  modalSub: { marginTop: 10, color: "#555", lineHeight: 20 },
  modalActions: { flexDirection: "row", justifyContent: "flex-end", marginTop: 16 },
  btn: { paddingVertical: 10, paddingHorizontal: 16, borderRadius: 10, marginRight: 5 },
  btnGhost: { backgroundColor: "#fff", borderWidth: 1, borderColor: COLOR.primary },
  btnReject: { backgroundColor: COLOR.canceled },
  btnText: { fontSize: 14, fontWeight: "700" },
});
