// App.tsx
/**
 * Root App Component
 * Entry point của ứng dụng
 */

import React from 'react';
import { StatusBar } from 'react-native';
import { COLORS } from './src/styles/theme';
import { AppNavigator } from './src/services/navigation/AppNavigation';
import { ErrorBoundary } from './src/component/common/ErrorBoundary';

export default function App() {
  return (
    <ErrorBoundary>
      <StatusBar
        barStyle="light-content"
        backgroundColor={COLORS.background}
        translucent={false}
      />
      <AppNavigator />
    </ErrorBoundary>
  );
}