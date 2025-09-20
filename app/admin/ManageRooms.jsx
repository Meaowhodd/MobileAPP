import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import { useRouter } from "expo-router";
import { useState } from "react";
import { Image, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";

export default function AddRoomForm() {
  const router = useRouter();

  // state เก็บค่าฟอร์ม
  const [roomName, setRoomName] = useState("");
  const [roomCode, setRoomCode] = useState("");
  const [capacity, setCapacity] = useState("");
  const [floor, setFloor] = useState("");
  const [description, setDescription] = useState("");
  const [highlights, setHighlights] = useState("");
  const [bestFor, setBestFor] = useState("");
  const [atmosphere, setAtmosphere] = useState("");

  // state เก็บรูป
  const [image, setImage] = useState(null);

  // ฟังก์ชันเลือกภาพ
  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.8,
    });

    if (!result.canceled) {
      setImage(result.assets[0].uri);
    }
  };

  const handleSave = () => {
    console.log({
      roomName,
      roomCode,
      capacity,
      floor,
      description,
      highlights,
      bestFor,
      atmosphere,
      image, // เก็บลิงก์ภาพด้วย
    });

    router.back();
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="white" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Add New Room</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView contentContainerStyle={styles.body}>
        {/* 🔹 ส่วนอัพโหลดรูป */}
        <TouchableOpacity style={styles.imagePicker} onPress={pickImage}>
          {image ? (
            <Image source={{ uri: image }} style={styles.roomImage} />
          ) : (
            <View style={styles.placeholder}>
              <Ionicons name="camera-outline" size={40} color="#888" />
              <Text style={{ color: "#888", marginTop: 5 }}>Add Room Image</Text>
            </View>
          )}
        </TouchableOpacity>

        {/* ฟอร์ม */}
        <TextInput style={styles.input} placeholder="Room Name" value={roomName} onChangeText={setRoomName} />
        <TextInput style={styles.input} placeholder="Room Code (A-203)" value={roomCode} onChangeText={setRoomCode} />
        <TextInput style={styles.input} placeholder="Capacity (เช่น 4-6 คน)" value={capacity} onChangeText={setCapacity} />
        <TextInput style={styles.input} placeholder="Floor" value={floor} onChangeText={setFloor} />
        <TextInput style={styles.input} placeholder="Description" value={description} onChangeText={setDescription} />
        <TextInput style={styles.input} placeholder="Highlights" value={highlights} onChangeText={setHighlights} />
        <TextInput style={styles.input} placeholder="Best for" value={bestFor} onChangeText={setBestFor} />
        <TextInput style={styles.input} placeholder="Atmosphere" value={atmosphere} onChangeText={setAtmosphere} />

        {/* ปุ่ม Save */}
        <TouchableOpacity style={styles.saveBtn} onPress={handleSave}>
          <Text style={styles.saveText}>Save Room</Text>
        </TouchableOpacity>
      </ScrollView>
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
  },
  headerTitle: { fontSize: 20, fontWeight: "bold", color: "white" },
  body: { padding: 20 },

  // กรอบสำหรับรูป
  imagePicker: {
    width: "100%",
    height: 180,
    borderRadius: 10,
    backgroundColor: "#f1f1f1",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 20,
    overflow: "hidden",
  },
  roomImage: { width: "100%", height: "100%", resizeMode: "cover" },
  placeholder: { justifyContent: "center", alignItems: "center" },

  input: {
    backgroundColor: "#f1f1f1",
    borderRadius: 10,
    padding: 12,
    marginBottom: 15,
    fontSize: 14,
  },
  saveBtn: {
    backgroundColor: "#6A5AE0",
    padding: 15,
    borderRadius: 12,
    alignItems: "center",
    marginTop: 10,
  },
  saveText: { color: "white", fontSize: 16, fontWeight: "bold" },
});
