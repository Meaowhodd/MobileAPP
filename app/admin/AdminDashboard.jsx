import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect } from "@react-navigation/native";
import { useRouter } from "expo-router";
import { useCallback, useState } from "react";
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";

import { collection, onSnapshot, query, where } from "firebase/firestore";
import { db } from "../../firebaseConfig";

export default function AdminDashboard() {
  const router = useRouter();

  const [usersCount, setUsersCount] = useState(0);
  const [roomsCount, setRoomsCount] = useState(0);
  const [pendingCount, setPendingCount] = useState(0);
  const [approvedCount, setApprovedCount] = useState(0);

  useFocusEffect(
    useCallback(() => {
      const unsubUsers = onSnapshot(collection(db, "users"), (s) => setUsersCount(s.size));
      const unsubRooms = onSnapshot(collection(db, "rooms"), (s) => setRoomsCount(s.size));
      const unsubPending = onSnapshot(
        query(collection(db, "bookings"), where("status", "==", "pending")),
        (s) => setPendingCount(s.size)
      );
      const unsubApproved = onSnapshot(
        query(collection(db, "bookings"), where("status", "==", "approved")),
        (s) => setApprovedCount(s.size)
      );

      return () => {
        unsubUsers();
        unsubRooms();
        unsubPending();
        unsubApproved();
      };
    }, [])
  );

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Admin Dashboard</Text>
        <TouchableOpacity onPress={() => router.replace("/")}>
          <Ionicons name="log-out-outline" size={24} color="white" />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.body}>
        {/* Stats */}
        <View style={styles.cardRow}>
          <View style={styles.card}>
            <Text style={styles.cardNumber}>{usersCount}</Text>
            <Text style={styles.cardLabel}>Users</Text>
          </View>
          <View style={styles.card}>
            <Text style={styles.cardNumber}>{roomsCount}</Text>
            <Text style={styles.cardLabel}>Rooms</Text>
          </View>
        </View>

        <View style={styles.cardRow}>
          <View style={styles.card}>
            <Text style={styles.cardNumber}>{pendingCount}</Text>
            <Text style={styles.cardLabel}>Pending</Text>
          </View>
          <View style={styles.card}>
            <Text style={styles.cardNumber}>{approvedCount}</Text>
            <Text style={styles.cardLabel}>Approved</Text>
          </View>
        </View>

        {/* Menu */}
        <Text style={styles.sectionTitle}>Management</Text>
        <View style={styles.menuRow}>
          <TouchableOpacity
            style={styles.menuBtn}
            onPress={() => router.push("/admin/ManageUsers")}
          >
            <Ionicons name="people-outline" size={32} color="#6A5AE0" />
            <Text style={styles.menuText}>Users</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.menuBtn}
            onPress={() => router.push("/admin/ManageRooms")}
          >
            <Ionicons name="business-outline" size={32} color="#6A5AE0" />
            <Text style={styles.menuText}>Rooms</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.menuRow}>
          <TouchableOpacity
            style={styles.menuBtn}
            onPress={() => router.push("/admin/ManageBookings")}
          >
            <Ionicons name="calendar-outline" size={32} color="#6A5AE0" />
            <Text style={styles.menuText}>Bookings</Text>
          </TouchableOpacity>
        </View>
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
  headerTitle: { fontSize: 22, fontWeight: "bold", color: "white" ,marginBottom: 5},
  body: { padding: 20 },
  cardRow: { flexDirection: "row", justifyContent: "space-between", marginBottom: 15 },
  card: {
    flex: 1,
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 20,
    marginHorizontal: 5,
    alignItems: "center",
    elevation: 2,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 5,
    shadowOffset: { width: 0, height: 2 },
  },
  cardNumber: { fontSize: 22, fontWeight: "bold", color: "#333" },
  cardLabel: { color: "#666", marginTop: 5 },
  sectionTitle: { fontSize: 18, fontWeight: "bold", color: "#333", marginVertical: 15 },
  menuRow: { flexDirection: "row", justifyContent: "space-between", marginBottom: 15 },
  menuBtn: {
    flex: 1,
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 20,
    marginHorizontal: 5,
    alignItems: "center",
    elevation: 2,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 5,
    shadowOffset: { width: 0, height: 2 },
  },
  menuText: { color: "#333", marginTop: 8, fontWeight: "bold" },
});
