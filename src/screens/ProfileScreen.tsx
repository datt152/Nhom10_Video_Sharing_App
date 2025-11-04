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
import { Video } from 'expo-av';

const ProfileScreen: React.FC = () => {
  const [menu, setMenu] = useState<'videos' | 'images' | 'liked'>('images');
  const [privacy, setPrivacy] = useState<'public' | 'private'>('public');
  const [likedVideo, setLikedVideo] = useState<'videos' | 'images'>('images');
  const [loadingContent, setLoadingContent] = useState(false);

  const navigation: any = useNavigation();
  const { currentUser, loadUser, loading: userLoading } = useUser();
  const { followerCount, followingCount, loading: followerLoading } = useFollower();
  const { publicImages, privateImages, loading: imageLoading, refresh: loadImages } = useImage();
  const { videos, loading: videoLoading, loadVideosByUser } = useVideo();

  const [userVideos, setUserVideos] = useState<any[]>([]);

  useEffect(() => {
    if (currentUser?.id) {
      loadVideosByUser(currentUser.id).then(setUserVideos);
    }
  }, [currentUser?.id]);

  const publicVideos = userVideos.filter((v) => v.isPublic);
  const privateVideos = userVideos.filter((v) => !v.isPublic);
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
            {['public', 'private'].map((type) => (
              <TouchableOpacity key={type} onPress={() => setPrivacy(type as any)}>
                <Text style={[styles.privacyText, privacy === type && styles.activePrivacy]}>
                  {type === 'public' ? 'Công khai' : 'Riêng tư'}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <View style={styles.contentBox}>
            <ProfileImageList
              images={privacy === 'public' ? publicImages : privateImages}
              privacy={privacy}
              loading={loadingContent || imageLoading}
              onPressImage={(img, index) =>
                navigation.navigate('UserImageViewer', {
                  images: privacy === 'public' ? publicImages : privateImages,
                  initialIndex: index, // ✅ truyền index thay vì id
                })
              }
            />
          </View>
        </>
      );
    }

    if (menu === 'videos') {
      return (
        <>
          <View style={styles.privacyMenu}>
            {['public', 'private'].map((type) => (
              <TouchableOpacity key={type} onPress={() => setPrivacy(type as any)}>
                <Text style={[styles.privacyText, privacy === type && styles.activePrivacy]}>
                  {type === 'public' ? 'Công khai' : 'Riêng tư'}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <View style={styles.contentBox}>
            <ProfileVideoList
              videos={privacy === 'public' ? publicVideos : privateVideos}
              privacy={privacy}
              loading={loadingContent || videoLoading}
              onPressVideo={(video) => navigation.navigate('VideoScreen', { video })}
            />
          </View>
        </>
      );
    }

    if (menu === 'liked') {
      const likedVideos = videos.filter((v) => v.likedBy?.includes(CURRENT_USER_ID));
      const likedImages = [...publicImages, ...privateImages].filter((img) =>
        img.likeBy?.includes(CURRENT_USER_ID)
      );

      return (
        <>
          <View style={styles.privacyMenu}>
            {['videos', 'images'].map((type) => (
              <TouchableOpacity key={type} onPress={() => setLikedVideo(type as any)}>
                <Text style={[styles.privacyText, likedVideo === type && styles.activePrivacy]}>
                  {type === 'videos' ? 'Videos' : 'Images'}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <View style={styles.contentBox}>
            {likedVideo === 'videos' ? (
              <ProfileVideoList videos={likedVideos} privacy="public" loading={videoLoading} />
            ) : (
              <ProfileImageList
                images={likedImages}
                privacy="public"
                loading={imageLoading}
                onPressImage={(img) =>
                  navigation.navigate('UserVideoViewer', {
                    videos: likedImages,
                    initialVideoId: img.id,
                  })
                }
              />
            )}
          </View>
        </>
      );
    }

    return (
      <View style={styles.contentBox}>
        <Text style={styles.contentText}>Không có nội dung hiển thị</Text>
      </View>
    );
  };

  if (isLoading || !currentUser) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#FF4EB8" />
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Thông tin người dùng */}
      <View style={styles.profileTop}>
        <View style={styles.avatarWrapper}>
          <Image source={{ uri: currentUser.avatar }} style={styles.avatar} />
          <TouchableOpacity style={styles.addIcon}>
            <Ionicons name="add" size={16} color="#fff" />
          </TouchableOpacity>
        </View>

        <Text style={styles.name}>{currentUser.fullname}</Text>
        <Text style={styles.username}>@{currentUser.username}</Text>
        <Text style={styles.bio}>{currentUser.bio}</Text>

        {/* Liên kết */}
        {Array.isArray(currentUser.externalLinks) && currentUser.externalLinks.length > 0 && (
          <View style={styles.linkContainer}>
            {currentUser.externalLinks.map((link, index) => (
              <TouchableOpacity
                key={index}
                onPress={() => Linking.openURL(link)}
                style={styles.linkItem}
              >
                <Ionicons name="link-outline" size={18} color="#FF4EB8" style={styles.linkIcon} />
                <Text style={styles.linkText} numberOfLines={1}>
                  {link}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        )}

        {/* Thống kê */}
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
            <Text style={styles.statLabel}>Likes</Text>
          </View>
        </View>

        <TouchableOpacity
          style={styles.editBtn}
          onPress={() => navigation.navigate('EditProfile' as never)}
        >
          <Ionicons name="pencil-outline" size={16} color="#FF4EB8" />
          <Text style={styles.editText}>Sửa hồ sơ</Text>
        </TouchableOpacity>
      </View>

      {/* Menu chính */}
      <View style={styles.menu}>
        {['videos', 'images', 'liked'].map((type) => (
          <TouchableOpacity key={type} onPress={() => setMenu(type as any)}>
            <Text style={[styles.menuText, menu === type && styles.activeMenu]}>
              {type === 'videos' ? 'Video' : type === 'images' ? 'Image' : 'Like'}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Nội dung */}
      {renderContent()}
    </ScrollView>
  );
};

export default ProfileScreen;

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  profileTop: {
    alignItems: 'center',
    paddingVertical: 25,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  avatarWrapper: { position: 'relative' },
  avatar: { width: 110, height: 110, borderRadius: 100, borderWidth: 2, borderColor: '#FF4EB8' },
  addIcon: {
    position: 'absolute',
    bottom: 0,
    right: 8,
    backgroundColor: '#FF4EB8',
    borderRadius: 50,
    padding: 4,
  },
  name: { fontSize: 18, fontWeight: '700', marginTop: 10, color: '#333' },
  username: { fontSize: 14, color: '#888' },
  bio: { fontSize: 13, color: '#666', marginTop: 5, textAlign: 'center', paddingHorizontal: 20 },
  linkContainer: {
    width: '85%',
    backgroundColor: '#f9f9f9',
    borderRadius: 10,
    paddingVertical: 6,
    marginTop: 10,
  },
  linkItem: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 10, marginVertical: 4 },
  linkIcon: { marginRight: 8 },
  linkText: { color: '#FF4EB8', fontSize: 13, textDecorationLine: 'underline' },
  statsRow: { flexDirection: 'row', justifyContent: 'center', marginTop: 10, gap: 30 },
  statItem: { alignItems: 'center' },
  statValue: { fontSize: 16, fontWeight: '700', color: '#333' },
  statLabel: { fontSize: 13, color: '#777' },
  editBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffe6f3',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 6,
    marginTop: 12,
  },
  editText: { fontSize: 13, color: '#FF4EB8', fontWeight: '600', marginLeft: 5 },
  menu: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    borderBottomWidth: 1,
    borderColor: '#eee',
    paddingVertical: 10,
    marginTop: 10,
  },
  menuText: { fontSize: 15, color: '#777' },
  activeMenu: { color: '#FF4EB8', fontWeight: '700' },
  privacyMenu: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 12,
    gap: 25,
  },
  privacyText: { fontSize: 14, color: '#aaa' },
  activePrivacy: { color: '#FF4EB8', fontWeight: '700' },
  contentBox: { alignItems: 'center', paddingVertical: 20 },
  contentText: { fontSize: 15, color: '#777', marginTop: 10 },
});
