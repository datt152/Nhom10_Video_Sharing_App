import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
} from 'react-native';
import { Button } from '../../component/common/Button';
import { Input } from '../../component/common/Input';
import { Loading } from '../../component/common/Loading';
import { COLORS, FONTS, SPACING, SIZES } from '../../styles/theme';
import { ERROR_MESSAGES, REGEX } from '../../utils/constants';

interface LoginScreenProps {
  navigation: any; // TODO: Replace with proper navigation type
}

export const LoginScreen: React.FC<LoginScreenProps> = ({ navigation }) => {
  // State management
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [loading, setLoading] = useState(false);

  // Validation functions
  const validateEmail = (value: string): boolean => {
    if (!value.trim()) {
      setEmailError('Email không được để trống');
      return false;
    }
    if (!REGEX.EMAIL.test(value)) {
      setEmailError(ERROR_MESSAGES.INVALID_EMAIL);
      return false;
    }
    setEmailError('');
    return true;
  };

  const validatePassword = (value: string): boolean => {
    if (!value) {
      setPasswordError('Mật khẩu không được để trống');
      return false;
    }
    if (value.length < 8) {
      setPasswordError(ERROR_MESSAGES.INVALID_PASSWORD);
      return false;
    }
    setPasswordError('');
    return true;
  };

  // Handle login
  const handleLogin = async () => {
    // Clear previous errors
    setEmailError('');
    setPasswordError('');

    // Validate inputs
    const isEmailValid = validateEmail(email);
    const isPasswordValid = validatePassword(password);

    if (!isEmailValid || !isPasswordValid) {
      return;
    }

    try {
      setLoading(true);

      // TODO: Replace with actual Firebase authentication
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Mock successful login
      console.log('Login successful:', { email, password });

      // Navigate to Home screen
      // navigation.replace('Home');

      setLoading(false);
    } catch (error: any) {
      setLoading(false);
      setPasswordError(
        error.message || ERROR_MESSAGES.INVALID_CREDENTIALS
      );
    }
  };

  // Handle social login
  const handleGoogleLogin = async () => {
    console.log('Google login pressed');
    // TODO: Implement Google OAuth
  };

  const handleFacebookLogin = async () => {
    console.log('Facebook login pressed');
    // TODO: Implement Facebook OAuth
  };

  // Navigate to Register
  const navigateToRegister = () => {
    navigation.navigate('Register');
  };

  // Navigate to Forgot Password
  const navigateToForgotPassword = () => {
    navigation.navigate('ForgotPassword');
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.background} />

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* Header */}
          <View style={styles.header}>
            {/* App Logo/Icon */}
            <View style={styles.logoContainer}>
              <Text style={styles.logoIcon}>🎬</Text>
            </View>

            {/* Title */}
            <Text style={styles.title}>Chào mừng trở lại!</Text>
            <Text style={styles.subtitle}>
              Đăng nhập để khám phá video thú vị
            </Text>
          </View>

          {/* Login Form */}
          <View style={styles.formContainer}>
            {/* Email Input */}
            <Input
              label="Email"
              placeholder="Nhập email của bạn"
              value={email}
              onChangeText={(text) => {
                setEmail(text);
                if (emailError) validateEmail(text);
              }}
              onBlur={() => validateEmail(email)}
              error={emailError}
              keyboardType="email-address"
              autoComplete="email"
              textContentType="emailAddress"
              leftIcon={<Text style={styles.inputIcon}>📧</Text>}
              required
            />

            {/* Password Input */}
            <Input
              label="Mật khẩu"
              placeholder="Nhập mật khẩu"
              value={password}
              onChangeText={(text) => {
                setPassword(text);
                if (passwordError) validatePassword(text);
              }}
              onBlur={() => validatePassword(password)}
              error={passwordError}
              isPassword
              autoComplete="password"
              textContentType="password"
              leftIcon={<Text style={styles.inputIcon}>🔒</Text>}
              required
            />

            {/* Forgot Password Link */}
            <TouchableOpacity
              style={styles.forgotPasswordContainer}
              onPress={navigateToForgotPassword}
              activeOpacity={0.7}
            >
              <Text style={styles.forgotPasswordText}>Quên mật khẩu?</Text>
            </TouchableOpacity>

            {/* Login Button */}
            <Button
              title="Đăng nhập"
              onPress={handleLogin}
              loading={loading}
              disabled={loading}
              fullWidth
              size="large"
              style={styles.loginButton}
            />

            {/* Divider */}
            <View style={styles.dividerContainer}>
              <View style={styles.dividerLine} />
              <Text style={styles.dividerText}>hoặc</Text>
              <View style={styles.dividerLine} />
            </View>

            {/* Social Login Buttons */}
            <View style={styles.socialContainer}>
              <TouchableOpacity
                style={[styles.socialButton, styles.googleButton]}
                onPress={handleGoogleLogin}
                activeOpacity={0.8}
              >
                <Text style={styles.socialIcon}>G</Text>
                <Text style={styles.socialButtonText}>Google</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.socialButton, styles.facebookButton]}
                onPress={handleFacebookLogin}
                activeOpacity={0.8}
              >
                <Text style={styles.socialIcon}>f</Text>
                <Text style={styles.socialButtonText}>Facebook</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Register Link */}
          <View style={styles.registerContainer}>
            <Text style={styles.registerText}>Chưa có tài khoản? </Text>
            <TouchableOpacity onPress={navigateToRegister} activeOpacity={0.7}>
              <Text style={styles.registerLink}>Đăng ký ngay</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      {/* Loading Overlay */}
      <Loading visible={loading} text="Đang đăng nhập..." overlay />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: SPACING.screenPadding,
    paddingBottom: SPACING.xl,
  },

  // Header Styles
  header: {
    alignItems: 'center',
    paddingTop: SPACING.xxxl,
    paddingBottom: SPACING.xl,
  },
  logoContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SPACING.lg,
    // Shadow
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
  },
  logoIcon: {
    fontSize: 50,
  },
  title: {
    fontSize: FONTS.xxxl,
    fontWeight: FONTS.weights.bold,
    color: COLORS.textPrimary,
    marginBottom: SPACING.xs,
  },
  subtitle: {
    fontSize: FONTS.md,
    color: COLORS.textSecondary,
    textAlign: 'center',
  },

  // Form Styles
  formContainer: {
    marginTop: SPACING.lg,
  },
  inputIcon: {
    fontSize: FONTS.lg,
  },
  forgotPasswordContainer: {
    alignSelf: 'flex-end',
    marginTop: -SPACING.xs,
    marginBottom: SPACING.lg,
  },
  forgotPasswordText: {
    fontSize: FONTS.sm,
    color: COLORS.primary,
    fontWeight: FONTS.weights.medium,
  },
  loginButton: {
    marginTop: SPACING.md,
  },

  // Divider Styles
  dividerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: SPACING.xl,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: COLORS.gray700,
  },
  dividerText: {
    fontSize: FONTS.sm,
    color: COLORS.textSecondary,
    marginHorizontal: SPACING.md,
  },

  // Social Login Styles
  socialContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: SPACING.md,
  },
  socialButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: SIZES.button.md,
    borderRadius: SIZES.borderRadius.lg,
    borderWidth: 2,
  },
  googleButton: {
    backgroundColor: COLORS.white,
    borderColor: COLORS.gray300,
  },
  facebookButton: {
    backgroundColor: '#1877F2',
    borderColor: '#1877F2',
  },
  socialIcon: {
    fontSize: FONTS.xl,
    fontWeight: FONTS.weights.bold,
    marginRight: SPACING.sm,
  },
  socialButtonText: {
    fontSize: FONTS.md,
    fontWeight: FONTS.weights.semibold,
    color: COLORS.gray800,
  },

  // Register Link Styles
  registerContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: SPACING.xl,
  },
  registerText: {
    fontSize: FONTS.md,
    color: COLORS.textSecondary,
  },
  registerLink: {
    fontSize: FONTS.md,
    color: COLORS.primary,
    fontWeight: FONTS.weights.bold,
  },
});