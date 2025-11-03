import { useState, useEffect } from "react";
import axios from "axios";
import { User } from "../types/database.types";

const API_BASE_URL = "http://192.168.1.166:3000";
const CURRENT_USER_ID = "u1"; // user hiện tại

export const useUser = (userId?: string) => {
    const [currentUser, setCurrentUser] = useState<User | null>(null);
    const [targetUser, setTargetUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);


    const [isFollowing, setIsFollowing] = useState(false);
    const [isFollowedByOther, setIsFollowedByOther] = useState(false);
    const [isFriend, setIsFriend] = useState(false);

    // lấy thông tin người dùng hiện tại + người đang xem
    useEffect(() => {
        const fetchData = async () => {
            try {
                const [currentRes, targetRes] = await Promise.all([
                    axios.get(`${API_BASE_URL}/users/${CURRENT_USER_ID}`),
                    userId ? axios.get(`${API_BASE_URL}/users/${userId}`) : Promise.resolve({ data: null }),
                ]);

                const current = currentRes.data;
                const target = targetRes.data;

                setCurrentUser(current);
                if (userId) setTargetUser(target);

                if (userId) {
                    const following = current.followingIds?.includes(userId);
                    const followedBy = target.followingIds?.includes(CURRENT_USER_ID);

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
            const res = await axios.patch(`${API_BASE_URL}/users/${CURRENT_USER_ID}`, updatedData);
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
            const res = await axios.get(`${API_BASE_URL}/users/${CURRENT_USER_ID}`);
            setCurrentUser(res.data);
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
            
            await axios.patch(`${API_BASE_URL}/users/${CURRENT_USER_ID}`, {
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
            
            await axios.patch(`${API_BASE_URL}/users/${CURRENT_USER_ID}`, {
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
            const allUsersRes = await axios.get(`${API_BASE_URL}/users`);
            const allUsers = allUsersRes.data;
            
            // Lọc những user có CURRENT_USER_ID trong followingIds
            const followers = allUsers.filter((user: User) =>
                user.followingIds?.includes(CURRENT_USER_ID) && user.id !== CURRENT_USER_ID
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
            const allUsersRes = await axios.get(`${API_BASE_URL}/users`);
            const allUsers = allUsersRes.data;
            const followingIds = currentUser?.followingIds || [];
            
            // Lọc những user chưa follow và không phải chính mình
            const suggestions = allUsers.filter((user: User) =>
                user.id !== CURRENT_USER_ID && !followingIds.includes(user.id)
            );
            
            // Random shuffle
            const shuffled = suggestions.sort(() => 0.5 - Math.random());
            return shuffled.slice(0, 20);
        } catch (err) {
            console.error("Error fetching suggestions:", err);
            return [];
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
        // ✅ Thêm các functions mới
        followUser,
        unfollowUser,
        toggleFollow,
        fetchFollowingList,
        fetchFollowersList,
        fetchSuggestions,
    };
};