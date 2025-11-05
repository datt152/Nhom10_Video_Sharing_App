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
  Switch,
  Modal,
  FlatList,
} from 'react-native';
import { Video, ResizeMode } from 'expo-av';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute } from '@react-navigation/native';
import axios from 'axios';
import { useUser } from '../hooks/useUser';

const API_BASE_URL = 'http://192.168.1.186:3000';
const CLOUDINARY_CLOUD_NAME = 'daq1jyn28';
const CLOUDINARY_UPLOAD_PRESET = 'vidshare';
const CURRENT_USER_ID = 'u1';

interface TaggedUser {
  id: string;
  username: string;
  fullname: string;
  avatar: string;
}

const EditVideoScreen: React.FC = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { videoUri } = route.params as { videoUri: string };
  const videoRef = useRef<Video>(null);

  const { fetchFriendsList } = useUser();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [hashtags, setHashtags] = useState<string[]>([]);
  const [hashtagInput, setHashtagInput] = useState('');
  const [taggedPeople, setTaggedPeople] = useState<TaggedUser[]>([]);
  const [commentsEnabled, setCommentsEnabled] = useState(true);
  const [whoCanWatch, setWhoCanWatch] = useState('Công khai');
  const [shareToFacebook, setShareToFacebook] = useState(false);
  const [shareToTwitter, setShareToTwitter] = useState(false);
  const [shareToInstagram, setShareToInstagram] = useState(false);

  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [showTagModal, setShowTagModal] = useState(false);
  const [showPrivacyModal, setShowPrivacyModal] = useState(false);

  const [friendsList, setFriendsList] = useState<TaggedUser[]>([]);
  const [loadingFriends, setLoadingFriends] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    if (showTagModal) {
      loadFriends();
    }
  }, [showTagModal]);

  const loadFriends = async () => {
    setLoadingFriends(true);
    try {
      const friends = await fetchFriendsList();
      setFriendsList(friends);
    } catch (error) {
      console.error('Error loading friends:', error);
    } finally {
      setLoadingFriends(false);
    }
  };

  const toggleTagUser = (user: TaggedUser) => {
    const isTagged = taggedPeople.some(p => p.id === user.id);
    
    if (isTagged) {
      setTaggedPeople(taggedPeople.filter(p => p.id !== user.id));
    } else {
      setTaggedPeople([...taggedPeople, user]);
    }
  };

  const removeTag = (userId: string) => {
    setTaggedPeople(taggedPeople.filter(p => p.id !== userId));
  };

  const filteredFriends = friendsList.filter(friend =>
    friend.fullname?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    friend.username?.toLowerCase().includes(searchQuery.toLowerCase())
  );

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
      const cloudinaryUrl = await uploadToCloudinary(videoUri);

      const db = await axios.get(`${API_BASE_URL}/users`);
      const currentUser = db.data.find((u: any) => u.id === CURRENT_USER_ID);

      const newVideo = {
        id: `v${Date.now()}`,
        userId: CURRENT_USER_ID,
        title: title.trim(),
        caption: description.trim(),
        tags: hashtags,
        taggedUsers: taggedPeople.map(p => p.id),
        commentsEnabled,
        privacy: whoCanWatch,
        url: cloudinaryUrl,
        thumbnail: cloudinaryUrl.replace('.mp4', '.jpg'),
        likeCount: 0,
        commentCount: 0,
        shareCount: 0,
        views: 0,
        createdAt: new Date().toISOString(),
        isPublic: whoCanWatch === 'Công khai',
        user: {
          id: currentUser.id,
          username: currentUser.username,
          fullname: currentUser.fullname,
          avatar: currentUser.avatar,
        },
        likedBy: [],
      };

      await axios.post(`${API_BASE_URL}/videos`, newVideo);
      Alert.alert('Thành công! 🎉', 'Video của bạn đã được đăng!', [
        { text: 'OK', onPress: () => navigation.navigate('Main' as never) },
      ]);
    } catch (error) {
      console.error('Upload error:', error);
      Alert.alert('Lỗi', 'Không thể tải video lên');
    } finally {
      setUploading(false);
    }
  };

  const handleSaveDraft = () => {
    Alert.alert('Đã lưu bản nháp', 'Video của bạn đã được lưu dưới dạng bản nháp');
  };

  const renderFriendItem = ({ item }: { item: TaggedUser }) => {
    const isTagged = taggedPeople.some(p => p.id === item.id);

    return (
      <TouchableOpacity
        style={styles.friendItem}
        onPress={() => toggleTagUser(item)}
      >
        <View style={styles.friendLeft}>
          <Image
            source={{ uri: item.avatar || 'https://via.placeholder.com/50' }}
            style={styles.friendAvatar}
          />
          <View style={styles.friendInfo}>
            <Text style={styles.friendName}>{item.fullname || item.username}</Text>
            <Text style={styles.friendUsername}>@{item.username}</Text>
          </View>
        </View>
        
        <View style={styles.friendRight}>
          {isTagged ? (
            <Ionicons name="checkmark-circle" size={24} color="#FF3B5C" />
          ) : (
            <View style={styles.uncheckedCircle} />
          )}
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="chevron-back" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Đăng video</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Video Preview */}
        <View style={styles.videoContainer}>
          <Video
            ref={videoRef}
            source={{ uri: videoUri }}
            style={styles.videoPreview}
            useNativeControls
            shouldPlay={false}
            isLooping={false}
            resizeMode={ResizeMode.CONTAIN}
          />
          
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

            <View style={styles.searchContainer}>
              <Ionicons name="search" size={20} color="#999" />
              <TextInput
                style={styles.searchInput}
                placeholder="Tìm kiếm bạn bè..."
                placeholderTextColor="#999"
                value={searchQuery}
                onChangeText={setSearchQuery}
              />
            </View>

            {loadingFriends ? (
              <ActivityIndicator size="large" color="#FF3B5C" style={{ marginTop: 40 }} />
            ) : (
              <FlatList
                data={filteredFriends}
                renderItem={renderFriendItem}
                keyExtractor={(item) => item.id}
                style={styles.friendsList}
                ListEmptyComponent={
                  <View style={styles.emptyContainer}>
                    <Ionicons name="people-outline" size={60} color="#ccc" />
                    <Text style={styles.emptyText}>
                      {searchQuery ? 'Không tìm thấy' : 'Chưa có bạn bè'}
                    </Text>
                  </View>
                }
              />
            )}

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
  videoContainer: {
    alignItems: 'center',
    marginVertical: 20,
  },
  videoPreview: {
    width: 200,
    height: 280,
    borderRadius: 16,
    backgroundColor: '#000',
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
  taggedList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    paddingHorizontal: 16,
    marginBottom: 12,
  },
  taggedChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFE4EC',
    borderRadius: 20,
    paddingVertical: 6,
    paddingHorizontal: 12,
    gap: 6,
  },
  taggedAvatar: {
    width: 24,
    height: 24,
    borderRadius: 12,
  },
  taggedName: {
    color: '#FF3B5C',
    fontSize: 14,
    fontWeight: '500',
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
    maxHeight: '80%',
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
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8F8F8',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginBottom: 16,
    gap: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    color: '#333',
  },
  friendsList: {
    maxHeight: 400,
  },
  friendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  friendLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  friendAvatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 12,
  },
  friendInfo: {
    flex: 1,
  },
  friendName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  friendUsername: {
    fontSize: 14,
    color: '#999',
    marginTop: 2,
  },
  friendRight: {
    marginLeft: 8,
  },
  uncheckedCircle: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#ddd',
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyText: {
    fontSize: 16,
    color: '#999',
    marginTop: 12,
  },
  modalButton: {
    backgroundColor: '#FF3B5C',
    borderRadius: 25,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 16,
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

export default EditVideoScreen;