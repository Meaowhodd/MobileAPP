// app/screens/RoomCalendar.jsx
import { Ionicons, MaterialIcons } from "@expo/vector-icons";
import { router } from "expo-router";
import { onAuthStateChanged } from "firebase/auth";
import {
  collection,
  onSnapshot,
  query,
  Timestamp,
  where,
} from "firebase/firestore";
import { useEffect, useMemo, useState } from "react";
import {
  FlatList,
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { Calendar } from "react-native-calendars";
import { auth, db } from "../../firebaseConfig";

const PRIMARY = "#6C63FF";

// 4 slot มาตรฐาน
const BASE_SLOTS = [
  { id: "S1", label: "08.00 - 10.00", start: 8, end: 10 },
  { id: "S2", label: "10.00 - 12.00", start: 10, end: 12 },
  { id: "S3", label: "13.00 - 15.00", start: 13, end: 15 },
  { id: "S4", label: "15.00 - 17.00", start: 15, end: 17 },
];

function toYMD(d) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function dayRange(dateString) {
  const d = new Date(dateString);
  const start = new Date(d.getFullYear(), d.getMonth(), d.getDate(), 0, 0, 0, 0);
  const end = new Date(d.getFullYear(), d.getMonth(), d.getDate(), 23, 59, 59, 999);
  return { start, end };
}

function slotDateRange(dateString, slotId) {
  const d = new Date(dateString);
  const byId = { S1: [8, 10], S2: [10, 12], S3: [13, 15], S4: [15, 17] };
  const [hStart, hEnd] = byId[slotId] || [0, 0];
  const start = new Date(d.getFullYear(), d.getMonth(), d.getDate(), hStart, 0, 0, 0);
  const end = new Date(d.getFullYear(), d.getMonth(), d.getDate(), hEnd, 0, 0, 0);
  return { start, end };
}

export default function RoomCalendar() {
  const [selectedDate, setSelectedDate] = useState(toYMD(new Date()));
  const [rooms, setRooms] = useState([]);

  // map ห้อง -> Set(slotId) ที่ถูกจองแล้วในวันนั้น
  const [bookedMap, setBookedMap] = useState(new Map());

  // auth state
  const [uid, setUid] = useState(null);
  const [authReady, setAuthReady] = useState(false);
  const [errText, setErrText] = useState("");

  // ===== รอ Auth พร้อม =====
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (user) => {
      setUid(user?.uid || null);
      setAuthReady(true);
    });
    return () => unsub();
  }, []);

  // ===== rooms realtime (rooms อ่านได้ public ตาม rules) =====
  useEffect(() => {
    const unsub = onSnapshot(
      collection(db, "rooms"),
      (snap) => {
        setRooms(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
      },
      (err) => {
        console.error("rooms onSnapshot:", err);
        setErrText("โหลดรายชื่อห้องไม่สำเร็จ");
      }
    );
    return unsub;
  }, []);

  // ===== bookings ของวันที่เลือก (ต้องล็อกอินตาม rules) =====
  useEffect(() => {
    // ถ้ายังไม่ได้ evaluate auth หรือไม่มี user -> ไม่ subscribe bookings
    if (!authReady) return;

    // ถ้าไม่ได้ล็อกอิน: เคลียร์ข้อมูล bookings และแจ้งเตือนแบบอ่อน ๆ (ไม่โยน error)
    if (!uid) {
      setBookedMap(new Map());
      setErrText("โปรดเข้าสู่ระบบเพื่อดูความว่างของห้องตามช่วงเวลา");
      return;
    }

    setErrText(""); // เคลียร์ error เดิม ๆ
    const { start, end } = dayRange(selectedDate);
    const startTs = Timestamp.fromDate(start);
    const endTs = Timestamp.fromDate(end);

    const qBookings = query(
      collection(db, "bookings"),
      where("slotStart", ">=", startTs),
      where("slotStart", "<=", endTs),
      // ใช้สถานะที่กิน slot: approved, in_use, pending
      where("status", "in", ["approved", "in_use", "pending"])
    );

    const unsub = onSnapshot(
      qBookings,
      (snap) => {
        const map = new Map();
        snap.forEach((ds) => {
          const b = ds.data();
          if (!b) return;
          const key = b.roomId || b.roomCode || b.roomName;
          if (!key) return;
          if (!map.has(key)) map.set(key, new Set());
          if (b.slotId) map.get(key).add(b.slotId);
        });
        setBookedMap(map);
      },
      (err) => {
        console.error("bookings onSnapshot:", err);
        // มักเกิดจากไม่ได้สิทธิ์ (ยังไม่ล็อกอิน) หรือ rules
        setErrText("เข้าถึงข้อมูลการจองไม่ได้ (ตรวจสอบการเข้าสู่ระบบ/สิทธิ์)");
      }
    );

    return unsub;
  }, [authReady, uid, selectedDate]);

  // ===== คำนวณห้องว่างของวัน =====
  const roomsOfDay = useMemo(() => {
    if (!selectedDate) return [];

    const todayYMD = toYMD(new Date());
    const isToday = selectedDate === todayYMD;
    const isPastDay = new Date(selectedDate) < new Date(todayYMD);
    const now = new Date();

    return rooms.map((r) => {
      const bookedForThisRoom =
        bookedMap.get(r.id) ||
        bookedMap.get(r.code) ||
        bookedMap.get(r.name) ||
        new Set();

      let freeSlots = BASE_SLOTS.filter((s) => !bookedForThisRoom.has(s.id));

      // วันอดีต -> ปิดหมด
      if (isPastDay) {
        freeSlots = [];
      }

      // วันนี้ -> ไม่แสดงช่วงที่สิ้นสุดไปแล้ว
      if (isToday) {
        freeSlots = freeSlots.filter((s) => {
          const { end } = slotDateRange(selectedDate, s.id);
          return end > now;
        });
      }

      const isAvailable = freeSlots.length > 0;

      return {
        id: r.id,
        name: r.name || r.code || "Room",
        code: r.code || "-",
        floor: r.floor ?? "-",
        capacity:
          r.capacityMin && r.capacityMax
            ? `${r.capacityMin}-${r.capacityMax} คน`
            : r.people || "—",
        availableSlots: freeSlots,
        status: isAvailable
          ? { label: "Available", color: "green" }
          : { label: "Close", color: "red" },
      };
    });
  }, [rooms, bookedMap, selectedDate]);

  const renderRoom = ({ item }) => (
    <View style={styles.roomCard}>
      <View style={styles.roomHead}>
        <Text style={styles.roomName}>{item.name}</Text>
        <View style={[styles.badge, { borderColor: item.status.color }]}>
          <Text style={[styles.badgeText, { color: item.status.color }]}>
            {item.status.label}
          </Text>
        </View>
      </View>

      <Text style={styles.roomLine}>ROOM {item.code} • ชั้น {item.floor}</Text>
      <Text style={styles.roomLine}>ความจุ: {item.capacity}</Text>

      {item.availableSlots.length > 0 ? (
        <View style={styles.slotWrap}>
          {item.availableSlots.map((s) => (
            <View key={s.id} style={styles.slotPill}>
              <Text style={styles.slotText}>{s.label}</Text>
            </View>
          ))}
        </View>
      ) : (
        <Text style={styles.noSlot}>ไม่มีช่วงเวลาที่จองได้</Text>
      )}
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>

        <Text style={styles.headerTitle}>Room Calendar</Text>

        <TouchableOpacity onPress={() => router.push("(tabs)/Inbox")}>
          <MaterialIcons name="notifications" size={24} color="#fff" />
        </TouchableOpacity>
      </View>

      {/* แจ้งเตือน error/สถานะล็อกอิน */}
      {!!errText && (
        <View style={styles.banner}>
          <Text style={styles.bannerText}>{errText}</Text>
        </View>
      )}

      {/* Calendar */}
      <View style={styles.calendarWrap}>
        <Calendar
          markedDates={{
            [selectedDate]: { selected: true, selectedColor: PRIMARY },
          }}
          onDayPress={(day) => setSelectedDate(day.dateString)}
        />
      </View>

      {/* List for selected day */}
      <Text style={styles.sectionTitle}>
        Room available on {selectedDate}
      </Text>

      <FlatList
        data={roomsOfDay}
        keyExtractor={(it) => it.id}
        renderItem={renderRoom}
        contentContainerStyle={{ paddingBottom: 24 }}
        ListEmptyComponent={<Text style={styles.noRoom}>No rooms</Text>}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },

  header: {
    backgroundColor: PRIMARY,
    borderBottomLeftRadius: 16,
    borderBottomRightRadius: 16,
    paddingBottom: 14,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingTop: 50,
    paddingHorizontal: 16,
  },
  headerTitle: { color: "#fff", fontSize: 20, fontWeight: "bold" },

  banner: {
    marginTop: 8,
    marginHorizontal: 16,
    backgroundColor: "#fff7ed",
    borderColor: "#fdba74",
    borderWidth: 1,
    borderRadius: 10,
    padding: 10,
  },
  bannerText: { color: "#9a3412", fontSize: 13.5 },

  calendarWrap: {
    margin: 16,
    borderRadius: 12,
    backgroundColor: "#fff",
    elevation: 2,
    shadowColor: "#000",
    shadowOpacity: 0.06,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
  },

  sectionTitle: {
    fontSize: 16,
    fontWeight: "bold",
    marginHorizontal: 16,
    marginBottom: 8,
  },

  roomCard: {
    backgroundColor: "#f9f9ff",
    padding: 14,
    marginHorizontal: 16,
    marginVertical: 6,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#E6E8F0",
  },
  roomHead: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 4,
  },
  roomName: { fontWeight: "800", fontSize: 15, color: "#1f2937" },
  badge: {
    borderWidth: 1,
    borderRadius: 999,
    paddingVertical: 3,
    paddingHorizontal: 10,
  },
  badgeText: { fontSize: 12, fontWeight: "700" },

  roomLine: { color: "#374151", marginTop: 2 },

  slotWrap: { flexDirection: "row", flexWrap: "wrap", gap: 8, marginTop: 10 },
  slotPill: {
    borderRadius: 999,
    paddingVertical: 6,
    paddingHorizontal: 10,
    backgroundColor: "#eef2ff",
    borderWidth: 1,
    borderColor: "#dbe4ff",
  },
  slotText: { color: "#1f2937", fontWeight: "600", fontSize: 12 },

  noSlot: { color: "#6b7280", marginTop: 8, fontStyle: "italic" },
  noRoom: { textAlign: "center", marginTop: 16, color: "#888" },
});
