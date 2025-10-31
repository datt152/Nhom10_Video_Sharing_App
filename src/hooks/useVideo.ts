import { useState, useCallback, useEffect } from 'react';
import { Video } from '../types/database.types';
import axios from 'axios';


const API_BASE_URL = 'http://192.168.1.125:3000';
export const CURRENT_USER_ID = 'u1';

export const useVideo = () => {
  const [videos, setVideos] = useState<Video[]>([]);

  const [loading, setLoading] = useState(false);
  const [followingStatus, setFollowingStatus] = useState<Record<string, boolean>>({});

  const api = axios.create({
    baseURL: API_BASE_URL,
    timeout: 10000,
  });

  // 1. FETCH VIDEOS
  const fetchVideos = useCallback(async () => {
    setLoading(true);
    try {
      const [videosRes, usersRes, musicRes] = await Promise.all([
        api.get('/videos'),
        api.get('/users'),
        api.get('/music'),
      ]);

      const videosData = videosRes.data;
      const usersData = usersRes.data;
      const musicData = musicRes.data;

      const enrichedVideos = videosData.map((video: any) => ({
        ...video,
        user: usersData.find((u: any) => u.id === video.userId),
        music: musicData.find((m: any) => m.id === video.musicId),
        isLiked: video.likedBy?.includes(CURRENT_USER_ID) || false,
      }));

      setVideos(enrichedVideos);

      const currentUser = usersData.find((u: any) => u.id === CURRENT_USER_ID);
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

  useEffect(() => {
    fetchVideos();
  }, []);

  // 2. TOGGLE LIKE
  const toggleLike = useCallback(async (videoId: string) => {
    const video = videos.find((v) => v.id === videoId);
    if (!video) return;

    const isLiked = video.isLiked;
    const updatedLikedBy = isLiked
      ? video.likedBy.filter((id: string) => id !== CURRENT_USER_ID)
      : [...(video.likedBy || []), CURRENT_USER_ID];
    const updatedLikeCount = isLiked ? video.likeCount - 1 : video.likeCount + 1;

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
  }, [videos]);

  // 3. TOGGLE FOLLOW
  const toggleFollow = useCallback(async (userId: string) => {
    try {
      const [currentUserRes, targetUserRes] = await Promise.all([
        api.get(`/users/${CURRENT_USER_ID}`),
        api.get(`/users/${userId}`),
      ]);

      const currentUser = currentUserRes.data;
      const targetUser = targetUserRes.data;

      const isFollowing = currentUser.followingIds?.includes(userId) || false;

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

      console.log(`✅ ${isFollowing ? 'Unfollowed' : 'Followed'} user ${userId}`);
    } catch (error) {
      console.error('Error toggling follow:', error);
      setFollowingStatus((prev) => ({
        ...prev,
        [userId]: !prev[userId],
      }));
    }
  }, []);
  // 🎥 Lấy danh sách video theo userId (tách riêng giống loadImages)
  const loadVideosByUser = async (userId?: string) => {
    try {
      setLoading(true);
      const res = await api.get('/videos');
      const allVideos = res.data;
      setVideos(userId ? allVideos.filter((v: any) => v.userId === userId) : allVideos);
    } catch (err) {
      console.error('Error loading user videos:', err);
    } finally {
      setLoading(false);
    }
  };
  const likeVideo = async (videoId: string) => {
    console.log("Liked video:", videoId);
    // gọi API hoặc cập nhật state ở đây
  };

  const unlikeVideo = async (videoId: string) => {
    console.log("Unliked video:", videoId);
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
    unlikeVideo // 🆕 thêm vào đây
  };
};