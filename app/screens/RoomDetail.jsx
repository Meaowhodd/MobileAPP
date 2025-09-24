import { AntDesign, Ionicons, MaterialIcons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import { deleteDoc, doc, onSnapshot, setDoc } from "firebase/firestore";
import { useEffect, useMemo, useState } from "react";
import {
  ImageBackground,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from "react-native";
import { auth, db } from "../../firebaseConfig";

export default function RoomDetail() {
  const params = useLocalSearchParams();
  const roomId = String(params.roomId || params.id || "");

  const imageSource = useMemo(() => {
    if (!params.image) return null;
    return typeof params.image === "string" ? { uri: params.image } : params.image;
  }, [params.image]);

  const [liked, setLiked] = useState(false);
  const rating = Number(params.rating ?? 4.5);

  const capacityText =
    params.capacityMin && params.capacityMax
      ? `${params.capacityMin}-${params.capacityMax} people`
      : params.people || "—";

  // subscribe favorite ของห้องนี้ (per user)
  useEffect(() => {
    const uid = auth.currentUser?.uid;
    if (!uid || !roomId) return;
    const ref = doc(db, "favorites", uid, "rooms", roomId);
    const unsub = onSnapshot(ref, (d) => setLiked(d.exists()));
    return unsub;
  }, [auth.currentUser?.uid, roomId]);

  const toggleLikeRemote = async () => {
    const uid = auth.currentUser?.uid;
    if (!uid || !roomId) return;
    const ref = doc(db, "favorites", uid, "rooms", roomId);
    try {
      if (liked) await deleteDoc(ref);
      else await setDoc(ref, { createdAt: Date.now() });
    } catch (e) {
      console.error("toggle like failed:", e);
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#fff" }}>
      <ScrollView bounces={false} showsVerticalScrollIndicator={false}>
        {/* Hero image */}
        <View style={styles.heroWrap}>
          {imageSource ? (
            <ImageBackground source={imageSource} style={styles.hero} resizeMode="cover">
              <View style={styles.heroOverlay} />
            </ImageBackground>
          ) : (
            <View style={[styles.hero, { backgroundColor: "#eef2ff" }]} />
          )}

          {/* Top controls */}
          <View style={styles.topBar}>
            <TouchableOpacity style={styles.iconBtn} onPress={() => router.back()}>
              <Ionicons name="chevron-back" size={22} color="#111827" />
            </TouchableOpacity>

            <View style={{ flexDirection: "row", gap: 10 }}>
              <TouchableOpacity style={styles.iconBtn} onPress={() => {}}>
                <Ionicons name="notifications-outline" size={20} color="#111827" />
              </TouchableOpacity>
              <TouchableOpacity style={styles.iconBtn} onPress={toggleLikeRemote}>
                <AntDesign name={liked ? "heart" : "hearto"} size={18} color={liked ? "#ff3b30" : "#111827"} />
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* Content */}
        <View style={styles.sheet}>
          <View style={styles.titleRow}>
            <View style={{ flex: 1 }}>
              <Text style={styles.title} numberOfLines={1}>
                {params.roomName || params.name || "Room"}
              </Text>
              <Text style={styles.infoText}>Capacity: {capacityText}</Text>
            </View>

            <View style={{ alignItems: "flex-end" }}>
              <Text style={styles.codeText}>{params.roomCode || params.code || "-"}</Text>
              <View style={{ flexDirection: "row", alignItems: "center", marginTop: 4 }}>
                <AntDesign name="star" size={14} color="#f59e0b" />
                <Text style={styles.ratingText}> {rating.toFixed(1)}</Text>
              </View>
            </View>
          </View>

          <Section title="Description" text={params.description} />
          <Section title="Highlights" text={params.highlights} />
          <Section title="Best for" text={params.bestFor} />
          <Section title="Atmosphere" text={params.atmosphere} />

          <View style={styles.infoRow}>
            <View style={styles.infoItem}>
              <MaterialIcons name="groups" size={18} color="#4b5563" />
              <Text style={styles.infoText}>{capacityText}</Text>
            </View>
            {!!params.floor && (
              <View style={styles.infoItem}>
                <MaterialIcons name="stairs" size={18} color="#4b5563" />
                <Text style={styles.infoText}>Floor {params.floor}</Text>
              </View>
            )}
            {!!(params.code || params.roomCode) && (
              <View style={styles.infoItem}>
                <MaterialIcons name="meeting_room" size={18} color="#4b5563" />
                <Text style={styles.infoText}>Room {params.code || params.roomCode}</Text>
              </View>
            )}
          </View>

          <TouchableOpacity
            style={styles.bookBtn}
            activeOpacity={0.9}
            onPress={() =>
              router.push({
                pathname: "/screens/Booking", // ใช้หน้า Booking ตามที่คุณระบุ
                params: {
                  // ✅ ส่งครบทั้ง 5 ค่า
                  roomId: roomId,
                  roomName: String(params.roomName || params.name || ""),
                  roomCode: String(params.roomCode || params.code || ""),
                  capacityMin: params.capacityMin ?? "",
                  capacityMax: params.capacityMax ?? "",
                },
              })
            }
          >
            <Text style={styles.bookText}>BOOK THIS ROOM</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function Section({ title, text }) {
  if (!text) return null;
  return (
    <View style={{ marginTop: 18 }}>
      <Text style={styles.sectionTitle}>{title}</Text>
      <Text style={styles.sectionText}>{String(text)}</Text>
    </View>
  );
}

const PRIMARY = "#6C63FF";

const styles = StyleSheet.create({
  heroWrap: { width: "100%", height: 220 },
  hero: { width: "100%", height: "100%" },
  heroOverlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.08)" },
  topBar: {
    position: "absolute",
    top: 10,
    left: 14,
    right: 14,
    flexDirection: "row",
    justifyContent: "space-between",
  },
  iconBtn: {
    height: 36,
    width: 36,
    borderRadius: 18,
    backgroundColor: "#ffffffEE",
    alignItems: "center",
    justifyContent: "center",
  },
  sheet: {
    marginTop: -14,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    backgroundColor: "#fff",
    padding: 16,
  },
  titleRow: { flexDirection: "row", alignItems: "flex-start", justifyContent: "space-between" },
  title: { fontSize: 18, fontWeight: "700", color: "#111827" },
  codeText: { fontSize: 16, fontWeight: "700", color: "#111827" },
  ratingText: { color: "#111827", fontWeight: "600" },

  sectionTitle: { fontSize: 13, color: "#6b7280", marginBottom: 6 },
  sectionText: { fontSize: 13.5, color: "#1f2937", lineHeight: 19 },

  infoRow: { flexDirection: "row", flexWrap: "wrap", gap: 12, marginTop: 18 },
  infoItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "#f3f4f6",
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 8,
  },
  infoText: { color: "#374151", fontSize: 12.5 },

  bookBtn: {
    marginTop: 22,
    backgroundColor: PRIMARY,
    height: 46,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
  },
  bookText: { color: "#fff", fontWeight: "700", letterSpacing: 0.3 },
});
