import React, { useEffect, useState } from "react";
import {
    View,
    Text,
    TouchableOpacity,
    FlatList,
    Image,
    StyleSheet,
    TextInput,
} from "react-native";
import { useNavigation, useRoute, RouteProp } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import { useFollower } from "../../hooks/useFollowers";
import { User } from "../../types/database.types";

type FollowPageRouteProp = RouteProp<
    { params: { tab?: "followers" | "following" | "friends" } },
    "params"
>;

const FollowPage: React.FC = () => {
    const navigation = useNavigation();
    const route = useRoute<FollowPageRouteProp>();
    const { followers, following, loading } = useFollower();
    const [activeTab, setActiveTab] = useState<
        "followers" | "following" | "friends"
    >("followers");
    const [search, setSearch] = useState("");

    const friends = followers.filter((f) =>
        following.some((x) => x.id === f.id)
    );

    useEffect(() => {
        if (
            route.params?.tab === "following" ||
            route.params?.tab === "followers" ||
            route.params?.tab === "friends"
        ) {
            setActiveTab(route.params.tab);
        }
    }, [route.params]);

    const getList = () => {
        switch (activeTab) {
            case "following":
                return following;
            case "friends":
                return friends;
            default:
                return followers;
        }
    };

    const list = getList().filter((user) =>
        user.fullname.toLowerCase().includes(search.toLowerCase())
    );

    if (loading) {
        return (
            <View style={styles.container}>
                <Text style={{ textAlign: "center", marginTop: 40 }}>Đang tải...</Text>
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
                            : "Bạn bè"}
                </Text>
                <View style={{ width: 24 }} />
            </View>

            {/* Tabs */}
            <View style={styles.tabContainer}>
                {["following", "followers", "friends"].map((tab) => (
                    <TouchableOpacity
                        key={tab}
                        style={{
                            ...styles.tab,
                            backgroundColor:
                                activeTab === tab ? "#FF3CAC" : "#f8f8f8",
                        }}
                        onPress={() =>
                            setActiveTab(tab as "following" | "followers" | "friends")
                        }
                    >
                        <Text
                            style={{
                                color: activeTab === tab ? "#fff" : "#555",
                                fontWeight: activeTab === tab ? "600" : "500",
                            }}
                        >
                            {tab === "following"
                                ? "Following"
                                : tab === "followers"
                                    ? "Followers"
                                    : "Friends"}
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
                renderItem={({ item }: { item: User }) => {
                    const isFriend = friends.some((x) => x.id === item.id);
                    const isFollowing = following.some((x) => x.id === item.id);
                    const isFollower = followers.some((x) => x.id === item.id);

                    let buttonLabel = "";
                    let buttonStyle = {};
                    let textStyle = {};

                    if (activeTab === "following") {
                        if (isFriend) {
                            buttonLabel = "Bạn bè 💞";
                            buttonStyle = styles.followedBtn;
                            textStyle = styles.followedBtnText;
                        } else {
                            buttonLabel = "Đã Follow";
                            buttonStyle = styles.followedBtn;
                            textStyle = styles.followedBtnText;
                        }
                    } else if (activeTab === "followers") {
                        if (isFriend) {
                            buttonLabel = "Bạn bè 💞";
                            buttonStyle = styles.followedBtn;
                            textStyle = styles.followedBtnText;
                        } else {
                            buttonLabel = "Follow lại";
                            buttonStyle = styles.followBackBtn;
                            textStyle = { color: "#fff", fontWeight: "600" };
                        }
                    } else if (activeTab === "friends") {
                        buttonLabel = "Bạn bè 💞";
                        buttonStyle = styles.followedBtn;
                        textStyle = styles.followedBtnText;
                    }

                    return (
                        <View style={styles.userCard}>
                            <View style={styles.userInfo}>
                                <Image source={{ uri: item.avatar }} style={styles.avatar} />
                                <Text style={styles.userName}>{item.fullname}</Text>
                            </View>

                            <TouchableOpacity
                                style={[styles.followBtn, buttonStyle]}
                            >
                                <Text style={[styles.followBtnText, textStyle]}>
                                    {buttonLabel}
                                </Text>
                            </TouchableOpacity>
                        </View>
                    );
                }}
                ListEmptyComponent={
                    <Text style={styles.emptyText}>
                        {activeTab === "followers"
                            ? "Chưa có người theo dõi 👀"
                            : activeTab === "following"
                                ? "Bạn chưa theo dõi ai 🤔"
                                : "Chưa có bạn nào 💬"}
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
    followBtnText: {
        fontSize: 14,
        fontWeight: "600",
    },
    followedBtnText: {
        color: "#FF3CAC",
        fontWeight: "600",
    },
    emptyText: {
        textAlign: "center",
        color: "#999",
        marginTop: 20,
    },
});
