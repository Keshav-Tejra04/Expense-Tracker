import React from 'react';
import { useTheme } from '../../context/ThemeContext';
import { Platform } from 'react-native';
import { Tabs } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { colors } from '../../constants/colors';

export default function TabLayout() {
  const { theme } = useTheme();
  const themeColors = colors[theme];

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: themeColors.surface,
          borderTopWidth: 0,
          elevation: 0, // Android shadow
          shadowOpacity: 0, // iOS shadow
          paddingBottom: Platform.OS === 'ios' ? 28 : 12,
          paddingTop: 12,
          height: Platform.OS === 'ios' ? 88 : 70,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '600',
          marginTop: 4,
        },
        tabBarActiveTintColor: themeColors.primary,
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
