import { StyleSheet, Text, View } from 'react-native';

export default function ProfileScreen() {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.headertext}>My Profile</Text></View>
        <View style={styles.middle}><Text style={styles.middletext}>This is ProfileScreen!!!</Text></View>
      </View>
    )
}

const styles = StyleSheet.create({
  container:{
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  middletext: {
    textAlign: 'center',
    fontSize: 20,
    
  },
  header: {
    backgroundColor:"#1f66f2",
    borderBottomLeftRadius: 10,
    borderBottomRightRadius: 10,
    
    
  },
  middle: {
    textAlign: 'center',
    fontSize: 30,
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    
    
  },
  headertext: {
    textAlign: 'left',
    fontSize: 30,
    marginTop:40,
    marginBottom:15,
    marginLeft:30,
    color:"white"
  },
})