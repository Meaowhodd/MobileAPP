import { Image, StyleSheet, Text, View } from 'react-native'

export default function BookScreen() {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <View style={styles.headerpic}>
            <Image source={require('../../assets/images/profile.jpg')} style={styles.img} />
          </View>
          <View>
            <Text style={styles.headertext}>My Booking</Text></View>
          </View>
          
        <View style={styles.middle}><Text style={styles.middletext}>This is BookScreen!!!</Text></View>
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
    fontSize: 30,
    
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
    marginTop:4,
    marginBottom:15,
    marginLeft:30,
    color:"white"
  },

  headerpic: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginRight: 10,
  },
  
  img: {
    width: 35,
    height: 35,
    borderRadius: 50,
    marginBottom: 1,
    marginTop:18,
    borderWidth: 1,
    borderColor: "#000000ff",
  },
})