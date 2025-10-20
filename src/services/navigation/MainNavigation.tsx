// src/navigation/MainNavigator.tsx
/**
 * Main Tab Navigator
 * Bottom Tab Navigation cho các màn hình chính
 */

import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Text, StyleSheet, View } from 'react-native';
import { COLORS, FONTS, SIZES } from '../../styles/theme';

import { HomeScreen } from './../../screens/home/HomeScreen';
import { SearchScreen } from './../../screens/search/SearchScreen';
import { UploadScreen } from './../../screens/upload/UploadScreen';
import { NotificationScreen } from './../../screens/auth/notification/NotificationScreen';
import { ProfileScreen } from './../../screens/profile/ProfileScreen';

export type MainTabParamList = {
  Home: undefined;
  Search: undefined;
  Upload: undefined;
  Notifications: undefined;
  Profile: undefined;
};

const Tab = createBottomTabNavigator<MainTabParamList>();

// Custom Tab Bar Icon Component
interface TabIconProps {
  icon: string;
  focused: boolean;
  label: string;
}

const TabIcon: React.FC<TabIconProps> = ({ icon, focused, label }) => {
  return (
    <View style={styles.tabIconContainer}>
      <Text style={[styles.tabIcon, focused && styles.tabIconFocused]}>
        {icon}
      </Text>
      <Text style={[styles.tabLabel, focused && styles.tabLabelFocused]}>
        {label}
      </Text>
    </View>
  );
};

export const MainNavigator: React.FC = () => {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarStyle: styles.tabBar,
        tabBarShowLabel: false,
        tabBarActiveTintColor: COLORS.primary,
        tabBarInactiveTintColor: COLORS.textSecondary,
      }}
      initialRouteName="Home"
    >
      {/* Home Tab */}
      <Tab.Screen
        name="Home"
        component={HomeScreen}
        options={{
          tabBarIcon: ({ focused }) => (
            <TabIcon icon="🏠" focused={focused} label="Trang chủ" />
          ),
        }}
      />

      {/* Search Tab */}
      <Tab.Screen
        name="Search"
        component={SearchScreen}
        options={{
          tabBarIcon: ({ focused }) => (
            <TabIcon icon="🔍" focused={focused} label="Tìm kiếm" />
          ),
        }}
      />

      {/* Upload Tab - Special Style */}
      <Tab.Screen
        name="Upload"
        component={UploadScreen}
        options={{
          tabBarIcon: ({ focused }) => (
            <View style={styles.uploadButtonContainer}>
              <View style={styles.uploadButton}>
                <Text style={styles.uploadIcon}>➕</Text>
              </View>
            </View>
          ),
        }}
      />

      {/* Notifications Tab */}
      <Tab.Screen
        name="Notifications"
        component={NotificationScreen}
        options={{
          tabBarIcon: ({ focused }) => (
            <TabIcon icon="🔔" focused={focused} label="Thông báo" />
          ),
          tabBarBadge: 3, // Example badge
          tabBarBadgeStyle: styles.badge,
        }}
      />

      {/* Profile Tab */}
      <Tab.Screen
        name="Profile"
        component={ProfileScreen}
        options={{
          tabBarIcon: ({ focused }) => (
            <TabIcon icon="👤" focused={focused} label="Cá nhân" />
          ),
        }}
      />
    </Tab.Navigator>
  );
};

const styles = StyleSheet.create({
  tabBar: {
    backgroundColor: COLORS.backgroundCard,
    borderTopWidth: 0,
    height: 70,
    paddingBottom: 8,
    paddingTop: 8,
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  tabIconContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabIcon: {
    fontSize: 24,
    marginBottom: 4,
  },
  tabIconFocused: {
    transform: [{ scale: 1.1 }],
  },
  tabLabel: {
    fontSize: FONTS.xs,
    color: COLORS.textSecondary,
    fontWeight: FONTS.weights.medium,
  },
  tabLabelFocused: {
    color: COLORS.primary,
    fontWeight: FONTS.weights.bold,
  },

  // Upload Button (Special)
  uploadButtonContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: -20,
  },
  uploadButton: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
    // Shadow
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 8,
  },
  uploadIcon: {
    fontSize: 28,
    color: COLORS.white,
  },

  // Badge
  badge: {
    backgroundColor: COLORS.error,
    color: COLORS.white,
    fontSize: FONTS.xs,
    fontWeight: FONTS.weights.bold,
    minWidth: 18,
    height: 18,
  },
});