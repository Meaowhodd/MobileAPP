import { useRouter } from "expo-router";
import { useState } from "react";
import { Image, ScrollView, StyleSheet, Text, View } from "react-native";
import { Appbar, Button, Card, Chip } from "react-native-paper";

const initialData = [
  {
    id: "1",
    room: "Room A-001",
    people: "8-10 people",
    floor: "Floor 1",
    date: "28/12/2025",
    startTime: "9.00",
    endTime: "12.00",
    image: "https://via.placeholder.com/100x80",
    status: "operation",
  },
  {
    id: "2",
    room: "Room B-201",
    people: "8-10 people",
    floor: "Floor 2",
    date: "30/12/2025",
    startTime: "13.00",
    endTime: "15.00",
    image: "https://via.placeholder.com/100x80",
    status: "operation",
  },
];

export default function Book() {
  const [status, setStatus] = useState("operation");
  const [bookings, setBookings] = useState(initialData);
  const router = useRouter();

  // กดยกเลิก
  const handleCancel = (id) => {
    setBookings((prev) =>
      prev.map((b) => (b.id === id ? { ...b, status: "canceled" } : b))
    );
  };

  // filter ตาม status
  const filtered = bookings.filter((b) => b.status === status);

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.headerWrap}>
        <View style={styles.headerRow}>



          {/* Title */}
          <Text style={styles.headerTitle}>My Booking</Text>

          {/* Right Buttons */}
          <View style={styles.rightButtons}>
            <Appbar.Action
              icon="bell-outline"
              color="white"
              onPress={() => router.push("/Inbox")}
            />
            <Appbar.Action
              icon="plus"
              color="white"
              onPress={() => router.push("/screens/Booking")}
            />
          </View>
        </View>
      </View>

      {/* Tabs */}
      <View style={styles.tabContainer}>
        <Chip
          selected={status === "operation"}
          onPress={() => setStatus("operation")}
          style={status === "operation" ? styles.chipActive : styles.chip}
        >
          Operation
        </Chip>
        <Chip
          selected={status === "completed"}
          onPress={() => setStatus("completed")}
          style={status === "completed" ? styles.chipActive : styles.chip}
        >
          Completed
        </Chip>
        <Chip
          selected={status === "canceled"}
          onPress={() => setStatus("canceled")}
          style={status === "canceled" ? styles.chipActive : styles.chip}
        >
          Canceled
        </Chip>
      </View>

      {/* Booking List */}
      <ScrollView style={{ flex: 1 }}>
        {filtered.map((item) => (
          <Card key={item.id} style={styles.card}>
            <View style={styles.cardContent}>
              <Image source={{ uri: item.image }} style={styles.roomImage} />
              <View style={{ flex: 1, marginLeft: 10 }}>
                <Text style={styles.roomName}>{item.room}</Text>
                <Text>{item.people}</Text>
                <Text>{item.floor}</Text>
                <Text>Date: {item.date}</Text>
                <Text>
                  Start Time {item.startTime} | End Time {item.endTime}
                </Text>

                {/* Buttons */}
                <View style={styles.buttonRow}>
                  <Button
                    mode="outlined"
                    onPress={() => handleCancel(item.id)}
                    style={styles.cancelButton}
                  >
                    Cancel
                  </Button>
                  <Button
                    mode="contained"
                    onPress={() =>
                      router.push({
                        pathname: "/screens/Booking",
                        params: { id: item.id },
                      })
                    }
                    style={styles.editButton}
                  >
                    Edit
                  </Button>
                </View>
              </View>
            </View>
          </Card>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },

  // ✅ Header ใหม่
  headerWrap: {
    backgroundColor: "#6C63FF",
    borderBottomLeftRadius: 16,
    borderBottomRightRadius: 16,
    paddingTop: 50, // กัน status bar
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
    color: "#fff",
    fontSize: 20,
    fontWeight: "bold",
  },
  rightButtons: {
    flexDirection: "row",
    alignItems: "center",
  },

  // Tabs
  tabContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    paddingVertical: 10,
    backgroundColor: "#f8f8f8",
  },
  chip: { backgroundColor: "#e0e0e0" },
  chipActive: { backgroundColor: "#624bff" },

  // Booking cards
  card: { margin: 10, padding: 10 },
  cardContent: { flexDirection: "row" },
  roomImage: { width: 90, height: 70, borderRadius: 8 },
  roomName: { fontWeight: "bold", fontSize: 16 },

  // Buttons
  buttonRow: {
  flexDirection: "row",
  justifyContent: "space-between", 
  marginTop: 12,
  gap: 12, // ✅ RN 0.71+ รองรับ gap แล้ว (เว้นช่องไฟอัตโนมัติ)
},
cancelButton: {
  flex: 1,
  borderColor: "#000",
},
editButton: {
  flex: 1,
  backgroundColor: "#000",
},

});
