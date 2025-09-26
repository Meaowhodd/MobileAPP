// app/(tabs)/Inbox.jsx
import dayjs from "dayjs";
import "dayjs/locale/th";
import relativeTime from "dayjs/plugin/relativeTime";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  FlatList,
  Modal,
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { Swipeable } from "react-native-gesture-handler";

import { useFocusEffect } from "@react-navigation/native"; // ✅ refresh on focus
import { onAuthStateChanged } from "firebase/auth";
import {
  collection,
  deleteDoc,
  doc,
  getDocs,
  limit,
  orderBy,
  query,
  startAfter,
  updateDoc,
  writeBatch,
} from "firebase/firestore";
import { auth, db } from "../../firebaseConfig";
import { UI } from "../services/notifications"; // mapping สี/อีโมจิ/แถบซ้าย

dayjs.extend(relativeTime);
dayjs.locale("th");

const PAGE_SIZE = 10;

/* ---------- utils ---------- */
function toDate(x) {
  if (!x) return null;
  if (typeof x?.toDate === "function") return x.toDate();
  return new Date(x);
}
function buildTitleFromType(n) {
  switch (n.type) {
    case "booking_confirmed": return "ยืนยันการจองแล้ว!";
    case "booking_cancelled": return "การจองถูกยกเลิก";
    case "booking_updated":   return "มีการอัปเดตการจอง";
    case "meeting_reminder":  return "ใกล้ถึงเวลาประชุม";
    case "booking_created":   return "สร้างคำขอจองแล้ว";
    default:                  return "ประกาศจากระบบ";
  }
}
// แสดงห้อง + วันที่ + ช่วงเวลา (สถานะแสดงเป็นตัวอักษรสีภายหลัง)
function buildDescBase(n) {
  const start = n.slotStart ? toDate(n.slotStart) : null;
  const end   = n.slotEnd ? toDate(n.slotEnd) : null;
  const room  = n.roomName || n.roomCode || "Room";

  const dd  = start ? dayjs(start).format("D MMM YYYY") : "-";
  const tt1 = start ? dayjs(start).format("HH:mm") : "";
  const tt2 = end   ? dayjs(end).format("HH:mm")   : "";
  const range = tt1 ? `${tt1}${tt2 ? `–${tt2}` : ""}` : "";

  return `จอง ${room} • ${dd} • ${range}`;
}
// เดา status ถ้าเอกสารไม่ได้ส่งมา
function inferStatus(n) {
  if (n.status) return n.status;
  switch (n.type) {
    case "booking_created":   return "pending";
    case "booking_confirmed": return "approved";
    case "booking_cancelled": return "canceled";
    default:                  return null;
  }
}

/* ---------- swipe actions ---------- */
function RightActions({ onRead, onDelete }) {
  return (
    <View style={{ flexDirection: "row" }}>
      <TouchableOpacity onPress={onRead} style={styles.swipeRead}>
        <Text style={styles.swipeReadText}>อ่านแล้ว</Text>
      </TouchableOpacity>
      <TouchableOpacity onPress={onDelete} style={styles.swipeDelete}>
        <Text style={styles.swipeDeleteText}>ลบ</Text>
      </TouchableOpacity>
    </View>
  );
}

