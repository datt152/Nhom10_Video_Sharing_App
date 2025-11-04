// ✅ components/ImageCard.tsx (chuẩn field likedBy + cập nhật isLiked)
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
import CommentModalImage from './CommentModalImage';
import { useImage } from '../hooks/useImage';
import { useNavigation } from '@react-navigation/native';
import { useImageComments } from '../hooks/useCommentImage';

interface ImageCardProps {
    image: ImageType;
    isFollowing: boolean;
    currentUserId: string;
    onToggleLike: (imageId: string) => void;
    onToggleFollow: (userId: string) => void;
    isLiked?: boolean;
    isActive?: boolean;
    musics?: Music[];
}

const ImageCard: React.FC<ImageCardProps> = ({
    image,
    isFollowing,
    currentUserId,
    onToggleLike,
    onToggleFollow,
    isActive,
    musics = [],
}) => {
    const { height: SCREEN_HEIGHT, width: SCREEN_WIDTH } = useWindowDimensions();
    const [showComments, setShowComments] = useState(false);
    const [localLikeCount, setLocalLikeCount] = useState(image.likes || image.likeBy?.length || 0);
    const [localIsLiked, setLocalIsLiked] = useState(image.likeBy?.includes(currentUserId) || false);
    const [totalCommentCount, setTotalCommentCount] = useState(0);

    const likeAnimation = useRef(new Animated.Value(0)).current;
    const spinAnim = useRef(new Animated.Value(0)).current;
    const [sound, setSound] = useState<Audio.Sound | null>(null);

    const { publicImages, getImageLikes, likeImage, unlikeImage } = useImage();
    const {
        comments,
        fetchComments,
        addComment,
        deleteComment,
        likeComment,
        countCommentsByImage,
    } = useImageComments(String(image.id));
    const navigation = useNavigation();

    // ✅ Đồng bộ like từ publicImages
    useEffect(() => {
        const updated = publicImages.find((img) => img.id === image.id);
        if (updated) {
            const likedNow = Array.isArray(updated.likeBy)
                ? updated.likeBy.includes(currentUserId)
                : !!updated.isLiked;

            const likeCount = Array.isArray(updated.likeBy)
                ? updated.likeBy.length
                : Number(updated.likes) || 0;

            setLocalIsLiked(likedNow);
            setLocalLikeCount(likeCount);
        } else {
            const likedNow = Array.isArray(image.likeBy)
                ? image.likeBy.includes(currentUserId)
                : !!image.isLiked;

            const likeCount = Array.isArray(image.likeBy)
                ? image.likeBy.length
                : Number(image.likes) || 0;

            setLocalIsLiked(likedNow);
            setLocalLikeCount(likeCount);
        }
    }, [publicImages, image.id, currentUserId]);

    // ✅ Sync khi image prop thay đổi
    useEffect(() => {
        const likedNow = Array.isArray(image.likeBy) ? image.likeBy.includes(currentUserId) : false;
        const likeCount = Array.isArray(image.likeBy)
            ? image.likeBy.length
            : Number(image.likes) || 0;

        setLocalIsLiked(likedNow);
        setLocalLikeCount(likeCount);
    }, [image.likeBy, image.likes, currentUserId]);

    // ✅ Lấy lại số lượng like từ DB
    useEffect(() => {
        let mounted = true;
        const fetch = async () => {
            try {
                if (typeof getImageLikes === 'function') {
                    const count = await getImageLikes(image.id);
                    if (mounted && typeof count === 'number' && count !== localLikeCount) {
                        setLocalLikeCount(count);
                    }
                }
            } catch (e) {
                console.log('[ImageCard] getImageLikes error', e);
            }
        };
        fetch();
        return () => {
            mounted = false;
        };
    }, [image.id]);

    // ✅ Đếm bình luận
    useEffect(() => {
        const loadCount = async () => {
            try {
                const count = await countCommentsByImage(String(image.id));
                setTotalCommentCount(count ?? 0);
            } catch (e) {
                console.log('[ImageCard] countCommentsByImage error', e);
            }
        };
        loadCount();
    }, [comments, image.id]);

    // ✅ Xử lý nhạc quay đĩa
    const music = musics.find((m) => m.id === image.musicId);
    useEffect(() => {
        if (!isActive || !music?.uri) return;
        startRotation();
        return () => {
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
    const rotate = spinAnim.interpolate({ inputRange: [0, 1], outputRange: ['0deg', '360deg'] });

    // ✅ Toggle like
    const handleLike = async () => {
        try {
            const newLiked = !localIsLiked;
            setLocalIsLiked(newLiked);
            setLocalLikeCount((prev) => Math.max(0, prev + (newLiked ? 1 : -1)));

            if (newLiked) {
                await likeImage(image.id);
            } else {
                await unlikeImage(image.id);
            }

            Animated.sequence([
                Animated.spring(likeAnimation, { toValue: 1, useNativeDriver: true }),
                Animated.spring(likeAnimation, { toValue: 0, useNativeDriver: true }),
            ]).start();
        } catch (error) {
            console.log('🔥 Lỗi khi toggle like:', error);
        }
    };

    const handleFollow = () => onToggleFollow(image.userId);
    const handleOpenComments = () => {
        setShowComments(true);
        fetchComments();
    };
    const handleAddComment = async (content: string, parentId: string | null = null) => {
        await addComment(content, parentId);
    };
    const handleDeleteComment = async (commentId: string, parentId: string | null = null) => {
        await deleteComment(commentId, parentId);
    };

    const likeScale = likeAnimation.interpolate({ inputRange: [0, 1], outputRange: [1, 1.3] });

    const formatNumber = (num?: number) => {
        if (num === undefined || num === null || Number.isNaN(num)) return '0';
        const n = Number(num);
        if (n >= 1000000) return (n / 1000000).toFixed(1) + 'M';
        if (n >= 1000) return (n / 1000).toFixed(1) + 'K';
        return n.toString();
    };

    return (
        <View style={[styles.container, { width: SCREEN_WIDTH, height: SCREEN_HEIGHT }]}>
            <TouchableOpacity activeOpacity={0.9} style={[styles.imageWrapper, { height: SCREEN_HEIGHT }]}>
                <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
                    <Ionicons name="arrow-back" size={28} color="#fff" />
                </TouchableOpacity>

                <Image source={{ uri: image.imageUrl }} style={styles.image} />
                <LinearGradient
                    colors={['transparent', 'rgba(0,0,0,0.2)', 'rgba(0,0,0,0.7)']}
                    style={styles.gradient}
                />

                <View style={styles.bottomContent}>
                    <View style={styles.leftContent}>
                        {image.caption ? (
                            <Text style={styles.caption} numberOfLines={2}>
                                {image.caption}
                            </Text>
                        ) : null}
                    </View>

                    <View style={styles.rightContent}>
                        <TouchableOpacity style={styles.actionButton} onPress={handleLike}>
                            <Animated.View style={{ transform: [{ scale: likeScale }] }}>
                                <Ionicons
                                    name={localIsLiked ? 'heart' : 'heart-outline'}
                                    size={32}
                                    color={localIsLiked ? '#FF3B5C' : '#fff'}
                                />
                            </Animated.View>
                            <Text style={styles.actionText}>{formatNumber(localLikeCount ?? 0)}</Text>
                        </TouchableOpacity>

                        <TouchableOpacity style={styles.actionButton} onPress={handleOpenComments}>
                            <Ionicons name="chatbubble-outline" size={30} color="#fff" />
                            <Text style={styles.actionText}>{totalCommentCount ?? 0}</Text>
                        </TouchableOpacity>

                        <View style={styles.actionButton}>
                            <Ionicons name="eye-outline" size={28} color="#fff" />
                            <Text style={styles.actionText}>{formatNumber(Number(image.views) || 0)}</Text>
                        </View>

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
                <CommentModalImage
                    imageId={String(image.id)}
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
    musicInfo: { position: 'absolute', bottom: 20, left: 16, flexDirection: 'row', alignItems: 'center', gap: 6 },
    musicText: { color: '#fff', fontSize: 14, maxWidth: '70%' },
    musicDisc: { width: 44, height: 44, borderRadius: 22, borderWidth: 2, borderColor: '#fff', justifyContent: 'center', alignItems: 'center', marginTop: 10 },
    backButton: { position: 'absolute', top: 40, left: 16, zIndex: 10, backgroundColor: 'rgba(0,0,0,0.4)', borderRadius: 30, padding: 6 },
});
