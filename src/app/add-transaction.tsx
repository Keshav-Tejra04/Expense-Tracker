import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, KeyboardAvoidingView, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useAuth } from '../context/AuthContext';
import { addTransaction, TransactionType } from '../lib/transactions';
import { defaultExpenseCategories, defaultIncomeCategories } from '../constants/categories';
import { Input } from '../components/ui/Input';
import { Button } from '../components/ui/Button';
import { colors } from '../constants/colors';

export default function AddTransactionScreen() {
  const { userData } = useAuth();
  const router = useRouter();
  
  const [type, setType] = useState<TransactionType>('expense');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('');
  const [note, setNote] = useState('');
  
  // Format today's date as YYYY-MM-DD
  const today = new Date();
  const defaultDateStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
  const [dateStr, setDateStr] = useState(defaultDateStr);
  
  const [loading, setLoading] = useState(false);

  const activeCategories = type === 'expense' ? defaultExpenseCategories : defaultIncomeCategories;

  const handleSave = async () => {
    if (!amount || isNaN(Number(amount)) || Number(amount) <= 0) {
      Alert.alert('Invalid Amount', 'Please enter a valid amount.');
      return;
    }
    if (!category) {
      Alert.alert('Missing Category', 'Please select a category.');
      return;
    }
    if (!dateStr.match(/^\d{4}-\d{2}-\d{2}$/)) {
      Alert.alert('Invalid Date', 'Please use YYYY-MM-DD format.');
      return;
    }
    if (!userData?.familyId) {
      Alert.alert('Error', 'Family data not found.');
      return;
    }

    setLoading(true);
    try {
      const parsedDate = new Date(dateStr);
      await addTransaction(
        userData.familyId,
        type,
        Number(amount),
        category,
        userData.name,
        userData.uid,
        parsedDate,
        note
      );
      router.back();
    } catch (error: any) {
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
      <ScrollView contentContainerStyle={styles.scrollContent}>
        
        {/* Type Toggle */}
        <View style={styles.toggleContainer}>
          <TouchableOpacity 
            style={[styles.toggleBtn, type === 'expense' && { backgroundColor: colors.dark.expense }]}
            onPress={() => { setType('expense'); setCategory(''); }}
          >
            <Text style={[styles.toggleText, type === 'expense' && styles.toggleTextActive]}>Expense</Text>
          </TouchableOpacity>
          <View style={{ width: 12 }} />
          <TouchableOpacity 
            style={[styles.toggleBtn, type === 'income' && { backgroundColor: colors.dark.income }]}
            onPress={() => { setType('income'); setCategory(''); }}
          >
            <Text style={[styles.toggleText, type === 'income' && styles.toggleTextActive]}>Income</Text>
          </TouchableOpacity>
        </View>

        {/* Amount Input */}
        <Input
          label="Amount (₹)"
          placeholder="0.00"
          value={amount}
          onChangeText={setAmount}
          keyboardType="numeric"
          style={styles.amountInput}
        />

        {/* Date Input */}
        <Input
          label="Date (YYYY-MM-DD)"
          value={dateStr}
          onChangeText={setDateStr}
        />

        {/* Categories Grid */}
        <Text style={styles.sectionTitle}>Select Category</Text>
        <View style={styles.categoryGrid}>
          {activeCategories.map(cat => (
            <TouchableOpacity 
              key={cat.id} 
              style={[
                styles.categoryChip, 
                category === cat.name && { borderColor: cat.color, backgroundColor: `${cat.color}20` }
              ]}
              onPress={() => setCategory(cat.name)}
            >
              <MaterialCommunityIcons name={cat.icon} size={24} color={cat.color} />
              <Text style={styles.categoryName} numberOfLines={1}>{cat.name}</Text>
            </TouchableOpacity>
          ))}
        </View>

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
        
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.dark.background,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 40,
  },
  toggleContainer: {
    flexDirection: 'row',
    marginBottom: 20,
  },
  toggleBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.dark.border,
    alignItems: 'center',
    backgroundColor: colors.dark.surfaceHover,
  },
  toggleText: {
    color: colors.dark.textSecondary,
    fontWeight: 'bold',
    fontSize: 16,
  },
  toggleTextActive: {
    color: '#FFFFFF',
  },
  amountInput: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  sectionTitle: {
    fontSize: 16,
    color: colors.dark.textSecondary,
    marginTop: 20,
    marginBottom: 12,
    fontWeight: '600',
  },
  categoryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  categoryChip: {
    width: '31%',
    aspectRatio: 1,
    backgroundColor: colors.dark.surface,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
    borderWidth: 2,
    borderColor: 'transparent',
    padding: 4,
  },
  categoryName: {
    color: colors.dark.textPrimary,
    fontSize: 10,
    marginTop: 8,
    textAlign: 'center',
  },
  saveBtn: {
    marginTop: 24,
  },
});
