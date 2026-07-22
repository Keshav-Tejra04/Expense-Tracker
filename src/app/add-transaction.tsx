import React, { useState } from 'react';
import { useTheme } from '../context/ThemeContext';
import { View, Text, StyleSheet, ScrollView, Pressable, Alert, KeyboardAvoidingView, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useAuth } from '../context/AuthContext';
import { addTransaction, TransactionType } from '../lib/transactions';
import { defaultExpenseCategories, defaultIncomeCategories } from '../constants/categories';
import { Input } from '../components/ui/Input';
import { Button } from '../components/ui/Button';
import { colors } from '../constants/colors';
import { formatIndianNumber, parseIndianNumber } from '../lib/formatters';
import { DatePicker } from '../components/ui/DatePicker';

export default function AddTransactionScreen() {
  const { theme } = useTheme();
  const themeColors = colors[theme];
  const styles = getStyles(themeColors);

  const { userData } = useAuth();
  const router = useRouter();
  
  const [type, setType] = useState<TransactionType>('expense');
  const [paymentMethod, setPaymentMethod] = useState<'cash' | 'online'>('online');
  const [transferSource, setTransferSource] = useState<'cash' | 'online'>('online'); // Used if type === 'transfer'
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('');
  const [note, setNote] = useState('');
  
  const today = new Date();
  const defaultDateStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
  const [dateStr, setDateStr] = useState(defaultDateStr);
  
  const [loading, setLoading] = useState(false);

  const activeCategories = type === 'expense' ? defaultExpenseCategories : defaultIncomeCategories;

  const handleSave = async () => {
    console.log('[AddTransaction] Saving transaction...', {
      amount,
      type,
      category,
      dateStr,
      userData
    });

    const parsedAmount = parseIndianNumber(amount);

    if (parsedAmount <= 0) {
      console.warn('[AddTransaction] Validation failed: Invalid amount');
      Alert.alert('Invalid Amount', 'Please enter a valid amount.');
      return;
    }
    if (type !== 'transfer' && !category) {
      console.warn('[AddTransaction] Validation failed: Missing category');
      Alert.alert('Missing Category', 'Please select a category.');
      return;
    }
    if (!dateStr.match(/^\d{4}-\d{2}-\d{2}$/)) {
      console.warn('[AddTransaction] Validation failed: Invalid date format');
      Alert.alert('Invalid Date', 'Please use YYYY-MM-DD format.');
      return;
    }
    if (!userData?.familyId) {
      console.error('[AddTransaction] Validation failed: No familyId found in userData', userData);
      Alert.alert('Error', 'Family data not found.');
      return;
    }

    setLoading(true);
    try {
      const parsedDate = new Date(dateStr);
      await addTransaction(
        userData.familyId,
        type,
        parsedAmount,
        type === 'transfer' ? 'Transfer' : category,
        userData.name,
        userData.uid,
        parsedDate,
        note,
        type === 'transfer' ? undefined : paymentMethod,
        type === 'transfer' ? transferSource : undefined
      );
      console.log('[AddTransaction] Transaction saved successfully!');
      if (router.canGoBack()) {
        router.back();
      } else {
        router.replace('/(tabs)/home');
      }
    } catch (error: any) {
      console.error('[AddTransaction] Failed to save transaction:', error);
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
        <Pressable 
          onPress={() => {
            if (router.canGoBack()) {
              router.back();
            } else {
              router.replace('/(tabs)/home');
            }
          }} 
          style={styles.closeBtn}
        >
          <MaterialCommunityIcons name="close" size={28} color={themeColors.textPrimary} />
        </Pressable>
        <Text style={styles.headerTitle}>New Transaction</Text>
        <View style={styles.closeBtn} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.formCard}>
          {/* Type Toggle */}
          <View style={styles.toggleContainer}>
            <Pressable 
              style={({ pressed }) => [
                styles.toggleBtn, 
                type === 'expense' && { borderColor: themeColors.textPrimary },
                { transform: [{ scale: pressed ? 0.96 : 1 }] }
              ]}
              onPress={() => { setType('expense'); setCategory(''); }}
            >
              <Text style={[styles.toggleText, type === 'expense' && styles.toggleTextActive]}>Expense</Text>
            </Pressable>
            <View style={{ width: 8 }} />
            <Pressable 
              style={({ pressed }) => [
                styles.toggleBtn, 
                type === 'income' && { borderColor: themeColors.textPrimary },
                { transform: [{ scale: pressed ? 0.96 : 1 }] }
              ]}
              onPress={() => { setType('income'); setCategory(''); }}
            >
              <Text style={[styles.toggleText, type === 'income' && styles.toggleTextActive]}>Income</Text>
            </Pressable>
            <View style={{ width: 8 }} />
            <Pressable 
              style={({ pressed }) => [
                styles.toggleBtn, 
                type === 'transfer' && { borderColor: themeColors.textPrimary },
                { transform: [{ scale: pressed ? 0.96 : 1 }] }
              ]}
              onPress={() => { setType('transfer'); setCategory('Transfer'); }}
            >
              <Text style={[styles.toggleText, type === 'transfer' && styles.toggleTextActive]}>Transfer</Text>
            </Pressable>
          </View>

          {/* Payment Method / Transfer Source Selector */}
          <Text style={styles.sectionTitle}>
            {type === 'transfer' ? 'Transfer From' : 'Payment Method'}
          </Text>
          <View style={styles.toggleContainer}>
            <Pressable 
              style={({ pressed }) => [
                styles.toggleBtn, 
                (type === 'transfer' ? transferSource : paymentMethod) === 'online' && { borderColor: themeColors.textPrimary },
                { transform: [{ scale: pressed ? 0.96 : 1 }] }
              ]}
              onPress={() => type === 'transfer' ? setTransferSource('online') : setPaymentMethod('online')}
            >
              <MaterialCommunityIcons name="bank" size={16} color={(type === 'transfer' ? transferSource : paymentMethod) === 'online' ? themeColors.textPrimary : themeColors.textSecondary} style={{ marginBottom: 4 }} />
              <Text style={[styles.toggleText, (type === 'transfer' ? transferSource : paymentMethod) === 'online' && styles.toggleTextActive]}>Online</Text>
            </Pressable>
            <View style={{ width: 12 }} />
            <Pressable 
              style={({ pressed }) => [
                styles.toggleBtn, 
                (type === 'transfer' ? transferSource : paymentMethod) === 'cash' && { borderColor: themeColors.textPrimary },
                { transform: [{ scale: pressed ? 0.96 : 1 }] }
              ]}
              onPress={() => type === 'transfer' ? setTransferSource('cash') : setPaymentMethod('cash')}
            >
              <MaterialCommunityIcons name="cash-multiple" size={16} color={(type === 'transfer' ? transferSource : paymentMethod) === 'cash' ? themeColors.textPrimary : themeColors.textSecondary} style={{ marginBottom: 4 }} />
              <Text style={[styles.toggleText, (type === 'transfer' ? transferSource : paymentMethod) === 'cash' && styles.toggleTextActive]}>Cash</Text>
            </Pressable>
          </View>

          {/* Transfer Destination Readonly label */}
          {type === 'transfer' && (
            <View style={{ marginBottom: 24, padding: 12, backgroundColor: themeColors.surfaceHover, borderRadius: 12, alignItems: 'center' }}>
              <MaterialCommunityIcons name="arrow-down" size={24} color={themeColors.textSecondary} style={{ marginBottom: 4 }} />
              <Text style={{ color: themeColors.textSecondary, fontWeight: '600' }}>
                Transfer To: {transferSource === 'online' ? 'Cash' : 'Online'}
              </Text>
            </View>
          )}

          {/* Amount Input */}
          <Input
            label="Amount (₹)"
            placeholder="0"
            value={amount}
            onChangeText={(val) => setAmount(formatIndianNumber(val))}
            keyboardType="number-pad"
            style={styles.amountInput}
          />

          {/* Date Input */}
          <DatePicker
            label="Date"
            value={dateStr}
            onChange={setDateStr}
          />

          {/* Categories Grid */}
          {type !== 'transfer' && (
            <>
              <Text style={styles.sectionTitle}>Select Category</Text>
              <View style={styles.categoryGrid}>
                {activeCategories.map(cat => (
                  <Pressable 
                    key={cat.id} 
                    style={({ pressed }) => [
                      styles.categoryChip, 
                      category === cat.name && { borderColor: themeColors.textPrimary, backgroundColor: themeColors.surfaceHover },
                      { transform: [{ scale: pressed ? 0.92 : 1 }] }
                    ]}
                    onPress={() => setCategory(cat.name)}
                  >
                    <MaterialCommunityIcons name={cat.icon} size={28} color={category === cat.name ? themeColors.textPrimary : cat.color} />
                    <Text style={[styles.categoryName, category === cat.name && { color: themeColors.textPrimary }]}>{cat.name}</Text>
                  </Pressable>
                ))}
              </View>
            </>
          )}

          {/* Note Input */}
          <Input
            label="Note (Optional)"
            placeholder="What was this for?"
            value={note}
            onChangeText={setNote}
          />

          {/* Save Button */}
          <Button 
            title="Save Transaction" 
            onPress={handleSave} 
            isLoading={loading}
            style={styles.saveBtn}
          />
        </View>
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
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingTop: Platform.OS === 'ios' ? 64 : 24,
    paddingBottom: 24,
  },
  closeBtn: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: themeColors.textPrimary,
    letterSpacing: 0.5,
  },
  scrollContent: {
    padding: 24,
    paddingTop: 8,
    paddingBottom: 48,
  },
  formCard: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: themeColors.border,
    borderRadius: 32,
    padding: 24,
  },
  toggleContainer: {
    flexDirection: 'row',
    marginBottom: 24,
    backgroundColor: themeColors.surfaceHover,
    padding: 6,
    borderRadius: 100,
  },
  toggleBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 100,
    alignItems: 'center',
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: 'transparent',
  },
  toggleText: {
    color: themeColors.textSecondary,
    fontWeight: '700',
    fontSize: 14,
  },
  toggleTextActive: {
    color: themeColors.textPrimary,
  },
  amountInput: {
    fontSize: 32,
    fontWeight: '800',
    letterSpacing: -1,
  },
  sectionTitle: {
    fontSize: 14,
    color: themeColors.textSecondary,
    marginTop: 12,
    marginBottom: 16,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  categoryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  categoryChip: {
    width: '31%',
    aspectRatio: 1.2,
    backgroundColor: 'transparent',
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
    borderWidth: 1,
    borderColor: themeColors.border,
    padding: 8,
  },
  categoryName: {
    color: themeColors.textPrimary,
    fontSize: 11,
    marginTop: 6,
    fontWeight: '600',
    textAlign: 'center',
  },
  saveBtn: {
    marginTop: 16,
    marginBottom: 8,
  },
});
