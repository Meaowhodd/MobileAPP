import React from 'react'
import { StyleSheet, Text, View } from 'react-native'

export default function HomeScreen() {
    return (
      <View style={styles.container}>
        <View style={styles.text3}><Text style={styles.text4}>Home</Text></View>
        <View style={styles.text1}><Text style={styles.text}>This is HomeScreen!!!</Text></View>
        
      </View>
    )
}

const styles = StyleSheet.create({
  container:{
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  text: {
    textAlign: 'center',
    fontSize: 30,
    
  },
  text3: {
    backgroundColor:"#6462EE",
    
    
  },
  text1: {
    textAlign: 'center',
    fontSize: 30,
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    
    
  },
  text4: {
    textAlign: 'left',
    fontSize: 30,
    marginTop:40,
    marginBottom:5,
    marginLeft:30,
    color:"white"
  },
})