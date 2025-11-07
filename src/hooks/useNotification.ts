import { useState, useEffect, useCallback } from "react";
import axios from "axios";
import { Notification, User } from "../types/database.types";
import {API_BASE_URL, CURRENT_USER_ID} from '../types/config'


export const useNotification = (userId?: string) => {
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [unreadCount, setUnreadCount] = useState(0);

    const effectiveUserId = userId || CURRENT_USER_ID;

    // 🔹 Lấy danh sách thông báo
    const fetchNotifications = useCallback(async () => {
        try {
            const res = await axios.get(
                `${API_BASE_URL}/notifications?toUserId=${effectiveUserId}`
            );
            const data = res.data.sort(
                (a: any, b: any) =>
                    new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
            );

            setNotifications(data);
            setUnreadCount(data.filter((n: any) => !n.isRead).length);
        } catch (err) {
            console.error("[useNotification] fetch error:", err);
        }
    }, [effectiveUserId]);

    // 🔹 Đánh dấu tất cả là đã đọc
    const markAllAsRead = useCallback(async () => {
        try {
            const unread = notifications.filter(n => !n.isRead);
            await Promise.all(
                unread.map(n =>
                    axios.patch(`${API_BASE_URL}/notifications/${n.id}`, {
                        isRead: true,
                    })
                )
            );
            setUnreadCount(0);
            fetchNotifications();
        } catch (err) {
            console.error("[useNotification] markAllAsRead error:", err);
        }
    }, [notifications, fetchNotifications]);

    // 🔹 Fetch lần đầu
    useEffect(() => {
        fetchNotifications();
    }, [fetchNotifications]);

    return {
        notifications,
        unreadCount,
        fetchNotifications,
        markAllAsRead,
    };
};
