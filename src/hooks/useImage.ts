import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { Image } from '../types/database.types';

const API_BASE_URL = 'http://192.168.65.2:3000'; // ⚠️ nhớ đổi IP cho đúng
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
                const publicList = data.filter((img) => img.isPublic === true);
                const privateList = data.filter((img) => img.isPublic === false);

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

            let updatedLikedBy = image.likedBy || [];
            if (!updatedLikedBy.includes(CURRENT_USER_ID)) {
                updatedLikedBy.push(CURRENT_USER_ID);
            }

            await axios.patch(`${API_BASE_URL}/images/${imageId}`, {
                likedBy: updatedLikedBy,
                likes: updatedLikedBy.length,
            });

            console.log(`❤️ Like ảnh ${imageId}`);
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

            let updatedLikedBy = (image.likedBy || []).filter(
                (id: string) => id !== CURRENT_USER_ID
            );

            await axios.patch(`${API_BASE_URL}/images/${imageId}`, {
                likedBy: updatedLikedBy,
                likes: updatedLikedBy.length,
            });

            console.log(`💔 Bỏ like ảnh ${imageId}`);
            return updatedLikedBy.length;
        } catch (error) {
            console.error("🔥 Lỗi khi bỏ like ảnh:", error);
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
        likeImage,   // ✅ sửa lại chuẩn
        unlikeImage, // ✅ thêm đầy đủ
    };
};
