import { useState, useCallback } from 'react';
import axios from 'axios';

const API_BASE_URL = 'http://192.168.65.2:3000';
const CURRENT_USER_ID = 'u1';

interface Comment {
    id: string;
    imageId: string;
    userId: string;
    content: string;
    createdAt: string;
    likeCount: number;
    likedBy: string[];
    replyCount: number;
    parentId: string | null;
    user?: any;
    isLiked?: boolean;
    replies?: Comment[];
}

export const useImageComments = (imageId?: string) => {
    const [comments, setComments] = useState<Comment[]>([]);
    const [loading, setLoading] = useState(false);



    const fetchComments = useCallback(async () => {
        if (!imageId) return;
        setLoading(true);
        try {
            const res = await axios.get(`${API_BASE_URL}/comments`);
            const allComments = res.data.filter((c: any) => c.imageId === imageId);

            const userIds = [...new Set(allComments.map((c: any) => c.userId))];
            const users = await Promise.all(
                userIds.map(async (uid) => {
                    try {
                        const u = await axios.get(`${API_BASE_URL}/users/${uid}`);
                        return u.data;
                    } catch {
                        return null;
                    }
                })
            );

            const userMap = new Map();
            users.forEach((u) => u && userMap.set(u.id, u));

            const enrich = (c: any) => ({
                ...c,
                user:
                    userMap.get(c.userId) || {
                        id: c.userId,
                        username: 'Unknown',
                        avatar: 'https://via.placeholder.com/40',
                    },
                isLiked: c.likedBy?.includes(CURRENT_USER_ID) || false,
            });

            const parents = allComments.filter((c: any) => !c.parentId).map(enrich);
            const replies = allComments.filter((c: any) => c.parentId).map(enrich);

            const combined = parents.map((p: Comment) => ({
                ...p,
                replies: replies.filter((r: Comment) => r.parentId === p.id),
            }));

            setComments(combined);
        } catch (err) {
            console.error('Error fetching image comments:', err);
        } finally {
            setLoading(false);
        }
    }, [imageId]);

    const addComment = useCallback(
        async (content: string, parentId: string | null = null) => {
            const newComment = {
                id: `c${Date.now()}`,
                imageId,
                userId: CURRENT_USER_ID,
                content,
                createdAt: new Date().toISOString(),
                likeCount: 0,
                likedBy: [],
                replyCount: 0,
                parentId,
            };
            console.log("them binh luan")

            try {
                await axios.post(`${API_BASE_URL}/comments`, newComment);

                if (parentId) {
                    const parent = await axios.get(`${API_BASE_URL}/comments/${parentId}`);
                    await axios.patch(`${API_BASE_URL}/comments/${parentId}`, {
                        replyCount: (parent.data.replyCount || 0) + 1,
                    });
                }

                const imgRes = await axios.get(`${API_BASE_URL}/images/${imageId}`);
                await axios.patch(`${API_BASE_URL}/images/${imageId}`, {
                    commentCount: (imgRes.data.commentCount || 0) + 1,
                });

                // 📨 Thêm thông báo cho chủ ảnh (nếu khác người bình luận)
                const imageOwnerId = imgRes.data.userId;
                console.log("imageOwnerId" + imageOwnerId)
                if (imageOwnerId && imageOwnerId !== CURRENT_USER_ID) {
                    try {
                        const userRes = await axios.get(`${API_BASE_URL}/users/${CURRENT_USER_ID}`);
                        console.log("Thong tin user " + userRes.data)
                        const currentUser = userRes.data;

                        const newNotification = {
                            id: `n${Date.now()}`,
                            imageId: imageId,
                            userId: imageOwnerId,          // 👈 người NHẬN thông báo
                            senderId: CURRENT_USER_ID,     // 👈 người GỬI (bình luận)
                            type: 'COMMENT',               // 👈 dùng đúng ENUM type
                            message: `${currentUser.fullname || currentUser.username} đã bình luận: "${content}"`, // ✅ thêm nội dung
                            content, // vẫn giữ lại để lưu chi tiết
                            videoId: null,                 // 👈 vì là ảnh, nên không có video
                            isRead: false,
                            createdAt: new Date().toISOString(),
                        };

                        await axios.post(`${API_BASE_URL}/notifications`, newNotification);

                        console.log("✅ Thêm thông báo bình luận ảnh thành công!");
                    } catch (notifyErr) {
                        console.warn(
                            "⚠️ Không thể tạo thông báo comment ảnh:",
                        );
                    }
                }
                await fetchComments();
            } catch (error) {
                console.error('Error adding image comment:', error);
            }
        },
        [imageId, fetchComments]
    );

    const deleteComment = useCallback(
        async (commentId: string, parentId: string | null = null) => {
            try {
                await axios.delete(`${API_BASE_URL}/comments/${commentId}`);

                if (parentId) {
                    const parent = await axios.get(`${API_BASE_URL}/comments/${parentId}`);
                    await axios.patch(`${API_BASE_URL}/comments/${parentId}`, {
                        replyCount: Math.max(0, (parent.data.replyCount || 0) - 1),
                    });
                }

                const imgRes = await axios.get(`${API_BASE_URL}/images/${imageId}`);
                await axios.patch(`${API_BASE_URL}/images/${imageId}`, {
                    commentCount: Math.max(0, (imgRes.data.commentCount || 0) - 1),
                });

                await fetchComments();
            } catch (error) {
                console.error('Error deleting image comment:', error);
            }
        },
        [imageId, fetchComments]
    );

    const likeComment = useCallback(async (commentId: string) => {
        try {
            const res = await axios.get(`${API_BASE_URL}/comments/${commentId}`);
            const comment = res.data;

            const isLiked = comment.likedBy?.includes(CURRENT_USER_ID) || false;
            const updatedLikedBy = isLiked
                ? comment.likedBy.filter((id: string) => id !== CURRENT_USER_ID)
                : [...(comment.likedBy || []), CURRENT_USER_ID];
            const updatedLikeCount = isLiked ? comment.likeCount - 1 : comment.likeCount + 1;

            await axios.patch(`${API_BASE_URL}/comments/${commentId}`, {
                likedBy: updatedLikedBy,
                likeCount: updatedLikeCount,
            });

            setComments((prev) =>
                prev.map((c) => {
                    if (c.id === commentId)
                        return { ...c, isLiked: !isLiked, likeCount: updatedLikeCount };
                    if (c.replies)
                        return {
                            ...c,
                            replies: c.replies.map((r) =>
                                r.id === commentId
                                    ? { ...r, isLiked: !isLiked, likeCount: updatedLikeCount }
                                    : r
                            ),
                        };
                    return c;
                })
            );
        } catch (err) {
            console.error('Error liking image comment:', err);
        }
    }, []);

    // ✅ Tổng số comment (bao gồm reply)
    const countCommentsByImage = useCallback(async (imageId: string) => {
        try {
            const res = await axios.get(`${API_BASE_URL}/comments`);
            const allComments = res.data.filter((c: any) => c.imageId === imageId);
            return allComments.length;
        } catch (err) {
            console.error('Error counting comments by image:', err);
            return 0;
        }
    }, []);

    return {
        comments,
        loading,
        fetchComments,
        addComment,
        deleteComment,
        likeComment,
        countCommentsByImage,
    };
};
