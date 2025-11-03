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

export const useImageComments = (imageId: string) => {
    const [comments, setComments] = useState<Comment[]>([]);
    const [loading, setLoading] = useState(false);

    const fetchComments = useCallback(async () => {
        if (!imageId) return;
        setLoading(true);
        try {
            // ✅ chỉ lấy comment của ảnh hiện tại
            const res = await axios.get(`${API_BASE_URL}/comments`);
            const allComments = res.data.filter((c: any) => c.imageId === imageId);

            // lấy danh sách user
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

            try {
                await axios.post(`${API_BASE_URL}/comments`, newComment);

                // nếu là reply thì tăng replyCount cho cha
                if (parentId) {
                    const parent = await axios.get(`${API_BASE_URL}/comments/${parentId}`);
                    await axios.patch(`${API_BASE_URL}/comments/${parentId}`, {
                        replyCount: (parent.data.replyCount || 0) + 1,
                    });
                }

                // tăng commentCount trong ảnh
                const imgRes = await axios.get(`${API_BASE_URL}/images/${imageId}`);
                await axios.patch(`${API_BASE_URL}/images/${imageId}`, {
                    commentCount: (imgRes.data.commentCount || 0) + 1,
                });

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

    return { comments, loading, fetchComments, addComment, deleteComment, likeComment };
};
