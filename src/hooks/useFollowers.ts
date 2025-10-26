import { useState, useCallback, useEffect } from "react";
import axios from "axios";
import { User } from "../types/database.types";

const API_BASE_URL = "http://localhost:3000";
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

    // 🔁 Tự động load ban đầu
    useEffect(() => {
        fetchFollowers();
        fetchFollowing();
    }, [fetchFollowers, fetchFollowing]);

    return {
        followers,
        following,
        loading,
        refreshFollowers: fetchFollowers,
        refreshFollowing: fetchFollowing,
    };
};
