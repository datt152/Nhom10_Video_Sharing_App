// src/screens/auth/RegisterScreen.tsx
/**
 * Register Screen
 * Giao diện đăng ký tài khoản mới
 */

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

interface RegisterScreenProps {
  navigation: any;
}

export const RegisterScreen: React.FC<RegisterScreenProps> = ({ navigation }) => {
  // State
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
  });

  const [errors, setErrors] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
  });

  const [loading, setLoading] = useState(false);
  const [agreedToTerms, setAgreedToTerms] = useState(false);

  // Update form data
  const updateField = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error when user types
    if (errors[field as keyof typeof errors]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  // Validations
  const validateUsername = (value: string): boolean => {
    if (!value.trim()) {
      setErrors(prev => ({ ...prev, username: 'Tên người dùng không được để trống' }));
      return false;
    }
    if (value.length < 3) {
      setErrors(prev => ({ ...prev, username: 'Tên người dùng phải có ít nhất 3 ký tự' }));
      return false;
    }
    if (value.length > 20) {
      setErrors(prev => ({ ...prev, username: 'Tên người dùng không được quá 20 ký tự' }));
      return false;
    }
    if (!REGEX.USERNAME.test(value)) {
      setErrors(prev => ({ ...prev, username: 'Tên người dùng chỉ chứa chữ, số và dấu gạch dưới' }));
      return false;
    }
    setErrors(prev => ({ ...prev, username: '' }));
    return true;
  };

  const validateEmail = (value: string): boolean => {
    if (!value.trim()) {
      setErrors(prev => ({ ...prev, email: 'Email không được để trống' }));
      return false;
    }
    if (!REGEX.EMAIL.test(value)) {
      setErrors(prev => ({ ...prev, email: ERROR_MESSAGES.INVALID_EMAIL }));
      return false;
    }
    setErrors(prev => ({ ...prev, email: '' }));
    return true;
  };

  const validatePassword = (value: string): boolean => {
    if (!value) {
      setErrors(prev => ({ ...prev, password: 'Mật khẩu không được để trống' }));
      return false;
    }
    if (value.length < 8) {
      setErrors(prev => ({ ...prev, password: ERROR_MESSAGES.INVALID_PASSWORD }));
      return false;
    }
    setErrors(prev => ({ ...prev, password: '' }));
    return true;
  };

  const validateConfirmPassword = (value: string): boolean => {
    if (!value) {
      setErrors(prev => ({ ...prev, confirmPassword: 'Vui lòng xác nhận mật khẩu' }));
      return false;
    }
    if (value !== formData.password) {
      setErrors(prev => ({ ...prev, confirmPassword: ERROR_MESSAGES.PASSWORD_MISMATCH }));
      return false;
    }
    setErrors(prev => ({ ...prev, confirmPassword: '' }));
    return true;
  };

  // Handle Register
  const handleRegister = async () => {
    // Validate all fields
    const isUsernameValid = validateUsername(formData.username);
    const isEmailValid = validateEmail(formData.email);
    const isPasswordValid = validatePassword(formData.password);
    const isConfirmPasswordValid = validateConfirmPassword(formData.confirmPassword);

    if (!isUsernameValid || !isEmailValid || !isPasswordValid || !isConfirmPasswordValid) {
      return;
    }

    if (!agreedToTerms) {
      alert('Vui lòng đồng ý với Điều khoản sử dụng');
      return;
    }

    try {
      setLoading(true);

      // TODO: Call API to register
      await new Promise(resolve => setTimeout(resolve, 2000));

      console.log('Register successful:', formData);

      setLoading(false);

      // Navigate to Login or Home
      // navigation.replace('Home');
      alert('Đăng ký thành công!');
    } catch (error: any) {
      setLoading(false);
      alert(error.message || 'Đăng ký thất bại');
    }
  };

  // Navigate to Login
  const navigateToLogin = () => {
    navigation.navigate('Login');
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
            <TouchableOpacity 
              style={styles.backButton} 
              onPress={() => navigation.goBack()}
              activeOpacity={0.7}
            >
              <Text style={styles.backIcon}>←</Text>
            </TouchableOpacity>

            <Text style={styles.title}>Tạo tài khoản</Text>
            <Text style={styles.subtitle}>
              Đăng ký để bắt đầu chia sẻ video của bạn
            </Text>
          </View>

          {/* Register Form */}
          <View style={styles.formContainer}>
            {/* Username Input */}
            <Input
              label="Tên người dùng"
              placeholder="Nhập tên người dùng (3-20 ký tự)"
              value={formData.username}
              onChangeText={(text) => updateField('username', text)}
              onBlur={() => validateUsername(formData.username)}
              error={errors.username}
              autoCapitalize="none"
              leftIcon={<Text style={styles.inputIcon}>👤</Text>}
              hint="Chỉ chứa chữ, số và dấu gạch dưới"
              required
            />

            {/* Email Input */}
            <Input
              label="Email"
              placeholder="Nhập email của bạn"
              value={formData.email}
              onChangeText={(text) => updateField('email', text)}
              onBlur={() => validateEmail(formData.email)}
              error={errors.email}
              keyboardType="email-address"
              autoComplete="email"
              textContentType="emailAddress"
              leftIcon={<Text style={styles.inputIcon}>📧</Text>}
              required
            />

            {/* Password Input */}
            <Input
              label="Mật khẩu"
              placeholder="Nhập mật khẩu (tối thiểu 8 ký tự)"
              value={formData.password}
              onChangeText={(text) => updateField('password', text)}
              onBlur={() => validatePassword(formData.password)}
              error={errors.password}
              isPassword
              autoComplete="password"
              textContentType="newPassword"
              leftIcon={<Text style={styles.inputIcon}>🔒</Text>}
              hint="Tối thiểu 8 ký tự, nên có chữ và số"
              required
            />

            {/* Confirm Password Input */}
            <Input
              label="Xác nhận mật khẩu"
              placeholder="Nhập lại mật khẩu"
              value={formData.confirmPassword}
              onChangeText={(text) => updateField('confirmPassword', text)}
              onBlur={() => validateConfirmPassword(formData.confirmPassword)}
              error={errors.confirmPassword}
              isPassword
              autoComplete="password"
              textContentType="newPassword"
              leftIcon={<Text style={styles.inputIcon}>🔒</Text>}
              required
            />

            {/* Terms & Conditions Checkbox */}
            <TouchableOpacity
              style={styles.checkboxContainer}
              onPress={() => setAgreedToTerms(!agreedToTerms)}
              activeOpacity={0.7}
            >
              <View style={[styles.checkbox, agreedToTerms && styles.checkboxChecked]}>
                {agreedToTerms && <Text style={styles.checkmark}>✓</Text>}
              </View>
              <Text style={styles.checkboxText}>
                Tôi đồng ý với{' '}
                <Text style={styles.linkText}>Điều khoản sử dụng</Text>
                {' '}và{' '}
                <Text style={styles.linkText}>Chính sách bảo mật</Text>
              </Text>
            </TouchableOpacity>

            {/* Register Button */}
            <Button
              title="Đăng ký"
              onPress={handleRegister}
              loading={loading}
              disabled={loading}
              fullWidth
              size="large"
              style={styles.registerButton}
            />

            {/* Divider */}
            <View style={styles.dividerContainer}>
              <View style={styles.dividerLine} />
              <Text style={styles.dividerText}>hoặc đăng ký với</Text>
              <View style={styles.dividerLine} />
            </View>

            {/* Social Register Buttons */}
            <View style={styles.socialContainer}>
              <TouchableOpacity
                style={[styles.socialButton, styles.googleButton]}
                onPress={() => console.log('Google register')}
                activeOpacity={0.8}
              >
                <Text style={styles.socialIcon}>G</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.socialButton, styles.facebookButton]}
                onPress={() => console.log('Facebook register')}
                activeOpacity={0.8}
              >
                <Text style={styles.socialIcon}>f</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Login Link */}
          <View style={styles.loginContainer}>
            <Text style={styles.loginText}>Đã có tài khoản? </Text>
            <TouchableOpacity onPress={navigateToLogin} activeOpacity={0.7}>
              <Text style={styles.loginLink}>Đăng nhập ngay</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      {/* Loading Overlay */}
      <Loading visible={loading} text="Đang tạo tài khoản..." overlay />
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

  // Header
  header: {
    paddingTop: SPACING.lg,
    paddingBottom: SPACING.xl,
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    marginBottom: SPACING.md,
  },
  backIcon: {
    fontSize: 28,
    color: COLORS.textPrimary,
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
    lineHeight: 22,
  },

  // Form
  formContainer: {
    marginTop: SPACING.md,
  },
  inputIcon: {
    fontSize: FONTS.lg,
  },

  // Checkbox
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: SPACING.lg,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderWidth: 2,
    borderColor: COLORS.gray600,
    borderRadius: 6,
    marginRight: SPACING.sm,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkboxChecked: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  checkmark: {
    color: COLORS.white,
    fontSize: FONTS.md,
    fontWeight: FONTS.weights.bold,
  },
  checkboxText: {
    flex: 1,
    fontSize: FONTS.sm,
    color: COLORS.textSecondary,
    lineHeight: 20,
  },
  linkText: {
    color: COLORS.primary,
    fontWeight: FONTS.weights.semibold,
  },

  // Buttons
  registerButton: {
    marginTop: SPACING.md,
  },

  // Divider
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

  // Social
  socialContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: SPACING.lg,
  },
  socialButton: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
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
    fontSize: FONTS.xxl,
    fontWeight: FONTS.weights.bold,
  },

  // Login Link
  loginContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: SPACING.xl,
  },
  loginText: {
    fontSize: FONTS.md,
    color: COLORS.textSecondary,
  },
  loginLink: {
    fontSize: FONTS.md,
    color: COLORS.primary,
    fontWeight: FONTS.weights.bold,
  },
});