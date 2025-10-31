import { useState, useCallback } from 'react';
import axios from 'axios';

const API_BASE_URL = 'http://192.168.65.2:3000';
const CURRENT_USER_ID = 'u1';

interface Comment {
  id: string;
  videoId: string;
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

export const useComments = (videoId: string) => {
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchComments = useCallback(async () => {
    setLoading(true);
    try {
      console.log('🔄 Fetching comments for video:', videoId);
      
      // 1️⃣ Fetch tất cả comments
      const commentsRes = await axios.get(`${API_BASE_URL}/comments?videoId=${videoId}`);
      const allComments = commentsRes.data;
      
      console.log('📋 Raw comments:', allComments);

      // 2️⃣ Lấy danh sách unique userIds
      const userIds = [...new Set(allComments.map((c: any) => c.userId))];
      console.log('👥 Unique user IDs:', userIds);

      // 3️⃣ Fetch tất cả users cùng lúc
      const usersPromises = userIds.map(userId => 
        axios.get(`${API_BASE_URL}/users/${userId}`)
          .then(res => res.data)
          .catch(err => {
            console.error(`❌ Failed to fetch user ${userId}:`, err);
            return null;
          })
      );

      const usersData = await Promise.all(usersPromises);
      console.log('✅ Fetched users:', usersData);

      // 4️⃣ Tạo user map
      const userMap = new Map();
      usersData.forEach(user => {
        if (user) {
          userMap.set(user.id, user);
        }
      });

      console.log('🗺️ User Map:', Object.fromEntries(userMap));

      // 5️⃣ Enrich comments với user data
      const enrichComment = (comment: any) => {
        const user = userMap.get(comment.userId);
        console.log(`💬 Enriching comment ${comment.id}:`, {
          userId: comment.userId,
          foundUser: user?.username,
          avatar: user?.avatar,
        });

        return {
          ...comment,
          user: user || {
            id: comment.userId,
            username: 'Unknown',
            avatar: 'https://via.placeholder.com/40',
          },
          isLiked: comment.likedBy?.includes(CURRENT_USER_ID) || false,
        };
      };

      // 6️⃣ Phân loại parent và reply comments
      const parentComments = allComments
        .filter((c: any) => !c.parentId)
        .map(enrichComment);

      const replyComments = allComments
        .filter((c: any) => c.parentId)
        .map(enrichComment);

      // 7️⃣ Gắn replies vào parent
      const commentsWithReplies = parentComments.map((parent: any) => ({
        ...parent,
        replies: replyComments.filter((r: any) => r.parentId === parent.id),
      }));

      console.log('✅ Final comments with users:', commentsWithReplies);
      setComments(commentsWithReplies);
    } catch (error) {
      console.error('❌ Error fetching comments:', error);
    } finally {
      setLoading(false);
    }
  }, [videoId]);

  const addComment = useCallback(
    async (content: string, parentId: string | null = null) => {
      const newComment = {
        id: `c${Date.now()}`,
        videoId,
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

        if (parentId) {
          const parentComment = await axios.get(`${API_BASE_URL}/comments/${parentId}`);
          await axios.patch(`${API_BASE_URL}/comments/${parentId}`, {
            replyCount: (parentComment.data.replyCount || 0) + 1,
          });
        }

        const videoRes = await axios.get(`${API_BASE_URL}/videos/${videoId}`);
        await axios.patch(`${API_BASE_URL}/videos/${videoId}`, {
          commentCount: (videoRes.data.commentCount || 0) + 1,
        });

        await fetchComments(); // Re-fetch để có user data
      } catch (error) {
        console.error('Error adding comment:', error);
      }
    },
    [videoId, fetchComments]
  );

  const deleteComment = useCallback(
    async (commentId: string, parentId: string | null = null) => {
      try {
        await axios.delete(`${API_BASE_URL}/comments/${commentId}`);

        if (parentId) {
          const parentComment = await axios.get(`${API_BASE_URL}/comments/${parentId}`);
          await axios.patch(`${API_BASE_URL}/comments/${parentId}`, {
            replyCount: Math.max(0, (parentComment.data.replyCount || 0) - 1),
          });
        }

        const videoRes = await axios.get(`${API_BASE_URL}/videos/${videoId}`);
        await axios.patch(`${API_BASE_URL}/videos/${videoId}`, {
          commentCount: Math.max(0, (videoRes.data.commentCount || 0) - 1),
        });

        await fetchComments();
        return true;
      } catch (error) {
        console.error('Error deleting comment:', error);
        return false;
      }
    },
    [videoId, fetchComments]
  );

  const likeComment = useCallback(async (commentId: string) => {
    try {
      const commentRes = await axios.get(`${API_BASE_URL}/comments/${commentId}`);
      const comment = commentRes.data;

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
          if (c.id === commentId) {
            return { ...c, isLiked: !isLiked, likeCount: updatedLikeCount };
          }
          if (c.replies) {
            return {
              ...c,
              replies: c.replies.map((r) =>
                r.id === commentId
                  ? { ...r, isLiked: !isLiked, likeCount: updatedLikeCount }
                  : r
              ),
            };
          }
          return c;
        })
      );
    } catch (error) {
      console.error('Error liking comment:', error);
    }
  }, []);

  return {
    comments,
    loading,
    fetchComments,
    addComment,
    deleteComment,
    likeComment,
  };
};