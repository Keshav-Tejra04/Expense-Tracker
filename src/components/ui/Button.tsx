import React from 'react';
import { TouchableOpacity, Text, StyleSheet, TouchableOpacityProps, ActivityIndicator } from 'react-native';
import { colors } from '../../constants/colors';

interface ButtonProps extends TouchableOpacityProps {
  title: string;
  variant?: 'primary' | 'secondary' | 'danger';
  isLoading?: boolean;
}

export function Button({ title, variant = 'primary', isLoading, style, ...props }: ButtonProps) {
  const themeColors = colors.dark;
  
  const getBackgroundColor = () => {
    switch (variant) {
      case 'primary': return themeColors.primary;
      case 'secondary': return themeColors.surfaceHover;
      case 'danger': return themeColors.expense;
      default: return themeColors.primary;
    }
  };

  const getTextColor = () => {
    switch (variant) {
      case 'primary': return '#FFFFFF';
      case 'secondary': return themeColors.textPrimary;
      case 'danger': return '#FFFFFF';
      default: return '#FFFFFF';
    }
  };

  return (
    <TouchableOpacity
      style={[
        styles.button,
        { backgroundColor: getBackgroundColor() },
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
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 8,
  },
  text: {
    fontSize: 16,
    fontWeight: '600',
  },
});
