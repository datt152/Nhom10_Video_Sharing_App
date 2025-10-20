// src/screens/search/SearchScreen.tsx
/**
 * Search Screen
 * Màn hình tìm kiếm
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  StatusBar,
} from 'react-native';
import { COLORS, FONTS, SPACING } from '../../styles/theme';
import { Input } from './../../component/common/Input';

export const SearchScreen: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.background} />

      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Tìm kiếm</Text>
      </View>

      {/* Search Input */}
      <View style={styles.content}>
        <Input
          placeholder="Tìm kiếm video, người dùng..."
          value={searchQuery}
          onChangeText={setSearchQuery}
          leftIcon={<Text style={styles.searchIcon}>🔍</Text>}
        />

        {/* Placeholder Content */}
        <View style={styles.placeholder}>
          <Text style={styles.placeholderIcon}>🔍</Text>
          <Text style={styles.placeholderText}>
            Tìm kiếm video và người dùng yêu thích
          </Text>
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
    paddingTop: SPACING.lg,
  },
  searchIcon: {
    fontSize: FONTS.lg,
  },
  placeholder: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  placeholderIcon: {
    fontSize: 64,
    marginBottom: SPACING.md,
  },
  placeholderText: {
    fontSize: FONTS.md,
    color: COLORS.textSecondary,
    textAlign: 'center',
  },
});