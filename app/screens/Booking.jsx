// app/screens/BookingForm.jsx
import { Ionicons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import {
  addDoc,
  collection,
  doc,
  onSnapshot,
  query,
  serverTimestamp,
  Timestamp,
  where,
} from "firebase/firestore";
import { useEffect, useMemo, useState } from "react";
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
import { auth, db } from "../../firebaseConfig";

const COLOR = {
  primary: "#6A5AE0",
  border: "#D7D9E0",
  text: "#111827",
  muted: "#6B7280",
  cancelBg: "#E8E9F0",
  slotSelBg: "#F3F0FF",
  green: "#22C55E",
  red: "#EF4444",
  white: "#FFFFFF",
};

const BASE_SLOTS = [
  { id: "S1", label: "08.00-10.00", start: 8, end: 10 },
  { id: "S2", label: "10.00-12.00", start: 10, end: 12 },
  { id: "S3", label: "13.00-15.00", start: 13, end: 15 },
  { id: "S4", label: "15.00-17.00", start: 15, end: 17 },
];

const ACCESSORY_OPTIONS = ["ทีวี", "โปรเจกเตอร์", "ไมค์", "ลำโพง", "ไวท์บอร์ด", "สาย HDMI"];

const inputColors = (hasValue) => ({
  outlineColor: hasValue ? COLOR.text : COLOR.border,
  activeOutlineColor: hasValue ? COLOR.text : COLOR.primary,
  textColor: COLOR.text,
});

function SlotButton({ label, available, selected, onPress }) {
  return (
    <TouchableOpacity
      activeOpacity={0.9}
      onPress={onPress}
      disabled={!available}
      style={[
        styles.slotBtn,
        !available && styles.slotBtnDisabled,
        selected && styles.slotBtnSelected,
      ]}
    >
      <View style={styles.slotInner}>
        <View
          style={[
            styles.dot,
            { backgroundColor: available ? COLOR.green : COLOR.red },
          ]}
        />
        <Text
          style={[
            styles.slotText,
            !available && { color: "#9CA3AF" },
            selected && { color: COLOR.text, fontWeight: "700" },
          ]}
        >
          {label}
        </Text>
      </View>
    </TouchableOpacity>
  );
}

export default function BookingForm() {
  const params = useLocalSearchParams();

  const [roomId, setRoomId] = useState("");
  const [roomName, setRoomName] = useState("");
  const [roomCode, setRoomCode] = useState("");
  const [capacityMin, setCapacityMin] = useState(null);
  const [capacityMax, setCapacityMax] = useState(null);

  const [dateObj, setDateObj] = useState(new Date());
  const [showDate, setShowDate] = useState(false);

  const [bookedSlots, setBookedSlots] = useState(new Set()); // <-- สลอตที่ถูกจองของวันนั้นๆ
  const [slot, setSlot] = useState(null);

  const [accessories, setAccessories] = useState([]);
  const [accModalVisible, setAccModalVisible] = useState(false);

  // รับค่าจาก RoomDetail
  useEffect(() => {
    if (params?.roomId) setRoomId(String(params.roomId));
    if (params?.roomName) setRoomName(String(params.roomName));
    if (params?.roomCode) setRoomCode(String(params.roomCode));
    if (params?.capacityMin) setCapacityMin(Number(params.capacityMin));
    if (params?.capacityMax) setCapacityMax(Number(params.capacityMax));
  }, [params]);

  // เติมข้อมูลห้องจาก Firestore (เผื่อกดเข้ามาจากที่อื่น)
  useEffect(() => {
    if (!roomId) return;
    const ref = doc(db, "rooms", roomId);
    const unsub = onSnapshot(
      ref,
      (snap) => {
        if (!snap.exists()) return;
        const d = snap.data();
        if (!roomName && d.name) setRoomName(d.name);
        if (!roomCode && d.code) setRoomCode(d.code);
        if (capacityMin == null && typeof d.capacityMin === "number") setCapacityMin(d.capacityMin);
        if (capacityMax == null && typeof d.capacityMax === "number") setCapacityMax(d.capacityMax);
      },
      (err) => console.error("rooms doc onSnapshot:", err)
    );
    return unsub;
  }, [roomId]);

  // อ่านการจองของ "ห้องนี้" ใน "วันที่เลือก" เพื่อบอกว่าสลอตไหนไม่ว่าง
  useEffect(() => {
    if (!roomId || !dateObj) return;

    const start = new Date(dateObj);
    start.setHours(0, 0, 0, 0);
    const end = new Date(dateObj);
    end.setHours(23, 59, 59, 999);

    const q = query(
      collection(db, "bookings"),
      where("roomId", "==", roomId),
      where("slotStart", ">=", Timestamp.fromDate(start)),
      where("slotStart", "<=", Timestamp.fromDate(end))
    );

    const unsub = onSnapshot(
      q,
      (snap) => {
        const taken = new Set();
        snap.docs.forEach((d) => {
          const data = d.data();
          if (data?.slotId) taken.add(String(data.slotId));
        });
        setBookedSlots(taken);
        // ถ้าสลอตที่เลือกถูกจองระหว่างรอ realtime -> เคลียร์
        setSlot((s) => (s && taken.has(s.id) ? null : s));
      },
      (err) => console.error("bookings onSnapshot:", err)
    );

    return unsub;
  }, [roomId, dateObj]);

  // slot list พร้อม availability จาก Firestore
  const slots = useMemo(
    () => BASE_SLOTS.map((s) => ({ ...s, available: !bookedSlots.has(s.id) })),
    [bookedSlots]
  );

  const formatDate = (d) =>
    d.toLocaleDateString("th-TH", { day: "2-digit", month: "long", year: "numeric" });

  const toYMD = (d) => {
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    return `${y}-${m}-${day}`;
  };

  const onPickCalendar = (day) => {
    const [y, m, dd] = day.dateString.split("-").map((x) => parseInt(x, 10));
    const newDate = new Date(dateObj);
    newDate.setFullYear(y, m - 1, dd);
    newDate.setHours(0, 0, 0, 0);
    setDateObj(newDate);
    setShowDate(false);
  };

  const chooseSlot = (s) => s.available && setSlot(s);

  const capacityDisplay = useMemo(() => {
    if (capacityMin == null && capacityMax == null) return "";
    if (capacityMin != null && capacityMax != null) return `${capacityMin} - ${capacityMax}`;
    if (capacityMin != null) return String(capacityMin);
    return String(capacityMax);
  }, [capacityMin, capacityMax]);

  const onConfirm = async () => {
    if (!roomName || !roomCode || capacityMin == null || capacityMax == null || !slot) {
      Alert.alert("กรอกไม่ครบ", "ข้อมูลห้อง/ความจุ/ช่วงเวลายังไม่ครบ");
      return;
    }
    const uid = auth.currentUser?.uid;
    if (!uid) {
      Alert.alert("ยังไม่ได้เข้าสู่ระบบ", "โปรดเข้าสู่ระบบก่อนทำรายการ");
      return;
    }

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
    if (bookedSlots.has(slot.id)) {
      Alert.alert("สลอตไม่ว่าง", "ช่วงเวลานี้มีคนจองแล้ว");
      return;
    }

    try {
      await addDoc(collection(db, "bookings"), {
        userId: uid,
        roomId: roomId || null,
        roomName,
        roomCode,
        capacityMin,
        capacityMax,
        slotId: slot.id,
        slotStart: Timestamp.fromDate(startDate),
        slotEnd: Timestamp.fromDate(endDate),
        accessories,
        status: "pending",
        createdAt: serverTimestamp(),
      });
      Alert.alert("จองสำเร็จ", `${roomName} (${roomCode}) • ${formatDate(dateObj)} • ${slot.label}`);
      router.back();
    } catch (e) {
      console.error("create booking error:", e);
      Alert.alert("จองไม่สำเร็จ", "ลองใหม่อีกครั้งหรือตรวจสิทธิ์ใน Firestore Rules");
    }
  };

  // เลือกอุปกรณ์แบบจำกัดสูงสุด 3 ชิ้น
  const toggleAccessory = (item) => {
    setAccessories((prev) => {
      if (prev.includes(item)) return prev.filter((x) => x !== item);
      if (prev.length >= 3) {
        Alert.alert("เลือกได้สูงสุด 3", "คุณเลือกอุปกรณ์ได้สูงสุด 3 รายการ");
        return prev;
      }
      return [...prev, item];
    });
  };

  return (
    <Provider>
      <View style={styles.headerWrap}>
        <View style={styles.headerRow}>
          <TouchableOpacity onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={20} color={COLOR.white} />
          </TouchableOpacity>

          <Text style={styles.headerTitle}>Booking Form</Text>

          <View style={styles.rightButtons}>
            <TouchableOpacity style={{ marginRight: 14 }}>
              <Ionicons name="notifications-outline" size={18} color={COLOR.white} />
            </TouchableOpacity>
            <View style={styles.profileDot} />
          </View>
        </View>
      </View>

      <ScrollView style={styles.container} keyboardShouldPersistTaps="handled">
        <TextInput
          label="Name"
          value={roomName}
          mode="outlined"
          editable={false}
          style={styles.input}
          outlineColor={inputColors(!!roomName).outlineColor}
          activeOutlineColor={inputColors(!!roomName).activeOutlineColor}
          textColor={inputColors(!!roomName).textColor}
        />

        <TextInput
          label="Room"
          value={roomCode}
          mode="outlined"
          editable={false}
          style={styles.input}
          outlineColor={inputColors(!!roomCode).outlineColor}
          activeOutlineColor={inputColors(!!roomCode).activeOutlineColor}
          textColor={inputColors(!!roomCode).textColor}
        />

        <TextInput
          label="Number"
          value={capacityDisplay}
          mode="outlined"
          editable={false}
          style={styles.input}
          outlineColor={inputColors(!!capacityDisplay).outlineColor}
          activeOutlineColor={inputColors(!!capacityDisplay).activeOutlineColor}
          textColor={inputColors(!!capacityDisplay).textColor}
        />

        <Pressable onPress={() => setShowDate(true)}>
          <TextInput
            label="Date"
            value={formatDate(dateObj)}
            mode="outlined"
            editable={false}
            style={styles.input}
            outlineColor={inputColors(true).outlineColor}
            activeOutlineColor={inputColors(true).activeOutlineColor}
            textColor={COLOR.text}
            right={<TextInput.Icon icon="chevron-down" onPress={() => setShowDate(true)} color={COLOR.text} />}
          />
        </Pressable>

        <Portal>
          <Modal visible={showDate} onDismiss={() => setShowDate(false)} contentContainerStyle={styles.modalBox}>
            <Calendar
              initialDate={toYMD(dateObj)}
              onDayPress={onPickCalendar}
              markedDates={{ [toYMD(dateObj)]: { selected: true, disableTouchEvent: true } }}
              enableSwipeMonths
              theme={{
                selectedDayBackgroundColor: COLOR.primary,
                todayTextColor: COLOR.primary,
                arrowColor: COLOR.primary,
              }}
            />
            <View style={{ height: 8 }} />
            <Button mode="text" onPress={() => setShowDate(false)} textColor={COLOR.primary}>
              Close
            </Button>
          </Modal>
        </Portal>

        {/* Time Slots */}
        <View style={styles.slotGrid}>
          {slots.map((s) => (
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
            mode="outlined"
            editable={false}
            style={styles.input}
            outlineColor={COLOR.border}
            activeOutlineColor={COLOR.primary}
            textColor={accessories.length ? COLOR.text : undefined}
            right={<TextInput.Icon icon="chevron-down" onPress={() => setAccModalVisible(true)} color={COLOR.text} />}
          />
        </Pressable>

        <View style={styles.chipsWrap}>
          {accessories.map((acc) => (
            <Chip key={acc} onClose={() => setAccessories((p) => p.filter((x) => x !== acc))} style={styles.chip} textStyle={{ color: COLOR.text }}>
              {acc}
            </Chip>
          ))}
        </View>

        <Portal>
          <Modal visible={accModalVisible} onDismiss={() => setAccModalVisible(false)} contentContainerStyle={styles.modalBox}>
            <List.Section>
              <List.Subheader style={{ color: COLOR.text }}>
                เลือกอุปกรณ์ (เลือกได้หลายอย่าง สูงสุด 3)
              </List.Subheader>

              {ACCESSORY_OPTIONS.map((item) => {
                const checked = accessories.includes(item);
                return (
                  <List.Item
                    key={item}
                    title={item}
                    titleStyle={{ color: COLOR.text }}
                    onPress={() => toggleAccessory(item)}
                    right={() => (
                      <Checkbox
                        status={checked ? "checked" : "unchecked"}
                        color={COLOR.text}
                        uncheckedColor={COLOR.text}
                        onPress={() => toggleAccessory(item)}
                      />
                    )}
                  />
                );
              })}
            </List.Section>

            <View style={styles.modalButtons}>
              <Button mode="text" onPress={() => setAccessories([])} textColor={COLOR.text}>
                Clear
              </Button>
              <Button mode="contained" onPress={() => setAccModalVisible(false)} buttonColor={COLOR.primary} textColor={COLOR.white}>
                Done
              </Button>
            </View>
          </Modal>
        </Portal>

        {/* Bottom */}
        <View style={styles.footerRow}>
          <TouchableOpacity style={styles.pillCancel} onPress={() => router.back()}>
            <Text style={styles.pillCancelText}>Cancel</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.pillConfirm} onPress={onConfirm}>
            <Text style={styles.pillConfirmText}>Confirm</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </Provider>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: COLOR.white },

  headerWrap: {
    backgroundColor: COLOR.primary,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    paddingTop: 48,
    paddingBottom: 14,
    paddingHorizontal: 16,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    position: "relative",
  },
  headerTitle: {
    position: "absolute",
    left: 0,
    right: 0,
    textAlign: "center",
    color: COLOR.white,
    fontWeight: "bold",
    fontSize: 20,
  },
  rightButtons: { flexDirection: "row", alignItems: "center" },
  profileDot: { width: 20, height: 20, borderRadius: 10, backgroundColor: "#e9e9ef" },

  input: { marginBottom: 14, backgroundColor: COLOR.white },

  slotGrid: { flexDirection: "row", flexWrap: "wrap", gap: 12, marginTop: 4, marginBottom: 8 },
  slotBtn: {
    width: "47%",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLOR.border,
    backgroundColor: COLOR.white,
  },
  slotInner: {
    paddingVertical: 13,
    paddingHorizontal: 12,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
  },
  slotBtnDisabled: { backgroundColor: "#FAFAFA" },
  slotBtnSelected: { borderColor: COLOR.primary, backgroundColor: COLOR.slotSelBg },
  dot: { width: 8, height: 8, borderRadius: 4, marginRight: 8 },
  slotText: { color: COLOR.text, fontWeight: "600" },

  chipsWrap: { flexDirection: "row", flexWrap: "wrap", gap: 8, marginBottom: 8 },
  chip: { marginRight: 6, marginBottom: 6 },

  modalBox: { marginHorizontal: 16, backgroundColor: COLOR.white, padding: 16, borderRadius: 16 },
  modalButtons: { flexDirection: "row", justifyContent: "space-between", marginTop: 8 },

  footerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 8,
    marginBottom: 24,
  },
  pillCancel: {
    flex: 1,
    marginRight: 10,
    height: 44,
    borderRadius: 22,
    backgroundColor: COLOR.cancelBg,
    alignItems: "center",
    justifyContent: "center",
  },
  pillCancelText: { color: COLOR.text, fontSize: 16, fontWeight: "600" },
  pillConfirm: {
    flex: 1,
    marginLeft: 10,
    height: 44,
    borderRadius: 22,
    backgroundColor: COLOR.primary,
    alignItems: "center",
    justifyContent: "center",
  },
  pillConfirmText: { color: COLOR.white, fontSize: 16, fontWeight: "700" },
});
