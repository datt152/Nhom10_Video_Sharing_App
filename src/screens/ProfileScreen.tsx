import React, { useCallback, useEffect, useState } from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { useUser } from '../hooks/useUser';
import { useFollower } from '../hooks/useFollowers';
import { useImage } from '../hooks/useImage';
import ProfileImageList from './profileTab/ProfileImageList';

const ProfileScreen: React.FC = () => {
  const [menu, setMenu] = useState<'images' | 'liked'>('images');
  const [privacy, setPrivacy] = useState<'public' | 'private'>('public');
  const [likedTab, setLikedTab] = useState<'likedImages'>('likedImages');

  const { publicImages, privateImages, loading: imageLoading, refresh: loadImages } = useImage();
  const [loadingContent, setLoadingContent] = useState(false);
  const navigation: any = useNavigation();
  const { currentUser, loadUser, loading: userLoading } = useUser();
  const { followerCount, followingCount, loading: followerLoading } = useFollower();

  const isLoading = userLoading || followerLoading;

  const fetchProfileContent = useCallback(async () => {
    if (!currentUser) return;
    setLoadingContent(true);
    await loadImages();
    setLoadingContent(false);
  }, [currentUser]);

  useEffect(() => {
    loadImages();
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadUser();
      fetchProfileContent();
    }, [])
  );

  const renderContent = () => {
    if (menu === 'images') {
      return (
        <>
          <View style={styles.privacyMenu}>
            <TouchableOpacity onPress={() => setPrivacy('public')}>
              <Text style={[styles.privacyText, privacy === 'public' && styles.activePrivacy]}>
                Công khai
              </Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => setPrivacy('private')}>
              <Text style={[styles.privacyText, privacy === 'private' && styles.activePrivacy]}>
                Riêng tư
              </Text>
            </TouchableOpacity>
          </View>

          <View style={styles.contentBox}>
            <ProfileImageList
              images={privacy === 'public' ? publicImages : privateImages}
              privacy={privacy}
              loading={loadingContent || imageLoading}
            />
          </View>
        </>
      );
    }

    // Tab yêu thích (tạm placeholder)
    return (
      <View style={styles.contentBox}>
        <Text style={styles.contentText}>🖼️ Danh sách hình ảnh bạn đã thích</Text>
      </View>
    );
  };

  if (isLoading || !currentUser) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color="#FF4EB8" />
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      {/* Thông tin người dùng */}
      <View style={styles.profileTop}>
        <View style={styles.avatarWrapper}>
          <Image source={{ uri: currentUser.avatar }} style={styles.avatar} />
          <TouchableOpacity style={styles.addIcon}>
            <Ionicons name="add" size={16} color="#fff" />
          </TouchableOpacity>
        </View>

        <Text style={styles.name} numberOfLines={1}>
          {currentUser.fullname}
        </Text>
        <Text style={styles.username}>@{currentUser.username}</Text>
        <Text style={styles.username}>{currentUser.bio}</Text>

        {/* Follow / Follower / Like */}
        <View style={styles.statsRow}>
          <TouchableOpacity
            style={styles.statItem}
            onPress={() => navigation.navigate('Followers', { tab: 'following' })}
          >
            <Text style={styles.statValue}>{followingCount}</Text>
            <Text style={styles.statLabel}>Following</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.statItem}
            onPress={() => navigation.navigate('Followers', { tab: 'followers' })}
          >
            <Text style={styles.statValue}>{followerCount}</Text>
            <Text style={styles.statLabel}>Follower</Text>
          </TouchableOpacity>

          <View style={styles.statItem}>
            <Text style={styles.statValue}>{currentUser.likes}</Text>
            <Text style={styles.statLabel}>Like</Text>
          </View>
        </View>

        <TouchableOpacity
          style={styles.editBtn}
          onPress={() => navigation.navigate('EditProfile' as never)}
        >
          <Ionicons name="pencil-outline" size={16} color="#333" />
          <Text style={styles.editText}>Sửa hồ sơ</Text>
        </TouchableOpacity>
      </View>

      {/* Menu chính */}
      <View style={styles.menu}>
        <TouchableOpacity onPress={() => setMenu('images')}>
          <Text style={[styles.menuText, menu === 'images' && styles.activeMenu]}>Image</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => setMenu('liked')}>
          <Text style={[styles.menuText, menu === 'liked' && styles.activeMenu]}>Like</Text>
        </TouchableOpacity>
      </View>

      {/* Nội dung */}
      {renderContent()}
    </ScrollView>
  );
};

export default ProfileScreen;

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  profileTop: {
    alignItems: 'center',
    paddingTop: 25,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    paddingBottom: 15,
  },
  avatarWrapper: { position: 'relative' },
  avatar: { width: 100, height: 100, borderRadius: 100 },
  addIcon: {
    position: 'absolute',
    bottom: 0,
    right: 5,
    backgroundColor: '#FF4EB8',
    borderRadius: 50,
    padding: 3,
  },
  name: {
    fontSize: 18,
    fontWeight: '600',
    marginTop: 8,
    maxWidth: '80%',
    textAlign: 'center',
    color: '#333',
  },
  username: { fontSize: 14, color: '#999', marginTop: 2 },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 10,
    gap: 20,
  },
  statItem: { alignItems: 'center' },
  statValue: { fontSize: 16, fontWeight: '700', color: '#333' },
  statLabel: { fontSize: 13, color: '#777' },
  editBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f2f2f2',
    borderRadius: 6,
    paddingHorizontal: 10,
    paddingVertical: 5,
    marginTop: 10,
  },
  editText: { fontSize: 13, color: '#333', marginLeft: 4 },
  menu: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: '#eee',
    paddingVertical: 10,
  },
  menuText: { fontSize: 15, color: '#777' },
  activeMenu: { color: '#FF4EB8', fontWeight: '600' },
  privacyMenu: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 10,
    marginBottom: 8,
    gap: 20,
  },
  privacyText: { fontSize: 14, color: '#888' },
  activePrivacy: { color: '#FF4EB8', fontWeight: '600' },
  contentBox: { alignItems: 'center', paddingVertical: 20 },
  contentText: { fontSize: 15, color: '#777', marginTop: 10 },
});
