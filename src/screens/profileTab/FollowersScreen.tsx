import React, { useEffect, useState } from "react";
import {
    View,
    Text,
    TouchableOpacity,
    FlatList,
    Image,
    StyleSheet,
    TextInput,
    RefreshControl,
    ActivityIndicator,
} from "react-native";
import { useNavigation, useRoute, RouteProp } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import { useFollower } from "../../hooks/useFollowers";
import { useUser } from "../../hooks/useUser";
import { User } from "../../types/database.types";

type FollowPageRouteProp = RouteProp<
    { params: { tab?: "followers" | "following" | "suggestions"; userId?: string } },
    "params"
>;

const FollowPage: React.FC = () => {
    const navigation: any = useNavigation();
    const route = useRoute<FollowPageRouteProp>();
    
    const { currentUser: loggedInUser } = useUser();
    const userId = route.params?.userId || loggedInUser?.id || "u1";

    const {
        followers,
        following,
        loading: followerLoading,
        followUser,
        unfollowUser,
        refreshFollowers,
        refreshFollowing,
    } = useFollower(userId);

    const {
        currentUser,
        toggleFollow,
        fetchFollowingList,
        fetchFollowersList,
        fetchSuggestions,
    } = useUser();

    const [activeTab, setActiveTab] = useState<
        "followers" | "following" | "suggestions"
    >("followers");
    const [search, setSearch] = useState("");
    const [suggestions, setSuggestions] = useState<User[]>([]);
    const [loading, setLoading] = useState(false);
    const [refreshing, setRefreshing] = useState(false);

    useEffect(() => {
        console.log("👥 Followers:", followers.map((u) => u.fullname || u.username));
        console.log("➡️ Following:", following.map((u) => u.fullname || u.username));
    }, [followers, following]);

    // Load suggestions
    const loadSuggestions = async () => {
        try {
            setLoading(true);
            const data = await fetchSuggestions();
            setSuggestions(data);
        } catch (error) {
            console.error('Error loading suggestions:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (activeTab === 'suggestions') {
            loadSuggestions();
        }
    }, [activeTab]);

    useEffect(() => {
        if (
            route.params?.tab === "following" ||
            route.params?.tab === "followers" ||
            route.params?.tab === "suggestions"
        ) {
            setActiveTab(route.params.tab);
        }
    }, [route.params]);

    // Refresh data
    const onRefresh = async () => {
        setRefreshing(true);
        await Promise.all([refreshFollowers(), refreshFollowing()]);
        if (activeTab === 'suggestions') {
            await loadSuggestions();
        }
        setRefreshing(false);
    };

    const getList = () => {
        switch (activeTab) {
            case "following":
                return following;
            case "suggestions":
                return suggestions;
            default:
                return followers;
        }
    };

    const list = getList().filter((user: User) =>
        user.fullname?.toLowerCase().includes(search.toLowerCase()) ||
        user.username?.toLowerCase().includes(search.toLowerCase())
    );

    // Handle follow/unfollow với logic từ FriendScreen
    const handleFollowToggle = async (targetUserId: string) => {
        // Use toggleFollow from useUser to update currentUser state
        await toggleFollow(targetUserId);

        // Also refresh followers/following lists
        await refreshFollowers();
        await refreshFollowing();
        
        // Reload suggestions if on suggestions tab
        if (activeTab === 'suggestions') {
            await loadSuggestions();
        }
    };

    if (followerLoading && !refreshing) {
        return (
            <View style={styles.container}>
                <ActivityIndicator size="large" color="#FF3CAC" style={{ marginTop: 40 }} />
            </View>
        );
    }

    return (
        <View style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()}>
                    <Ionicons name="arrow-back" size={24} color="#FF3CAC" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>
                    {activeTab === "followers"
                        ? "Người theo dõi"
                        : activeTab === "following"
                            ? "Đang theo dõi"
                            : "Gợi ý"}
                </Text>
                <View style={{ width: 24 }} />
            </View>

            {/* Tabs */}
            <View style={styles.tabContainer}>
                {["following", "followers", "suggestions"].map((tab) => (
                    <TouchableOpacity
                        key={tab}
                        style={{
                            ...styles.tab,
                            backgroundColor: activeTab === tab ? "#FF3CAC" : "#f8f8f8",
                        }}
                        onPress={() =>
                            setActiveTab(tab as "following" | "followers" | "suggestions")
                        }
                    >
                        <Text
                            style={{
                                color: activeTab === tab ? "#fff" : "#555",
                                fontWeight: activeTab === tab ? "600" : "500",
                                fontSize: 13,
                            }}
                        >
                            {tab === "following"
                                ? "Following"
                                : tab === "followers"
                                    ? "Followers"
                                    : "Gợi ý"}
                        </Text>
                    </TouchableOpacity>
                ))}
            </View>

            {/* Search box */}
            <View style={styles.searchBox}>
                <Ionicons
                    name="search"
                    size={18}
                    color="#FF3CAC"
                    style={{ marginRight: 8 }}
                />
                <TextInput
                    placeholder="Tìm kiếm người dùng..."
                    placeholderTextColor="#aaa"
                    value={search}
                    onChangeText={setSearch}
                    style={styles.searchInput}
                />
            </View>

            {/* List */}
            <FlatList
                data={list}
                keyExtractor={(item) => item.id.toString()}
                refreshControl={
                    <RefreshControl
                        refreshing={refreshing}
                        onRefresh={onRefresh}
                        colors={["#FF3CAC"]}
                        tintColor="#FF3CAC"
                    />
                }
                renderItem={({ item }: { item: User }) => {
                    const followingIds = currentUser?.followingIds || [];
                    const isFollowing = followingIds.includes(item.id);

                    // --- Logic nút follow/unfollow ---
                    let buttonLabel = "";
                    let buttonStyle = {};
                    let textStyle = {};

                    if (isFollowing) {
                        buttonLabel = "Đang Follow";
                        buttonStyle = styles.followedBtn;
                        textStyle = styles.followedBtnText;
                    } else {
                        buttonLabel = "Follow";
                        buttonStyle = styles.followBackBtn;
                        textStyle = { color: "#fff", fontWeight: "600" };
                    }

                    return (
                        <TouchableOpacity
                            style={styles.userCard}
                            onPress={() =>
                                navigation.navigate("OtherProfileScreen", { userId: item.id })
                            }
                        >
                            <View style={styles.userInfo}>
                                <Image source={{ uri: item.avatar }} style={styles.avatar} />
                                <View>
                                    <Text style={styles.userName}>{item.fullname || item.username}</Text>
                                    <Text style={styles.userUsername}>@{item.username}</Text>
                                </View>
                            </View>

                            {/* Nút follow/unfollow */}
                            <TouchableOpacity
                                style={[styles.followBtn, buttonStyle]}
                                onPress={() => handleFollowToggle(item.id)}
                            >
                                <Text style={[styles.followBtnText, textStyle]}>
                                    {buttonLabel}
                                </Text>
                            </TouchableOpacity>
                        </TouchableOpacity>
                    );
                }}
                ListEmptyComponent={
                    <Text style={styles.emptyText}>
                        {activeTab === "followers"
                            ? "Chưa có người theo dõi 👀"
                            : activeTab === "following"
                                ? "Bạn chưa theo dõi ai 🤔"
                                : "Chưa có gợi ý 💡"}
                    </Text>
                }
            />
        </View>
    );
};

