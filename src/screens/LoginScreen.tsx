import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet } from 'react-native';
import ErrorBox from '../components/ErrorBox';

const LoginScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [showError, setShowError] = useState(false); // trigger hiển thị ErrorBox

  const handleLogin = () => {
    if (email === 'test@gmail.com' && password === '123456') {
      setErrorMessage('');
      setShowError(false);
      navigation.replace('Main');
    } else {
      setErrorMessage('Sai email hoặc mật khẩu. Vui lòng thử lại.');
      setShowError(false); // reset trigger
      setTimeout(() => setShowError(true), 0); // kích hoạt lại ErrorBox
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.logo}>VidShare</Text>

      {/* Hiển thị hộp lỗi khi showError=true */}
      {showError && <ErrorBox message={errorMessage} onClose={() => setShowError(false)} />}

      <TextInput
        placeholder="Email"
        style={styles.input}
        value={email}
        onChangeText={(text) => setEmail(text)}
      />
      <TextInput
        placeholder="Mật khẩu"
        style={styles.input}
        secureTextEntry
        value={password}
        onChangeText={(text) => setPassword(text)}
      />

      <TouchableOpacity style={styles.button} onPress={handleLogin}>
        <Text style={styles.buttonText}>Đăng nhập</Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={() => navigation.navigate('Signup')}>
        <Text style={styles.link}>Chưa có tài khoản? Đăng ký</Text>
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

export default LoginScreen;
