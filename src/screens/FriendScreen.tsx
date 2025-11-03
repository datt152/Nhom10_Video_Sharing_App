import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  Image,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  ActivityIndicator,
  TextInput,
  RefreshControl,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation } from '@react-navigation/native';
import { useUser } from '../hooks/useUser';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

type TabType = 'following' | 'followers' | 'suggestions';

interface User {
  id: string;
  username: string;
  name: string;
  avatar: string;
  bio?: string;
  followingIds?: string[];
  followerCount?: number;
  followingCount?: number;
}

const FriendScreen = () => {
  const navigation = useNavigation();
  const {
    currentUser,
    loading: userLoading,
    toggleFollow,
    fetchFollowingList,
    fetchFollowersList,
    fetchSuggestions,
  } = useUser();

  const [activeTab, setActiveTab] = useState<TabType>('following');
  const [userList, setUserList] = useState<User[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  // ✅ Load data dựa trên tab hiện tại
  const loadData = async () => {
    try {
      setLoading(true);
      let data: User[] = [];

      switch (activeTab) {
        case 'following':
          data = await fetchFollowingList();
          break;
        case 'followers':
          data = await fetchFollowersList();
          break;
        case 'suggestions':
          data = await fetchSuggestions();
          break;
      }

      setUserList(data);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  // ✅ Refresh data
  const onRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  // ✅ Load data khi chuyển tab hoặc currentUser thay đổi
  useEffect(() => {
    if (currentUser) {
      loadData();
    }
  }, [activeTab, currentUser]);

  // ✅ Handle Follow/Unfollow
  const handleFollowToggle = async (userId: string) => {
    const success = await toggleFollow(userId);
    if (success) {
      // Reload data để cập nhật list
      await loadData();
    }
  };

  // ✅ Filter list by search query
  const getFilteredList = () => {
    if (!searchQuery.trim()) {
      return userList;
    }

    return userList.filter(
      (user) =>
        user.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.username?.toLowerCase().includes(searchQuery.toLowerCase())
    );
  };

  const filteredList = getFilteredList();

  // ✅ Render User Item
  const renderUserItem = ({ item }: { item: User }) => {
    const followingIds = currentUser?.followingIds || [];
    const isFollowing = followingIds.includes(item.id);

    return (
      <TouchableOpacity
        style={styles.userCard}
        activeOpacity={0.7}
          onPress={() => navigation.navigate('Profile', { userId: item.id })}
      >
        <View style={styles.userCardLeft}>
          <Image
            source={{ uri: item.avatar || 'https://via.placeholder.com/60' }}
            style={styles.userAvatar}
          />
          <View style={styles.userInfo}>
            <Text style={styles.userName}>{item.name || item.username}</Text>
            <Text style={styles.userUsername}>@{item.username}</Text>
            
          </View>
        </View>

        <TouchableOpacity
          style={[
            styles.followButton,
            isFollowing && styles.followingButton,
          ]}
          onPress={() => handleFollowToggle(item.id)}
        >
          <Text
            style={[
              styles.followButtonText,
              isFollowing && styles.followingButtonText,
            ]}
          >
            {isFollowing ? 'Following' : 'Follow'}
          </Text>
        </TouchableOpacity>
      </TouchableOpacity>
    );
  };

  if (userLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#FF3B5C" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <LinearGradient colors={['#fff', '#fff']} style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color="#000" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Friends</Text>
        <View style={{ width: 40 }} />
      </LinearGradient>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <Ionicons
          name="search"
          size={20}
          color="#666"
          style={styles.searchIcon}
        />
        <TextInput
          style={styles.searchInput}
          placeholder="Search friends..."
          placeholderTextColor="#666"
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
        {searchQuery.length > 0 && (
          <TouchableOpacity onPress={() => setSearchQuery('')}>
            <Ionicons name="close-circle" size={20} color="#666" />
          </TouchableOpacity>
        )}
      </View>

      {/* Tabs */}
      {/* Tabs - Version căn giữa hoàn hảo */}
<View style={styles.tabsContainer}>
  <TouchableOpacity
    style={[styles.tab, activeTab === 'following' && styles.activeTab]}
    onPress={() => setActiveTab('following')}
  >
    <View style={styles.tabContent}>
      <Text
        style={[
          styles.tabText,
          activeTab === 'following' && styles.activeTabText,
        ]}
      >
        Following
      </Text>
    </View>
  </TouchableOpacity>

  <TouchableOpacity
    style={[styles.tab, activeTab === 'followers' && styles.activeTab]}
    onPress={() => setActiveTab('followers')}
  >
    <View style={styles.tabContent}>
      <Text
        style={[
          styles.tabText,
          activeTab === 'followers' && styles.activeTabText,
        ]}
      >
        Followers
      </Text>
    </View>
  </TouchableOpacity>

  <TouchableOpacity
    style={[
      styles.tab,
      activeTab === 'suggestions' && styles.activeTab,
    ]}
    onPress={() => setActiveTab('suggestions')}
  >
    <View style={styles.tabContent}>
      <Text
        style={[
          styles.tabText,
          activeTab === 'suggestions' && styles.activeTabText,
        ]}
      >
        Suggestions
      </Text>
      <Ionicons
        name="sparkles"
        size={14}
        color={activeTab === 'suggestions' ? '#FFD700' : '#999'}
        style={{ marginLeft: 4 }}
      />
    </View>
  </TouchableOpacity>
</View>

      {/* List */}
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#FF3B5C" />
        </View>
      ) : (
        <FlatList
          data={filteredList}
          renderItem={renderUserItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor="#FF3B5C"
              colors={['#FF3B5C']}
            />
          }
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Ionicons
                name={
                  activeTab === 'following'
                    ? 'people-outline'
                    : activeTab === 'followers'
                    ? 'heart-outline'
                    : 'person-add-outline'
                }
                size={80}
                color="#333"
              />
              <Text style={styles.emptyText}>
                {searchQuery.trim()
                  ? 'No users found'
                  : activeTab === 'following'
                  ? 'No following yet'
                  : activeTab === 'followers'
                  ? 'No followers yet'
                  : 'No suggestions available'}
              </Text>
              <Text style={styles.emptySubtext}>
                {searchQuery.trim()
                  ? 'Try a different search term'
                  : activeTab === 'suggestions'
                  ? 'Check back later for new suggestions'
                  : 'Start connecting with people'}
              </Text>
            </View>
          }
        />
      )}
    </View>
  );
};

