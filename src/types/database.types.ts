export interface User {
  id: string;
  username: string;
  fullname: string;
  avatar: string;
  link: string;
  bio: string;
  followers: number;
  following: number;
  likes: number;
  followerIds: string[];
  followingIds: string[];
  externalLinks?: string[];
}

export interface Music {
  id: string;
  title: string;
  artist: string;
  cover: string;
  audioUrl: string
}
export interface Image {
  id: string;
  imageUrl: string;       // URL ảnh
  caption?: string;
  tags?: string[];
  likes: number;
  comments: number;
  views: number;
  createdAt: string;
  userId: string;
  userName?: string;
  location?: string;
  isPublic?: boolean;
  likeBy?: string[];

  // Liên kết nhạc
  musicId?: string; // ID bài nhạc (nếu dùng _expand)
  music?: {
    id: string;
    title: string;
    artist?: string;
    audioUrl: string;   // 🔥 Link phát nhạc thật
    thumbnailUrl?: string; // (tuỳ chọn) ảnh bài hát
  };
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
  userId: string;
  content: string;
  createdAt: string;
  likeCount: number;
  likedBy: string[];
  replyCount: number;
  parentId: string | null;
  videoId?: string;  // ✅ cho phép optional
  imageId?: string;  // ✅ cho phép optional
  user?: User;
  isLiked?: boolean;
  replies?: Comment[];
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