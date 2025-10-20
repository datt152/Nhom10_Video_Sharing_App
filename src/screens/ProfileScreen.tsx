import React from 'react';
import { View, Text, Image, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';

const ProfileScreen = () => {
  const videos = [
    { id: 1, thumbnail: 'https://placekitten.com/400/250' },
    { id: 2, thumbnail: 'https://placekitten.com/401/250' },
    { id: 3, thumbnail: 'https://placekitten.com/402/250' },
    { id: 4, thumbnail: 'https://placekitten.com/403/250' },
  ];

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Image source={{ uri: 'https://i.pravatar.cc/150' }} style={styles.avatar} />
        <Text style={styles.name}>Kon Natachai</Text>
        <Text style={styles.bio}>🎥 Yêu thích sáng tạo và chia sẻ video thú vị mỗi ngày</Text>
        <TouchableOpacity style={styles.editButton}>
          <Text style={styles.editText}>Chỉnh sửa hồ sơ</Text>
        </TouchableOpacity>
      </View>

      <Text style={styles.sectionTitle}>Video của bạn</Text>
      <View style={styles.videoGrid}>
        {videos.map(video => (
          <Image key={video.id} source={{ uri: video.thumbnail }} style={styles.videoThumbnail} />
        ))}
      </View>
    </ScrollView>
  );
};

export default ProfileScreen;

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  header: { alignItems: 'center', paddingVertical: 20 },
  avatar: { width: 100, height: 100, borderRadius: 50, marginBottom: 10 },
  name: { fontSize: 22, fontWeight: 'bold', color: '#FF4EB8' },
  bio: { fontSize: 14, color: '#666', textAlign: 'center', marginVertical: 8, paddingHorizontal: 20 },
  editButton: {
    backgroundColor: '#FF4EB8',
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 20,
  },
  editText: { color: '#fff', fontWeight: '600' },
  sectionTitle: { fontSize: 20, fontWeight: 'bold', color: '#333', marginLeft: 15, marginBottom: 10 },
  videoGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', paddingHorizontal: 15 },
  videoThumbnail: { width: '48%', height: 160, borderRadius: 10, marginBottom: 10 },
});
