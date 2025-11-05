import React, { useEffect, useState, useRef, memo } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    Animated,
    Modal,
    useWindowDimensions,
    Pressable,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { Video } from 'expo-av';
import { Audio } from 'expo-av';
import { Video as VideoType, Music } from '../types/database.types';
import { useComments } from '../hooks/useComment';
import CommentModalVideo from '../components/CommentModalVideo';
import { useVideo } from '../hooks/useVideo';
import { useNavigation } from '@react-navigation/native';
import { useUser } from "../hooks/useUser";

interface VideoCardProps {
    video: VideoType;
    isFollowing: boolean;
    currentUserId: string;
    onToggleLike: (userId: string) => void;
    onToggleFollow: (userId: string) => void;
    isActive?: boolean;
    musics?: Music[];
    isLiked?: boolean;
    onPrivacyChange?: () => void;
}

const DOUBLE_TAP_DELAY = 300;

const VideoCard: React.FC<VideoCardProps> = ({
    video,
    isFollowing,
    currentUserId,
    onToggleFollow,
    isActive,
    musics = [],
    onPrivacyChange
}) => {
    const { height: SCREEN_HEIGHT, width: SCREEN_WIDTH } = useWindowDimensions();
    const [showComments, setShowComments] = useState(false);
    const [showOptions, setShowOptions] = useState(false);
    const [localCommentCount, setLocalCommentCount] = useState(video.commentCount || 0);

    const likeAnimation = useRef(new Animated.Value(0)).current;
    const spinAnim = useRef(new Animated.Value(0)).current;
    const heartAnim = useRef(new Animated.Value(0)).current;
    const videoRef = useRef<Video | null>(null);
    const [sound, setSound] = useState<Audio.Sound | null>(null);
    const [videoCommentsList, setVideoCommentsList] = useState<any[]>([]);
    const [isPlaying, setIsPlaying] = useState(isActive);
    const lastTap = useRef<number>(0);

    const { likeVideo, unlikeVideo, videos, toggleVideoPrivacy } = useVideo();
    const { addComment, deleteComment, likeComment, countCommentsByVideo, getCommentsByVideo } = useComments(String(video.id));
    const navigation = useNavigation();
    const music = musics.find((m) => m.id === video.musicId);

    const [commentCounts, setCommentCounts] = useState<Record<string, number>>({});
    const [localIsLiked, setLocalIsLiked] = useState(video.isLiked || false);
    const [likeCount, setLikeCount] = useState(video.likeCount || 0);
    const [localIsPublic, setLocalIsPublic] = useState(video.isPublic);

    useEffect(() => {
        const fetchCommentCounts = async () => {
            const counts: Record<string, number> = {};
            for (const v of videos) {
                const count = await countCommentsByVideo(v.id);
                counts[String(v.id)] = count;
            }
            setCommentCounts(counts);
        };

        if (videos.length > 0) fetchCommentCounts();
    }, [videos]);

    useEffect(() => {
        const updated = videos.find((v) => v.id === video.id);
        if (updated) {
            setLocalIsLiked(updated.isLiked || false);
            setLikeCount(updated.likeCount || 0);
        }
    }, [videos, video.id]);

    // ✅ Điều khiển play/pause
    const handleTogglePlay = async () => {
        try {
            if (isPlaying) {
                await videoRef.current?.pauseAsync();
                setIsPlaying(false);
            } else {
                await videoRef.current?.playAsync();
                setIsPlaying(true);
            }
        } catch (error) {
            console.log("⚠️ Lỗi khi toggle video:", error);
        }
    };

    // ✅ Tự phát khi active
    useEffect(() => {
        let isMounted = true;
        if (isActive) {
            videoRef.current?.playAsync();
            setIsPlaying(true);
            startRotation();
            if (music?.uri) {
                (async () => {
                    try {
                        const { sound: newSound } = await Audio.Sound.createAsync(
                            { uri: music.uri },
                            { shouldPlay: true, isLooping: true }
                        );
                        if (isMounted) setSound(newSound);
                    } catch (error) {
                        console.log('Error playing sound:', error);
                    }
                })();
            }
        } else {
            videoRef.current?.pauseAsync();
            setIsPlaying(false);
            stopRotation();
            sound?.unloadAsync();
        }

        return () => {
            isMounted = false;
            stopRotation();
            if (sound) sound.unloadAsync();
        };
    }, [isActive, music?.uri]);

    const startRotation = () => {
        Animated.loop(
            Animated.timing(spinAnim, {
                toValue: 1,
                duration: 6000,
                useNativeDriver: true,
            })
        ).start();
    };
    const stopRotation = () => spinAnim.stopAnimation();

    const triggerHeartAnimation = () => {
        heartAnim.setValue(0);
        Animated.sequence([
            Animated.timing(heartAnim, { toValue: 1, duration: 150, useNativeDriver: true }),
            Animated.timing(heartAnim, { toValue: 0, duration: 600, useNativeDriver: true }),
        ]).start();
    };

    const handleLike = async () => {
        try {
            if (localIsLiked) {
                await unlikeVideo(video.id);
                setLocalIsLiked(false);
            } else {
                await likeVideo(video.id);
                setLocalIsLiked(true);
                triggerHeartAnimation();
            }
            Animated.sequence([
                Animated.spring(likeAnimation, { toValue: 1, useNativeDriver: true }),
                Animated.spring(likeAnimation, { toValue: 0, useNativeDriver: true }),
            ]).start();
        } catch (error) {
            console.log('🔥 Lỗi khi toggle like:', error);
        }
    };

    const handleOpenComments = async (videoId: string) => {
        try {
            const fetchedComments = await getCommentsByVideo(videoId);
            setVideoCommentsList(fetchedComments || []);
            setShowComments(true);
        } catch (error) {
            console.error("❌ Lỗi khi lấy bình luận:", error);
        }
    };

    const formatNumber = (num: number) => {
        if (!num) return '0';
        if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
        if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
        return num.toString();
    };

    return (
        <View style={[styles.container, { width: SCREEN_WIDTH, height: SCREEN_HEIGHT }]}>
            <Pressable
                style={[styles.videoWrapper, { height: SCREEN_HEIGHT }]}
                onPress={handleTogglePlay} // 👈 thêm sự kiện dừng/phát
            >
                <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
                    <Ionicons name="arrow-back" size={28} color="#fff" />
                </TouchableOpacity>

                <Video
                    ref={videoRef}
                    source={{ uri: video.url }}
                    resizeMode="cover"
                    isLooping
                    style={styles.video}
                    shouldPlay={isActive}
                />

                {/* ❤️ Hiệu ứng tim */}
                <Animated.View
                    style={[
                        styles.centerHeart,
                        {
                            opacity: heartAnim.interpolate({ inputRange: [0, 1], outputRange: [0, 1] }),
                            transform: [{ scale: heartAnim.interpolate({ inputRange: [0, 1], outputRange: [0.5, 1.4] }) }],
                        },
                    ]}
                >
                    <Ionicons name="heart" size={100} color="#FF3B5C" />
                </Animated.View>

                <LinearGradient
                    colors={['transparent', 'rgba(0,0,0,0.2)', 'rgba(0,0,0,0.7)']}
                    style={styles.gradient}
                />

                <View style={styles.bottomContent}>
                    <View style={styles.leftContent}>
                        {video.title ? (
                            <Text style={styles.caption} numberOfLines={2}>{video.title}</Text>
                        ) : null}

                        {video.tags && video.tags.length > 0 && (
                            <View style={styles.tagContainer}>
                                {video.tags.map((tab: string, index: number) => (
                                    <View
                                        key={index}
                                        style={[
                                            styles.tagItem,
                                            {
                                                borderColor: pastelColors[index % pastelColors.length].border,
                                                backgroundColor: pastelColors[index % pastelColors.length].background,
                                            },
                                        ]}
                                    >
                                        <Text style={styles.tagText}>#{tab}</Text>
                                    </View>
                                ))}
                            </View>
                        )}
                    </View>

                    <View style={styles.rightContent}>
                        <TouchableOpacity style={styles.actionButton} onPress={handleLike}>
                            <Animated.View style={{ transform: [{ scale: likeAnimation.interpolate({ inputRange: [0, 1], outputRange: [1, 1.3] }) }] }}>
                                <Ionicons name={localIsLiked ? 'heart' : 'heart-outline'} size={32} color={localIsLiked ? '#FF3B5C' : '#fff'} />
                            </Animated.View>
                            <Text style={styles.actionText}>{formatNumber(likeCount)}</Text>
                        </TouchableOpacity>

                        <TouchableOpacity style={styles.actionButton} onPress={() => handleOpenComments(video.id)}>
                            <Ionicons name="chatbubble-outline" size={30} color="#fff" />
                            <Text style={styles.actionText}>{commentCounts[String(video.id)] ?? 0}</Text>
                        </TouchableOpacity>

                        <TouchableOpacity style={styles.actionButton} onPress={() => setShowOptions(true)}>
                            <Ionicons name="ellipsis-horizontal" size={28} color="#fff" />
                            <Text style={styles.actionText}>Tùy chọn</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Pressable>
        </View>
    );
};

