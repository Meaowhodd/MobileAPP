// app/admin/AddRoomForm.jsx
import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import { useRouter } from "expo-router";
import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import { useState } from "react";
import {
  Alert,
  Image,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { db } from "../../firebaseConfig";

/** === Cloudinary config (แก้ให้ตรงของคุณ) === */
const CLOUD_NAME = "dlknbn6pd";         // ← cloud name ของคุณ
const UPLOAD_PRESET = "unsigned_rooms"; // ← unsigned upload preset ที่อนุญาต unsigned uploads
const CLOUD_FOLDER = "rooms";           // ← โฟลเดอร์ปลายทางใน Cloudinary

export default function AddRoomForm() {
  const router = useRouter();

  // form states
  const [roomName, setRoomName] = useState("");
  const [roomCode, setRoomCode] = useState("");
  const [capacityMin, setCapacityMin] = useState("");
  const [capacityMax, setCapacityMax] = useState("");
  const [floor, setFloor] = useState("");
  const [description, setDescription] = useState("");
  const [highlights, setHighlights] = useState("");
  const [bestFor, setBestFor] = useState("");
  const [atmosphere, setAtmosphere] = useState("");

  // image states
  const [image, setImage] = useState(null);
  const [loading, setLoading] = useState(false);

  /* ========== Pick image ========== */
  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.85,
    });
    if (!result.canceled) setImage(result.assets[0].uri);
  };

  /* ========== Upload to Cloudinary (รองรับ web + native) ========== */
  const uploadToCloudinary = async (localUri) => {
    if (!localUri) return "";

    const url = `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`;
    const formData = new FormData();

    if (Platform.OS === "web") {
      // บนเว็บต้องแปลงเป็น Blob
      const res = await fetch(localUri);
      const blob = await res.blob();
      formData.append("file", blob, "room.jpg");
    } else {
      formData.append("file", {
        uri: localUri,
        type: "image/jpeg",
        name: "room.jpg",
      });
    }

    formData.append("upload_preset", UPLOAD_PRESET);
    formData.append("folder", CLOUD_FOLDER);

    const res = await fetch(url, { method: "POST", body: formData });
    const json = await res.json();

    if (!res.ok) {
      console.error("Cloudinary error:", json);
      throw new Error(json?.error?.message || "Upload failed");
    }
    return json.secure_url || "";
  };

  /* ========== Validate ========== */
  const validate = () => {
    if (!roomName.trim() || !roomCode.trim()) {
      Alert.alert("ข้อมูลไม่ครบ", "กรุณากรอกชื่อห้องและรหัสห้อง");
      return false;
    }
    if (!capacityMin.trim() || !capacityMax.trim()) {
      Alert.alert("ข้อมูลไม่ครบ", "กรุณากรอกจำนวนขั้นต่ำและจำนวนสูงสุด");
      return false;
    }
    const min = Number(capacityMin);
    const max = Number(capacityMax);
    if (!Number.isFinite(min) || !Number.isFinite(max) || min <= 0 || max <= 0) {
      Alert.alert("รูปแบบไม่ถูกต้อง", "จำนวนผู้ใช้ต้องเป็นตัวเลขที่มากกว่า 0");
      return false;
    }
    if (max < min) {
      Alert.alert("ผิดพลาด", "จำนวนสูงสุดต้องไม่ต่ำกว่าจำนวนขั้นต่ำ");
      return false;
    }
    return true;
  };

  /* ========== Save ========== */
  const handleSave = async () => {
    if (!validate()) return;

    try {
      setLoading(true);

      let imageUrl = "";
      if (image) {
        imageUrl = await uploadToCloudinary(image); // อัปโหลดถ้ามีรูป
      }

      // เตรียม payload — ไม่ส่งฟิลด์ image ถ้าอัปโหลดไม่สำเร็จ (กัน undefined)
      const payload = {
        name: roomName.trim(),
        code: roomCode.trim(),
        capacityMin: Number(capacityMin),
        capacityMax: Number(capacityMax),
        floor: floor.trim(),
        description: description.trim(),
        highlights: highlights.trim(),
        bestFor: bestFor.trim(),
        atmosphere: atmosphere.trim(),
        availableToday: true,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      };
      if (imageUrl) payload.image = imageUrl;

      await addDoc(collection(db, "rooms"), payload);

      Alert.alert("สำเร็จ", "บันทึกห้องใหม่เรียบร้อย 🎉");
      router.back();
    } catch (e) {
      console.error("save room error:", e);
      Alert.alert("ผิดพลาด", e?.message || "ไม่สามารถบันทึกห้องได้");
    } finally {
      setLoading(false);
    }
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

      <ScrollView contentContainerStyle={styles.body} keyboardShouldPersistTaps="handled">
        {/* Image picker */}
        <TouchableOpacity style={styles.imagePicker} onPress={pickImage}>
          {image ? (
            <Image source={{ uri: image }} style={styles.roomImage} />
          ) : (
            <View style={styles.placeholder}>
              <Ionicons name="camera-outline" size={40} color="#b8c2d8" />
              <Text style={styles.placeholderText}>Add Room Image</Text>
            </View>
          )}
        </TouchableOpacity>

        {/* Form */}
        <TextInput
          style={styles.input}
          placeholder="Room Name"
          placeholderTextColor="#B8C2D8"
          value={roomName}
          onChangeText={setRoomName}
          returnKeyType="next"
        />
        <TextInput
          style={styles.input}
          placeholder="Room Code (เช่น A-203)"
          placeholderTextColor="#B8C2D8"
          value={roomCode}
          onChangeText={setRoomCode}
          autoCapitalize="characters"
          returnKeyType="next"
        />

        {/* Capacity row (ไม่ล้นจอ) */}
        <View style={styles.row}>
          <TextInput
            style={[styles.input, styles.half]}
            placeholder="จำนวนขั้นต่ำ"
            placeholderTextColor="#B8C2D8"
            value={capacityMin}
            onChangeText={setCapacityMin}
            keyboardType="number-pad"
            inputMode="numeric"
            textAlign="center"
            returnKeyType="next"
          />
          <TextInput
            style={[styles.input, styles.half]}
            placeholder="จำนวนสูงสุด"
            placeholderTextColor="#B8C2D8"
            value={capacityMax}
            onChangeText={setCapacityMax}
            keyboardType="number-pad"
            inputMode="numeric"
            textAlign="center"
            returnKeyType="next"
          />
        </View>

        <TextInput
          style={styles.input}
          placeholder="Floor (เช่น 2)"
          placeholderTextColor="#B8C2D8"
          value={floor}
          onChangeText={setFloor}
          keyboardType="number-pad"
          inputMode="numeric"
          returnKeyType="next"
        />

        <TextInput
          style={[styles.input, styles.textarea]}
          placeholder="Description (รายละเอียดห้อง)"
          placeholderTextColor="#B8C2D8"
          value={description}
          onChangeText={setDescription}
          multiline
        />
        <TextInput
          style={[styles.input, styles.textarea]}
          placeholder="Highlights (จุดเด่น)"
          placeholderTextColor="#B8C2D8"
          value={highlights}
          onChangeText={setHighlights}
          multiline
        />
        <TextInput
          style={[styles.input, styles.textarea]}
          placeholder="Best for (เหมาะสำหรับ)"
          placeholderTextColor="#B8C2D8"
          value={bestFor}
          onChangeText={setBestFor}
          multiline
        />
        <TextInput
          style={[styles.input, styles.textarea]}
          placeholder="Atmosphere (บรรยากาศ)"
          placeholderTextColor="#B8C2D8"
          value={atmosphere}
          onChangeText={setAtmosphere}
          multiline
        />

        <TouchableOpacity style={styles.saveBtn} onPress={handleSave} disabled={loading}>
          <Text style={styles.saveText}>{loading ? "Saving..." : "Save Room"}</Text>
        </TouchableOpacity>
        <View style={{ height: 16 }} />
      </ScrollView>
    </View>
  );
}

/* ===== Styles ===== */
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

  body: { padding: 20, paddingBottom: 24 },

  imagePicker: {
    width: "100%",
    height: 180,
    borderRadius: 12,
    backgroundColor: "#F5F7FB",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "#E6EAF2",
  },
  roomImage: { width: "100%", height: "100%", resizeMode: "cover" },
  placeholder: { justifyContent: "center", alignItems: "center" },
  placeholderText: { color: "#B8C2D8", marginTop: 6, fontWeight: "600" },

  input: {
    backgroundColor: "#F8FAFF",
    borderRadius: 10,
    paddingHorizontal: 12,
    height: 45,
    marginBottom: 12,
    fontSize: 14,
    borderWidth: 1,
    borderColor: "#E6EAF2",
    color: "#0F172A",
    minWidth: 0, // กัน overflow เมื่ออยู่ในแถว
  },
  textarea: { height: 88, paddingTop: 10, textAlignVertical: "top" },

  // แถวความจุไม่ล้นจอ
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  half: { width: "48%" },

  saveBtn: {
    backgroundColor: "#6A5AE0",
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: "center",
    marginTop: 4,
  },
  saveText: { color: "#fff", fontSize: 16, fontWeight: "bold" },
});
