import React, { useState, useCallback } from "react";
import {
  View,
  TextInput,
  ScrollView,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Dimensions,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import Header from "../components/Header";
import { useVideo } from "../hooks/useVideo";
import { useImage } from "../hooks/useImage";
import { useNavigation, useFocusEffect } from "@react-navigation/native";
import {CURRENT_USER_ID, Image as ImageType, Video as VideoType} from '../types/database.types'
const { width } = Dimensions.get("window");
const CARD_WIDTH = (width - 45) / 2;

const SearchScreen: React.FC = () => {
  const [query, setQuery] = useState("");
  const [searched, setSearched] = useState(false);
  const [searching, setSearching] = useState(false);
  const [activeTab, setActiveTab] = useState<"videos" | "images" | "users">("videos");

  const [filteredVideos, setFilteredVideos] = useState<any[]>([]);
  const [filteredImages, setFilteredImages] = useState<any[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<any[]>([]);

  const { videos, loading: loadingVideos } = useVideo();
  const { publicImages, loading: loadingImages } = useImage();
  const navigation: any = useNavigation();

  // Reset khi quay lại trang
  useFocusEffect(
    useCallback(() => {
      setQuery("");
      setSearched(false);
      setSearching(false);
      setActiveTab("videos");
    }, [])
  );

  const handleSearch = () => {
    const trimmed = query.trim();
    setSearched(true);

    if (!trimmed) {
      setFilteredVideos([]);
      setFilteredImages([]);
      setFilteredUsers([]);
      return;
    }

    setSearching(true);

    setTimeout(() => {
      const q = trimmed.toLowerCase();

      // 🎬 Tìm video
      const matchedVideos = videos.filter(
        (v) =>
          v.title?.toLowerCase().includes(q) ||
          v.user?.fullname?.toLowerCase().includes(q) ||
          v.user?.username?.toLowerCase().includes(q) ||
          (Array.isArray(v.tags) && v.tags.join(" ").toLowerCase().includes(q))
      );

      const matchedImages = publicImages.filter((img) => {
  const captionMatch = img.caption?.toLowerCase().includes(q);
  const userMatch =
    img.user &&
    (img.user.fullname?.toLowerCase().includes(q) ||
      img.user.username?.toLowerCase().includes(q));
  return captionMatch || userMatch;
});


    
      setFilteredVideos(matchedVideos);
      console.log(matchedImages);
      console.log(matchedVideos);
      
      
      setFilteredImages(matchedImages);

      setSearching(false);
    }, 200);
  };

  // Render từng phần
  const renderVideoCard = (v: VideoType, i: number) => (
    <TouchableOpacity
      key={v.id || i}
      onPress={() => navigation.getParent()?.navigate("VideoCard", { id: v.id })}
      style={styles.card}
    >
      <Image
        source={{ uri: v.thumbnail || `https://picsum.photos/400/250?random=${i}` }}
        style={styles.thumb}
      />
      <View style={styles.cardBottom}>
        <Image source={{ uri: v.user?.avatar }} style={styles.avatar} />
        <View style={{ flex: 1 }}>
          <Text style={styles.videoTitle} numberOfLines={2}>{v.title}</Text>
          <Text style={styles.username} numberOfLines={1}>
            {v.user?.fullname || v.user?.username}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  const renderImageCard = (img: ImageType, i: number) => (
  <TouchableOpacity key={img.id || i} style={styles.card}
  onPress={() => navigation.navigate('UserImageViewer', {
    images: [img],
    initialIndex: 0,
    CURRENT_USER_ID
  })}>
    <Image
      source={{ uri: img.imageUrl?.trim() || `https://picsum.photos/400/250?random=${i}` }}
      style={styles.thumb}
      resizeMode="cover"
    />
    <View style={styles.cardBottom}>
      <Image
        source={{ uri: img.user?.avatar?.trim() || 'https://picsum.photos/50' }}
        style={styles.avatar}
      />
      <View style={{ flex: 1 }}>
        <Text style={styles.videoTitle} numberOfLines={2}>
          {img.caption || "Untitled"}
        </Text>
        <Text style={styles.username} numberOfLines={1}>
          {img.user?.fullname || img.user?.username || "Unknown"}
        </Text>
      </View>
    </View>
  </TouchableOpacity>
);


  const renderUserCard = (u: any, i: number) => (
    <TouchableOpacity  onPress={() => navigation.navigate('Profile', { userId: u.id })} key={u.id || i} style={styles.userCard}>
      <Image source={{ uri: u.avatar }} style={styles.userAvatar} />
      <View>
        <Text style={styles.videoTitle}>{u.fullname}</Text>
        <Text style={styles.username}>@{u.username}</Text>
      </View>
 </TouchableOpacity>
    
  );

  const isLoading = loadingVideos || loadingImages || searching;

  return (
    <View style={styles.container}>
      <Header />
      <View style={styles.searchBox}>
        <Ionicons name="search" size={22} color="#FF4EB8" />
        <TextInput
          placeholder="Search videos, users, images, or tags..."
          style={styles.input}
          value={query}
          onChangeText={setQuery}
          onSubmitEditing={handleSearch}
          returnKeyType="search"
        />
        <TouchableOpacity onPress={handleSearch}>
          <Ionicons name="arrow-forward-circle" size={26} color="#FF4EB8" />
        </TouchableOpacity>
      </View>

      {isLoading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color="#FF4EB8" />
        </View>
      ) : !searched ? (
        <ScrollView>
          <Text style={styles.sectionTitle}>Trending Tags</Text>
          <View style={styles.tagsRow}>
            {["#Dance", "#Travel", "#Food", "#DIY", "#Study"].map((tag, i) => (
              <Text key={i} style={styles.tag}>{tag}</Text>
            ))}
          </View>
          <Text style={styles.sectionTitle}>Popular Videos</Text>
          <View style={styles.grid}>
            {videos.slice(0, 6).map((v, i) => renderVideoCard(v, i))}
          </View>
        </ScrollView>
      ) : (
        <View style={{ flex: 1 }}>
          {/* Tabs */}
          <View style={styles.tabRow}>
            {["videos", "images"].map((tab) => (
              <TouchableOpacity
                key={tab}
                onPress={() => setActiveTab(tab as any)}
                style={[
                  styles.tab,
                  activeTab === tab && styles.activeTab,
                ]}
              >
                <Text
                  style={[
                    styles.tabText,
                    activeTab === tab && styles.activeTabText,
                  ]}
                >
                  {tab.toUpperCase()}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <ScrollView showsVerticalScrollIndicator={false}>
  {activeTab === "videos" && (
    <View style={styles.grid}>
      {filteredVideos.length > 0 ? (
        filteredVideos.map(renderVideoCard)
      ) : (
        <Text style={styles.noResultText}>No videos found</Text>
      )}
    </View>
  )}
  {activeTab === "images" && (
    <View style={styles.grid}>
      {filteredImages.length > 0 ? (
        filteredImages.map(renderImageCard)
      ) : (
        <Text style={styles.noResultText}>No images found</Text>
      )}
    </View>
  )}
  {activeTab === "users" && (
    <View style={{ margin: 20 }}>
      {filteredUsers.length > 0 ? (
        filteredUsers.map(renderUserCard)
      ) : (
        <Text style={styles.noResultText}>No users found</Text>
      )}
    </View>
  )}
</ScrollView>

        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },
  searchBox: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F8F8F8",
    margin: 20,
    borderRadius: 12,
    paddingHorizontal: 10,
  },
  input: { flex: 1, padding: 8 },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    marginHorizontal: 20,
    marginTop: 15,
    color: "#111",
  },
  tagsRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginHorizontal: 20,
    marginVertical: 10,
  },
  tag: {
    color: "#FF4EB8",
    backgroundColor: "#FFE6F2",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 15,
    margin: 5,
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    marginHorizontal: 15,
  },
  card: {
    width: CARD_WIDTH,
    backgroundColor: "#fafafa",
    borderRadius: 12,
    overflow: "hidden",
    marginBottom: 15,
  },
  thumb: { width: "100%", height: 150 },
  cardBottom: {
    flexDirection: "row",
    alignItems: "center",
    padding: 8,
  },
  avatar: { width: 30, height: 30, borderRadius: 15, marginRight: 8 },
  videoTitle: { fontWeight: "600", color: "#222", fontSize: 14 },
  username: { color: "#666", fontSize: 12 },
  center: { flex: 1, justifyContent: "center", alignItems: "center", marginTop: 40 },
  tabRow: {
    flexDirection: "row",
    justifyContent: "space-around",
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderColor: "#eee",
  },
  tab: { paddingVertical: 6, paddingHorizontal: 10 },
  activeTab: { borderBottomWidth: 2, borderColor: "#FF4EB8" },
  tabText: { color: "#777", fontWeight: "500" },
  activeTabText: { color: "#FF4EB8", fontWeight: "600" },
  userCard: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
    backgroundColor: "#F9F9F9",
    borderRadius: 10,
    padding: 10,
  },
  userAvatar: { width: 45, height: 45, borderRadius: 22.5, marginRight: 10 },
  noResultText: {
  width: "100%",
  textAlign: "center",
  marginTop: 30,
  fontSize: 16,
  color: "#888",
}

});

export default SearchScreen;
