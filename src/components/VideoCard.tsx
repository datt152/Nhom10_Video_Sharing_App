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
  AppState,
  AppStateStatus,
  Modal,
} from 'react-native';
import { Video as ExpoVideo, ResizeMode, AVPlaybackStatus } from 'expo-av';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { Video } from '../types/database.types';
import CommentModal from './CommentModal';
import { useComments } from '../hooks/useComment';
import { useFocusEffect } from '@react-navigation/native';
import { useBottomTabBarHeight } from '@react-navigation/bottom-tabs';

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
  const tabBarHeight = useBottomTabBarHeight();
  const videoRef = useRef<ExpoVideo>(null);
  
  const [isPaused, setIsPaused] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [showPlayButton, setShowPlayButton] = useState(false);
  const [isSeeking, setIsSeeking] = useState(false);
  const [isScreenFocused, setIsScreenFocused] = useState(true);
  
  // 🎵 Music states (chỉ cho animation)
  const [isMuted, setIsMuted] = useState(false);
  const musicDiscRotation = useRef(new Animated.Value(0)).current;
  const musicDiscScale = useRef(new Animated.Value(1)).current;
  
  const likeAnimation = useRef(new Animated.Value(0)).current;
  const playButtonOpacity = useRef(new Animated.Value(0)).current;
  const [showComments, setShowComments] = useState(false);
  const [localCommentCount, setLocalCommentCount] = useState(video.commentCount);
  const { comments, loading, fetchComments, addComment, deleteComment, likeComment } = useComments(video.id);

  useEffect(() => {
    setLocalCommentCount(video.commentCount);
  }, [video.commentCount]);

  // 🎵 Music disc rotation animation (chỉ UI effect)
  useEffect(() => {
    if (isActive && !isPaused && !isMuted) {
      musicDiscRotation.setValue(0);
      const rotationAnimation = Animated.loop(
        Animated.timing(musicDiscRotation, {
          toValue: 1,
          duration: 3000,
          useNativeDriver: true,
        })
      );
      rotationAnimation.start();

      Animated.spring(musicDiscScale, {
        toValue: 1,
        friction: 3,
        useNativeDriver: true,
      }).start();

      return () => {
        musicDiscRotation.stopAnimation();
      };
    } else {
      musicDiscRotation.stopAnimation();
      Animated.spring(musicDiscScale, {
        toValue: 0.8,
        friction: 3,
        useNativeDriver: true,
      }).start();
    }
  }, [isActive, isPaused, isMuted, musicDiscRotation, musicDiscScale]);

  // ✅ Quản lý playback đơn giản (giống TikTok)
  useEffect(() => {
    const managePlayback = async () => {
      if (!isActive || !isScreenFocused) {
        // Stop video khi không active
        await videoRef.current?.pauseAsync();
        await videoRef.current?.setPositionAsync(0);
        setCurrentTime(0);
        setIsPaused(false);
        setShowPlayButton(false);
        console.log(`⏹️ STOPPED video ${video.id}`);
        return;
      }

      // Play video khi active (audio đã trong video)
      try {
        const videoStatus = await videoRef.current?.getStatusAsync();
        if (videoStatus?.isLoaded) {
          await videoRef.current?.setVolumeAsync(isMuted ? 0 : 1);
          await videoRef.current?.playAsync();
          console.log(`▶️ Playing video ${video.id}`);
        }

        setIsPaused(false);
        setShowPlayButton(false);
      } catch (error) {
        console.error(`Error playing video ${video.id}:`, error);
      }
    };

    managePlayback();
  }, [isActive, isScreenFocused, video.id, isMuted]);

  useFocusEffect(
    React.useCallback(() => {
      console.log(`📍 Screen focused - Video ${video.id}`);
      setIsScreenFocused(true);

      return () => {
        console.log(`📍 Screen unfocused - Video ${video.id} will pause`);
        setIsScreenFocused(false);
        videoRef.current?.pauseAsync().catch(() => {});
      };
    }, [video.id])
  );

  useEffect(() => {
    const subscription = AppState.addEventListener('change', (nextAppState: AppStateStatus) => {
      if (nextAppState === 'background' || nextAppState === 'inactive') {
        videoRef.current?.pauseAsync().catch(() => {});
        console.log(`⏸️ App went to ${nextAppState} - Paused video ${video.id}`);
      } else if (nextAppState === 'active' && isActive && isScreenFocused && !isPaused) {
        videoRef.current?.playAsync().catch(() => {});
        console.log(`▶️ App became active - Resumed video ${video.id}`);
      }
    });

    return () => {
      subscription.remove();
    };
  }, [isActive, isPaused, isScreenFocused, video.id]);

  const handleOpenComments = () => {
    console.log('💬 Opening comments for video:', video.id);
    setShowComments(true);
    fetchComments();
  };

  const handleDeleteComment = async (commentId: string, parentId: string | null = null) => {
    await deleteComment(commentId, parentId);
    setLocalCommentCount((prev) => Math.max(0, prev - 1));
  };

  const handleAddComment = async (content: string, parentId: string | null = null) => {
    try {
      await addComment(content, parentId);
      setLocalCommentCount((prev) => prev + 1);
    } catch (error) {
      console.error('❌ Error adding comment:', error);
    }
  };

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

  const handleSeek = async (locationX: number) => {
    const progressBarWidth = SCREEN_WIDTH - 32;
    const seekPosition = Math.max(0, Math.min(locationX, progressBarWidth));
    const seekTime = (seekPosition / progressBarWidth) * duration;
    
    setCurrentTime(seekTime);
    await videoRef.current?.setPositionAsync(seekTime * 1000);
  };

  const handlePlayPause = async () => {
    if (isPaused) {
      await videoRef.current?.playAsync();
      setIsPaused(false);
      setShowPlayButton(false);
      hidePlayButton();
    } else {
      await videoRef.current?.pauseAsync();
      setIsPaused(true);
      setShowPlayButton(true);
      showPlayButtonAnimation();
    }
  };

  const handleToggleMute = async () => {
    const newMutedState = !isMuted;
    setIsMuted(newMutedState);
    await videoRef.current?.setVolumeAsync(newMutedState ? 0 : 1);
    console.log(`🔊 Video ${video.id} ${newMutedState ? 'MUTED' : 'UNMUTED'}`);
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

  const spin = musicDiscRotation.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  const isOwnVideo = video.user?.id === currentUserId;
  const progress = duration > 0 ? (currentTime / duration) * 100 : 0;

  return (
    <View style={styles.container}>
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
            resizeMode={ResizeMode.CONTAIN}
            isLooping
            shouldPlay={isActive && isScreenFocused}
            videoStyle={styles.videoStyle}
            onPlaybackStatusUpdate={onPlaybackStatusUpdate}
            progressUpdateIntervalMillis={100}
            volume={isMuted ? 0 : 1} // ✅ Control volume từ video (đã có audio)
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

        <LinearGradient
          colors={['transparent', 'rgba(0,0,0,0.3)', 'rgba(0,0,0,0.8)']}
          style={styles.gradient}
          pointerEvents="none"
        />

        <View style={styles.bottomContent}>
          <View style={styles.leftContent}>
            <Text style={styles.username}>@{video.user?.username || 'Unknown'}</Text>
            <Text style={styles.title} numberOfLines={2}>
              {video.title || ''}
            </Text>

            {video.music && (
              <TouchableOpacity 
                style={styles.musicContainer}
                activeOpacity={0.8}
              >
                <Animated.View
                  style={[
                    styles.musicDisc,
                    {
                      transform: [
                        { rotate: spin },
                        { scale: musicDiscScale },
                      ],
                    },
                  ]}
                >
                  <Ionicons name="disc" size={16} color="#fff" />
                </Animated.View>
                <Text style={styles.musicText} numberOfLines={1}>
                  {video.music.title} - {video.music.artist}
                </Text>
              </TouchableOpacity>
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

            <TouchableOpacity 
              style={styles.actionButton}
              onPress={handleOpenComments}
            >
              <Ionicons name="chatbubble-outline" size={32} color="#fff" />
              <Text style={styles.actionText}>{formatNumber(localCommentCount)}</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.actionButton}
              onPress={handleToggleMute}
            >
              <Ionicons 
                name={isMuted ? 'volume-mute' : 'volume-high'} 
                size={30} 
                color="#fff" 
              />
            </TouchableOpacity>
          </View>
        </View>

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

      <Modal
        visible={showComments}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowComments(false)}
        presentationStyle="overFullScreen"
        hardwareAccelerated={true}
        statusBarTranslucent
      >
        <CommentModal
          videoId={video.id}
          comments={comments}
          currentUserId={currentUserId}
          isVisible={showComments}
          onClose={() => setShowComments(false)}
          onAddComment={handleAddComment}
          onDeleteComment={handleDeleteComment}
          onLikeComment={likeComment}
        />
      </Modal>
    </View>
  );
}

