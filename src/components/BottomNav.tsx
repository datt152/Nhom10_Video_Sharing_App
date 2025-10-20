import React from 'react';
import { View, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const BottomNav = () => {
  return (
    <View style={styles.bottomNav}>
      <Ionicons name="home" size={26} color="#FF4EB8" />
      <Ionicons name="search" size={26} color="#555" />
      <TouchableOpacity style={styles.uploadButton}>
        <Ionicons name="add" size={28} color="#fff" />
      </TouchableOpacity>
      <Ionicons name="people-outline" size={26} color="#555" />
      <Ionicons name="person-outline" size={26} color="#555" />
    </View>
  );
};

const styles = StyleSheet.create({
  bottomNav: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    borderTopWidth: 1,
    borderColor: '#eee',
    paddingVertical: 10,
    marginBottom: 35,
    borderTopColor: 'black'
},
  uploadButton: {
    backgroundColor: '#FF4EB8',
    width: 40,
    height: 40,
    borderRadius: 27,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#FF4EB8',
    shadowOpacity: 0.3,
    shadowRadius: 5,
  },
});

export default BottomNav;
