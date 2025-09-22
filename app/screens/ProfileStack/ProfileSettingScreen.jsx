import {
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { router } from "expo-router";

export default function ProfileSettingScreen() {
  const navigation = useNavigation();

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerText}>Settings</Text>
      </View>

      <ScrollView contentContainerStyle={{ paddingVertical: 20 }}>
        {/* Profile Section */}
        <View style={{ alignItems: "center", marginBottom: 20 }}>
          <Text style={styles.sectionTitle}>Profile</Text>
          <Text style={styles.subTitle}>Edit personal information</Text>
          <View style={styles.profileImageContainer}>
            <Image
              source={{
                uri: "https://www.shutterstock.com/shutterstock/photos/127727240/display_1500/stock-photo-cheerful-young-man-isolated-over-white-background-127727240.jpg",
              }}
              style={styles.profileImage}
            />
          </View>
        </View>

        {/* Input Fields */}
        <Text style={styles.label}>First Name</Text>
        <TextInput style={styles.input} placeholder="Your first name..." />

        <Text style={styles.label}>Last Name</Text>
        <TextInput style={styles.input} placeholder="Your last name..." />

        <Text style={styles.label}>Date of Birth</Text>
        <TextInput style={styles.input} placeholder="DD/MM/YYYY" />

        <Text style={styles.label}>Phone Number</Text>
        <TextInput style={styles.input} placeholder="+66 123456789" keyboardType="phone-pad" />

        {/* Account Section */}
        <Text style={[styles.sectionTitle, { marginTop: 30 }]}>Account</Text>

        <View style={styles.valueRow}>
          <Text style={styles.label}>E-mail:</Text>
          <Text style={styles.valueText}>john.doe@gmail.com</Text>
        </View>
        <TouchableOpacity
          style={styles.buttonPrimary}
          onPress={() => router.push("/screens/ProfileStack/ProfileChangeEmail")}
        >
          <Text style={styles.buttonText}>Change E-mail</Text>
        </TouchableOpacity>

        <View style={styles.valueRow}>
          <Text style={styles.label}>Password:</Text>
          <Text style={styles.valueText}>**********</Text>
        </View>
        <TouchableOpacity
          style={styles.buttonPrimary}
          onPress={() => router.push("/screens/ProfileStack/ProfileChangePassword")}
        >
          <Text style={styles.buttonText}>Change Password</Text>
        </TouchableOpacity>

        {/* Save / Cancel */}
{/* Save / Cancel */}
<View style={styles.actionRow}>
  <TouchableOpacity
    style={[styles.actionButton, { backgroundColor: "#FF4D4D" }]}
    onPress={() => navigation.goBack()}
  >
    <Text style={styles.actionButtonText}>Cancel</Text>
  </TouchableOpacity>

  <TouchableOpacity
    style={[styles.actionButton, { backgroundColor: PRIMARY }]}
    onPress={() => navigation.goBack()}
  >
    <Text style={styles.actionButtonText}>Save</Text>
  </TouchableOpacity>
</View>

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

  // Header
  header: {
    backgroundColor: PRIMARY,
    borderBottomLeftRadius: 16,
    borderBottomRightRadius: 16,
    paddingTop: 50,
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
  sectionTitle: {
    fontSize: 22,
    fontWeight: "bold",
    marginBottom: 6,
  },
  subTitle: {
    fontSize: 16,
    color: "#555",
    marginBottom: 10,
  },
  profileImageContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 2,
    borderColor: "#ddd",
    overflow: "hidden",
    marginBottom: 16,
  },
  profileImage: {
    width: "100%",
    height: "100%",
  },

  // Form
  label: {
    fontSize: 16,
    fontWeight: "bold",
    marginLeft: 24,
    marginBottom: 6,
    marginTop: 14,
  },
  input: {
    marginHorizontal: 24,
    padding: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#ccc",
    backgroundColor: "#fafafa",
    fontSize: 16,
  },

  // Account
  valueRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginHorizontal: 24,
    marginTop: 20,
    alignItems: "center",
  },
  valueText: {
    fontSize: 16,
    color: "#333",
  },

  // Buttons
  buttonPrimary: {
    backgroundColor: PRIMARY,
    paddingVertical: 12,
    borderRadius: 10,
    marginHorizontal: 24,
    marginTop: 14,
    alignItems: "center",
  },
  buttonSecondary: {
    backgroundColor: "#FF4D4D",
    paddingVertical: 12,
    borderRadius: 10,
    flex: 1,
    alignItems: "center",
  },
  buttonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
  },

  // Actions row
  actionRow: {
  flexDirection: "row",
  justifyContent: "space-between",
  marginHorizontal: 24,
  marginTop: 30,
},

actionButton: {
  flex: 1,
  paddingVertical: 14,
  borderRadius: 10,
  alignItems: "center",
  marginHorizontal: 5, // ✅ เว้นระยะห่างให้ balance
},

actionButtonText: {
  color: "white",
  fontSize: 16,
  fontWeight: "600",
},

});
