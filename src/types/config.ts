export const API_BASE_URL = "http://192.168.1.194:3000";
export const CLOUDINARY_CLOUD_NAME = "daq1jyn28";
export const CLOUDINARY_UPLOAD_PRESET = "vidshare";

export const getCurrentUserId = () => localStorage.getItem("CURRENT_USER_ID");
export const setCurrentUserId = (id: string) =>
  localStorage.setItem("CURRENT_USER_ID", id);
