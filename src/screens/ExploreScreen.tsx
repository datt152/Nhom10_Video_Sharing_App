import React from 'react';
import { View, Text, ScrollView, Image, StyleSheet, TouchableOpacity } from 'react-native';

const ExploreScreen = () => {
  const videos = [
    { id: 1, thumbnail: 'https://placekitten.com/400/250', title: 'Music Vibes 🎶' },
    { id: 2, thumbnail: 'https://placekitten.com/401/250', title: 'Dance Challenge 💃' },
    { id: 3, thumbnail: 'https://placekitten.com/402/250', title: 'Travel Moments 🌍' },
  ];

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Khám Phá</Text>
      <View style={styles.videoGrid}>
        {videos.map(video => (
          <TouchableOpacity key={video.id} style={styles.card}>
            <Image source={{ uri: video.thumbnail }} style={styles.thumbnail} />
            <Text style={styles.caption}>{video.title}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </ScrollView>
  );
};

export default ExploreScreen;

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff', paddingHorizontal: 15 },
  title: { fontSize: 26, fontWeight: 'bold', color: '#FF4EB8', marginVertical: 15 },
  videoGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' },
  card: { width: '48%', marginBottom: 15 },
  thumbnail: { width: '100%', height: 160, borderRadius: 12 },
  caption: { marginTop: 5, color: '#333', fontWeight: '500' },
});
