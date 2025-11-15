import React from 'react';
import { View, TouchableOpacity } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { NavigationContainer, useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';

import HomeScreen from '../screens/HomeScreen';
import SearchScreen from '../screens/SearchScreen';
import ProfileScreen from '../screens/ProfileScreen';
import EditProfileScreen from '../screens/EditProfileScreen';
import NotificationScreen from '../screens/NotificationScreen';
import FollowersScreen from "../screens/profileTab/FollowersScreen";
import OtherProfileScreen from '../screens/profileTab/OtherProfileScreen';
import EditVideoScreen from '../screens/EditVideoScreen';
import CameraRecordScreen from '../screens/CameraRecordingScreen';
import UserImageViewer from '../screens/profileTab/UserImageViewer';
import UserVideoViewer from '../screens/profileTab/UserVideoViewer';
import EditImageScreen from '../screens/EditImageScreen';
import VideoCard from '../components/VideoCard'; // ✅ thêm import

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

function UploadButton() {
  const navigation = useNavigation();
  return (
    <TouchableOpacity
      style={{
        position: 'absolute',
        bottom: 5, // khoảng cách so với tab bar
        alignSelf: 'center', // luôn giữa ngang
        width: 64,
        height: 64,
        borderRadius: 32,
        backgroundColor: '#FF4EB8',
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: '#FF4EB8',
        shadowOpacity: 0.4,
        shadowRadius: 10,
        elevation: 8,
      }}
      onPress={() => navigation.navigate('CameraRecord' as never)}
    >
      <Ionicons name="add" size={32} color="#fff" />
    </TouchableOpacity>
  );
}

function BottomTabs() {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: '#FF4EB8',
        tabBarStyle: { height: 65, paddingBottom: 5 },
      }}
    >
      <Tab.Screen
        name="Home"
        component={HomeScreen}
        options={{
          tabBarIcon: ({ color }) => <Ionicons name="home" size={26} color={color} />,
        }}
      />
      <Tab.Screen
        name="Search"
        component={SearchScreen}
        options={{
          tabBarIcon: ({ color }) => <Ionicons name="search" size={26} color={color} />,
        }}
      />
      <Tab.Screen
        name="UploadButton"
        component={View}
        options={{
          tabBarButton: () => <UploadButton />,
        }}
      />
      <Tab.Screen
        name="Follow"
        component={FollowersScreen}
        options={{
          tabBarIcon: ({ color }) => <Ionicons name="compass" size={26} color={color} />,
        }}
      />
      <Tab.Screen
        name="Profile"
        component={ProfileScreen}
        options={{
          tabBarIcon: ({ color }) => <Ionicons name="person" size={26} color={color} />,
        }}
      />
    </Tab.Navigator>
  );
}

export default function AppNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Main" component={BottomTabs} />
      <Stack.Screen name="Notification" component={NotificationScreen} />
      <Stack.Screen name="EditProfile" component={EditProfileScreen} />
      <Stack.Screen name="Followers" component={FollowersScreen} />
      <Stack.Screen name="OtherProfileScreen" component={OtherProfileScreen} />
      <Stack.Screen
        name="CameraRecord"
        component={CameraRecordScreen}
        options={{ presentation: 'fullScreenModal' }}
      />
      <Stack.Screen
        name="EditVideo"
        component={EditVideoScreen}
        options={{ presentation: 'fullScreenModal' }}
      />
      <Stack.Screen name="UserImageViewer" component={UserImageViewer} />
      <Stack.Screen name="UserVideoViewer" component={UserVideoViewer} />
      <Stack.Screen name="EditImage" component={EditImageScreen} />

      {/* ✅ Thêm màn hình VideoCard để xem chi tiết video */}
      <Stack.Screen
        name="VideoCard"
        component={VideoCard}
        options={{ headerShown: false }}
      />
    </Stack.Navigator>
  );
}
