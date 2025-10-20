// src/components/common/Loading.tsx
/**
 * Loading Component
 * Tuân thủ: Visibility of System Status, Aesthetic & Minimalist
 */

import React from 'react';
import {
  View,
  ActivityIndicator,
  Text,
  StyleSheet,
  Modal,
  ViewStyle,
} from 'react-native';
import { COLORS, FONTS, SPACING } from '../../styles/theme';

interface LoadingProps {
  visible?: boolean;
  text?: string;
  size?: 'small' | 'large';
  color?: string;
  overlay?: boolean;
  style?: ViewStyle;
}

export const Loading: React.FC<LoadingProps> = ({
  visible = true,
  text,
  size = 'large',
  color = COLORS.primary,
  overlay = false,
  style,
}) => {
  if (!visible) return null;

  const renderContent = () => (
    <View style={[styles.container, !overlay && style]}>
      <View style={styles.content}>
        <ActivityIndicator size={size} color={color} />
        {text && <Text style={styles.text}>{text}</Text>}
      </View>
    </View>
  );

  // If overlay mode, wrap in Modal
  if (overlay) {
    return (
      <Modal
        transparent
        animationType="fade"
        visible={visible}
        statusBarTranslucent
      >
        <View style={styles.overlay}>{renderContent()}</View>
      </Modal>
    );
  }

  return renderContent();
};

// Inline Loading (for buttons, cards, etc.)
export const LoadingInline: React.FC<{
  size?: 'small' | 'large';
  color?: string;
}> = ({ size = 'small', color = COLORS.primary }) => {
  return <ActivityIndicator size={size} color={color} />;
};

// Full Screen Loading
export const LoadingFullScreen: React.FC<{
  text?: string;
}> = ({ text = 'Đang tải...' }) => {
  return (
    <View style={styles.fullScreen}>
      <ActivityIndicator size="large" color={COLORS.primary} />
      <Text style={styles.fullScreenText}>{text}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
    padding: SPACING.lg,
  },
  overlay: {
    flex: 1,
    backgroundColor: COLORS.overlayDark,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    backgroundColor: COLORS.backgroundCard,
    borderRadius: 16,
    padding: SPACING.xl,
    alignItems: 'center',
    minWidth: 120,
    // Shadow for depth
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  text: {
    marginTop: SPACING.md,
    fontSize: FONTS.md,
    color: COLORS.textPrimary,
    fontWeight: FONTS.weights.medium,
    textAlign: 'center',
  },
  fullScreen: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.background,
  },
  fullScreenText: {
    marginTop: SPACING.md,
    fontSize: FONTS.lg,
    color: COLORS.textPrimary,
    fontWeight: FONTS.weights.medium,
  },
});