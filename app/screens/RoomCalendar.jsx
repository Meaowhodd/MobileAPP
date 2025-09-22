import { Ionicons, MaterialIcons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useState } from "react";
import {
  FlatList,
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { Calendar } from "react-native-calendars";

export default function RoomCalendar() {
  const [selectedDate, setSelectedDate] = useState(null);

  // ✅ mock ข้อมูลห้องว่างตามวันที่
  const roomsByDate = {
    "2025-09-27": [
      {
        id: "1",
        name: "Room A-105",
        time: "9.00 - 12.00, 15.00 - 18.00",
        people: "8-10 people",
      },
      {
        id: "2",
        name: "Room A-203",
        time: "10.00 - 12.00",
        people: "20-25 people",
      },
    ],
    "2025-09-28": [
      {
        id: "3",
        name: "Room A-102",
        time: "9.00 - 12.00, 14.00 - 16.00",
        people: "10-15 people",
      },
    ],
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        {/* ปุ่มย้อนกลับ */}
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>

        <Text style={styles.headerTitle}>Room Calendar</Text>

        {/* ปุ่มแจ้งเตือน */}
        <TouchableOpacity>
          <MaterialIcons name="notifications" size={24} color="#fff" />
        </TouchableOpacity>
      </View>

      {/* Calendar */}
      <View style={styles.calendarWrap}>
        <Calendar
          markedDates={{
            [selectedDate]: { selected: true, selectedColor: "#4f46e5" },
          }}
          onDayPress={(day) => setSelectedDate(day.dateString)} // ✅ กดวัน → set วันที่
        />
      </View>

      {/* Room List เฉพาะวันที่เลือก */}
      {selectedDate && (
        <>
          <Text style={styles.sectionTitle}>
            Room available on {selectedDate}
          </Text>
          <FlatList
            data={roomsByDate[selectedDate] || []}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <View style={styles.roomCard}>
                <Text style={styles.roomName}>{item.name}</Text>
                <Text style={styles.roomTime}>Time: {item.time}</Text>
                <Text style={styles.roomPeople}>
                  Number people: {item.people}
                </Text>
              </View>
            )}
            ListEmptyComponent={
              <Text style={styles.noRoom}>No rooms available</Text>
            }
          />
        </>
      )}
    </SafeAreaView>
  );
}

const PRIMARY = "#6C63FF";

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },
  header: {
  backgroundColor: PRIMARY,
  borderBottomLeftRadius: 16,
  borderBottomRightRadius: 16,
  paddingBottom: 14,
  flexDirection: "row",              // ✅ จัด layout เป็นแนวนอน
  alignItems: "center",              // ✅ จัดปุ่มให้อยู่ตรงกลางแนวตั้ง
  justifyContent: "space-between",   // ✅ จัดให้ Back ← Title → Notification balance กัน
  paddingTop: 50,                    // ✅ กันชน StatusBar ด้านบน
  paddingHorizontal: 16,
},
headerTitle: {
  color: "#fff",
  fontSize: 20,
  fontWeight: "bold",
},
  calendarWrap: {
    margin: 16,
    borderRadius: 12,
    backgroundColor: "#fff",
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "bold",
    marginHorizontal: 16,
    marginVertical: 8,
  },
  roomCard: {
    backgroundColor: "#f9f9f9",
    padding: 14,
    marginHorizontal: 16,
    marginVertical: 6,
    borderRadius: 12,
    borderLeftWidth: 4,
    borderLeftColor: "green",
  },
  roomName: { fontWeight: "bold", fontSize: 15, marginBottom: 4 },
  roomTime: { color: "#333" },
  roomPeople: { color: "#555" },
  noRoom: { textAlign: "center", marginTop: 20, color: "#888" },
});
