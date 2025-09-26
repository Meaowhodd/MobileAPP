// app/screens/BookingForm.js
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

import { createBookingWithLimit } from "../services/bookings";

const COLOR = {
  primary: "#6A5AE0",
  border: "#D7D9E0",
  text: "#111827",
  muted: "#6B7280",
  cancelBg: "#E8E9F0",
  slotSelBg: "#F3F0FF",
  green: "#22C55E",
  red: "#EF4444",
  orange: "#F59E0B",
  white: "#FFFFFF",
  grayDot: "#9CA3AF",
};

const BASE_SLOTS = [
  { id: "S1", label: "08.00-10.00", start: 8, end: 10, available: true, dotColor: COLOR.green },
  { id: "S2", label: "10.00-12.00", start: 10, end: 12, available: true, dotColor: COLOR.green },
  { id: "S3", label: "13.00-15.00", start: 13, end: 15, available: true, dotColor: COLOR.green },
  { id: "S4", label: "15.00-17.00", start: 15, end: 17, available: true, dotColor: COLOR.green },
];

// เลือกอุปกรณ์ได้สูงสุด 3 อย่าง/การจอง
const ACCESSORY_OPTIONS = ["ทีวี", "โปรเจกเตอร์", "ไมค์", "ลำโพง", "ไวท์บอร์ด", "สาย HDMI"];
const MAX_ACCESSORIES = 3;

const inputColors = (hasValue) => ({
  outlineColor: hasValue ? COLOR.text : COLOR.border,
  activeOutlineColor: hasValue ? COLOR.text : COLOR.primary,
  textColor: COLOR.text,
});

