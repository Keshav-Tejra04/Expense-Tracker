import React, { useEffect, useState } from 'react';
import { View, Text, Modal, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';
import * as Updates from 'expo-updates';
import { useTheme } from '../../context/ThemeContext';
import { colors } from '../../constants/colors';
import { MaterialCommunityIcons } from '@expo/vector-icons';

export function UpdatePromptModal() {
  const { theme } = useTheme();
  const themeColors = colors[theme];
  const styles = getStyles(themeColors);

  const [updateAvailable, setUpdateAvailable] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);

  useEffect(() => {
    async function checkUpdates() {
      if (__DEV__) return; // Don't check in development mode
      try {
        const update = await Updates.checkForUpdateAsync();
        if (update.isAvailable) {
          setUpdateAvailable(true);
        }
      } catch (error) {
        console.log('[UpdatePrompt] Update check ignored or offline:', error);
      }
    }

    checkUpdates();
  }, []);

  const handleApplyUpdate = async () => {
    setIsUpdating(true);
    try {
      await Updates.fetchUpdateAsync();
      await Updates.reloadAsync();
    } catch (error: any) {
      console.error('[UpdatePrompt] Error applying update:', error);
      setIsUpdating(false);
      setUpdateAvailable(false);
    }
  };

  if (!updateAvailable) return null;

  return (
    <Modal visible={updateAvailable} transparent animationType="fade">
      <View style={styles.overlay}>
        <View style={styles.card}>
          <View style={styles.iconContainer}>
            <MaterialCommunityIcons name="cloud-download-outline" size={36} color={themeColors.primary} />
          </View>

          <Text style={styles.title}>Update Available!</Text>
          <Text style={styles.subtitle}>
            A new version of Ghar Kharch is available with fixes and enhancements. Tap below to update now.
          </Text>

          <TouchableOpacity 
            style={styles.updateButton} 
            onPress={handleApplyUpdate}
            disabled={isUpdating}
          >
            {isUpdating ? (
              <ActivityIndicator size="small" color="#FFFFFF" />
            ) : (
              <Text style={styles.updateButtonText}>Update Now</Text>
            )}
          </TouchableOpacity>

          {!isUpdating && (
            <TouchableOpacity 
              style={styles.dismissButton} 
              onPress={() => setUpdateAvailable(false)}
            >
              <Text style={styles.dismissText}>Later</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    </Modal>
  );
}

const getStyles = (themeColors: any) => StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.65)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  card: {
    backgroundColor: themeColors.surface,
    borderRadius: 24,
    padding: 24,
    width: '100%',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.25,
    shadowRadius: 20,
    elevation: 10,
    borderWidth: 1,
    borderColor: themeColors.border,
  },
  iconContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: `${themeColors.primary}20`,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 22,
    fontWeight: '800',
    color: themeColors.textPrimary,
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 14,
    color: themeColors.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 24,
  },
  updateButton: {
    backgroundColor: themeColors.primary,
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 100,
    width: '100%',
    alignItems: 'center',
    marginBottom: 12,
  },
  updateButtonText: {
    color: '#FFFFFF',
    fontWeight: '800',
    fontSize: 16,
  },
  dismissButton: {
    paddingVertical: 8,
  },
  dismissText: {
    color: themeColors.textMuted,
    fontWeight: '600',
    fontSize: 14,
  },
});
