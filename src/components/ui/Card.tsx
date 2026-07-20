import React from 'react';
import { useTheme } from '../../context/ThemeContext';
import { View, ViewProps, StyleSheet } from 'react-native';
import { colors } from '../../constants/colors';

interface CardProps extends ViewProps {
  variant?: 'elevated' | 'flat' | 'glass';
}

export function Card({ children, variant = 'elevated', style, ...props }: CardProps) {
  const { theme } = useTheme();
  const themeColors = colors[theme];
  const styles = getStyles(themeColors);
  
  return (
    <View
      style={[
        styles.card,
        variant === 'glass' ? {
          backgroundColor: themeColors.glass,
          borderColor: themeColors.border,
          borderWidth: 1,
        } : {
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

const getStyles = (themeColors: any) => StyleSheet.create({
  card: {
    borderRadius: 24, // Bigger radius
    padding: 20,
    marginVertical: 8,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 8,
    },
    shadowOpacity: 0.08,
    shadowRadius: 24,
    elevation: 3,
  },
});
