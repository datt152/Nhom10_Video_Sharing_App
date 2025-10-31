import React, { useEffect, useState, useRef, memo } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    Animated,
    Modal,
    useWindowDimensions,
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

interface VideoCardProps {
    video: VideoType;
    isFollowing: boolean;
    currentUserId: string;
    onToggleLike: (userId: string) => void;
    onToggleFollow: (userId: string) => void;
    isActive?: boolean;
    musics?: Music[];
    isLiked?: boolean;

}

const VideoCard: React.FC<VideoCardProps> = ({
    video,
    isFollowing,
    currentUserId,
    onToggleFollow,
    isActive,
    musics = [],
}) => {
    const { height: SCREEN_HEIGHT, width: SCREEN_WIDTH } = useWindowDimensions();
    const [showComments, setShowComments] = useState(false);
    const [localCommentCount, setLocalCommentCount] = useState(video.commentCount || 0);
    const [localIsLiked, setLocalIsLiked] = useState(video.isLiked || false);
    const likeAnimation = useRef(new Animated.Value(0)).current;
    const spinAnim = useRef(new Animated.Value(0)).current;
    const videoRef = useRef<Video | null>(null);
    const [sound, setSound] = useState<Audio.Sound | null>(null);
    //const { countCommentsByVideo } = useComments('');
    // 🧩 Lấy hàm từ useVideo
    const { likeVideo, unlikeVideo, getLikeCount } = useVideo();
    const { comments, fetchComments, addComment, deleteComment, likeComment, countCommentsByVideo } = useComments(String(video.id));
    const navigation = useNavigation();
    const music = musics.find((m) => m.id === video.musicId);
    const likeCount = getLikeCount(video.id);

    // ✅ Cập nhật lại localIsLiked khi video thay đổi (ví dụ khi lướt sang video khác)
    useEffect(() => {
        setLocalIsLiked(video.isLiked || false);
    }, [video]);

    useEffect(() => {
        let isMounted = true;

        if (isActive) {
            videoRef.current?.playAsync();
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

    const rotate = spinAnim.interpolate({
        inputRange: [0, 1],
        outputRange: ['0deg', '360deg'],
    });

    // ❤️ Xử lý tym
    const handleLike = async () => {
        try {
            if (localIsLiked) {
                await unlikeVideo(video.id);
                setLocalIsLiked(false);
            } else {
                await likeVideo(video.id);
                setLocalIsLiked(true);
            }

            Animated.sequence([
                Animated.spring(likeAnimation, { toValue: 1, useNativeDriver: true }),
                Animated.spring(likeAnimation, { toValue: 0, useNativeDriver: true }),
            ]).start();
        } catch (error) {
            console.log('Error toggling like:', error);
        }
    };

    const handleFollow = () => onToggleFollow(video.userId);

    const handleOpenComments = () => {
        setShowComments(true);
        fetchComments();
    };

    const handleAddComment = async (content: string, parentId: string | null = null) => {
        await addComment(content, parentId);
        setLocalCommentCount((prev) => prev + 1);
    };

    const handleDeleteComment = async (commentId: string, parentId: string | null = null) => {
        await deleteComment(commentId, parentId);
        setLocalCommentCount((prev) => Math.max(0, prev - 1));
    };

    const likeScale = likeAnimation.interpolate({
        inputRange: [0, 1],
        outputRange: [1, 1.3],
    });

    const formatNumber = (num: number) => {
        if (!num) return '0';
        if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
        if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
        return num.toString();
    };

    return (
        <View style={[styles.container, { width: SCREEN_WIDTH, height: SCREEN_HEIGHT }]}>
            <TouchableOpacity activeOpacity={0.9} style={[styles.videoWrapper, { height: SCREEN_HEIGHT }]}>
                {/* 🔙 Nút quay lại */}
                <TouchableOpacity
                    style={styles.backButton}
                    onPress={() => navigation.goBack()}
                >
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
                <LinearGradient
                    colors={['transparent', 'rgba(0,0,0,0.2)', 'rgba(0,0,0,0.7)']}
                    style={styles.gradient}
                />

                <View style={styles.bottomContent}>
                    <View style={styles.leftContent}>
                        {video.caption ? (
                            <Text style={styles.caption} numberOfLines={2}>
                                {video.caption}
                            </Text>
                        ) : null}
                    </View>

                    <View style={styles.rightContent}>
                        {/* ❤️ Tym */}
                        <TouchableOpacity style={styles.actionButton} onPress={handleLike}>
                            <Animated.View style={{ transform: [{ scale: likeScale }] }}>
                                <Ionicons
                                    name={localIsLiked ? 'heart' : 'heart-outline'}
                                    size={32}
                                    color={localIsLiked ? '#FF3B5C' : '#fff'}
                                />
                            </Animated.View>
                            <Text style={styles.actionText}>{formatNumber(likeCount)}</Text>
                        </TouchableOpacity>

                        {/* 💬 Bình luận */}
                        <TouchableOpacity style={styles.actionButton} onPress={handleOpenComments}>
                            <Ionicons name="chatbubble-outline" size={30} color="#fff" />
                            <Text style={styles.actionText}>{formatNumber(getLikeCount(video.id))}</Text>
                        </TouchableOpacity>

                        {/* 👁 Lượt xem */}
                        <View style={styles.actionButton}>
                            <Ionicons name="eye-outline" size={28} color="#fff" />
                            <Text style={styles.actionText}>{formatNumber(video.views || 0)}</Text>
                        </View>

                        {/* 🎵 Nhạc */}
                        {music && (
                            <Animated.View style={[styles.musicDisc, { transform: [{ rotate }] }]}>
                                <Ionicons name="musical-notes" size={22} color="#fff" />
                            </Animated.View>
                        )}
                    </View>
                </View>

                {music && (
                    <View style={styles.musicInfo}>
                        <Ionicons name="musical-notes" size={16} color="#fff" />
                        <Text style={styles.musicText} numberOfLines={1}>
                            {music.title} - {music.artist}
                        </Text>
                    </View>
                )}
            </TouchableOpacity>

            <Modal
                visible={showComments}
                transparent
                animationType="slide"
                onRequestClose={() => setShowComments(false)}
            >
                <CommentModalVideo
                    videoId={String(video.id)}
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
};

export default memo(VideoCard);

const styles = StyleSheet.create({
    container: { backgroundColor: '#000' },
    videoWrapper: { width: '100%', justifyContent: 'center', alignItems: 'center' },
    video: { width: '100%', height: '100%' },
    gradient: { position: 'absolute', bottom: 0, left: 0, right: 0, height: '45%' },
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
    rightContent: { alignItems: 'center', gap: 18 },
    actionButton: { alignItems: 'center', gap: 4 },
    actionText: { color: '#fff', fontSize: 13, fontWeight: '600' },
    musicInfo: {
        position: 'absolute',
        bottom: 20,
        left: 16,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
    },
    musicText: { color: '#fff', fontSize: 14, maxWidth: '70%' },
    musicDisc: {
        width: 44,
        height: 44,
        borderRadius: 22,
        borderWidth: 2,
        borderColor: '#fff',
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 10,
    },
    backButton: {
        position: 'absolute',
        top: 40,         // tuỳ chỉnh cao thấp
        left: 16,
        zIndex: 10,
        backgroundColor: 'rgba(0,0,0,0.4)',
        borderRadius: 30,
        padding: 6,
    },
});
