import { useEffect, useState, useCallback } from "react";
import axios from "axios";
import { Notification, User } from "../types/database.types";
import { API_BASE_URL, getCurrentUserId } from '../types/config'

export const useNotification = () => {
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [loading, setLoading] = useState<boolean>(false);

    // 🔹 Số lượng thông báo chưa đọc
    const [unreadCount, setUnreadCount] = useState<number>(0);

    // 🔹 Giới hạn hiển thị
    const [visibleCount, setVisibleCount] = useState<number>(5);

    // 🧠 Lấy danh sách thông báo
    const fetchNotifications = useCallback(async () => {
        const currentUserId = await getCurrentUserId();
        if (!currentUserId) return;
        setLoading(true);
        try {
            const res = await axios.get(
                `${API_BASE_URL}/notifications?userId=${currentUserId}`
            );
            const sorted = res.data.sort(
                (a: Notification, b: Notification) =>
                    new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
            );

            setNotifications(sorted);

            // 🔹 Đếm số lượng chưa đọc
            const unread = sorted.filter((n: Notification) => !n.isRead).length;
            setUnreadCount(unread);
        } catch (error) {
            console.error("❌ Lỗi khi tải thông báo:", error);
        } finally {
            setLoading(false);
        }
    }, []);

    // 🧠 Thêm thông báo mới
    const addNotification = useCallback(async (noti: Notification) => {
        try {
            await axios.post(`${API_BASE_URL}/notifications`, noti);
            setNotifications((prev) => [noti, ...prev]);
            if (!noti.isRead) setUnreadCount((prev) => prev + 1);
        } catch (error) {
            console.error("❌ Lỗi khi tạo thông báo:", error);
        }
    }, []);

    // 🧠 Đánh dấu đã đọc
    const markAsRead = useCallback(async (id: string) => {
        try {
            await axios.patch(`${API_BASE_URL}/notifications/${id}`, { isRead: true });
            setNotifications((prev) =>
                prev.map((n) => (n.id === id ? { ...n, isRead: true } : n))
            );
            setUnreadCount((prev) => Math.max(prev - 1, 0));
        } catch (error) {
            console.error("❌ Lỗi khi đánh dấu đã đọc:", error);
        }
    }, []);

    // 🧠 Xem thêm
    const loadMore = useCallback(() => {
        setVisibleCount((prev) => prev + 5);
    }, []);

    useEffect(() => {
        fetchNotifications();
    }, [fetchNotifications]);

    // 🔹 Trả ra danh sách hiển thị giới hạn
    const visibleNotifications = notifications.slice(0, visibleCount);

    return {
        notifications: visibleNotifications, // chỉ hiển thị giới hạn
        allNotifications: notifications, // nếu cần toàn bộ
        unreadCount,
        loading,
        fetchNotifications,
        addNotification,
        markAsRead,
        loadMore,
        hasMore: visibleCount < notifications.length, // có còn để "xem thêm" không
    };
};
