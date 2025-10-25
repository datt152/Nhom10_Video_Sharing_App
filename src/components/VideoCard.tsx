import React, { useEffect, useRef, useState, memo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  TouchableOpacity,
  Image,
  Animated,
  PanResponder,
} from 'react-native';
import { Video as ExpoVideo, ResizeMode, AVPlaybackStatus } from 'expo-av';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { Video } from '../types/database.types';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

interface VideoCardProps {
  video: Video;
  isActive: boolean;
  isFollowing: boolean;
  currentUserId: string;
  isFirstVideo?: boolean;
  isLastVideo?: boolean;
  onToggleLike: (videoId: string) => void;
  onToggleFollow: (userId: string) => void;
}

function VideoCard({
  video,
  isActive,
  isFollowing,
  currentUserId,
  isFirstVideo = false,
  isLastVideo = false,
  onToggleLike,
  onToggleFollow,
}: VideoCardProps) {
  const videoRef = useRef<ExpoVideo>(null);
  const [isPaused, setIsPaused] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [showPlayButton, setShowPlayButton] = useState(false);
  const [isSeeking, setIsSeeking] = useState(false);
  
  const likeAnimation = useRef(new Animated.Value(0)).current;
  const playButtonOpacity = useRef(new Animated.Value(0)).current;

  // ✅ TẮT VIDEO NGAY LẬP TỨC - Chạy đầu tiên
  useEffect(() => {
    if (!isActive) {
      // ✅ QUAN TRỌNG: Pause ngay lập tức không cần await
      videoRef.current?.pauseAsync();
      videoRef.current?.setPositionAsync(0);
      setCurrentTime(0);
      setIsPaused(false);
      setShowPlayButton(false);
      console.log(`⏹️ STOPPED video ${video.id} immediately`);
      return; // ✅ Return sớm để không chạy code bên dưới
    }

    // ✅ Chỉ play khi active
    const playVideo = async () => {
      try {
        const status = await videoRef.current?.getStatusAsync();
        if (status?.isLoaded && isActive) {
          await videoRef.current?.playAsync();
          setIsPaused(false);
          setShowPlayButton(false);
          console.log(`▶️ Playing video ${video.id}`);
        }
      } catch (error) {
        console.error(`Error playing video ${video.id}:`, error);
      }
    };

    playVideo();
  }, [isActive, video.id]);

  // ✅ Cleanup khi unmount - TẮT NGAY
  useEffect(() => {
    return () => {
      console.log(`🗑️ Unmounting video ${video.id}`);
      videoRef.current?.pauseAsync();
      videoRef.current?.setPositionAsync(0);
      // Không unload để tránh flicker
    };
  }, [video.id]);

  // Cập nhật thời gian video
  const onPlaybackStatusUpdate = (status: AVPlaybackStatus) => {
    if (status.isLoaded && !isSeeking && isActive) {
      setCurrentTime(status.positionMillis / 1000);
      setDuration(status.durationMillis ? status.durationMillis / 1000 : 0);
    }
  };

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderGrant: (evt) => {
        setIsSeeking(true);
        handleSeek(evt.nativeEvent.locationX);
      },
      onPanResponderMove: (evt) => {
        handleSeek(evt.nativeEvent.locationX);
      },
      onPanResponderRelease: () => {
        setIsSeeking(false);
      },
    })
  ).current;

  const handleSeek = (locationX: number) => {
    const progressBarWidth = SCREEN_WIDTH - 32;
    const seekPosition = Math.max(0, Math.min(locationX, progressBarWidth));
    const seekTime = (seekPosition / progressBarWidth) * duration;
    
    setCurrentTime(seekTime);
    videoRef.current?.setPositionAsync(seekTime * 1000);
  };

  const handlePlayPause = () => {
    if (isPaused) {
      videoRef.current?.playAsync();
      setIsPaused(false);
      setShowPlayButton(false);
      hidePlayButton();
    } else {
      videoRef.current?.pauseAsync();
      setIsPaused(true);
      setShowPlayButton(true);
      showPlayButtonAnimation();
    }
  };

  const showPlayButtonAnimation = () => {
    Animated.spring(playButtonOpacity, {
      toValue: 1,
      useNativeDriver: true,
    }).start();
  };

  const hidePlayButton = () => {
    Animated.timing(playButtonOpacity, {
      toValue: 0,
      duration: 300,
      useNativeDriver: true,
    }).start(() => setShowPlayButton(false));
  };

  const handleLike = () => {
    onToggleLike(video.id);
    
    Animated.sequence([
      Animated.spring(likeAnimation, {
        toValue: 1,
        useNativeDriver: true,
      }),
      Animated.spring(likeAnimation, {
        toValue: 0,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const handleFollow = () => {
    if (video.user) {
      onToggleFollow(video.user.id);
    }
  };

  const formatNumber = (num: number | undefined | null): string => {
    if (!num || isNaN(num)) return '0';
    if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
    if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
    return num.toString();
  };

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const likeScale = likeAnimation.interpolate({
    inputRange: [0, 1],
    outputRange: [1, 1.3],
  });

  const isOwnVideo = video.user?.id === currentUserId;
  const progress = duration > 0 ? (currentTime / duration) * 100 : 0;

return (
    <View style={styles.container}>
      {isFirstVideo && (
        <View style={styles.headerBar}>
          <Text style={styles.headerTitle}>Khám Phá</Text>
          <TouchableOpacity>
            <Ionicons name="search" size={24} color="#fff" />
          </TouchableOpacity>
        </View>
      )}

      {/* ✅ Container 16:9 nằm giữa */}
      <View style={styles.videoWrapper}>
        <TouchableOpacity
          style={styles.videoContainer}
          activeOpacity={1}
          onPress={handlePlayPause}
        >
          <ExpoVideo
            ref={videoRef}
            source={{ uri: video.url }}
            style={styles.video}
            resizeMode={ResizeMode.CONTAIN} // ✅ Giữ nguyên tỷ lệ, không crop
            isLooping
            shouldPlay={isActive}
            videoStyle={styles.videoStyle}
            onPlaybackStatusUpdate={onPlaybackStatusUpdate}
            progressUpdateIntervalMillis={100}
          />

          {showPlayButton && (
            <Animated.View
              style={[
                styles.centerPlayButton,
                { opacity: playButtonOpacity },
              ]}
            >
              <View style={styles.playButtonCircle}>
                <Ionicons name="play" size={60} color="#fff" />
              </View>
            </Animated.View>
          )}
        </TouchableOpacity>
      </View>

      {/* Gradient Overlay */}
      <LinearGradient
        colors={['transparent', 'rgba(0,0,0,0.3)', 'rgba(0,0,0,0.8)']}
        style={styles.gradient}
      />

      {/* Bottom Content */}
      <View style={styles.bottomContent}>
        <View style={styles.leftContent}>
          <Text style={styles.username}>@{video.user?.username || 'Unknown'}</Text>
          <Text style={styles.title} numberOfLines={2}>
            {video.title || ''}
          </Text>

          {video.music && (
            <View style={styles.musicContainer}>
              <Ionicons name="musical-note" size={14} color="#fff" />
              <Text style={styles.musicText} numberOfLines={1}>
                {video.music.title} - {video.music.artist}
              </Text>
            </View>
          )}
        </View>

        <View style={styles.rightContent}>
          <View style={styles.avatarContainer}>
            <Image
              source={{ uri: video.user?.avatar || 'https://via.placeholder.com/50' }}
              style={styles.avatar}
            />
            {!isOwnVideo && !isFollowing && (
              <TouchableOpacity
                style={styles.followButton}
                onPress={handleFollow}
                activeOpacity={0.8}
              >
                <Ionicons name="add" size={20} color="#fff" />
              </TouchableOpacity>
            )}
          </View>

          <TouchableOpacity style={styles.actionButton} onPress={handleLike}>
            <Animated.View style={{ transform: [{ scale: likeScale }] }}>
              <Ionicons
                name={video.isLiked ? 'heart' : 'heart-outline'}
                size={35}
                color={video.isLiked ? '#FF3B5C' : '#fff'}
              />
            </Animated.View>
            <Text style={styles.actionText}>{formatNumber(video.likeCount)}</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.actionButton}>
            <Ionicons name="chatbubble-outline" size={32} color="#fff" />
            <Text style={styles.actionText}>{formatNumber(video.commentCount)}</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.actionButton}>
            <Ionicons name="paper-plane-outline" size={30} color="#fff" />
            <Text style={styles.actionText}>{formatNumber(video.shareCount)}</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Progress Bar */}
      <View style={styles.progressBarContainer}>
        <View
          style={styles.progressBarTouchable}
          {...panResponder.panHandlers}
        >
          <Text style={styles.timeText}>
            {formatTime(currentTime)} / {formatTime(duration)}
          </Text>
          <View style={styles.progressBar}>
            <View style={[styles.progressFill, { width: `${progress}%` }]} />
            <View style={[styles.progressDot, { left: `${progress}%` }]} />
          </View>
        </View>
      </View>

      
    </View>
  );
}

export default memo(VideoCard, (prevProps, nextProps) => {
  return (
    prevProps.isActive === nextProps.isActive &&
    prevProps.video.id === nextProps.video.id &&
    prevProps.isFollowing === nextProps.isFollowing &&
    prevProps.video.isLiked === nextProps.video.isLiked &&
    prevProps.video.likeCount === nextProps.video.likeCount
  );
});
const styles = StyleSheet.create({
  container: {
    width: SCREEN_WIDTH,
    height: SCREEN_HEIGHT*0.915,
    backgroundColor: '#000',
    position: 'relative',
    justifyContent: 'center',
    alignItems: 'center',
  },
  // ✅ Header luôn ở top, không bị ảnh hưởng
  headerBar: {
    position: 'absolute',
    top: 0, // ✅ Luôn ở top
    left: 0,
    right: 0,
    height: 60,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    zIndex: 10,
  },
  headerTitle: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
  },
  videoWrapper: {
    width: SCREEN_WIDTH,
    aspectRatio: 16 / 9,
    backgroundColor: '#000',
    justifyContent: 'center',
    alignItems: 'center',
  },
  videoContainer: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  video: {
    width: '100%',
    height: '100%',
    backgroundColor: '#000',
  },
  videoStyle: {
    width: '100%',
    height: '100%',
  },
  centerPlayButton: {
    position: 'absolute',
    justifyContent: 'center',
    alignItems: 'center',
  },
  playButtonCircle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  gradient: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: '50%',
    pointerEvents: 'none',
  },
  // ✅ Bottom content CỐ ĐỊNH từ bottom
  bottomContent: {
    position: 'absolute',
    bottom: 20, // ✅ Cố định từ bottom lên
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingBottom: 20,
    alignItems: 'flex-end',
  },
  leftContent: {
    flex: 1,
    paddingRight: 16,
    justifyContent: 'flex-end',
    maxWidth: SCREEN_WIDTH - 100,
  },
  username: {
    color: '#fff',
    fontSize: 17,
    fontWeight: 'bold',
    marginBottom: 6,
    textShadowColor: 'rgba(0, 0, 0, 0.75)',
    textShadowOffset: { width: -1, height: 1 },
    textShadowRadius: 10,
  },
  title: {
    color: '#fff',
    fontSize: 15,
    marginBottom: 12,
    lineHeight: 20,
    textShadowColor: 'rgba(0, 0, 0, 0.75)',
    textShadowOffset: { width: -1, height: 1 },
    textShadowRadius: 10,
  },
  musicContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  musicText: {
    color: '#fff',
    fontSize: 13,
    marginLeft: 6,
    flex: 1,
    textShadowColor: 'rgba(0, 0, 0, 0.75)',
    textShadowOffset: { width: -1, height: 1 },
    textShadowRadius: 10,
  },
  // ✅ Right content CỐ ĐỊNH
  rightContent: {
    alignItems: 'center',
    gap: 24,
    paddingBottom: 0,
  },
  avatarContainer: {
    position: 'relative',
    marginBottom: 8,
  },
  avatar: {
    width: 52,
    height: 52,
    borderRadius: 26,
    borderWidth: 2,
    borderColor: '#fff',
  },
  followButton: {
    position: 'absolute',
    bottom: -6,
    left: '50%',
    marginLeft: -12,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#FF3B5C',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#fff',
  },
  actionButton: {
    alignItems: 'center',
    gap: 4,
  },
  actionText: {
    color: '#fff',
    fontSize: 13,
    fontWeight: '600',
    textShadowColor: 'rgba(0, 0, 0, 0.75)',
    textShadowOffset: { width: -1, height: 1 },
    textShadowRadius: 10,
  },
  // ✅ Progress bar CỐ ĐỊNH
  progressBarContainer: {
    position: 'absolute',
    bottom: 0, // ✅ Cố định từ bottom lên
    left: 16,
    right: 16,
  },
  timeText: {
    color: '#fff',
    fontSize: 11,
    fontWeight: '600',
    textShadowColor: 'rgba(0, 0, 0, 0.75)',
    textShadowOffset: { width: -1, height: 1 },
    textShadowRadius: 10,
    marginBottom: 4,
  },
  progressBarTouchable: {
    paddingVertical: 10,
  },
  progressBar: {
    width: '100%',
    height: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    borderRadius: 2,
    position: 'relative',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#FF3B5C',
    borderRadius: 2,
  },
  progressDot: {
    position: 'absolute',
    top: -4,
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#fff',
    marginLeft: -6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
    elevation: 5,
  },
  // ✅ Footer luôn ở bottom
  footerBar: {
    position: 'absolute',
    bottom: 0, // ✅ Luôn ở bottom
    left: 0,
    right: 0,
    height: 80,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
  },
  footerText: {
    color: '#fff',
    fontSize: 16,
    marginBottom: 10,
  },
  reloadButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 20,
    paddingVertical: 10,
    backgroundColor: '#FF3B5C',
    borderRadius: 20,
  },
  reloadText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
});