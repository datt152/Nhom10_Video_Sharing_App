import React, { useEffect, useRef, useState } from "react";
import { View, FlatList, Text, StyleSheet, Dimensions } from "react-native";
import { useRoute, RouteProp } from "@react-navigation/native";
import { Video as VideoType, Music } from "../../types/database.types";
import VideoCard from "../../components/VideoCardProfile";
import { useVideo } from "../../hooks/useVideo"; // ✅ import thêm
const { height } = Dimensions.get("window");

type UserVideoViewerParams = {
    videos?: VideoType[];
    musics?: Music[];
    initialVideoId?: string;   // 🆕 thêm dòng này
    currentUserId?: string;
};

export default function UserVideoViewer() {
    const route = useRoute<RouteProp<{ params: UserVideoViewerParams }, "params">>();
    const { videos = [], musics = [], initialVideoId, currentUserId = "" } =
        (route.params ?? {}) as UserVideoViewerParams;
    const { refreshVideos } = useVideo(); // ✅ lấy hàm refresh
    const flatListRef = useRef<FlatList<VideoType>>(null);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [likedVideos, setLikedVideos] = useState<string[]>([]);

    const viewConfigRef = useRef({ viewAreaCoveragePercentThreshold: 80 }).current;

    // 🧭 Tính vị trí video được click
    const initialIndex = Math.max(
        videos.findIndex((v) => String(v.id) === String(initialVideoId)),
        0
    );


    // 🧷 Scroll tới đúng video
    useEffect(() => {
        if (videos.length === 0) return;

        const timer = setTimeout(() => {
            try {
                flatListRef.current?.scrollToIndex({
                    index: initialIndex,
                    animated: false,
                });
            } catch {
                flatListRef.current?.scrollToOffset({
                    offset: height * initialIndex,
                    animated: false,
                });
            }
        }, 300);

        return () => clearTimeout(timer);
    }, [videos, initialIndex]);

    // 📺 Cập nhật video đang xem
    const handleViewableItemsChanged = useRef(
        ({ viewableItems }: { viewableItems: any[] }) => {
            if (viewableItems.length > 0 && viewableItems[0].index !== null) {
                setCurrentIndex(viewableItems[0].index);
            }
        }
    ).current;

    const handleToggleLike = (videoId: string) => {
        setLikedVideos((prev) =>
            prev.includes(videoId)
                ? prev.filter((id) => id !== videoId)
                : [...prev, videoId]
        );
    };

    const handleToggleFollow = (userId: string) => {
        console.log("Follow/Unfollow user:", userId);
    };

    if (!videos || videos.length === 0) {
        return (
            <View style={styles.center}>
                <Text>Không tìm thấy video</Text>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <FlatList
                ref={flatListRef}
                data={videos}
                keyExtractor={(item) => String(item.id)}
                renderItem={({ item, index }) => (
                    <VideoCard
                        video={item}
                        isFollowing={false}
                        currentUserId={currentUserId}
                        onToggleLike={() => handleToggleLike(item.id)}
                        onToggleFollow={() => handleToggleFollow(item.userId)}
                        isLiked={likedVideos.includes(item.id)}
                        isActive={index === currentIndex}
                        musics={musics}
                        onPrivacyChange={refreshVideos} // ✅ thêm dòng này

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
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: "#000" },
    center: { flex: 1, justifyContent: "center", alignItems: "center" },
});
