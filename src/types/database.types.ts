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
  user: {
    id: string;
    username: string;
    fullname: string;
    avatar: string;
  }
  userName?: string;
  location?: string;
  isPublic?: boolean;
  likedBy?: string[];
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
  tags?: string[];
  // Denormalized data
  user?: User;
  isLiked?: boolean;
  videoUrl: string; // ✅ video link (URL)
  caption?: string; // ✅ mô tả video
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
  userId: string;         // Người nhận thông báo
  senderId: string;       // Người thực hiện hành động (người like, comment, follow)
  type: "FOLLOW" | "LIKE_VIDEO" | "COMMENT_VIDEO" | "LIKE_IMAGE" | "COMMENT_IMAGE";
  message: string;        // Nội dung hiển thị cho người nhận
  isRead: boolean;        // Trạng thái đã đọc hay chưa
  createdAt: string;      // Ngày giờ tạo thông báo

  content?: string;       // Nội dung comment (nếu có)
  videoId?: string | null;
  imageId?: string | null;
}
