import { useState, useCallback, useEffect } from "react";
import axios from "axios";
import { User } from "../types/database.types";

const API_BASE_URL = "http://192.168.65.2:3000";

export const useFollower = (userId?: string) => {
    const CURRENT_USER_ID = "u2"; // giả lập user đang đăng nhập
    const TARGET_USER_ID = userId || CURRENT_USER_ID; // user đang được xem (ở hồ sơ)

    const [followers, setFollowers] = useState<User[]>([]);
    const [following, setFollowing] = useState<User[]>([]);
    const [loading, setLoading] = useState(false);

    // 🧭 Lấy danh sách người đang follow TARGET_USER
    const fetchFollowers = useCallback(async () => {
        setLoading(true);
        try {
            const { data: targetUser } = await axios.get<User>(
                `${API_BASE_URL}/users/${TARGET_USER_ID}`
            );

            if (Array.isArray(targetUser.followerIds) && targetUser.followerIds.length > 0) {
                const { data: allUsers } = await axios.get<User[]>(`${API_BASE_URL}/users`);
                const list = allUsers.filter((u) => targetUser.followerIds.includes(u.id));
                setFollowers(list);
                return list;
            } else {
                setFollowers([]);
                return [];
            }
        } catch (error) {
            console.error("❌ Lỗi khi lấy danh sách followers:", error);
            return [];
        } finally {
            setLoading(false);
        }
    }, [TARGET_USER_ID]);

    // 🧭 Lấy danh sách người TARGET_USER đang follow
    const fetchFollowing = useCallback(async () => {
        setLoading(true);
        try {
            const { data: targetUser } = await axios.get<User>(
                `${API_BASE_URL}/users/${TARGET_USER_ID}`
            );

            if (Array.isArray(targetUser.followingIds) && targetUser.followingIds.length > 0) {
                const { data: allUsers } = await axios.get<User[]>(`${API_BASE_URL}/users`);
                const list = allUsers.filter((u) => targetUser.followingIds.includes(u.id));
                setFollowing(list);
                return list;
            } else {
                setFollowing([]);
                return [];
            }
        } catch (error) {
            console.error("❌ Lỗi khi lấy danh sách following:", error);
            return [];
        } finally {
            setLoading(false);
        }
    }, [TARGET_USER_ID]);

    // 🔁 Load ban đầu
    useEffect(() => {
        fetchFollowers();
        fetchFollowing();
    }, [fetchFollowers, fetchFollowing]);

    // ✅ Follow người khác
    const followUser = useCallback(
        async (targetUserId: string) => {
            try {
                const { data: currentUser } = await axios.get<User>(
                    `${API_BASE_URL}/users/${CURRENT_USER_ID}`
                );
                const { data: targetUser } = await axios.get<User>(
                    `${API_BASE_URL}/users/${targetUserId}`
                );

                if (currentUser.followingIds.includes(targetUserId)) return;

                const updatedCurrentUser = {
                    ...currentUser,
                    followingIds: [...currentUser.followingIds, targetUserId],
                };
                const updatedTargetUser = {
                    ...targetUser,
                    followerIds: [...targetUser.followerIds, CURRENT_USER_ID],
                };

                await axios.patch(`${API_BASE_URL}/users/${CURRENT_USER_ID}`, updatedCurrentUser);
                await axios.patch(`${API_BASE_URL}/users/${targetUserId}`, updatedTargetUser);
                // 🔔 Gửi thông báo cho người được follow (targetUser)
                await axios.post(`${API_BASE_URL}/notifications`, {
                    userId: targetUserId,
                    senderId: CURRENT_USER_ID,
                    type: "FOLLOW",
                    message: `${currentUser.fullname} đã theo dõi bạn`,
                    createdAt: new Date().toISOString(),
                    isRead: false,
                });

                console.log(`🔔 Gửi thông báo follow đến ${targetUser.fullname}`);
                await fetchFollowers();
                await fetchFollowing();
            } catch (error) {
                console.error("❌ Lỗi khi follow user:", error);
            }
        },
        [CURRENT_USER_ID, fetchFollowing, fetchFollowers]
    );

    // ✅ Unfollow người khác
    const unfollowUser = useCallback(
        async (targetUserId: string) => {
            try {
                const { data: currentUser } = await axios.get<User>(
                    `${API_BASE_URL}/users/${CURRENT_USER_ID}`
                );
                const { data: targetUser } = await axios.get<User>(
                    `${API_BASE_URL}/users/${targetUserId}`
                );

                if (!currentUser.followingIds.includes(targetUserId)) return;

                const updatedCurrentUser = {
                    ...currentUser,
                    followingIds: currentUser.followingIds.filter((id) => id !== targetUserId),
                };
                const updatedTargetUser = {
                    ...targetUser,
                    followerIds: targetUser.followerIds.filter((id) => id !== CURRENT_USER_ID),
                };

                await axios.patch(`${API_BASE_URL}/users/${CURRENT_USER_ID}`, updatedCurrentUser);
                await axios.patch(`${API_BASE_URL}/users/${targetUserId}`, updatedTargetUser);

                await fetchFollowers();
                await fetchFollowing();
            } catch (error) {
                console.error("❌ Lỗi khi bỏ follow user:", error);
            }
        },
        [CURRENT_USER_ID, fetchFollowing, fetchFollowers]
    );

    return {
        followers,
        following,
        loading,
        followUser,
        unfollowUser,
        refreshFollowers: fetchFollowers,
        refreshFollowing: fetchFollowing,
        followerCount: followers.length,
        followingCount: following.length,
    };
};
