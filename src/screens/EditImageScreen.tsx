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
  Switch,
  Modal,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import axios from 'axios';

import {API_BASE_URL} from '../types/database.types'

const CLOUDINARY_CLOUD_NAME = 'daq1jyn28';
const CLOUDINARY_UPLOAD_PRESET = 'vidshare';
const CURRENT_USER_ID = 'u4';

const EditImageScreen: React.FC = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { imageUri } = route.params as { imageUri: string };

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [hashtags, setHashtags] = useState<string[]>([]);
  const [hashtagInput, setHashtagInput] = useState('');
  const [taggedPeople, setTaggedPeople] = useState<any[]>([]);
  const [commentsEnabled, setCommentsEnabled] = useState(true);
  const [whoCanWatch, setWhoCanWatch] = useState('Công khai');
  const [shareToFacebook, setShareToFacebook] = useState(false);
  const [shareToTwitter, setShareToTwitter] = useState(false);
  const [shareToInstagram, setShareToInstagram] = useState(false);
  
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [showTagModal, setShowTagModal] = useState(false);
  const [showPrivacyModal, setShowPrivacyModal] = useState(false);

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

  const addHashtag = () => {
    if (hashtagInput.trim() && !hashtags.includes(hashtagInput.trim())) {
      setHashtags([...hashtags, hashtagInput.trim()]);
      setHashtagInput('');
    }
  };

  const removeHashtag = (tag: string) => {
    setHashtags(hashtags.filter((h) => h !== tag));
  };

  const handlePost = async () => {
    if (!title.trim()) {
      Alert.alert('Lỗi', 'Vui lòng nhập tiêu đề');
      return;
    }

    setUploading(true);

    try {
      const imageUrl = await uploadToCloudinary(imageUri);

      const newImagePost = {
        id: `i${Date.now()}`,
        imageUrl,
        title: title.trim(),
        caption: description.trim(),
        tags: hashtags,
        taggedUsers: taggedPeople.map(p => p.id),
        commentsEnabled,
        privacy: whoCanWatch,
        createdAt: new Date().toISOString(),
        userId: CURRENT_USER_ID,
      };

      await axios.post(`${API_BASE_URL}/images`, newImagePost);

      Alert.alert('Thành công 🎉', 'Ảnh của bạn đã được đăng!', [
        { text: 'OK', onPress: () => navigation.navigate('Main' as never) },
      ]);
    } catch (error) {
      console.error('Upload error:', error);
      Alert.alert('Lỗi', 'Không thể tải ảnh lên');
    } finally {
      setUploading(false);
    }
  };

  const handleSaveDraft = () => {
    Alert.alert('Đã lưu bản nháp', 'Bài đăng của bạn đã được lưu dưới dạng bản nháp');
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="chevron-back" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Đăng bài</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Image Preview */}
        <View style={styles.imageContainer}>
          <Image source={{ uri: imageUri }} style={styles.imagePreview} />
         
        </View>

        {/* Title */}
        <View style={styles.section}>
          <Text style={styles.label}>Tiêu đề</Text>
          <TextInput
            style={styles.input}
            placeholder="Nhập tiêu đề"
            placeholderTextColor="#ccc"
            value={title}
            onChangeText={setTitle}
            editable={!uploading}
          />
        </View>

        {/* Description */}
        <View style={styles.section}>
          <Text style={styles.label}>Mô tả</Text>
          <TextInput
            style={[styles.input, styles.descriptionInput]}
            placeholder="Nhập mô tả"
            placeholderTextColor="#ccc"
            value={description}
            onChangeText={setDescription}
            multiline
            numberOfLines={4}
            editable={!uploading}
          />
        </View>

        {/* Add Hashtag */}
        <View style={styles.section}>
          <Text style={styles.label}>Thêm hashtag</Text>
          <View style={styles.hashtagInputContainer}>
            <TextInput
              style={styles.hashtagInput}
              placeholder="Nhập hashtag và nhấn thêm"
              placeholderTextColor="#ccc"
              value={hashtagInput}
              onChangeText={setHashtagInput}
              onSubmitEditing={addHashtag}
              editable={!uploading}
            />
            <TouchableOpacity onPress={addHashtag} style={styles.addHashtagButton}>
              <Ionicons name="add" size={20} color="#FF3B5C" />
            </TouchableOpacity>
          </View>
          <View style={styles.hashtagList}>
            {hashtags.map((tag) => (
              <View key={tag} style={styles.hashtagChip}>
                <Text style={styles.hashtagChipText}>{tag}</Text>
                <TouchableOpacity onPress={() => removeHashtag(tag)}>
                  <Ionicons name="close" size={16} color="#FF3B5C" />
                </TouchableOpacity>
              </View>
            ))}
          </View>
        </View>

      

        {/* Comments */}
        <View style={styles.row}>
          <Text style={styles.rowLabel}>Bình luận</Text>
          <Switch
            value={commentsEnabled}
            onValueChange={setCommentsEnabled}
            trackColor={{ false: '#E0E0E0', true: '#FFB3C6' }}
            thumbColor={commentsEnabled ? '#FF3B5C' : '#f4f3f4'}
            disabled={uploading}
          />
        </View>

        {/* Who Can Watch */}
        <TouchableOpacity
          style={styles.row}
          onPress={() => setShowPrivacyModal(true)}
          disabled={uploading}
        >
          <Text style={styles.rowLabel}>Ai có thể xem</Text>
          <View style={styles.rowRight}>
            <Text style={styles.rowValue}>{whoCanWatch}</Text>
            <Ionicons name="chevron-down" size={20} color="#999" />
          </View>
        </TouchableOpacity>

        {uploading && (
          <View style={styles.uploadingContainer}>
            <ActivityIndicator size="large" color="#FF3B5C" />
            <Text style={styles.uploadingText}>Đang tải lên... {uploadProgress}%</Text>
          </View>
        )}
      </ScrollView>

      {/* Bottom Buttons */}
      <View style={styles.bottomButtons}>
        
        <TouchableOpacity
          style={[styles.postButton, uploading && { opacity: 0.5 }]}
          onPress={handlePost}
          disabled={uploading}
        >
          <Ionicons name="paper-plane" size={20} color="#fff" />
          <Text style={styles.postButtonText}>
            {uploading ? 'Đang đăng...' : 'Đăng bài'}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Tag People Modal */}
      <Modal visible={showTagModal} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Gắn thẻ người khác</Text>
              <TouchableOpacity onPress={() => setShowTagModal(false)}>
                <Ionicons name="close" size={24} color="#333" />
              </TouchableOpacity>
            </View>
            <Text style={styles.modalSubtext}>Tìm kiếm và chọn người để gắn thẻ</Text>
            <TouchableOpacity
              style={styles.modalButton}
              onPress={() => setShowTagModal(false)}
            >
              <Text style={styles.modalButtonText}>Xong</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Privacy Modal */}
      <Modal visible={showPrivacyModal} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Ai có thể xem?</Text>
              <TouchableOpacity onPress={() => setShowPrivacyModal(false)}>
                <Ionicons name="close" size={24} color="#333" />
              </TouchableOpacity>
            </View>
            {['Công khai', 'Riêng tư'].map((option) => (
              <TouchableOpacity
                key={option}
                style={styles.privacyOption}
                onPress={() => {
                  setWhoCanWatch(option);
                  setShowPrivacyModal(false);
                }}
              >
                <Text style={styles.privacyOptionText}>{option}</Text>
                {whoCanWatch === option && (
                  <Ionicons name="checkmark" size={24} color="#FF3B5C" />
                )}
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 50,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  content: {
    flex: 1,
    paddingHorizontal: 16,
  },
  imageContainer: {
    alignItems: 'center',
    marginVertical: 20,
  },
  imagePreview: {
    width: 200,
    height: 280,
    borderRadius: 16,
    backgroundColor: '#f0f0f0',
  },
  changeCoverButton: {
    marginTop: 12,
  },
  changeCoverText: {
    color: '#FF3B5C',
    fontSize: 15,
    fontWeight: '500',
  },
  section: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#F8F8F8',
    borderRadius: 12,
    padding: 16,
    fontSize: 15,
    color: '#333',
  },
  descriptionInput: {
    minHeight: 100,
    textAlignVertical: 'top',
  },
  hashtagInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8F8F8',
    borderRadius: 12,
    paddingHorizontal: 16,
  },
  hashtagInput: {
    flex: 1,
    paddingVertical: 16,
    fontSize: 15,
    color: '#333',
  },
  addHashtagButton: {
    padding: 4,
  },
  hashtagList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 12,
    gap: 8,
  },
  hashtagChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E8F5FF',
    borderRadius: 20,
    paddingVertical: 6,
    paddingHorizontal: 12,
    gap: 6,
  },
  hashtagChipText: {
    color: '#FF3B5C',
    fontSize: 14,
    fontWeight: '500',
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  rowLabel: {
    fontSize: 16,
    color: '#333',
  },
  rowRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  rowValue: {
    fontSize: 15,
    color: '#FF3B5C',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginTop: 20,
    marginBottom: 12,
  },
  socialRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  socialLabel: {
    fontSize: 16,
    color: '#333',
  },
  uploadingContainer: {
    alignItems: 'center',
    marginVertical: 20,
  },
  uploadingText: {
    marginTop: 12,
    fontSize: 15,
    fontWeight: '600',
    color: '#FF3B5C',
  },
  bottomButtons: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
    gap: 12,
  },
  saveDraftButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff',
    borderWidth: 2,
    borderColor: '#FF3B5C',
    borderRadius: 25,
    paddingVertical: 14,
    gap: 6,
  },
  saveDraftText: {
    color: '#FF3B5C',
    fontSize: 16,
    fontWeight: '600',
  },
  postButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FF3B5C',
    borderRadius: 25,
    paddingVertical: 14,
    gap: 6,
  },
  postButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    minHeight: 300,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#333',
  },
  modalSubtext: {
    fontSize: 14,
    color: '#999',
    marginBottom: 20,
  },
  modalButton: {
    backgroundColor: '#FF3B5C',
    borderRadius: 25,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 20,
  },
  modalButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  privacyOption: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  privacyOptionText: {
    fontSize: 16,
    color: '#333',
  },
});

export default EditImageScreen;