import React, { useRef, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface ErrorBoxProps {
  message: string;
  onClose: () => void;
}

const ErrorBox: React.FC<ErrorBoxProps> = ({ message, onClose }) => {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Khi message thay đổi, hiển thị lỗi
  useEffect(() => {
    if (!message) return;

    // Reset animation trước khi fade in
    fadeAnim.setValue(0);
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 200,
      useNativeDriver: true,
    }).start();

    // Hủy timer cũ nếu có
    if (timerRef.current) clearTimeout(timerRef.current);

    // Tự động tắt sau 5 giây
    timerRef.current = setTimeout(() => {
      handleClose();
    }, 5000);

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [message]);

  const handleClose = () => {
    // Fade out animation trước khi gọi onClose
    Animated.timing(fadeAnim, {
      toValue: 0,
      duration: 200,
      useNativeDriver: true,
    }).start(() => onClose());
  };

  if (!message) return null;

  return (
    <Animated.View style={[styles.container, { opacity: fadeAnim }]}>
      <Ionicons name="warning-outline" size={22} color="#fff" style={styles.icon} />
      <Text style={styles.text}>{message}</Text>
      <TouchableOpacity onPress={handleClose} style={styles.button}>
        <Text style={styles.buttonText}>OK</Text>
      </TouchableOpacity>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 50,
    alignSelf: 'center',
    backgroundColor: '#e74c3c',
    borderRadius: 10,
    paddingVertical: 12,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
    minWidth: '85%',
  },
  icon: {
    marginRight: 8,
  },
  text: {
    color: '#fff',
    flex: 1,
    fontSize: 14,
  },
  button: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 6,
  },
  buttonText: {
    color: '#fff',
    fontWeight: '600',
  },
});

export default ErrorBox;
