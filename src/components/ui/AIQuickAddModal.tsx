import React, { useState } from 'react';
import { View, Text, Modal, StyleSheet, TouchableOpacity, TextInput, ActivityIndicator, Alert, ScrollView } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useTheme } from '../../context/ThemeContext';
import { colors } from '../../constants/colors';
import { useAuth } from '../../context/AuthContext';
import { parseExpenseWithAI, ParsedAIExpense } from '../../lib/aiService';
import { addTransaction } from '../../lib/transactions';
import { Button } from './Button';
import { formatIndianNumber } from '../../lib/formatters';

interface AIQuickAddModalProps {
  visible: boolean;
  onClose: () => void;
}

const SAMPLE_PROMPTS = [
  "School se 450 rupaye aaye",
  "School fee 3500 online pay ki",
  "Paid 450 cash for groceries at DMart",
  "Doodh ke 150 rupaye online diye",
];

export function AIQuickAddModal({ visible, onClose }: AIQuickAddModalProps) {
  const { theme } = useTheme();
  const themeColors = colors[theme];
  const styles = getStyles(themeColors);
  const { userData } = useAuth();

  const [input, setInput] = useState('');
  const [analyzing, setAnalyzing] = useState(false);
  const [parsedData, setParsedData] = useState<ParsedAIExpense | null>(null);
  const [saving, setSaving] = useState(false);

  const handleAnalyze = async (textToParse?: string) => {
    const targetText = textToParse || input;
    if (!targetText.trim()) {
      Alert.alert('Empty Input', 'Please type or select an expense sentence.');
      return;
    }

    setAnalyzing(true);
    setParsedData(null);
    try {
      const res = await parseExpenseWithAI(targetText);
      setParsedData(res);
    } catch (e: any) {
      Alert.alert('AI Error', e.message);
    } finally {
      setAnalyzing(false);
    }
  };

  const handleConfirmSave = async () => {
    if (!parsedData || !userData?.familyId) {
      Alert.alert('Error', 'Missing transaction data or family account');
      return;
    }

    if (parsedData.amount <= 0) {
      Alert.alert('Invalid Amount', 'Please check the parsed amount.');
      return;
    }

    setSaving(true);
    try {
      const today = new Date();
      await addTransaction(
        userData.familyId,
        parsedData.type,
        parsedData.amount,
        parsedData.category,
        userData.name,
        userData.uid,
        today,
        parsedData.note,
        parsedData.type === 'transfer' ? undefined : parsedData.paymentMethod,
        parsedData.type === 'transfer' ? parsedData.paymentMethod : undefined
      );

      // Reset and close
      setInput('');
      setParsedData(null);
      onClose();
      Alert.alert('Saved! ✨', 'Transaction logged successfully!');
    } catch (e: any) {
      Alert.alert('Error Saving', e.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal visible={visible} transparent animationType="slide">
      <View style={styles.overlay}>
        <View style={styles.card}>
          <View style={styles.header}>
            <View style={styles.headerTitleRow}>
              <MaterialCommunityIcons name="creation" size={24} color={themeColors.primary} style={{ marginRight: 8 }} />
              <Text style={styles.headerTitle}>AI Smart Quick Add</Text>
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <MaterialCommunityIcons name="close" size={22} color={themeColors.textSecondary} />
            </TouchableOpacity>
          </View>

          <ScrollView contentContainerStyle={styles.content}>
            <Text style={styles.subtitle}>
              Type or paste any sentence in English or Hinglish (e.g. "Doodh ke 150 rupaye cash me" or "450 paid for petrol online")
            </Text>

            {/* Input box */}
            <View style={styles.inputContainer}>
              <TextInput
                style={styles.textInput}
                placeholder="e.g. Paid 450 cash for groceries at DMart"
                placeholderTextColor={themeColors.textMuted}
                value={input}
                onChangeText={setInput}
                multiline
                numberOfLines={2}
              />
            </View>

            {/* Sample Chip Quick Buttons */}
            <Text style={styles.sampleHeader}>Tap an example to try:</Text>
            <View style={styles.chipContainer}>
              {SAMPLE_PROMPTS.map((prompt, idx) => (
                <TouchableOpacity 
                  key={idx} 
                  style={styles.chip}
                  onPress={() => {
                    setInput(prompt);
                    handleAnalyze(prompt);
                  }}
                >
                  <Text style={styles.chipText}>{prompt}</Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* Analyze Button */}
            <Button
              title="✨ Parse with AI"
              onPress={() => handleAnalyze()}
              isLoading={analyzing}
              style={{ marginTop: 16 }}
            />

            {/* Parsed Result Box */}
            {parsedData && (
              <View style={styles.resultCard}>
                <Text style={styles.resultTitle}>Parsed Details:</Text>
                
                <View style={styles.resultRow}>
                  <Text style={styles.resultLabel}>Type:</Text>
                  <Text style={[styles.resultValue, { textTransform: 'capitalize' }]}>{parsedData.type}</Text>
                </View>

                <View style={styles.resultRow}>
                  <Text style={styles.resultLabel}>Amount:</Text>
                  <Text style={[styles.resultValue, { color: themeColors.primary, fontWeight: '800' }]}>
                    ₹{formatIndianNumber(parsedData.amount.toString())}
                  </Text>
                </View>

                <View style={styles.resultRow}>
                  <Text style={styles.resultLabel}>Category:</Text>
                  <Text style={styles.resultValue}>{parsedData.category}</Text>
                </View>

                <View style={styles.resultRow}>
                  <Text style={styles.resultLabel}>Payment Mode:</Text>
                  <Text style={[styles.resultValue, { textTransform: 'capitalize' }]}>{parsedData.paymentMethod}</Text>
                </View>

                <View style={styles.resultRow}>
                  <Text style={styles.resultLabel}>Note:</Text>
                  <Text style={styles.resultValue}>{parsedData.note}</Text>
                </View>

                <Button
                  title="Confirm & Save Transaction"
                  onPress={handleConfirmSave}
                  isLoading={saving}
                  style={{ marginTop: 16 }}
                />
              </View>
            )}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

const getStyles = (themeColors: any) => StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.65)',
    justifyContent: 'flex-end',
  },
  card: {
    backgroundColor: themeColors.surface,
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    padding: 24,
    maxHeight: '85%',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  headerTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: themeColors.textPrimary,
  },
  closeBtn: {
    padding: 6,
    backgroundColor: themeColors.surfaceHover,
    borderRadius: 100,
  },
  content: {
    paddingBottom: 24,
  },
  subtitle: {
    fontSize: 13,
    color: themeColors.textSecondary,
    marginBottom: 16,
    lineHeight: 18,
  },
  inputContainer: {
    backgroundColor: themeColors.surfaceHover,
    borderRadius: 16,
    padding: 12,
    borderWidth: 1.5,
    borderColor: themeColors.border,
    marginBottom: 16,
  },
  textInput: {
    color: themeColors.textPrimary,
    fontSize: 15,
    minHeight: 50,
    textAlignVertical: 'top',
  },
  sampleHeader: {
    fontSize: 12,
    fontWeight: '700',
    color: themeColors.textSecondary,
    marginBottom: 8,
    textTransform: 'uppercase',
  },
  chipContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  chip: {
    backgroundColor: themeColors.surfaceHover,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 100,
    borderWidth: 1,
    borderColor: themeColors.border,
  },
  chipText: {
    color: themeColors.textPrimary,
    fontSize: 12,
    fontWeight: '600',
  },
  resultCard: {
    marginTop: 20,
    backgroundColor: themeColors.background,
    padding: 16,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: themeColors.border,
  },
  resultTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: themeColors.textPrimary,
    marginBottom: 12,
  },
  resultRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  resultLabel: {
    fontSize: 13,
    color: themeColors.textSecondary,
  },
  resultValue: {
    fontSize: 14,
    color: themeColors.textPrimary,
    fontWeight: '700',
  },
});
