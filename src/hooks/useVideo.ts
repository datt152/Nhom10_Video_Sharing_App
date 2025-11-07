import { useState, useCallback, useEffect } from 'react';
import axios from 'axios';
import { Video } from '../types/database.types';
import { API_BASE_URL, getCurrentUserId } from '../types/config';

export const useVideo = () => {
  const [videos, setVideos] = useState<Video[]>([]);
  const [loading, setLoading] = useState(false);
  const [followingStatus, setFollowingStatus] = useState<Record<string, boolean>>({});

  const api = axios.create({
    baseURL: API_BASE_URL,
    timeout: 10000,
  });

  /** ===================== 1️⃣ FETCH VIDEOS ===================== **/
  const fetchVideos = useCallback(async () => {
    setLoading(true);
    try {
      const [videosRes, usersRes] = await Promise.all([
        api.get('/videos'),
        api.get('/users'),
      ]);

      const videosData = videosRes.data;
      const usersData = usersRes.data;

      const enrichedVideos = videosData.map((video: any) => ({
        ...video,
        user: usersData.find((u: any) => u.id === video.userId),
        isLiked: video.likedBy?.includes(getCurrentUserId()) || false,
      }));

      setVideos(enrichedVideos);

      const currentUser = usersData.find((u: any) => u.id === getCurrentUserId());
      if (currentUser) {
        const status: Record<string, boolean> = {};
        enrichedVideos.forEach((video: any) => {
          if (video.user) {
            status[video.user.id] = currentUser.followingIds?.includes(video.user.id) || false;
          }
        });
        setFollowingStatus(status);
      }
    } catch (error) {
      console.error('Error fetching videos:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  // ✅ chỉ gọi 1 lần
  useEffect(() => {
    fetchVideos();
  }, [fetchVideos]);

  /** ===================== 2️⃣ LIKE / UNLIKE ===================== **/
  const likeVideo = useCallback(async (videoId: string) => {
    const video = videos.find((v) => v.id === videoId);
    if (!video) return;

    const updatedLikedBy = [...(video.likedBy || []), getCurrentUserId()];
    const updatedLikeCount = updatedLikedBy.length;

    setVideos((prev) =>
      prev.map((v) =>
        v.id === videoId
          ? {
            ...v,
            likedBy: updatedLikedBy as string[], // ép kiểu ở đây ✅
            likeCount: updatedLikeCount,
            isLiked: true,
          }
          : v
      )
    );
    try {
      await api.patch(`/videos/${videoId}`, {
        likedBy: updatedLikedBy,
        likeCount: updatedLikeCount,
      });

      // ✅ Thêm thông báo (nếu không phải chính mình)
      if (getCurrentUserId() !== video.userId) {
        const newNotification = {
          id: `n${Date.now()}`,
          userId: video.userId, // chủ video nhận thông báo
          senderId: getCurrentUserId(),
          type: "LIKE_VIDEO",
          message: `Người dùng ${getCurrentUserId()} đã thích video của bạn.`,
          videoId,
          isRead: false,
          createdAt: new Date().toISOString(),
        };

        await api.post("/notifications", newNotification);
      }
    } catch (err) {
      console.error('Error liking video:', err);
    }
  }, [videos]);

  const unlikeVideo = useCallback(async (videoId: string) => {
    const video = videos.find((v) => v.id === videoId);
    if (!video) return;

    const updatedLikedBy = video.likedBy.filter(
      (id: string) => id !== getCurrentUserId()
    );
    const updatedLikeCount = updatedLikedBy.length;

    setVideos((prev) =>
      prev.map((v) =>
        v.id === videoId
          ? { ...v, likedBy: updatedLikedBy, likeCount: updatedLikeCount, isLiked: false }
          : v
      )
    );

    try {
      await api.patch(`/videos/${videoId}`, {
        likedBy: updatedLikedBy,
        likeCount: updatedLikeCount,
      });
    } catch (err) {
      console.error('Error unliking video:', err);
    }
  }, [videos]);
  const toggleLike = useCallback(
    async (videoId: string) => {
      const video = videos.find((v) => v.id === videoId);
      if (!video) return;

      const isLiked = video.isLiked;
      const updatedLikedBy = isLiked
        ? video.likedBy.filter((id: string) => id !== getCurrentUserId())
        : [...(video.likedBy || []), getCurrentUserId()];
      const updatedLikeCount = updatedLikedBy.length;

      setVideos((prevVideos) =>
        prevVideos.map((v) =>
          v.id === videoId
            ? {
              ...v,
              isLiked: !isLiked,
              likeCount: updatedLikeCount,
              likedBy: updatedLikedBy,
            }
            : v
        )
      );

      try {
        await api.patch(`/videos/${videoId}`, {
          likedBy: updatedLikedBy,
          likeCount: updatedLikeCount,
        });
      } catch (error) {
        console.error('Error toggling like:', error);
        setVideos((prevVideos) =>
          prevVideos.map((v) => (v.id === videoId ? video : v))
        );
      }
    },
    [videos]
  );
  /** ===================== 3️⃣ FOLLOW / UNFOLLOW ===================== **/
  const toggleFollow = useCallback(async (userId: string) => {
    try {
      const [currentUserRes, targetUserRes] = await Promise.all([
        api.get(`/users/${getCurrentUserId()}`),
        api.get(`/users/${userId}`),
      ]);

      const currentUser = currentUserRes.data;
      const targetUser = targetUserRes.data;
      const isFollowing = currentUser.followingIds?.includes(userId) || false;

      const updatedFollowingIds = isFollowing
        ? currentUser.followingIds.filter((id: string) => id !== userId)
        : [...(currentUser.followingIds || []), userId];

      const updatedFollowerIds = isFollowing
        ? targetUser.followerIds.filter((id: string) => id !== getCurrentUserId())
        : [...(targetUser.followerIds || []), getCurrentUserId()];

      await Promise.all([
        api.patch(`/users/${getCurrentUserId()}`, {
          followingIds: updatedFollowingIds,
          following: isFollowing ? currentUser.following - 1 : currentUser.following + 1,
        }),
        api.patch(`/users/${userId}`, {
          followerIds: updatedFollowerIds,
          followers: isFollowing ? targetUser.followers - 1 : targetUser.followers + 1,
        }),
      ]);

      setFollowingStatus((prev) => ({
        ...prev,
        [userId]: !isFollowing,
      }));
    } catch (error) {
      console.error('Error toggling follow:', error);
    }
  }, []);
  const getVideoByVideoId = async (videoId: string): Promise<Video | null> => {
  try {
    const [videoRes, usersRes] = await Promise.all([
      api.get(`/videos/${videoId}`),
      api.get(`/users`),
    ]);

    const video = videoRes.data;
    const users = usersRes.data;

    const enrichedVideo = {
      ...video,
      user: users.find((u: any) => u.id === video.userId),
      isLiked: video.likedBy?.includes(getCurrentUserId()) || false,
    };

    return enrichedVideo;
  } catch (err) {
    console.error("❌ Lỗi khi tải video theo id:", err);
    return null;
  }
};
  /** ===================== 4️⃣ CÁC HÀM PHỤ ===================== **/
  const getLikeCount = (videoId: string): number => {
    const video = videos.find((v) => v.id === videoId);
    return video?.likedBy?.length || 0;
  };

  const countCommentsByVideo = async (videoId: string): Promise<number> => {
    try {
      const res = await axios.get(`${API_BASE_URL}/comments?videoId=${videoId}`);
      return Array.isArray(res.data) ? res.data.length : 0;
    } catch {
      return 0;
    }
  };

  const getVideoById = useCallback(async (userId?: string): Promise<Video[]> => {
    try {
      const res = await api.get('/videos');
      const allVideos = res.data;
      const usersRes = await api.get('/users');
      const users = usersRes.data;

      return allVideos
        .filter((v: any) => !userId || v.userId === userId)
        .map((v: any) => ({
          ...v,
          user: users.find((u: any) => u.id === v.userId),
          isLiked: v.likedBy?.includes(getCurrentUserId()) || false,
        }));
    } catch (err) {
      console.error('Error loading videos:', err);
      return [];
    }
  }, []);

  const toggleVideoPrivacy = async (videoId: string, isPublic: boolean) => {
    try {
      const newPrivacy = !isPublic;
      await axios.patch(`${API_BASE_URL}/videos/${videoId}`, { isPublic: newPrivacy });
      setVideos((prev) =>
        prev.map((v) => (v.id === videoId ? { ...v, isPublic: newPrivacy } : v))
      );
    } catch (err) {
      console.error('Error toggling privacy:', err);
    }
  };

  const getPublicVideosLikedByUser = useCallback(async (): Promise<Video[]> => {
    try {
      const res = await api.get('/videos');
      const videosData = res.data;
      return videosData.filter(
        (v: any) => v.isPublic && v.likedBy?.includes(getCurrentUserId())
      );
    } catch (err) {
      console.error('Error loading liked videos:', err);
      return [];
    }
  }, []);
  const loadVideosByUser = async (userId: string) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/videos`, {
        params: { userId },
      });
      return response.data;
    } catch (error) {
      console.error("Error loading videos by user:", error);
      throw error;
    }
  };
  /** ===================== RETURN ===================== **/
  return {
    videos,
    loading,
    followingStatus,
    currentUserId: getCurrentUserId(),
    likeVideo,
    unlikeVideo,
    toggleFollow,
    refreshVideos: fetchVideos,
    getLikeCount,
    countCommentsByVideo,
    getVideoById,
    toggleVideoPrivacy,
    getPublicVideosLikedByUser,
    loadVideosByUser,
    toggleLike,
    getVideoByVideoId
  };
};
