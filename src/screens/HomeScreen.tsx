import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  Image,
  StyleSheet,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import Header from '../components/Header';
import { useVideo } from '../hooks/useVideo';
import { useImage } from '../hooks/useImage';
import { Video, Image as ImageType } from '../types/database.types';
import {getCurrentUserId} from '../types/config'
const { width } = Dimensions.get('window');
const COLUMN_COUNT = 3;
const IMAGE_SIZE = (width - 40) / COLUMN_COUNT - 8;

type FeedItem = {
  id: string;
  type: 'video' | 'image';
  data: Video | ImageType;
  timestamp: Date;
};

const HomeScreen: React.FC = () => {
  const navigation = useNavigation();
  const { videos, loading: videoLoading, toggleLike: toggleVideoLike, refreshVideos } = useVideo();
  const { getPublicImages, loading: imageLoading, likeImage, unlikeImage } = useImage();

  const [feed, setFeed] = useState<FeedItem[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState<'all' | 'videos' | 'images'>('all');

  // 🔄 Kết hợp video + image thành 1 feed
  const combineFeed = useCallback(async () => {
    const publicImages = await getPublicImages();

    const videoItems: FeedItem[] = videos.map((video) => ({
      id: video.id,
      type: 'video' as const,
      data: video,
      timestamp: new Date(video.createdAt),
    }));

    const imageItems: FeedItem[] = publicImages.map((image) => ({
      id: image.id,
      type: 'image' as const,
      data: image,
      timestamp: new Date(image.createdAt),
    }));

    // Gộp và sắp xếp theo thời gian mới nhất
    const combined = [...videoItems, ...imageItems].sort(
      (a, b) => b.timestamp.getTime() - a.timestamp.getTime()
    );

    setFeed(combined);
  }, [videos, getPublicImages]);

  useEffect(() => {
    combineFeed();
  }, [combineFeed]);

  // 🔄 Pull to refresh
  const onRefresh = async () => {
    setRefreshing(true);
    await refreshVideos();
    await combineFeed();
    setRefreshing(false);
  };

  // 🎯 Filter feed theo tab
  const filteredFeed = feed.filter((item) => {
    if (activeTab === 'all') return true;
    if (activeTab === 'videos') return item.type === 'video';
    if (activeTab === 'images') return item.type === 'image';
    return true;
  });

  // ❤️ Toggle like
  const handleLike = async (item: FeedItem) => {
    if (item.type === 'video') {
      const video = item.data as Video;
      await toggleVideoLike(video.id);
    } else {
      const image = item.data as ImageType;
      if (image.isLiked) {
        await unlikeImage(image.id);
      } else {
        await likeImage(image.id);
      }
    }
    await combineFeed();
  };

  // 🎬 Navigate đến detail
  const handleItemPress = (item: FeedItem) => {
    if (item.type === 'video') {
      navigation.navigate('VideoCard' as never, { id: item.id } as never);
    } else {
     const image = item.data as ImageType;
      navigation.navigate('UserImageViewer' as never, {
        images: [image],
        initialIndex: 0,
        getCurrentUserId,
      } as never);
      
    }
  };

  // 👤 Navigate đến profile
  const handleUserPress = (userId: string) => {
    navigation.navigate('Profile', { userId })
  };

  if (videoLoading || imageLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#FF4EB8" />
        <Text style={styles.loadingText}>Đang tải...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Header />

      {/* 📑 Tab Filter */}
      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'all' && styles.activeTab]}
          onPress={() => setActiveTab('all')}
        >
          <Text style={[styles.tabText, activeTab === 'all' && styles.activeTabText]}>
            Tất cả
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'videos' && styles.activeTab]}
          onPress={() => setActiveTab('videos')}
        >
          <Ionicons
            name="videocam"
            size={18}
            color={activeTab === 'videos' ? '#FF4EB8' : '#999'}
          />
          <Text style={[styles.tabText, activeTab === 'videos' && styles.activeTabText]}>
            Videos
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'images' && styles.activeTab]}
          onPress={() => setActiveTab('images')}
        >
          <Ionicons
            name="image"
            size={18}
            color={activeTab === 'images' ? '#FF4EB8' : '#999'}
          />
          <Text style={[styles.tabText, activeTab === 'images' && styles.activeTabText]}>
            Ảnh
          </Text>
        </TouchableOpacity>
      </View>

      {/* 📜 Feed List */}
      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        {filteredFeed.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Ionicons name="albums-outline" size={64} color="#ccc" />
            <Text style={styles.emptyText}>Chưa có bài đăng nào</Text>
          </View>
        ) : (
          filteredFeed.map((item) => {
            const data = item.data as any;
            const isVideo = item.type === 'video';

            return (
              <View key={item.id} style={styles.feedCard}>
                {/* 👤 User Info */}
                <TouchableOpacity
                  style={styles.userInfo}
                  onPress={() => handleUserPress(data.user?.id)}
                >
                  <Image
                    source={{ uri: data.user?.avatar || 'https://i.pravatar.cc/100' }}
                    style={styles.userAvatar}
                  />
                  <View style={styles.userDetails}>
                    <Text style={styles.userName}>{data.user?.fullname || 'Unknown'}</Text>
                    <Text style={styles.postTime}>
                      {new Date(data.createdAt).toLocaleDateString('vi-VN')}
                    </Text>
                  </View>
                </TouchableOpacity>

                {/* 📝 Title & Caption */}
                <TouchableOpacity onPress={() => handleItemPress(item)}>
                  <Text style={styles.title}>{data.title}</Text>
                  {data.caption && (
                    <Text style={styles.caption} numberOfLines={2}>
                      {data.caption}
                    </Text>
                  )}
                </TouchableOpacity>

                {/* 🖼️ Media Preview */}
                <TouchableOpacity
                  style={styles.mediaContainer}
                  onPress={() => handleItemPress(item)}
                >
                  <Image
                    source={{
                      uri: isVideo
                        ? data.thumbnailUrl
                        : data.imageUrl,
                    }}
                    style={styles.mediaImage}
                  />
                  {isVideo && (
                    <View style={styles.playIconContainer}>
                      <Ionicons name="play-circle" size={56} color="rgba(255,255,255,0.9)" />
                    </View>
                  )}
                </TouchableOpacity>

                {/* 🏷️ Tags */}
                {data.tags && data.tags.length > 0 && (
                  <View style={styles.tagsContainer}>
                    {data.tags.slice(0, 3).map((tag: string, index: number) => (
                      <View key={index} style={styles.tagChip}>
                        <Text style={styles.tagText}>#{tag}</Text>
                      </View>
                    ))}
                  </View>
                )}

                
              </View>
            );
          })
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FAFAFA',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 14,
    color: '#999',
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  tab: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    marginRight: 10,
    backgroundColor: '#f5f5f5',
    gap: 4,
  },
  activeTab: {
    backgroundColor: '#FFE5F2',
  },
  tabText: {
    fontSize: 14,
    color: '#999',
    fontWeight: '500',
  },
  activeTabText: {
    color: '#FF4EB8',
    fontWeight: '600',
  },
  feedCard: {
    backgroundColor: '#fff',
    marginBottom: 12,
    paddingVertical: 16,
    paddingHorizontal: 16,
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  userAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 10,
  },
  userDetails: {
    flex: 1,
  },
  userName: {
    fontSize: 15,
    fontWeight: '600',
    color: '#333',
  },
  postTime: {
    fontSize: 12,
    color: '#999',
    marginTop: 2,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 6,
  },
  caption: {
    fontSize: 14,
    color: '#666',
    marginBottom: 10,
    lineHeight: 20,
  },
  mediaContainer: {
    position: 'relative',
    width: '100%',
    height: 400,
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: '#f0f0f0',
  },
  mediaImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  playIconContainer: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: [{ translateX: -28 }, { translateY: -28 }],
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 10,
    gap: 6,
  },
  tagChip: {
    backgroundColor: '#E8F5FF',
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 12,
  },
  tagText: {
    fontSize: 12,
    color: '#FF4EB8',
    fontWeight: '500',
  },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 12,
    gap: 20,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  actionText: {
    fontSize: 14,
    color: '#333',
    fontWeight: '500',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 80,
  },
  emptyText: {
    marginTop: 16,
    fontSize: 16,
    color: '#999',
  },
});

export default HomeScreen;