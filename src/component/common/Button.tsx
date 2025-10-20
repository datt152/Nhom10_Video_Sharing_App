// src/components/common/Button.tsx
/**
 * Custom Button Component
 * Tuân thủ nguyên tắc: Consistency, Recognition, Accessibility
 */

import React from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ActivityIndicator,
  ViewStyle,
  TextStyle,
  TouchableOpacityProps,
} from 'react-native';
import { COLORS, FONTS, SIZES, SPACING } from '../../styles/theme';

interface ButtonProps extends TouchableOpacityProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
  size?: 'small' | 'medium' | 'large';
  loading?: boolean;
  disabled?: boolean;
  fullWidth?: boolean;
  icon?: React.ReactNode;
  iconPosition?: 'left' | 'right';
  style?: ViewStyle;
  textStyle?: TextStyle;
}

export const Button: React.FC<ButtonProps> = ({
  title,
  onPress,
  variant = 'primary',
  size = 'medium',
  loading = false,
  disabled = false,
  fullWidth = false,
  icon,
  iconPosition = 'left',
  style,
  textStyle,
  ...props
}) => {
  // Determine button styles based on variant
  const getVariantStyles = (): ViewStyle => {
    switch (variant) {
      case 'primary':
        return {
          backgroundColor: COLORS.primary,
          borderWidth: 0,
        };
      case 'secondary':
        return {
          backgroundColor: COLORS.secondary,
          borderWidth: 0,
        };
      case 'outline':
        return {
          backgroundColor: 'transparent',
          borderWidth: 2,
          borderColor: COLORS.primary,
        };
      case 'ghost':
        return {
          backgroundColor: 'transparent',
          borderWidth: 0,
        };
      case 'danger':
        return {
          backgroundColor: COLORS.error,
          borderWidth: 0,
        };
      default:
        return {};
    }
  };

  // Determine button size
  const getSizeStyles = (): ViewStyle => {
    switch (size) {
      case 'small':
        return {
          height: SIZES.button.sm,
          paddingHorizontal: SPACING.md,
        };
      case 'medium':
        return {
          height: SIZES.button.md,
          paddingHorizontal: SPACING.lg,
        };
      case 'large':
        return {
          height: SIZES.button.lg,
          paddingHorizontal: SPACING.xl,
        };
      default:
        return {};
    }
  };

  // Determine text color based on variant
  const getTextColor = (): string => {
    if (disabled) return COLORS.textDisabled;
    
    switch (variant) {
      case 'primary':
      case 'secondary':
      case 'danger':
        return COLORS.white;
      case 'outline':
      case 'ghost':
        return COLORS.primary;
      default:
        return COLORS.white;
    }
  };

  // Determine text size
  const getTextSize = (): number => {
    switch (size) {
      case 'small':
        return FONTS.sm;
      case 'medium':
        return FONTS.md;
      case 'large':
        return FONTS.lg;
      default:
        return FONTS.md;
    }
  };

  return (
    <TouchableOpacity
      style={[
        styles.button,
        getVariantStyles(),
        getSizeStyles(),
        fullWidth && styles.fullWidth,
        disabled && styles.disabled,
        style,
      ]}
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.7}
      {...props}
    >
      {loading ? (
        <ActivityIndicator color={getTextColor()} size="small" />
      ) : (
        <>
          {icon && iconPosition === 'left' && (
            <Text style={styles.iconLeft}>{icon}</Text>
          )}
          
          <Text
            style={[
              styles.text,
              {
                color: getTextColor(),
                fontSize: getTextSize(),
              },
              textStyle,
            ]}
          >
            {title}
          </Text>
          
          {icon && iconPosition === 'right' && (
            <Text style={styles.iconRight}>{icon}</Text>
          )}
        </>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: SIZES.borderRadius.lg,
    // Shadow for depth (Material Design)
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  fullWidth: {
    width: '100%',
  },
  disabled: {
    opacity: 0.5,
    shadowOpacity: 0,
    elevation: 0,
  },
  text: {
    fontWeight: FONTS.weights.semibold,
    textAlign: 'center',
  },
  iconLeft: {
    marginRight: SPACING.sm,
  },
  iconRight: {
    marginLeft: SPACING.sm,
  },
});