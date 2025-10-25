import React, { useState } from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    StyleSheet,
    Image,
    ScrollView,
} from 'react-native';

// Interface cho video đã thích
interface LikedVideo {
    id: number;
    thumbnail: string;
}

// Interface cho hình ảnh đã thích
interface LikedImage {
    id: number;
    uri: string;
}

const likedVideos: LikedVideo[] = [
    { id: 1, thumbnail: 'https://placekitten.com/400/250' },
    { id: 2, thumbnail: 'https://placekitten.com/401/250' },
    { id: 3, thumbnail: 'https://placekitten.com/402/250' },
    { id: 4, thumbnail: 'https://placekitten.com/403/250' },
];

const likedImages: LikedImage[] = [
    { id: 1, uri: 'https://placekitten.com/250/250' },
    { id: 2, uri: 'https://placekitten.com/251/250' },
    { id: 3, uri: 'https://placekitten.com/252/250' },
    { id: 4, uri: 'https://placekitten.com/253/250' },
];

const ProfileLikedTab: React.FC = () => {
    const [menu, setMenu] = useState<'video' | 'image'>('video');

    const data = menu === 'video' ? likedVideos : likedImages;

    return (
        <ScrollView style={styles.container}>
            {/* Menu con (Video - Hình ảnh) */}
            <View style={styles.subMenu}>
                <TouchableOpacity
                    style={[styles.subBtn, menu === 'video' && styles.active]}
                    onPress={() => setMenu('video')}
                >
                    <Text
                        style={[
                            styles.subText,
                            menu === 'video' && styles.activeText,
                        ]}
                    >
                        Video
                    </Text>
                </TouchableOpacity>

                <TouchableOpacity
                    style={[styles.subBtn, menu === 'image' && styles.active]}
                    onPress={() => setMenu('image')}
                >
                    <Text
                        style={[
                            styles.subText,
                            menu === 'image' && styles.activeText,
                        ]}
                    >
                        Hình ảnh
                    </Text>
                </TouchableOpacity>
            </View>

            {/* Danh sách hiển thị */}
            <View style={styles.grid}>
                {data.length > 0 ? (
                    data.map((item) => (
                        <View key={item.id} style={styles.card}>
                            <Image
                                source={{
                                    uri:
                                        menu === 'video'
                                            ? (item as LikedVideo).thumbnail
                                            : (item as LikedImage).uri,
                                }}
                                style={styles.thumbnail}
                            />
                        </View>
                    ))
                ) : (
                    <Text style={styles.emptyText}>Chưa có nội dung yêu thích</Text>
                )}
            </View>
        </ScrollView>
    );
};

export default ProfileLikedTab;

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#fff' },
    subMenu: {
        flexDirection: 'row',
        justifyContent: 'center',
        gap: 20,
        paddingVertical: 8,
        borderBottomWidth: 1,
        borderBottomColor: '#eee',
    },
    subBtn: {
        paddingVertical: 5,
        paddingHorizontal: 10,
    },
    subText: { color: '#666', fontSize: 14 },
    active: {
        borderBottomWidth: 2,
        borderBottomColor: '#FF4EB8',
    },
    activeText: { color: '#FF4EB8', fontWeight: '600' },
    grid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
        paddingHorizontal: 15,
        marginTop: 15,
    },
    card: { width: '48%', marginBottom: 10 },
    thumbnail: { width: '100%', height: 160, borderRadius: 10 },
    emptyText: { textAlign: 'center', marginTop: 40, color: '#999' },
});
