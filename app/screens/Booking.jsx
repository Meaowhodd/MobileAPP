// BookingForm.jsx
import { Ionicons } from "@expo/vector-icons";
import { useState } from "react";
import {
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { Calendar } from "react-native-calendars";
import {
  Button,
  Checkbox,
  Chip,
  List,
  Modal,
  Portal,
  Provider,
  TextInput,
} from "react-native-paper";

import {
  addDoc,
  collection,
  serverTimestamp,
  Timestamp,
} from "firebase/firestore";
import { auth, db } from "../../firebaseConfig";

const ACCESSORY_OPTIONS = ["ทีวี", "โปรเจกเตอร์", "ไมค์", "ลำโพง", "ไวท์บอร์ด", "สาย HDMI"];

// สลอตเวลา 4 ช่องตามภาพ + map เป็น slotId S1..S4
const SLOT_DEFS = [
  { id: "S1", label: "08.00-10.00", start: 8, end: 10, available: true },
  { id: "S2", label: "10.00-12.00", start: 10, end: 12, available: false },
  { id: "S3", label: "13.00-15.00", start: 13, end: 15, available: false },
  { id: "S4", label: "15.00-17.00", start: 15, end: 17, available: true },
];

function SlotButton({ label, available, selected, onPress }) {
  return (
    <TouchableOpacity
      activeOpacity={0.9}
      onPress={onPress}
      style={[
        styles.slotBtn,
        !available && styles.slotBtnDisabled,
        selected && styles.slotBtnSelected,
      ]}
      disabled={!available}
    >
      <View style={styles.dotRow}>
        <View
          style={[
            styles.dot,
            { backgroundColor: available ? "#22c55e" : "#ef4444" },
          ]}
        />
        <Text
          style={[
            styles.slotText,
            !available && { color: "#9ca3af" },
            selected && { color: "#111827", fontWeight: "700" },
          ]}
        >
          {label}
        </Text>
      </View>
    </TouchableOpacity>
  );
}

export default function BookingForm() {
  const [name, setName] = useState("Jafer Adviar");
  const [room, setRoom] = useState("A-001");
  const [number, setNumber] = useState("");

  // วันที่
  const [dateObj, setDateObj] = useState(new Date());
  const [showDate, setShowDate] = useState(false);

  // สลอตที่เลือก (เก็บทั้งอ็อบเจ็กต์)
  const [slot, setSlot] = useState(null);

  // Accessories
  const [accessories, setAccessories] = useState([]);
  const [accModalVisible, setAccModalVisible] = useState(false);

  // helper
  const formatDate = (d) =>
    d.toLocaleDateString("th-TH", { day: "2-digit", month: "long", year: "numeric" });

  // calendar helpers
  const toYMD = (d) => {
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    return `${y}-${m}-${day}`;
  };
  const selectedYMD = toYMD(dateObj);

  const handleCalendarPick = (day) => {
    const [y, m, d] = day.dateString.split("-").map((x) => parseInt(x, 10));
    const newDate = new Date(dateObj);
    newDate.setFullYear(y, m - 1, d);
    newDate.setHours(0, 0, 0, 0);
    setDateObj(newDate);
    setShowDate(false);
  };

  // เลือกสลอต
  const chooseSlot = (s) => {
    if (!s.available) return;
    setSlot(s);
  };

  // Firestore: บันทึกการจองให้ตรง rules
  const onConfirm = async () => {
    // ตรวจฟอร์ม
    if (!name.trim() || !room.trim() || !number.trim() || !slot) {
      Alert.alert("กรอกไม่ครบ", "กรุณากรอกข้อมูลและเลือกช่วงเวลาให้ครบ");
      return;
    }

    const uid = auth.currentUser?.uid;
    if (!uid) {
      Alert.alert("ยังไม่ได้เข้าสู่ระบบ", "โปรดเข้าสู่ระบบก่อนทำรายการ");
      return;
    }

    // ตรวจช่วงเวลา: ภายใน 7 วันนับจากปัจจุบัน + ไม่ย้อนหลัง (ตาม rules)
    const startDate = new Date(dateObj);
    startDate.setHours(slot.start, 0, 0, 0);
    const endDate = new Date(dateObj);
    endDate.setHours(slot.end, 0, 0, 0);

    const now = new Date();
    const sevenDaysLater = new Date(now);
    sevenDaysLater.setDate(now.getDate() + 7);

    if (startDate < now) {
      Alert.alert("เลือกเวลาไม่ถูกต้อง", "ห้ามย้อนหลังจากเวลาปัจจุบัน");
      return;
    }
    if (startDate > sevenDaysLater) {
      Alert.alert("เกินช่วงที่กำหนด", "จองล่วงหน้าได้ไม่เกิน 7 วัน");
      return;
    }

    try {
      await addDoc(collection(db, "bookings"), {
        userId: uid,
        roomId: room, // ถ้ามี roomId จริงในฐาน ให้เปลี่ยนจากรหัสห้องเป็น id
        slotId: slot.id, // "S1"..."S4"
        slotStart: Timestamp.fromDate(startDate),
        slotEnd: Timestamp.fromDate(endDate),
        name,
        people: Number(number),
        accessories,
        status: "pending",
        createdAt: serverTimestamp(),
      });

      Alert.alert("จองสำเร็จ", `${room} • ${formatDate(dateObj)} • ${slot.label}`);
      // รีเซ็ตบางส่วนถ้าต้องการ
      // setSlot(null);
    } catch (e) {
      console.error("create booking error:", e);
      Alert.alert("จองไม่สำเร็จ", "ลองใหม่อีกครั้งหรือตรวจสิทธิ์ใน Firestore Rules");
    }
  };

  return (
    <Provider>
      {/* Header */}
      <View style={styles.headerWrap}>
        <View style={styles.headerRow}>
          <TouchableOpacity onPress={() => {}}>
            <Ionicons name="arrow-back" size={26} color="#fff" />
          </TouchableOpacity>

          <Text style={styles.headerTitle}>Booking Form</Text>

          <View style={styles.rightButtons}>
            <TouchableOpacity style={{ marginRight: 16 }}>
              <Ionicons name="notifications-outline" size={24} color="#fff" />
            </TouchableOpacity>
            <TouchableOpacity>
              <View style={styles.profileDot} />
            </TouchableOpacity>
          </View>
        </View>
      </View>

      <ScrollView style={styles.container} keyboardShouldPersistTaps="handled">
        {/* Name */}
        <TextInput label="Name" value={name} onChangeText={setName} style={styles.input} mode="outlined" />

        {/* Room */}
        <TextInput
          label="Room"
          value={room}
          onChangeText={setRoom}
          style={styles.input}
          mode="outlined"
          right={<TextInput.Icon icon="chevron-down" />}
        />

        {/* Number */}
        <TextInput
          label="Number"
          placeholder="Number of people"
          value={number}
          onChangeText={(t) => /^\d*$/.test(t) && setNumber(t)}
          style={styles.input}
          mode="outlined"
          keyboardType="numeric"
        />

        {/* Date */}
        <Pressable onPress={() => setShowDate(true)}>
          <TextInput
            label="Date"
            value={formatDate(dateObj)}
            style={[styles.input, styles.dateField]}
            mode="outlined"
            editable={false}
            right={<TextInput.Icon icon="calendar" onPress={() => setShowDate(true)} forceTextInputFocus={false} />}
          />
        </Pressable>

        {/* Modal ปฏิทิน */}
        <Portal>
          <Modal
            visible={showDate}
            onDismiss={() => setShowDate(false)}
            contentContainerStyle={{ margin: 16, backgroundColor: "white", borderRadius: 16, padding: 6 }}
          >
            <Calendar
              initialDate={toYMD(dateObj)}
              onDayPress={(day) => {
                handleCalendarPick(day);
              }}
              markedDates={{
                [toYMD(dateObj)]: { selected: true, disableTouchEvent: true, selectedDotColor: "orange" },
              }}
              enableSwipeMonths
            />
            <View style={{ height: 8 }} />
            <Button mode="text" onPress={() => setShowDate(false)}>ปิด</Button>
          </Modal>
        </Portal>

        {/* Time Slots (2 คอลัมน์เหมือนภาพ) */}
        <View style={styles.slotGrid}>
          {SLOT_DEFS.map((s) => (
            <SlotButton
              key={s.id}
              label={s.label}
              available={s.available}
              selected={slot?.id === s.id}
              onPress={() => chooseSlot(s)}
            />
          ))}
        </View>

        {/* Accessories */}
        <Pressable onPress={() => setAccModalVisible(true)}>
          <TextInput
            label="Accessories"
            placeholder="Choose accessories"
            value={accessories.join(", ")}
            style={styles.input}
            mode="outlined"
            editable={false}
            right={<TextInput.Icon icon="chevron-down" onPress={() => setAccModalVisible(true)} />}
          />
        </Pressable>

        <View style={styles.chipsWrap}>
          {accessories.map((acc) => (
            <Chip key={acc} onClose={() => setAccessories((p) => p.filter((x) => x !== acc))} style={styles.chip}>
              {acc}
            </Chip>
          ))}
        </View>

        <Portal>
          <Modal visible={accModalVisible} onDismiss={() => setAccModalVisible(false)} contentContainerStyle={styles.modalBox}>
            <List.Section>
              <List.Subheader>เลือกอุปกรณ์ (เลือกได้หลายอย่าง)</List.Subheader>
              {ACCESSORY_OPTIONS.map((item) => (
                <List.Item
                  key={item}
                  title={item}
                  onPress={() =>
                    setAccessories((prev) =>
                      prev.includes(item) ? prev.filter((x) => x !== item) : [...prev, item]
                    )
                  }
                  right={() => <Checkbox status={accessories.includes(item) ? "checked" : "unchecked"} />}
                />
              ))}
            </List.Section>

            <View style={styles.modalButtons}>
              <Button mode="text" onPress={() => setAccessories([])}>ล้างทั้งหมด</Button>
              <Button mode="contained" onPress={() => setAccModalVisible(false)}>เสร็จสิ้น</Button>
            </View>
          </Modal>
        </Portal>

        {/* ปุ่มล่าง */}
        <View style={styles.buttonRow}>
          <Button mode="outlined" style={styles.cancelButton} onPress={() => {}}>Cancel</Button>
          <Button mode="contained" style={styles.confirmButton} onPress={onConfirm}>Confirm</Button>
        </View>
      </ScrollView>
    </Provider>
  );
}

const PRIMARY = "#6C63FF";

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: "#fff" },
  input: { marginBottom: 16 },
  dateField: { backgroundColor: "#f7ffed", borderColor: "#d9f99d" },

  // Header
  headerWrap: {
    backgroundColor: PRIMARY,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    paddingTop: 50,
    paddingBottom: 20,
    paddingHorizontal: 16,
  },
  headerRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", position: "relative" },
  headerTitle: { position: "absolute", left: 0, right: 0, textAlign: "center", color: "#fff", fontWeight: "bold", fontSize: 20 },
  rightButtons: { flexDirection: "row", alignItems: "center" },
  profileDot: { width: 26, height: 26, borderRadius: 13, backgroundColor: "#ddd" },

  // Slots
  slotGrid: { flexDirection: "row", flexWrap: "wrap", gap: 12, marginBottom: 8 },
  slotBtn: {
    width: "47%",
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#e5e7eb",
    paddingVertical: 14,
    paddingHorizontal: 12,
    backgroundColor: "#fff",
  },
  slotBtnDisabled: { backgroundColor: "#fafafa" },
  slotBtnSelected: { borderColor: PRIMARY, backgroundColor: "#eef2ff" },
  dotRow: { flexDirection: "row", alignItems: "center", justifyContent: "center" },
  dot: { width: 8, height: 8, borderRadius: 4, marginRight: 8 },
  slotText: { color: "#1f2937", fontWeight: "600" },

  // Accessories modal
  chipsWrap: { flexDirection: "row", flexWrap: "wrap", gap: 8, marginBottom: 8 },
  chip: { marginRight: 6, marginBottom: 6 },
  modalBox: { marginHorizontal: 16, backgroundColor: "white", padding: 16, borderRadius: 16 },
  modalButtons: { flexDirection: "row", justifyContent: "space-between", marginTop: 8 },

  // Footer buttons
  buttonRow: { flexDirection: "row", justifyContent: "space-between", marginTop: 8, marginBottom: 24 },
  cancelButton: { flex: 1, marginRight: 10, borderColor: "#d1d5db" },
  confirmButton: { flex: 1, marginLeft: 10, backgroundColor: PRIMARY },
});
