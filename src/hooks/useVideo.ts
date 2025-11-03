import { useState, useCallback, useEffect } from 'react';
import { Video } from '../types/database.types';
import axios from 'axios';

const API_BASE_URL = 'http://192.168.1.166:3000';
export const CURRENT_USER_ID = 'u1';

export const useVideo = () => {
  const [videos, setVideos] = useState<Video[]>([]);
  const [loading, setLoading] = useState(false);
  const [followingStatus, setFollowingStatus] = useState<Record<string, boolean>>({});

  const api = axios.create({
    baseURL: API_BASE_URL,
    timeout: 10000,
  });

  // 1️⃣ FETCH VIDEOS
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
        isLiked: video.likedBy?.includes(CURRENT_USER_ID) || false,
      }));

      setVideos(enrichedVideos);

      const currentUser = usersData.find((u: any) => u.id === CURRENT_USER_ID);
      if (currentUser) {
        const status: Record<string, boolean> = {};
        enrichedVideos.forEach((video: any) => {
          if (video.user) {
            status[video.user.id] =
              currentUser.followingIds?.includes(video.user.id) || false;
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

  useEffect(() => {
    fetchVideos();
  }, []);

  // 2️⃣ TOGGLE LIKE
  const toggleLike = useCallback(
    async (videoId: string) => {
      const video = videos.find((v) => v.id === videoId);
      if (!video) return;

      const isLiked = video.isLiked;
      const updatedLikedBy = isLiked
        ? video.likedBy.filter((id: string) => id !== CURRENT_USER_ID)
        : [...(video.likedBy || []), CURRENT_USER_ID];
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

  // 3️⃣ TOGGLE FOLLOW
  const toggleFollow = useCallback(async (userId: string) => {
    try {
      const [currentUserRes, targetUserRes] = await Promise.all([
        api.get(`/users/${CURRENT_USER_ID}`),
        api.get(`/users/${userId}`),
      ]);

      const currentUser = currentUserRes.data;
      const targetUser = targetUserRes.data;

      const isFollowing =
        currentUser.followingIds?.includes(userId) || false;

      const updatedFollowingIds = isFollowing
        ? currentUser.followingIds.filter((id: string) => id !== userId)
        : [...(currentUser.followingIds || []), userId];

      const updatedFollowerIds = isFollowing
        ? targetUser.followerIds.filter((id: string) => id !== CURRENT_USER_ID)
        : [...(targetUser.followerIds || []), CURRENT_USER_ID];

      const updatedFollowing = isFollowing
        ? currentUser.following - 1
        : currentUser.following + 1;

      const updatedFollowers = isFollowing
        ? targetUser.followers - 1
        : targetUser.followers + 1;

      setFollowingStatus((prev) => ({
        ...prev,
        [userId]: !isFollowing,
      }));

      await Promise.all([
        api.patch(`/users/${CURRENT_USER_ID}`, {
          followingIds: updatedFollowingIds,
          following: updatedFollowing,
        }),
        api.patch(`/users/${userId}`, {
          followerIds: updatedFollowerIds,
          followers: updatedFollowers,
        }),
      ]);

      console.log(
        `✅ ${isFollowing ? 'Unfollowed' : 'Followed'} user ${userId}`
      );
    } catch (error) {
      console.error('Error toggling follow:', error);
      setFollowingStatus((prev) => ({
        ...prev,
        [userId]: !prev[userId],
      }));
    }
  }, []);

  // 4️⃣ Lấy danh sách video theo userId
  const loadVideosByUser = async (userId?: string) => {
    try {
      setLoading(true);
      const res = await api.get('/videos');
      const allVideos = res.data;
      setVideos(
        userId ? allVideos.filter((v: any) => v.userId === userId) : allVideos
      );
    } catch (err) {
      console.error('Error loading user videos:', err);
    } finally {
      setLoading(false);
    }
  };

  // 5️⃣ LIKE VIDEO
  const likeVideo = async (videoId: string) => {
    const video = videos.find((v) => v.id === videoId);
    if (!video) return;

    const updatedLikedBy = [...(video.likedBy || []), CURRENT_USER_ID];
    const updatedLikeCount = updatedLikedBy.length;

    setVideos((prev) =>
      prev.map((v) =>
        v.id === videoId
          ? { ...v, likedBy: updatedLikedBy, likeCount: updatedLikeCount, isLiked: true }
          : v
      )
    );

    try {
      await api.patch(`/videos/${videoId}`, {
        likedBy: updatedLikedBy,
        likeCount: updatedLikeCount,
      });
    } catch (err) {
      console.error('Error liking video:', err);
    }
  };

  // 6️⃣ UNLIKE VIDEO
  const unlikeVideo = async (videoId: string) => {
    const video = videos.find((v) => v.id === videoId);
    if (!video) return;

    const updatedLikedBy = video.likedBy.filter(
      (id: string) => id !== CURRENT_USER_ID
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
  };
  // 7️⃣ GET LIKE COUNT
  const getLikeCount = (videoId: string): number => {
    const video = videos.find((v) => v.id === videoId);
    return video?.likedBy?.length || 0;
  };
  // 🔢 Đếm số lượng comment theo videoId (fetch thật từ API)
  const countCommentsByVideo = async (videoId: string): Promise<number> => {
    try {
      const res = await axios.get(`${API_BASE_URL}/comments?videoId=${videoId}`);
      if (Array.isArray(res.data)) {
        return res.data.length; // ✅ Trả về số lượng bình luận
      }
      return 0;
    } catch (err) {
      console.error('Error counting comments:', err);
      return 0;
    }
  };

  return {
    videos,
    loading,
    followingStatus,
    currentUserId: CURRENT_USER_ID,
    toggleLike,
    toggleFollow,
    refreshVideos: fetchVideos,
    loadVideosByUser,
    likeVideo,
    unlikeVideo,
    getLikeCount,
    countCommentsByVideo
  };
};
