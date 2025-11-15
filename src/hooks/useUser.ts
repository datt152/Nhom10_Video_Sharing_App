import { useState, useEffect, useCallback } from "react";
import axios from "axios";
import { User } from "../types/database.types";

import { API_BASE_URL, getCurrentUserId } from '../types/config'


export const useUser = (userId?: string) => {
    const [currentUser, setCurrentUser] = useState<User | null>(null);
    const [targetUser, setTargetUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);
    const [followerCount, setFollowerCount] = useState(0);
    const [followingCount, setFollowingCount] = useState(0);

    const [isFollowing, setIsFollowing] = useState(false);
    const [isFollowedByOther, setIsFollowedByOther] = useState(false);
    const [isFriend, setIsFriend] = useState(false);

    // lấy thông tin người dùng hiện tại + người đang xem
    useEffect(() => {
        const fetchData = async () => {
            try {
                const currentUserId = await getCurrentUserId();
                
                // ✅ Nếu chưa login thì không fetch
                if (!currentUserId) {
                    setLoading(false);
                    return;
                }
                
                const [currentRes, targetRes] = await Promise.all([
                    axios.get(`${API_BASE_URL}/users/${currentUserId}`),
                    userId ? axios.get(`${API_BASE_URL}/users/${userId}`) : Promise.resolve({ data: null }),
                ]);

                // ✅ Chuẩn hóa dữ liệu để không bị undefined
                const current = {
                    ...currentRes.data,
                    followerIds: currentRes.data.followerIds || [],
                    followingIds: currentRes.data.followingIds || [],
                };

                const target = targetRes.data
                    ? {
                        ...targetRes.data,
                        followerIds: targetRes.data.followerIds || [],
                        followingIds: targetRes.data.followingIds || [],
                    }
                    : null;

                setCurrentUser(current);
                if (userId && target) setTargetUser(target);

                if (userId) {
                    const following = current.followingIds?.includes(userId);
                    const followedBy = target.followingIds?.includes(currentUserId);

                    setIsFollowing(following);
                    setIsFollowedByOther(followedBy);
                    setIsFriend(following && followedBy);
                }
            } catch (err) {
                console.error("Error fetching user:", err);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [userId]);

    // --- 🟢 Hàm chỉnh sửa thông tin user ---
    const updateUser = async (updatedData: Partial<User>) => {
        try {
            const currentUserId = await getCurrentUserId();
            if (!currentUserId) return false;
            const res = await axios.patch(`${API_BASE_URL}/users/${currentUserId}`, updatedData);
            setCurrentUser(res.data); // cập nhật lại state
            return true;
        } catch (err) {
            console.error("Error updating user:", err);
            return false;
        }
    };

    // ---  Hàm load lại thông tin user (dùng khi quay lại màn hình Profile)
    const loadUser = async () => {
        try {
            const currentUserId = await getCurrentUserId();
            if (!currentUserId) return;
            const res = await axios.get(`${API_BASE_URL}/users/${currentUserId}`);
            const user = res.data;
            setCurrentUser({
                ...user,
                followerIds: user.followerIds || [],
                followingIds: user.followingIds || [],
            });
        } catch (err) {
            console.error("Error reloading user:", err);
        }
    };
    const followUser = async (targetUserId: string) => {
        try {
            const currentFollowingIds = currentUser?.followingIds || [];

            // Kiểm tra đã follow chưa
            if (currentFollowingIds.includes(targetUserId)) {
                return false;
            }

            const updatedFollowingIds = [...currentFollowingIds, targetUserId];

            const currentUserId = await getCurrentUserId();
            if (!currentUserId) return false;
            await axios.patch(`${API_BASE_URL}/users/${currentUserId}`, {
                followingIds: updatedFollowingIds,
            });

            // Cập nhật follower count của target user
            const targetRes = await axios.get(`${API_BASE_URL}/users/${targetUserId}`);
            await axios.patch(`${API_BASE_URL}/users/${targetUserId}`, {
                followerCount: (targetRes.data.followerCount || 0) + 1,
            });

            // Reload current user
            await loadUser();
            return true;
        } catch (err) {
            console.error("Error following user:", err);
            return false;
        }
    };

    // --- ✅ Unfollow user ---
    const unfollowUser = async (targetUserId: string) => {
        try {
            const currentFollowingIds = currentUser?.followingIds || [];

            // Kiểm tra có đang follow không
            if (!currentFollowingIds.includes(targetUserId)) {
                return false;
            }

            const updatedFollowingIds = currentFollowingIds.filter(id => id !== targetUserId);

            const currentUserId = await getCurrentUserId();
            if (!currentUserId) return false;
            await axios.patch(`${API_BASE_URL}/users/${currentUserId}`, {
                followingIds: updatedFollowingIds,
            });

            // Giảm follower count của target user
            const targetRes = await axios.get(`${API_BASE_URL}/users/${targetUserId}`);
            await axios.patch(`${API_BASE_URL}/users/${targetUserId}`, {
                followerCount: Math.max(0, (targetRes.data.followerCount || 0) - 1),
            });

            // Reload current user
            await loadUser();
            return true;
        } catch (err) {
            console.error("Error unfollowing user:", err);
            return false;
        }
    };

    // --- ✅ Toggle Follow/Unfollow ---
    const toggleFollow = async (targetUserId: string) => {
        const currentFollowingIds = currentUser?.followingIds || [];
        const isCurrentlyFollowing = currentFollowingIds.includes(targetUserId);

        if (isCurrentlyFollowing) {
            return await unfollowUser(targetUserId);
        } else {
            return await followUser(targetUserId);
        }
    };

    // --- ✅ Fetch Following List ---
    const fetchFollowingList = async () => {
        try {
            const followingIds = currentUser?.followingIds || [];

            if (followingIds.length === 0) {
                return [];
            }

            const usersPromises = followingIds.map(id =>
                axios.get(`${API_BASE_URL}/users/${id}`)
            );
            const usersResponses = await Promise.all(usersPromises);
            return usersResponses.map(res => res.data);
        } catch (err) {
            console.error("Error fetching following list:", err);
            return [];
        }
    };

    // --- ✅ Fetch Followers List ---
    const fetchFollowersList = async () => {
        try {
            const currentUserId = await getCurrentUserId();
            if (!currentUserId) return [];
            const allUsersRes = await axios.get(`${API_BASE_URL}/users`);
            const allUsers = allUsersRes.data;

            // Lọc những user có getCurrentUserId() trong followingIds
            const followers = allUsers.filter((user: User) =>
                user.followingIds?.includes(currentUserId || "") && user.id !== currentUserId
            );

            return followers;
        } catch (err) {
            console.error("Error fetching followers list:", err);
            return [];
        }
    };

    // --- ✅ Fetch Suggestions (người chưa follow) ---
    const fetchSuggestions = async () => {
        try {
            const currentUserId = await getCurrentUserId();
            if (!currentUserId) return [];
            const allUsersRes = await axios.get(`${API_BASE_URL}/users`);
            const allUsers = allUsersRes.data;
            const followingIds = currentUser?.followingIds || [];

            // Lọc những user chưa follow và không phải chính mình
            const suggestions = allUsers.filter((user: User) =>
                user.id !== currentUserId && !followingIds.includes(user.id)
            );

            // Random shuffle
            const shuffled = suggestions.sort(() => 0.5 - Math.random());
            return shuffled.slice(0, 20);
        } catch (err) {
            console.error("Error fetching suggestions:", err);
            return [];
        }
    };
    const unfriendUser = async (targetUserId: string) => {
        try {
            const currentUserId = await getCurrentUserId();
            if (!currentUserId) return false;
            const currentFollowingIds = currentUser?.followingIds || [];
            const targetRes = await axios.get(`${API_BASE_URL}/users/${targetUserId}`);
            const targetFollowingIds = targetRes.data.followingIds || [];

            // Xóa nhau khỏi danh sách following
            const updatedCurrentFollowing = currentFollowingIds.filter((id: String) => id !== targetUserId);
            const updatedTargetFollowing = targetFollowingIds.filter((id: String) => id !== currentUserId);

            await axios.patch(`${API_BASE_URL}/users/${currentUserId}`, {
                followingIds: updatedCurrentFollowing,
            });

            await axios.patch(`${API_BASE_URL}/users/${targetUserId}`, {
                followingIds: updatedTargetFollowing,
            });

            await loadUser();
            await loadTargetUser(targetUserId);
            return true;
        } catch (err) {
            console.error("Error unfriending user:", err);
            return false;
        }
    };

    // --- ✅ Load lại thông tin user mục tiêu ---
    const loadTargetUser = async (targetUserId: string) => {
        try {
            const res = await axios.get(`${API_BASE_URL}/users/${targetUserId}`);
            setTargetUser(res.data);
        } catch (err) {
            console.error("Error loading target user:", err);
        }
    };
    const refreshFollowers = useCallback(async () => {
        if (!currentUser) return;
        setLoading(true);
        try {
            const followerIds = Array.isArray(currentUser.followerIds) ? currentUser.followerIds : [];
            setFollowerCount(followerIds.length);
        } catch (err) {
            console.error('❌ refreshFollowers error:', err);
        } finally {
            setLoading(false);
        }
    }, [currentUser]);

    const refreshFollowing = useCallback(async () => {
        if (!currentUser) return;
        setLoading(true);
        try {
            const followingIds = Array.isArray(currentUser.followingIds) ? currentUser.followingIds : [];
            setFollowingCount(followingIds.length);
        } catch (err) {
            console.error('❌ refreshFollowing error:', err);
        } finally {
            setLoading(false);
        }
    }, [currentUser]);
    // 🧩 Hàm lấy thông tin user theo ID
    const getUserById = async (userId: string) => {
        try {
            if (!userId) return null;
            const res = await axios.get(`${API_BASE_URL}/users/${userId}`);
            return res.data;
        } catch (error) {
            console.error("❌ Lỗi khi lấy user:", error);
            return null;
        }
    };
    return {
        loading,
        currentUser,
        targetUser,
        isFollowing,
        isFollowedByOther,
        isFriend,
        updateUser,
        loadUser,
        unfriendUser,
        loadTargetUser,
        followUser,
        unfollowUser,
        toggleFollow,
        fetchFollowingList,
        fetchFollowersList,
        fetchSuggestions,
        refreshFollowers,
        refreshFollowing,
        getUserById
    };
};