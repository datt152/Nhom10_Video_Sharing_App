import AsyncStorage from '@react-native-async-storage/async-storage';

export const API_BASE_URL = "http://192.168.1.252:3000";
export const CLOUDINARY_CLOUD_NAME = "daq1jyn28";
export const CLOUDINARY_UPLOAD_PRESET = "vidshare";

export const getCurrentUserId = async () => await AsyncStorage.getItem("CURRENT_USER_ID");
export const setCurrentUserId = async (id: string) =>
  await AsyncStorage.setItem("CURRENT_USER_ID", id);
export const removeCurrentUserId = async () => 
  await AsyncStorage.removeItem("CURRENT_USER_ID");

