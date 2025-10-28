import React, { useCallback, useEffect, useState } from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  Linking,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { useUser } from '../hooks/useUser';
import { useFollower } from '../hooks/useFollowers';
import { useImage } from '../hooks/useImage';
import ProfileImageList from './profileTab/ProfileImageList';
import { CURRENT_USER_ID, useVideo } from '../hooks/useVideo';
import ProfileVideoList from './profileTab/ProfileVideoList';
const ProfileScreen: React.FC = () => {
  const [menu, setMenu] = useState<'videos' | 'images' | 'liked'>('images');
  const [privacy, setPrivacy] = useState<'public' | 'private'>('public');
  const [likedVideo, setLikedVideo] = useState<'videos' | 'images'>('images');
  const [likedTab, setLikedTab] = useState<'likedImages' | 'likedVideos'>('likedImages');

  const { publicImages, privateImages, loading: imageLoading, refresh: loadImages } = useImage();
  const [loadingContent, setLoadingContent] = useState(false);
  const navigation: any = useNavigation();
  const { currentUser, loadUser, loading: userLoading } = useUser();
  const { followerCount, followingCount, loading: followerLoading } = useFollower();

  const isLoading = userLoading || followerLoading;
  const { videos, loading: videoLoading, loadVideosByUser } = useVideo();

  const publicVideos = videos.filter((v) => v.isPublic === true);
  const privateVideos = videos.filter((v) => v.isPublic === false);
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
    // 🖼 TAB HÌNH ẢNH
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

    // 🎬 TAB VIDEO
    if (menu === 'videos') {
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
            <ProfileVideoList
              videos={privacy === 'public' ? publicVideos : privateVideos}
              privacy={privacy}
              loading={loadingContent || videoLoading}
            />
          </View>
        </>
      );
    }

    // ❤️ TAB LIKE
    if (menu === 'liked') {
      // lọc video & hình mà user đã like
      const likedVideos = videos.filter((v) => v.likedBy?.includes(CURRENT_USER_ID));
      const likedImages = [...publicImages, ...privateImages].filter((img) =>
        img.likeBy?.includes(CURRENT_USER_ID)
      );

      return (
        <>
          <View style={styles.privacyMenu}>
            <TouchableOpacity onPress={() => setLikedVideo('videos')}>
              <Text style={[styles.privacyText, likedVideo === 'videos' && styles.activePrivacy]}>
                Videos
              </Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => setLikedVideo('images')}>
              <Text style={[styles.privacyText, likedVideo === 'images' && styles.activePrivacy]}>
                Images
              </Text>
            </TouchableOpacity>
          </View>

          <View style={styles.contentBox}>
            {likedVideo === 'videos' ? (
              <ProfileVideoList
                videos={privacy === 'public' ? publicVideos : privateVideos}
                privacy={privacy}
                loading={loadingContent || videoLoading}
              />
            ) : (
              <ProfileImageList
                images={privacy === 'public' ? publicImages : privateImages}
                privacy={privacy}
                loading={loadingContent || imageLoading}
              />
            )}
          </View>
        </>
      );
    }

    // 🔹 Mặc định (fallback)
    return (
      <View style={styles.contentBox}>
        <Text style={styles.contentText}>Không có nội dung hiển thị</Text>
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
        {/* Liên kết khác */}
        {Array.isArray(currentUser.externalLinks) && currentUser.externalLinks.length > 0 && (
          <View style={styles.linkContainer}>
          
            {currentUser.externalLinks.map((link, index) => (
              <TouchableOpacity
                key={index}
                onPress={() => Linking.openURL(link)}
                style={styles.linkItem}
              >
                <Ionicons name="link-outline" size={18} color="#007AFF" style={styles.linkIcon} />
                <Text style={styles.linkText} numberOfLines={1}>
                  {link}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        )}

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
        <TouchableOpacity onPress={() => setMenu('videos')}>
          <Text style={[styles.menuText, menu === 'videos' && styles.activeMenu]}>Video</Text>
        </TouchableOpacity>
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
  linkContainer: {
    marginTop: 2,
    marginLeft:100,
    alignSelf: 'center',
    width: '100%',
    backgroundColor: '#fff',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#ffffff',
    shadowColor: '#ffffff',
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
    alignContent:"center"
  },

  linkTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
    textAlign: 'left', // hoặc 'center' nếu muốn canh giữa
  },

  linkItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 5,
    paddingHorizontal: 5,
    borderRadius: 8,
    marginBottom: 6,
  },

  linkIcon: {
    marginRight: 8,
  },

  linkText: {
    flex: 1,
    fontSize: 13,
    color: '#007AFF',
    textDecorationLine: 'underline',
  },

});