export default memo(VideoCard, (prevProps, nextProps) => {
  return (
    prevProps.isActive === nextProps.isActive &&
    prevProps.video.id === nextProps.video.id &&
    prevProps.isFollowing === nextProps.isFollowing &&
    prevProps.video.isLiked === nextProps.video.isLiked &&
    prevProps.video.likeCount === nextProps.video.likeCount);
});

const styles = StyleSheet.create({
  container: {
    width: SCREEN_WIDTH,
    height: SCREEN_HEIGHT,
    backgroundColor: '#000',
    position: 'relative',
  },
  videoWrapper: {
    top: 0,
    left: 0,
    right: 0,
    backgroundColor: '#000',
    justifyContent: 'center',
    alignItems: 'center',
  },
  videoContainer: {
    width: '100%',
    height: SCREEN_HEIGHT - 140,
    justifyContent: 'center',
    alignItems: 'center',
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
    top: '50%',
    left: '50%',
    transform: [{ translateX: -50 }, { translateY: -50 }],
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
  bottomContent: {
    position: 'absolute',
    bottom: 40,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    alignItems: 'flex-end',
  },
  leftContent: {
    flex: 1,
    justifyContent: 'flex-end',
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
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 20,
    maxWidth: '85%',
  },
  musicDisc: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 6,
  },
  musicText: {
    color: '#fff',
    fontSize: 13,
    flex: 1,
    textShadowColor: 'rgba(0, 0, 0, 0.75)',
    textShadowOffset: { width: -1, height: 1 },
    textShadowRadius: 10,
  },
  rightContent: {
    alignItems: 'center',
    gap: 20,
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
  progressBarContainer: {
    position: 'absolute',
    bottom: 0,
    left: 16,
    right: 16,
    zIndex: 100,
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
});