import React, { useState, useEffect } from 'react';
import {
  View,
  TextInput,
  ScrollView,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Header from '../components/Header';
import { useVideo } from '../hooks/useVideo';
import { useNavigation } from '@react-navigation/native';

const { width } = Dimensions.get('window');
const CARD_WIDTH = (width - 45) / 2; // 2 cột + khoảng cách

const SearchScreen: React.FC = () => {
  const [query, setQuery] = useState('');
  const [filtered, setFiltered] = useState<any[]>([]);
  const { videos, loading } = useVideo();
  const navigation: any = useNavigation();

  useEffect(() => {
    if (!query.trim()) {
      setFiltered([]);
      return;
    }
    const q = query.toLowerCase();
    const result = videos.filter(
      (v) =>
        v.title?.toLowerCase().includes(q) ||
        v.user?.fullname?.toLowerCase().includes(q)
    );
    setFiltered(result);
  }, [query, videos]);

  const renderVideoCard = (v: any, i: number) => (
    <TouchableOpacity
      key={v.id || i}
      onPress={() =>
        navigation.getParent()?.navigate("VideoCard", { id: v.id })
      }
      style={styles.card}
    >
      <Image
        source={{ uri: v.thumbnail || `https://picsum.photos/400/250?random=${i}` }}
        style={styles.thumb}
      />
      <View style={styles.cardBottom}>
        <Image
          source={{ uri: v.user?.avatar }}
          style={styles.avatar}
        />
        <View style={{ flex: 1 }}>
          <Text style={styles.videoTitle} numberOfLines={2}>
            {v.title}
          </Text>
          <Text style={styles.username} numberOfLines={1}>
            {v.user?.fullname || v.user?.username}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <Header />
      <View style={styles.searchBox}>
        <Ionicons name="search" size={22} color="#FF4EB8" />
        <TextInput
          placeholder="Search videos or users..."
          style={styles.input}
          value={query}
          onChangeText={setQuery}
        />
      </View>

      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color="#FF4EB8" />
        </View>
      ) : (
        <ScrollView showsVerticalScrollIndicator={false}>
          {!query ? (
            <>
              <Text style={styles.sectionTitle}>Trending Tags</Text>
              <View style={styles.tagsRow}>
                {['#Dance', '#Travel', '#Food', '#DIY', '#Study'].map((tag, i) => (
                  <Text key={i} style={styles.tag}>
                    {tag}
                  </Text>
                ))}
              </View>

              <Text style={styles.sectionTitle}>Popular Videos</Text>
              <View style={styles.grid}>
                {videos.slice(0, 6).map((v, i) => renderVideoCard(v, i))}
              </View>
            </>
          ) : filtered.length > 0 ? (
            <>
              <Text style={styles.sectionTitle}>
                {filtered.length} results for "{query}"
              </Text>
              <View style={styles.grid}>
                {filtered.map((v, i) => renderVideoCard(v, i))}
              </View>
            </>
          ) : (
            <View style={styles.center}>
              <Text style={{ color: '#888' }}>No videos found for "{query}"</Text>
            </View>
          )}
        </ScrollView>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8F8F8',
    margin: 20,
    borderRadius: 12,
    paddingHorizontal: 10,
  },
  input: { flex: 1, padding: 8 },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginHorizontal: 20,
    marginTop: 15,
    color: '#111',
  },
  tagsRow: { flexDirection: 'row', flexWrap: 'wrap', marginHorizontal: 20 },
  tag: {
    color: '#FF4EB8',
    backgroundColor: '#FFE6F2',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 15,
    margin: 5,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginHorizontal: 15,
  },
  card: {
    width: CARD_WIDTH,
    backgroundColor: '#fafafa',
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 15,
  },
  thumb: { width: '100%', height: 150 },
  cardBottom: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 8,
  },
  avatar: {
    width: 30,
    height: 30,
    borderRadius: 15,
    marginRight: 8,
  },
  videoTitle: {
    fontWeight: '600',
    color: '#222',
    fontSize: 14,
  },
  username: {
    color: '#666',
    fontSize: 12,
  },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', marginTop: 40 },
});

export default SearchScreen;
