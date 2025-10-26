import React, { useState } from "react";
import {
    View,
    Text,
    StyleSheet,
    Image,
    TouchableOpacity,
    ScrollView,
    FlatList,
} from "react-native";
import { useNavigation, useRoute } from "@react-navigation/native";
import { useUser } from "../../hooks/useUser";

export default function OtherProfileScreen() {
    const navigation = useNavigation();
    const route = useRoute();
    const { userId } = route.params as { userId: string };

    const { loading, targetUser, isFollowing, isFollowedByOther, isFriend } =
        useUser(userId);

    const [activeTab, setActiveTab] = useState<"videos" | "images"|"liked">("videos");

    if (loading || !targetUser) {
        return (
            <View style={styles.loadingContainer}>
                <Text>Đang tải...</Text>
            </View>
        );
    }

    const canViewContent = isFriend || isFollowing;

    return (
        <ScrollView style={styles.container}>
            {/* Cover + Back Button */}
            <View style={styles.coverContainer}>
                <Image
                    source={{
                        uri:
                            targetUser.avatar ||
                            "https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e",
                    }}
                    style={styles.coverImage}
                />
                <TouchableOpacity
                    onPress={() => navigation.goBack()}
                    style={styles.backButton}
                >
                    <Text style={styles.backIcon}>‹</Text>
                </TouchableOpacity>
            </View>

            {/* Avatar + Info */}
            <View style={styles.profileSection}>
                <Image source={{ uri: targetUser.avatar }} style={styles.avatar} />
                <Text style={styles.username}>{targetUser.fullname}</Text>
                <Text style={styles.bio}>{targetUser.bio || "Không có mô tả."}</Text>

                {isFollowedByOther && !isFollowing && (
                    <Text style={styles.followBackText}>
                        Người này đang theo dõi bạn
                    </Text>
                )}

                {/* Buttons */}
                <View style={styles.buttonRow}>
                    <TouchableOpacity
                        style={[
                            styles.followBtn,
                            (isFollowing || isFriend) && styles.followedBtn,
                        ]}
                    >
                        <Text
                            style={[
                                styles.followText,
                                (isFollowing || isFriend) && styles.followedText,
                            ]}
                        >
                            {isFriend ? "Bạn bè 💞" : isFollowing ? "Đang Follow" : "Follow"}
                        </Text>
                    </TouchableOpacity>

                    <TouchableOpacity style={styles.msgBtn}>
                        <Text style={styles.msgText}>Nhắn tin</Text>
                    </TouchableOpacity>
                </View>
            </View>

            {/* Stats */}
            <View style={styles.statsRow}>
                <View style={styles.statItem}>
                    <Text style={styles.statValue}>203</Text>
                    <Text style={styles.statLabel}>Following</Text>
                </View>
                <View style={styles.statItem}>
                    <Text style={styles.statValue}>628</Text>
                    <Text style={styles.statLabel}>Followers</Text>
                </View>
                <View style={styles.statItem}>
                    <Text style={styles.statValue}>2634</Text>
                    <Text style={styles.statLabel}>Likes</Text>
                </View>
            </View>

            {/* Videos */}
            {canViewContent && (
                <>
                    <View style={styles.menuTabs}>
                        <TouchableOpacity
                            style={[styles.tab, activeTab === "videos" && styles.activeTab]}
                            onPress={() => setActiveTab("videos")}
                        >
                            <Text
                                style={[
                                    styles.tabText,
                                    activeTab === "videos" && styles.activeTabText,
                                ]}
                            >
                                Videos
                            </Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={[styles.tab, activeTab === "images" && styles.activeTab]}
                            onPress={() => setActiveTab("images")}
                        >
                            <Text
                                style={[
                                    styles.tabText,
                                    activeTab === "images" && styles.activeTabText,
                                ]}
                            >
                                Image
                            </Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={[styles.tab, activeTab === "liked" && styles.activeTab]}
                            onPress={() => setActiveTab("liked")}
                        >
                            <Text
                                style={[
                                    styles.tabText,
                                    activeTab === "liked" && styles.activeTabText,
                                ]}
                            >
                                Liked
                            </Text>
                        </TouchableOpacity>
                    </View>

                    <FlatList
                        data={[
                            { id: 1, img: "https://source.unsplash.com/400x400/?nature" },
                            { id: 2, img: "https://source.unsplash.com/400x400/?food" },
                            { id: 3, img: "https://source.unsplash.com/400x400/?travel" },
                            { id: 4, img: "https://source.unsplash.com/400x400/?flowers" },
                        ]}
                        numColumns={3}
                        keyExtractor={(item) => item.id.toString()}
                        renderItem={({ item }) => (
                            <Image source={{ uri: item.img }} style={styles.videoThumb} />
                        )}
                    />
                </>
            )}
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: "#fff" },
    loadingContainer: { flex: 1, justifyContent: "center", alignItems: "center" },

    coverContainer: { position: "relative", height: 150 },
    coverImage: { width: "100%", height: "100%" },
    backButton: {
        position: "absolute",
        top: 45,
        left: 15,
        backgroundColor: "rgba(255,255,255,0.8)",
        borderRadius: 20,
        paddingHorizontal: 10,
        paddingVertical: 2,
    },
    backIcon: { fontSize: 28, color: "#FF5BAE", fontWeight: "600" },

    profileSection: { alignItems: "center", marginTop: -50, padding: 20 },
    avatar: {
        width: 100,
        height: 100,
        borderRadius: 50,
        borderWidth: 3,
        borderColor: "#fff",
        marginBottom: 10,
    },
    username: { fontSize: 20, fontWeight: "700", color: "#000" },
    bio: { color: "#555", textAlign: "center", marginTop: 5, marginBottom: 10 },
    followBackText: { color: "#FF5BAE", fontSize: 13, marginBottom: 10 },

    buttonRow: { flexDirection: "row", gap: 10, marginTop: 10 },
    followBtn: {
        backgroundColor: "#FF5BAE",
        borderRadius: 20,
        paddingHorizontal: 30,
        paddingVertical: 10,
    },
    followedBtn: { backgroundColor: "#FFE6F2" },
    followText: { color: "#fff", fontWeight: "600" },
    followedText: { color: "#FF5BAE" },
    msgBtn: {
        backgroundColor: "#FFE6F2",
        borderRadius: 20,
        paddingHorizontal: 30,
        paddingVertical: 10,
    },
    msgText: { color: "#FF5BAE", fontWeight: "600" },

    statsRow: {
        flexDirection: "row",
        justifyContent: "space-around",
        marginTop: 10,
        paddingVertical: 10,
        borderBottomWidth: 1,
        borderColor: "#f1f1f1",
    },
    statItem: { alignItems: "center" },
    statValue: { fontSize: 18, fontWeight: "700", color: "#000" },
    statLabel: { color: "#777", fontSize: 13 },

    menuTabs: {
        flexDirection: "row",
        justifyContent: "center",
        borderBottomWidth: 1,
        borderColor: "#f1f1f1",
        marginTop: 20,
    },
    tab: {
        paddingVertical: 10,
        paddingHorizontal: 20,
        marginHorizontal: 10,
    },
    activeTab: {
        borderBottomWidth: 2,
        borderColor: "#FF5BAE",
    },
    tabText: { color: "#777", fontWeight: "500" },
    activeTabText: { color: "#FF5BAE", fontWeight: "700" },
    videoThumb: {
        width: "32%",
        height: 120,
        borderRadius: 10,
        margin: "1%",
    },
});
