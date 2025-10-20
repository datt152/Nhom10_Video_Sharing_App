import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const Header = () => {
  return (
    <View style={styles.header}>
      <Text style={styles.logo}>VidShare</Text>
      <TouchableOpacity>
        <Ionicons name="notifications-outline" size={26} color="#FF4EB8" />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 10,
  },
  logo: {
    fontSize: 24,
    fontWeight: '700',
    color: '#FF4EB8',
  },
});

export default Header;
