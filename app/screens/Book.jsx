import React from 'react'
import { StyleSheet, Text, View } from 'react-native'

export default function BookScreen() {
    return (
      <View style={styles.container}>
        <Text style={styles.text}>This is Book Screen</Text>
      </View>
    )
}


const styles = StyleSheet.create({
    container:{
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: '#FFFFFF',
    },
    text: {
      textAlign: 'center',
      fontSize: 30,
      
      
    }
  })