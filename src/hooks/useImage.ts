
import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { Image } from '../types/database.types';

const API_BASE_URL = 'http://192.168.1.186:3000'; // ⚠️ nhớ đổi IP cho đúng
export const CURRENT_USER_ID = 'u1';

export const useImage = () => {
    const [publicImages, setPublicImages] = useState<Image[]>([]);
    const [privateImages, setPrivateImages] = useState<Image[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // 🧩 Lấy danh sách ảnh
    const fetchImages = useCallback(async () => {
        console.log("🚀 Gọi API lấy danh sách ảnh...");
        setLoading(true);
        try {
            const res = await axios.get(`${API_BASE_URL}/images`);
            const data = res.data;

            if (Array.isArray(data)) {
                // 🧩 Lọc ảnh thuộc về user hiện tại
                const userImages = data.filter(img => img.userId === CURRENT_USER_ID);

                // 🧩 Phân chia công khai / riêng tư
                const publicList = userImages.filter((img) => img.isPublic === true);
                const privateList = userImages.filter((img) => img.isPublic === false);

                setPublicImages(publicList);
                setPrivateImages(privateList);
            } else {
                console.error("❌ Dữ liệu trả về không phải là mảng:", data);
                setPublicImages([]);
                setPrivateImages([]);
            }
        } catch (err: any) {
            console.error("🔥 Lỗi khi fetch images:", err);
            setError(err.message || 'Error fetching images');
        } finally {
            setLoading(false);
        }
    }, []);
    useEffect(() => {
        fetchImages();
    }, [fetchImages]);

    // 🧩 Lấy số lượt like của ảnh
    const getImageLikes = async (imageId: string): Promise<number> => {
        try {
            const res = await axios.get(`${API_BASE_URL}/images/${imageId}`);
            const image = res.data;
            if (Array.isArray(image.likedBy)) {
                return image.likedBy.length;
            }
            if (typeof image.likes === "number") {
                return image.likes;
            }
            return 0;
        } catch (error) {
            console.error("🔥 Lỗi khi lấy lượt like:", error);
            return 0;
        }
    };

    // ❤️ LIKE IMAGE
    const likeImage = async (imageId: string) => {
        try {
            const res = await axios.get(`${API_BASE_URL}/images/${imageId}`);
            const image = res.data;

            const updatedLikedBy = [
                ...(image.likedBy || []),
                CURRENT_USER_ID,
            ];

            await axios.patch(`${API_BASE_URL}/images/${imageId}`, {
                likedBy: updatedLikedBy,
                likes: updatedLikedBy.length,
                isLiked: true, // 👈 Thêm dòng này để set về true luôn
            });

            console.log(`❤️ Đã like ảnh ${imageId}`);
            return updatedLikedBy.length;
        } catch (error) {
            console.error("🔥 Lỗi khi like ảnh:", error);
            return null;
        }
    };

    // 💔 UNLIKE IMAGE
    const unlikeImage = async (imageId: string) => {
        try {
            const res = await axios.get(`${API_BASE_URL}/images/${imageId}`);
            const image = res.data;

            // Lọc bỏ user hiện tại khỏi danh sách like
            const updatedLikedBy = (image.likedBy || []).filter(
                (id: string) => id !== CURRENT_USER_ID
            );

            // Cập nhật DB: bỏ tym + set isLiked = false
            await axios.patch(`${API_BASE_URL}/images/${imageId}`, {
                likedBy: updatedLikedBy,
                likes: updatedLikedBy.length,
                isLiked: false, // 👈 Thêm dòng này để set về false luôn
            });

            console.log(`💔 Bỏ like ảnh ${imageId}`);
            return updatedLikedBy.length;
        } catch (error) {
            console.error("🔥 Lỗi khi bỏ like ảnh:", error);
            return null;
        }
    };
    const toggleImagePrivacy = async (imageId: string, isPublic: boolean) => {
        try {
            const res = await fetch(`http://localhost:3000/images/${imageId}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ isPublic: !isPublic }),
            });
            const updated = await res.json();
            return updated.isPublic;
        } catch (error) {
            console.error("❌ Lỗi khi đổi trạng thái ảnh:", error);
            throw error;
        }
    };

    return {
        publicImages,
        privateImages,
        loading,
        error,
        refresh: fetchImages,
        getImageLikes,
        likeImage,   // ✅ sửa lại chuẩn
        unlikeImage,
        toggleImagePrivacy // ✅ thêm đầy đủ
    };
};
