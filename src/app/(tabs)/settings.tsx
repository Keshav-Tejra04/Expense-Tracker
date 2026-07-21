import React, { useState, useEffect } from 'react';
import { useTheme } from '../../context/ThemeContext';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, Clipboard } from 'react-native';
import { useAuth } from '../../context/AuthContext';
import { useFamily } from '../../hooks/useFamily';
import { useTransactions } from '../../hooks/useTransactions';
import { useLendings } from '../../hooks/useLendings';
import { logoutUser } from '../../lib/auth';
import { updateFamilyBalances } from '../../lib/family';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { Input } from '../../components/ui/Input';
import { colors } from '../../constants/colors';
import { MaterialCommunityIcons } from '@expo/vector-icons';

export default function SettingsScreen() {
  const { theme, toggleTheme } = useTheme();
  const themeColors = colors[theme];
  const styles = getStyles(themeColors);

  const { userData } = useAuth();
  const { family } = useFamily();
  const { transactions, loading: txLoading } = useTransactions();
  const { lendings, loading: lnLoading } = useLendings();

  const [isEditingBalances, setIsEditingBalances] = useState(false);
  const [cashBalance, setCashBalance] = useState('');
  const [onlineBalance, setOnlineBalance] = useState('');
  const [isSavingBalances, setIsSavingBalances] = useState(false);

  // Helper to calculate totals
  const sum = (arr: any[], predicate: (item: any) => boolean) => 
    arr.filter(predicate).reduce((acc, item) => acc + item.amount, 0);

  // Wallet Specific Transactions
  const incomeCash = sum(transactions, t => t.type === 'income' && t.paymentMethod === 'cash');
  const expenseCash = sum(transactions, t => t.type === 'expense' && t.paymentMethod === 'cash');
  const transferToCash = sum(transactions, t => t.type === 'transfer' && t.transferSource === 'online');
  const transferFromCash = sum(transactions, t => t.type === 'transfer' && t.transferSource === 'cash');
  
  const incomeOnline = sum(transactions, t => t.type === 'income' && t.paymentMethod === 'online');
  const expenseOnline = sum(transactions, t => t.type === 'expense' && t.paymentMethod === 'online');

  // Wallet Specific Lendings
  const lentCash = sum(lendings, l => l.type === 'lent' && l.paymentMethod === 'cash');
  const lentCashSettled = lendings.filter(l => l.type === 'lent' && l.paymentMethod === 'cash').reduce((acc, l) => acc + (l.settledAmount || 0), 0);
  const borrowedCash = sum(lendings, l => l.type === 'borrowed' && l.paymentMethod === 'cash');
  const borrowedCashSettled = lendings.filter(l => l.type === 'borrowed' && l.paymentMethod === 'cash').reduce((acc, l) => acc + (l.settledAmount || 0), 0);

  const lentOnline = sum(lendings, l => l.type === 'lent' && l.paymentMethod === 'online');
  const lentOnlineSettled = lendings.filter(l => l.type === 'lent' && l.paymentMethod === 'online').reduce((acc, l) => acc + (l.settledAmount || 0), 0);
  const borrowedOnline = sum(lendings, l => l.type === 'borrowed' && l.paymentMethod === 'online');
  const borrowedOnlineSettled = lendings.filter(l => l.type === 'borrowed' && l.paymentMethod === 'online').reduce((acc, l) => acc + (l.settledAmount || 0), 0);

  // Deltas from transactions/lendings
  const cashDelta = incomeCash - expenseCash + transferToCash - transferFromCash - lentCash + lentCashSettled + borrowedCash - borrowedCashSettled;
  const onlineDelta = incomeOnline - expenseOnline + transferFromCash - transferToCash - lentOnline + lentOnlineSettled + borrowedOnline - borrowedOnlineSettled;

  // Dynamically computed current balances
  const currentCash = (family?.initialCashBalance || 0) + cashDelta;
  const currentOnline = (family?.initialOnlineBalance || 0) + onlineDelta;

  useEffect(() => {
    if (family && !isEditingBalances && !txLoading && !lnLoading) {
      setCashBalance(currentCash.toString());
      setOnlineBalance(currentOnline.toString());
    }
  }, [family, isEditingBalances, txLoading, lnLoading, currentCash, currentOnline]);

  const handleCopyCode = () => {
    if (family?.code) {
      Clipboard.setString(family.code);
      Alert.alert('Copied!', 'Family Code has been copied to your clipboard. Share it with your family members so they can join.');
    }
  };

  const handleSaveBalances = async () => {
    if (!family) return;
    setIsSavingBalances(true);
    try {
      const targetCash = Number(cashBalance);
      const targetOnline = Number(onlineBalance);

      if (isNaN(targetCash) || isNaN(targetOnline)) {
        throw new Error('Please enter valid numeric balances');
      }

      // Calculate what the initial balances should be to make current balances match user input
      const newInitialCash = targetCash - cashDelta;
      const newInitialOnline = targetOnline - onlineDelta;

      await updateFamilyBalances(family.id, newInitialCash, newInitialOnline);
      setIsEditingBalances(false);
      Alert.alert('Success', 'Current balances updated successfully!');
    } catch (err: any) {
      Alert.alert('Error', err.message);
    } finally {
      setIsSavingBalances(false);
    }
  };

  const handleLogout = () => {
    Alert.alert('Logout', 'Are you sure you want to logout?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Logout', style: 'destructive', onPress: logoutUser }
    ]);
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.header}>Settings</Text>

      {/* User Profile */}
      <Card style={styles.card}>
        <View style={styles.cardHeader}>
          <MaterialCommunityIcons name="account-circle-outline" size={24} color={themeColors.primary} />
          <Text style={styles.cardTitle}>My Profile</Text>
        </View>
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Name</Text>
          <Text style={styles.infoValue}>{userData?.name}</Text>
        </View>
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Email</Text>
          <Text style={styles.infoValue}>{userData?.email}</Text>
        </View>
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Role</Text>
          <Text style={[styles.infoValue, { textTransform: 'capitalize' }]}>{userData?.role}</Text>
        </View>
      </Card>

      {/* Family Info */}
      <Card style={styles.card}>
        <View style={styles.cardHeader}>
          <MaterialCommunityIcons name="home-group" size={24} color={themeColors.income} />
          <Text style={styles.cardTitle}>Family Settings</Text>
        </View>
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Family Name</Text>
          <Text style={styles.infoValue}>{family?.name || 'Loading...'}</Text>
        </View>

        {isEditingBalances ? (
          <View style={{ marginTop: 12, marginBottom: 16 }}>
            <Input 
              label="Current Cash Balance (₹)" 
              value={cashBalance} 
              onChangeText={setCashBalance} 
              keyboardType="default" 
            />
            <Input 
              label="Current Online Balance (₹)" 
              value={onlineBalance} 
              onChangeText={setOnlineBalance} 
              keyboardType="default" 
            />
            <View style={{ flexDirection: 'row', gap: 12, marginTop: 8 }}>
              <Button title="Cancel" variant="secondary" onPress={() => setIsEditingBalances(false)} style={{ flex: 1 }} />
              <Button title="Save" onPress={handleSaveBalances} isLoading={isSavingBalances} style={{ flex: 1 }} />
            </View>
          </View>
        ) : (
          <>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Current Cash Balance</Text>
              <Text style={styles.infoValue}>₹{(currentCash || 0).toLocaleString('en-IN')}</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Current Online Balance</Text>
              <Text style={styles.infoValue}>₹{(currentOnline || 0).toLocaleString('en-IN')}</Text>
            </View>
            <TouchableOpacity onPress={() => setIsEditingBalances(true)} style={{ alignSelf: 'flex-start', marginBottom: 16 }}>
              <Text style={{ color: themeColors.primary, fontWeight: '600' }}>Edit Balances</Text>
            </TouchableOpacity>
          </>
        )}
        
        <View style={styles.codeContainer}>
          <View>
            <Text style={styles.infoLabel}>Invite Code</Text>
            <Text style={styles.codeValue}>{family?.code || '...'}</Text>
          </View>
          <TouchableOpacity onPress={handleCopyCode} style={styles.copyBtn}>
            <MaterialCommunityIcons name="content-copy" size={20} color={themeColors.primary} />
            <Text style={styles.copyText}>Copy Code</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.membersSection}>
          <Text style={styles.infoLabel}>Members ({family?.members?.length || 0})</Text>
          <View style={styles.membersList}>
            {family?.members?.map((member, index) => (
              <View key={index} style={styles.memberBadge}>
                <MaterialCommunityIcons name="account" size={16} color={themeColors.textSecondary} />
                <Text style={styles.memberName}>{member}</Text>
              </View>
            ))}
          </View>
        </View>
      </Card>

      {/* App Preferences */}
      <Card style={styles.card}>
        <View style={styles.cardHeader}>
          <MaterialCommunityIcons name="palette" size={24} color={themeColors.primary} />
          <Text style={styles.cardTitle}>App Preferences</Text>
        </View>
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Theme</Text>
          <TouchableOpacity onPress={toggleTheme} style={styles.copyBtn}>
            <MaterialCommunityIcons name={theme === 'dark' ? 'weather-night' : 'weather-sunny'} size={20} color={themeColors.primary} />
            <Text style={styles.copyText}>{theme === 'dark' ? 'Dark Mode' : 'Light Mode'}</Text>
          </TouchableOpacity>
        </View>
      </Card>

      <Button 
        title="Logout" 
        variant="danger" 
        onPress={handleLogout} 
        style={styles.logoutBtn}
      />
      
      <Text style={styles.version}>Ghar Kharch v1.0.0</Text>
    </ScrollView>
  );
}

