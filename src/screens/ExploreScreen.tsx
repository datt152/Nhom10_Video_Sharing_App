import React, { useRef, useState, useCallback } from 'react';
import {
  View,
  FlatList,
  Dimensions,
  StyleSheet,
  ViewToken,
  StatusBar,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import VideoCard from '../components/VideoCard';
import { useVideo } from '../hooks/useVideo';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

export default function ExploreScreen() {
  const { 
    videos, 
    loading, 
    followingStatus, 
    currentUserId,
    toggleLike, 
    toggleFollow, 
    refreshVideos 
  } = useVideo();
  
  const [currentIndex, setCurrentIndex] = useState(0);
  const [refreshing, setRefreshing] = useState(false);

  // ✅ Viewability config - Phát hiện nhanh hơn
  const viewabilityConfig = useRef({
    itemVisiblePercentThreshold: 51, // 51% là đủ
    waitForInteraction: false, // Không chờ interaction
    minimumViewTime: 0, // ✅ Không delay, phát hiện ngay lập tức
  }).current;

  // ✅ Callback cập nhật currentIndex NGAY LẬP TỨC
  const onViewableItemsChanged = useRef(
    ({ viewableItems }: { viewableItems: ViewToken[] }) => {
      if (viewableItems.length > 0 && viewableItems[0].index !== null) {
        const newIndex = viewableItems[0].index;
        setCurrentIndex(newIndex);
        console.log(`📹 Active video index: ${newIndex}`);
      }
    }
  ).current;

  const handleRefresh = async () => {
    setRefreshing(true);
    await refreshVideos();
    setRefreshing(false);
  };

  // ✅ Render item với memo
  const renderItem = useCallback(({ item, index }: any) => {
    return (
      <VideoCard
        video={item}
        isActive={index === currentIndex}
        isFollowing={item.user ? followingStatus[item.user.id] || false : false}
        currentUserId={currentUserId}
        isFirstVideo={index === 0}
        isLastVideo={index === videos.length - 1}
        onToggleLike={toggleLike}
        onToggleFollow={toggleFollow}
      />
    );
  }, [currentIndex, followingStatus, currentUserId, videos.length, toggleLike, toggleFollow]);

  const keyExtractor = useCallback((item: any) => item.id, []);

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#000" />
      
      <FlatList
        data={videos}
        renderItem={renderItem}
        keyExtractor={keyExtractor}
        pagingEnabled
        showsVerticalScrollIndicator={false}
        snapToInterval={SCREEN_HEIGHT}
        snapToAlignment="start"
        decelerationRate="fast"
        viewabilityConfig={viewabilityConfig}
        onViewableItemsChanged={onViewableItemsChanged}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            tintColor="#fff"
          />
        }
        // ✅ Tối ưu performance
        removeClippedSubviews={true}
        maxToRenderPerBatch={1} // ✅ Chỉ render 1 video/lần
        windowSize={3} // Giữ 3 video (trước, hiện tại, sau)
        initialNumToRender={1}
        updateCellsBatchingPeriod={50} // ✅ Update nhanh hơn
        getItemLayout={(data, index) => ({
          length: SCREEN_HEIGHT,
          offset: SCREEN_HEIGHT * index,
          index,
        })}
      />

      {loading && (
        <View style={styles.loader}>
          <ActivityIndicator size="large" color="#fff" />
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  loader: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: [{ translateX: -25 }, { translateY: -25 }],
  },
});