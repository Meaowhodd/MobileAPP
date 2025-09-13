// app/screens/Booking.jsx
import { Ionicons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import { useState } from "react";
import { Alert, SafeAreaView, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";

const PRIMARY = "#1f66f2";

export default function BookingScreen() {
  const { id, name, code, people, floor } = useLocalSearchParams();
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [purpose, setPurpose] = useState("");

  const onConfirm = () => {
    if (!date || !time) {
      Alert.alert("กรอกไม่ครบ", "โปรดใส่วันที่และเวลา");
      return;
    }
    Alert.alert(
      "จองสำเร็จ",
      `ห้อง: ${name || code}\nวันที่: ${date}\nเวลา: ${time}\nวัตถุประสงค์: ${purpose || "-"}`
    );
    router.back();
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#fff" }}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={{ padding: 6 }}>
          <Ionicons name="arrow-back" size={22} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Booking</Text>
        <View style={{ width: 28 }} />
      </View>

      {/* Room summary */}
      <View style={styles.card}>
        <Text style={styles.roomName}>{name || "Meeting Room"}</Text>
        <Text style={styles.meta}>Code : {code}</Text>
        <Text style={styles.meta}>People : {people}</Text>
        <Text style={styles.meta}>Floor : {floor}</Text>
      </View>

      {/* Form */}
      <View style={{ paddingHorizontal: 16 }}>
        <Text style={styles.label}>วันที่ (เช่น 2025-09-15)</Text>
        <TextInput
          placeholder="YYYY-MM-DD"
          value={date}
          onChangeText={setDate}
          style={styles.input}
        />

        <Text style={styles.label}>เวลา (เช่น 13:00-15:00)</Text>
        <TextInput
          placeholder="HH:MM-HH:MM"
          value={time}
          onChangeText={setTime}
          style={styles.input}
        />

        <Text style={styles.label}>วัตถุประสงค์</Text>
        <TextInput
          placeholder="เช่น ประชุมทีม Sprint Planning"
          value={purpose}
          onChangeText={setPurpose}
          style={[styles.input, { height: 80 }]}
          multiline
        />

        <TouchableOpacity style={styles.confirmBtn} onPress={onConfirm}>
          <Text style={{ color: "#fff", fontWeight: "700" }}>ยืนยันการจอง</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.cancelBtn} onPress={() => router.back()}>
          <Text style={{ color: PRIMARY, fontWeight: "700" }}>ยกเลิก</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  header: {
    backgroundColor: PRIMARY,
    paddingHorizontal: 12,
    paddingVertical: 12,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  headerTitle: { color: "#fff", fontSize: 18, fontWeight: "700", flex: 1, textAlign: "center" },

  card: {
    margin: 16,
    padding: 16,
    backgroundColor: "#f5f7ff",
    borderWidth: 1,
    borderRadius: 12,
  },
  roomName: { fontSize: 18, fontWeight: "700", marginBottom: 6 },
  meta: { fontSize: 14, color: "#374151", marginTop: 2 },

  label: { marginTop: 10, marginBottom: 6, fontWeight: "600", color: "#374151" },
  input: {
    borderWidth: 1,
    borderColor: "#d1d5db",
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    backgroundColor: "#fff",
  },

  confirmBtn: {
    backgroundColor: PRIMARY,
    height: 48,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 16,
  },
  cancelBtn: {
    backgroundColor: "#e5efff",
    height: 48,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 10,
    borderWidth: 1,
    borderColor: "#c7d6ff",
  },
});
