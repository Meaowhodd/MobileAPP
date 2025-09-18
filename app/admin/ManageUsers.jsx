import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";

export default function ManageUsers() {
  const router = useRouter();

  // 🚧 mock data ผู้ใช้ (รอเชื่อม Firebase จริง)
  const users = [
    { id: 1, name: "Alice", email: "alice@student.com", role: "student" },
    { id: 2, name: "Bob", email: "bob@guest.com", role: "guest" },
    { id: 3, name: "Charlie", email: "charlie@uni.com", role: "admin" },
  ];

  return (
    <View style={styles.container}>
      {/* 🔹 Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="white" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Manage Users</Text>
        <View style={{ width: 24 }} /> {/* spacer แทนปุ่มขวา */}
      </View>

      {/* 🔹 Body */}
      <ScrollView contentContainerStyle={styles.body}>
        {users.map((user) => (
          <View key={user.id} style={styles.userCard}>
            <View>
              <Text style={styles.userName}>{user.name}</Text>
              <Text style={styles.userEmail}>{user.email}</Text>
              <Text style={styles.userRole}>Role: {user.role}</Text>
            </View>

            {/* ปุ่ม Action */}
            <View style={styles.actions}>
              <TouchableOpacity style={styles.actionBtn}>
                <Ionicons name="create-outline" size={20} color="#6A5AE0" />
              </TouchableOpacity>
              <TouchableOpacity style={styles.actionBtn}>
                <Ionicons name="trash-outline" size={20} color="red" />
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
  userCard: {
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
  userName: { fontSize: 16, fontWeight: "bold", color: "#333" },
  userEmail: { fontSize: 14, color: "#666" },
  userRole: { fontSize: 12, color: "#999", marginTop: 2 },
  actions: { flexDirection: "row" },
  actionBtn: { marginLeft: 10 },
});
