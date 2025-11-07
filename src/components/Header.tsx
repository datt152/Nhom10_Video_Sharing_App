import React, { useCallback } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { useNotification } from '../hooks/useNotification'; // hook custom của bạn

const Header = () => {
  const navigation = useNavigation();
  const { notifications, fetchNotifications } = useNotification();

  // Tính số thông báo chưa đọc
  const unreadCount = notifications.filter((n) => !n.isRead).length;

  // 🔁 Khi quay lại Home, tự fetch lại thông báo
  useFocusEffect(
    useCallback(() => {
      fetchNotifications();
    }, [fetchNotifications])
  );

  return (
    <View style={styles.header}>
      <Text style={styles.logo}>VidShare</Text>

      <TouchableOpacity
        style={styles.notificationIcon}
        onPress={() => navigation.navigate('Notification' as never)}
      >
        <Ionicons name="notifications-outline" size={26} color="#FF4EB8" />
        {unreadCount > 0 && (
          <View style={styles.badge}>
            <Text style={styles.badgeText}>
              {unreadCount > 9 ? '9+' : unreadCount}
            </Text>
          </View>
        )}
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 10,
  },
  logo: {
    fontSize: 24,
    fontWeight: '700',
    color: '#FF4EB8',
  },
  notificationIcon: {
    position: 'relative',
  },
  badge: {
    position: 'absolute',
    right: -5,
    top: -3,
    backgroundColor: '#FF4EB8',
    borderRadius: 10,
    paddingHorizontal: 5,
    paddingVertical: 1,
    minWidth: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: 'bold',
  },
});

export default Header;
