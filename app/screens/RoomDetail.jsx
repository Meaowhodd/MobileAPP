import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Image, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";

export default function RoomDetail() {
  const router = useRouter();
  const { roomName, roomCode, people, floor, image, description, highlights, bestFor, atmosphere } = useLocalSearchParams();

  return (
    <ScrollView style={styles.container}>
      {/* Back button */}
      <TouchableOpacity onPress={() => router.back()} style={{ margin: 16 }}>
        <Ionicons name="arrow-back" size={24} color="#333" />
      </TouchableOpacity>

      {/* Image */}
      <Image source={typeof image === "string" ? { uri: image } : image} style={styles.roomImage} />

      {/* Info */}
      <Text style={styles.roomName}>{roomName}</Text>
      <Text style={styles.roomCode}>Room {roomCode}</Text>
      <Text style={styles.info}>Capacity: {people}</Text>
      <Text style={styles.info}>Floor: {floor}</Text>

      {/* Sections */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Description</Text>
        <Text style={styles.sectionText}>{description}</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Highlights</Text>
        <Text style={styles.sectionText}>{highlights}</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Best for</Text>
        <Text style={styles.sectionText}>{bestFor}</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Atmosphere</Text>
        <Text style={styles.sectionText}>{atmosphere}</Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },
  roomImage: { width: "100%", height: 200, marginBottom: 16 },
  roomName: { fontSize: 24, fontWeight: "bold", marginHorizontal: 16 },
  roomCode: { fontSize: 16, color: "#666", marginHorizontal: 16, marginBottom: 8 },
  info: { fontSize: 14, color: "#444", marginHorizontal: 16 },
  section: { marginTop: 20, marginHorizontal: 16 },
  sectionTitle: { fontSize: 18, fontWeight: "600", marginBottom: 4 },
  sectionText: { fontSize: 14, color: "#555", lineHeight: 20 },
});
