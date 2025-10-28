import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { NavigationContainer } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import FollowersScreen from "../screens/profileTab/FollowersScreen"
import HomeScreen from '../screens/HomeScreen';
import SearchScreen from '../screens/SearchScreen';
import CreateUploadScreen from '../screens/CreateUploadScreen';
import ExploreScreen from '../screens/ExploreScreen';
import ProfileScreen from '../screens/ProfileScreen';
import NotificationScreen from '../screens/NotificationScreen';
import EditProfileScreen from '../screens/EditProfileScreen';
import OtherProfileScreen from '../screens/profileTab/OtherProfileScreen';
import EditVideoScreen from '../screens/EditVideoScreen';
import CameraRecordScreen from '../screens/CameraRecordingScreen';
import UserImageViewer from '../screens/profileTab/UserImageViewer'
const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

function BottomTabs() {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: '#FF4EB8',
        tabBarStyle: { height: 60, paddingBottom: 5 },
      }}
    >
      <Tab.Screen
        name="Home"
        component={HomeScreen}
        options={{
          tabBarIcon: ({ color }) => <Ionicons name="home" size={24} color={color} />,
        }}
      />
      <Tab.Screen
        name="Search"
        component={SearchScreen}
        options={{
          tabBarIcon: ({ color }) => <Ionicons name="search" size={24} color={color} />,
        }}
      />
      <Tab.Screen
        name="Upload"
        component={CameraRecordScreen}
        options={{
          tabBarIcon: ({ color }) => <Ionicons name="add-circle" size={24} color={color} />,
        }}
      />
      <Tab.Screen
        name="Explore"
        component={ExploreScreen}
        options={{
          tabBarIcon: ({ color, size }) => <Ionicons name="compass" color={color} size={24} />
        }}
      />
      <Tab.Screen
        name="Profile"
        component={ProfileScreen}
        options={{
          tabBarIcon: ({ color, size }) => <Ionicons name="person" color={color} size={24} />
        }}
      />
    </Tab.Navigator>
  );
}

export default function AppNavigator() {
  return (

    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Main" component={BottomTabs} />
      <Stack.Screen name='Notification' component={NotificationScreen} />
      <Stack.Screen name="EditProfile" component={EditProfileScreen} />
      <Stack.Screen name="Followers" component={FollowersScreen} />
      <Stack.Screen name="OtherProfileScreen" component={OtherProfileScreen} />
      <Stack.Screen
        name="CameraRecord"
        component={CameraRecordScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="EditVideo"
        component={EditVideoScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="UserImageViewer"
        component={UserImageViewer}
        options={{ headerShown: false }}
      />
    </Stack.Navigator>
  );
}
