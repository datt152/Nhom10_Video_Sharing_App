import React from 'react';
import { View, Image, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { Video } from '../../types/database.types';

type Props = {
    videos: Video[]; // ← nhận mảng video
    privacy: 'public' | 'private';
    loading: boolean;
};

const ProfileVideoList: React.FC<Props> = ({ videos, privacy, loading }) => {
    if (loading) {
        return <ActivityIndicator size="small" color="#FF4EB8" />;
    }

    if (!videos.length) {
        return (
            <View style={styles.emptyBox}>
                <Text style={styles.emptyText}>
                    {privacy === 'public'
                        ? 'Chưa có video công khai nào.'
                        : 'Chưa có video riêng tư nào.'}
                </Text>
            </View>
        );
    }

    return (
        <View style={styles.grid}>
            {videos.map((video) => (
                <Image
                    key={video.id}
                    source={{ uri: video.thumbnail }}
                    style={styles.videoThumb}
                />
            ))}
        </View>
    );
};

const styles = StyleSheet.create({
    grid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'center',
    },
    videoThumb: {
        width: 100,
        height: 150,
        borderRadius: 8,
        margin: 5,
    },
    emptyBox: { alignItems: 'center', marginTop: 10 },
    emptyText: { fontSize: 14, color: '#777' },
});

export default ProfileVideoList;