/* ---------- item ---------- */
function NotificationItem({ item, onPress }) {
  const type = item.type || "system_notice";
  const leftColor = UI.LEFT_BAR[type] || "#E5E7EB";
  const iconBg = UI.ICON_BG[type] || "#E5E7EB";
  const emoji = UI.EMOJI[type] || "🔔";

  const title = item.title || buildTitleFromType(item);
  const base  = buildDescBase(item);

  const status = inferStatus(item);
  const style  = status ? UI.STATUS[status] : null;

  return (
    <TouchableOpacity
      activeOpacity={0.9}
      onPress={onPress}
      style={[
        styles.card,
        { borderLeftColor: leftColor, opacity: item.read ? 0.65 : 1 },
      ]}
      accessibilityRole="button"
      accessibilityLabel={title}
    >
      <View style={styles.row}>
        <View style={[styles.iconBubble, { backgroundColor: iconBg }]}>
          <Text style={styles.iconText}>{emoji}</Text>
        </View>

        <View style={{ flex: 1 }}>
          <Text style={styles.title}>{title}</Text>

          {/* คำอธิบาย + สถานะเป็นตัวอักษรสี */}
          <Text style={styles.desc} numberOfLines={2}>
            {base}
            {style && (
              <Text style={{ color: style.fg, fontWeight: "700" }}>
                {"  สถานะ: "}
                {status.charAt(0).toUpperCase() + status.slice(1)}
              </Text>
            )}
          </Text>

          <Text style={styles.timeText}>
            {item.createdAt ? dayjs(toDate(item.createdAt)).fromNow() : ""}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );
}

