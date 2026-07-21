import React, { useState } from 'react';
import { useTheme } from '../context/ThemeContext';
import { View, Text, StyleSheet, ScrollView, Alert, TouchableOpacity, KeyboardAvoidingView, Platform, Pressable, TextInput } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '../context/AuthContext';
import { addLending, LendingType } from '../lib/lendings';
import { Input } from '../components/ui/Input';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { colors } from '../constants/colors';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { formatIndianNumber, parseIndianNumber } from '../lib/formatters';
import { DatePicker } from '../components/ui/DatePicker';

export default function AddLendingScreen() {
  const { theme } = useTheme();
  const themeColors = colors[theme];
  const styles = getStyles(themeColors);

  const { userData } = useAuth();
  const router = useRouter();
  
  const [type, setType] = useState<LendingType>('lent');
  const [paymentMethod, setPaymentMethod] = useState<'cash' | 'online'>('online');
  const [amount, setAmount] = useState('');
  const [personName, setPersonName] = useState('');
  const [note, setNote] = useState('');
  
  const today = new Date();
  const defaultDateStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
  const [dateStr, setDateStr] = useState(defaultDateStr);
  
  const [loading, setLoading] = useState(false);

  const handleSave = async () => {
    console.log('[AddLending] Saving lending record...', {
      amount,
      type,
      personName,
      dateStr,
      userData
    });

    const parsedAmount = parseIndianNumber(amount);

    if (parsedAmount <= 0) {
      console.warn('[AddLending] Validation failed: Invalid amount');
      Alert.alert('Invalid Amount', 'Please enter a valid amount.');
      return;
    }
    if (!personName.trim()) {
      console.warn('[AddLending] Validation failed: Missing person name');
      Alert.alert('Missing Name', 'Please enter the name of the person.');
      return;
    }
    if (!dateStr.match(/^\d{4}-\d{2}-\d{2}$/)) {
      console.warn('[AddLending] Validation failed: Invalid date format');
      Alert.alert('Invalid Date', 'Please use YYYY-MM-DD format.');
      return;
    }
    if (!userData?.familyId) {
      console.error('[AddLending] Validation failed: No familyId found in userData', userData);
      Alert.alert('Error', 'Family data not found.');
      return;
    }

    setLoading(true);
    try {
      const parsedDate = new Date(dateStr);
      await addLending(
        userData.familyId,
        type,
        parsedAmount,
        personName.trim(),
        parsedDate,
        note,
        paymentMethod
      );
      console.log('[AddLending] Lending record saved successfully!');
      if (router.canGoBack()) {
        router.back();
      } else {
        router.replace('/(tabs)/home');
      }
    } catch (error: any) {
      console.error('[AddLending] Failed to save lending record:', error);
      Alert.alert('Error', error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView 
      style={styles.container} 
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <View style={styles.header}>
        <View style={{ width: 40 }} />
        <Text style={styles.headerTitle}>Add Record</Text>
        <Pressable 
          style={({ pressed }) => [styles.closeBtn, pressed && { opacity: 0.5 }]} 
          onPress={() => {
            if (router.canGoBack()) {
              router.back();
            } else {
              router.replace('/(tabs)/home');
            }
          }}
        >
          <MaterialCommunityIcons name="close" size={24} color={themeColors.textSecondary} />
        </Pressable>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        
        {/* Toggle Buttons (Monochrome Transparent style) */}
        <View style={styles.toggleContainer}>
          <TouchableOpacity 
            style={[
              styles.toggleBtn, 
              type === 'lent' && { borderColor: themeColors.textPrimary }
            ]}
            onPress={() => setType('lent')}
          >
            <Text style={[styles.toggleText, type === 'lent' && { color: themeColors.textPrimary }]}>I Gave Money</Text>
          </TouchableOpacity>
          <View style={{ width: 12 }} />
          <TouchableOpacity 
            style={[
              styles.toggleBtn, 
              type === 'borrowed' && { borderColor: themeColors.textPrimary }
            ]}
            onPress={() => setType('borrowed')}
          >
            <Text style={[styles.toggleText, type === 'borrowed' && { color: themeColors.textPrimary }]}>I Took Money</Text>
          </TouchableOpacity>
        </View>

        {/* Payment Method Selector */}
        <View style={[styles.toggleContainer, { marginBottom: 32 }]}>
          <TouchableOpacity 
            style={[
              styles.toggleBtn, 
              paymentMethod === 'online' && { borderColor: themeColors.textPrimary },
              { flexDirection: 'row', justifyContent: 'center' }
            ]}
            onPress={() => setPaymentMethod('online')}
          >
            <MaterialCommunityIcons name="bank" size={16} color={paymentMethod === 'online' ? themeColors.textPrimary : themeColors.textSecondary} style={{ marginRight: 6 }} />
            <Text style={[styles.toggleText, paymentMethod === 'online' && { color: themeColors.textPrimary }]}>Online</Text>
          </TouchableOpacity>
          <View style={{ width: 12 }} />
          <TouchableOpacity 
            style={[
              styles.toggleBtn, 
              paymentMethod === 'cash' && { borderColor: themeColors.textPrimary },
              { flexDirection: 'row', justifyContent: 'center' }
            ]}
            onPress={() => setPaymentMethod('cash')}
          >
            <MaterialCommunityIcons name="cash-multiple" size={16} color={paymentMethod === 'cash' ? themeColors.textPrimary : themeColors.textSecondary} style={{ marginRight: 6 }} />
            <Text style={[styles.toggleText, paymentMethod === 'cash' && { color: themeColors.textPrimary }]}>Cash</Text>
          </TouchableOpacity>
        </View>

        {/* Large Amount Input */}
        <View style={styles.amountSection}>
          <Text style={[styles.currencySymbol, { color: themeColors.textPrimary }]}>₹</Text>
          <TextInput
            style={[styles.largeAmountInput, { color: themeColors.textPrimary }]}
            placeholder="0"
            placeholderTextColor={themeColors.border}
            value={amount}
            onChangeText={(val) => setAmount(formatIndianNumber(val))}
            keyboardType="default"
            autoFocus
          />
        </View>

        {/* Details Card */}
        <Card variant="glass" style={styles.detailsCard}>
          <Input
            label="Person's Name"
            placeholder="Who did you give/take from?"
            value={personName}
            onChangeText={setPersonName}
          />

          <DatePicker
            label="Date"
            value={dateStr}
            onChange={setDateStr}
          />

          <Input
            label="Note (Optional)"
            placeholder="Reason for this"
            value={note}
            onChangeText={setNote}
          />
        </Card>

        <Button 
          title="Save Record" 
          onPress={handleSave} 
          isLoading={loading}
          style={styles.saveBtn}
        />
        
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const getStyles = (themeColors: any) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: themeColors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: Platform.OS === 'ios' ? 60 : 40,
    paddingBottom: 20,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: themeColors.textPrimary,
  },
  closeBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: themeColors.surfaceHover,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scrollContent: {
    padding: 24,
    paddingBottom: 40,
  },
  toggleContainer: {
    flexDirection: 'row',
    marginBottom: 32,
  },
  toggleBtn: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: themeColors.border,
    alignItems: 'center',
    backgroundColor: 'transparent',
  },
  toggleText: {
    color: themeColors.textSecondary,
    fontWeight: '800',
    fontSize: 15,
  },
  amountSection: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 40,
  },
  currencySymbol: {
    fontSize: 48,
    fontWeight: '800',
    marginRight: 8,
    marginTop: -8,
  },
  largeAmountInput: {
    fontSize: 72,
    fontWeight: '800',
    minWidth: 100,
    textAlign: 'center',
  },
  detailsCard: {
    padding: 24,
    marginBottom: 24,
  },
  saveBtn: {
    marginTop: 8,
  },
});
