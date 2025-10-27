import { useState, useEffect } from "react";
import axios from "axios";
import { User } from "../types/database.types";

const API_BASE_URL = "http://localhost:3000";
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

    return {
        loading,
        currentUser,
        targetUser,
        isFollowing,
        isFollowedByOther,
        isFriend,
    };
};
