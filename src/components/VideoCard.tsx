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
  const { getVideoById, toggleLike, toggleFollow, currentUserId } = useVideo();
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

  useEffect(() => {
    const fetchVideo = async () => {
      const data = await getVideoById(id);
      setVideo(data);
      setLocalCommentCount(data?.commentCount || 0);
    };
    fetchVideo();
  }, [id]);

  const { comments, fetchComments, addComment, deleteComment, likeComment } =
    useComments(video?.id);

  useEffect(() => {
    setLocalCommentCount(video?.commentCount || 0);
  }, [video?.commentCount]);

  // Pause video khi rời khỏi màn hình
  useFocusEffect(
    React.useCallback(() => {
      videoRef.current?.playAsync().catch(() => {});
      return () => {
        videoRef.current?.pauseAsync().catch(() => {});
      };
    }, [video?.id])
  );

  // App background handling
  useEffect(() => {
    const subscription = AppState.addEventListener(
      "change",
      (nextAppState: AppStateStatus) => {
        if (nextAppState === "background" || nextAppState === "inactive") {
          videoRef.current?.pauseAsync().catch(() => {});
        }
      }
    );
    return () => subscription.remove();
  }, []);

  useEffect(() => {
    if (video?.id) fetchComments();
  }, [video?.id]);

  // Pause khi mất focus
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
    if (isPaused) {
      await videoRef.current?.playAsync();
      setIsPaused(false);
      Animated.timing(playButtonOpacity, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }).start();
    } else {
      await videoRef.current?.pauseAsync();
      setIsPaused(true);
      Animated.spring(playButtonOpacity, {
        toValue: 1,
        useNativeDriver: true,
      }).start();
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
    await toggleLike(video.id);

    setVideo((prev: any) => ({
      ...prev,
      isLiked: !prev.isLiked,
      likeCount: prev.isLiked ? prev.likeCount - 1 : prev.likeCount + 1,
    }));
  };

  // ✅ Wrapper để cập nhật UI ngay lập tức khi thêm comment
  const handleAddComment = async (content: string, parentId: string | null = null) => {
    await addComment(content, parentId);
    // Cập nhật count ngay lập tức
    setLocalCommentCount(prev => prev + 1);
  };

  // ✅ Wrapper để cập nhật UI ngay lập tức khi xóa comment
  const handleDeleteComment = async (commentId: string, parentId: string | null = null) => {
    const success = await deleteComment(commentId, parentId);
    if (success) {
      // Cập nhật count ngay lập tức
      setLocalCommentCount(prev => Math.max(0, prev - 1));
    }
    return success;
  };

  const progress = duration > 0 ? (currentTime / duration) * 100 : 0;

  if (!video) {
    return (
      <View style={{ flex: 1, backgroundColor: "#000", justifyContent: "center", alignItems: "center" }}>
        <Text style={{ color: "#fff" }}>Đang tải video...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Video */}
      <TouchableOpacity 
        style={styles.backButton} 
        onPress={() => navigation.goBack()}
      >
        <Ionicons name="arrow-back" size={28} color="black" />
      </TouchableOpacity>
      <View style={styles.videoWrapper}>
        <TouchableOpacity
          style={styles.videoContainer}
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
          />

          {showPlayButton && (
            <Animated.View
              style={[styles.centerPlayButton, { opacity: playButtonOpacity }]}
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
        colors={["transparent", "rgba(0,0,0,0.3)", "rgba(0,0,0,0.8)"]}
        style={styles.gradient}
        pointerEvents="none"
      />

      {/* Bottom UI */}
      <View style={styles.bottomContent}>
        {/* Left info */}
        <View style={styles.leftContent}>
          <Text style={styles.username}>@{video?.user?.username || "Unknown"}</Text>
          <Text style={styles.title} numberOfLines={2}>
            {video?.title || ""}
          </Text>
        </View>

        {/* Right actions */}
        <View style={styles.rightContent}>
          <View style={styles.avatarContainer}>
            <Image
              source={{
                uri: video?.user?.avatar || "https://via.placeholder.com/50",
              }}
              style={styles.avatar}
            />
          </View>

          <TouchableOpacity style={styles.actionButton} onPress={handleLike}>
            <Animated.View style={{ transform: [{ scale: likeScale }] }}>
              <Ionicons
                name={video?.isLiked ? "heart" : "heart-outline"}
                size={35}
                color={video?.isLiked ? "#FF3B5C" : "#fff"}
              />
            </Animated.View>
            <Text style={styles.actionText}>{video?.likeCount || 0}</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.actionButton} onPress={handleOpenComments}>
            <Ionicons name="chatbubble-outline" size={32} color="#fff" />
            <Text style={styles.actionText}>{localCommentCount}</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Progress bar */}
      <View style={styles.progressBarContainer}>
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

export default memo(VideoCard);
const styles = StyleSheet.create({
  container: {
    width: SCREEN_WIDTH,
    height: SCREEN_HEIGHT,
    backgroundColor: "#dcc6c6ff",
    position: "relative",
  },
  videoWrapper: {
    position: "absolute", // ✅ Thêm absolute
    top: 0,
    left: 0,
    right: 0,
    bottom: 80, // ✅ Thêm bottom
    backgroundColor: "#dec3c3ff",
    justifyContent: "center",
    alignItems: "center",
  },
  videoContainer: {
    width: "100%",
    height: "100%",
    justifyContent: "center",
    alignItems: "center",
  },
  video: { 
    width: "100%", 
    height: "100%", 
    backgroundColor: "#f9e9e9ff" 
  },
  centerPlayButton: {
    position: "absolute",
    justifyContent: "center",
    alignItems: "center",
  },
  playButtonCircle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  gradient: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    height: "50%",
    pointerEvents: "none",
  },
  bottomContent: {
    position: "absolute",
    bottom: 180,
    left: 0,
    right: 0,
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    alignItems: "flex-end",
  },
  leftContent: { flex: 1, justifyContent: "flex-end" },
  username: {
    color: "#fff",
    fontSize: 17,
    fontWeight: "bold",
    marginBottom: 6,
    textShadowColor: "rgba(0, 0, 0, 0.75)",
    textShadowOffset: { width: -1, height: 1 },
    textShadowRadius: 10,
  },
  title: {
    color: "#fff",
    fontSize: 15,
    marginBottom: 12,
    lineHeight: 20,
    textShadowColor: "rgba(0, 0, 0, 0.75)",
    textShadowOffset: { width: -1, height: 1 },
    textShadowRadius: 10,
  },
  rightContent: { alignItems: "center", gap: 20 },
  avatarContainer: { position: "relative", marginBottom: 8 },
  avatar: {
    width: 52,
    height: 52,
    borderRadius: 26,
    borderWidth: 2,
    borderColor: "#fff",
  },
  followButton: {
    position: "absolute",
    bottom: -6,
    left: "50%",
    marginLeft: -12,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: "#FF3B5C",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: "#fff",
  },
  actionButton: { alignItems: "center", gap: 4 },
  actionText: {
    color: "#fff",
    fontSize: 13,
    fontWeight: "600",
    textShadowColor: "rgba(0, 0, 0, 0.75)",
    textShadowOffset: { width: -1, height: 1 },
    textShadowRadius: 10,
  },
  progressBarContainer: {
    position: "absolute",
    bottom: 155,
    left: 16,
    right: 16,
    zIndex: 100,
  },
  timeText: {
    color: "#fff",
    fontSize: 11,
    fontWeight: "600",
    textShadowColor: "rgba(0, 0, 0, 0.75)",
    textShadowOffset: { width: -1, height: 1 },
    textShadowRadius: 10,
    marginBottom: 4,
  },
  progressBar: {
    width: "100%",
    height: 4,
    backgroundColor: "rgba(255, 255, 255, 0.3)",
    borderRadius: 2,
    position: "relative",
  },
  progressFill: { height: "100%", backgroundColor: "#FF3B5C", borderRadius: 2 },
  backButton: {
  position: "absolute",
  top: 16,
  left: 16,
  zIndex: 1000,
  width: 40,
  height: 40,
  borderRadius: 20,
  justifyContent: "center",
  alignItems: "center",
},
});