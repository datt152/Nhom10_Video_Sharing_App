import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Image,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  Switch,
  Modal,
  Animated,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import axios from 'axios';

import {API_BASE_URL, CLOUDINARY_CLOUD_NAME, CLOUDINARY_UPLOAD_PRESET} from '../types/config';
import ErrorBox from '../components/ErrorBox';
import { useUser } from '../hooks/useUser';

interface SuccessBoxProps {
  message: string;
  onClose: () => void;
}

const SuccessBox: React.FC<SuccessBoxProps> = ({ message, onClose }) => {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (!message) return;

    fadeAnim.setValue(0);
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 200,
      useNativeDriver: true,
    }).start();

    if (timerRef.current) clearTimeout(timerRef.current);

    timerRef.current = setTimeout(() => {
      handleClose();
    }, 2000);

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [message]);

  const handleClose = () => {
    Animated.timing(fadeAnim, {
      toValue: 0,
      duration: 200,
      useNativeDriver: true,
    }).start(() => onClose());
  };

  if (!message) return null;

  return (
    <Animated.View style={[successBoxStyles.container, { opacity: fadeAnim }]}>
      <Ionicons name="checkmark-circle" size={24} color="#fff" style={successBoxStyles.icon} />
      <Text style={successBoxStyles.text}>{message}</Text>
    </Animated.View>
  );
};

const successBoxStyles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 50,
    alignSelf: 'center',
    backgroundColor: '#27ae60',
    borderRadius: 10,
    paddingVertical: 12,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
    minWidth: '85%',
    zIndex: 9999,
  },
  icon: {
    marginRight: 8,
  },
  text: {
    color: '#fff',
    flex: 1,
    fontSize: 14,
    fontWeight: '600',
  },
});

