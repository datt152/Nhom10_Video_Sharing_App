import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { Image } from '../types/database.types';

const API_BASE_URL = 'http://192.168.65.2:3000'; // ⚠️ nhớ kiểm tra IP này
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

    return {
        publicImages,
        privateImages,
        loading,
        error,
        refresh: fetchImages,
    };
};
