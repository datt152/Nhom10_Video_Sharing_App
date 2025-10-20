// src/navigation/AppNavigator.tsx
/**
 * Root App Navigator
 * Điều hướng giữa Auth Stack và Main Tab
 */

import React, { useState, useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { AuthNavigator } from './AuthNavigation';
import { MainNavigator } from './MainNavigation';
import { COLORS } from '../../styles/theme';
import { LoadingFullScreen } from './../../component/common/Loading';

export const AppNavigator: React.FC = () => {
  // State để check user đã login chưa
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Check authentication status
  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    try {
      // TODO: Check AsyncStorage hoặc Firebase Auth
      // const userToken = await AsyncStorage.getItem('@user_token');
      // setIsAuthenticated(!!userToken);

      // Tạm thời giả lập delay
      await new Promise(resolve => setTimeout(resolve, 1500));

      // Mock: User chưa login
      setIsAuthenticated(false);

      setIsLoading(false);
    } catch (error) {
      console.error('Check auth error:', error);
      setIsLoading(false);
    }
  };

  // Show loading screen
  if (isLoading) {
    return <LoadingFullScreen text="Đang khởi động..." />;
  }

  return (
    <NavigationContainer
      theme={{
        dark: true,
        colors: {
          primary: COLORS.primary,
          background: COLORS.background,
          card: COLORS.backgroundCard,
          text: COLORS.textPrimary,
          border: COLORS.gray700,
          notification: COLORS.error,
        },
      }}
    >
      {/* Hiển thị Auth hoặc Main dựa trên isAuthenticated */}
      {isAuthenticated ? <MainNavigator /> : <AuthNavigator />}
    </NavigationContainer>
  );
};