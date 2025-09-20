import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useState } from "react";
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";

export default function ManageBookings() {
  const router = useRouter();

  // 🚧 mock data การจอง (รอ Firebase จริง)
  const [bookings] = useState([
    { id: 1, user: "Alice", room: "Room A101", date: "2025-09-20", time: "10:00 - 12:00", status: "Pending" },
    { id: 2, user: "Bob", room: "Room B205", date: "2025-09-21", time: "13:00 - 15:00", status: "Approved" },
    { id: 3, user: "Charlie", room: "Room C310", date: "2025-09-22", time: "09:00 - 10:00", status: "Rejected" },
  ]);

  return (
    <View style={styles.container}>
      {/* 🔹 Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="white" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Manage Bookings</Text>
        <View style={{ width: 24 }} />
      </View>

      {/* 🔹 Body */}
      <ScrollView contentContainerStyle={styles.body}>
        {bookings.map((booking) => (
          <View key={booking.id} style={styles.bookingCard}>
            <View>
              <Text style={styles.bookingUser}>{booking.user}</Text>
              <Text style={styles.bookingDetail}>Room: {booking.room}</Text>
              <Text style={styles.bookingDetail}>Date: {booking.date}</Text>
              <Text style={styles.bookingDetail}>Time: {booking.time}</Text>
              <Text
                style={[
                  styles.bookingStatus,
                  { color: booking.status === "Approved" ? "green" : booking.status === "Pending" ? "orange" : "red" },
                ]}
              >
                {booking.status}
              </Text>
            </View>

            {/* ปุ่ม Action */}
            <View style={styles.actions}>
              <TouchableOpacity style={styles.actionBtn}>
                <Ionicons name="checkmark-circle-outline" size={22} color="green" />
              </TouchableOpacity>
              <TouchableOpacity style={styles.actionBtn}>
                <Ionicons name="close-circle-outline" size={22} color="red" />
              </TouchableOpacity>
            </View>
          </View>
        ))}
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
  bookingCard: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 15,
    marginBottom: 15,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    elevation: 2,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 5,
    shadowOffset: { width: 0, height: 2 },
  },
  bookingUser: { fontSize: 16, fontWeight: "bold", color: "#333" },
  bookingDetail: { fontSize: 14, color: "#666" },
  bookingStatus: { fontSize: 12, fontWeight: "bold", marginTop: 4 },
  actions: { flexDirection: "row" },
  actionBtn: { marginLeft: 10 },
});
