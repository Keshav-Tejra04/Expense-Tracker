import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Alert, TouchableOpacity, KeyboardAvoidingView, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '../context/AuthContext';
import { addLending, LendingType } from '../lib/lendings';
import { Input } from '../components/ui/Input';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { colors } from '../constants/colors';

export default function AddLendingScreen() {
  const { userData } = useAuth();
  const router = useRouter();
  
  const [type, setType] = useState<LendingType>('lent');
  const [amount, setAmount] = useState('');
  const [personName, setPersonName] = useState('');
  const [note, setNote] = useState('');
  
  const today = new Date();
  const defaultDateStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
  const [dateStr, setDateStr] = useState(defaultDateStr);
  
  const [loading, setLoading] = useState(false);

  const handleSave = async () => {
    if (!amount || isNaN(Number(amount)) || Number(amount) <= 0) {
      Alert.alert('Invalid Amount', 'Please enter a valid amount.');
      return;
    }
    if (!personName.trim()) {
      Alert.alert('Missing Name', 'Please enter the name of the person.');
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
      await addLending(
        userData.familyId,
        type,
        Number(amount),
        personName.trim(),
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
        
        <View style={styles.toggleContainer}>
          <TouchableOpacity 
            style={[styles.toggleBtn, type === 'lent' && { backgroundColor: colors.dark.expense }]}
            onPress={() => setType('lent')}
          >
            <Text style={[styles.toggleText, type === 'lent' && styles.toggleTextActive]}>I Gave Money</Text>
          </TouchableOpacity>
          <View style={{ width: 12 }} />
          <TouchableOpacity 
            style={[styles.toggleBtn, type === 'borrowed' && { backgroundColor: colors.dark.income }]}
            onPress={() => setType('borrowed')}
          >
            <Text style={[styles.toggleText, type === 'borrowed' && styles.toggleTextActive]}>I Took Money</Text>
          </TouchableOpacity>
        </View>

        <Input
          label="Person's Name"
          placeholder="Who did you give/take from?"
          value={personName}
          onChangeText={setPersonName}
        />

        <Input
          label="Amount (₹)"
          placeholder="0.00"
          value={amount}
          onChangeText={setAmount}
          keyboardType="numeric"
          style={styles.amountInput}
        />

        <Input
          label="Date (YYYY-MM-DD)"
          value={dateStr}
          onChangeText={setDateStr}
        />

        <Input
          label="Note (Optional)"
          placeholder="Reason for this"
          value={note}
          onChangeText={setNote}
        />

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
    fontSize: 14,
  },
  toggleTextActive: {
    color: '#FFFFFF',
  },
  amountInput: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  saveBtn: {
    marginTop: 24,
  },
});
