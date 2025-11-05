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
            {/* Thanh menu chọn video / ảnh */}
            <View style={styles.menu}>
                {(["videos", "images"] as MenuType[]).map((type) => (
                    <TouchableOpacity key={type} onPress={() => setMenu(type)}>
                        <Text style={[styles.menuText, menu === type && styles.activeMenu]}>
                            {type === "videos" ? "Video" : "Ảnh"}
                        </Text>
                    </TouchableOpacity>
                ))}
            </View>

            {/* Hiển thị nội dung */}
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
        paddingVertical: 14,
        marginTop: 5,
        marginBottom: 8,
        width: "100%",
    },
    menuText: {
        fontSize: 15,
        color: "#777",
        paddingHorizontal: 8,
        fontWeight: "500",
    },
    activeMenu: {
        color: "#FF4EB8",
        fontWeight: "700",
        textDecorationLine: "underline",
    },
    contentBox: {
        alignItems: "center",
        paddingVertical: 20,
        width: "100%",
    },
});
