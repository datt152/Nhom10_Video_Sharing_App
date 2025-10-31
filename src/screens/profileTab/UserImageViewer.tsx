import React, { useEffect, useRef, useState } from 'react';
import {
    View,
    Dimensions,
    FlatList,
    Text,
    StyleSheet,
} from 'react-native';
import { useRoute, RouteProp } from '@react-navigation/native';
import { Image as ImageType } from '../../types/database.types';
import ImageCard from '../../components/ImageCardProfile';

const { height } = Dimensions.get('window');

type UserImageViewerParams = {
    images?: ImageType[];
    initialIndex?: number;
    currentUserId?: string;
};

export default function UserImageViewer() {
    const route = useRoute<RouteProp<{ params: UserImageViewerParams }, 'params'>>();
    const { images = [], initialIndex = 0, currentUserId = '' } =
        (route.params ?? {}) as UserImageViewerParams;

    const flatListRef = useRef<FlatList<ImageType>>(null);
    const [currentIndex, setCurrentIndex] = useState(initialIndex);
    const [likedImages, setLikedImages] = useState<string[]>([]);
    const [isReady, setIsReady] = useState(false); // ✅ đảm bảo FlatList mount xong mới scroll

    const viewConfigRef = useRef({ viewAreaCoveragePercentThreshold: 80 }).current;

    // ✅ Khi list mount xong, scroll chính xác 1 lần
    useEffect(() => {
        if (images.length === 0) return;

        const timer = setTimeout(() => {
            try {
                flatListRef.current?.scrollToIndex({
                    index: initialIndex,
                    animated: false,
                });
                setIsReady(true);
            } catch (error) {
                console.warn('⚠️ scrollToIndex failed, using scrollToOffset fallback...');
                setTimeout(() => {
                    flatListRef.current?.scrollToOffset({
                        offset: height * initialIndex,
                        animated: false,
                    });
                    setIsReady(true);
                }, 300);
            }
        }, 300); // chờ 300ms để list render xong

        return () => clearTimeout(timer);
    }, [images, initialIndex]);

    const handleViewableItemsChanged = useRef(
        ({ viewableItems }: { viewableItems: any[] }) => {
            if (viewableItems.length > 0 && viewableItems[0].index !== null) {
                setCurrentIndex(viewableItems[0].index);
            }
        }
    ).current;

    const handleToggleLike = (imageId: string) => {
        setLikedImages((prev) =>
            prev.includes(imageId)
                ? prev.filter((id) => id !== imageId)
                : [...prev, imageId]
        );
    };

    if (!images || images.length === 0) {
        return (
            <View style={styles.center}>
                <Text>Không tìm thấy ảnh</Text>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <FlatList
                ref={flatListRef}
                data={images}
                keyExtractor={(item) => String(item.id)}
                renderItem={({ item, index }) => (
                    <ImageCard
                        image={item}
                        isActive={index === currentIndex}
                        currentUserId={currentUserId}
                        isFollowing={false}
                        isLiked={likedImages.includes(item.id)}
                        onToggleLike={() => handleToggleLike(item.id)}
                        onToggleFollow={() => { }}
                    />
                )}
                pagingEnabled
                showsVerticalScrollIndicator={false}
                snapToInterval={height}
                decelerationRate="fast"
                viewabilityConfig={viewConfigRef}
                onViewableItemsChanged={handleViewableItemsChanged}
                getItemLayout={(_, index) => ({
                    length: height,
                    offset: height * index,
                    index,
                })}
                removeClippedSubviews
                onScrollToIndexFailed={(info) => {
                    console.warn('onScrollToIndexFailed → fallback');
                    setTimeout(() => {
                        flatListRef.current?.scrollToOffset({
                            offset: info.averageItemLength * info.index,
                            animated: false,
                        });
                    }, 400);
                }}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#000' },
    center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
});
