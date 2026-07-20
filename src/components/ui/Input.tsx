import React, { useState } from 'react';
import { useTheme } from '../../context/ThemeContext';
import { TextInput, Text, View, StyleSheet, TextInputProps } from 'react-native';
import { colors } from '../../constants/colors';

interface InputProps extends TextInputProps {
  label?: string;
  error?: string;
}

export function Input({ label, error, style, ...props }: InputProps) {
  const { theme } = useTheme();
  const themeColors = colors[theme];
  const styles = getStyles(themeColors);
  const [isFocused, setIsFocused] = useState(false);

  return (
    <View style={styles.container}>
      {label && <Text style={[styles.label, { color: themeColors.textSecondary }]}>{label}</Text>}
      <TextInput
        style={[
          styles.input,
          { 
            backgroundColor: themeColors.surfaceHover,
            color: themeColors.textPrimary,
            borderColor: error ? themeColors.expense : (isFocused ? themeColors.primary : 'transparent'),
            borderWidth: 1.5,
          },
          style,
        ]}
        placeholderTextColor={themeColors.textMuted}
        onFocus={(e) => {
          setIsFocused(true);
          props.onFocus && props.onFocus(e);
        }}
        onBlur={(e) => {
          setIsFocused(false);
          props.onBlur && props.onBlur(e);
        }}
        {...props}
      />
      {error && <Text style={[styles.error, { color: themeColors.expense }]}>{error}</Text>}
    </View>
  );
}

const getStyles = (themeColors: any) => StyleSheet.create({
  container: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
    marginLeft: 4,
  },
  input: {
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
  },
  error: {
    fontSize: 12,
    marginTop: 6,
    marginLeft: 4,
  },
});
