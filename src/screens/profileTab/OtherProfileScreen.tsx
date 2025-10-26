import React, { useState } from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, ScrollView } from 'react-native';

export default function OtherProfileScreen() {
    const [isFollowing, setIsFollowing] = useState(false);
    const [isFollowedByOther, setIsFollowedByOther] = useState(true); // người kia có follow mình không

    const handleFollowToggle = () => {
        setIsFollowing(!isFollowing);
    };

    return (
        <ScrollView style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity>
                    <Text style={styles.backIcon}>←</Text>
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Hồ sơ</Text>
                <View style={{ width: 20 }} /> {/* placeholder để căn giữa */}
            </View>

            {/* Avatar + info */}
            <View style={styles.profileSection}>
                <Image
                    source={{
                        uri: 'https://cdn-icons-png.flaticon.com/512/5556/5556468.png',
                    }}
                    style={styles.avatar}
                />
                <Text style={styles.username}>Kon Natachai</Text>
                <Text style={styles.bio}>🎬 Yêu thích sáng tạo và chia sẻ video thú vị mỗi ngày</Text>

                {isFollowedByOther && !isFollowing && (
                    <Text style={styles.followBackText}>Người này đang theo dõi bạn</Text>
                )}

                {/* Follow buttons */}
                <View style={styles.buttonRow}>
                    <TouchableOpacity
                        style={[styles.followBtn, isFollowing && styles.followedBtn]}
                        onPress={handleFollowToggle}
                    >
                        <Text style={[styles.followText, isFollowing && styles.followedText]}>
                            {isFollowing ? 'Đã Follow' : 'Follow'}
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

            {/* Suggested accounts */}
            <View style={styles.suggestedSection}>
                <View style={styles.suggestedHeader}>
                    <Text style={styles.suggestedTitle}>Tài khoản gợi ý</Text>
                    <Text style={styles.viewMore}>Xem thêm</Text>
                </View>

                <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                    {['Flaura', 'Bobb', 'Kiddy'].map((name, index) => (
                        <View key={index} style={styles.suggestedCard}>
                            <Image
                                source={{
                                    uri: 'https://cdn-icons-png.flaticon.com/512/3177/3177440.png',
                                }}
                                style={styles.suggestedAvatar}
                            />
                            <Text style={styles.suggestedName}>{name}</Text>
                            <TouchableOpacity style={styles.suggestedFollowBtn}>
                                <Text style={styles.suggestedFollowText}>Follow</Text>
                            </TouchableOpacity>
                        </View>
                    ))}
                </ScrollView>
            </View>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#fff' },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        paddingTop: 40,
        paddingBottom: 10,
    },
    backIcon: { fontSize: 20, color: '#FF5BAE' },
    headerTitle: { fontSize: 18, fontWeight: '700', color: '#000' },
    profileSection: { alignItems: 'center', padding: 20 },
    avatar: { width: 100, height: 100, borderRadius: 50, marginBottom: 10 },
    username: { fontSize: 20, fontWeight: '700', color: '#000' },
    bio: { color: '#555', textAlign: 'center', marginTop: 5, marginBottom: 10 },
    followBackText: { color: '#FF5BAE', fontSize: 13, marginBottom: 10 },
    buttonRow: { flexDirection: 'row', gap: 10, marginTop: 10 },
    followBtn: {
        backgroundColor: '#FF5BAE',
        borderRadius: 20,
        paddingHorizontal: 30,
        paddingVertical: 10,
    },
    followedBtn: { backgroundColor: '#E8E8E8' },
    followText: { color: '#fff', fontWeight: '600' },
    followedText: { color: '#333' },
    msgBtn: {
        backgroundColor: '#FFE6F2',
        borderRadius: 20,
        paddingHorizontal: 30,
        paddingVertical: 10,
    },
    msgText: { color: '#FF5BAE', fontWeight: '600' },
    statsRow: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        marginTop: 10,
        paddingVertical: 10,
        borderBottomWidth: 1,
        borderColor: '#f1f1f1',
    },
    statItem: { alignItems: 'center' },
    statValue: { fontSize: 18, fontWeight: '700', color: '#000' },
    statLabel: { color: '#777', fontSize: 13 },
    suggestedSection: { marginTop: 15, paddingHorizontal: 16 },
    suggestedHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 10,
    },
    suggestedTitle: { fontSize: 16, fontWeight: '700', color: '#000' },
    viewMore: { color: '#FF5BAE', fontWeight: '600' },
    suggestedCard: {
        alignItems: 'center',
        backgroundColor: '#fafafa',
        borderRadius: 16,
        padding: 10,
        width: 100,
        marginRight: 10,
    },
    suggestedAvatar: { width: 50, height: 50, borderRadius: 25 },
    suggestedName: { marginTop: 5, fontWeight: '600', color: '#000' },
    suggestedFollowBtn: {
        marginTop: 6,
        backgroundColor: '#FF5BAE',
        borderRadius: 12,
        paddingHorizontal: 10,
        paddingVertical: 5,
    },
    suggestedFollowText: { color: '#fff', fontSize: 13 },
});
