import {
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";

export default function ProfileScreen() {
  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        {/* Back Button */}
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>

        <Text style={styles.headerText}>My Profile</Text>
      </View>

      <ScrollView contentContainerStyle={{ paddingVertical: 20 }}>
        <View style={{ alignItems: "center" }}>
          <View style={styles.profileImageContainer}>
            <Image
              source={{
                uri: "https://www.shutterstock.com/shutterstock/photos/127727240/display_1500/stock-photo-cheerful-young-man-isolated-over-white-background-127727240.jpg",
              }}
              style={styles.profileImage}
            />
          </View>
          <Text style={styles.nameText}>John Doe</Text>
        </View>

        {/* Info Fields */}
        <View style={{ marginTop: 30 }}>
          <Text style={styles.label}>First Name</Text>
          <View style={styles.contentBox}>
            <Text style={styles.contentText}>John</Text>
          </View>

          <Text style={styles.label}>Last Name</Text>
          <View style={styles.contentBox}>
            <Text style={styles.contentText}>Doe</Text>
          </View>

          <Text style={styles.label}>Date of Birth</Text>
          <View style={styles.contentBox}>
            <Text style={styles.contentText}>16 Jantember 1616</Text>
          </View>

          <Text style={styles.label}>Phone Number</Text>
          <View style={styles.contentBox}>
            <Text style={styles.contentText}>+66 671421849</Text>
          </View>

          <Text style={styles.label}>Email Address</Text>
          <View style={styles.contentBox}>
            <Text style={styles.contentText}>john.doe@gmail.com</Text>
          </View>
        </View>

        {/* Button */}
        <TouchableOpacity
          style={styles.editButton}
          onPress={() =>
            router.push({
              pathname: "/screens/ProfileStack/ProfileSettingScreen",
            })
          }
        >
          <Text style={styles.editButtonText}>Edit Your Profile</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const PRIMARY = "#6C63FF";

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },

  // ✅ Header ใหม่
  header: {
    backgroundColor: PRIMARY,
    borderBottomLeftRadius: 16,
    borderBottomRightRadius: 16,
    paddingTop: 50, // กัน status bar
    paddingBottom: 20,
    alignItems: "center",
    position: "relative",
  },
  headerText: {
    color: "white",
    fontSize: 22,
    fontWeight: "bold",
  },
  backButton: {
    position: "absolute",
    left: 16,
    top: 50,
  },

  // Profile
  profileImageContainer: {
    width: 150,
    height: 150,
    borderRadius: 75,
    borderWidth: 3,
    borderColor: "#eee",
    overflow: "hidden",
    marginBottom: 12,
  },
  profileImage: {
    width: "100%",
    height: "100%",
  },
  nameText: {
    fontSize: 22,
    fontWeight: "bold",
    marginTop: 6,
  },

  // Labels & content
  label: {
    fontSize: 16,
    fontWeight: "bold",
    marginLeft: 24,
    marginBottom: 6,
    marginTop: 14,
  },
  contentBox: {
    marginHorizontal: 24,
    padding: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#ccc",
    backgroundColor: "#fafafa",
  },
  contentText: {
    fontSize: 16,
    color: "#333",
  },

  // Button
  editButton: {
    backgroundColor: PRIMARY,
    paddingVertical: 14,
    borderRadius: 12,
    marginTop: 30,
    marginHorizontal: 40,
    alignItems: "center",
  },
  editButtonText: {
    color: "white",
    fontSize: 18,
    fontWeight: "600",
  },
});
