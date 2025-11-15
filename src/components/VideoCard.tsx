import React, { useEffect, useRef, useState, memo } from "react";
import {
  View,
  Text,
  Dimensions,
  TouchableOpacity,
  Image,
  Animated,
  Modal,
  AppState,
  AppStateStatus,
  StyleSheet,
  Platform,
} from "react-native";
import { ResizeMode, Video, AVPlaybackStatus } from "expo-av";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { useRoute, useFocusEffect, useIsFocused, useNavigation } from "@react-navigation/native";
import CommentModal from "./CommentModal";
import { useComments } from "../hooks/useComment";
import { useVideo } from "../hooks/useVideo";

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get("window");

function VideoCard() {
  const route = useRoute();
  const { id } = route.params as any;
  const navigation = useNavigation();
  const { getVideoByVideoId, toggleLike, toggleFollow, currentUserId } = useVideo();
  const [video, setVideo] = useState<any>(null);
  const videoRef = useRef<Video>(null);
  const [isPaused, setIsPaused] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [showPlayButton, setShowPlayButton] = useState(false);
  const [showComments, setShowComments] = useState(false);
  const [localCommentCount, setLocalCommentCount] = useState(0);
  const playButtonOpacity = useRef(new Animated.Value(0)).current;
  const likeAnimation = useRef(new Animated.Value(0)).current;
  const isFocused = useIsFocused();


  const { comments, fetchComments, addComment, deleteComment, likeComment } =
    useComments(video?.id);
  useEffect(() => {
    const fetchVideo = async () => {
      const data = await getVideoByVideoId(id);
      setVideo(data);
    };
    fetchVideo();
  }, [id]);
  useEffect(() => {
    setLocalCommentCount(video?.commentCount || 0);
  }, [video?.commentCount]);

  useFocusEffect(
    React.useCallback(() => {
      videoRef.current?.playAsync().catch(() => {});
      setIsPaused(false);
      return () => {
        videoRef.current?.pauseAsync().catch(() => {});
      };
    }, [video?.id])
  );

  useEffect(() => {
    const subscription = AppState.addEventListener(
      "change",
      (nextAppState: AppStateStatus) => {
        if (nextAppState === "background" || nextAppState === "inactive") {
          videoRef.current?.pauseAsync().catch(() => {});
          setIsPaused(true);
        }
      }
    );
    return () => subscription.remove();
  }, []);

  useEffect(() => {
    if (video?.id) fetchComments();
  }, [video?.id]);

  useEffect(() => {
    if (!isFocused) {
      videoRef.current?.pauseAsync().catch(() => {});
      videoRef.current?.unloadAsync().catch(() => {});
    }
  }, [isFocused]);

  const handlePlaybackStatusUpdate = (status: AVPlaybackStatus) => {
    if (!status.isLoaded) return;
    const videoPos = status.positionMillis;
    setCurrentTime(videoPos / 1000);
    setDuration(status.durationMillis ? status.durationMillis / 1000 : 0);
  };

  const handlePlayPause = async () => {
    try {
      if (isPaused) {
        await videoRef.current?.playAsync();
        setIsPaused(false);
        setShowPlayButton(false);
        Animated.timing(playButtonOpacity, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }).start();
      } else {
        await videoRef.current?.pauseAsync();
        setIsPaused(true);
        setShowPlayButton(true);
        Animated.spring(playButtonOpacity, {
          toValue: 1,
          useNativeDriver: true,
        }).start();
      }
    } catch (error) {
      console.log('Play/Pause error:', error);
    }
  };

  const handleOpenComments = () => {
    setShowComments(true);
    fetchComments();
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const likeScale = likeAnimation.interpolate({
    inputRange: [0, 1],
    outputRange: [1, 1.3],
  });

  const handleLike = async () => {
    if (!video) return;
    
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

    await toggleLike(video.id);

    setVideo((prev: any) => ({
      ...prev,
      isLiked: !prev.isLiked,
      likeCount: prev.isLiked ? prev.likeCount - 1 : prev.likeCount + 1,
    }));
  };

  const handleFollow = async () => {
    if (!video?.user?.id) return;
    
    await toggleFollow(video.user.id);
    
    setVideo((prev: any) => ({
      ...prev,
      user: {
        ...prev.user,
        isFollowing: !prev.user.isFollowing,
      },
    }));
  };

  const handleAddComment = async (content: string, parentId: string | null = null) => {
    await addComment(content, parentId);
    setLocalCommentCount(prev => prev + 1);
  };

  const handleDeleteComment = async (commentId: string, parentId: string | null = null) => {
    const success = await deleteComment(commentId, parentId);
    if (success) {
      setLocalCommentCount(prev => Math.max(0, prev - 1));
    }
    return success;
  };

  const progress = duration > 0 ? (currentTime / duration) * 100 : 0;

  // Check if this is current user's video
  const isOwnVideo = video?.user?.id === currentUserId;

  if (!video) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Đang tải video...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Video Container - Full Screen */}
      <View style={styles.videoContainer}>
        <TouchableOpacity 
          style={styles.videoTouchArea} 
          activeOpacity={1} 
          onPress={handlePlayPause}
        >
          <Video
            ref={videoRef}
            source={{ uri: video?.url }}
            style={styles.video}
            resizeMode={ResizeMode.CONTAIN}
            isLooping
            shouldPlay={!isPaused && isFocused}
            onPlaybackStatusUpdate={handlePlaybackStatusUpdate}
            useNativeControls={false}
            videoStyle={styles.videoStyle}
          />
          
          {/* Play Button Overlay */}
          {isPaused && (
            <Animated.View style={[styles.centerPlayButton, { opacity: playButtonOpacity }]}>
              <View style={styles.playButtonCircle}>
                <Ionicons name="play" size={60} color="#fff" style={{ marginLeft: 5 }} />
              </View>
            </Animated.View>
          )}
        </TouchableOpacity>
      </View>

      {/* Back Button */}
      <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
        <Ionicons name="arrow-back" size={28} color="white" />
      </TouchableOpacity>

      {/* Gradient Overlay */}
      <LinearGradient
        colors={["transparent", "transparent", "rgba(0,0,0,0.3)", "rgba(0,0,0,0.85)"]}
        locations={[0, 0.5, 0.75, 1]}
        style={styles.gradient}
        pointerEvents="none"
      />

      {/* Bottom Content */}
      <View style={styles.bottomContent} pointerEvents="box-none">
        {/* Left Info */}
        <View style={styles.leftContent}>
          <Text style={styles.username}>@{video?.user?.username || "Unknown"}</Text>
          <Text style={styles.title} numberOfLines={2}>{video?.title || ""}</Text>
          {Array.isArray(video?.tags) && video.tags.length > 0 && (
            <View style={styles.tagsContainer}>
              {video.tags.map((tag, index) => (
                <View key={index} style={styles.tagItem}>
                  <Text style={styles.tagText}>#{tag}</Text>
                </View>
              ))}
            </View>
          )}
        </View>

        {/* Right Actions */}
        <View style={styles.rightContent}>
          {/* Avatar with Follow Button */}
          <View style={styles.avatarWrapper}>
            <TouchableOpacity style={styles.avatarContainer}>
              <Image
                source={{ uri: video?.user?.avatar || "https://via.placeholder.com/50" }}
                style={styles.avatar}
              />
            </TouchableOpacity>
            
            {/* Follow Button - Only show if not own video */}
            {!isOwnVideo && (
              <TouchableOpacity 
                style={styles.followButton}
                onPress={handleFollow}
              >
                <Ionicons 
                  name={video?.user?.isFollowing ? "checkmark" : "add"} 
                  size={20} 
                  color="#fff" 
                />
              </TouchableOpacity>
            )}
          </View>

          <TouchableOpacity style={styles.actionButton} onPress={handleLike}>
            <Animated.View style={{ transform: [{ scale: likeScale }] }}>
              <Ionicons
                name={video?.isLiked ? "heart" : "heart-outline"}
                size={36}
                color={video?.isLiked ? "#FF3B5C" : "#fff"}
              />
            </Animated.View>
            <Text style={styles.actionText}>{video?.likeCount || 0}</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.actionButton} onPress={handleOpenComments}>
            <Ionicons name="chatbubble-outline" size={33} color="#fff" />
            <Text style={styles.actionText}>{comments.length}</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Progress Bar */}
      <View style={styles.progressBarContainer} pointerEvents="none">
        <Text style={styles.timeText}>
          {formatTime(currentTime)} / {formatTime(duration)}
        </Text>
        <View style={styles.progressBar}>
          <View style={[styles.progressFill, { width: `${progress}%` }]} />
        </View>
      </View>

      {/* Comment Modal */}
      <Modal
        visible={showComments}
        transparent
        animationType="slide"
        onRequestClose={() => setShowComments(false)}
      >
        <CommentModal
          videoId={video?.id}
          comments={comments}
          currentUserId={currentUserId || ""}
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

