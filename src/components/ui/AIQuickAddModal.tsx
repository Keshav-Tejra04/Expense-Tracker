import React, { useState, useEffect } from 'react';
import { View, Text, Modal, StyleSheet, TouchableOpacity, TextInput, Alert, ScrollView, Pressable, ActivityIndicator } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { ExpoSpeechRecognitionModule, useSpeechRecognitionEvent } from 'expo-speech-recognition';
import { useTheme } from '../../context/ThemeContext';
import { colors } from '../../constants/colors';
import { useAuth } from '../../context/AuthContext';
import { parseExpenseWithAI, ParsedAIExpense } from '../../lib/aiService';
import { addTransaction } from '../../lib/transactions';
import { defaultExpenseCategories, defaultIncomeCategories } from '../../constants/categories';
import { Button } from './Button';
import { formatIndianNumber, parseIndianNumber } from '../../lib/formatters';

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
  const styles = getStyles(themeColors, theme);
  const { userData } = useAuth();

  const [input, setInput] = useState('');
  const [analyzing, setAnalyzing] = useState(false);
  const [parsedData, setParsedData] = useState<ParsedAIExpense | null>(null);
  const [saving, setSaving] = useState(false);
  const [showCategoryPicker, setShowCategoryPicker] = useState(false);
  const [isListening, setIsListening] = useState(false);

  // Handle Speech Recognition events
  useSpeechRecognitionEvent('start', () => setIsListening(true));
  useSpeechRecognitionEvent('end', () => setIsListening(false));
  useSpeechRecognitionEvent('error', (event) => {
    setIsListening(false);
    console.log('[SpeechRecognition] Error:', event.error, event.message);
  });

  useSpeechRecognitionEvent('result', (event) => {
    if (event.results && event.results.length > 0) {
      const recognizedText = event.results[0]?.transcript || '';
      setInput(recognizedText);
      if (event.isFinal && recognizedText.trim()) {
        handleAnalyze(recognizedText);
      }
    }
  });

  const toggleVoiceRecording = async () => {
    if (isListening) {
      try {
        ExpoSpeechRecognitionModule.stop();
      } catch (e) {
        console.warn(e);
      }
      setIsListening(false);
      return;
    }

    try {
      const perm = await ExpoSpeechRecognitionModule.requestPermissionsAsync();
      if (!perm.granted) {
        Alert.alert(
          'Microphone Permission Required',
          'Please allow microphone permission to use voice input.'
        );
        return;
      }

      setInput('');
      setParsedData(null);
      
      // Start listening with Hindi/English Indian locale
      ExpoSpeechRecognitionModule.start({
        lang: 'hi-IN',
        interimResults: true,
        continuous: false,
      });
    } catch (error: any) {
      console.warn('[SpeechRecognition] Start error:', error);
      Alert.alert('Voice Error', 'Speech recognition unavailable or failed to start. You can type or use your keyboard microphone.');
    }
  };

  const handleAnalyze = async (textToParse?: string) => {
    const targetText = textToParse || input;
    if (!targetText.trim()) {
      Alert.alert('Empty Input', 'Please speak, type, or select an expense sentence.');
      return;
    }

    setAnalyzing(true);
    setParsedData(null);
    setShowCategoryPicker(false);
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

    if (!parsedData.amount || parsedData.amount <= 0) {
      Alert.alert('Invalid Amount', 'Please enter a valid numeric amount.');
      return;
    }

    setSaving(true);
    try {
      const today = new Date();
      await addTransaction(
        userData.familyId,
        parsedData.type,
        parsedData.amount,
        parsedData.category || 'Other',
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
      setShowCategoryPicker(false);
      onClose();
      Alert.alert('Saved! ✨', 'Transaction logged successfully!');
    } catch (e: any) {
      Alert.alert('Error Saving', e.message);
    } finally {
      setSaving(false);
    }
  };

  const currentCategoryList = parsedData?.type === 'income' ? defaultIncomeCategories : defaultExpenseCategories;

  return (
    <Modal visible={visible} transparent animationType="slide">
      <View style={styles.overlay}>
        <View style={styles.card}>
          <View style={styles.header}>
            <View style={styles.headerTitleRow}>
              <MaterialCommunityIcons name="creation" size={24} color={themeColors.primary} style={{ marginRight: 8 }} />
              <Text style={styles.headerTitle}>AI Voice & Text Logger</Text>
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <MaterialCommunityIcons name="close" size={22} color={themeColors.textSecondary} />
            </TouchableOpacity>
          </View>

          <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
            <Text style={styles.subtitle}>
              Tap the 🎙️ Mic button below to speak in Hindi/Hinglish out loud, or type your sentence.
            </Text>

            {/* In-App Voice Mic Action Bar */}
            <TouchableOpacity
              style={[
                styles.voiceMicBtn,
                isListening && styles.voiceMicBtnActive
              ]}
              onPress={toggleVoiceRecording}
            >
              <MaterialCommunityIcons 
                name={isListening ? "microphone" : "microphone-outline"} 
                size={28} 
                color={isListening ? "#FFFFFF" : themeColors.textPrimary} 
              />
              <Text style={[
                styles.voiceMicText,
                isListening && { color: "#FFFFFF", fontWeight: '800' }
              ]}>
                {isListening ? "Listening... Speak Now! 🎙️" : "Tap to Speak (Hindi / Hinglish) 🎙️"}
              </Text>
            </TouchableOpacity>

            {/* Input box */}
            <View style={styles.inputContainer}>
              <TextInput
                style={styles.textInput}
                placeholder="Spoken or typed text will appear here..."
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

            {/* Editable Parsed Result Card */}
            {parsedData && (
              <View style={styles.resultCard}>
                <View style={styles.resultHeaderRow}>
                  <Text style={styles.resultTitle}>Verify & Edit Details:</Text>
                  <Text style={styles.editHintText}>Tap any field to change</Text>
                </View>
                
                {/* 1. Type Toggle */}
                <Text style={styles.fieldLabel}>Transaction Type:</Text>
                <View style={styles.toggleRow}>
                  {(['expense', 'income', 'transfer'] as const).map((t) => (
                    <Pressable
                      key={t}
                      style={[
                        styles.togglePill,
                        parsedData.type === t && { backgroundColor: themeColors.primary, borderColor: themeColors.primary }
                      ]}
                      onPress={() => setParsedData({ ...parsedData, type: t })}
                    >
                      <Text style={[
                        styles.togglePillText,
                        parsedData.type === t && { color: theme === 'dark' ? '#000000' : '#FFFFFF', fontWeight: '800' }
                      ]}>
                        {t}
                      </Text>
                    </Pressable>
                  ))}
                </View>

                {/* 2. Amount Input */}
                <Text style={styles.fieldLabel}>Amount (₹):</Text>
                <View style={styles.amountInputContainer}>
                  <Text style={styles.currencySymbol}>₹</Text>
                  <TextInput
                    style={styles.amountInput}
                    keyboardType="number-pad"
                    value={parsedData.amount ? formatIndianNumber(parsedData.amount.toString()) : ''}
                    onChangeText={(val) => {
                      const cleanNum = parseIndianNumber(val);
                      setParsedData({ ...parsedData, amount: cleanNum });
                    }}
                    placeholder="0"
                    placeholderTextColor={themeColors.textMuted}
                  />
                </View>

                {/* 3. Category Selector */}
                <Text style={styles.fieldLabel}>Category:</Text>
                <TouchableOpacity
                  style={styles.categorySelectBtn}
                  onPress={() => setShowCategoryPicker(!showCategoryPicker)}
                >
                  <View style={styles.categorySelectLeft}>
                    <MaterialCommunityIcons name="folder-outline" size={18} color={themeColors.textPrimary} style={{ marginRight: 8 }} />
                    <Text style={styles.categorySelectText}>{parsedData.category || 'Select Category'}</Text>
                  </View>
                  <MaterialCommunityIcons name={showCategoryPicker ? "chevron-up" : "chevron-down"} size={20} color={themeColors.textSecondary} />
                </TouchableOpacity>

                {/* Inline Category Grid */}
                {showCategoryPicker && (
                  <View style={styles.categoryGrid}>
                    {currentCategoryList.map((cat) => (
                      <TouchableOpacity
                        key={cat.id}
                        style={[
                          styles.catGridChip,
                          parsedData.category === cat.name && { backgroundColor: themeColors.surfaceHover, borderColor: themeColors.primary }
                        ]}
                        onPress={() => {
                          setParsedData({ ...parsedData, category: cat.name });
                          setShowCategoryPicker(false);
                        }}
                      >
                        <MaterialCommunityIcons name={cat.icon} size={16} color={cat.color} style={{ marginRight: 4 }} />
                        <Text style={[
                          styles.catGridText,
                          parsedData.category === cat.name && { color: themeColors.textPrimary, fontWeight: '800' }
                        ]}>
                          {cat.name}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                )}

                {/* 4. Payment Method */}
                {parsedData.type !== 'transfer' && (
                  <>
                    <Text style={styles.fieldLabel}>Payment Mode:</Text>
                    <View style={styles.toggleRow}>
                      {(['online', 'cash'] as const).map((mode) => (
                        <Pressable
                          key={mode}
                          style={[
                            styles.togglePill,
                            parsedData.paymentMethod === mode && { backgroundColor: themeColors.primary, borderColor: themeColors.primary }
                          ]}
                          onPress={() => setParsedData({ ...parsedData, paymentMethod: mode })}
                        >
                          <Text style={[
                            styles.togglePillText,
                            parsedData.paymentMethod === mode && { color: theme === 'dark' ? '#000000' : '#FFFFFF', fontWeight: '800' }
                          ]}>
                            {mode}
                          </Text>
                        </Pressable>
                      ))}
                    </View>
                  </>
                )}

                {/* 5. Note Input */}
                <Text style={styles.fieldLabel}>Note:</Text>
                <View style={styles.noteInputContainer}>
                  <TextInput
                    style={styles.noteInput}
                    value={parsedData.note}
                    onChangeText={(val) => setParsedData({ ...parsedData, note: val })}
                    placeholder="Transaction note"
                    placeholderTextColor={themeColors.textMuted}
                  />
                </View>

                {/* Save Button */}
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

const getStyles = (themeColors: any, theme: string) => StyleSheet.create({
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
    maxHeight: '88%',
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
    paddingBottom: 32,
  },
  subtitle: {
    fontSize: 13,
    color: themeColors.textSecondary,
    marginBottom: 16,
    lineHeight: 18,
  },
  voiceMicBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: themeColors.surfaceHover,
    borderColor: themeColors.border,
    borderWidth: 1.5,
    borderRadius: 100,
    paddingVertical: 14,
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  voiceMicBtnActive: {
    backgroundColor: themeColors.expense || '#F43F5E',
    borderColor: 'transparent',
  },
  voiceMicText: {
    fontSize: 14,
    fontWeight: '700',
    color: themeColors.textPrimary,
    marginLeft: 8,
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
    borderRadius: 24,
    borderWidth: 1.5,
    borderColor: themeColors.border,
  },
  resultHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  resultTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: themeColors.textPrimary,
  },
  editHintText: {
    fontSize: 11,
    color: themeColors.textSecondary,
    fontWeight: '600',
  },
  fieldLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: themeColors.textSecondary,
    marginTop: 10,
    marginBottom: 6,
    textTransform: 'uppercase',
  },
  toggleRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 8,
  },
  togglePill: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 100,
    backgroundColor: themeColors.surfaceHover,
    borderWidth: 1,
    borderColor: themeColors.border,
    alignItems: 'center',
  },
  togglePillText: {
    fontSize: 13,
    fontWeight: '600',
    color: themeColors.textPrimary,
    textTransform: 'capitalize',
  },
  amountInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: themeColors.surfaceHover,
    borderRadius: 14,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: themeColors.border,
    marginBottom: 8,
  },
  currencySymbol: {
    fontSize: 18,
    fontWeight: '800',
    color: themeColors.primary,
    marginRight: 6,
  },
  amountInput: {
    flex: 1,
    fontSize: 18,
    fontWeight: '800',
    color: themeColors.textPrimary,
  },
  categorySelectBtn: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: themeColors.surfaceHover,
    borderRadius: 14,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: themeColors.border,
    marginBottom: 8,
  },
  categorySelectLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  categorySelectText: {
    fontSize: 14,
    fontWeight: '700',
    color: themeColors.textPrimary,
  },
  categoryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginBottom: 12,
    backgroundColor: themeColors.surface,
    padding: 10,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: themeColors.border,
  },
  catGridChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 100,
    borderWidth: 1,
    borderColor: themeColors.border,
    backgroundColor: themeColors.background,
  },
  catGridText: {
    fontSize: 11,
    color: themeColors.textSecondary,
    fontWeight: '600',
  },
  noteInputContainer: {
    backgroundColor: themeColors.surfaceHover,
    borderRadius: 14,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: themeColors.border,
    marginBottom: 8,
  },
  noteInput: {
    fontSize: 14,
    color: themeColors.textPrimary,
  },
});