export default FollowPage;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#fff",
        paddingHorizontal: 16,
        paddingTop: 50,
    },
    header: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        marginBottom: 20,
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: "bold",
        color: "#FF3CAC",
    },
    tabContainer: {
        flexDirection: "row",
        justifyContent: "center",
        marginBottom: 15,
    },
    tab: {
        paddingVertical: 8,
        paddingHorizontal: 16,
        borderRadius: 20,
        marginHorizontal: 6,
    },
    searchBox: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "#f8f8f8",
        borderRadius: 20,
        paddingHorizontal: 15,
        paddingVertical: 6,
        marginBottom: 20,
    },
    searchInput: {
        flex: 1,
        fontSize: 15,
        color: "#333",
    },
    userCard: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        backgroundColor: "#fff",
        paddingVertical: 12,
        paddingHorizontal: 10,
        borderRadius: 14,
        borderWidth: 1,
        borderColor: "#f1f1f1",
        marginBottom: 10,
        shadowColor: "#000",
        shadowOpacity: 0.05,
        shadowOffset: { width: 0, height: 1 },
        shadowRadius: 2,
        elevation: 2,
    },
    userInfo: {
        flexDirection: "row",
        alignItems: "center",
    },
    avatar: {
        width: 50,
        height: 50,
        borderRadius: 25,
        marginRight: 12,
    },
    userName: {
        fontSize: 16,
        fontWeight: "500",
        color: "#222",
    },
    userUsername: {
        fontSize: 13,
        color: "#888",
        marginTop: 2,
    },
    followBtn: {
        borderRadius: 20,
        paddingVertical: 6,
        paddingHorizontal: 14,
    },
    followBackBtn: {
        backgroundColor: "#FF3CAC",
    },
    followedBtn: {
        backgroundColor: "#fce4f7",
    },
    friendBtn: {
        backgroundColor: "#f0bde5ff",
    },
    followBtnText: {
        fontSize: 14,
        fontWeight: "600",
    },
    followedBtnText: {
        color: "#FF3CAC",
        fontWeight: "600",
    },
    friendBtnText: {
        color: "#fff",
        fontWeight: "600",
    },
    emptyText: {
        textAlign: "center",
        color: "#999",
        marginTop: 20,
    },
});
