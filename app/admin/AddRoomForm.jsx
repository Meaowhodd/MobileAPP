import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useState } from "react";
import { Image, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";

export default function AddRoomForm() {
  const router = useRouter();

  // 🔹 state เก็บค่าที่กรอกจากฟอร์ม
  const [roomName, setRoomName] = useState("");
  const [roomCode, setRoomCode] = useState("");
  const [capacity, setCapacity] = useState("");
  const [floor, setFloor] = useState("");
  const [description, setDescription] = useState("");
  const [highlights, setHighlights] = useState("");
  const [bestFor, setBestFor] = useState("");
  const [atmosphere, setAtmosphere] = useState("");

  // 🔹 ฟังก์ชันเมื่อกดปุ่ม Save
  const handleSave = () => {
    // ตอนนี้ยังเป็น mock → แค่ console.log ค่าออกมา
    console.log({
      roomName,
      roomCode,
      capacity,
      floor,
      description,
      highlights,
      bestFor,
      atmosphere,
    });

    // กลับไปหน้าก่อนหน้า (ManageRooms)
    router.back();
  };

  return (
    <View style={styles.container}>
      {/* 🔹 Header ด้านบน */}
      <View style={styles.header}>
        {/* ปุ่ม back */}
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="white" />
        </TouchableOpacity>

        {/* ชื่อหน้า */}
        <Text style={styles.headerTitle}>Add New Room</Text>

        {/* spacer เผื่ออนาคตมีปุ่มขวา */}
        <View style={{ width: 24 }} />
      </View>

      {/* 🔹 Body */}
      <ScrollView contentContainerStyle={styles.body}>
        {/* รูปห้องประชุม (mock ตอนนี้) */}
        <Image
          source={{ uri: "https://picsum.photos/600/300" }}
          style={styles.roomImage}
        />

        {/* ฟอร์มกรอกข้อมูลห้อง */}
        <TextInput
          style={styles.input}
          placeholder="Room Name"
          value={roomName}
          onChangeText={setRoomName}
        />

        <TextInput
          style={styles.input}
          placeholder="Room Code (A-203)"
          value={roomCode}
          onChangeText={setRoomCode}
        />

        <TextInput
          style={styles.input}
          placeholder="Capacity (เช่น 4-6 คน)"
          value={capacity}
          onChangeText={setCapacity}
        />

        <TextInput
          style={styles.input}
          placeholder="Floor"
          value={floor}
          onChangeText={setFloor}
        />

        <TextInput
          style={styles.input}
          placeholder="Description"
          value={description}
          onChangeText={setDescription}
        />

        <TextInput
          style={styles.input}
          placeholder="Highlights"
          value={highlights}
          onChangeText={setHighlights}
        />

        <TextInput
          style={styles.input}
          placeholder="Best for"
          value={bestFor}
          onChangeText={setBestFor}
        />

        <TextInput
          style={styles.input}
          placeholder="Atmosphere"
          value={atmosphere}
          onChangeText={setAtmosphere}
        />

        {/* ปุ่มบันทึกข้อมูล */}
        <TouchableOpacity style={styles.saveBtn} onPress={handleSave}>
          <Text style={styles.saveText}>Save Room</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },

  // 🔹 ส่วน Header
  header: {
    backgroundColor: "#6A5AE0", // สีม่วง
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingTop: 50,
    paddingHorizontal: 20,
    paddingBottom: 15,
  },
  headerTitle: { fontSize: 20, fontWeight: "bold", color: "white" },

  // 🔹 ส่วน Body
  body: { padding: 20 },

  // รูปห้องด้านบน
  roomImage: {
    width: "100%",
    height: 180,
    borderRadius: 10,
    marginBottom: 20,
  },

  // Input ฟอร์ม
  input: {
    backgroundColor: "#f1f1f1",
    borderRadius: 10,
    padding: 12,
    marginBottom: 15,
    fontSize: 14,
  },

  // ปุ่ม Save
  saveBtn: {
    backgroundColor: "#6A5AE0",
    padding: 15,
    borderRadius: 12,
    alignItems: "center",
    marginTop: 10,
  },
  saveText: { color: "white", fontSize: 16, fontWeight: "bold" },
});
