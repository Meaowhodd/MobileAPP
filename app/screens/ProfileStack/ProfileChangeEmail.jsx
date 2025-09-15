import {
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

import { useNavigation } from "@react-navigation/native";

export default function ProfileChangeEmail() {
  const navigation = useNavigation();

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headertext}>Settings</Text>
      </View>
      <View style={{ margin: 50 }}>
        <View style={{ alignItems: "left" }}>
          <Text style={styles.subheadertext}>Change Email</Text>
          <View style={styles.divider}></View>
        </View>
        <Text style={styles.subheadertextleft}>New Email</Text>
        <TextInput
          style={styles.inputcontentbox}
          placeholder="Your new email . . ."
        />

        <View style={{ flex: 1, flexDirection: "row-reverse" }}>
          <TouchableOpacity
            style={styles.button1}
            onPress={() => navigation.goBack()}
          >
            <Text style={{ color: "white", textAlign: "center", fontSize: 20 }}>
              Confirm{/*Wont doing anything Yet*/}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.button1,
              { backgroundColor: "#ff4d4dff", marginRight: 20, width: 100 },
            ]}
            onPress={() => navigation.goBack()}
          >
            <Text style={{ color: "white", textAlign: "center", fontSize: 20 }}>
              Cancel{/*Wont doing anything Yet*/}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
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
