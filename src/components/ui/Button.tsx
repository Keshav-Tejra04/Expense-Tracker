import React from 'react';
import { useTheme } from '../../context/ThemeContext';
import { Pressable, Text, StyleSheet, PressableProps, ActivityIndicator } from 'react-native';
import { colors } from '../../constants/colors';

interface ButtonProps extends Omit<PressableProps, 'style'> {
  title: string;
  variant?: 'primary' | 'secondary' | 'danger';
  isLoading?: boolean;
  style?: any;
}

export function Button({ title, variant = 'primary', isLoading, style, ...props }: ButtonProps) {
  const { theme } = useTheme();
  const themeColors = colors[theme];
  const styles = getStyles(themeColors);
  
  const getBorderColor = () => {
    switch (variant) {
      case 'primary': return themeColors.textPrimary;
      case 'secondary': return themeColors.border;
      case 'danger': return themeColors.expense;
      default: return themeColors.textPrimary;
    }
  };

  const getBackgroundColor = (pressed: boolean) => {
    switch (variant) {
      case 'primary': return pressed ? themeColors.surfaceHover : 'transparent';
      case 'secondary': return pressed ? themeColors.surfaceHover : 'transparent';
      case 'danger': return pressed ? `${themeColors.expense}20` : 'transparent';
      default: return 'transparent';
    }
  };

  const getTextColor = () => {
    switch (variant) {
      case 'primary': return themeColors.textPrimary;
      case 'secondary': return themeColors.textPrimary;
      case 'danger': return themeColors.expense;
      default: return themeColors.textPrimary;
    }
  };

  return (
    <Pressable
      style={({ pressed }) => [
        styles.button,
        { 
          backgroundColor: getBackgroundColor(pressed),
          borderColor: getBorderColor(),
          borderWidth: 1.5,
          transform: [{ scale: pressed ? 0.97 : 1 }],
          opacity: (isLoading || props.disabled) ? 0.5 : 1,
        },
        style,
      ]}
      disabled={isLoading || props.disabled}
      {...props}
    >
      {isLoading ? (
        <ActivityIndicator color={getTextColor()} />
      ) : (
        <Text style={[styles.text, { color: getTextColor() }]}>{title}</Text>
      )}
    </Pressable>
  );
}

const getStyles = (themeColors: any) => StyleSheet.create({
  button: {
    borderRadius: 100, // Pill shape
    paddingVertical: 14,
    paddingHorizontal: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 8,
  },
  text: {
    fontSize: 16,
    fontWeight: '800',
    letterSpacing: 0.3,
  },
});
