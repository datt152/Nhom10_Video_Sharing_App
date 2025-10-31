import React, { useEffect, useState } from 'react';
import {
    View,
    Image,
    Text,
    StyleSheet,
    ActivityIndicator,
    TouchableOpacity,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Image as ImageType } from '../../types/database.types';
import { useImage } from '../../hooks/useImage'; // 👈 import hook để lấy getImageLikes

type Props = {
    images: ImageType[];
    privacy: 'public' | 'private';
    loading: boolean;
    onPressImage?: (img: ImageType) => void;
};

const ProfileImageList: React.FC<Props> = ({
    images,
    privacy,
    loading,
    onPressImage,
}) => {
    const { getImageLikes } = useImage();
    const [likeCounts, setLikeCounts] = useState<Record<string, number>>({});

    useEffect(() => {
        const fetchLikes = async () => {
            const counts: Record<string, number> = {};
            for (const img of images) {
                const count = await getImageLikes(img.id);
                counts[img.id] = count;
            }
            setLikeCounts(counts);
        };

        if (images.length) fetchLikes();
    }, [images]);

    if (loading) return <ActivityIndicator size="small" color="#FF4EB8" />;

    if (!images.length) {
        return (
            <View style={styles.emptyBox}>
                <Text style={styles.emptyText}>
                    {privacy === 'public'
                        ? 'Chưa có hình ảnh công khai nào.'
                        : 'Chưa có hình ảnh riêng tư nào.'}
                </Text>
            </View>
        );
    }

    // 🧩 chia 2 ảnh 1 hàng
    const rows: ImageType[][] = [];
    for (let i = 0; i < images.length; i += 2) {
        rows.push(images.slice(i, i + 2));
    }

    return (
        <View style={styles.container}>
            {rows.map((row, index) => (
                <View key={index} style={styles.row}>
                    {row.map((img) => (
                        <TouchableOpacity
                            key={img.id}
                            activeOpacity={0.8}
                            style={styles.imageWrapper}
                            onPress={() => onPressImage?.(img)}
                        >
                            <Image source={{ uri: img.imageUrl }} style={styles.imageBox} />

                            {/* overlay hiển thị tym & view */}
                            <View style={styles.overlay}>
                                <View style={styles.iconRow}>
                                    <View style={styles.iconGroup}>
                                        <Ionicons name="heart" size={14} color="#fff" />
                                        <Text style={styles.iconText}>
                                            {likeCounts[img.id] ?? 0}
                                        </Text>
                                    </View>
                                    <View style={styles.iconGroup}>
                                        <Ionicons name="eye" size={14} color="#fff" />
                                        <Text style={styles.iconText}>
                                            {img.views ?? 0}
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
    container: {
        alignItems: 'center',
        paddingHorizontal: 8,
    },
    row: {
        flexDirection: 'row',
        justifyContent: 'center',
        marginBottom: 12,
    },
    imageWrapper: {
        position: 'relative',
        marginHorizontal: 6,
    },
    imageBox: {
        width: 160,
        height: 200,
        borderRadius: 12,
    },
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
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    iconGroup: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    iconText: {
        color: '#fff',
        fontSize: 12,
        marginLeft: 4,
    },
    emptyBox: {
        alignItems: 'center',
        marginTop: 10,
    },
    emptyText: {
        fontSize: 14,
        color: '#777',
    },
});

export default ProfileImageList;
