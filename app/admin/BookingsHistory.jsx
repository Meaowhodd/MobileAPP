// app/screens/BookingsHistory.jsx
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import {
  collection,
  deleteDoc,
  doc,
  onSnapshot,
  orderBy,
  query,
} from "firebase/firestore";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  Animated,
  Modal,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { db } from "../../firebaseConfig";

const COLOR = {
  primary: "#6C63FF",
  text: "#111827",
  muted: "#6B7280",
  card: "#FFFFFF",
  chipBg: "#EEF2FF",
  divider: "#E5E7EB",
  // status
  pending: "#F59E0B",
  approved: "#10B981",
  rejected: "#DC2626",
  canceled: "#EF4444",
  danger: "#ef4444",
  lightDanger: "#fee2e2",
};

function statusColor(s) {
  switch ((s || "").toLowerCase()) {
    case "approved":
      return COLOR.approved;
    case "rejected":
      return COLOR.rejected;
    case "canceled":
      return COLOR.canceled;
    default:
      return COLOR.pending;
  }
}

export default function BookingsHistory() {
  const router = useRouter();
  const [bookings, setBookings] = useState([]);
  const [usersMap, setUsersMap] = useState({}); 

  useEffect(() => {
    const qRef = query(collection(db, "bookings"), orderBy("slotStart", "desc"));
    const unsub = onSnapshot(qRef, (snap) => {
      const rows = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
      setBookings(rows);
    });
    return unsub;
  }, []);

  useEffect(() => {
    const unsub = onSnapshot(collection(db, "users"), (snap) => {
      const map = {};
      snap.docs.forEach((d) => {
        const u = d.data() || {};
        map[d.id] = {
          firstName: u.firstName ?? "",
          lastName: u.lastName ?? "",
          email: u.email ?? "",
          userName: u.userName ?? "",
        };
      });
      setUsersMap(map);
    });
    return unsub;
  }, []);

  const groups = useMemo(() => {
    const all = bookings;
    const pending = bookings.filter(
      (b) => (b.status || "pending").toLowerCase() === "pending"
    );
    const approved = bookings.filter(
      (b) => (b.status || "").toLowerCase() === "approved"
    );
    const rejected = bookings.filter(
      (b) => (b.status || "").toLowerCase() === "rejected"
    );
    const canceled = bookings.filter(
      (b) => (b.status || "").toLowerCase() === "canceled"
    );
    return { all, pending, approved, rejected, canceled };
  }, [bookings]);

  const tabs = [
    { key: "all", label: "All" },
    { key: "pending", label: "Pending" },
    { key: "approved", label: "Approved" },
    { key: "rejected", label: "Rejected" },
    { key: "canceled", label: "Canceled" },
  ];
  const counts = {
    all: groups.all.length,
    pending: groups.pending.length,
    approved: groups.approved.length,
    rejected: groups.rejected.length,
    canceled: groups.canceled.length,
  };

  const [active, setActive] = useState("all");
  const indicatorX = useRef(new Animated.Value(0)).current;
  const indicatorW = useRef(new Animated.Value(0)).current;
  const tabLayouts = useRef({}); // key -> {x, w}

  const onTabLayout = (key) => (e) => {
    const { x, width } = e.nativeEvent.layout;
    tabLayouts.current[key] = { x, w: width };
    if (key === active) {
      indicatorX.setValue(x);
      indicatorW.setValue(width);
    }
  };

  const goTab = (key) => {
    setActive(key);
    const meta = tabLayouts.current[key];
    if (meta) {
      Animated.spring(indicatorX, {
        toValue: meta.x,
        useNativeDriver: false,
        bounciness: 10,
        speed: 20,
      }).start();
      Animated.spring(indicatorW, {
        toValue: meta.w,
        useNativeDriver: false,
        bounciness: 10,
        speed: 20,
      }).start();
    }
  };

  const list = groups[active] || [];

  const fmtDate = (d) =>
    (d?.toDate?.() ?? new Date(d)).toLocaleDateString("th-TH", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  const fmtTime = (d) => {
    const dt = d?.toDate?.() ?? new Date(d);
    return dt.toLocaleTimeString("th-TH", { hour: "2-digit", minute: "2-digit" });
  };

  const displayNameOf = (b) => {
    const u = usersMap[b.userId] || {};
    const combined = `${u.firstName || ""} ${u.lastName || ""}`.trim();
    return (
      combined ||
      u.userName ||
      u.email ||
      b.userName ||
      b.userDisplayName ||
      b.userEmail ||
      b.userId ||
      "-"
    );
  };

  const [confirmOpen, setConfirmOpen] = useState(false);
  const [target, setTarget] = useState(null);

  const openConfirm = (bk) => {
    setTarget(bk);
    setConfirmOpen(true);
  };
  const closeConfirm = () => {
    setConfirmOpen(false);
    setTarget(null);
  };
  const applyDelete = async () => {
    if (!target) return;
    try {
      await deleteDoc(doc(db, "bookings", target.id));
      closeConfirm();
    } catch (e) {
      console.error("delete failed:", e);
      closeConfirm();
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#fff" }}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={22} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Bookings History</Text>
        <View style={{ width: 22 }} />
      </View>

      {/* Fancy Tabs */}
      <View style={styles.tabsWrap}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.tabsScroll}
        >
          {tabs.map((t) => {
            const selected = active === t.key;
            return (
              <TouchableOpacity
                key={t.key}
                onLayout={onTabLayout(t.key)}
                onPress={() => goTab(t.key)}
                activeOpacity={0.85}
                style={[styles.tabBtn, selected && styles.tabBtnActive]}
              >
                <Text style={[styles.tabText, selected && styles.tabTextActive]}>
                  {t.label}
                </Text>
                <View style={[styles.badge, selected && styles.badgeActive]}>
                  <Text style={[styles.badgeText, selected && styles.badgeTextActive]}>
                    {counts[t.key]}
                  </Text>
                </View>
              </TouchableOpacity>
            );
          })}
          <Animated.View
            style={[
              styles.tabIndicator,
              { transform: [{ translateX: indicatorX }], width: indicatorW },
            ]}
          />
        </ScrollView>
      </View>

      {/* List */}
      <ScrollView style={{ flex: 1 }}>
        {list.map((b) => {
          const s = (b.status || "pending").toLowerCase();
          const sColor = statusColor(s);
          const roomTitle = b.roomName || b.roomCode || "Room";

          return (
            <View key={b.id} style={styles.card}>
              <View style={styles.cardHeader}>
                <Text style={styles.room}>{roomTitle}</Text>
                <View
                  style={[
                    styles.statusChip,
                    { backgroundColor: `${sColor}22`, borderColor: sColor },
                  ]}
                >
                  <Text style={[styles.statusText, { color: sColor }]}>
                    {s.charAt(0).toUpperCase() + s.slice(1)}
                  </Text>
                </View>
              </View>

              <View style={{ height: 6 }} />

              <Text style={styles.rowText}>
                ผู้ใช้: <Text style={styles.rowBold}>{displayNameOf(b)}</Text>
              </Text>
              <Text style={styles.rowText}>
                วันที่: <Text style={styles.rowBold}>{fmtDate(b.slotStart)}</Text>
              </Text>
              <Text style={styles.rowText}>
                เวลา:{" "}
                <Text style={styles.rowBold}>
                  {fmtTime(b.slotStart)} - {fmtTime(b.slotEnd)}
                </Text>
              </Text>

              {/* Delete button */}
              <View style={styles.cardActions}>
                <TouchableOpacity
                  onPress={() => openConfirm(b)}
                  style={styles.deleteBtn}
                  accessibilityRole="button"
                  accessibilityLabel="Delete booking"
                >
                  <Ionicons name="trash-outline" size={20} color={COLOR.danger} />
                </TouchableOpacity>
              </View>
            </View>
          );
        })}

        {!list.length && (
          <View style={{ alignItems: "center", paddingVertical: 36 }}>
            <Text style={{ color: COLOR.muted }}>ไม่พบประวัติ</Text>
          </View>
        )}
      </ScrollView>

      {/* ===== Confirm Delete Modal ===== */}
      <Modal transparent visible={confirmOpen} animationType="fade" onRequestClose={closeConfirm}>
        <View style={styles.modalBackdrop}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>ลบประวัติการจองนี้?</Text>
            {target && (
              <Text style={styles.modalSub}>
                {`ห้อง: ${target.roomName || target.roomCode || "-"}`}
                {`\nวันที่: ${fmtDate(target.slotStart)} `}
                {`\nเวลา: ${fmtTime(target.slotStart)} - ${fmtTime(target.slotEnd)}`}
              </Text>
            )}

            <View style={styles.modalActions}>
              <TouchableOpacity style={[styles.btn, styles.btnGhost]} onPress={closeConfirm}>
                <Text style={[styles.btnText, { color: COLOR.primary }]}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.btn, styles.btnDanger]} onPress={applyDelete}>
                <Text style={[styles.btnText, { color: "#fff" }]}>Delete</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  header: {
    backgroundColor: COLOR.primary,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingTop: 50,
    paddingHorizontal: 16,
    paddingBottom: 14,
    borderBottomLeftRadius: 18,
    borderBottomRightRadius: 18,
  },
  headerTitle: { color: "#fff", fontWeight: "800", fontSize: 20 },

  tabsWrap: {
    marginTop: 8,
    paddingBottom: 6,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: COLOR.divider,
  },
  tabsScroll: {
    paddingHorizontal: 12,
    paddingBottom: 10,
  },
  tabBtn: {
    backgroundColor: "#F3F4F6",
    borderRadius: 14,
    paddingVertical: 8,
    paddingHorizontal: 12,
    marginRight: 8,
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  tabBtnActive: {
    backgroundColor: "#fff",
    borderColor: COLOR.primary,
    shadowColor: "#000",
    shadowOpacity: 0.06,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  tabText: { color: "#374151", fontWeight: "700" },
  tabTextActive: { color: COLOR.primary },
  badge: {
    marginLeft: 8,
    minWidth: 22,
    height: 22,
    paddingHorizontal: 6,
    borderRadius: 11,
    backgroundColor: "#E5E7EB",
    alignItems: "center",
    justifyContent: "center",
  },
  badgeActive: { backgroundColor: COLOR.primary + "22" },
  badgeText: { fontSize: 12, fontWeight: "800", color: "#374151" },
  badgeTextActive: { color: COLOR.primary },

  tabIndicator: {
    position: "absolute",
    height: 3,
    backgroundColor: COLOR.primary,
    bottom: 0,
    left: 12,
    borderRadius: 3,
  },

  card: {
    marginHorizontal: 16,
    marginTop: 12,
    backgroundColor: COLOR.card,
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: "#EEF2FF",
    shadowColor: "#000",
    shadowOpacity: 0.04,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    elevation: 1,
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  room: { fontSize: 16, fontWeight: "800", color: COLOR.text },
  statusChip: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 999,
    borderWidth: 1,
  },
  statusText: { fontSize: 12, fontWeight: "800" },
  rowText: { color: COLOR.muted, marginTop: 4 },
  rowBold: { color: COLOR.text, fontWeight: "700" },

  cardActions: { marginTop: 12, flexDirection: "row", justifyContent: "flex-end",marginRight: 4, },
  deleteBtn: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLOR.lightDanger,
    borderColor: COLOR.danger,
    borderWidth: 1,
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 10,
  },
  deleteText: { marginLeft: 6, color: COLOR.danger, fontWeight: "800" },

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
  btn: { paddingVertical: 10, paddingHorizontal: 16, borderRadius: 10, marginLeft: 8 },
  btnGhost: { backgroundColor: "#fff", borderWidth: 1, borderColor: COLOR.primary },
  btnDanger: { backgroundColor: COLOR.danger },
  btnText: { fontSize: 14, fontWeight: "700" },
});
