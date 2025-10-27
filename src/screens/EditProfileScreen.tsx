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
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import { useNavigation } from "@react-navigation/native";
import { useUser } from "../hooks/useUser"; // 👉 nhớ chỉnh lại đường dẫn nếu khác

const EditProfileScreen = () => {
  const navigation = useNavigation();
  const { currentUser, updateUser } = useUser();

  const [avatar, setAvatar] = useState("https://i.pravatar.cc/150");
  const [name, setName] = useState("");
  const [bio, setBio] = useState("");
  const [link, setLink] = useState("");
  const [externalLinks, setExternalLinks] = useState<string[]>([]);

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
      quality: 1,
    });
    if (!result.canceled) setAvatar(result.assets[0].uri);
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
        <TouchableOpacity style={styles.cameraButton} onPress={pickImage}>
          <Ionicons name="camera" size={20} color="#fff" />
        </TouchableOpacity>
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
      <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
        <Text style={styles.saveText}>Lưu thay đổi</Text>
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
  saveText: { color: "#fff", fontWeight: "600" },
});
