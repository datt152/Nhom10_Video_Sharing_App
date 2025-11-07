import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  Image,
  Alert,
  ScrollView,
  ActivityIndicator,
  Platform,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import { useNavigation } from "@react-navigation/native";
import { useUser } from "../hooks/useUser"; // 👉 nhớ chỉnh lại đường dẫn nếu khác
import {CLOUDINARY_CLOUD_NAME, CLOUDINARY_UPLOAD_PRESET} from '../types/config'

const EditProfileScreen = () => {
  const navigation = useNavigation();
  const { currentUser, updateUser } = useUser();

  const [avatar, setAvatar] = useState("https://i.pravatar.cc/150");
  const [name, setName] = useState("");
  const [bio, setBio] = useState("");
  const [link, setLink] = useState("");
  const [externalLinks, setExternalLinks] = useState<string[]>([]);
  const [isUploading, setIsUploading] = useState(false);

  // 🧠 Khi user load xong thì gán vào form
  useEffect(() => {
    if (currentUser) {
      setAvatar(currentUser.avatar || "https://i.pravatar.cc/150");
      setName(currentUser.fullname || "");
      setBio(currentUser.bio || "");
      setLink(`https://sharing.com/@${currentUser.username}`);
      setExternalLinks(currentUser.externalLinks || []);
    }
  }, [currentUser]);

  // 📤 Upload ảnh lên Cloudinary
  const uploadToCloudinary = async (imageUri: string): Promise<string | null> => {
    try {
      setIsUploading(true);

      let imageBlob: Blob;

      // Nếu là web, URI sẽ là blob URL hoặc data URL
      if (Platform.OS === 'web') {
        const response = await fetch(imageUri);
        imageBlob = await response.blob();
      } else {
        // Mobile: Fetch file từ URI
        const response = await fetch(imageUri);
        imageBlob = await response.blob();
      }

      const formData = new FormData();
      formData.append('file', imageBlob || '');
      formData.append('upload_preset', CLOUDINARY_UPLOAD_PRESET);
      formData.append('cloud_name', CLOUDINARY_CLOUD_NAME);

      const uploadResponse = await fetch(
        `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`,
        {
          method: 'POST',
          body: formData,
        }
      );

      const data = await uploadResponse.json();

      if (!uploadResponse.ok) {
        console.error('Cloudinary error response:', data);
        throw new Error(data.error?.message || 'Upload failed');
      }

      if (data.secure_url) {
        return data.secure_url;
      } else {
        throw new Error('No secure_url in response');
      }
    } catch (error) {
      console.error('Cloudinary upload error:', error);
      Alert.alert('❌ Lỗi', 'Không thể tải ảnh lên. Vui lòng thử lại!');
      return null;
    } finally {
      setIsUploading(false);
    }
  };

  // 📸 Chọn ảnh
  const pickImage = async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      Alert.alert("Thông báo", "Cần cấp quyền truy cập ảnh!");
      return;
    }
    
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8, // Giảm quality để upload nhanh hơn
    });
    
    if (!result.canceled) {
      const localUri = result.assets[0].uri;
      
      // Hiển thị ảnh local trước (preview)
      setAvatar(localUri);
      
      // Upload lên Cloudinary
      const cloudinaryUrl = await uploadToCloudinary(localUri);
      
      if (cloudinaryUrl) {
        setAvatar(cloudinaryUrl);
        Alert.alert("✅ Thành công", "Tải ảnh lên thành công!");
      } else {
        // Nếu upload thất bại, revert về ảnh cũ
        setAvatar(currentUser?.avatar || "https://i.pravatar.cc/150");
      }
    }
  };

  // ➕ Thêm / xóa / sửa link
  const addLink = () => setExternalLinks([...externalLinks, ""]);
  const removeLink = (index: number) =>
    setExternalLinks(externalLinks.filter((_, i) => i !== index));
  const updateLink = (index: number, text: string) => {
    const updated = [...externalLinks];
    updated[index] = text;
    setExternalLinks(updated);
  };

  // 💾 Lưu thay đổi
  const handleSave = async () => {
    if (isUploading) {
      Alert.alert("⏳ Vui lòng đợi", "Đang tải ảnh lên...");
      return;
    }

    const success = await updateUser({
      fullname: name,
      bio,
      avatar,
      externalLinks,
    });

    if (success) {
      Alert.alert("✅ Thành công", "Cập nhật hồ sơ thành công!");
      navigation.goBack();
    } else {
      Alert.alert("❌ Lỗi", "Không thể cập nhật hồ sơ!");
    }
  };

  return (
    <ScrollView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="#FF4EB8" />
        </TouchableOpacity>
        <Text style={styles.title}>Chỉnh sửa hồ sơ</Text>
        <View style={{ width: 24 }} />
      </View>

      {/* Avatar */}
      <View style={styles.avatarContainer}>
        <Image source={{ uri: avatar }} style={styles.avatar} />
        <TouchableOpacity 
          style={styles.cameraButton} 
          onPress={pickImage}
          disabled={isUploading}
        >
          {isUploading ? (
            <ActivityIndicator size="small" color="#fff" />
          ) : (
            <Ionicons name="camera" size={20} color="#fff" />
          )}
        </TouchableOpacity>
        {isUploading && (
          <Text style={styles.uploadingText}>Đang tải ảnh...</Text>
        )}
      </View>

      {/* Tên hiển thị */}
      <View style={styles.section}>
        <Text style={styles.label}>Tên hiển thị</Text>
        <TextInput
          style={styles.input}
          value={name}
          onChangeText={setName}
          placeholder="Nhập tên hiển thị"
        />
      </View>

      {/* Liên kết hồ sơ */}
      <View style={styles.section}>
        <Text style={styles.label}>Liên kết hồ sơ</Text>
        <TextInput
          style={[styles.input, { color: "#999" }]}
          value={link}
          editable={false}
        />
      </View>

      {/* Tiểu sử */}
      <View style={styles.section}>
        <Text style={styles.label}>Tiểu sử</Text>
        <TextInput
          style={[styles.input, { height: 100 }]}
          multiline
          value={bio}
          onChangeText={setBio}
          placeholder="Giới thiệu về bạn..."
        />
      </View>

      {/* Liên kết khác */}
      <View style={styles.section}>
        <View style={styles.linkHeader}>
          <Text style={styles.label}>Liên kết khác</Text>
          <TouchableOpacity onPress={addLink}>
            <Ionicons name="add-circle" size={22} color="#FF4EB8" />
          </TouchableOpacity>
        </View>

        {externalLinks.map((url, index) => (
          <View key={index} style={styles.linkRow}>
            <TextInput
              style={[styles.input, { flex: 1 }]}
              value={url}
              onChangeText={(text) => updateLink(index, text)}
              placeholder="Nhập đường liên kết..."
              placeholderTextColor="#BFBFBF"
            />
            {externalLinks.length > 1 && (
              <TouchableOpacity
                onPress={() => removeLink(index)}
                style={styles.removeBtn}
              >
                <Ionicons name="close-circle" size={20} color="#FF4EB8" />
              </TouchableOpacity>
            )}
          </View>
        ))}
      </View>

      {/* Lưu thay đổi */}
      <TouchableOpacity 
        style={[styles.saveButton, isUploading && styles.saveButtonDisabled]} 
        onPress={handleSave}
        disabled={isUploading}
      >
        <Text style={styles.saveText}>
          {isUploading ? "Đang tải ảnh..." : "Lưu thay đổi"}
        </Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

export default EditProfileScreen;

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#FAFAFA" },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 15,
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#E5E5E5",
    justifyContent: "space-between",
  },
  title: { fontSize: 18, fontWeight: "bold", color: "#FF4EB8" },

  avatarContainer: { alignItems: "center", marginTop: 25, marginBottom: 10 },
  avatar: { width: 120, height: 120, borderRadius: 60 },
  cameraButton: {
    position: "absolute",
    bottom: 5,
    right: "35%",
    backgroundColor: "#FF4EB8",
    borderRadius: 20,
    padding: 6,
    elevation: 5,
  },
  uploadingText: {
    marginTop: 8,
    fontSize: 12,
    color: "#FF4EB8",
    fontWeight: "500",
  },

  section: {
    backgroundColor: "#fff",
    marginHorizontal: 20,
    marginTop: 15,
    padding: 15,
    borderRadius: 15,
    borderWidth: 1,
    borderColor: "#E5E5E5",
  },
  label: { fontSize: 14, fontWeight: "600", color: "#FF4EB8", marginBottom: 6 },
  input: {
    borderWidth: 1,
    borderColor: "#E5E5E5",
    borderRadius: 10,
    padding: 10,
    fontSize: 14,
    color: "#333",
    backgroundColor: "#FAFAFA",
  },

  linkHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  linkRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    marginBottom: 10,
  },
  removeBtn: { marginLeft: 8 },

  saveButton: {
    backgroundColor: "#FF4EB8",
    margin: 25,
    paddingVertical: 12,
    borderRadius: 25,
    alignItems: "center",
  },
  saveButtonDisabled: {
    backgroundColor: "#FFB3DC",
    opacity: 0.6,
  },
  saveText: { color: "#fff", fontWeight: "600" },
});