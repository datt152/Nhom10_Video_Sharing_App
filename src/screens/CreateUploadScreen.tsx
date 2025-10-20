import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Header from '../components/Header';

const CreateUploadScreen: React.FC = () => (
  <View style={styles.container}>
    <Header />
    <View style={styles.center}>
      <Ionicons name="cloud-upload-outline" size={80} color="#FF4EB8" />
      <Text style={styles.title}>Upload Your Video</Text>
      <TouchableOpacity style={styles.button}>
        <Text style={styles.btnText}>Choose from Gallery</Text>
      </TouchableOpacity>
      <TouchableOpacity style={[styles.button, styles.outline]}>
        <Text style={[styles.btnText, { color: '#FF4EB8' }]}>Record New Video</Text>
      </TouchableOpacity>
    </View>
  </View>
);

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff', paddingTop: 50 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  title: { fontSize: 20, fontWeight: '600', marginVertical: 20, color: '#111' },
  button: {
    backgroundColor: '#FF4EB8', borderRadius: 25, paddingVertical: 12,
    paddingHorizontal: 30, marginTop: 10,
  },
  outline: { backgroundColor: '#fff', borderWidth: 2, borderColor: '#FF4EB8' },
  btnText: { color: '#fff', fontWeight: '600' },
});

export default CreateUploadScreen;
