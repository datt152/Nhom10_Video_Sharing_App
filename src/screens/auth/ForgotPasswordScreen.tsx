// src/screens/auth/ForgotPasswordScreen.tsx
/**
 * Forgot Password Screen
 * Màn hình quên mật khẩu
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  StatusBar,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { Button } from '../../component/common/Button';
import { Input } from '../../component/common/Input';
import { Loading } from '../../component/common/Loading';
import { COLORS, FONTS, SPACING } from '../../styles/theme';
import { REGEX, ERROR_MESSAGES } from '../../utils/constants';

interface ForgotPasswordScreenProps {
  navigation: any;
}

export const ForgotPasswordScreen: React.FC<ForgotPasswordScreenProps> = ({ navigation }) => {
  const [email, setEmail] = useState('');
  const [emailError, setEmailError] = useState('');
  const [loading, setLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);

  // Validate Email
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

  // Handle Send Reset Link
  const handleSendResetLink = async () => {
    if (!validateEmail(email)) {
      return;
    }

    try {
      setLoading(true);

      // TODO: Call API to send reset email
      await new Promise(resolve => setTimeout(resolve, 2000));

      setLoading(false);
      setEmailSent(true);

      console.log('Reset email sent to:', email);
    } catch (error: any) {
      setLoading(false);
      setEmailError(error.message || 'Gửi email thất bại');
    }
  };

  // Go back to Login
  const navigateToLogin = () => {
    navigation.navigate('Login');
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.background} />

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.container}
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
        </View>

        <View style={styles.content}>
          {!emailSent ? (
            <>
              {/* Icon */}
              <View style={styles.iconContainer}>
                <Text style={styles.icon}>🔐</Text>
              </View>

              {/* Title */}
              <Text style={styles.title}>Quên mật khẩu?</Text>
              <Text style={styles.subtitle}>
                Nhập email của bạn, chúng tôi sẽ gửi link đặt lại mật khẩu
              </Text>

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
                containerStyle={styles.inputContainer}
                required
              />

              {/* Send Button */}
              <Button
                title="Gửi link đặt lại"
                onPress={handleSendResetLink}
                loading={loading}
                disabled={loading}
                fullWidth
                size="large"
              />

              {/* Back to Login */}
              <TouchableOpacity
                style={styles.backToLogin}
                onPress={navigateToLogin}
                activeOpacity={0.7}
              >
                <Text style={styles.backToLoginText}>
                  ← Quay lại đăng nhập
                </Text>
              </TouchableOpacity>
            </>
          ) : (
            <>
              {/* Success Icon */}
              <View style={styles.iconContainer}>
                <Text style={styles.icon}>✉️</Text>
              </View>

              {/* Success Message */}
              <Text style={styles.title}>Email đã được gửi!</Text>
              <Text style={styles.subtitle}>
                Chúng tôi đã gửi link đặt lại mật khẩu đến{'\n'}
                <Text style={styles.emailHighlight}>{email}</Text>
                {'\n\n'}
                Vui lòng kiểm tra hộp thư của bạn.
              </Text>

              {/* Resend Button */}
              <Button
                title="Gửi lại email"
                onPress={handleSendResetLink}
                variant="outline"
                fullWidth
                size="large"
                style={styles.resendButton}
              />

              {/* Back to Login */}
              <Button
                title="Quay lại đăng nhập"
                onPress={navigateToLogin}
                variant="ghost"
                fullWidth
                size="large"
              />
            </>
          )}
        </View>
      </KeyboardAvoidingView>

      {/* Loading Overlay */}
      <Loading visible={loading} text="Đang gửi email..." overlay />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  container: {
    flex: 1,
    paddingHorizontal: SPACING.screenPadding,
  },

  // Header
  header: {
    paddingTop: SPACING.lg,
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
  },
  backIcon: {
    fontSize: 28,
    color: COLORS.textPrimary,
  },

  // Content
  content: {
    flex: 1,
    justifyContent: 'center',
    paddingBottom: SPACING.xxxl,
  },
  iconContainer: {
    alignSelf: 'center',
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: COLORS.backgroundCard,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SPACING.xl,
  },
  icon: {
    fontSize: 50,
  },
  title: {
    fontSize: FONTS.xxxl,
    fontWeight: FONTS.weights.bold,
    color: COLORS.textPrimary,
    textAlign: 'center',
    marginBottom: SPACING.md,
  },
  subtitle: {
    fontSize: FONTS.md,
    color: COLORS.textSecondary,
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: SPACING.xl,
  },
  emailHighlight: {
    color: COLORS.primary,
    fontWeight: FONTS.weights.semibold,
  },

  // Input
  inputIcon: {
    fontSize: FONTS.lg,
  },
  inputContainer: {
    marginBottom: SPACING.xl,
  },

  // Buttons
  backToLogin: {
    alignSelf: 'center',
    marginTop: SPACING.lg,
    paddingVertical: SPACING.sm,
  },
  backToLoginText: {
    fontSize: FONTS.md,
    color: COLORS.textSecondary,
  },
  resendButton: {
    marginBottom: SPACING.md,
  },
});