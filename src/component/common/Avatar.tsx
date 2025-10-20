// src/components/common/Avatar.tsx
/**
 * Avatar Component
 * Tuân thủ: Consistency, Recognition
 */

import React from 'react';
import {
  View,
  Image,
  Text,
  StyleSheet,
  TouchableOpacity,
  ViewStyle,
} from 'react-native';
import { COLORS, FONTS, SIZES } from '../../styles/theme';

interface AvatarProps {
  uri?: string;
  name?: string;
  size?: 'small' | 'medium' | 'large' | 'xlarge';
  onPress?: () => void;
  showBorder?: boolean;
  borderColor?: string;
  style?: ViewStyle;
}

export const Avatar: React.FC<AvatarProps> = ({
  uri,
  name,
  size = 'medium',
  onPress,
  showBorder = false,
  borderColor = COLORS.primary,
  style,
}) => {
  // Get avatar size
  const getAvatarSize = () => {
    switch (size) {
      case 'small':
        return SIZES.avatar.sm;
      case 'medium':
        return SIZES.avatar.md;
      case 'large':
        return SIZES.avatar.lg;
      case 'xlarge':
        return SIZES.avatar.xl;
      default:
        return SIZES.avatar.md;
    }
  };

  // Get initials from name
  const getInitials = (name: string): string => {
    if (!name) return '?';
    const parts = name.trim().split(' ');
    if (parts.length >= 2) {
      return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
  };

  // Get font size based on avatar size
  const getFontSize = () => {
    switch (size) {
      case 'small':
        return FONTS.xs;
      case 'medium':
        return FONTS.md;
      case 'large':
        return FONTS.xl;
      case 'xlarge':
        return FONTS.xxl;
      default:
        return FONTS.md;
    }
  };

  const avatarSize = getAvatarSize();

  const avatarContent = (
    <View
      style={[
        styles.container,
        {
          width: avatarSize,
          height: avatarSize,
          borderRadius: avatarSize / 2,
        },
        showBorder && {
          borderWidth: 3,
          borderColor: borderColor,
        },
        style,
      ]}
    >
      {uri ? (
        <Image
          source={{ uri }}
          style={[
            styles.image,
            {
              width: avatarSize,
              height: avatarSize,
              borderRadius: avatarSize / 2,
            },
          ]}
        />
      ) : (
        <View
          style={[
            styles.placeholder,
            {
              width: avatarSize,
              height: avatarSize,
              borderRadius: avatarSize / 2,
            },
          ]}
        >
          <Text
            style={[
              styles.initials,
              {
                fontSize: getFontSize(),
              },
            ]}
          >
            {getInitials(name || 'User')}
          </Text>
        </View>
      )}
    </View>
  );

  if (onPress) {
    return (
      <TouchableOpacity onPress={onPress} activeOpacity={0.7}>
        {avatarContent}
      </TouchableOpacity>
    );
  }

  return avatarContent;
};

const styles = StyleSheet.create({
  container: {
    overflow: 'hidden',
    backgroundColor: COLORS.gray700,
  },
  image: {
    width: '100%',
    height: '100%',
  },
  placeholder: {
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  initials: {
    color: COLORS.white,
    fontWeight: FONTS.weights.bold,
  },
});