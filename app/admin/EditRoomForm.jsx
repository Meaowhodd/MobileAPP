// app/admin/EditRoomForm.jsx
import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useState } from "react";
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

import { doc, getDoc, serverTimestamp, updateDoc } from "firebase/firestore";
import { db } from "../../firebaseConfig";

const CLOUD_NAME = "dlknbn6pd";
const UPLOAD_PRESET = "unsigned_rooms"; 

export default function EditRoomForm() {
  const router = useRouter();
  const { id } = useLocalSearchParams(); 

  const [room, setRoom] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchRoom = async () => {
      try {
        const ref = doc(db, "rooms", String(id));
        const snap = await getDoc(ref);
        if (!snap.exists()) {
          Alert.alert("ไม่พบข้อมูลห้องนี้");
          router.back();
          return;
        }
        const data = snap.data();
        setRoom({
          name: data.name ?? "",
          code: data.code ?? "",
          capacityMin: data.capacityMin?.toString?.() ?? "",
          capacityMax: data.capacityMax?.toString?.() ?? "",
          floor: (data.floor ?? "").toString(),
          description: data.description ?? "",
          highlights: data.highlights ?? "",
          bestFor: data.bestFor ?? "",
          atmosphere: data.atmosphere ?? "",
          image: data.image ?? "",
          isLocal: false,
          _base64: null,
        });
      } catch (err) {
        console.error(err);
        Alert.alert("โหลดข้อมูลไม่สำเร็จ");
        router.back();
      }
    };
    if (id) fetchRoom();
  }, [id]);

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.8,
      base64: true,
    });
    if (!result.canceled) {
      const asset = result.assets[0];
      setRoom((s) => ({
        ...s,
        image: asset.uri, 
        _base64: asset.base64 || null,
        isLocal: true,
      }));
    }
  };

  const uploadToCloudinary = async (localUri, base64Opt) => {
    const form = new FormData();
    form.append("upload_preset", UPLOAD_PRESET);

    if (base64Opt) {
      form.append("file", `data:image/jpeg;base64,${base64Opt}`);
    } else if (localUri) {
      if (Platform.OS === "web") {
        const res = await fetch(localUri);
        if (!res.ok) throw new Error(`อ่านไฟล์จาก uri ไม่ได้: ${res.status}`);
        const blob = await res.blob();
        const name =
          (localUri.split("/").pop() || `room_${Date.now()}`) + guessExt(blob.type);
        form.append("file", blob, name);
      } else {
        form.append("file", {
          uri: localUri,
          name: "room.jpg",
          type: "image/jpeg",
        });
      }
    } else {
      throw new Error("ไม่มีรูปสำหรับอัปโหลด");
    }

    const res = await fetch(
      `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`,
      { method: "POST", body: form }
    );
    const json = await res.json();
    if (!res.ok || !json?.secure_url) {
      throw new Error(json?.error?.message || `Upload failed: ${res.status}`);
    }
    return json.secure_url;
  };

  function guessExt(mime = "") {
    if (mime.includes("png")) return ".png";
    if (mime.includes("webp")) return ".webp";
    if (mime.includes("gif")) return ".gif";
    return ".jpg";
  }

  const validate = () => {
    if (
      !room.name.trim() ||
      !room.code.trim() ||
      !room.capacityMin.trim() ||
      !room.capacityMax.trim()
    ) {
      Alert.alert("ข้อมูลไม่ครบ", "กรุณากรอกชื่อห้อง, รหัสห้อง และความจุ (ขั้นต่ำ/สูงสุด)");
      return false;
    }
    const min = Number(room.capacityMin);
    const max = Number(room.capacityMax);
    if (Number.isNaN(min) || Number.isNaN(max)) {
      Alert.alert("รูปแบบไม่ถูกต้อง", "จำนวนความจุต้องเป็นตัวเลข");
      return false;
    }
    if (min > max) {
      Alert.alert("ผิดพลาด", "จำนวนขั้นต่ำต้องน้อยกว่าหรือเท่ากับจำนวนสูงสุด");
      return false;
    }
    return true;
  };

  const handleSave = async () => {
    if (!room || !validate()) return;

    try {
      setLoading(true);

      let imageUrl = room.image || "";
      if (room.isLocal && room.image) {
        imageUrl = await uploadToCloudinary(room.image, room._base64);
      }

      await updateDoc(doc(db, "rooms", String(id)), {
        name: room.name.trim(),
        code: room.code.trim(),
        capacityMin: Number(room.capacityMin),
        capacityMax: Number(room.capacityMax),
        floor: room.floor?.toString?.().trim() || "",
        description: room.description.trim(),
        highlights: room.highlights.trim(),
        bestFor: room.bestFor.trim(),
        atmosphere: room.atmosphere.trim(),
        image: imageUrl,
        updatedAt: serverTimestamp(),
      });

      Alert.alert("สำเร็จ", "แก้ไขห้องเรียบร้อย 🎉");
      router.back();
    } catch (err) {
      console.error("update room error:", err);
      Alert.alert("ผิดพลาด", err?.message || "ไม่สามารถบันทึกการแก้ไขได้");
    } finally {
      setLoading(false);
    }
  };

  if (!room) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <Text>Loading...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Edit Room</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView contentContainerStyle={styles.body} keyboardShouldPersistTaps="handled">
        {/* Upload */}
        <TouchableOpacity style={styles.imagePicker} onPress={pickImage}>
          {room.image ? (
            <Image source={{ uri: room.image }} style={styles.roomImage} />
          ) : (
            <View style={styles.placeholder}>
              <Ionicons name="camera-outline" size={40} color="#8c8c8c" />
              <Text style={{ color: "#9aa0a6", marginTop: 6 }}>Add Room Image</Text>
            </View>
          )}
        </TouchableOpacity>

        {/* ฟอร์ม */}
        <TextInput
          style={styles.input}
          placeholder="Room Name"
          placeholderTextColor="#9aa0a6"
          underlineColorAndroid="transparent"
          value={room.name}
          onChangeText={(t) => setRoom((s) => ({ ...s, name: t }))}
          returnKeyType="next"
        />
        <TextInput
          style={styles.input}
          placeholder="Room Code (เช่น A-203)"
          placeholderTextColor="#9aa0a6"
          underlineColorAndroid="transparent"
          value={room.code}
          onChangeText={(t) => setRoom((s) => ({ ...s, code: t }))}
          autoCapitalize="characters"
          returnKeyType="next"
        />

        {/* ความจุ: min/max */}
        <View style={styles.row}>
          <TextInput
            style={[styles.input, styles.half]}
            placeholder="จำนวนขั้นต่ำ"
            placeholderTextColor="#9aa0a6"
            underlineColorAndroid="transparent"
            value={room.capacityMin}
            onChangeText={(t) => setRoom((s) => ({ ...s, capacityMin: t }))}
            keyboardType="number-pad"
            inputMode="numeric"
            textAlign="center"
            returnKeyType="next"
          />
          <TextInput
            style={[styles.input, styles.half]}
            placeholder="จำนวนสูงสุด"
            placeholderTextColor="#9aa0a6"
            underlineColorAndroid="transparent"
            value={room.capacityMax}
            onChangeText={(t) => setRoom((s) => ({ ...s, capacityMax: t }))}
            keyboardType="number-pad"
            inputMode="numeric"
            textAlign="center"
            returnKeyType="next"
          />
        </View>

        <TextInput
          style={styles.input}
          placeholder="Floor (เช่น 2)"
          placeholderTextColor="#9aa0a6"
          underlineColorAndroid="transparent"
          value={room.floor}
          onChangeText={(t) => setRoom((s) => ({ ...s, floor: t }))}
          keyboardType="number-pad"
          inputMode="numeric"
          returnKeyType="next"
        />

        <TextInput
          style={[styles.input, styles.textarea]}
          placeholder="Description (รายละเอียดห้อง)"
          placeholderTextColor="#9aa0a6"
          underlineColorAndroid="transparent"
          value={room.description}
          onChangeText={(t) => setRoom((s) => ({ ...s, description: t }))}
          multiline
        />
        <TextInput
          style={[styles.input, styles.textarea]}
          placeholder="Highlights (จุดเด่น)"
          placeholderTextColor="#9aa0a6"
          underlineColorAndroid="transparent"
          value={room.highlights}
          onChangeText={(t) => setRoom((s) => ({ ...s, highlights: t }))}
          multiline
        />
        <TextInput
          style={[styles.input, styles.textarea]}
          placeholder="Best for (เหมาะสำหรับ)"
          placeholderTextColor="#9aa0a6"
          underlineColorAndroid="transparent"
          value={room.bestFor}
          onChangeText={(t) => setRoom((s) => ({ ...s, bestFor: t }))}
          multiline
        />
        <TextInput
          style={[styles.input, styles.textarea]}
          placeholder="Atmosphere (บรรยากาศ)"
          placeholderTextColor="#9aa0a6"
          underlineColorAndroid="transparent"
          value={room.atmosphere}
          onChangeText={(t) => setRoom((s) => ({ ...s, atmosphere: t }))}
          multiline
        />

        <TouchableOpacity style={styles.saveBtn} onPress={handleSave} disabled={loading}>
          <Text style={styles.saveText}>{loading ? "Saving..." : "Save Changes"}</Text>
        </TouchableOpacity>
        <View style={{ height: 16 }} />
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
    borderBottomLeftRadius: 16,
    borderBottomRightRadius: 16,
  },
  headerTitle: { fontSize: 20, fontWeight: "bold", color: "#fff", marginBottom: 5 },
  body: { padding: 20, paddingBottom: 24 },
  imagePicker: {
    width: "100%",
    height: 180,
    borderRadius: 12,
    backgroundColor: "#f3f4f6",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "#e5e7eb",
  },
  roomImage: { width: "100%", height: "100%", resizeMode: "cover" },
  placeholder: { justifyContent: "center", alignItems: "center" },
  input: {
    backgroundColor: "#f6f7f9",
    borderRadius: 10,
    paddingHorizontal: 12,
    height: 45,
    marginBottom: 12,
    fontSize: 14,
    borderWidth: 1,
    borderColor: "#e5e7eb",
    color: "#111827",
    minWidth: 0,
  },
  textarea: { height: 80, paddingTop: 10, textAlignVertical: "top" },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
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
