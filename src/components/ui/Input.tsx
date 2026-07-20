import React from 'react';
import { useTheme } from '../../context/ThemeContext';
import { TextInput, TextInputProps, View, Text, StyleSheet } from 'react-native';
import { colors } from '../../constants/colors';

interface InputProps extends TextInputProps {
  label?: string;
  error?: string;
}

export function Input({ label, error, style, ...props }: InputProps) {
  const { theme } = useTheme();
  const themeColors = colors[theme];
  const styles = getStyles(themeColors);

  return (
    <View style={styles.container}>
      {label && <Text style={[styles.label, { color: themeColors.textSecondary }]}>{label}</Text>}
      <TextInput
        style={[
          styles.input,
          { 
            backgroundColor: themeColors.surface,
            borderColor: error ? themeColors.expense : themeColors.border,
            color: themeColors.textPrimary
          },
          style,
        ]}
        placeholderTextColor={themeColors.textMuted}
        {...props}
      />
      {error && <Text style={[styles.error, { color: themeColors.expense }]}>{error}</Text>}
    </View>
  );
}

const getStyles = (themeColors: any) => StyleSheet.create({
  container: {
    marginVertical: 8,
  },
  label: {
    fontSize: 14,
    marginBottom: 6,
    fontWeight: '500',
  },
  input: {
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
  },
  error: {
    fontSize: 12,
    marginTop: 4,
  },
});
