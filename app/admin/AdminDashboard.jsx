import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";

export default function AdminDashboard() {
  const router = useRouter();

  return (
    <View style={styles.container}>
      {/* 🔹 Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Admin Dashboard</Text>
        <TouchableOpacity onPress={() => router.replace("/")}>
          <Ionicons name="log-out-outline" size={24} color="white" />
        </TouchableOpacity>
      </View>

      {/* 🔹 เนื้อหา */}
      <ScrollView contentContainerStyle={styles.body}>
        {/* สรุปสถิติ */}
        <View style={styles.cardRow}>
          <View style={styles.card}>
            <Text style={styles.cardNumber}>120</Text>
            <Text style={styles.cardLabel}>Users</Text>
          </View>
          <View style={styles.card}>
            <Text style={styles.cardNumber}>12</Text>
            <Text style={styles.cardLabel}>Rooms</Text>
          </View>
        </View>

        <View style={styles.cardRow}>
          <View style={styles.card}>
            <Text style={styles.cardNumber}>8</Text>
            <Text style={styles.cardLabel}>Pending</Text>
          </View>
          <View style={styles.card}>
            <Text style={styles.cardNumber}>45</Text>
            <Text style={styles.cardLabel}>Approved</Text>
          </View>
        </View>

        {/* เมนูลัด Management */}
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
  },
  headerTitle: { fontSize: 20, fontWeight: "bold", color: "white" },
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
