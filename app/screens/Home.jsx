import { Image, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native'

export default function HomeScreen() {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <View style={styles.headerpic}>
            <Image source={require('../../assets/images/profile.jpg')} style={styles.img} />
          </View>
          <Text style={styles.headertext}>Meeting Rooms</Text>
          <TextInput style={styles.input} keyboardType="default" placeholder="Search Meeting Room" />
        </View>
        <ScrollView>
          <View style={styles.middle}>
            <View style={styles.item}>
              <View >
                <Image source={require('../../assets/images/Room1.jpg')} style={styles.imgitem} />
              </View>
              <View>
                <Text style={styles.itemtext}>Room : A301</Text>
                <Text style={styles.itemtext}>People : 8-10</Text>
                <Text style={styles.itemtext}>Floor : 4</Text>
              </View>
              <View>
                <TouchableOpacity style={styles.itembutton}>
                  <Text style={styles.itemtext}>Book Now</Text>
                </TouchableOpacity>
              </View>
              
            </View>
          </View>
          <View style={styles.middle}>
            <View style={styles.item}>
              <View >
                <Image source={require('../../assets/images/Room1.jpg')} style={styles.imgitem} />
              </View>
              <View>
                <Text style={styles.itemtext}>Room : A301</Text>
                <Text style={styles.itemtext}>People : 8-10</Text>
                <Text style={styles.itemtext}>Floor : 3</Text>
              </View>
              <View>
                <TouchableOpacity style={styles.itembutton}>
                  <Text style={styles.itemtext}>Book Now</Text>
                </TouchableOpacity>
              </View>
              
            </View>
          </View>
          <View style={styles.middle}>
            <View style={styles.item}>
              <View >
                <Image source={require('../../assets/images/Room1.jpg')} style={styles.imgitem} />
              </View>
              <View>
                <Text style={styles.itemtext}>Room : A301</Text>
                <Text style={styles.itemtext}>People : 8-10</Text>
                <Text style={styles.itemtext}>Floor : 3</Text>
              </View>
              <View>
                <TouchableOpacity style={styles.itembutton}>
                  <Text style={styles.itemtext}>Book Now</Text>
                </TouchableOpacity>
              </View>
              
            </View>
          </View>
          <View style={styles.middle}>
            <View style={styles.item}>
              <View >
                <Image source={require('../../assets/images/Room1.jpg')} style={styles.imgitem} />
              </View>
              <View>
                <Text style={styles.itemtext}>Room : A301</Text>
                <Text style={styles.itemtext}>People : 8-10</Text>
                <Text style={styles.itemtext}>Floor : 3</Text>
              </View>
              <View>
                <TouchableOpacity style={styles.itembutton}>
                  <Text style={styles.itemtext}>Book Now</Text>
                </TouchableOpacity>
              </View>
              
            </View>
          </View>
        </ScrollView>
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

  itemtext: {
    textAlign: 'center',
    fontSize: 15,
  },

  itembutton: {
    marginTop: 'auto',
    backgroundColor: '#1f66f2',
    padding: 10,
    borderRadius: 8,
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

  imgitem: {
    width: 130,
    height: 130,
    borderWidth: 1,
    borderColor: "#000000ff",
    borderRadius: 10,
  },

  input: {
    height: 40,
    borderColor: "#B0C4DE",
    borderWidth: 1,
    borderRadius: 8,
    marginBottom: 16,
    paddingHorizontal: 10,
    backgroundColor: "#FFFFFF",
    color: "#1F2937",
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 2,
    marginTop: 10,
    marginLeft:20,
    marginRight:20,


  },

  headertext: {
    textAlign: 'left',
    fontSize: 30,
    marginTop:4,
    marginBottom:5,
    marginLeft:30,
    color:"white"
  },
  item: {
    backgroundColor: '#f5f7ffff',
    padding: 20,
    borderRadius: 10,
    width: '95%',
    borderWidth: 1,
    marginTop: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
})