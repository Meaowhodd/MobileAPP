import { Ionicons, MaterialIcons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useMemo, useState } from "react";
import { FlatList, Image, SafeAreaView, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";

// ---------- ข้อมูลห้อง (ชื่อ + code พร้อมค้นหา) ----------
const ROOMS_INIT = [
  { id: "1",  name: "Brainstorm Hub",       code: "A-203", people: "4-6 คน",  floor: "2", image: require("../../assets/images/Room1.jpg"), liked: true,  availableToday: true, description: "ห้องเล็กสำหรับการระดมสมองของทีมเล็ก", highlights: "Whiteboard, Sticky notes, TV Screen", bestFor: "Brainstorming, Idea pitching", atmosphere: "สดใส กระตุ้นความคิดสร้างสรรค์" },
  { id: "2",  name: "Pitch Room",           code: "A-105", people: "8-12 คน", floor: "1", image: require("../../assets/images/Room1.jpg"), liked: false, availableToday: true, description: "ห้องขนาดกลางเหมาะสำหรับการพรีเซนต์งานและ pitch idea", highlights: "Projector, Microphone, Stage",bestFor: "Pitching, Team presentation",atmosphere: "เป็นทางการ เหมาะกับการนำเสนอ" },
  { id: "3",  name: "Digital Lab",          code: "B-201", people: "10-15 คน",floor: "2", image: require("../../assets/images/Room1.jpg"), liked: false, availableToday: false, description: "ห้องทดลองเชิงดิจิทัล รองรับการจัด workshop", highlights: "Computers, Smartboard, High-speed WiFi",  bestFor: "Training, Workshop", atmosphere: "ทันสมัย มีอุปกรณ์ดิจิทัลครบ"},
  { id: "4",  name: "Tech Conference Hall", code: "A-102", people: "20-30 คน",floor: "1", image: require("../../assets/images/Room1.jpg"), liked: true,  availableToday: true, description: "ห้องประชุมขนาดใหญ่ เหมาะสำหรับการจัดสัมมนา",highlights: "Stage, Sound system, Projector",bestFor: "Conference, Seminar",atmosphere: "กว้างขวาง เป็นทางการ"  },
  { id: "5",  name: "Innovation Studio",    code: "C-308", people: "6-8 คน",  floor: "3", image: require("../../assets/images/Room1.jpg"), liked: false, availableToday: true, description: "พื้นที่สร้างสรรค์สำหรับทีมวิจัยและพัฒนา",highlights: "Prototyping tools, Whiteboard, 3D Printer",bestFor: "Innovation, Product design",atmosphere: "สร้างสรรค์ ทันสมัย"  },
  { id: "6",  name: "Focus Cabin",          code: "D-112", people: "2-4 คน",  floor: "1", image: require("../../assets/images/Room1.jpg"), liked: false, availableToday: true, description: "ห้องเล็กเงียบสงบสำหรับการทำงานแบบโฟกัส",highlights: "Noise-cancellation, Comfortable chairs",bestFor: "Deep work, Small private meeting",atmosphere: "สงบ ส่วนตัว"  },
  { id: "7",  name: "Strategy Boardroom",   code: "E-405", people: "8-10 คน", floor: "4", image: require("../../assets/images/Room1.jpg"), liked: false, availableToday: true, description: "ห้องประชุมเชิงกลยุทธ์ของผู้บริหาร",highlights: "Large table, Video conferencing, Projector", bestFor: "Board meeting, Strategic planning", atmosphere: "หรูหรา มีความเป็นมืออาชีพ" },
  { id: "8",  name: "Collab Corner",        code: "B-103", people: "6-8 คน",  floor: "1", image: require("../../assets/images/Room1.jpg"), liked: true,  availableToday: false, description: "มุมสำหรับการทำงานร่วมกันอย่างไม่เป็นทางการ", highlights: "Couch, Whiteboard, Coffee machine", bestFor: "Team collaboration, Casual meeting",atmosphere: "อบอุ่น ผ่อนคลาย" },
  { id: "9",  name: "Idea Loft",            code: "C-210", people: "8-12 คน", floor: "2", image: require("../../assets/images/Room1.jpg"), liked: false, availableToday: true, description: "ห้องสตูดิโอเพดานสูงสำหรับการคิดสร้างสรรค์", highlights: "Open space, Art wall, Natural light",bestFor: "Creative session, Brainstorming",atmosphere: "เปิดกว้าง กระตุ้นไอเดีย"  },
  { id: "10", name: "Nexus Room",           code: "A-301", people: "8-10 คน", floor: "3", image: require("../../assets/images/Room1.jpg"), liked: false, availableToday: true, description: "ห้องหรูพร้อมวิวเมือง เหมาะสำหรับลูกค้าสำคัญ",highlights: "Panoramic view, Projector, Coffee bar", bestFor: "Client meeting, Executive session", atmosphere: "หรูหรา โปร่งโล่ง" },
  { id: "11", name: "Horizon Suite",        code: "D-505", people: "12-18 คน",floor: "5", image: require("../../assets/images/Room1.jpg"), liked: false, availableToday: true,  description: "ห้องหรูพร้อมวิวเมือง เหมาะสำหรับลูกค้าสำคัญ",highlights: "Panoramic view, Projector, Coffee bar",bestFor: "Client meeting, Executive session",atmosphere: "หรูหรา โปร่งโล่ง"},
  { id: "12", name: "Atlas Room",           code: "E-207", people: "4-6 คน",  floor: "2", image: require("../../assets/images/Room1.jpg"), liked: false, availableToday: true,  description: "ห้องประชุมขนาดเล็กเหมาะกับทีมสตาร์ทอัพ", highlights: "Whiteboard, Monitor, WiFi",bestFor: "Startup meeting, Small discussion",atmosphere: "เป็นกันเอง มีชีวิตชีวา" },
  { id: "13", name: "Echo Pod",             code: "F-109", people: "2-3 คน",  floor: "1", image: require("../../assets/images/Room1.jpg"), liked: false, availableToday: false, description: "ห้องเล็กส่วนตัวสำหรับการโทรหรือประชุมออนไลน์",highlights: "Soundproof, Headset, Small desk",bestFor: "Online meeting, Private call",atmosphere: "เงียบสงบ เป็นส่วนตัวสูง" },
];

export default function HomeScreen() {
  const [rooms, setRooms] = useState(ROOMS_INIT);
  const [query, setQuery] = useState("");

  // ค่าสถิติบนการ์ด
  const stats = useMemo(() => {
    const all = rooms.length;
    const available = rooms.filter((r) => r.availableToday).length;
    return { available, all };
  }, [rooms]);

  // ✅ ค้นหาทั้งชื่อห้อง และเลขห้อง (code) + เรียง liked มาก่อน
  const visibleRooms = useMemo(() => {
    const q = query.trim().toLowerCase();
    const filtered = rooms.filter(
      (r) =>
        r.name.toLowerCase().includes(q) ||
        r.code.toLowerCase().includes(q)
    );
    return filtered.sort((a, b) => {
      if (a.liked !== b.liked) return a.liked ? -1 : 1;
      return a.name.localeCompare(b.name);
    });
  }, [rooms, query]);

  const toggleLike = (id) => {
    setRooms((prev) =>
      prev.map((r) => (r.id === id ? { ...r, liked: !r.liked } : r))
    );
  };

 const renderItem = ({ item }) => (
  <TouchableOpacity
    style={styles.card}
    activeOpacity={0.9}
    // 👉 กดที่การ์ด = ไปหน้า RoomDetail
    onPress={() =>
  router.push({
    pathname: "/screens/RoomDetail",
    params: {
      roomId: item.id,
      roomName: item.name,
      roomCode: item.code,
      people: item.people,
      floor: item.floor,
      image: item.image,
      description: item.description,   // ✅ ส่งข้อมูลของห้องจริง
      highlights: item.highlights,
      bestFor: item.bestFor,
      atmosphere: item.atmosphere,
    },
  })
}


  >
    {/* รูปห้อง */}
    <Image source={item.image} style={styles.cardImage} />

    {/* เนื้อหาในบัตร */}
    <View style={styles.cardBody}>
      <View style={styles.titleRow}>
        <Text style={styles.cardTitle} numberOfLines={1}>
          {item.name}
        </Text>
        <TouchableOpacity onPress={() => toggleLike(item.id)} hitSlop={8}>
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
        <Text style={styles.metaValue}>ความจุ {item.people}</Text>
      </View>

      <View style={styles.metaRow}>
        <MaterialIcons name="stairs" size={20} style={styles.metaIcon} />
        <Text style={styles.metaValue}>ชั้น {item.floor}</Text>
      </View>

      {/* ปุ่ม Book Now (แยกจาก onPress ของการ์ด) */}
      <View style={styles.footerRow}>
        <View style={{ flex: 1 }} />
        <TouchableOpacity
          style={styles.bookBtn}
          onPress={(e) => {
            e.stopPropagation(); // ❌ กันไม่ให้ไปชน onPress ของการ์ด
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
      {/* Header + LoginTest */}
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <TouchableOpacity onPress={() => router.push({ pathname: "/screens/Login" })}>
            <View style={styles.loginbutton}>
              <Text style={styles.loginText}>LoginTest</Text>
            </View>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => router.push({ pathname: "/(tabs)/Profile" })}>
          <Image source={require("../../assets/images/profile.jpg")} style={styles.avatar} />
          </TouchableOpacity>
        </View>

        <Text style={styles.headerTitle}>Meeting Rooms</Text>

        {/* Search */}
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
      {/* สถิติ */}
      <View style={styles.statsRow}>
        <StatCard title="Room available today" value={String(stats.available)} />
        <StatCard title="All rooms" value={String(stats.all)} />
      </View>
      <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between",marginBottom:10 }}>
        <Text style={styles.meetingRoomText}>Meeting room</Text>
        <TouchableOpacity onPress={() => router.push("/screens/RoomCalendar")}>
      <MaterialIcons name="calendar-month" size={30} style={styles.metaIcon} />
        </TouchableOpacity>

      </View>

      {/* รายการห้อง */}
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

const PRIMARY = "#1f66f2";

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
  loginbutton: { backgroundColor: "#3decff", paddingHorizontal: 12, paddingVertical: 8, borderRadius: 8 },
  loginText: { color: "#0b3d91", fontWeight: "600" },
  avatar: { width: 36, height: 36, borderRadius: 18, borderWidth: 1, borderColor: "#00000055" },

  headerTitle: { color: "#fff", fontSize: 26, fontWeight: "700", marginTop: 6, marginLeft: 20 },

  searchWrap: {
    marginTop: 10, marginHorizontal: 16, backgroundColor: "#fff", borderRadius: 12,
    elevation: 2, shadowColor: "#000", shadowOpacity: 0.1, shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 }, flexDirection: "row", alignItems: "center",
    paddingHorizontal: 10, height: 44, borderWidth: 1, borderColor: "#d7def3",
  },
  searchInput: { flex: 1, fontSize: 15, color: "#1F2937" },

  statsRow: { flexDirection: "row", gap: 12, paddingHorizontal: 16, paddingVertical: 12 },
  statCard: { flex: 1, backgroundColor: "#f5f6ff", borderRadius: 14, padding: 14 },
  statTitle: { color: "#6b6f76", fontSize: 12, marginBottom: 6 },
  statValue: { fontSize: 28, fontWeight: "800", color: "#2b2d31" },

  card: {
    flexDirection: "row", backgroundColor: "#fff", borderRadius: 16, padding: 10, gap: 10,
    alignItems: "stretch", elevation: 1, shadowColor: "#000", shadowOpacity: 0.06,
    shadowRadius: 8, shadowOffset: { width: 0, height: 2 }, borderWidth: 1, borderColor: "#E6E8F0",
  },
  cardImage: { width: 140, height: 130, borderRadius: 12, backgroundColor: "#e9eefc" },
  cardBody: { flex: 1 },
  titleRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 2 },
  cardTitle: { fontSize: 16, fontWeight: "700", color: "#222", maxWidth: "85%" },
  metaRow: { flexDirection: "row", alignItems: "center", marginTop: 2 },
  metaKey: { fontSize: 11, color: "#8a8f98", marginRight: 6, letterSpacing: 0.4 },
  metaValue: { fontSize: 13, color: "#2b2d31" },
  metaIcon: { color: "#4a4a4a", marginRight: 6 },

  footerRow: { marginTop: 8, flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  bookBtn: { backgroundColor: "#1e5cff", paddingHorizontal: 14, height: 36, borderRadius: 12, alignItems: "center", justifyContent: "center" },
  bookBtnText: { color: "#fff", fontWeight: "700", fontSize: 13 },
  meetingRoomText: { fontSize: 24, fontWeight: "500", marginLeft: 16, marginTop: 8, marginBottom: 4, color: "#222" },
});
