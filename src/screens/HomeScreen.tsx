import React from 'react';
import { View, Text, ScrollView, Image, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Header from '../components/Header';

const HomeScreen: React.FC = () => {
  return (
    <View style={styles.container}>
      {/* HEADER */}
      <Header />

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* STORIES SECTION */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Stories</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {Array.from({ length: 8 }).map((_, index) => (
              <View key={index} style={styles.storyItem}>
                <Image
                  source={{ uri: `https://i.pravatar.cc/100?img=${index + 1}` }}
                  style={styles.storyAvatar}
                />
                <Text style={styles.storyName}>User {index + 1}</Text>
              </View>
            ))}
          </ScrollView>
        </View>

        {/* TRENDING SECTION */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Trending</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {Array.from({ length: 5 }).map((_, index) => (
              <View key={index} style={styles.trendingCard}>
                <Image
                  source={{ uri: `https://picsum.photos/400/700?random=${index}` }}
                  style={styles.trendingImage}
                />
              </View>
            ))}
          </ScrollView>
        </View>

        {/* TOPIC SECTION */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Browse Topics</Text>
          <View style={styles.topicGrid}>
            {['Dance', 'Music', 'Travel', 'Food', 'Sport', 'Art', 'Game', 'Pets', 'DIY', 'Study'].map((topic, index) => (
              <TouchableOpacity key={index} style={styles.topicButton}>
                <Text style={styles.topicText}>{topic}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* STREAMING SECTION */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Live Streams</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {Array.from({ length: 4 }).map((_, index) => (
              <View key={index} style={styles.liveCard}>
                <Image
                  source={{ uri: `https://picsum.photos/300/500?random=${index + 5}` }}
                  style={styles.liveImage}
                />
                <Text style={styles.liveUser}>Streamer {index + 1}</Text>
              </View>
            ))}
          </ScrollView>
        </View>

        {/* AUDIO SECTION */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Hot Audio</Text>
          {Array.from({ length: 5 }).map((_, index) => (
            <View key={index} style={styles.audioRow}>
              <Ionicons name="musical-notes-outline" size={22} color="#FF4EB8" />
              <Text style={styles.audioText}>Popular Track #{index + 1}</Text>
            </View>
          ))}
        </View>
      </ScrollView>


    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  section: {
    marginBottom: 25,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111',
    marginLeft: 20,
    marginBottom: 10,
  },
  storyItem: {
    alignItems: 'center',
    marginHorizontal: 10,
  },
  storyAvatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    borderWidth: 2,
    borderColor: '#FF4EB8',
  },
  storyName: {
    fontSize: 12,
    marginTop: 5,
  },
  trendingCard: {
    width: 150,
    height: 230,
    borderRadius: 16,
    overflow: 'hidden',
    marginHorizontal: 10,
  },
  trendingImage: {
    width: '100%',
    height: '100%',
  },
  topicGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-around',
    paddingHorizontal: 10,
  },
  topicButton: {
    backgroundColor: '#FFE5F2',
    paddingVertical: 8,
    paddingHorizontal: 15,
    borderRadius: 20,
    margin: 6,
  },
  topicText: {
    color: '#FF4EB8',
    fontWeight: '500',
  },
  liveCard: {
    marginHorizontal: 10,
    alignItems: 'center',
  },
  liveImage: {
    width: 140,
    height: 200,
    borderRadius: 16,
  },
  liveUser: {
    marginTop: 5,
    fontWeight: '500',
  },
  audioRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginVertical: 6,
  },
  audioText: {
    marginLeft: 10,
    fontSize: 15,
    color: '#333',
  },
});

export default HomeScreen;
