// src/screens/upload/UploadScreen.tsx
/**
 * Upload Screen
 * Màn hình upload video
 */

import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  TouchableOpacity,
} from 'react-native';
import { Button } from '../../component/common/Button';
import { COLORS, FONTS, SPACING } from '../../styles/theme';

export const UploadScreen: React.FC = () => {
  const handleRecordVideo = () => {
    console.log('Record video');
  };

  const handleSelectVideo = () => {
    console.log('Select video from gallery');
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.background} />

      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Tải video lên</Text>
      </View>

      {/* Content */}
      <View style={styles.content}>
        <View style={styles.placeholder}>
          <Text style={styles.placeholderIcon}>🎬</Text>
          <Text style={styles.placeholderTitle}>Chia sẻ video của bạn</Text>
          <Text style={styles.placeholderText}>
            Quay video mới hoặc chọn từ thư viện
          </Text>
        </View>

        {/* Action Buttons */}
        <View style={styles.actions}>
          <Button
            title="📹  Quay video"
            onPress={handleRecordVideo}
            fullWidth
            size="large"
            style={styles.button}
          />

          <Button
            title="🖼️  Chọn từ thư viện"
            onPress={handleSelectVideo}
            variant="outline"
            fullWidth
            size="large"
          />
        </View>
      </View>
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
  content: {
    flex: 1,
    paddingHorizontal: SPACING.screenPadding,
    justifyContent: 'space-between',
    paddingVertical: SPACING.xl,
  },
  placeholder: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  placeholderIcon: {
    fontSize: 80,
    marginBottom: SPACING.lg,
  },
  placeholderTitle: {
    fontSize: FONTS.xxl,
    fontWeight: FONTS.weights.bold,
    color: COLORS.textPrimary,
    marginBottom: SPACING.sm,
  },
  placeholderText: {
    fontSize: FONTS.md,
    color: COLORS.textSecondary,
    textAlign: 'center',
  },
  actions: {
    gap: SPACING.md,
  },
  button: {
    marginBottom: SPACING.md,
  },
});