// Main component
const EditImageScreen: React.FC = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { imageUri } = route.params as { imageUri: string };
  const { currentUser } = useUser(); // 👈 Di chuyển lên đây

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [hashtags, setHashtags] = useState<string[]>([]);
  const [hashtagInput, setHashtagInput] = useState('');
  const [taggedPeople, setTaggedPeople] = useState<any[]>([]);
  const [commentsEnabled, setCommentsEnabled] = useState(true);
  const [whoCanWatch, setWhoCanWatch] = useState('Công khai');
  
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [showPrivacyModal, setShowPrivacyModal] = useState(false);
  
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const uploadToCloudinary = async (imageUri: string): Promise<string | null> => {
    try {
      const response = await fetch(imageUri);
      const imageBlob = await response.blob();
      const fileName = imageUri.split('/').pop() || `image_${Date.now()}.jpg`;

      const formData = new FormData();
      formData.append('file', imageBlob || fileName);
      formData.append('upload_preset', CLOUDINARY_UPLOAD_PRESET);
      formData.append('cloud_name', CLOUDINARY_CLOUD_NAME);

      return new Promise((resolve, reject) => {
        const xhr = new XMLHttpRequest();

        xhr.upload.addEventListener('progress', (event) => {
          if (event.lengthComputable) {
            const progress = (event.loaded / event.total) * 100;
            setUploadProgress(Math.round(progress));
          }
        });

        xhr.addEventListener('load', () => {
          if (xhr.status === 200) {
            try {
              const data = JSON.parse(xhr.responseText);
              if (data.secure_url) {
                resolve(data.secure_url);
              } else {
                reject(new Error('Không nhận được URL ảnh từ Cloudinary'));
              }
            } catch (error) {
              reject(new Error('Lỗi xử lý dữ liệu từ Cloudinary'));
            }
          } else {
            try {
              const errorData = JSON.parse(xhr.responseText);
              reject(new Error(errorData.error?.message || 'Upload thất bại'));
            } catch {
              reject(new Error(`Lỗi upload: ${xhr.status}`));
            }
          }
        });

        xhr.addEventListener('error', () => {
          reject(new Error('Lỗi kết nối mạng'));
        });

        xhr.addEventListener('abort', () => {
          reject(new Error('Upload bị hủy'));
        });

        xhr.open('POST', `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`);
        xhr.send(formData);
      });

    } catch (error: any) {
      console.error('Upload error:', error);
      return null;
    }
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
      setErrorMessage('Vui lòng nhập tiêu đề cho ảnh của bạn');
      return;
    }

    if (!description.trim()) {
      setErrorMessage('Vui lòng nhập mô tả cho ảnh của bạn');
      return;
    }

    // 👇 Kiểm tra currentUser trước khi sử dụng
    if (!currentUser) {
      setErrorMessage('Vui lòng đăng nhập để đăng bài');
      return;
    }

    setUploading(true);
    setUploadProgress(0);

    try {
      const imageUrl = await uploadToCloudinary(imageUri);

      if (!imageUrl) {
        throw new Error('Không thể tải ảnh lên Cloudinary');
      }

      // 👇 Xác định privacy mapping
      let privacyValue = 'Public';
      let isPublicValue = true;
      
      if (whoCanWatch === 'Bạn bè') {
        privacyValue = 'Friends';
        isPublicValue = false;
      } else if (whoCanWatch === 'Riêng tư') {
        privacyValue = 'Private';
        isPublicValue = false;
      }

      const newImagePost = {
        id: `i${Date.now()}`,
        imageUrl,
        title: title.trim(),
        caption: description.trim(),
        tags: hashtags,
        taggedUsers: taggedPeople.map(p => p.id),
        commentsEnabled,
        isPublic: isPublicValue,
        privacy: privacyValue,
        createdAt: new Date().toISOString(),
        user: {
          id: currentUser.id, // ✅ An toàn vì đã kiểm tra ở trên
          username: currentUser.username,
          fullname: currentUser.fullname,
          avatar: currentUser.avatar,
        },
        likedBy: [],
        likes: 0,
        isLiked: false,
        commentCount: 0,
      };

      await axios.post(`${API_BASE_URL}/images`, newImagePost);

      setSuccessMessage('🎉 Ảnh của bạn đã được đăng thành công!');
      
      setTimeout(() => {
        navigation.navigate('Main' as never);
      }, 2000);

    } catch (error: any) {
      let errorMsg = 'Không thể đăng bài. Vui lòng thử lại!';
      
      if (error.message.includes('Cloudinary')) {
        errorMsg = 'Lỗi khi tải ảnh lên. Vui lòng kiểm tra kết nối mạng!';
      } else if (error.response) {
        errorMsg = `Lỗi server: ${error.response.status}`;
      } else if (error.message) {
        errorMsg = error.message;
      }
      
      setErrorMessage(errorMsg);
    } finally {
      setUploading(false);
      setUploadProgress(0);
    }
  };

  return (
    <View style={styles.container}>
      <ErrorBox 
        message={errorMessage} 
        onClose={() => setErrorMessage('')} 
      />
      <SuccessBox 
        message={successMessage} 
        onClose={() => setSuccessMessage('')} 
      />

      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="chevron-back" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Đăng bài</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.imageContainer}>
          <Image source={{ uri: imageUri }} style={styles.imagePreview} />
        </View>

        <View style={styles.section}>
          <Text style={styles.label}>Tiêu đề *</Text>
          <TextInput
            style={styles.input}
            placeholder="Nhập tiêu đề"
            placeholderTextColor="#ccc"
            value={title}
            onChangeText={setTitle}
            editable={!uploading}
          />
        </View>

        <View style={styles.section}>
          <Text style={styles.label}>Mô tả *</Text>
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

      <Modal visible={showPrivacyModal} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Ai có thể xem?</Text>
              <TouchableOpacity onPress={() => setShowPrivacyModal(false)}>
                <Ionicons name="close" size={24} color="#333" />
              </TouchableOpacity>
            </View>
            {['Công khai', 'Bạn bè', 'Riêng tư'].map((option) => (
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