export interface User {
  id: string;
  username: string;
  fullname: string;
  avatar: string;
  bio: string;
  followers: number;
  following: number;
  likes: number;
  followerIds: string[];
  followingIds: string[];
}

export interface Music {
  id: string;
  title: string;
  artist: string;
  url: string;
  cover: string;
}

export interface Video {
  id: string;
  userId: string;
  title: string;
  url: string;
  thumbnail: string;
  musicId: string;
  likeCount: number;
  commentCount: number;
  shareCount: number;
  views: number;
  duration: number;
  createdAt: string;
  isPublic: boolean;
  likedBy: string[];
  // Denormalized data
  user?: User;
  music?: Music;
  isLiked?: boolean;
}

export interface Comment {
  id: string;
  videoId: string;
  userId: string;
  content: string;
  likeCount: number;
  createdAt: string;
  // Denormalized
  user?: User;
}

export interface Notification {
  id: string;
  userId: string;
  senderId: string;
  type: 'FOLLOW' | 'LIKE' | 'COMMENT';
  message: string;
  videoId: string | null;
  isRead: boolean;
  createdAt: string;
  // Denormalized
  sender?: User;
}