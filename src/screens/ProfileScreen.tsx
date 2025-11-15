
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
import { useVideo } from '../hooks/useVideo';
import ProfileVideoList from './profileTab/ProfileVideoList';
import { Video } from 'expo-av';

const ProfileScreen: React.FC = () => {
  const [menu, setMenu] = useState<'videos' | 'images' | 'liked'>('images');
  const [privacy, setPrivacy] = useState<'public' | 'private'>('public');
  const [likedVideo, setLikedVideo] = useState<'videos' | 'images'>('images');
  const [loadingContent, setLoadingContent] = useState(false);

  const navigation: any = useNavigation();
  const { currentUser, loadUser, loading: userLoading } = useUser();
  const {
    followerCount: hookFollowerCount,
    followingCount: hookFollowingCount,
    loading: followerLoading,
    refreshFollowers,
    refreshFollowing,
  } = useFollower(currentUser?.id);
  // ✅ Nếu là profile của chính mình → lấy từ currentUser
  const followerCount =
    currentUser?.followerIds?.length ??
    hookFollowerCount ??
    0;

  const followingCount =
    currentUser?.followingIds?.length ??
    hookFollowingCount ??
    0;

  const [loadingFollowers, setLoadingFollowers] = useState(false);
  const [loadingFollowing, setLoadingFollowing] = useState(false);
  const { publicImages, privateImages, loading: imageLoading, refresh: loadImages, getPublicImagesLikedByUser } = useImage();
  const { loading: videoLoading, loadVideosByUser, getPublicVideosLikedByUser } = useVideo();

  const [userVideos, setUserVideos] = useState<any[]>([]);

  // ⚡ Trong ProfileScreen
  useEffect(() => {
    if (!currentUser?.id) return;

    const loadData = async () => {
      setLoadingContent(true);
      try {
        const vids = await loadVideosByUser(currentUser.id);
        setUserVideos(Array.isArray(vids) ? vids : []);
        await loadImages();
      } catch (err) {
        console.error('❌ Error loading profile data:', err);
      } finally {
        setLoadingContent(false);
      }
    };

    loadData();
  }, [currentUser?.id]);
  const refreshAll = useCallback(async () => {
    await Promise.all([refreshFollowers(), refreshFollowing()]);
  }, [refreshFollowers, refreshFollowing]);
  useFocusEffect(
    useCallback(() => {
      if (!currentUser?.id) return;

      const refetch = async () => {
        console.log('🔁 Refetching Profile Data...');
        try {
          await Promise.all([
            loadVideosByUser(currentUser.id).then((vids) =>
              setUserVideos(Array.isArray(vids) ? vids : [])
            ),
            loadImages(),
            refreshAll(), // ✅ cập nhật follower/following luôn
          ]);
        } catch (err) {
          console.error('❌ Refetch error:', err);
        }
      };

      refetch();
    }, [currentUser?.id, refreshAll])
  );
  // ⚡ Chỉ refetch khi focus màn hình (ví dụ quay lại từ tab khác)
  useFocusEffect(
    useCallback(() => {
      if (!currentUser?.id) return;

      const refetch = async () => {
        console.log('🔁 Refetching Profile Data...');
        try {
          const vids = await loadVideosByUser(currentUser.id);
          setUserVideos(Array.isArray(vids) ? vids : []);
          await loadImages();
        } catch (err) {
          console.error('❌ Refetch error:', err);
        }
      };

      refetch();
    }, [currentUser?.id])
  );
  const publicVideos = userVideos.filter((v) => v.isPublic);
  const privateVideos = userVideos.filter((v) => !v.isPublic);
  const isLoading = userLoading || followerLoading;

  useEffect(() => {
    console.log("🧩 currentUser:", currentUser);
    console.log("👥 followerCount:", followerCount);
    console.log("➡ followingCount:", followingCount);
  }, [currentUser, followerCount, followingCount]);


  const countTotalLikes = useCallback(() => {
    try {
      const imageLikes = (publicImages || []).reduce(
        (sum, img) => sum + (Array.isArray(img.likedBy) ? img.likedBy.length : 0),
        0
      );
      const videoLikes = (publicVideos || []).reduce(
        (sum, vid) => sum + (Array.isArray(vid.likedBy) ? vid.likedBy.length : 0),
        0
      );
      console.log("🖼 Public Images:", publicImages);
      console.log("🎞 Public Videos:", publicVideos);
      return imageLikes + videoLikes;
    } catch (err) {
      console.error("Error counting likes:", err);
      return 0;
    }
  }, [publicImages, publicVideos]);
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

  // 🧠 Tạo state để lưu dữ liệu
  const [likedImages, setLikedImages] = useState<any[]>([]);
  const [likedVideos, setLikedVideos] = useState<any[]>([]);

  useFocusEffect(
    useCallback(() => {
      const fetchLikedData = async () => {
        const likedImgs = await getPublicImagesLikedByUser();
        const likedVids = await getPublicVideosLikedByUser();
        setLikedImages(likedImgs);
        setLikedVideos(likedVids);
      };

      fetchLikedData();
    }, [])
  );
  const handleLogout = useCallback(async () => {
  try {

    console.log('🚪 Đăng xuất thành công');
    navigation.reset({
      index: 0,
      routes: [{ name: 'Login' }], 
    });
  } catch (err) {
    console.error('❌ Lỗi khi đăng xuất:', err);
  }
}, [navigation]);

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
              <ProfileVideoList
                videos={likedVideos}
                privacy="public"
                loading={videoLoading}
                onPressVideo={(video) => navigation.navigate('VideoScreen', { video })}
              />
            ) : (
              <ProfileImageList
                images={likedImages}
                privacy="public"
                loading={imageLoading}
                onPressImage={(img, index) =>
                  navigation.navigate('UserImageViewer', {
                    images: likedImages,     // ✅ đúng prop name
                    initialIndex: index,     // ✅ đúng dạng index
                  })
                }
              />
            )}
          </View>
        </>
      );
    }
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
      {/* 🔹 Header */}
      <View style={styles.headerGradient}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Hồ sơ</Text>
          <View style={styles.headerActions}>
            <TouchableOpacity 
              style={styles.headerButton}
              onPress={() => navigation.navigate('EditProfile' as never)}
            >
              <Ionicons name="settings-outline" size={20} color="#666" />
            </TouchableOpacity>
            <TouchableOpacity 
              style={styles.headerButton}
              onPress={handleLogout}
            >
              <Ionicons name="log-out-outline" size={20} color="#666" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Avatar và info trên header */}
        <View style={styles.profileHeader}>
          <View style={styles.avatarWrapper}>
            <Image source={{ uri: currentUser.avatar }} style={styles.avatar} />
            <View style={styles.avatarBorder} />
          </View>
          
          <Text style={styles.name}>{currentUser.fullname}</Text>
          <Text style={styles.username}>@{currentUser.username}</Text>
        </View>
      </View>

      {/* Stats Cards */}
      <View style={styles.statsContainer}>
        <TouchableOpacity
          style={styles.statCard}
          onPress={() => navigation.navigate('Followers', { tab: 'following', userId: currentUser.id })}
        >
          <View style={[styles.statIconWrapper, { backgroundColor: '#f5f5f5' }]}>
            <Ionicons name="people-outline" size={22} color="#666" />
          </View>
          <Text style={styles.statValue}>{followingCount}</Text>
          <Text style={styles.statLabel}>Đang theo dõi</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.statCard}
          onPress={() => navigation.navigate('Followers', { tab: 'followers', userId: currentUser.id })}
        >
          <View style={[styles.statIconWrapper, { backgroundColor: '#f5f5f5' }]}>
            <Ionicons name="heart-outline" size={22} color="#666" />
          </View>
          <Text style={styles.statValue}>{followerCount}</Text>
          <Text style={styles.statLabel}>Người theo dõi</Text>
        </TouchableOpacity>

        <View style={styles.statCard}>
          <View style={[styles.statIconWrapper, { backgroundColor: '#f5f5f5' }]}>
            <Ionicons name="thumbs-up-outline" size={22} color="#666" />
          </View>
          <Text style={styles.statValue}>{countTotalLikes()}</Text>
          <Text style={styles.statLabel}>Lượt thích</Text>
        </View>
      </View>

      {/* Bio Section */}
      {currentUser.bio && (
        <View style={styles.bioSection}>
          <View style={styles.sectionHeader}>
            <Ionicons name="document-text-outline" size={20} color="#666" />
            <Text style={styles.sectionTitle}>Tiểu sử</Text>
          </View>
          <Text style={styles.bio}>{currentUser.bio}</Text>
        </View>
      )}

      {/* Liên kết */}
      {Array.isArray(currentUser.externalLinks) && currentUser.externalLinks.length > 0 && (
        <View style={styles.linksSection}>
          <View style={styles.sectionHeader}>
            <Ionicons name="link-outline" size={20} color="#666" />
            <Text style={styles.sectionTitle}>Liên kết</Text>
          </View>
          {currentUser.externalLinks.map((link, index) => (
            <TouchableOpacity
              key={index}
              onPress={() => Linking.openURL(link)}
              style={styles.linkItem}
            >
              <Ionicons name="globe-outline" size={18} color="#4A90E2" />
              <Text style={styles.linkText} numberOfLines={1}>
                {link}
              </Text>
              <Ionicons name="chevron-forward" size={18} color="#ccc" />
            </TouchableOpacity>
          ))}
        </View>
      )}

      {/* Content Tabs */}
      <View style={styles.tabsContainer}>
        <View style={styles.tabsWrapper}>
          {[
            { key: 'videos', icon: 'videocam', label: 'Video' },
            { key: 'images', icon: 'images', label: 'Ảnh' },
            { key: 'liked', icon: 'heart', label: 'Yêu thích' }
          ].map((tab) => (
            <TouchableOpacity 
              key={tab.key} 
              style={[styles.tab, menu === tab.key && styles.activeTab]}
              onPress={() => setMenu(tab.key as any)}
            >
              <Ionicons 
                name={tab.icon as any} 
                size={20} 
                color={menu === tab.key ? '#FF4EB8' : '#999'} 
              />
              <Text style={[styles.tabText, menu === tab.key && styles.activeTabText]}>
                {tab.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Content */}
      {renderContent()}
    </ScrollView>
  );
};

export default ProfileScreen;

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: '#FAFAFA' 
  },
  center: { 
    flex: 1, 
    justifyContent: 'center', 
    alignItems: 'center',
    backgroundColor: '#FAFAFA'
  },
  
  // Header đơn giản
  headerGradient: {
    backgroundColor: '#fff',
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 50,
    paddingBottom: 15,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#333',
  },
  headerActions: {
    flexDirection: 'row',
    gap: 12,
  },
  headerButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#f5f5f5',
    justifyContent: 'center',
    alignItems: 'center',
  },
  
  // Profile Header
  profileHeader: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  avatarWrapper: {
    position: 'relative',
    marginBottom: 12,
  },
  avatar: {
    width: 90,
    height: 90,
    borderRadius: 45,
    borderWidth: 3,
    borderColor: '#FF4EB8',
  },
  avatarBorder: {
    position: 'absolute',
    width: 98,
    height: 98,
    borderRadius: 49,
    borderWidth: 1,
    borderColor: '#FFE5F2',
    top: -4,
    left: -4,
  },
  name: {
    fontSize: 18,
    fontWeight: '700',
    color: '#333',
    marginBottom: 4,
  },
  username: {
    fontSize: 14,
    color: '#999',
    fontWeight: '500',
  },
  
  // Stats Cards - tone màu nhẹ hơn
  statsContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    gap: 10,
    marginTop: 16,
    marginBottom: 16,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 14,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#f0f0f0',
  },
  statIconWrapper: {
    width: 42,
    height: 42,
    borderRadius: 21,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  statValue: {
    fontSize: 18,
    fontWeight: '700',
    color: '#333',
    marginBottom: 2,
  },
  statLabel: {
    fontSize: 11,
    color: '#999',
    textAlign: 'center',
  },
  
  // Bio Section
  bioSection: {
    backgroundColor: '#fff',
    marginHorizontal: 16,
    marginBottom: 12,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#f0f0f0',
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
    gap: 6,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#333',
  },
  bio: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
  
  // Links Section
  linksSection: {
    backgroundColor: '#fff',
    marginHorizontal: 16,
    marginBottom: 12,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#f0f0f0',
  },
  linkItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#f5f5f5',
    gap: 10,
  },
  linkText: {
    flex: 1,
    color: '#4A90E2',
    fontSize: 13,
    fontWeight: '500',
  },
  
  // Tabs - đơn giản hơn
  tabsContainer: {
    backgroundColor: '#fff',
    marginHorizontal: 16,
    marginBottom: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#f0f0f0',
    overflow: 'hidden',
  },
  tabsWrapper: {
    flexDirection: 'row',
    padding: 6,
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    borderRadius: 8,
    gap: 5,
  },
  activeTab: {
    backgroundColor: '#f5f5f5',
  },
  tabText: {
    fontSize: 13,
    color: '#999',
    fontWeight: '500',
  },
  activeTabText: {
    color: '#FF4EB8',
    fontWeight: '600',
  },
  
  // Privacy Menu
  privacyMenu: {
    flexDirection: 'row',
    justifyContent: 'center',
    backgroundColor: '#fff',
    marginHorizontal: 16,
    marginBottom: 12,
    borderRadius: 10,
    padding: 6,
    gap: 6,
    borderWidth: 1,
    borderColor: '#f0f0f0',
  },
  privacyText: {
    fontSize: 13,
    color: '#999',
    paddingHorizontal: 18,
    paddingVertical: 8,
    borderRadius: 6,
  },
  activePrivacy: {
    color: '#FF4EB8',
    fontWeight: '600',
    backgroundColor: '#f5f5f5',
  },
  
  // Content
  contentBox: {
    paddingHorizontal: 16,
    paddingBottom: 20,
  },

});
