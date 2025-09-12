import {
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

import { useNavigation } from "@react-navigation/native";

export default function ProfileScreen() {
  const navigation = useNavigation();

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headertext}>My Profile</Text>
      </View>

      <ScrollView>
        <View style={{ margin: 50 }}>
          <View style={{ justifyContent: "center", alignItems: "center" }}>
            <Text style={styles.subheadertext}>John Doe</Text>
            <View style={styles.divider}></View>
            <View style={styles.profileimagecontainerlarge}>
              <Image
                source={{
                  uri: "https://www.shutterstock.com/shutterstock/photos/127727240/display_1500/stock-photo-cheerful-young-man-isolated-over-white-background-127727240.jpg",
                }}
                style={{ width: 200, height: 200 }}
              />
            </View>
          </View>
          <Text style={styles.subheadertextleft}>First Name</Text>
          <View style={styles.contentbox}>
            <Text style={styles.contenttext}>John</Text>
          </View>
          <Text style={styles.subheadertextleft}>Last Name</Text>
          <View style={styles.contentbox}>
            <Text style={styles.contenttext}>Doe</Text>
          </View>
          <Text style={styles.subheadertextleft}>Date of birth</Text>
          <View style={styles.contentbox}>
            <Text style={styles.contenttext}>16 Jantember 1616</Text>
          </View>
          <Text style={styles.subheadertextleft}>Phone Number</Text>
          <View style={styles.contentbox}>
            <View style={{ flexDirection: "row", flex: 1 }}>
              <Text style={styles.contenttext}>[THFlagHere] </Text>
              <Text style={styles.contenttext}>+66</Text>
              <Text style={styles.contenttext}> </Text>
              <Text style={styles.contenttext}>671421849</Text>
            </View>
          </View>
          <Text style={styles.subheadertextleft}>Email Address</Text>
          <View style={styles.contentbox}>
            <Text style={styles.contenttext}>john.doe@gmail.com</Text>
          </View>

          <TouchableOpacity
            style={{
              backgroundColor: "#000000ff",
              padding: 10,
              borderTopLeftRadius: 10,
              borderTopRightRadius: 10,
              borderBottomLeftRadius: 10,
              borderBottomRightRadius: 10,
              marginTop: 10,
              marginLeft: 40,
              marginRight: 40,
            }}
            onPress={() => navigation.navigate("ProfileSettingScreen")}
          >
            <Text style={{ color: "white", textAlign: "center", fontSize: 20 }}>
              Edit Your Profile
            </Text>
          </TouchableOpacity>
        </View>

        <View style={styles.middle}>
          <Text style={styles.middletext}>
            Profile Page Iteration 1 : John Doe
          </Text>
          <Text style={styles.middletext}>let me fuh🥀💔</Text>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  middletext: {
    textAlign: "center",
    fontSize: 30,
  },
  header: {
    backgroundColor: "#1f66f2",
    borderBottomLeftRadius: 10,
    borderBottomRightRadius: 10,
  },
  middle: {
    textAlign: "center",
    fontSize: 30,
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  headertext: {
    textAlign: "left",
    fontSize: 30,
    marginTop: 40,
    marginBottom: 15,
    marginLeft: 30,
    color: "white",
  },

  subheadertext: {
    textAlign: "center",
    fontSize: 25,
    fontWeight: "bold",
  },

  subheadertextleft: {
    textAlign: "left",
    fontSize: 20,
    fontWeight: "bold",
  },

  profileimagecontainerlarge: {
    margin: 20,
    justifyContent: "center",
    alignItems: "center",
    borderTopLeftRadius: 100,
    borderTopRightRadius: 100,
    borderBottomLeftRadius: 100,
    borderBottomRightRadius: 100,
    borderColor: "black",
    borderWidth: 2,
    overflow: "hidden",
  },

  contenttext: {
    textAlign: "left",
    fontSize: 18,
  },

  contentbox: {
    marginLeft: 40,
    marginRight: 40,
    marginTop: 10,
    marginBottom: 20,
    borderWidth: 1,
    borderTopLeftRadius: 10,
    borderTopRightRadius: 10,
    borderBottomLeftRadius: 10,
    borderBottomRightRadius: 10,
    borderColor: "black",
    padding: 10,
  },

  divider: {
    borderBottomColor: "#000000ff",
    borderBottomWidth: StyleSheet.hairlineWidth,
    marginTop: 8,
    marginBottom: 8,
    alignSelf: "stretch",
  },
});
