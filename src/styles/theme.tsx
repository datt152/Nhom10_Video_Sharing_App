
export const COLORS = {
  // Primary Colors - Màu chủ đạo
  primary: '#FF0050',        // Đỏ hồng nổi bật (như TikTok)
  primaryDark: '#CC0040',    // Đỏ đậm hơn
  primaryLight: '#FF3377',   // Đỏ nhạt hơn
  
  // Secondary Colors
  secondary: '#00F2EA',      // Xanh cyan
  secondaryDark: '#00C2BB',
  
  // Background Colors
  background: '#000000',     // Đen (như TikTok)
  backgroundLight: '#1A1A1A', // Xám đen
  backgroundCard: '#262626', // Xám card
  
  // Text Colors
  textPrimary: '#FFFFFF',    // Trắng
  textSecondary: '#A0A0A0',  // Xám nhạt
  textDisabled: '#666666',   // Xám đậm
  
  // Status Colors
  success: '#00D68F',        // Xanh lá success
  error: '#FF3B30',          // Đỏ error
  warning: '#FFB800',        // Vàng warning
  info: '#0095FF',           // Xanh dương info
  
  // Social Colors
  like: '#FF0050',           // Màu like/heart
  comment: '#FFFFFF',
  share: '#FFD700',          // Vàng share
  
  // Neutral Colors
  white: '#FFFFFF',
  black: '#000000',
  gray100: '#F5F5F5',
  gray200: '#E5E5E5',
  gray300: '#D4D4D4',
  gray400: '#A3A3A3',
  gray500: '#737373',
  gray600: '#525252',
  gray700: '#404040',
  gray800: '#262626',
  gray900: '#171717',
  
  // Overlay
  overlay: 'rgba(0, 0, 0, 0.5)',
  overlayLight: 'rgba(0, 0, 0, 0.3)',
  overlayDark: 'rgba(0, 0, 0, 0.7)',
};

export const FONTS = {
  // Font Families
  regular: 'System',
  medium: 'System',
  bold: 'System',
  semibold: 'System',
  
  // Font Sizes - Tuân thủ accessibility (tối thiểu 14px cho body text)
  xs: 12,
  sm: 14,
  md: 16,
  lg: 18,
  xl: 20,
  xxl: 24,
  xxxl: 32,
  huge: 40,
  
  // Line Heights
  lineHeights: {
    tight: 1.2,
    normal: 1.5,
    relaxed: 1.8,
  },
  
  // Font Weights
  weights: {
    regular: '400' as const,
    medium: '500' as const,
    semibold: '600' as const,
    bold: '700' as const,
  },
};

export const SPACING = {
  // Spacing Scale (8px base)
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 40,
  xxxl: 48,
  
  // Specific Use Cases
  screenPadding: 16,
  cardPadding: 16,
  buttonPadding: 12,
  inputPadding: 12,
};

export const SIZES = {
  // Common Sizes
  borderRadius: {
    sm: 4,
    md: 8,
    lg: 12,
    xl: 16,
    xxl: 24,
    full: 999,
  },
  
  // Icon Sizes
  icon: {
    xs: 16,
    sm: 20,
    md: 24,
    lg: 32,
    xl: 40,
  },
  
  // Avatar Sizes
  avatar: {
    sm: 32,
    md: 48,
    lg: 64,
    xl: 96,
  },
  
  // Button Heights
  button: {
    sm: 36,
    md: 48,
    lg: 56,
  },
  
  // Input Heights
  input: {
    sm: 40,
    md: 48,
    lg: 56,
  },
};

export const SHADOWS = {
  // Shadow Styles
  small: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  medium: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 4,
  },
  large: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 16,
    elevation: 8,
  },
};

export const ANIMATIONS = {
  // Animation Durations
  fast: 200,
  normal: 300,
  slow: 500,
  
  // Animation Types
  easing: {
    easeIn: 'ease-in',
    easeOut: 'ease-out',
    easeInOut: 'ease-in-out',
  },
};

export const LAYOUT = {
  // Screen Dimensions
  maxWidth: 600, // Max width cho tablet/web
  
  // Tab Bar
  tabBarHeight: 60,
  
  // Header
  headerHeight: 56,
  
  // Bottom Sheet
  bottomSheetRadius: 24,
};

// Export default theme object
export const theme = {
  colors: COLORS,
  fonts: FONTS,
  spacing: SPACING,
  sizes: SIZES,
  shadows: SHADOWS,
  animations: ANIMATIONS,
  layout: LAYOUT,
};

export type Theme = typeof theme;