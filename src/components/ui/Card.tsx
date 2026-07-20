import React from 'react';
import { View, ViewProps, StyleSheet } from 'react-native';
import { colors } from '../../constants/colors';

interface CardProps extends ViewProps {
  variant?: 'elevated' | 'flat';
}

export function Card({ children, variant = 'elevated', style, ...props }: CardProps) {
  const themeColors = colors.dark;
  
  return (
    <View
      style={[
        styles.card,
        {
          backgroundColor: themeColors.surface,
          borderColor: themeColors.border,
          borderWidth: variant === 'flat' ? 1 : 0,
        },
        style,
      ]}
      {...props}
    >
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 16,
    padding: 16,
    marginVertical: 8,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 4,
  },
});
