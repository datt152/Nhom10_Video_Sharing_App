import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import ProfileImageList from "../screens/profileTab/ProfileImageList";
import ProfileVideoList from "../screens/profileTab/ProfileVideoList";

type MenuType = "videos" | "images";

interface ProfileContentProps {
    menu: MenuType;
    setMenu: (value: MenuType) => void;
    videos: { public: any[] };
    images: { public: any[] };
    loading: boolean;
    navigation: any;
}

export default function ProfileContent({
    menu,
    setMenu,
    videos,
    images,
    loading,
    navigation,
}: ProfileContentProps) {
    return (
        <View style={styles.contentBox}>
            <View style={styles.menu}>
                {(["videos", "images"] as MenuType[]).map((type) => (
                    <TouchableOpacity key={type} onPress={() => setMenu(type)}>
                        <Text style={[styles.menuText, menu === type && styles.activeMenu]}>
                            {type === "videos" ? "Video" : "Image"}
                        </Text>
                    </TouchableOpacity>
                ))}
            </View>

            {menu === "videos" ? (
                <ProfileVideoList
                    videos={videos.public}
                    privacy="public"
                    loading={loading}
                    onPressVideo={(video) => navigation.navigate("VideoScreen", { video })}
                />
            ) : (
                <ProfileImageList
                    images={images.public}
                    privacy="public"
                    loading={loading}
                    onPressImage={(img, index) =>
                        navigation.navigate("UserImageViewer", {
                            images: images.public,
                            initialIndex: index,
                        })
                    }
                />
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    menu: {
        flexDirection: "row",
        justifyContent: "space-around",
        borderBottomWidth: 1,
        borderColor: "#eee",

        paddingVertical: 14,   // ↑ tăng khoảng cách dọc giữa text và border
        marginTop: 5,         // ↑ cách phần trên (avatar, info)
        marginBottom: 8,       // ↑ thêm chút cách với nội dung dưới
    },
    menuText: {
        fontSize: 15, color: "#777", paddingHorizontal: 8},
        activeMenu: { color: "#FF4EB8", fontWeight: "700" },
        contentBox: { alignItems: "center", paddingVertical: 20 },
    });
