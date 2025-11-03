import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  TextInput,
  ScrollView,
  Image,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { Video, Audio, ResizeMode } from 'expo-av';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute } from '@react-navigation/native';
import axios from 'axios';

const API_BASE_URL = 'http://192.168.1.125:3000';
const CLOUDINARY_CLOUD_NAME = 'daq1jyn28';
const CLOUDINARY_UPLOAD_PRESET = 'vidshare';
const CURRENT_USER_ID = 'u4';

interface MusicOption {
  id: string;
  title: string;
  artist: string;
  cover: string;
  uri?: string;
}

const EditVideoScreen: React.FC = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { videoUri, musicUri: passedMusicUri } = route.params as { videoUri: string; musicUri?: string };
  const videoRef = useRef<Video>(null);

  const [title, setTitle] = useState('');
  const [showMusicPicker, setShowMusicPicker] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [sound, setSound] = useState<Audio.Sound | null>(null);

  const uploadToCloudinary = async (uri: string): Promise<string> => {
    const formData = new FormData();
    const uriParts = uri.split('.');
    const fileType = uriParts[uriParts.length - 1];

    formData.append('file', {
      uri,
      type: `video/${fileType}`,
      name: `video_${Date.now()}.${fileType}`,
    } as any);
    formData.append('upload_preset', CLOUDINARY_UPLOAD_PRESET);

    const response = await axios.post(
      `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/video/upload`,
      formData,
      {
        headers: { 'Content-Type': 'multipart/form-data' },
        onUploadProgress: (e) => {
          if (e.total) setUploadProgress(Math.round((e.loaded * 100) / e.total));
        },
      }
    );
    return response.data.secure_url;
  };

  const handlePost = async () => {
    if (!title.trim()) {
      Alert.alert('Error', 'Please enter a title');
      return;
    }


    setUploading(true);
    try {
      const cloudinaryUrl = await uploadToCloudinary(videoUri);

      const db = await axios.get(`${API_BASE_URL}/users`);
      const currentUser = db.data.find((u: any) => u.id === CURRENT_USER_ID);

      const newVideo = {
        id: `v${Date.now()}`,
        userId: CURRENT_USER_ID,
        title: title.trim(),
        url: cloudinaryUrl,
        thumbnail: cloudinaryUrl.replace('.mp4', '.jpg'),
        likeCount: 0,
        commentCount: 0,
        shareCount: 0,
        views: 0,
        createdAt: new Date().toISOString(),
        isPublic: true,
        user: {
          id: currentUser.id,
          username: currentUser.username,
          fullname: currentUser.fullname,
          avatar: currentUser.avatar,
        },
        likedBy: [],
      };

      await axios.post(`${API_BASE_URL}/videos`, newVideo);
      Alert.alert('Success! 🎉', 'Your video has been posted!', [
        { text: 'OK', onPress: () => navigation.navigate('Main' as never) },
      ]);
    } catch (error) {
      console.error('Upload error:', error);
      Alert.alert('Error', 'Failed to upload video');
    } finally {
      setUploading(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="#000" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Edit Video</Text>
        <TouchableOpacity onPress={handlePost} disabled={uploading}>
          <Text style={[styles.postButton, uploading && styles.disabled]}>
            {uploading ? 'Posting...' : 'Post'}
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content}>
        {/* Video Preview */}
  <View style={styles.videoPreview}>
    <Video
      ref={videoRef}
      source={{ uri: videoUri }}
      style={styles.video}
      useNativeControls
      shouldPlay={false}
      isLooping={false}
      resizeMode={ResizeMode.CONTAIN}
    />
  </View>

        {/* Caption */}
        <View style={styles.section}>
          <Text style={styles.label}>Caption</Text>
          <TextInput
            style={styles.input}
            placeholder="Add a caption..."
            value={title}
            onChangeText={setTitle}
            maxLength={100}
            multiline
            editable={!uploading}
          />
          <Text style={styles.charCount}>{title.length}/100</Text>
        </View>

        {uploading && (
          <View style={styles.uploadingContainer}>
            <ActivityIndicator size="large" color="#FF4EB8" />
            <Text style={styles.uploadingText}>Uploading... {uploadProgress}%</Text>
          </View>
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#f0f0f0' },
  headerTitle: { fontSize: 18, fontWeight: '600' },
  postButton: { fontSize: 16, fontWeight: '600', color: '#FF4EB8' },
  disabled: { opacity: 0.5 },
  content: { flex: 1 },
  videoPreview: { width: '100%', height: 300, backgroundColor: '#000' },
  video: { width: '100%', height: '100%' },
  section: { padding: 16, borderBottomWidth: 1, borderBottomColor: '#f0f0f0' },
  label: { fontSize: 16, fontWeight: '600', marginBottom: 8 },
  input: { borderWidth: 1, borderColor: '#ddd', borderRadius: 8, padding: 12, fontSize: 16, minHeight: 80, textAlignVertical: 'top' },
  charCount: { textAlign: 'right', color: '#999', fontSize: 12, marginTop: 4 },
  musicSelector: { flexDirection: 'row', alignItems: 'center', padding: 12, backgroundColor: '#f9f9f9', borderRadius: 8 },
  musicCover: { width: 50, height: 50, borderRadius: 8, marginRight: 12 },
  musicInfo: { flex: 1 },
  musicTitle: { fontSize: 16, fontWeight: '600' },
  musicArtist: { fontSize: 14, color: '#666', marginTop: 2 },
  musicList: { marginTop: 10, borderRadius: 8, overflow: 'hidden' },
  musicItem: { flexDirection: 'row', alignItems: 'center', padding: 12, backgroundColor: '#f9f9f9', marginBottom: 8, borderRadius: 8 },
  uploadingContainer: { padding: 20, alignItems: 'center' },
  uploadingText: { marginTop: 10, fontSize: 16, fontWeight: '600' },
});

export default EditVideoScreen;
