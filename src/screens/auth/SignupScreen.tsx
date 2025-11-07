import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import axios from 'axios';
import bcrypt from 'bcryptjs';
import ErrorBox from '../../components/ErrorBox';
import { API_BASE_URL } from '../../types/config';

const SignupScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [showError, setShowError] = useState(false);

  const handleSignup = async () => {
    // 🧩 Kiểm tra dữ liệu đầu vào
    if (!username || !email || !password || !confirmPassword) {
      setErrorMessage('Vui lòng nhập đầy đủ thông tin.');
      setShowError(false);
      setTimeout(() => setShowError(true), 0);
      return;
    }

    if (password !== confirmPassword) {
      setErrorMessage('Mật khẩu xác nhận không khớp.');
      setShowError(false);
      setTimeout(() => setShowError(true), 0);
      return;
    }

    setLoading(true);
    try {
      // Kiểm tra xem username hoặc email đã tồn tại chưa
      const res = await axios.get(`${API_BASE_URL}/users?username=${username}`);
      if (res.data.length > 0) {
        setErrorMessage('Tên đăng nhập đã tồn tại.');
        setShowError(false);
        setTimeout(() => setShowError(true), 0);
        return;
      }

      const res2 = await axios.get(`${API_BASE_URL}/users?email=${email}`);
      if (res2.data.length > 0) {
        setErrorMessage('Email đã được sử dụng.');
        setShowError(false);
        setTimeout(() => setShowError(true), 0);
        return;
      }

      // 🔒 Hash mật khẩu trước khi lưu
      const hashedPassword = await bcrypt.hash(password, 10);

      // 🟢 Gửi dữ liệu đăng ký lên JSON Server
      const newUser = {
        username,
        email,
        password: hashedPassword,
        followerIds: [],
        followingIds: [],
        followerCount: 0,
        followingCount: 0,
        avatar: '',
      };

      await axios.post(`${API_BASE_URL}/users`, newUser);

      console.log('✅ Đăng ký thành công:', username);

      // Quay về màn đăng nhập
      navigation.replace('Login');
    } catch (err) {
      console.error('Signup error:', err);
      setErrorMessage('Không thể kết nối đến server.');
      setShowError(false);
      setTimeout(() => setShowError(true), 0);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.logo}>VidShare</Text>

      {showError && <ErrorBox message={errorMessage} onClose={() => setShowError(false)} />}

      <TextInput
        placeholder="Tên đăng nhập"
        style={styles.input}
        value={username}
        onChangeText={setUsername}
        autoCapitalize="none"
      />

      <TextInput
        placeholder="Email"
        style={styles.input}
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        autoCapitalize="none"
      />

      <TextInput
        placeholder="Mật khẩu"
        style={styles.input}
        secureTextEntry
        value={password}
        onChangeText={setPassword}
      />

      <TextInput
        placeholder="Xác nhận mật khẩu"
        style={styles.input}
        secureTextEntry
        value={confirmPassword}
        onChangeText={setConfirmPassword}
      />

      <TouchableOpacity
        style={[styles.button, loading && { opacity: 0.6 }]}
        onPress={handleSignup}
        disabled={loading}
      >
        {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>Đăng ký</Text>}
      </TouchableOpacity>

      <TouchableOpacity onPress={() => navigation.replace('Login')}>
        <Text style={styles.link}>Đã có tài khoản? Đăng nhập</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 30,
    backgroundColor: '#fff',
  },
  logo: {
    fontSize: 36,
    fontWeight: '800',
    color: '#FF4EB8',
    textAlign: 'center',
    marginBottom: 40,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 12,
    padding: 12,
    marginBottom: 15,
  },
  button: {
    backgroundColor: '#FF4EB8',
    borderRadius: 12,
    padding: 14,
    alignItems: 'center',
    marginTop: 10,
  },
  buttonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 16,
  },
  link: {
    textAlign: 'center',
    color: '#555',
    marginTop: 15,
  },
});

export default SignupScreen;
