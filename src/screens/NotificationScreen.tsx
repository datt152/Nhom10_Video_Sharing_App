// src/screens/NotificationScreen.tsx
import React, { useCallback, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  FlatList,
  ActivityIndicator,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation, useFocusEffect } from "@react-navigation/native";
import { useNotification } from "../hooks/useNotification";

export const NotificationScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const { notifications, loading, fetchNotifications, markAsRead } = useNotification();

  const [localNotifications, setLocalNotifications] = useState<any[]>([]);
  const [firstLoaded, setFirstLoaded] = useState(false);

  // ✅ Fetch khi focus, chỉ 1 lần
  useFocusEffect(
    useCallback(() => {
      let active = true;

      const loadData = async () => {
        try {
          const res = await fetchNotifications();
          if (active && Array.isArray(res)) {
            setLocalNotifications(res);
            setFirstLoaded(true);
          }
        } catch (err) {
          console.warn("Fetch notifications error:", err);
        }
      };

      // chỉ gọi nếu chưa load
      if (!firstLoaded) loadData();

      return () => {
        active = false;
      };
    }, [firstLoaded]) // ← chỉ phụ thuộc biến boolean
  );

  // ✅ Khi hook cập nhật dữ liệu mới (fetch từ nơi khác)
  React.useEffect(() => {
    if (notifications && notifications.length > 0) {
      setLocalNotifications(notifications);
    }
  }, [notifications?.length]); // chỉ theo dõi độ dài, tránh lặp vô hạn

  const handlePress = async (noti: any) => {
    if (!noti) return;

    // Đánh dấu đọc local
    setLocalNotifications((prev) =>
      prev.map((n) => (n.id === noti.id ? { ...n, isRead: true } : n))
    );

    try {
      await markAsRead(noti.id);
    } catch (err) {
      console.warn("Mark read failed:", err);
    }
  };

  if (loading && !firstLoaded) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#FF4EB8" />
      </View>
    );
  }

  const unreadCount = localNotifications.filter((n) => !n.isRead).length;

  const renderItem = ({ item }: { item: any }) => {
    const isUnread = !item.isRead;
    return (
      <TouchableOpacity
        style={[styles.card, isUnread && styles.unreadCard]}
        onPress={() => handlePress(item)}
      >
        <View style={{ flex: 1 }}>
          <Text style={[styles.message, isUnread && styles.unreadText]} numberOfLines={2}>
            {item.message || item.content || "Thông báo mới"}
          </Text>
          <Text style={styles.time}>
            {item.createdAt ? new Date(item.createdAt).toLocaleString() : ""}
          </Text>
        </View>
        {isUnread ? (
          <View style={styles.unreadDot} />
        ) : (
          <Ionicons name="chevron-forward" size={18} color="#bbb" />
        )}
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={{ padding: 4, marginRight: 8 }}
        >
          <Ionicons name="arrow-back" size={24} color="#FF4EB8" />
        </TouchableOpacity>
        <Text style={styles.title}>Thông báo</Text>
        {unreadCount > 0 && (
          <View style={styles.badge}>
            <Text style={styles.badgeText}>{unreadCount}</Text>
          </View>
        )}
      </View>

      <FlatList
        data={localNotifications}
        keyExtractor={(i) => i.id.toString()}
        renderItem={renderItem}
        contentContainerStyle={{ padding: 12 }}
        ListEmptyComponent={() => (
          <View style={styles.empty}>
            <Text style={{ color: "#777" }}>Chưa có thông báo</Text>
          </View>
        )}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },
  header: {
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 6,
    flexDirection: "row",
    alignItems: "center",
  },
  title: { fontSize: 20, fontWeight: "700", color: "#FF4EB8" },
  badge: {
    backgroundColor: "#FF4EB8",
    paddingHorizontal: 8,
    marginLeft: 8,
    borderRadius: 10,
  },
  badgeText: { color: "#fff", fontWeight: "700", fontSize: 12 },
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
  card: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFF5FA",
    marginBottom: 8,
    padding: 14,
    borderRadius: 12,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 3,
    elevation: 2,
  },
  unreadCard: { backgroundColor: "#ffe6f3" },
  message: { fontWeight: "500", color: "#222", fontSize: 15 },
  unreadText: { fontWeight: "700", color: "#000" },
  time: { color: "#666", marginTop: 6, fontSize: 12 },
  unreadDot: {
    width: 10,
    height: 10,
    borderRadius: 6,
    backgroundColor: "#FF4EB8",
    marginLeft: 8,
  },
  empty: { alignItems: "center", marginTop: 40 },
});

export default NotificationScreen;
