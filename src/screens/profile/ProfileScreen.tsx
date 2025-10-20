// src/screens/profile/ProfileScreen.tsx
/**
 * Profile Screen
 * Màn hình cá nhân
 */

import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  ScrollView,
  TouchableOpacity,
} from 'react-native';

import { COLORS, FONTS, SPACING } from '../../styles/theme';
import { Avatar } from './../../component/common/Avatar';
import { Button } from './../../component/common/Button';

export const ProfileScreen: React.FC = () => {
  const handleEditProfile = () => {
    console.log('Edit profile');
  };

  const handleLogout = () => {
    console.log('Logout');
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.background} />

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Cá nhân</Text>
          <TouchableOpacity onPress={handleLogout}>
            <Text style={styles.logoutIcon}>🚪</Text>
          </TouchableOpacity>
        </View>

        {/* Profile Info */}
        <View style={styles.profileSection}>
          <Avatar name="Nguyễn Văn A" size="xlarge" showBorder />

          <Text style={styles.name}>Nguyễn Văn A</Text>
          <Text style={styles.username}>@nguyenvana</Text>
          <Text style={styles.bio}>
            🎬 Content Creator{'\n'}
            📍 Hà Nội, Việt Nam
          </Text>

          {/* Stats */}
          <View style={styles.statsContainer}>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>123</Text>
              <Text style={styles.statLabel}>Đang theo dõi</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>456</Text>
              <Text style={styles.statLabel}>Người theo dõi</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>12</Text>
              <Text style={styles.statLabel}>Video</Text>
            </View>
          </View>

          {/* Edit Profile Button */}
          <Button
            title="Chỉnh sửa trang cá nhân"
            onPress={handleEditProfile}
            variant="outline"
            fullWidth
            style={styles.editButton}
          />
        </View>

        {/* Videos Grid Placeholder */}
        <View style={styles.videosSection}>
          <Text style={styles.sectionTitle}>Video của tôi</Text>
          <View style={styles.videosGrid}>
            {[1, 2, 3, 4, 5, 6].map((item) => (
              <View key={item} style={styles.videoGridItem}>
                <Text style={styles.videoPlaceholder}>📹</Text>
              </View>
            ))}
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
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
  logoutIcon: {
    fontSize: 24,
  },
  profileSection: {
    alignItems: 'center',
    paddingVertical: SPACING.xl,
    paddingHorizontal: SPACING.screenPadding,
  },
  name: {
    fontSize: FONTS.xxl,
    fontWeight: FONTS.weights.bold,
    color: COLORS.textPrimary,
    marginTop: SPACING.md,
  },
  username: {
    fontSize: FONTS.md,
    color: COLORS.textSecondary,
    marginTop: SPACING.xs,
  },
  bio: {
    fontSize: FONTS.md,
    color: COLORS.textPrimary,
    textAlign: 'center',
    marginTop: SPACING.md,
    lineHeight: 22,
  },
  statsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: SPACING.xl,
    marginBottom: SPACING.lg,
  },
  statItem: {
    alignItems: 'center',
    paddingHorizontal: SPACING.lg,
  },
  statNumber: {
    fontSize: FONTS.xl,
    fontWeight: FONTS.weights.bold,
    color: COLORS.textPrimary,
  },
  statLabel: {
    fontSize: FONTS.sm,
    color: COLORS.textSecondary,
    marginTop: SPACING.xs,
  },
  statDivider: {
    width: 1,
    height: 30,
    backgroundColor: COLORS.gray700,
  },
  editButton: {
    width: '100%',
  },
  videosSection: {
    paddingHorizontal: SPACING.screenPadding,
    paddingBottom: SPACING.xl,
  },
  sectionTitle: {
    fontSize: FONTS.lg,
    fontWeight: FONTS.weights.bold,
    color: COLORS.textPrimary,
    marginBottom: SPACING.md,
  },
  videosGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.sm,
  },
  videoGridItem: {
    width: '31.5%',
    aspectRatio: 9 / 16,
    backgroundColor: COLORS.backgroundCard,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  videoPlaceholder: {
    fontSize: 32,
  },
});