/* ---------- screen ---------- */
export default function InboxScreen({ navigation }) {
  const [uid, setUid] = useState(null);
  const [data, setData] = useState([]);
  const [refreshing, setRefreshing] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const lastDocRef = useRef(null);

  // confirm modal state
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [confirmType, setConfirmType] = useState(null); // "clearAll" | "deleteOne"
  const [targetId, setTargetId] = useState(null);

  // auth
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (user) => setUid(user?.uid || null));
    return () => unsub();
  }, []);

  // init (ครั้งแรก)
  useEffect(() => { if (uid) refreshFirstPage(); }, [uid]);

  // ✅ refresh ทุกครั้งที่โฟกัสหน้านี้
  useFocusEffect(
    useCallback(() => {
      if (uid) refreshFirstPage();
    }, [uid])
  );

  // badge
  const unreadCount = useMemo(() => data.filter((d) => !d.read).length, [data]);
  useEffect(() => {
    navigation?.getParent?.()?.setOptions?.({
      tabBarBadge: unreadCount > 0 ? unreadCount : undefined,
    });
  }, [unreadCount, navigation]);

  // base query
  const qBase = useCallback(() => {
    if (!uid) return null;
    return query(
      collection(db, "users", uid, "notifications"),
      orderBy("createdAt", "desc")
    );
  }, [uid]);

  // fetchers
  const refreshFirstPage = useCallback(async () => {
    if (!qBase()) return;
    setRefreshing(true);
    lastDocRef.current = null;

    const snap = await getDocs(query(qBase(), limit(PAGE_SIZE)));
    const items = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
    setData(items);

    if (snap.docs.length === PAGE_SIZE) {
      lastDocRef.current = snap.docs[snap.docs.length - 1];
      setHasMore(true);
    } else {
      lastDocRef.current = null;
      setHasMore(false);
    }
    setRefreshing(false);
  }, [qBase]);

  const loadMore = useCallback(async () => {
    if (!qBase() || loadingMore || !hasMore || !lastDocRef.current) return;
    setLoadingMore(true);

    const snap = await getDocs(query(qBase(), startAfter(lastDocRef.current), limit(PAGE_SIZE)));
    const items = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
    setData((prev) => [...prev, ...items]);

    if (snap.docs.length === PAGE_SIZE) {
      lastDocRef.current = snap.docs[snap.docs.length - 1];
      setHasMore(true);
    } else {
      lastDocRef.current = null;
      setHasMore(false);
    }
    setLoadingMore(false);
  }, [qBase, loadingMore, hasMore]);

  // actions
  const markAllRead = useCallback(async () => {
    if (!uid || !data.length) return;
    const unread = data.filter((n) => !n.read);
    if (unread.length) {
      const batch = writeBatch(db);
      unread.forEach((n) => {
        batch.update(doc(db, "users", uid, "notifications", n.id), { read: true });
      });
      try { await batch.commit(); } catch {}
    }
    setData((prev) => prev.map((n) => ({ ...n, read: true })));
  }, [uid, data]);

  const deleteAllNotifications = useCallback(async () => {
    if (!uid) return;
    try {
      while (true) {
        const snap = await getDocs(query(collection(db, "users", uid, "notifications"), limit(300)));
        if (snap.empty) break;
        const batch = writeBatch(db);
        snap.docs.forEach(d => batch.delete(d.ref));
        await batch.commit();
        if (snap.size < 300) break;
      }
      setData([]);
      setHasMore(false);
    } catch (e) {
      console.warn("Delete all failed:", e?.message || e);
    }
  }, [uid]);

  const markRead = useCallback(async (id) => {
    if (!uid) return;
    try {
      await updateDoc(doc(db, "users", uid, "notifications", id), { read: true });
    } catch {}
    setData((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)));
  }, [uid]);

  const removeItem = useCallback(async (id) => {
    if (!uid) return;
    // optimistic
    const keep = data.filter((n) => n.id !== id);
    setData(keep);
    try {
      await deleteDoc(doc(db, "users", uid, "notifications", id));
    } catch (e) {
      console.warn("Delete one failed:", e?.message || e);
      // rollback & refresh
      setData((prev) =>
        prev.some((n) => n.id === id) ? prev : [...keep, data.find((n) => n.id === id)].filter(Boolean)
      );
      refreshFirstPage();
    }
  }, [uid, data, refreshFirstPage]);

  // confirm modal handlers
  const openConfirm = (type, id = null) => {
    setConfirmType(type);
    setTargetId(id);
    setConfirmOpen(true);
  };
  const closeConfirm = () => {
    setConfirmOpen(false);
    setConfirmType(null);
    setTargetId(null);
  };
  const handleConfirm = async () => {
    if (confirmType === "clearAll") {
      await deleteAllNotifications();
    } else if (confirmType === "deleteOne" && targetId) {
      await removeItem(targetId);
    }
    closeConfirm();
  };

  // render
  const renderItem = ({ item }) => (
    <Swipeable
      renderRightActions={() => (
        <RightActions
          onRead={() => markRead(item.id)}
          onDelete={() => openConfirm("deleteOne", item.id)}
        />
      )}
    >
      <NotificationItem item={item} onPress={() => markRead(item.id)} />
    </Swipeable>
  );

  return (
    <SafeAreaView style={styles.container}>
      {/* Header ม่วงโค้งมน (ไม่มี back/วงกลม) */}
      <View style={styles.topBar}>
        <Text style={styles.topTitle}>Notifications</Text>
        <TouchableOpacity
          onPress={() => openConfirm("clearAll")}
          hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
          accessibilityRole="button"
          accessibilityLabel="Clear all notifications"
        >
          <Text style={styles.topClear}>Clear All</Text>
        </TouchableOpacity>
      </View>

      {/* Sub header */}
      <View style={styles.subHeader}>
        <Text style={styles.recent}>Recent {unreadCount > 0 ? `(${unreadCount} new)` : ""}</Text>
        <TouchableOpacity onPress={markAllRead}>
          <Text style={styles.markAll}>Mark all as read</Text>
        </TouchableOpacity>
      </View>

      {/* List */}
      <FlatList
        contentContainerStyle={styles.listContent}
        data={data}
        keyExtractor={(it) => it.id}
        renderItem={renderItem}
        refreshing={refreshing}
        onRefresh={refreshFirstPage}
        onEndReached={loadMore}
        onEndReachedThreshold={0.5}
        ListEmptyComponent={
          <View style={styles.emptyBox}>
            <Text style={styles.emptyDesc}>You don’t have any notifications.</Text>
          </View>
        }
      />

      {/* ===== Confirm Modal (สไตล์เดียวกับ ManageBookings) ===== */}
      <Modal transparent visible={confirmOpen} animationType="fade" onRequestClose={closeConfirm}>
        <View style={styles.modalBackdrop}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>
              {confirmType === "clearAll" ? "ลบการแจ้งเตือนทั้งหมด?" : "ลบการแจ้งเตือนนี้?"}
            </Text>
            <Text style={styles.modalSub}>
              {confirmType === "clearAll"
                ? "การแจ้งเตือนทุกอันของคุณจะถูกลบถาวรและไม่สามารถกู้คืนได้"
                : "คุณแน่ใจหรือไม่ว่าต้องการลบการแจ้งเตือนนี้"}
            </Text>

            <View style={styles.modalActions}>
              <TouchableOpacity style={[styles.btn, styles.btnGhost]} onPress={closeConfirm}>
                <Text style={[styles.btnText, { color: "#6A5AE0" }]}>Cancel</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.btn, styles.btnReject]}
                onPress={handleConfirm}
              >
                <Text style={[styles.btnText, { color: "#fff" }]}>
                  {confirmType === "clearAll" ? "Clear All" : "Delete"}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