function SlotButton({ label, available, selected, onPress, dotColor }) {
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
        <View style={[styles.dot, { backgroundColor: dotColor }]} />
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

const dayRange = (d) => {
  const start = new Date(d.getFullYear(), d.getMonth(), d.getDate(), 0, 0, 0, 0);
  const end = new Date(d.getFullYear(), d.getMonth(), d.getDate(), 23, 59, 59, 999);
  return { startTs: Timestamp.fromDate(start), endTs: Timestamp.fromDate(end) };
};

export default function BookingForm() {
  const params = useLocalSearchParams();

  const [roomId, setRoomId] = useState("");
  const [roomName, setRoomName] = useState("");
  const [roomCode, setRoomCode] = useState("");
  const [capacityMin, setCapacityMin] = useState(null);
  const [capacityMax, setCapacityMax] = useState(null);

  const [dateObj, setDateObj] = useState(new Date());
  const [showDate, setShowDate] = useState(false);

  const [slots, setSlots] = useState(BASE_SLOTS);
  const [slot, setSlot] = useState(null);

  const [accessories, setAccessories] = useState([]);
  const [accModalVisible, setAccModalVisible] = useState(false);

  const [submitting, setSubmitting] = useState(false);

  const userId = auth.currentUser?.uid || null;

  // ▼ นับรวม approved + in_use + pending ที่ยัง active (slotEnd >= now)
  const [activeCount, setActiveCount] = useState(0);
  const reachedLimit = activeCount >= 2;

  // --- ดึงพารามิเตอร์ห้อง ---
  useEffect(() => {
    if (params?.roomId) setRoomId(String(params.roomId));
    if (params?.roomName) setRoomName(String(params.roomName));
    if (params?.roomCode) setRoomCode(String(params.roomCode));
    if (params?.capacityMin) setCapacityMin(Number(params.capacityMin));
    if (params?.capacityMax) setCapacityMax(Number(params.capacityMax));
  }, [params]);

  // --- sync room doc ---
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

  // --- subscribe: active bookings ของผู้ใช้ (รวม pending) ---
  useEffect(() => {
    if (!userId) return;
    const nowTs = Timestamp.fromDate(new Date());
    const qMine = query(
      collection(db, "bookings"),
      where("userId", "==", userId),
      where("status", "in", ["approved", "in_use", "pending"]),
      where("slotEnd", ">=", nowTs) // ยังไม่หมดเวลา
    );
    const unsub = onSnapshot(
      qMine,
      (snap) => setActiveCount(snap.size || 0),
      (err) => console.error("user active bookings onSnapshot:", err)
    );
    return () => unsub();
  }, [userId]);

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

  // อัปเดตสถานะว่าง/ไม่ว่าง + past/gray + pending/orange
  useEffect(() => {
    if (!roomId || !dateObj) return;

    const { startTs, endTs } = dayRange(dateObj);
    const qBusy = query(
      collection(db, "bookings"),
      where("roomId", "==", roomId),
      where("status", "in", ["approved", "in_use", "pending"]),
      where("slotStart", ">=", startTs),
      where("slotStart", "<=", endTs)
    );

    const unsub = onSnapshot(
      qBusy,
      (snap) => {
        const busy = new Set();
        const pendings = new Set();
        snap.forEach((d) => {
          const data = d.data?.() || d.data();
          if (!data?.slotId) return;
          if (data.status === "pending") pendings.add(data.slotId);
          else busy.add(data.slotId);
        });

        const now = new Date();
        const isSameDay =
          now.getFullYear() === dateObj.getFullYear() &&
          now.getMonth() === dateObj.getMonth() &&
          now.getDate() === dateObj.getDate();
        const isPastDay = new Date(dateObj.toDateString()) < new Date(now.toDateString());

        const next = BASE_SLOTS.map((s) => {
          let isPast = false;
          if (isPastDay) isPast = true;
          else if (isSameDay) {
            isPast = now.getHours() >= s.end || (now.getHours() === s.end && now.getMinutes() > 0);
          }

          const isPending = pendings.has(s.id);
          const isBusy = busy.has(s.id);
          const available = !(isPast || isBusy || isPending);

          let dotColor = COLOR.green;
          if (isPast) dotColor = COLOR.grayDot;
          else if (isBusy) dotColor = COLOR.red;
          else if (isPending) dotColor = COLOR.orange;

          return { ...s, available, dotColor };
        });

        setSlots(next);
        if (slot && !next.find((x) => x.id === slot.id && x.available)) setSlot(null);
      },
      (err) => console.error("busy slots onSnapshot:", err)
    );
    return () => unsub();
  }, [roomId, dateObj, slot]);

  const onConfirm = async () => {
    if (submitting) return;
    if (!roomName || !roomCode || capacityMin == null || capacityMax == null || !slot) {
      Alert.alert("กรอกไม่ครบ", "ข้อมูลห้อง/ความจุ/ช่วงเวลายังไม่ครบ");
      return;
    }
    const uid = auth.currentUser?.uid;
    if (!uid) {
      Alert.alert("ยังไม่ได้เข้าสู่ระบบ", "โปรดเข้าสู่ระบบก่อนทำรายการ");
      return;
    }

    // ป้องกันอีกชั้นใน client: ถ้าเต็มโควต้าแล้วไม่ให้กด (กัน race เผื่อ UI lag)
    if (reachedLimit) {
      Alert.alert("เต็มโควต้า", "คุณมีการจองที่รอดำเนินการหรืออนุมัติครบ 2 รายการแล้ว");
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

    setSubmitting(true);
    try {
      const payload = {
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
      };

      // ✅ สร้าง booking (ฝั่ง service ตรวจ limit)
      await createBookingWithLimit(payload);

      // ✅ เพิ่ม notification ให้ผู้ใช้ (ไว้โชว์ใน Inbox)
      const title = "สร้างคำขอจองแล้ว";
      const dd = formatDate(dateObj);
      const description = `${roomName} (${roomCode}) • ${dd} • ${slot.label} — สถานะ: pending`;

      await addDoc(collection(db, "users", uid, "notifications"), {
        type: "booking_created",
        title,
        description,
        createdAt: serverTimestamp(),
        read: false,
        // แนบข้อมูลสำหรับหน้า Inbox ให้ครบ ๆ
        roomName,
        roomCode,
        slotStart: Timestamp.fromDate(startDate),
        slotEnd: Timestamp.fromDate(endDate),
        status: "pending",
      });

      Alert.alert(
        "จองสำเร็จ",
        `${roomName} (${roomCode}) • ${formatDate(dateObj)} • ${slot.label}\nรอแอดมินอนุมัติ`
      );
      router.back();
    } catch (e) {
      console.error("create booking error:", e);
      Alert.alert("จองไม่สำเร็จ", e?.message || "ลองใหม่อีกครั้ง");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Provider>
      {/* Header */}
      <View style={styles.headerWrap}>
        <View style={styles.headerRow}>
          <Text style={styles.headerTitle}>Booking Form</Text>
          <TouchableOpacity style={{ position: "absolute", right: 14}} onPress={() => router.push("(tabs)/Inbox")}>
            <Ionicons name="notifications-outline" size={22} color={COLOR.white} />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView style={styles.container} keyboardShouldPersistTaps="handled">
        {/* Name */}
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

        {/* Room */}
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

        {/* Number */}
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

        {/* Date */}
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
            right={
              <TextInput.Icon
                icon="chevron-down"
                onPress={() => setShowDate(true)}
                color={COLOR.text}
              />
            }
          />
        </Pressable>

        <Portal>
          <Modal
            visible={showDate}
            onDismiss={() => setShowDate(false)}
            contentContainerStyle={styles.modalBox}
          >
            <Calendar
              initialDate={toYMD(dateObj)}
              onDayPress={onPickCalendar}
              markedDates={{
                [toYMD(dateObj)]: { selected: true, disableTouchEvent: true },
              }}
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

        {/* Slots */}
        <View style={styles.slotGrid}>
          {slots.map((s) => (
            <SlotButton
              key={s.id}
              label={s.label}
              available={s.available}
              selected={slot?.id === s.id}
              onPress={() => chooseSlot(s)}
              dotColor={s.dotColor}
            />
          ))}
        </View>

        {/* Accessories (max 3) */}
        <Pressable onPress={() => setAccModalVisible(true)}>
          <TextInput
            label="Accessories"
            placeholder="Choose up to 3"
            value={accessories.join(", ")}
            mode="outlined"
            editable={false}
            style={styles.input}
            outlineColor={COLOR.border}
            activeOutlineColor={COLOR.primary}
            textColor={accessories.length ? COLOR.text : undefined}
            right={
              <TextInput.Icon
                icon="chevron-down"
                onPress={() => setAccModalVisible(true)}
                color={COLOR.text}
              />
            }
          />
        </Pressable>

        <View style={styles.chipsWrap}>
          {accessories.map((acc) => (
            <Chip
              key={acc}
              onClose={() => setAccessories((p) => p.filter((x) => x !== acc))}
              style={styles.chip}
              textStyle={{ color: COLOR.text }}
            >
              {acc}
            </Chip>
          ))}
        </View>

        <Portal>
          <Modal
            visible={accModalVisible}
            onDismiss={() => setAccModalVisible(false)}
            contentContainerStyle={styles.modalBox}
          >
            <List.Section>
              <List.Subheader style={{ color: COLOR.text }}>
                เลือกอุปกรณ์ (สูงสุด {MAX_ACCESSORIES}) — {accessories.length}/{MAX_ACCESSORIES}
              </List.Subheader>

              {ACCESSORY_OPTIONS.map((item) => {
                const checked = accessories.includes(item);
                const reached = accessories.length >= MAX_ACCESSORIES;
                const disabled = !checked && reached; // ถ้าเต็มแล้ว ห้ามเลือกเพิ่ม (แต่ยังเอาออกได้)
                return (
                  <List.Item
                    key={item}
                    title={item}
                    titleStyle={{ color: disabled ? "#9CA3AF" : COLOR.text }}
                    disabled={disabled}
                    onPress={() =>
                      setAccessories((prev) => {
                        const isChecked = prev.includes(item);
                        if (isChecked) {
                          return prev.filter((x) => x !== item);
                        }
                        if (prev.length >= MAX_ACCESSORIES) {
                          Alert.alert("เลือกอุปกรณ์ได้สูงสุด 3 อย่าง", "โปรดเอาอุปกรณ์บางอย่างออกก่อน");
                          return prev;
                        }
                        return [...prev, item];
                      })
                    }
                    right={() => (
                      <Checkbox
                        status={checked ? "checked" : "unchecked"}
                        color={disabled ? "#9CA3AF" : COLOR.text}
                        uncheckedColor={disabled ? "#9CA3AF" : COLOR.text}
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
              <Button
                mode="contained"
                onPress={() => setAccModalVisible(false)}
                buttonColor={COLOR.primary}
                textColor={COLOR.white}
              >
                Done
              </Button>
            </View>
          </Modal>
        </Portal>

        {/* แสดงเฉพาะตอนเต็มโควต้า */}
        {reachedLimit && (
          <Text style={{ color: COLOR.red, marginTop: 6, marginBottom: 8 }}>
            คุณมีการจองที่ <Text style={{ fontWeight: "700" }}>รอดำเนินการหรืออนุมัติ</Text> ครบ 2 รายการแล้ว ไม่สามารถจองเพิ่มได้
          </Text>
        )}

        {/* Bottom */}
        <View style={styles.footerRow}>
          <TouchableOpacity style={styles.pillCancel} onPress={() => router.back()}>
            <Text style={styles.pillCancelText}>Cancel</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.pillConfirm,
              (reachedLimit || !slot || submitting) && { opacity: 0.5 },
            ]}
            onPress={onConfirm}
            disabled={reachedLimit || !slot || submitting}
          >
            <Text style={styles.pillConfirmText}>
              {submitting ? "Processing..." : reachedLimit ? "เต็มโควต้าแล้ว" : "Confirm"}
            </Text>
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
    marginBottom: 14,
  },
  headerTitle: {
    position: "absolute",
    left: 0,
    right: 0,
    textAlign: "center",
    color: COLOR.white,
    fontWeight: "bold",
    fontSize: 23,
  },
  rightButtons: { flexDirection: "row", alignItems: "center" },

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
