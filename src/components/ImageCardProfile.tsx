import React, { useEffect, useState, useRef, memo } from 'react';
import {
    View,
    Text,
    Image,
    StyleSheet,
    TouchableOpacity,
    Animated,
    Modal,
    useWindowDimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { Audio } from 'expo-av';
import { Image as ImageType, Music } from '../types/database.types';
import { useComments } from '../hooks/useComment';
import CommentModalImage from './CommentModalImage';
import { useImage } from '../hooks/useImage';

interface ImageCardProps {
    image: ImageType;
    isFollowing: boolean;
    currentUserId: string;
    onToggleLike: (imageId: string) => void;
    onToggleFollow: (userId: string) => void;
    isLiked: boolean;
    isActive?: boolean;
    musics?: Music[];
}

const ImageCard: React.FC<ImageCardProps> = ({
    image,
    isFollowing,
    currentUserId,
    onToggleLike,
    onToggleFollow,
    isLiked,
    isActive,
    musics = [],
}) => {
    const { height: SCREEN_HEIGHT, width: SCREEN_WIDTH } = useWindowDimensions();
    const [showComments, setShowComments] = useState(false);
    const [localLikeCount, setLocalLikeCount] = useState(image.likes);
    const [localCommentCount, setLocalCommentCount] = useState(image.comments);
    const likeAnimation = useRef(new Animated.Value(0)).current;
    const spinAnim = useRef(new Animated.Value(0)).current;
    const [sound, setSound] = useState<Audio.Sound | null>(null);
    const { getImageLikes } = useImage();
    const { comments, fetchComments, addComment, deleteComment, likeComment } = useComments(
        String(image.id)
    );

    useEffect(() => {
        const fetchLikes = async () => {
            try {
                const likeCount = await getImageLikes(image.id);
                if (typeof likeCount === 'number') setLocalLikeCount(likeCount);
            } catch (err) {
                console.log('Error fetching likes:', err);
            }
        };
        fetchLikes();
    }, [image.id]);

    const music = musics.find((m) => m.id === image.musicId);

    // ✅ Play nhạc chỉ khi isActive = true (sau khi đã scroll tới)
    useEffect(() => {
        let isMounted = true;
        if (!isActive || !music?.uri) return;

        async function playSound() {
            try {
                const { sound: newSound } = await Audio.Sound.createAsync(
                    { uri: music?.uri },
                    { shouldPlay: true, isLooping: true }
                );
                if (isMounted) setSound(newSound);
            } catch (error) {
                console.log('Error playing sound:', error);
            }
        }

        playSound();
        startRotation();

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

    const handleLike = () => {
        onToggleLike(image.id);
        Animated.sequence([
            Animated.spring(likeAnimation, { toValue: 1, useNativeDriver: true }),
            Animated.spring(likeAnimation, { toValue: 0, useNativeDriver: true }),
        ]).start();
    };

    const handleFollow = () => onToggleFollow(image.userId);

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
            <TouchableOpacity activeOpacity={0.9} style={[styles.imageWrapper, { height: SCREEN_HEIGHT }]}>
                <Image source={{ uri: image.imageUrl }} style={styles.image} />
                <LinearGradient
                    colors={['transparent', 'rgba(0,0,0,0.2)', 'rgba(0,0,0,0.7)']}
                    style={styles.gradient}
                />

                {/* Info bottom */}
                <View style={styles.bottomContent}>
                    <View style={styles.leftContent}>
                        {image.caption ? (
                            <Text style={styles.caption} numberOfLines={2}>
                                {image.caption}
                            </Text>
                        ) : null}
                    </View>

                    <View style={styles.rightContent}>
                        {/* Like */}
                        <TouchableOpacity style={styles.actionButton} onPress={handleLike}>
                            <Animated.View style={{ transform: [{ scale: likeScale }] }}>
                                <Ionicons
                                    name={isLiked ? 'heart' : 'heart-outline'}
                                    size={32}
                                    color={isLiked ? '#FF3B5C' : '#fff'}
                                />
                            </Animated.View>
                            <Text style={styles.actionText}>
                                {formatNumber(localLikeCount + (isLiked ? 1 : 0))}
                            </Text>
                        </TouchableOpacity>

                        {/* Comment */}
                        <TouchableOpacity style={styles.actionButton} onPress={handleOpenComments}>
                            <Ionicons name="chatbubble-outline" size={30} color="#fff" />
                            <Text style={styles.actionText}>{formatNumber(localCommentCount)}</Text>
                        </TouchableOpacity>

                        {/* View */}
                        <View style={styles.actionButton}>
                            <Ionicons name="eye-outline" size={28} color="#fff" />
                            <Text style={styles.actionText}>{formatNumber(image.views)}</Text>
                        </View>

                        {/* Music spinning */}
                        {music && (
                            <Animated.View style={[styles.musicDisc, { transform: [{ rotate }] }]}>
                                <Ionicons name="musical-notes" size={22} color="#fff" />
                            </Animated.View>
                        )}
                    </View>
                </View>

                {/* Music info */}
                {music && (
                    <View style={styles.musicInfo}>
                        <Ionicons name="musical-notes" size={16} color="#fff" />
                        <Text style={styles.musicText} numberOfLines={1}>
                            {music.title} - {music.artist}
                        </Text>
                    </View>
                )}
            </TouchableOpacity>

            {/* Comment Modal */}
            <Modal
                visible={showComments}
                transparent
                animationType="slide"
                onRequestClose={() => setShowComments(false)}
            >
                <CommentModalImage
                    videoId={String(image.id)}
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

export default memo(ImageCard);

const styles = StyleSheet.create({
    container: { backgroundColor: '#000' },
    imageWrapper: { width: '100%', justifyContent: 'center', alignItems: 'center' },
    image: { width: '100%', height: '100%', resizeMode: 'cover' },
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
});