/* ---------- styles ---------- */
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },

  topBar: {
    backgroundColor: "#6C63FF",
    paddingTop: 18,
    paddingBottom: 18,
    paddingHorizontal: 18,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    shadowColor: "#000",
    shadowOpacity: 0.12,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 3 },
    elevation: 2,
  },
  topTitle: { color: "#fff", fontSize: 26, fontWeight: "bold",marginLeft: 6,marginTop: 40 },
  topClear: { color: "red", fontWeight: "bold", fontSize: 14 ,marginTop: 45 },

  subHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
    backgroundColor: "#fff",
  },
  recent: { fontSize: 16, fontWeight: "bold", color: "#111827" },
  markAll: { fontSize: 14, color: "#64748B" },

  listContent: { padding: 15 },

  card: {
    borderLeftWidth: 5,
    borderRadius: 14,
    padding: 14,
    marginBottom: 12,
    backgroundColor: "#F9FAFB",
    shadowColor: "#000",
    shadowOpacity: 0.06,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  row: { flexDirection: "row", gap: 12, alignItems: "flex-start" },
  iconBubble: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: "center",
    justifyContent: "center",
  },
  iconText: { fontSize: 18 },

  title: { fontWeight: "800", fontSize: 15, color: "#111827" },
  desc: { marginTop: 2, fontSize: 13.5, color: "#374151" },
  timeText: { marginTop: 6, fontSize: 12, color: "#6B7280", fontStyle: "italic" },

  emptyBox: { alignItems: "center", paddingTop: 60 },
  emptyDesc: { color: "#666" },

  // swipe buttons
  swipeRead: {
    paddingVertical: 16,
    paddingHorizontal: 18,
    backgroundColor: "#1f66f2",
    borderTopLeftRadius: 8,
    borderBottomLeftRadius: 8,
    justifyContent: "center",
  },
  swipeReadText: { color: "#fff", fontWeight: "600" },
  swipeDelete: {
    paddingVertical: 16,
    paddingHorizontal: 18,
    backgroundColor: "#FF3B30",
    justifyContent: "center",
  },
  swipeDeleteText: { color: "#fff", fontWeight: "600" },

  // modal (สไตล์เดียวกับ ManageBookings)
  modalBackdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,.35)",
    justifyContent: "center",
    padding: 22,
  },
  modalCard: { backgroundColor: "#fff", borderRadius: 14, padding: 18 },
  modalTitle: { fontSize: 18, fontWeight: "700", color: "#333" },
  modalSub: { marginTop: 10, color: "#555", lineHeight: 20 },
  modalActions: { flexDirection: "row", justifyContent: "flex-end", marginTop: 16 },

  btn: { paddingVertical: 10, paddingHorizontal: 16, borderRadius: 10, marginLeft: 8 },
  btnGhost: { backgroundColor: "#fff", borderWidth: 1, borderColor: "#6A5AE0" },
  btnReject: { backgroundColor: "#ef4444" },
  btnText: { fontSize: 14, fontWeight: "700" },
});