export default memo(VideoCard);

const pastelColors = [
    { border: '#FFB6C1', background: '#FFE4E1' },
    { border: '#ADD8E6', background: '#E0F7FA' },
    { border: '#98FB98', background: '#E6F9E6' },
    { border: '#FFDAB9', background: '#FFF5EE' },
    { border: '#E6E6FA', background: '#F8F8FF' },
    { border: '#F5DEB3', background: '#FFF8DC' },
];

const styles = StyleSheet.create({
    container: { backgroundColor: '#000' },
    videoWrapper: { width: '100%', justifyContent: 'center', alignItems: 'center' },
    video: { width: '100%', height: '100%' },
    gradient: { position: 'absolute', bottom: 0, left: 0, right: 0, height: '45%' },
    centerHeart: { position: 'absolute', top: '40%', left: '40%' },
    bottomContent: {
        position: 'absolute',
        bottom: 50,
        left: 0,
        right: 0,
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        alignItems: 'flex-end',
    },
    leftContent: { flex: 1 },
    caption: { color: '#fff', fontSize: 15, lineHeight: 20 },
    tagContainer: { flexDirection: 'row', flexWrap: 'wrap', marginTop: 6, gap: 6 },
    tagItem: {
        borderWidth: 1.2,
        borderRadius: 16,
        paddingVertical: 4,
        paddingHorizontal: 10,
        shadowColor: '#000',
        shadowOpacity: 0.05,
        shadowOffset: { width: 0, height: 1 },
        shadowRadius: 2,
        elevation: 1,
    },
    tagText: { fontSize: 12, color: '#C2185B', fontWeight: '600' },
    rightContent: { alignItems: 'center', gap: 18 },
    actionButton: { alignItems: 'center', gap: 4 },
    actionText: { color: '#fff', fontSize: 13, fontWeight: '600' },
    backButton: {
        position: 'absolute',
        top: 40,
        left: 16,
        zIndex: 10,
        backgroundColor: 'rgba(0,0,0,0.4)',
        borderRadius: 30,
        padding: 6,
    },
});
