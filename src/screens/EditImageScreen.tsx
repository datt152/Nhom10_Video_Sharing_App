import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Image,
  StyleSheet,
  Alert,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import axios from 'axios';

const API_BASE_URL = 'http://192.168.1.166:3000';
const CLOUDINARY_CLOUD_NAME = 'daq1jyn28';
const CLOUDINARY_UPLOAD_PRESET = 'vidshare';
const CURRENT_USER_ID = 'u4';

const EditImageScreen: React.FC = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { imageUri } = route.params as { imageUri: string };

  const [caption, setCaption] = useState('');
  const [tagsText, setTagsText] = useState('');
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  const uploadToCloudinary = async (uri: string): Promise<string> => {
    const formData = new FormData();
    const fileType = uri.split('.').pop() || 'jpg';

    formData.append('file', {
      uri,
      type: `image/${fileType}`,
      name: `image_${Date.now()}.${fileType}`,
    } as any);
    formData.append('upload_preset', CLOUDINARY_UPLOAD_PRESET);

    const response = await axios.post(
      `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`,
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
    if (!caption.trim()) {
      Alert.alert('Error', 'Please enter a caption');
      return;
    }

    setUploading(true);

    try {
      const imageUrl = await uploadToCloudinary(imageUri);

      const newImagePost = {
        id: `i${Date.now()}`,
        imageUrl,
        caption: caption.trim(),
        tags: tagsText.split(',').map((t) => t.trim()).filter((t) => t),
        createdAt: new Date().toISOString(),
        userId: CURRENT_USER_ID,
      };

      await axios.post(`${API_BASE_URL}/images`, newImagePost);

      Alert.alert('Success 🎉', 'Your image has been posted!', [
        { text: 'OK', onPress: () => navigation.navigate('Main' as never) },
      ]);
    } catch (error) {
      console.error('Upload error:', error);
      Alert.alert('Error', 'Failed to upload image');
    } finally {
      setUploading(false);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Image source={{ uri: imageUri }} style={styles.imagePreview} />

      <View style={styles.section}>
        <Text style={styles.label}>Caption</Text>
        <TextInput
          style={styles.input}
          placeholder="Add a caption..."
          value={caption}
          onChangeText={setCaption}
          multiline
          editable={!uploading}
        />
      </View>

      <View style={styles.section}>
        <Text style={styles.label}>Tags (comma separated)</Text>
        <TextInput
          style={styles.input}
          placeholder="e.g. portrait, smile, people"
          value={tagsText}
          onChangeText={setTagsText}
          editable={!uploading}
        />
      </View>

      {uploading && (
        <View style={styles.uploadingContainer}>
          <ActivityIndicator size="large" color="#FF4EB8" />
          <Text style={styles.uploadingText}>Uploading... {uploadProgress}%</Text>
        </View>
      )}

      <TouchableOpacity
        style={[styles.postButton, uploading && { opacity: 0.5 }]}
        onPress={handlePost}
        disabled={uploading}
      >
        <Text style={styles.postButtonText}>{uploading ? 'Posting...' : 'Post'}</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
    backgroundColor: '#fff',
    flexGrow: 1,
  },
  imagePreview: {
    width: '100%',
    height: 300,
    borderRadius: 12,
    marginBottom: 16,
    backgroundColor: '#ddd',
  },
  section: {
    marginBottom: 16,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 6,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    minHeight: 50,
    textAlignVertical: 'top',
  },
  postButton: {
    backgroundColor: '#FF4EB8',
    paddingVertical: 14,
    borderRadius: 25,
    alignItems: 'center',
    marginTop: 10,
  },
  postButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  uploadingContainer: {
    marginVertical: 16,
    alignItems: 'center',
  },
  uploadingText: {
    marginTop: 8,
    fontSize: 14,
    fontWeight: '600',
  },
});

export default EditImageScreen;
