// Video Configuration
export const VIDEO_CONFIG = {
  MAX_DURATION: 60,              // seconds
  MIN_DURATION: 3,               // seconds
  MAX_FILE_SIZE: 100 * 1024 * 1024, // 100MB
  ALLOWED_FORMATS: ['mp4', 'mov', 'avi'],
  THUMBNAIL_QUALITY: 0.7,
  VIDEO_QUALITY: {
    LOW: '480p',
    MEDIUM: '720p',
    HIGH: '1080p',
  },
};

// User Configuration
export const USER_CONFIG = {
  MIN_USERNAME_LENGTH: 3,
  MAX_USERNAME_LENGTH: 20,
  MIN_PASSWORD_LENGTH: 8,
  MAX_BIO_LENGTH: 150,
  MIN_AGE: 13,
};

// API Configuration
export const API_CONFIG = {
  TIMEOUT: 30000, // 30 seconds
  RETRY_ATTEMPTS: 3,
  ITEMS_PER_PAGE: 10,
};

// Storage Keys (AsyncStorage)
export const STORAGE_KEYS = {
  USER_TOKEN: '@user_token',
  USER_DATA: '@user_data',
  THEME_PREFERENCE: '@theme_preference',
  LANGUAGE: '@language',
  ONBOARDING_COMPLETED: '@onboarding_completed',
};

// Validation Regex
export const REGEX = {
  EMAIL: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  USERNAME: /^[a-zA-Z0-9_]{3,20}$/,
  PHONE: /^[0-9]{10}$/,
  URL: /^(https?:\/\/)?([\da-z\.-]+)\.([a-z\.]{2,6})([\/\w \.-]*)*\/?$/,
  HASHTAG: /#[a-zA-Z0-9_]+/g,
  MENTION: /@[a-zA-Z0-9_]+/g,
};

// Error Messages (Tiếng Việt thân thiện)
export const ERROR_MESSAGES = {
  // Auth Errors
  INVALID_EMAIL: 'Email không hợp lệ',
  INVALID_PASSWORD: 'Mật khẩu phải có ít nhất 8 ký tự',
  PASSWORD_MISMATCH: 'Mật khẩu không khớp',
  EMAIL_ALREADY_EXISTS: 'Email đã được sử dụng',
  INVALID_CREDENTIALS: 'Email hoặc mật khẩu không đúng',
  USER_NOT_FOUND: 'Không tìm thấy người dùng',
  
  // Network Errors
  NETWORK_ERROR: 'Lỗi kết nối mạng. Vui lòng thử lại',
  TIMEOUT_ERROR: 'Yêu cầu bị timeout. Vui lòng thử lại',
  
  // Upload Errors
  FILE_TOO_LARGE: 'File quá lớn. Tối đa 100MB',
  VIDEO_TOO_LONG: 'Video quá dài. Tối đa 60 giây',
  INVALID_FILE_FORMAT: 'Định dạng file không hợp lệ',
  
  // General
  SOMETHING_WENT_WRONG: 'Có lỗi xảy ra. Vui lòng thử lại',
  PERMISSION_DENIED: 'Bạn chưa cấp quyền truy cập',
};

// Success Messages
export const SUCCESS_MESSAGES = {
  LOGIN_SUCCESS: 'Đăng nhập thành công!',
  REGISTER_SUCCESS: 'Đăng ký thành công!',
  VIDEO_UPLOADED: 'Video đã được đăng!',
  PROFILE_UPDATED: 'Cập nhật thông tin thành công!',
  COMMENT_POSTED: 'Đã bình luận',
};

// Navigation Routes
export const ROUTES = {
  // Auth Stack
  LOGIN: 'Login',
  REGISTER: 'Register',
  FORGOT_PASSWORD: 'ForgotPassword',
  
  // Main Tab
  HOME: 'Home',
  SEARCH: 'Search',
  UPLOAD: 'Upload',
  NOTIFICATIONS: 'Notifications',
  PROFILE: 'Profile',
  
  // Other Screens
  VIDEO_DETAIL: 'VideoDetail',
  USER_PROFILE: 'UserProfile',
  EDIT_PROFILE: 'EditProfile',
  SETTINGS: 'Settings',
  FOLLOWERS: 'Followers',
  FOLLOWING: 'Following',
  COMMENTS: 'Comments',
};

// Social Features
export const SOCIAL_CONFIG = {
  MAX_COMMENT_LENGTH: 300,
  MAX_CAPTION_LENGTH: 500,
  MAX_HASHTAGS: 10,
  RATE_LIMIT: {
    COMMENTS_PER_MINUTE: 5,
    LIKES_PER_MINUTE: 30,
    FOLLOWS_PER_MINUTE: 10,
  },
};

// Notification Types
export const NOTIFICATION_TYPES = {
  LIKE: 'like',
  COMMENT: 'comment',
  FOLLOW: 'follow',
  MENTION: 'mention',
  NEW_VIDEO: 'new_video',
};

// Firebase Collections
export const FIREBASE_COLLECTIONS = {
  USERS: 'users',
  VIDEOS: 'videos',
  COMMENTS: 'comments',
  LIKES: 'likes',
  FOLLOWS: 'follows',
  NOTIFICATIONS: 'notifications',
};