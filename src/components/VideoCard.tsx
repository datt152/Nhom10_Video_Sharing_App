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
import { ResizeMode, Video, Audio, AVPlaybackStatus } from "expo-av";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { Video as VideoType } from "../types/database.types";
import CommentModal from "./CommentModal";
import { useComments } from "../hooks/useComment";
import { useFocusEffect } from "@react-navigation/native";

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get("window");

interface VideoCardProps {
  video: VideoType;
  isActive: boolean; // chỉ 1 video active tại 1 thời điểm
  isFollowing: boolean;
  currentUserId: string;
  onToggleLike: (videoId: string) => void;
  onToggleFollow: (userId: string) => void;
}

function VideoCard({
  video,
  isActive,
  isFollowing,
  currentUserId,
  onToggleLike,
  onToggleFollow,
}: VideoCardProps) {
  const videoRef = useRef<Video>(null);
  const [sound, setSound] = useState<Audio.Sound | null>(null);

  const [isPaused, setIsPaused] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [showPlayButton, setShowPlayButton] = useState(false);
  const [isScreenFocused, setIsScreenFocused] = useState(true);
  const [isMuted, setIsMuted] = useState(false);

  // UI Animations
  const musicDiscRotation = useRef(new Animated.Value(0)).current;
  const musicDiscScale = useRef(new Animated.Value(1)).current;
  const likeAnimation = useRef(new Animated.Value(0)).current;
  const playButtonOpacity = useRef(new Animated.Value(0)).current;

  // Comments
  const [showComments, setShowComments] = useState(false);
  const [localCommentCount, setLocalCommentCount] = useState(
    video.commentCount
  );
  const {
    comments,
    fetchComments,
    addComment,
    deleteComment,
    likeComment,
  } = useComments(video.id);

  useEffect(() => {
    setLocalCommentCount(video.commentCount);
  }, [video.commentCount]);

  // Music rotation animation
  useEffect(() => {
    if (isActive && !isPaused && !isMuted && video.music) {
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

      return () => rotationAnimation.stop();
    } else {
      Animated.spring(musicDiscScale, {
        toValue: 0.8,
        friction: 3,
        useNativeDriver: true,
      }).start();
    }
  }, [isActive, isPaused, isMuted, video.music]);

  // Load & setup music only if active
  useEffect(() => {
    if (!isActive || !video.music?.uri) return;

    const setupSound = async () => {
      if (sound) await sound.unloadAsync();
      const { sound: newSound } = await Audio.Sound.createAsync(
        { uri: video.music?.uri },
        { shouldPlay: false, isLooping: false }
      );
      setSound(newSound);
    };

    setupSound();

    return () => {
      if (sound) sound.unloadAsync();
    };
  }, [isActive, video.music?.uri]);

  // Focus / background handling
  useFocusEffect(
    React.useCallback(() => {
      setIsScreenFocused(true);
      return () => {
        setIsScreenFocused(false);
        videoRef.current?.pauseAsync().catch(() => {});
        if (sound) sound.pauseAsync();
      };
    }, [video.id])
  );

  useEffect(() => {
    const subscription = AppState.addEventListener(
      "change",
      (nextAppState: AppStateStatus) => {
        if (!isActive) return;
        if (nextAppState === "background" || nextAppState === "inactive") {
          videoRef.current?.pauseAsync().catch(() => {});
          if (sound) sound.pauseAsync();
        } else if (nextAppState === "active") {
          videoRef.current?.playAsync().catch(() => {});
          if (sound) {
            videoRef.current?.getStatusAsync().then(async (status) => {
              if (status?.isLoaded) await sound.setPositionAsync(status.positionMillis);
              await sound.playAsync();
            });
          }
        }
      }
    );
    return () => subscription.remove();
  }, [isActive, sound]);

  // Play/pause video & music based on active
  useEffect(() => {
    const managePlayback = async () => {
      if (!isActive || !isScreenFocused) {
        await videoRef.current?.pauseAsync();
        if (sound) await sound.pauseAsync();
        return;
      }

      try {
        const status = await videoRef.current?.getStatusAsync();
        if (status?.isLoaded) {
          await videoRef.current?.setVolumeAsync(video.music?.uri ? 0 : 1);
          await videoRef.current?.playAsync();
          if (sound) {
            await sound.setPositionAsync(status.positionMillis);
            await sound.playAsync();
          }
        }
      } catch (err) {
        console.error(err);
      }
    };
    managePlayback();
  }, [isActive, isScreenFocused, video.music?.uri]);

  // Sync video & music
  const handlePlaybackStatusUpdate = async (status: AVPlaybackStatus) => {
    if (!status.isLoaded) return;

    const videoPos = status.positionMillis;
    setCurrentTime(videoPos / 1000);
    setDuration(status.durationMillis ? status.durationMillis / 1000 : 0);

    if (!sound) return;
    const musicStatus = await sound.getStatusAsync();
    if (!musicStatus.isLoaded) return;

    if (status.isPlaying) {
      if (!musicStatus.isPlaying) {
        await sound.setPositionAsync(videoPos);
        await sound.playAsync();
      }
    } else {
      if (musicStatus.isPlaying) await sound.pauseAsync();
    }

    if ((status as any).didJustFinish) {
      await sound.stopAsync();
    }
  };

  const handlePlayPause = async () => {
    if (isPaused) {
      await videoRef.current?.playAsync();
      if (sound) {
        const status = await videoRef.current?.getStatusAsync();
        if (status?.isLoaded && status.positionMillis) {
          await sound.setPositionAsync(status.positionMillis);
          await sound.playAsync();
        }
      }
      setIsPaused(false);
      setShowPlayButton(false);
      Animated.timing(playButtonOpacity, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }).start();
    } else {
      await videoRef.current?.pauseAsync();
      if (sound) await sound.pauseAsync();
      setIsPaused(true);
      setShowPlayButton(true);
      Animated.spring(playButtonOpacity, {
        toValue: 1,
        useNativeDriver: true,
      }).start();
    }
  };

  const handleToggleMute = async () => {
    const newMuted = !isMuted;
    setIsMuted(newMuted);
    await videoRef.current?.setVolumeAsync(newMuted ? 0 : 1);
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
  const spin = musicDiscRotation.interpolate({
    inputRange: [0, 1],
    outputRange: ["0deg", "360deg"],
  });
  const progress = duration > 0 ? (currentTime / duration) * 100 : 0;
  const isOwnVideo = video.user?.id === currentUserId;

  return (
    <View style={styles.container}>
      {/* Video */}
      <View style={styles.videoWrapper}>
        <TouchableOpacity
          style={styles.videoContainer}
          activeOpacity={1}
          onPress={handlePlayPause}
        >
          <Video
            ref={videoRef}
            source={{ uri: video.url }}
            style={styles.video}
            resizeMode={ResizeMode.CONTAIN}
            isLooping
            shouldPlay={isActive && isScreenFocused && !isPaused}
            isMuted={!!video.music?.uri}
            onPlaybackStatusUpdate={handlePlaybackStatusUpdate}
          />

          {showPlayButton && (
            <Animated.View style={[styles.centerPlayButton, { opacity: playButtonOpacity }]}>
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
          <Text style={styles.username}>@{video.user?.username || "Unknown"}</Text>
          <Text style={styles.title} numberOfLines={2}>{video.title || ""}</Text>

          {video.music && (
            <TouchableOpacity style={styles.musicContainer} activeOpacity={0.8}>
              <Animated.View
                style={[styles.musicDisc, { transform: [{ rotate: spin }, { scale: musicDiscScale }] }]}
              >
                <Ionicons name="disc" size={16} color="#fff" />
              </Animated.View>
              <Text style={styles.musicText} numberOfLines={1}>
                {video.music.title} - {video.music.artist}
              </Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Right buttons */}
        <View style={styles.rightContent}>
          <View style={styles.avatarContainer}>
            <Image
              source={{ uri: video.user?.avatar || "https://via.placeholder.com/50" }}
              style={styles.avatar}
            />
            {!isOwnVideo && !isFollowing && (
              <TouchableOpacity
                style={styles.followButton}
                onPress={() => onToggleFollow(video.user?.id || "")}
                activeOpacity={0.8}
              >
                <Ionicons name="add" size={20} color="#fff" />
              </TouchableOpacity>
            )}
          </View>

          <TouchableOpacity style={styles.actionButton} onPress={() => onToggleLike(video.id)}>
            <Animated.View style={{ transform: [{ scale: likeScale }] }}>
              <Ionicons
                name={video.isLiked ? "heart" : "heart-outline"}
                size={35}
                color={video.isLiked ? "#FF3B5C" : "#fff"}
              />
            </Animated.View>
            <Text style={styles.actionText}>{video.likeCount}</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.actionButton} onPress={handleOpenComments}>
            <Ionicons name="chatbubble-outline" size={32} color="#fff" />
            <Text style={styles.actionText}>{localCommentCount}</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.actionButton} onPress={handleToggleMute}>
            <Ionicons name={isMuted ? "volume-mute" : "volume-high"} size={30} color="#fff" />
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
          videoId={video.id}
          comments={comments}
          currentUserId={currentUserId}
          isVisible={showComments}
          onClose={() => setShowComments(false)}
          onAddComment={addComment}
          onDeleteComment={deleteComment}
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
    prevProps.video.likeCount === nextProps.video.likeCount
  );
});
const styles = StyleSheet.create({
  container: {
    width: SCREEN_WIDTH,
    height: SCREEN_HEIGHT,
    backgroundColor: "#000",
    position: "relative",
  },
  videoWrapper: {
    top: 0,
    left: 0,
    right: 0,
    backgroundColor: "#000",
    justifyContent: "center",
    alignItems: "center",
  },
  videoContainer: {
    width: "100%",
    height: SCREEN_HEIGHT - 140,
    justifyContent: "center",
    alignItems: "center",
  },
  video: { width: "100%", height: "100%", backgroundColor: "#000" },
  videoStyle: { width: "100%", height: "100%" },
  centerPlayButton: {
    position: "absolute",
    top: "50%",
    left: "50%",
    transform: [{ translateX: -50 }, { translateY: -50 }],
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
  musicContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 4,
    backgroundColor: "rgba(0, 0, 0, 0.3)",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 20,
    maxWidth: "85%",
  },
  musicDisc: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 6,
  },
  musicText: {
    color: "#fff",
    fontSize: 13,
    flex: 1,
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
  progressBarTouchable: { paddingVertical: 10 },
  progressBar: {
    width: "100%",
    height: 4,
    backgroundColor: "rgba(255, 255, 255, 0.3)",
    borderRadius: 2,
    position: "relative",
  },
  progressFill: { height: "100%", backgroundColor: "#FF3B5C", borderRadius: 2 },
  progressDot: {
    position: "absolute",
    top: -4,
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: "#fff",
    marginLeft: -6,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
    elevation: 5,
  },
});