export default memo(VideoCard);

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: '#000',
    width: '100%',
    height: '100%',
    position: 'relative',
    overflow: 'hidden',
  },

  loadingContainer: {
    flex: 1,
    backgroundColor: '#000',
    justifyContent: 'center',
    alignItems: 'center',
  },

  loadingText: {
    color: '#fff',
    fontSize: 16,
  },

  // Video Container - Absolute positioning for web
  videoContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#000',
  },

  videoTouchArea: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },

  // Video element - Key for web compatibility
  video: {
    width: '100%',
    height: '100%',
    backgroundColor: '#000',
  },

  // Video style for web - important!
  videoStyle: {
    width: '100%',
    height: '100%',
    objectFit: 'contain', // CSS object-fit for web
  },

  backButton: {
    position: 'absolute',
    top: 50,
    left: 16,
    zIndex: 100,
    backgroundColor: 'rgba(0,0,0,0.6)',
    borderRadius: 30,
    padding: 10,
  },

  gradient: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: '40%',
    zIndex: 2,
  },

  bottomContent: {
    position: 'absolute',
    bottom: 90,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    alignItems: 'flex-end',
    zIndex: 10,
  },

  leftContent: { 
    flex: 1,
    paddingRight: 16,
  },
  
  username: { 
    color: '#fff', 
    fontSize: 16, 
    fontWeight: '700', 
    marginBottom: 8,
    textShadowColor: 'rgba(0, 0, 0, 1)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 5,
  },
  
  title: { 
    color: '#fff', 
    fontSize: 14, 
    lineHeight: 20,
    textShadowColor: 'rgba(0, 0, 0, 1)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 5,
  },

  rightContent: { 
    alignItems: 'center', 
    gap: 24,
  },
  
  // Avatar wrapper with follow button
  avatarWrapper: {
    position: 'relative',
    alignItems: 'center',
    marginBottom: 8,
  },

  avatarContainer: { 
    position: 'relative',
  },
  
  avatar: { 
    width: 50, 
    height: 50, 
    borderRadius: 25, 
    borderWidth: 2.5, 
    borderColor: '#fff' 
  },

  // Follow button positioned at bottom of avatar
  followButton: {
    width: 20,
    height: 20,
    borderRadius: 12,
    backgroundColor: '#FF3B5C',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#fff',
    marginTop: -10
  },

  actionButton: { 
    alignItems: 'center', 
    gap: 5,
  },
  
  actionText: { 
    color: '#fff', 
    fontSize: 12, 
    fontWeight: '700',
    textShadowColor: 'rgba(0, 0, 0, 1)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 5,
  },

  centerPlayButton: { 
    position: 'absolute',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 50,
  },
  
  playButtonCircle: {
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'center',
    alignItems: 'center',
  },

  progressBarContainer: {
    position: 'absolute',
    bottom: 20,
    left: 16,
    right: 16,
    zIndex: 10,
  },
  
  timeText: { 
    color: '#fff', 
    fontSize: 11, 
    fontWeight: '600', 
    marginBottom: 6,
    textShadowColor: 'rgba(0, 0, 0, 1)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 5,
  },
  
  progressBar: { 
    width: '100%', 
    height: 3, 
    backgroundColor: 'rgba(255,255,255,0.3)', 
    borderRadius: 2,
  },
  
  progressFill: { 
    height: '100%', 
    backgroundColor: '#FF3B5C', 
    borderRadius: 2 
  },

  tagsContainer: { 
    flexDirection: "row", 
    flexWrap: "wrap", 
    marginTop: 8,
    gap: 6,
  },
  
  tagItem: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 4,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  
  tagText: { 
    color: '#fff', 
    fontSize: 13, 
    fontWeight: '600', 
    textShadowColor: 'rgba(0,0,0,1)', 
    textShadowOffset: { width: 0, height: 1 }, 
    textShadowRadius: 5 
  },
});