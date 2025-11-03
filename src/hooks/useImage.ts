import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { Image } from '../types/database.types';

const API_BASE_URL = 'http://192.168.1.166:3000'; // ⚠️ nhớ kiểm tra IP này
export const CURRENT_USER_ID = 'u1';

export const useImage = () => {
    const [publicImages, setPublicImages] = useState<Image[]>([]);
    const [privateImages, setPrivateImages] = useState<Image[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const fetchImages = useCallback(async () => {
        console.log("🚀 Gọi API lấy danh sách ảnh...");
        setLoading(true);
        try {
            const res = await axios.get(`${API_BASE_URL}/images`);
            console.log("✅ Kết quả API:", res.data);

            const data = res.data;

            if (Array.isArray(data)) {
                const publicList = data.filter((img) => img.isPublic === true);
                const privateList = data.filter((img) => img.isPublic === false);

                console.log(`📸 Public: ${publicList.length} ảnh`);
                console.log(`🔒 Private: ${privateList.length} ảnh`);

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
            console.log("✅ Hoàn tất tải ảnh.\n");
        }
    }, []);

    useEffect(() => {
        fetchImages();
    }, [fetchImages]);
    const getImageLikes = async (imageId: string): Promise<number> => {
        try {
            console.log("🔍 Gọi API lấy lượt like:", `${API_BASE_URL}/images/${imageId}`);
            const response = await fetch(`${API_BASE_URL}/images/${imageId}`);

            if (!response.ok) {
                console.error("❌ Lỗi response:", response.status);
                return 0;
            }

            const image = await response.json();
            console.log("✅ Dữ liệu ảnh:", image);

            // 🔥 Nếu có likedBy là mảng, trả về độ dài
            if (Array.isArray(image.likedBy)) {
                return image.likedBy.length;
            }

            // Nếu có trường likes (phòng khi cũ vẫn còn)
            if (typeof image.likes === "number") {
                return image.likes;
            }

            console.warn("⚠️ Không có likedBy hoặc likes trong image:", image);
            return 0;
        } catch (error) {
            console.error("🔥 Lỗi khi lấy lượt like:", error);
            return 0;
        }
    };

    const toggleLike = async (imageId: string, userId: string) => {
        try {
            const res = await axios.get(`${API_BASE_URL}/images/${imageId}`);
            const image = res.data;

            let updatedLikedBy = image.likedBy || [];
            if (updatedLikedBy.includes(userId)) {
                updatedLikedBy = updatedLikedBy.filter((id: string) => id !== userId);
            } else {
                updatedLikedBy.push(userId);
            }

            await axios.patch(`${API_BASE_URL}/images/${imageId}`, {
                likedBy: updatedLikedBy,
                likes: updatedLikedBy.length,
            });

            return updatedLikedBy.length; // trả về số lượt like mới
        } catch (err) {
            console.error("🔥 Lỗi cập nhật like:", err);
            return null;
        }
    };

    return {
        publicImages,
        privateImages,
        loading,
        error,
        refresh: fetchImages,
        getImageLikes,
        toggleLike // ✅ thêm dòng này
    };
};
