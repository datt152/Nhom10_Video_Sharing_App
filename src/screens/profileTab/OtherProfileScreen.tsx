import React, { useState, useEffect, useCallback } from "react";
import {
    View,
    Text,
    StyleSheet,
    Image,
    TouchableOpacity,
    ScrollView,
    ActivityIndicator,
} from "react-native";
import { useNavigation, useRoute, useFocusEffect } from "@react-navigation/native";
import { useUser } from "../../hooks/useUser";
import { useFollower } from "../../hooks/useFollowers";
import { useImage } from "../../hooks/useImage";
import { useVideo } from "../../hooks/useVideo";
import ProfileContent from "../../components/ProfileContent";

export default function OtherProfileScreen() {
    const navigation = useNavigation();
    const route = useRoute();
    const { userId } = route.params as { userId: string };

    const {
        targetUser,
        loading: userLoading,
        isFollowing,
        isFriend,
        followUser,
        unfollowUser,
        unfriendUser,
        loadTargetUser,
    } = useUser(userId);

    const { followerCount, followingCount, refreshFollowers, refreshFollowing } = useFollower();
    const { getImagesByUser, loading: imageLoading } = useImage();
    const { loadVideosByUser, loading: videoLoading } = useVideo();

    const [menu, setMenu] = useState<"videos" | "images">("videos");
    const [loadingContent, setLoadingContent] = useState(false);
    const [userVideos, setUserVideos] = useState<any[]>([]);
    const [userImages, setUserImages] = useState<any[]>([]);
    const [actionLoading, setActionLoading] = useState(false);

    // ✅ local state để UI phản hồi tức thì
    const [localIsFollowing, setLocalIsFollowing] = useState(isFollowing);
    const [localIsFriend, setLocalIsFriend] = useState(isFriend);

    // Đồng bộ lại khi dữ liệu hook thay đổi
    useEffect(() => {
        setLocalIsFollowing(isFollowing);
        setLocalIsFriend(isFriend);
    }, [isFollowing, isFriend]);

    const loadAll = useCallback(async () => {
        if (!userId) return;
        setLoadingContent(true);
        await loadTargetUser(userId);
        const vids = await loadVideosByUser(userId);
        console.log("User dang duoc xem tai khoan" +userId)
        console.log("danh sach video trang OtherProfileScreen.tsx "+vids)
        const imgs = await getImagesByUser(userId);
        console.log("danh sach image trang OtherProfileScreen.tsx "+imgs)
        setUserVideos(vids || []);
        setUserImages(imgs || []);
        setLoadingContent(false);
    }, [userId]);

    useEffect(() => {
        loadAll();
    }, [loadAll]);

    useFocusEffect(
        useCallback(() => {
            refreshFollowers();
            refreshFollowing();
        }, [])
    );

    const publicVideos = userVideos.filter((v) => v.isPublic);
    const publicImages = userImages.filter((img) => img.isPublic);

    // ✅ Cập nhật ngay khi follow / unfollow / unfriend
    const handleFollowAction = async () => {
        if (actionLoading) return; // tránh spam
        setActionLoading(true);

        try {
            if (localIsFriend) {
                await unfriendUser(userId);
                setLocalIsFriend(false);
                setLocalIsFollowing(false);
            } else if (localIsFollowing) {
                await unfollowUser(userId);
                setLocalIsFollowing(false);
            } else {
                await followUser(userId);
                setLocalIsFollowing(true);
            }

            // Làm mới dữ liệu nền
            loadTargetUser(userId);
            refreshFollowers();
            refreshFollowing();
            loadAll();
        } catch (error) {
            console.log("Lỗi khi xử lý follow/unfollow:", error);
        } finally {
            setActionLoading(false);
        }
    };

    const renderButtonText = () => {
        if (localIsFriend) return "Bạn bè 🤝";
        if (localIsFollowing) return "Đang theo dõi";
        return "Theo dõi";
    };

    const showContent = localIsFollowing || localIsFriend;

    if (userLoading || loadingContent || !targetUser) {
        return (
            <View style={styles.center}>
                <ActivityIndicator size="large" color="#FF4EB8" />
            </View>
        );
    }

    return (
        <ScrollView style={styles.container}>
            {/* Header */}
            <View style={styles.coverContainer}>
                <Image source={{ uri: targetUser.avatar }} style={styles.coverImage} />
                <TouchableOpacity
                    onPress={() => navigation.goBack()}
                    style={styles.backButton}
                >
                    <Text style={styles.backIcon}>‹</Text>
                </TouchableOpacity>
            </View>

            {/* Info */}
            <View style={styles.profileTop}>
                <Image source={{ uri: targetUser.avatar }} style={styles.avatar} />
                <Text style={styles.name}>{targetUser.fullname}</Text>
                <Text style={styles.username}>@{targetUser.username}</Text>
                <Text style={styles.bio}>{targetUser.bio}</Text>

                <View style={styles.statsRow}>
                    <View style={styles.statItem}>
                        <Text style={styles.statValue}>{followingCount}</Text>
                        <Text style={styles.statLabel}>Following</Text>
                    </View>
                    <View style={styles.statItem}>
                        <Text style={styles.statValue}>{followerCount}</Text>
                        <Text style={styles.statLabel}>Followers</Text>
                    </View>
                    <View style={styles.statItem}>
                        <Text style={styles.statValue}>{targetUser.likes}</Text>
                        <Text style={styles.statLabel}>Likes</Text>
                    </View>
                </View>

                <View style={styles.btnRow}>
                    <TouchableOpacity
                        style={[
                            styles.followBtn,
                            (localIsFollowing || localIsFriend) && styles.followedBtn,
                            actionLoading && { opacity: 0.7 },
                        ]}
                        onPress={handleFollowAction}
                        disabled={actionLoading}
                    >
                        {actionLoading ? (
                            <ActivityIndicator size="small" color="#fff" />
                        ) : (
                            <Text
                                style={[
                                    styles.followText,
                                    (localIsFollowing || localIsFriend) && styles.followedText,
                                ]}
                            >
                                {renderButtonText()}
                            </Text>
                        )}
                    </TouchableOpacity>

                    <TouchableOpacity style={styles.msgBtn}>
                        <Text style={styles.msgText}>Nhắn tin</Text>
                    </TouchableOpacity>
                </View>
            </View>

            {/* Content */}
            {showContent ? (
                <ProfileContent
                    menu={menu}
                    setMenu={setMenu}
                    videos={{ public: publicVideos }}
                    images={{ public: publicImages }}
                    loading={loadingContent || imageLoading || videoLoading}
                    navigation={navigation}
                />
            ) : (
                <View style={{ alignItems: "center", paddingVertical: 30 }}>
                    <Text style={{ color: "#999", fontSize: 14 }}>
                        Hãy theo dõi để xem nội dung của người này 👀
                    </Text>
                </View>
            )}
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: "#fff" },
    center: { flex: 1, justifyContent: "center", alignItems: "center" },
    coverContainer: { position: "relative", height: 150 },
    coverImage: { width: "100%", height: "100%" },
    backButton: {
        position: "absolute",
        top: 30,
        left: 15,
        backgroundColor: "rgba(255,255,255,0.8)",
        borderRadius: 40,
        paddingHorizontal: 10,
        paddingVertical: 2,
    },
    backIcon: { fontSize: 28, color: "#FF4EB8", fontWeight: "600" },
    profileTop: {
        alignItems: "center",
        paddingVertical: 25,
        borderBottomWidth: 1,
        borderBottomColor: "#eee",
    },
    avatar: { width: 110, height: 110, borderRadius: 100, borderWidth: 2, borderColor: "#FF4EB8" },
    name: { fontSize: 18, fontWeight: "700", marginTop: 10, color: "#333" },
    username: { fontSize: 14, color: "#888" },
    bio: { fontSize: 13, color: "#666", marginTop: 5, textAlign: "center", paddingHorizontal: 20 },
    statsRow: { flexDirection: "row", justifyContent: "center", marginTop: 10, gap: 30 },
    statItem: { alignItems: "center" },
    statValue: { fontSize: 16, fontWeight: "700", color: "#333" },
    statLabel: { fontSize: 13, color: "#777" },
    btnRow: { flexDirection: "row", gap: 10, marginTop: 12 },
    followBtn: {
        backgroundColor: "#FF4EB8",
        borderRadius: 20,
        paddingHorizontal: 25,
        paddingVertical: 8,
    },
    followedBtn: { backgroundColor: "#ffe6f3" },
    followText: { color: "#fff", fontWeight: "700" },
    followedText: { color: "#FF4EB8" },
    msgBtn: {
        backgroundColor: "#ffe6f3",
        borderRadius: 20,
        paddingHorizontal: 25,
        paddingVertical: 8,
    },
    msgText: { color: "#FF4EB8", fontWeight: "700" },
});
