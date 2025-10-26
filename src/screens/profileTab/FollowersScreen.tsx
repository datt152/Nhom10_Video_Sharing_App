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

interface User {
    id: number;
    name: string;
    avatar?: string;
    isFollowingBack?: boolean;
}

type FollowPageRouteProp = RouteProp<
    { params: { tab?: "followers" | "following" | "friends" } },
    "params"
>;

const FollowPage: React.FC = () => {
    const navigation = useNavigation();
    const route = useRoute<FollowPageRouteProp>();
    const [activeTab, setActiveTab] = useState<
        "followers" | "following" | "friends"
    >("followers");
    const [search, setSearch] = useState("");

    // Dữ liệu mẫu
    const followers: User[] = [
        {
            id: 1,
            name: "Nguyễn Văn A",
            avatar: "https://i.pravatar.cc/150?img=11",
            isFollowingBack: false,
        },
        {
            id: 2,
            name: "Trần Thị B",
            avatar: "https://i.pravatar.cc/150?img=12",
            isFollowingBack: true,
        },
    ];

    const following: User[] = [
        { id: 3, name: "Lê Văn C", avatar: "https://i.pravatar.cc/150?img=13" },
        { id: 4, name: "Phạm Thị D", avatar: "https://i.pravatar.cc/150?img=14" },
    ];

    // Tạo danh sách bạn bè (người vừa follow bạn vừa được bạn follow)
    const friends: User[] = followers.filter((f) => f.isFollowingBack === true);

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
        user.name.toLowerCase().includes(search.toLowerCase())
    );

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
                <TouchableOpacity
                    style={[styles.tab, activeTab === "following" && styles.activeTab]}
                    onPress={() => setActiveTab("following")}
                >
                    <Text
                        style={[
                            styles.tabText,
                            activeTab === "following" && styles.activeTabText,
                        ]}
                    >
                        Following
                    </Text>
                </TouchableOpacity>

                <TouchableOpacity
                    style={[styles.tab, activeTab === "followers" && styles.activeTab]}
                    onPress={() => setActiveTab("followers")}
                >
                    <Text
                        style={[
                            styles.tabText,
                            activeTab === "followers" && styles.activeTabText,
                        ]}
                    >
                        Followers
                    </Text>
                </TouchableOpacity>

                <TouchableOpacity
                    style={[styles.tab, activeTab === "friends" && styles.activeTab]}
                    onPress={() => setActiveTab("friends")}
                >
                    <Text
                        style={[
                            styles.tabText,
                            activeTab === "friends" && styles.activeTabText,
                        ]}
                    >
                        Friends
                    </Text>
                </TouchableOpacity>
            </View>

            {/* Ô tìm kiếm */}
            <View style={styles.searchBox}>
                <Ionicons name="search" size={18} color="#FF3CAC" style={{ marginRight: 8 }} />
                <TextInput
                    placeholder="Tìm kiếm người dùng..."
                    placeholderTextColor="#aaa"
                    value={search}
                    onChangeText={setSearch}
                    style={styles.searchInput}
                />
            </View>

            {/* Danh sách */}
            <FlatList
                data={list}
                keyExtractor={(item) => item.id.toString()}
                renderItem={({ item }) => (
                    <View style={styles.userCard}>
                        <View style={styles.userInfo}>
                            <Image source={{ uri: item.avatar }} style={styles.avatar} />
                            <Text style={styles.userName}>{item.name}</Text>
                        </View>

                        {/* Nút trạng thái */}
                        {activeTab === "followers" ? (
                            <TouchableOpacity
                                style={[
                                    styles.followBtn,
                                    item.isFollowingBack
                                        ? styles.followedBtn
                                        : styles.followBackBtn,
                                ]}
                            >
                                <Text
                                    style={[
                                        styles.followBtnText,
                                        item.isFollowingBack && styles.followedBtnText,
                                    ]}
                                >
                                    {item.isFollowingBack ? "Đã Follow" : "Follow lại"}
                                </Text>
                            </TouchableOpacity>
                        ) : activeTab === "following" ? (
                            <TouchableOpacity
                                style={[styles.followBtn, styles.followedBtn]}
                            >
                                <Text
                                    style={[styles.followBtnText, styles.followedBtnText]}
                                >
                                    Đã Follow
                                </Text>
                            </TouchableOpacity>
                        ) : (
                            <TouchableOpacity
                                style={[styles.followBtn, styles.followedBtn]}
                            >
                                <Text
                                    style={[styles.followBtnText, styles.followedBtnText]}
                                >
                                    Bạn bè 💞
                                </Text>
                            </TouchableOpacity>
                        )}
                    </View>
                )}
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
        backgroundColor: "#f8f8f8",
        marginHorizontal: 6,
    },
    activeTab: {
        backgroundColor: "#FF3CAC",
    },
    tabText: {
        color: "#555",
        fontWeight: "500",
    },
    activeTabText: {
        color: "#fff",
        fontWeight: "600",
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
    },
    emptyText: {
        textAlign: "center",
        color: "#999",
        marginTop: 20,
    },
});
