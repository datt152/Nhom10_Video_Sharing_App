// src/screens/notifications/NotificationScreen.tsx
/**
 * Notification Screen
 * Màn hình thông báo
 */

import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  FlatList,
} from 'react-native';
import { COLORS, FONTS, SPACING } from '../../../styles/theme';
import { Avatar } from './../../../component/common/Avatar';

export const NotificationScreen: React.FC = () => {
  // Mock notifications
  const mockNotifications = [
    {
      id: '1',
      type: 'like',
      user: 'Nguyễn Văn A',
      message: 'đã thích video của bạn',
      time: '5 phút trước',
    },
    {
      id: '2',
      type: 'comment',
      user: 'Trần Thị B',
      message: 'đã bình luận: "Video hay quá!"',
      time: '10 phút trước',
    },
    {
      id: '3',
      type: 'follow',
      user: 'Lê Văn C',
      message: 'đã theo dõi bạn',
      time: '1 giờ trước',
    },
  ];

  const renderNotificationItem = ({ item }: any) => (
    <View style={styles.notificationItem}>
      <Avatar name={item.user} size="medium" />
      <View style={styles.notificationContent}>
        <Text style={styles.notificationText}>
          <Text style={styles.username}>{item.user}</Text> {item.message}
        </Text>
        <Text style={styles.time}>{item.time}</Text>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.background} />

      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Thông báo</Text>
      </View>

      {/* Notifications List */}
      <FlatList
        data={mockNotifications}
        renderItem={renderNotificationItem}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    paddingHorizontal: SPACING.screenPadding,
    paddingVertical: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.gray800,
  },
  headerTitle: {
    fontSize: FONTS.xl,
    fontWeight: FONTS.weights.bold,
    color: COLORS.textPrimary,
  },
  listContent: {
    paddingVertical: SPACING.md,
  },
  notificationItem: {
    flexDirection: 'row',
    paddingHorizontal: SPACING.screenPadding,
    paddingVertical: SPACING.md,
    backgroundColor: COLORS.background,
  },
  notificationContent: {
    flex: 1,
    marginLeft: SPACING.md,
    justifyContent: 'center',
  },
  notificationText: {
    fontSize: FONTS.md,
    color: COLORS.textPrimary,
    marginBottom: SPACING.xs,
  },
  username: {
    fontWeight: FONTS.weights.bold,
  },
  time: {
    fontSize: FONTS.sm,
    color: COLORS.textSecondary,
  },
});