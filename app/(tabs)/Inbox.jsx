import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useCallback, useEffect, useMemo, useState } from "react";
import {
  FlatList,
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { Swipeable } from "react-native-gesture-handler";
import {
  fetchNotifications,
  loadCached,
  saveCached,
  UI,
} from "../services/notifications";

const PRIMARY = "#6C63FF";
const PAGE_SIZE = 10;

/* ---------- Swipe actions ---------- */
function RightActions({ onRead, onDelete }) {
  return (
    <View style={{ flexDirection: "row" }}>
      <TouchableOpacity
        onPress={onRead}
        style={{ padding: 16, backgroundColor: "#1f66f2" }}
      >
        <Text style={{ color: "#fff", fontWeight: "600" }}>Read</Text>
      </TouchableOpacity>
      <TouchableOpacity
        onPress={onDelete}
        style={{ padding: 16, backgroundColor: "#ff3333" }}
      >
        <Text style={{ color: "#fff", fontWeight: "600" }}>Delete</Text>
      </TouchableOpacity>
    </View>
  );
}

/* ---------- Card ---------- */
function NotificationItem({ item, onPress }) {
  return (
    <TouchableOpacity
      activeOpacity={0.9}
      onPress={onPress}
      style={[
        styles.card,
        {
          borderLeftColor: UI.LEFT_BAR[item.type],
          backgroundColor: UI.BG[item.type],
          opacity: item.read ? 0.7 : 1,
        },
      ]}
    >
      <View style={styles.row}>
        <View style={styles.iconBubble}>
          <Text style={styles.iconText}>{UI.EMOJI[item.type]}</Text>
        </View>
        <View style={{ flex: 1 }}>
          <Text style={styles.title}>{item.title}</Text>
          <Text style={styles.desc}>{item.desc}</Text>
          <Text style={styles.timeText}>{item.time}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );
}

/* ---------- Screen ---------- */
export default function NotificationsScreen() {
  const [data, setData] = useState([]);
  const [page, setPage] = useState(1);
  const [refreshing, setRefreshing] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);

  // load cache + fetch page 1
  useEffect(() => {
    (async () => {
      const cached = await loadCached();
      if (cached) setData(cached);
      refreshFirstPage();
    })();
  }, []);

  const unreadCount = useMemo(() => data.filter((d) => !d.read).length, [data]);

  const refreshFirstPage = useCallback(async () => {
    setRefreshing(true);
    const res = await fetchNotifications({ page: 1, limit: PAGE_SIZE });
    setData(res.items);
    setPage(1);
    setHasMore(res.items.length > 0);
    setRefreshing(false);
    saveCached(res.items).catch(() => {});
  }, []);

  const loadMore = useCallback(async () => {
    if (loadingMore || !hasMore) return;
    setLoadingMore(true);
    const next = page + 1;
    const res = await fetchNotifications({ page: next, limit: PAGE_SIZE });
    setData((prev) => {
      const merged = [...prev, ...res.items];
      saveCached(merged).catch(() => {});
      return merged;
    });
    setPage(next);
    setHasMore(res.items.length > 0);
    setLoadingMore(false);
  }, [loadingMore, hasMore, page]);

  const markAllRead = () =>
    setData((prev) => {
      const updated = prev.map((n) => ({ ...n, read: true }));
      saveCached(updated).catch(() => {});
      return updated;
    });

  const clearAll = () => {
    setData([]);
    setHasMore(false);
    saveCached([]).catch(() => {});
  };

  const markRead = (id) =>
    setData((prev) => {
      const updated = prev.map((n) => (n.id === id ? { ...n, read: true } : n));
      saveCached(updated).catch(() => {});
      return updated;
    });

  const removeItem = (id) =>
    setData((prev) => {
      const updated = prev.filter((n) => n.id !== id);
      saveCached(updated).catch(() => {});
      return updated;
    });

  const renderItem = ({ item }) => (
    <Swipeable
      renderRightActions={() => (
        <RightActions
          onRead={() => markRead(item.id)}
          onDelete={() => removeItem(item.id)}
        />
      )}
    >
      <NotificationItem item={item} onPress={() => markRead(item.id)} />
    </Swipeable>
  );

  // back  ถ้าไม่มี history ให้ไปหน้า Home ในแท็บ
  const goBack = () => {
    try {
      router.back();
      // ถ้าไม่มี stack ให้ fallback
      setTimeout(() => router.replace("/(tabs)/Home"), 0);
    } catch {
      router.replace("/(tabs)/Home");
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header (เหมือน Home/My Booking) */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={goBack}>
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>

        <Text style={styles.headerTitle}>Notifications</Text>

        <TouchableOpacity onPress={clearAll}>
          <Text style={styles.clearAll}>Clear All</Text>
        </TouchableOpacity>
      </View>

      {/* Sub header */}
      <View style={styles.subHeader}>
        <Text style={styles.recent}>
          Recent {unreadCount > 0 ? `(${unreadCount} new)` : ""}
        </Text>
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
            <Text style={styles.emptyEmoji}>🎉</Text>
            <Text style={styles.emptyTitle}>All caught up</Text>
            <Text style={styles.emptyDesc}>
              You don’t have any notifications.
            </Text>
          </View>
        }
      />
    </SafeAreaView>
  );
}

/* ---------- styles ---------- */

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },

  header: {
    backgroundColor: PRIMARY,
    borderBottomLeftRadius: 16,
    borderBottomRightRadius: 16,
    paddingTop: 50, // กัน status bar แบบเดียวกับหน้า Home
    paddingBottom: 16,
    paddingHorizontal: 20,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  backButton: { position: "absolute", left: 16, top: 50 },
  headerTitle: {
    color: "#fff",
    fontSize: 20,
    fontWeight: "bold",
    textAlign: "center",
    flex: 1,
  },
  clearAll: { fontSize: 14, color: "#fff", fontWeight: "600" },

  subHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#ddd", // ให้เส้นคั่นเหมือนหน้าอื่น
  },
  recent: { fontSize: 16, fontWeight: "bold" },
  markAll: { fontSize: 14, color: "#999" },

  listContent: { padding: 15 },

  card: {
    borderLeftWidth: 4,
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
    backgroundColor: "#fff",
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 1,
  },
  row: { flexDirection: "row", gap: 10 },
  iconBubble: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#fff",
  },
  iconText: { fontSize: 16 },
  title: { fontWeight: "bold", fontSize: 16, marginBottom: 4, color: "#111" },
  desc: { fontSize: 14, color: "#444" },
  timeText: { marginTop: 6, fontSize: 12, color: "#666" },

  emptyBox: { alignItems: "center", paddingTop: 60 },
  emptyEmoji: { fontSize: 42, marginBottom: 8 },
  emptyTitle: { fontSize: 18, fontWeight: "bold", marginBottom: 4 },
  emptyDesc: { color: "#666" },
});
