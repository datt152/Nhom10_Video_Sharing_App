import React, { useEffect, useState } from 'react';
import {
    View,
    Image,
    Text,
    StyleSheet,
    ActivityIndicator,
    TouchableOpacity,
} from 'react-native';
import { Video as VideoType } from '../../types/database.types';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useComments } from '../../hooks/useComment'; // ✅ thêm import

type Props = {
    videos: VideoType[];
    privacy: 'public' | 'private';
    loading: boolean;
    onPressVideo?: (video: VideoType) => void;
};

const ProfileVideoList: React.FC<Props> = ({ videos, privacy, loading }) => {
    const navigation = useNavigation<any>();
    const { countCommentsByVideo } = useComments(''); // ✅ dùng hàm này

    const [commentCounts, setCommentCounts] = useState<Record<string, number>>({});

    useEffect(() => {
        const fetchCommentCounts = async () => {
            const counts: Record<string, number> = {};
            for (const v of videos) {
                counts[v.id] = await countCommentsByVideo(v.id);
            }
            setCommentCounts(counts);
        };

        if (videos.length > 0) {
            fetchCommentCounts();
        }
    }, [videos]);

    if (loading) return <ActivityIndicator size="small" color="#FF4EB8" />;

    if (!videos.length)
        return (
            <View style={styles.emptyBox}>
                <Text style={styles.emptyText}>
                    {privacy === 'public'
                        ? 'Chưa có video công khai nào.'
                        : 'Chưa có video riêng tư nào.'}
                </Text>
            </View>
        );

    const rows: VideoType[][] = [];
    for (let i = 0; i < videos.length; i += 2) {
        rows.push(videos.slice(i, i + 2));
    }

    const handlePressVideo = (video: VideoType) => {
        navigation.navigate('UserVideoViewer', {
            videos,
            initialVideoId: video.id,
        });
    };

    return (
        <View style={styles.container}>
            {rows.map((row, index) => (
                <View key={index} style={styles.row}>
                    {row.map((video) => (
                        <TouchableOpacity
                            key={video.id}
                            style={styles.imageWrapper}
                            onPress={() => handlePressVideo(video)}
                            activeOpacity={0.8}
                        >
                            <Image source={{ uri: video.thumbnail }} style={styles.imageBox} />
                            <View style={styles.overlay}>
                                <View style={styles.iconRow}>
                                    <View style={styles.iconGroup}>
                                        <Ionicons name="heart" size={14} color="#fff" />
                                        <Text style={styles.iconText}>{video.likeCount ?? 0}</Text>
                                    </View>
                                    <View style={styles.iconGroup}>
                                        <Ionicons name="chatbubble" size={14} color="#fff" />
                                        <Text style={styles.iconText}>
                                            {commentCounts[video.id] ?? 0}
                                        </Text>
                                    </View>
                                </View>
                            </View>
                        </TouchableOpacity>
                    ))}
                </View>
            ))}
        </View>
    );
};

const styles = StyleSheet.create({
    container: { alignItems: 'center', paddingHorizontal: 8 },
    row: { flexDirection: 'row', justifyContent: 'center', marginBottom: 12 },
    imageWrapper: { position: 'relative', marginHorizontal: 8 },
    imageBox: { width: 160, height: 200, borderRadius: 12 },
    overlay: {
        position: 'absolute',
        bottom: 5,
        left: 5,
        right: 5,
        backgroundColor: 'rgba(0, 0, 0, 0.35)',
        borderBottomLeftRadius: 12,
        borderBottomRightRadius: 12,
        paddingVertical: 4,
        paddingHorizontal: 8,
    },
    iconRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    iconGroup: { flexDirection: 'row', alignItems: 'center' },
    iconText: { color: '#fff', fontSize: 12, marginLeft: 4 },
    emptyBox: { alignItems: 'center', marginTop: 10 },
    emptyText: { fontSize: 14, color: '#777' },
});

export default ProfileVideoList;

