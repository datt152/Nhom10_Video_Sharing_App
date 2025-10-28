import React from 'react';
import { View, Image, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { Image as ImageType } from '../../types/database.types';
import { Ionicons } from '@expo/vector-icons';

type Props = {
    images: ImageType[];
    privacy: 'public' | 'private';
    loading: boolean;
};

const ProfileImageList: React.FC<Props> = ({ images, privacy, loading }) => {
    if (loading) {
        return <ActivityIndicator size="small" color="#FF4EB8" />;
    }

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

    // ✅ Tách ảnh thành hàng 2 ảnh
    const rows = [];
    for (let i = 0; i < images.length; i += 2) {
        rows.push(images.slice(i, i + 2));
    }

    return (
        <View style={styles.container}>
            {rows.map((row, index) => (
                <View key={index} style={styles.row}>
                    {row.map((img) => (
                        <View key={img.id} style={styles.imageWrapper}>
                            <Image source={{ uri: img.imageUrl }} style={styles.imageBox} />

                            {/* overlay hiển thị lượt xem & tym */}
                            <View style={styles.overlay}>
                                <View style={styles.iconRow}>
                                    <View style={styles.iconGroup}>
                                        <Ionicons name="heart" size={14} color="#fff" />
                                        <Text style={styles.iconText}>{img.likes}</Text>
                                    </View>
                                    <View style={styles.iconGroup}>
                                        <Ionicons name="eye" size={14} color="#fff" />
                                        <Text style={styles.iconText}>{img.views}</Text>
                                    </View>
                                </View>
                            </View>
                        </View>
                    ))}
                </View>
            ))}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        alignItems: 'center', // ✅ căn giữa toàn bộ row
        paddingHorizontal: 8,
    },
    row: {
        flexDirection: 'row',
        justifyContent: 'center', //  căn giữa khi chỉ có 1 ảnh
        marginBottom: 12,
      
    },
    imageWrapper: {
        position: 'relative',
        marginHorizontal: 6, // khoảng cách giữa các ảnh
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
        justifyContent: 'space-between', //  cách đều 2 nhóm icon
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
