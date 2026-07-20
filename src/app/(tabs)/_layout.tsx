import React from 'react';
import { Tabs } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { colors } from '../../constants/colors';

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: colors.dark.surface,
          borderTopWidth: 1,
          borderTopColor: colors.dark.border,
          height: 60,
          paddingBottom: 8,
          paddingTop: 8,
        },
        tabBarActiveTintColor: colors.dark.primary,
        tabBarInactiveTintColor: colors.dark.textSecondary,
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
        name="budget"
        options={{
          title: 'Budget',
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="wallet-outline" color={color} size={size} />
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
    </Tabs>
  );
}