const getStyles = (themeColors: any) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: themeColors.background,
  },
  content: {
    padding: 20,
    paddingTop: 60,
    paddingBottom: 40,
  },
  header: {
    fontSize: 28,
    fontWeight: 'bold',
    color: themeColors.textPrimary,
    marginBottom: 24,
  },
  card: {
    padding: 20,
    marginBottom: 20,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: themeColors.border,
    paddingBottom: 12,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: themeColors.textPrimary,
    marginLeft: 8,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  infoLabel: {
    fontSize: 14,
    color: themeColors.textSecondary,
  },
  infoValue: {
    fontSize: 16,
    color: themeColors.textPrimary,
    fontWeight: '500',
  },
  codeContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: themeColors.background,
    padding: 16,
    borderRadius: 8,
    marginTop: 8,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: themeColors.border,
  },
  codeValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: themeColors.primary,
    letterSpacing: 2,
    marginTop: 4,
  },
  copyBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: `${themeColors.primary}20`,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
  },
  copyText: {
    color: themeColors.primary,
    fontWeight: 'bold',
    marginLeft: 6,
  },
  membersSection: {
    marginTop: 8,
  },
  membersList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 8,
  },
  memberBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: themeColors.surfaceHover,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 16,
    marginRight: 8,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: themeColors.border,
  },
  memberName: {
    color: themeColors.textPrimary,
    marginLeft: 4,
    fontSize: 14,
  },
  logoutBtn: {
    marginTop: 8,
  },
  version: {
    textAlign: 'center',
    color: themeColors.textMuted,
    marginTop: 24,
    fontSize: 12,
  },
});
