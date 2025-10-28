import React, { useRef, useState } from 'react';
import { View, Dimensions, FlatList, Text, StyleSheet } from 'react-native';
import { useRoute, useNavigation, RouteProp } from '@react-navigation/native';
import { Image as ImageType } from '../../types/database.types';
import ImageCard from '../../components/ImageCard';
const { height } = Dimensions.get('window');

type UserImageViewerParams = {
    images?: ImageType[];
    initialIndex?: number;
    currentUserId?: string;
};

export default function UserImageViewer() {
    const route = useRoute<RouteProp<{ params: UserImageViewerParams }, 'params'>>();
    const navigation = useNavigation();
    const { images = [], initialIndex = 0, currentUserId = '' } = (route.params ?? {}) as UserImageViewerParams;

    const flatListRef = useRef<FlatList<ImageType> | null>(null);
    const [currentIndex, setCurrentIndex] = useState<number>(initialIndex);

    const handleViewableItemsChanged = useRef(({ viewableItems }: { viewableItems: any[] }) => {
        if (viewableItems.length > 0) {
            setCurrentIndex(viewableItems[0].index);
        }
    }).current;
    const [likedImages, setLikedImages] = useState<string[]>([]);

    const handleToggleLike = (imageId: string) => {
        setLikedImages(prev =>
            prev.includes(imageId)
                ? prev.filter(id => id !== imageId)
                : [...prev, imageId]
        );
    };
    //const viewConfigRef = useRef({ viewAreaCoveragePercentThreshold: 80 });
    const viewConfigRef = { viewAreaCoveragePercentThreshold: 80 };
    if (!images || images.length === 0) {
        return (
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                <Text>Không tìm thấy ảnh</Text>
            </View>
        );
    }
    return (
        <View style={styles.container}>
            <FlatList
                ref={flatListRef}
                data={images}
                renderItem={({ item, index }) => (
                    <ImageCard
                        image={item}
                        isActive={index === currentIndex}
                        currentUserId={currentUserId}
                        isFollowing={false}
                        isLiked={likedImages.includes(item.id)}     // ✅ thêm dòng này
                        onToggleLike={() => handleToggleLike(item.id)} // ✅ sửa dòng này
                        onToggleFollow={() => { }}
                    />
                )}
                keyExtractor={(item) => item.id.toString()}
                pagingEnabled
                showsVerticalScrollIndicator={false}
                onViewableItemsChanged={handleViewableItemsChanged}
                viewabilityConfig={viewConfigRef}
                initialScrollIndex={initialIndex}
                getItemLayout={(data, index) => ({
                    length: height,
                    offset: height * index,
                    index,
                })}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#000",
    },
    center: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
    },
});
