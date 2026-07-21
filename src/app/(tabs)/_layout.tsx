import React from 'react';
import { useTheme } from '../../context/ThemeContext';
import { Platform } from 'react-native';
import { Tabs } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { colors } from '../../constants/colors';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function TabLayout() {
  const { theme } = useTheme();
  const themeColors = colors[theme];
  const insets = useSafeAreaInsets();
  
  // Calculate dynamic bottom padding to prevent collision with Android navigation bar
  const bottomPadding = Math.max(insets.bottom, Platform.OS === 'ios' ? 28 : 12);
  const tabHeight = Platform.OS === 'ios' ? 60 + bottomPadding : 58 + bottomPadding;

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: themeColors.background, // Match fully blended background
          borderTopWidth: 0,
          elevation: 0, // Android shadow
          shadowOpacity: 0, // iOS shadow
          paddingBottom: bottomPadding,
          paddingTop: 12,
          height: tabHeight,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '600',
          marginTop: 4,
        },
        tabBarActiveTintColor: themeColors.textPrimary, // Monochrome style
        tabBarInactiveTintColor: themeColors.textMuted,
      }}
    >
      <Tabs.Screen
        name="home"
        options={{
          title: 'Home',
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="home" color={color} size={size} />
          ),
        }}
      />
      <Tabs.Screen
        name="lendings"
        options={{
          title: 'Lendings',
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="hand-coin-outline" color={color} size={size} />
          ),
        }}
      />
      <Tabs.Screen
        name="analytics"
        options={{
          title: 'Analytics',
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="chart-donut" color={color} size={size} />
          ),
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: 'Settings',
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="cog-outline" color={color} size={size} />
          ),
        }}
      />
    </Tabs>
  );
}
