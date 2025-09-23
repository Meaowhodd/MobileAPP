import { Ionicons, MaterialIcons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useEffect, useMemo, useState } from "react";
import {
  FlatList,
  Image,
  SafeAreaView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

import {
  collection,
  deleteDoc,
  doc,
  onSnapshot,
  setDoc,
} from "firebase/firestore";
import { auth, db } from "../../firebaseConfig";

export default function HomeScreen() {
  const [rooms, setRooms] = useState([]);
  const [favIds, setFavIds] = useState(new Set());
  const [query, setQuery] = useState("");
  const [avatar, setAvatar] = useState(null);

  useEffect(() => {
    const unsub = onSnapshot(
      collection(db, "rooms"),
      (snap) => setRooms(snap.docs.map((d) => ({ id: d.id, ...d.data() }))),
      (err) => console.error("rooms onSnapshot error:", err)
    );
    return unsub;
  }, []);

  useEffect(() => {
    const uid = auth.currentUser?.uid;
    if (!uid) return;
    const unsub = onSnapshot(
      collection(db, "favorites", uid, "rooms"),
      (snap) => setFavIds(new Set(snap.docs.map((d) => d.id))),
      (err) => console.error("favorites onSnapshot error:", err)
    );
    return unsub;
  }, []);

  useEffect(() => {
    const uid = auth.currentUser?.uid;
    if (!uid) return;
    const unsub = onSnapshot(
      doc(db, "users", uid),
      (snap) => {
        const url = snap.exists() ? snap.data()?.photoUrl : null;
        setAvatar(url || auth.currentUser?.photoURL || null);
      },
      (err) => console.error("user avatar onSnapshot error:", err)
    );
    return unsub;
  }, []);

  const stats = useMemo(() => {
    const all = rooms.length;
    const available = rooms.filter((r) => r.availableToday).length;
    return { available, all };
  }, [rooms]);

  const visibleRooms = useMemo(() => {
    const q = query.trim().toLowerCase();
    const withLiked = rooms.map((r) => ({ ...r, liked: favIds.has(r.id) }));
    const filtered = withLiked.filter(
      (r) => r.name?.toLowerCase().includes(q) || r.code?.toLowerCase().includes(q)
    );
    return filtered.sort((a, b) => {
      if (a.liked !== b.liked) return a.liked ? -1 : 1;
      return String(a.name || "").localeCompare(String(b.name || ""));
    });
  }, [rooms, favIds, query]);

  const toggleLike = async (roomId, isLiked) => {
    const uid = auth.currentUser?.uid;
    if (!uid) return;
    const ref = doc(db, "favorites", uid, "rooms", roomId);
    try {
      if (isLiked) await deleteDoc(ref);
      else await setDoc(ref, { createdAt: Date.now() });
    } catch (e) {
      console.error("toggle favorite failed:", e);
    }
  };

  const renderItem = ({ item }) => (
    <TouchableOpacity
      style={styles.card}
      activeOpacity={0.9}
      onPress={() =>
        router.push({
          pathname: "/screens/RoomDetail",
          params: { ...item },
        })
      }
    >
      <Image
        source={typeof item.image === "string" ? { uri: item.image } : item.image}
        style={styles.cardImage}
      />

      <View style={styles.cardBody}>
        <View style={styles.titleRow}>
          <Text style={styles.cardTitle} numberOfLines={1}>
            {item.name}
          </Text>
          <TouchableOpacity onPress={() => toggleLike(item.id, item.liked)} hitSlop={8}>
            <Ionicons
              name={item.liked ? "heart" : "heart-outline"}
              size={22}
              color={item.liked ? "#ff3b30" : "#9aa0a6"}
            />
          </TouchableOpacity>
        </View>

        <View style={styles.metaRow}>
          <Text style={styles.metaValue}>ROOM {item.code}</Text>
        </View>

        <View style={styles.metaRow}>
          <MaterialIcons name="groups" size={20} style={styles.metaIcon} />
          <Text style={styles.metaValue}>
            ความจุ{" "}
            {item.capacityMin && item.capacityMax
              ? `${item.capacityMin}-${item.capacityMax} คน`
              : item.people || "—"}
          </Text>
        </View>

        <View style={styles.metaRow}>
          <MaterialIcons name="stairs" size={20} style={styles.metaIcon} />
          <Text style={styles.metaValue}>ชั้น {item.floor ?? "-"}</Text>
        </View>

        <View style={styles.footerRow}>
          <View style={{ flex: 1 }} />
          <TouchableOpacity
            style={styles.bookBtn}
            onPress={(e) => {
              e.stopPropagation();
              router.push({
                pathname: "/screens/Booking",
                params: {
                  roomId: item.id,
                  roomName: item.name,
                  roomCode: item.code,
                },
              });
            }}
          >
            <Text style={styles.bookBtnText}>BOOK NOW</Text>
          </TouchableOpacity>
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <TouchableOpacity onPress={() => router.push({ pathname: "/(tabs)/Profile" })}>
            <Image
              source={
                avatar
                  ? { uri: avatar }
                  : require("../../assets/images/profile.jpg")
              }
              style={styles.avatar}
            />
          </TouchableOpacity>
        </View>

        <Text style={styles.headerTitle}>Meeting Rooms</Text>

        <View style={styles.searchWrap}>
          <Ionicons name="search" size={18} color="#6b7280" style={{ marginRight: 6 }} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search Meeting Room"
            value={query}
            onChangeText={setQuery}
            returnKeyType="search"
          />
        </View>
      </View>

      <View style={styles.statsRow}>
        <StatCard title="Room available today" value={String(stats.available)} />
        <StatCard title="All rooms" value={String(stats.all)} />
      </View>

      <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
        <Text style={styles.meetingRoomText}>Meeting room</Text>
        <TouchableOpacity onPress={() => router.push("/screens/RoomCalendar")}>
          <MaterialIcons name="calendar-month" size={30} style={styles.metaIcon} />
        </TouchableOpacity>
      </View>

      <FlatList
        data={visibleRooms}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        contentContainerStyle={{ padding: 16, paddingBottom: 28 }}
        ItemSeparatorComponent={() => <View style={{ height: 12 }} />}
        showsVerticalScrollIndicator={false}
      />
    </SafeAreaView>
  );
}

function StatCard({ title, value }) {
  return (
    <View style={styles.statCard}>
      <Text style={styles.statTitle}>{title}</Text>
      <Text style={styles.statValue}>{value}</Text>
    </View>
  );
}

const PRIMARY = "#6C63FF";

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },

  header: {
    backgroundColor: PRIMARY,
    borderBottomLeftRadius: 16,
    borderBottomRightRadius: 16,
    paddingBottom: 14,
  },
  headerTop: {
    flexDirection: "row",
    justifyContent: "flex-end",
    paddingHorizontal: 14,
    paddingTop: 8,
    alignItems: "center",
    gap: 10,
  },
  avatar: { width: 36, height: 36, borderRadius: 18, borderWidth: 1, borderColor: "#00000055" },

  headerTitle: { color: "#fff", fontSize: 26, fontWeight: "700", marginTop: 6, marginLeft: 20 },

  searchWrap: {
    marginTop: 10,
    marginHorizontal: 16,
    backgroundColor: "#fff",
    borderRadius: 12,
    elevation: 2,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 10,
    height: 44,
    borderWidth: 1,
    borderColor: "#d7def3",
  },
  searchInput: { flex: 1, fontSize: 15, color: "#1F2937" },

  statsRow: { flexDirection: "row", gap: 12, paddingHorizontal: 16, paddingVertical: 12 },
  statCard: { flex: 1, backgroundColor: "#f5f6ff", borderRadius: 14, padding: 14 },
  statTitle: { color: "#6b6f76", fontSize: 12, marginBottom: 6 },
  statValue: { fontSize: 28, fontWeight: "800", color: "#2b2d31" },

  card: {
    flexDirection: "row",
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 10,
    gap: 10,
    alignItems: "stretch",
    elevation: 1,
    shadowColor: "#000",
    shadowOpacity: 0.06,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    borderWidth: 1,
    borderColor: "#E6E8F0",
  },
  cardImage: { width: 140, height: 130, borderRadius: 12, backgroundColor: "#e9eefc" },
  cardBody: { flex: 1 },
  titleRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 2 },
  cardTitle: { fontSize: 16, fontWeight: "700", color: "#222", maxWidth: "85%" },
  metaRow: { flexDirection: "row", alignItems: "center", marginTop: 2 },
  metaValue: { fontSize: 13, color: "#2b2d31" },
  metaIcon: { color: "#4a4a4a", marginRight: 6 },

  footerRow: { marginTop: 8, flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  bookBtn: { backgroundColor: "#6C63FF", paddingHorizontal: 14, height: 36, borderRadius: 12, alignItems: "center", justifyContent: "center" },
  bookBtnText: { color: "#fff", fontWeight: "700", fontSize: 13 },
  meetingRoomText: { fontSize: 24, fontWeight: "500", marginLeft: 16, marginTop: 8, marginBottom: 4, color: "#222" },
});
