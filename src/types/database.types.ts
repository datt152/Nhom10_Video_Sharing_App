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
// interface hình ảnh
export interface Image {
  id: number;
  imageUrl: string;       // URL ảnh
  caption?: string;       // mô tả hoặc caption
  tags?: string[];        // danh sách tag (ví dụ ["travel", "sunset"])
  likes: number;          // tổng lượt thích
  comments: number;       // tổng bình luận
  views: number;          // tổng lượt xem
  createdAt: string;      // ngày đăng
  userId: number;         // ID người đăng
  userName?: string;      // tên người đăng (nếu cần hiển thị nhanh)
  location?: string;      // địa điểm chụp (nếu có)
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
  createdAt: string;
  likeCount: number;
  likedBy: string[];
  replyCount: number;
  parentId: string | null; // ✅ null = comment gốc, có giá trị = reply
  user?: User;
  isLiked?: boolean;
  replies?: Comment[]; // ✅ Danh sách replies
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