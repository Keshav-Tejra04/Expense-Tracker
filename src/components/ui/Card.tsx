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
        {
          backgroundColor: 'transparent',
          borderColor: themeColors.border,
          borderWidth: 1,
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
  },
});
