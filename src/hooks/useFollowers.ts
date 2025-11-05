import { useState, useCallback, useEffect } from "react";
import axios from "axios";
import { User } from "../types/database.types";

const API_BASE_URL = "http://192.168.1.186:3000";
const CURRENT_USER_ID = "u1"; // user hiện tại

export const useFollower = () => {
    const [followers, setFollowers] = useState<User[]>([]); // danh sách người theo dõi mình
    const [following, setFollowing] = useState<User[]>([]); // danh sách mình đang theo dõi
    const [loading, setLoading] = useState(false);

    // 🧭 Lấy danh sách người mình đang follow
    const fetchFollowing = useCallback(async () => {
        setLoading(true);
        try {
            const { data: currentUser } = await axios.get<User>(
                `${API_BASE_URL}/users/${CURRENT_USER_ID}`
            );

            if (currentUser.followingIds?.length) {
                const { data: users } = await axios.get<User[]>(`${API_BASE_URL}/users`);
                const list = users.filter((u) => currentUser.followingIds?.includes(u.id));
                setFollowing(list);
            } else {
                setFollowing([]);
            }
        } catch (error) {
            console.error("❌ Lỗi khi lấy danh sách following:", error);
        } finally {
            setLoading(false);
        }
    }, []);

    // 🧭 Lấy danh sách người đang follow mình
    const fetchFollowers = useCallback(async () => {
        setLoading(true);
        try {
            const { data: users } = await axios.get<User[]>(`${API_BASE_URL}/users`);
            const list = users.filter((u) => u.followingIds?.includes(CURRENT_USER_ID));
            setFollowers(list);
        } catch (error) {
            console.error("❌ Lỗi khi lấy danh sách followers:", error);
        } finally {
            setLoading(false);
        }
    }, []);

    //  Hàm follow user
    const followUser = useCallback(
        async (targetUserId: string) => {
            try {
                // Lấy user hiện tại & user mục tiêu
                const { data: currentUser } = await axios.get<User>(
                    `${API_BASE_URL}/users/${CURRENT_USER_ID}`
                );
                const { data: targetUser } = await axios.get<User>(
                    `${API_BASE_URL}/users/${targetUserId}`
                );

                // Nếu đã follow rồi thì bỏ qua
                if (currentUser.followingIds.includes(targetUserId)) return;

                // Cập nhật mảng mới
                const updatedCurrentUser = {
                    ...currentUser,
                    followingIds: [...currentUser.followingIds, targetUserId],
                };
                const updatedTargetUser = {
                    ...targetUser,
                    followerIds: [...targetUser.followerIds, CURRENT_USER_ID],
                };

                // Gửi PATCH cập nhật
                await axios.patch(`${API_BASE_URL}/users/${CURRENT_USER_ID}`, updatedCurrentUser);
                await axios.patch(`${API_BASE_URL}/users/${targetUserId}`, updatedTargetUser);

                // Làm mới dữ liệu
                await fetchFollowing();
                await fetchFollowers();
            } catch (error) {
                console.error("❌ Lỗi khi follow user:", error);
            }
        },
        [fetchFollowing, fetchFollowers]
    );

    // ✅ Hàm unfollow user
    const unfollowUser = useCallback(
        async (targetUserId: string) => {
            try {
                // Lấy user hiện tại & user mục tiêu
                const { data: currentUser } = await axios.get<User>(
                    `${API_BASE_URL}/users/${CURRENT_USER_ID}`
                );
                const { data: targetUser } = await axios.get<User>(
                    `${API_BASE_URL}/users/${targetUserId}`
                );

                // Nếu chưa follow thì bỏ qua
                if (!currentUser.followingIds.includes(targetUserId)) return;

                // Cập nhật lại mảng
                const updatedCurrentUser = {
                    ...currentUser,
                    followingIds: currentUser.followingIds.filter((id) => id !== targetUserId),
                };
                const updatedTargetUser = {
                    ...targetUser,
                    followerIds: targetUser.followerIds.filter((id) => id !== CURRENT_USER_ID),
                };

                // Gửi PATCH cập nhật
                await axios.patch(`${API_BASE_URL}/users/${CURRENT_USER_ID}`, updatedCurrentUser);
                await axios.patch(`${API_BASE_URL}/users/${targetUserId}`, updatedTargetUser);

                // Làm mới danh sách
                await fetchFollowing();
                await fetchFollowers();
            } catch (error) {
                console.error("❌ Lỗi khi bỏ follow user:", error);
            }
        },
        [fetchFollowing, fetchFollowers]
    );

    // 🔁 Load ban đầu
    useEffect(() => {
        fetchFollowers();
        fetchFollowing();
    }, [fetchFollowers, fetchFollowing]);

    const followerCount = followers.length;
    const followingCount = following.length;

    return {
        followers,
        following,
        loading,
        refreshFollowers: fetchFollowers,
        refreshFollowing: fetchFollowing,
        followUser,
        unfollowUser,
        followerCount,     // ✅ đổi từ hàm sang giá trị
        followingCount,    // ✅ đổi từ hàm sang giá trị
    };
};
