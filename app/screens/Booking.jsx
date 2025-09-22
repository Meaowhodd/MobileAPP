// BookingForm.jsx
import { Ionicons } from "@expo/vector-icons";
import DateTimePicker from "@react-native-community/datetimepicker";
import { useMemo, useRef, useState } from "react";
import { Alert, Platform, Pressable, Modal as RNModal, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { Calendar } from "react-native-calendars"; // <- ใช้ปฏิทินในโมดัล
import { Button, Checkbox, Chip, List, Modal, Portal, Provider, TextInput } from "react-native-paper";

const ACCESSORY_OPTIONS = ["ทีวี", "โปรเจกเตอร์", "ไมค์", "ลำโพง", "ไวท์บอร์ด", "สาย HDMI"];

export default function BookingForm() {
  const [name, setName] = useState("Jafer Adviar");
  const [room, setRoom] = useState("A-001");
  const [number, setNumber] = useState("");

  // Date
  const [dateObj, setDateObj] = useState(new Date());
  const [showDate, setShowDate] = useState(false);

  // Time
  const [startObj, setStartObj] = useState(null);
  const [endObj, setEndObj] = useState(null);
  const [showStart, setShowStart] = useState(false);
  const [showEnd, setShowEnd] = useState(false);

  // Accessories (multi-select)
  const [accessories, setAccessories] = useState([]); // string[]
  const [accModalVisible, setAccModalVisible] = useState(false);

  // ====== DROPDOWN เวลาแบบ custom ======
  const startRef = useRef(null);
  const endRef = useRef(null);
  const [startRect, setStartRect] = useState(null);
  const [endRect, setEndRect] = useState(null);
  const [startDropVisible, setStartDropVisible] = useState(false);
  const [endDropVisible, setEndDropVisible] = useState(false);

  const openStartDropdown = () => {
    startRef.current?.measureInWindow((x, y, w, h) => {
      setStartRect({ x, y, w, h });
      setStartDropVisible(true);
    });
  };
  const openEndDropdown = () => {
    endRef.current?.measureInWindow((x, y, w, h) => {
      setEndRect({ x, y, w, h });
      setEndDropVisible(true);
    });
  };
  // ======================================================

  // helpers
  const formatDate = (d) =>
    d.toLocaleDateString("th-TH", { day: "2-digit", month: "long", year: "numeric" });

  const formatTime = (d) =>
    d.toLocaleTimeString("th-TH", { hour: "2-digit", minute: "2-digit", hour12: false });

  const calcDurationMinutes = (s, e) => Math.max(0, Math.round((e - s) / 60000));

  // DateTimePicker handlers (คงเดิม)
  const onChangeDate = (_, selected) => {
    setShowDate(false);
    if (!selected) return;
    const newDate = new Date(selected);
    setDateObj(newDate);

    if (startObj) {
      const s = new Date(newDate);
      s.setHours(startObj.getHours(), startObj.getMinutes(), 0, 0);
      setStartObj(s);
    }
    if (endObj) {
      const e = new Date(newDate);
      e.setHours(endObj.getHours(), endObj.getMinutes(), 0, 0);
      setEndObj(e);
    }
  };

  const onChangeStart = (_, selected) => {
    setShowStart(false);
    if (!selected) return;
    const start = new Date(dateObj);
    start.setHours(selected.getHours(), selected.getMinutes(), 0, 0);

    // NEW: ถ้ามี end เดิมอยู่แล้วและเกิน 3 ชั่วโมงให้เคลียร์ end
    if (endObj) {
      if (endObj < start) {
        Alert.alert("เวลาไม่ถูกต้อง", "End Time ต้องไม่ก่อน Start Time");
        setEndObj(null);
      } else {
        const diffMs = endObj - start;
        if (diffMs > 3 * 60 * 60 * 1000) {
          Alert.alert("เกินเวลาที่กำหนด", "เลือกได้สูงสุด 3 ชั่วโมงเท่านั้น");
          setEndObj(null);
        }
      }
    }

    setStartObj(start);
  };

  const onChangeEnd = (_, selected) => {
    setShowEnd(false);
    if (!selected) return;
    const end = new Date(dateObj);
    end.setHours(selected.getHours(), selected.getMinutes(), 0, 0);

    // NEW: เช็คกับ start — ต้องไม่ก่อน start และไม่เกิน 3 ชั่วโมง
    if (startObj && end < startObj) {
      Alert.alert("เวลาไม่ถูกต้อง", "End Time ต้องไม่ก่อน Start Time");
      return;
    }
    if (startObj) {
      const diffMs = end - startObj;
      if (diffMs > 3 * 60 * 60 * 1000) {
        Alert.alert("เกินเวลาที่กำหนด", "เลือกได้สูงสุด 3 ชั่วโมงเท่านั้น");
        return;
      }
    }

    setEndObj(end);
  };

  // ----- react-native-calendars helpers -----
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

    if (startObj) {
      const s = new Date(newDate);
      s.setHours(startObj.getHours(), startObj.getMinutes(), 0, 0);
      setStartObj(s);
    }
    if (endObj) {
      const e = new Date(newDate);
      e.setHours(endObj.getHours(), endObj.getMinutes(), 0, 0);
      setEndObj(e);
    }
    setShowDate(false);
  };
  // ------------------------------------------------------

  // ---------- time slots ----------
  const timeSlots = useMemo(() => {
    const slots = [];
    const startH = 7;
    const endH = 24;   // ถึงเที่ยงคืน
    const stepMin = 15;
    for (let h = startH; h <= endH; h++) {
      for (let m = 0; m < 60; m += stepMin) {
        const d = new Date(dateObj);
        d.setHours(h, m, 0, 0);
        slots.push(d);
      }
    }
    return slots;
  }, [dateObj]);

  const pickStartFromSlot = (d) => {
    const chosen = new Date(dateObj);
    chosen.setHours(d.getHours(), d.getMinutes(), 0, 0);

    // NEW: ถ้ามี end เดิมอยู่แล้ว ตรวจว่าช่วงเวลาไม่เกิน 3 ชม.และ end ไม่ก่อน start
    if (endObj) {
      if (endObj < chosen) {
        Alert.alert("เวลาไม่ถูกต้อง", "End Time ต้องไม่ก่อน Start Time");
        setEndObj(null);
      } else {
        const diffMs = endObj - chosen;
        if (diffMs > 3 * 60 * 60 * 1000) {
          Alert.alert("เกินเวลาที่กำหนด", "เลือกได้สูงสุด 3 ชั่วโมงเท่านั้น");
          setEndObj(null);
        }
      }
    }

    setStartObj(chosen);
    setStartDropVisible(false);
  };

  const pickEndFromSlot = (d) => {
    const chosen = new Date(dateObj);
    chosen.setHours(d.getHours(), d.getMinutes(), 0, 0);

    // NEW: ต้องไม่ก่อน start และไม่เกิน 3 ชั่วโมง
    if (startObj && chosen < startObj) {
      Alert.alert("เวลาไม่ถูกต้อง", "End Time ต้องไม่ก่อน Start Time");
      return;
    }
    if (startObj) {
      const diffMs = chosen - startObj;
      if (diffMs > 3 * 60 * 60 * 1000) {
        Alert.alert("เกินเวลาที่กำหนด", "เลือกได้สูงสุด 3 ชั่วโมงเท่านั้น");
        return;
      }
    }

    setEndObj(chosen);
    setEndDropVisible(false);
  };
  // -------------------------------

  const onConfirm = () => {
    if (!name.trim() || !room.trim() || !number || !startObj || !endObj) return;
    const mins = calcDurationMinutes(startObj, endObj);
    if (mins <= 0 || mins > 180) return;
  };

  return (
    <Provider>
      {/* Header */}
      <View style={styles.headerWrap}>
  <View style={styles.headerRow}>
    {/* ปุ่ม Back */}
    <TouchableOpacity onPress={() => {}}>
      <Ionicons name="arrow-back" size={26} color="#fff" />
    </TouchableOpacity>

    {/* Title กลาง */}
    <Text style={styles.headerTitle}>Booking Form</Text>

    {/* ปุ่มขวา (Bell + Profile) */}
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
        <TextInput label="Name" value={name} onChangeText={setName} style={styles.input} mode="outlined" />

        <TextInput label="Room" value={room} onChangeText={setRoom} style={styles.input} mode="outlined" />

        <TextInput
          label="Number"
          placeholder="Number of people"
          value={number}
          onChangeText={(t) => /^\d*$/.test(t) && setNumber(t)}
          style={styles.input}
          mode="outlined"
          keyboardType="numeric"
        />

        {/* Date (กดแล้วเปิดปฏิทิน) */}
        <Pressable onPress={() => setShowDate(true)}>
          <TextInput
            label="Date"
            value={formatDate(dateObj)}
            style={styles.input}
            mode="outlined"
            editable={false}
            right={
              <TextInput.Icon
                icon="calendar"
                onPress={() => setShowDate(true)}
                forceTextInputFocus={false}
              />
            }
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
              initialDate={selectedYMD}
              onDayPress={handleCalendarPick}
              markedDates={{
                [selectedYMD]: { selected: true, disableTouchEvent: true, selectedDotColor: "orange" },
              }}
              enableSwipeMonths
            />
            <View style={{ height: 8 }} />
            <Button mode="text" onPress={() => setShowDate(false)}>ปิด</Button>
          </Modal>
        </Portal>

        {/* Start Time (dropdown ตรงปุ่มกด) */}
        <View ref={startRef} collapsable={false}>
          <TextInput
            label="Start Time"
            placeholder="Choose a booking time"
            value={startObj ? formatTime(startObj) : ""}
            style={styles.input}
            mode="outlined"
            editable={false}
            onPressIn={openStartDropdown}
            right={
              <TextInput.Icon
                icon="clock"
                onPress={openStartDropdown}
                forceTextInputFocus={false}
              />
            }
          />
        </View>

        {/* End Time (dropdown ตรงปุ่มกด) */}
        <View ref={endRef} collapsable={false}>
          <TextInput
            label="End Time"
            placeholder="Select your booking end time"
            value={endObj ? formatTime(endObj) : ""}
            style={styles.input}
            mode="outlined"
            editable={false}
            onPressIn={openEndDropdown}
            right={
              <TextInput.Icon
                icon="clock"
                onPress={openEndDropdown}
                forceTextInputFocus={false}
              />
            }
          />
        </View>

        {/* Native pickers (ยังเผื่อไว้สำหรับ iOS หรือกด "กำหนดเวลาเอง") */}
        {showStart && (
          <DateTimePicker
            value={startObj || new Date()}
            mode="time"
            is24Hour
            display={Platform.OS === "ios" ? "spinner" : "default"}
            onChange={onChangeStart}
          />
        )}
        {showEnd && (
          <DateTimePicker
            value={endObj || (startObj || new Date())}
            mode="time"
            is24Hour
            display={Platform.OS === "ios" ? "spinner" : "default"}
            onChange={onChangeEnd}
          />
        )}

        {/* Accessories (multi-select via Modal) */}
        <Pressable onPress={() => setAccModalVisible(true)}>
          <TextInput
            label="Accessories"
            placeholder="เลือกอุปกรณ์ที่ต้องการ"
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
          <Modal
            visible={accModalVisible}
            onDismiss={() => setAccModalVisible(false)}
            contentContainerStyle={styles.modalBox}
          >
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

        {startObj && endObj && (
          <TextInput
            label="Duration"
            value={`${Math.floor(calcDurationMinutes(startObj, endObj) / 60)} ชม. ${
              calcDurationMinutes(startObj, endObj) % 60
            } นาที`}
            style={styles.input}
            mode="outlined"
            editable={false}
          />
        )}

        <View style={styles.buttonRow}>
          <Button mode="outlined" style={styles.cancelButton} onPress={() => {}}>Cancel</Button>
          <Button mode="contained" style={styles.confirmButton} onPress={() => onConfirm()}>Confirm</Button>
        </View>
      </ScrollView>

      {/* ====== โมดัล dropdown เวลาแบบ custom (แสดงตรงพิกัด) ====== */}
      <RNModal
        visible={startDropVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setStartDropVisible(false)}
      >
        <Pressable style={StyleSheet.absoluteFill} onPress={() => setStartDropVisible(false)}>
          {startRect && (
            <View
              style={{
                position: "absolute",
                top: startRect.y + startRect.h,
                left: startRect.x,
                width: startRect.w,
                maxHeight: 320,
                backgroundColor: "white",
                borderRadius: 12,
                elevation: 8,
                shadowColor: "#000",
                shadowOpacity: 0.2,
                shadowRadius: 8,
                shadowOffset: { width: 0, height: 4 },
              }}
            >
              <ScrollView>
                {timeSlots.map((d, idx) => (
                  <List.Item
                    key={idx}
                    title={formatTime(d)}
                    onPress={() => pickStartFromSlot(d)}
                    left={(props) => <List.Icon {...props} icon="clock-outline" />}
                  />
                ))}
                <List.Item
                  title="กำหนดเวลาเอง…"
                  onPress={() => {
                    setStartDropVisible(false);
                    setShowStart(true);
                  }}
                  left={(props) => <List.Icon {...props} icon="tune" />}
                />
              </ScrollView>
            </View>
          )}
        </Pressable>
      </RNModal>

      <RNModal
        visible={endDropVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setEndDropVisible(false)}
      >
        <Pressable style={StyleSheet.absoluteFill} onPress={() => setEndDropVisible(false)}>
          {endRect && (
            <View
              style={{
                position: "absolute",
                top: endRect.y + endRect.h,
                left: endRect.x,
                width: endRect.w,
                maxHeight: 320,
                backgroundColor: "white",
                borderRadius: 12,
                elevation: 8,
                shadowColor: "#000",
                shadowOpacity: 0.2,
                shadowRadius: 8,
                shadowOffset: { width: 0, height: 4 },
              }}
            >
              <ScrollView>
                {timeSlots.map((d, idx) => (
                  <List.Item
                    key={idx}
                    title={formatTime(d)}
                    onPress={() => pickEndFromSlot(d)}
                    left={(props) => <List.Icon {...props} icon="clock-outline" />}
                  />
                ))}
                <List.Item
                  title="กำหนดเวลาเอง…"
                  onPress={() => {
                    setEndDropVisible(false);
                    setShowEnd(true);
                  }}
                  left={(props) => <List.Icon {...props} icon="tune" />}
                />
              </ScrollView>
            </View>
          )}
        </Pressable>
      </RNModal>
      {/* ==================================================== */}
    </Provider>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: "#fff" },
  input: { marginBottom: 16 },
  chipsWrap: { flexDirection: "row", flexWrap: "wrap", gap: 8, marginBottom: 8 },
  chip: { marginRight: 6, marginBottom: 6 },
  modalBox: {
    marginHorizontal: 16,
    backgroundColor: "white",
    padding: 16,
    borderRadius: 16,
  },
  modalButtons: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 8,
  },
  buttonRow: { flexDirection: "row", justifyContent: "space-between", marginTop: 8, marginBottom: 24 },
  cancelButton: { flex: 1, marginRight: 10, borderColor: "#ccc" },
  confirmButton: { flex: 1, marginLeft: 10, backgroundColor: "#6C63FF" },
 headerWrap: {
  backgroundColor: "#6C63FF",
  borderBottomLeftRadius: 20,
  borderBottomRightRadius: 20,
  paddingTop: 50, // เผื่อ status bar
  paddingBottom: 20,
  paddingHorizontal: 16,
},
headerRow: {
  flexDirection: "row",
  alignItems: "center",
  justifyContent: "space-between",
  position: "relative",
},
headerTitle: {
  position: "absolute", // ✅ ทำให้ Title ลอยกลางจริง
  left: 0,
  right: 0,
  textAlign: "center",
  color: "#fff",
  fontWeight: "bold",
  fontSize: 20,
},
rightButtons: {
  flexDirection: "row",
  alignItems: "center",
},
profileDot: {
  width: 26,
  height: 26,
  borderRadius: 13,
  backgroundColor: "#ddd",
},


});
