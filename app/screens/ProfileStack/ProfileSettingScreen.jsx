import {
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

import { useNavigation } from "@react-navigation/native";
import { router } from "expo-router";

export default function ProfileSettingScreen() {
  const navigation = useNavigation();

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headertext}>Settings</Text>
      </View>

      <ScrollView>
        <View style={{ margin: 50 }}>
          <View style={{ alignItems: "left" }}>
            <Text style={styles.subheadertext}>Profile</Text>
            <View style={styles.divider}></View>
            <Text style={styles.subheadertextleft}>
              Edit personal information
            </Text>
            <View style={styles.profileimagecontainermid}>
              <Image
                source={{
                  uri: "https://www.shutterstock.com/shutterstock/photos/127727240/display_1500/stock-photo-cheerful-young-man-isolated-over-white-background-127727240.jpg",
                }}
                style={{ width: 100, height: 100 }}
              />
            </View>
          </View>
          <Text style={styles.subheadertextleft}>First Name</Text>
          <TextInput
            style={styles.inputcontentbox}
            placeholder="Your first name . . ."
          />
          <Text style={styles.subheadertextleft}>Last Name</Text>
          <TextInput
            style={styles.inputcontentbox}
            placeholder="Your last name . . . "
          />
          <Text style={styles.subheadertextleft}>Date of birth</Text>
          <View style={styles.contentbox}>
            <Text style={styles.contenttext}>NOT YET IMPLEMENTED</Text>
          </View>
          <Text style={styles.subheadertextleft}>Phone Number</Text>
          <View style={styles.contentbox}>
            <View style={{ flexDirection: "row", flex: 1 }}>
              <Text style={styles.contenttext}>NOT YET IMPLEMENTED</Text>
            </View>
          </View>

          <View style={{ marginVertical: 30 }}></View>
          <Text style={styles.subheadertext}>Account</Text>
          <View style={styles.divider}></View>

          <View style={styles.valueViewrow}>
            <Text style={[styles.subheadertextleft, { alignSelf: "right" }]}>
              E-mail :
            </Text>
            <Text style={styles.contenttext}>john.doe@gmail.com</Text>{" "}
            {/*Email value goes here*/}
          </View>
          <TouchableOpacity
            style={styles.button1}
            onPress={() =>
              router.push("/screens/ProfileStack/ProfileChangeEmail")
            }
          >
            <Text style={{ color: "white", textAlign: "center", fontSize: 20 }}>
              Change E-mail
            </Text>
          </TouchableOpacity>

          <View style={{ marginVertical: 10 }}></View>

          <View style={styles.valueViewrow}>
            <Text style={[styles.subheadertextleft, { alignSelf: "right" }]}>
              Password :
            </Text>
            <Text style={styles.contenttext}>**********</Text>{" "}
            {/*Password length value goes here as * repeated for the length of the actual password */}
          </View>
          <TouchableOpacity
            style={styles.button1}
            onPress={() =>
              router.push("/screens/ProfileStack/ProfileChangePassword")
            }
          >
            <Text style={{ color: "white", textAlign: "center", fontSize: 20 }}>
              Change Password
            </Text>
          </TouchableOpacity>

          <View style={{ marginVertical: 30 }}></View>
          <View style={styles.divider}></View>

          <View style={{ flex: 1 ,flexDirection: "row-reverse"}}>
            <TouchableOpacity
              style={styles.button1}
              onPress={() => navigation.goBack()}
            >
              <Text
                style={{ color: "white", textAlign: "center", fontSize: 20 }}
              >
                Save Changes{/*Wont doing anything Yet*/}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.button1, { backgroundColor: "#ff4d4dff", marginRight: 20 }]}
              onPress={() => navigation.goBack()}
            >
              <Text
                style={{ color: "white", textAlign: "center", fontSize: 20 }}
              >
                Cancel Changes{/*Wont doing anything Yet*/}
              </Text>
            </TouchableOpacity>
          </View>
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
    backgroundColor: "#1f66f2ff",
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
    textAlign: "left",
    fontSize: 25,
    fontWeight: "bold",
  },

  subheadertextleft: {
    textAlign: "left",
    fontSize: 20,
    fontWeight: "bold",
  },

  profileimagecontainermid: {
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
    width: 100,
    height: 100,
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

  inputcontentbox: {
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
    fontSize: 18,
  },

  divider: {
    borderBottomColor: "#000000ff",
    borderBottomWidth: StyleSheet.hairlineWidth,
    marginTop: 8,
    marginBottom: 24,
    alignSelf: "stretch",
  },

  valueViewrow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginRight: 40,
  },

  button1: {
    backgroundColor: "#1f66f2ff",
    padding: 10,
    borderTopLeftRadius: 10,
    borderTopRightRadius: 10,
    borderBottomLeftRadius: 10,
    borderBottomRightRadius: 10,
    marginTop: 10,
    marginRight: 40,
    width: 200,
    alignSelf: "flex-end",
  },
});
