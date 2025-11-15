import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ActivityIndicator, KeyboardAvoidingView, Platform } from 'react-native';
import axios from 'axios';
import bcrypt from 'bcryptjs';
import ErrorBox from '../../components/ErrorBox';
import { API_BASE_URL, setCurrentUserId } from '../../types/config';

const LoginScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [showError, setShowError] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
  if (!username || !password) {
    setErrorMessage('Vui lòng nhập đầy đủ tên đăng nhập và mật khẩu.');
    setShowError(false);
    setTimeout(() => setShowError(true), 0);
    return;
  }

  setLoading(true);
  try {
    const res = await axios.get(`${API_BASE_URL}/users?username=${username}`);
    const users = res.data;

    if (users.length === 0) {
      setErrorMessage('Tài khoản không tồn tại.');
      setShowError(false);
      setTimeout(() => setShowError(true), 0);
      return;
    }

    const user = users[0];
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      setErrorMessage('Sai mật khẩu. Vui lòng thử lại.');
      setShowError(false);
      setTimeout(() => setShowError(true), 0);
      return;
    }

    // ✅ Lưu userId vào AsyncStorage
    await setCurrentUserId(user.id);
    console.log('Đăng nhập thành công:', user.username, 'ID:', user.id);

    navigation.replace('Main');
  } catch (error) {
    console.error('Login error:', error);
    setErrorMessage('Không thể kết nối đến server.');
    setShowError(false);
    setTimeout(() => setShowError(true), 0);
  } finally {
    setLoading(false);
  }
};


  return (
    <KeyboardAvoidingView 
      style={styles.container} 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
    >
      <View style={styles.innerContainer}>
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
        placeholder="Mật khẩu"
        style={styles.input}
        secureTextEntry
        value={password}
        onChangeText={setPassword}
      />

      <TouchableOpacity
        style={[styles.button, loading && { opacity: 0.6 }]}
        onPress={handleLogin}
        disabled={loading}
      >
        {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>Đăng nhập</Text>}
      </TouchableOpacity>

      <TouchableOpacity onPress={() => navigation.navigate('Signup')}>
        <Text style={styles.signup}>Chưa có tài khoản? Đăng ký</Text>
      </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  innerContainer: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 20,
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
    marginTop: 10,
  },
  signup: {
    textAlign: 'center',
    color: '#555',
    marginTop: 10,
  },
});

export default LoginScreen;
