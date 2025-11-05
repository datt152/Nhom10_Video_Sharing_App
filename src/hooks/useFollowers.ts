import { useState, useCallback, useEffect } from "react";
import axios from "axios";
import { User } from "../types/database.types";

import {API_BASE_URL, CURRENT_USER_ID} from '../types/database.types'


export const useFollower = (userId?: string) => {
    const CURRENT_USER_ID = userId || "u1";
    const [followers, setFollowers] = useState<User[]>([]);
    const [following, setFollowing] = useState<User[]>([]);
    const [loading, setLoading] = useState(false);

    // 🧭 Lấy danh sách người mình đang follow
    const fetchFollowing = useCallback(async () => {
        setLoading(true);
        try {
            const { data: currentUser } = await axios.get<User>(
                `${API_BASE_URL}/users/${CURRENT_USER_ID}`
            );

            if (Array.isArray(currentUser.followingIds) && currentUser.followingIds.length > 0) {
                const { data: allUsers } = await axios.get<User[]>(`${API_BASE_URL}/users`);
                const list = allUsers.filter((u) => currentUser.followingIds.includes(u.id));
                setFollowing(list);
                return list; // ✅ trả về để FollowPage cập nhật realtime
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
    }, [CURRENT_USER_ID]);

    // 🧭 Lấy danh sách người đang follow mình
    const fetchFollowers = useCallback(async () => {
        setLoading(true);
        try {
            const { data: currentUser } = await axios.get<User>(
                `${API_BASE_URL}/users/${CURRENT_USER_ID}`
            );

            if (Array.isArray(currentUser.followerIds) && currentUser.followerIds.length > 0) {
                const { data: allUsers } = await axios.get<User[]>(`${API_BASE_URL}/users`);
                const list = allUsers.filter((u) => currentUser.followerIds.includes(u.id));
                setFollowers(list);
                return list; // ✅ trả về
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
    }, [CURRENT_USER_ID]);

    // 🔁 Load ban đầu
    useEffect(() => {
        fetchFollowers();
        fetchFollowing();
    }, [fetchFollowers, fetchFollowing]);

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

                await fetchFollowers();
                await fetchFollowing();
            } catch (error) {
                console.error("❌ Lỗi khi follow user:", error);
            }
        },
        [CURRENT_USER_ID, fetchFollowing, fetchFollowers]
    );

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
