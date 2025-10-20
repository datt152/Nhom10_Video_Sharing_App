import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  FlatList,
  TouchableOpacity,
} from 'react-native';
import { COLORS, FONTS, SPACING } from '../../styles/theme';

export const HomeScreen: React.FC = () => {
  // Mock data
  const mockVideos = [
    { id: '1', title: 'Video 1', author: 'User 1' },
    { id: '2', title: 'Video 2', author: 'User 2' },
    { id: '3', title: 'Video 3', author: 'User 3' },
  ];

  const renderVideoItem = ({ item }: any) => (
    <View style={styles.videoCard}>
      <View style={styles.videoPlaceholder}>
        <Text style={styles.playIcon}>▶️</Text>
      </View>
      <View style={styles.videoInfo}>
        <Text style={styles.videoTitle}>{item.title}</Text>
        <Text style={styles.videoAuthor}>{item.author}</Text>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.background} />

      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Video Sharing App</Text>
        <TouchableOpacity style={styles.headerButton}>
          <Text style={styles.headerIcon}>📹</Text>
        </TouchableOpacity>
      </View>

      {/* Video Feed */}
      <FlatList
        data={mockVideos}
        renderItem={renderVideoItem}
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
  headerButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerIcon: {
    fontSize: 24,
  },
  listContent: {
    padding: SPACING.screenPadding,
  },
  videoCard: {
    backgroundColor: COLORS.backgroundCard,
    borderRadius: 12,
    marginBottom: SPACING.md,
    overflow: 'hidden',
  },
  videoPlaceholder: {
    width: '100%',
    height: 200,
    backgroundColor: COLORS.gray800,
    justifyContent: 'center',
    alignItems: 'center',
  },
  playIcon: {
    fontSize: 48,
  },
  videoInfo: {
    padding: SPACING.md,
  },
  videoTitle: {
    fontSize: FONTS.lg,
    fontWeight: FONTS.weights.semibold,
    color: COLORS.textPrimary,
    marginBottom: SPACING.xs,
  },
  videoAuthor: {
    fontSize: FONTS.sm,
    color: COLORS.textSecondary,
  },
});