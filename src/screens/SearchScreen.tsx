import React from 'react';
import { View, TextInput, ScrollView, Text, Image, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Header from '../components/Header';

const SearchScreen: React.FC = () => {
  return (
    <View style={styles.container}>
      <Header />
      <View style={styles.searchBox}>
        <Ionicons name="search" size={22} color="#FF4EB8" />
        <TextInput placeholder="Search videos or users..." style={styles.input} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        <Text style={styles.sectionTitle}>Trending Tags</Text>
        <View style={styles.tagsRow}>
          {['#Dance', '#Travel', '#Food', '#DIY', '#Study'].map((tag, i) => (
            <Text key={i} style={styles.tag}>{tag}</Text>
          ))}
        </View>

        <Text style={styles.sectionTitle}>Popular Videos</Text>
        {Array.from({ length: 5 }).map((_, i) => (
          <View key={i} style={styles.videoCard}>
            <Image source={{ uri: `https://picsum.photos/400/250?random=${i}` }} style={styles.videoThumb} />
            <Text style={styles.videoTitle}>Amazing Clip #{i + 1}</Text>
          </View>
        ))}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff'},
  searchBox: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: '#F8F8F8', margin: 20, borderRadius: 12, paddingHorizontal: 10
  },
  input: { flex: 1, padding: 8 },
  sectionTitle: { fontSize: 18, fontWeight: '600', marginHorizontal: 20, marginTop: 15, color: '#111' },
  tagsRow: { flexDirection: 'row', flexWrap: 'wrap', marginHorizontal: 20 },
  tag: { color: '#FF4EB8', backgroundColor: '#FFE6F2', paddingHorizontal: 10, paddingVertical: 5, borderRadius: 15, margin: 5 },
  videoCard: { margin: 15, borderRadius: 12, overflow: 'hidden', backgroundColor: '#fafafa' },
  videoThumb: { width: '100%', height: 200 },
  videoTitle: { padding: 10, fontWeight: '500' },
});

export default SearchScreen;
