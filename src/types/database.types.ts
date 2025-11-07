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
  uri: string
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
  isLiked?: boolean;
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
  videoUrl: string; // ✅ video link (URL)
  caption?: string; // ✅ mô tả video
  tags?: string[]
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
  toUserId: string;        // Người nhận thông báo
  fromUserId: string;      // Người tạo ra hành động (người like/bình luận)
  type:
  | "follow"
  | "like_video"
  | "comment_video"
  | "like_image"
  | "comment_image";     // Các loại thông báo có thể mở rộng
  targetId: string | null; // ID của video hoặc ảnh được tương tác
  message: string;         // Nội dung hiển thị
  isRead: boolean;         // Đã đọc hay chưa
  createdAt: string;       // Thời gian tạo
  content: string,
  videoId: string,
  imageId: string,
  // Dữ liệu mở rộng (optional)
  fromUser?: User;         // Thông tin người gửi, nếu muốn hiển thị avatar / name
}