export default FriendScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    shadowColor: '#FF3B5C',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#fff',
    letterSpacing: 0.5,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    marginHorizontal: 16,
    marginTop: 16,
    marginBottom: 16,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 25,
    borderWidth: 1.5,
    borderColor: '#FFE4EC',
    shadowColor: '#FF3B5C',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    color: '#333',
  },
  tabsContainer: {
    flexDirection: 'row',
    backgroundColor: '#FFE4EC',
    marginHorizontal: 16,
    marginBottom: 16,
    borderRadius: 25,
    padding: 4,
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center', // ✅ Đã có rồi
    paddingVertical: 12,
    borderRadius: 20,
    gap: 6,
  },
  activeTab: {
    backgroundColor: '#fff',
    shadowColor: '#FF3B5C',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  tabContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center', // ✅ Thêm dòng này
  },
  tabText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#999',
    textAlign: 'center', // ✅ Thêm dòng này
  },
  activeTabText: {
    color: '#FF3B5C',
    fontWeight: '700',
  },
  tabBadge: {
    backgroundColor: '#FF3B5C',
    borderRadius: 10,
    paddingHorizontal: 8,
    paddingVertical: 2,
    marginLeft: 4,
  },
  tabBadgeText: {
    fontSize: 11,
    color: '#fff',
    fontWeight: '700',
    textAlign: 'center', // ✅ Thêm dòng này
  },
  listContent: {
    paddingHorizontal: 16,
    paddingBottom: 20,
  },
  userCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 20,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#FFE4EC',
    shadowColor: '#FF3B5C',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 2,
  },
  userCardLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  userAvatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    marginRight: 12,
    borderWidth: 2.5,
    borderColor: '#FF3B5C',
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#333',
    marginBottom: 2,
  },
  userUsername: {
    fontSize: 14,
    color: '#999',
    marginBottom: 4,
  },
  userBio: {
    fontSize: 13,
    color: '#666',
    marginBottom: 4,
  },
  userStats: {
    flexDirection: 'row',
    gap: 12,
  },
  userStatText: {
    fontSize: 12,
    color: '#999',
  },
  followButton: {
    backgroundColor: '#FF3B5C',
    paddingHorizontal: 24,
    paddingVertical: 10,
    borderRadius: 20,
    shadowColor: '#FF3B5C',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3,
  },
  followingButton: {
    backgroundColor: '#fff',
    borderWidth: 1.5,
    borderColor: '#FFE4EC',
  },
  followButtonText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#fff',
  },
  followingButtonText: {
    color: '#999',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 100,
  },
  emptyIconCircle: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#FFE4EC',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginTop: 16,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#999',
    marginTop: 8,
  },
  tabCount: {
    fontSize: 11,
    color: '#fff',
    marginLeft: 4,
    opacity: 0.7,
  },
});