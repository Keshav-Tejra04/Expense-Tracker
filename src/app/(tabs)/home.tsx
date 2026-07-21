import React from 'react';
import { useTheme } from '../../context/ThemeContext';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator, Alert, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useAuth } from '../../context/AuthContext';
import { useTransactions } from '../../hooks/useTransactions';
import { useLendings } from '../../hooks/useLendings';
import { useFamilyData } from '../../hooks/useFamilyData';
import { deleteTransaction } from '../../lib/transactions';
import { BalanceCard } from '../../components/home/BalanceCard';
import { BudgetWidget } from '../../components/home/BudgetWidget';
import { TransactionCard } from '../../components/transactions/TransactionCard';
import { colors } from '../../constants/colors';

export default function HomeScreen() {
  const { theme } = useTheme();
  const themeColors = colors[theme];
  const styles = getStyles(themeColors);
  
  const { userData } = useAuth();
  const router = useRouter();
  
  const { transactions, loading: txLoading } = useTransactions();
  const { lendings, loading: lnLoading } = useLendings();
  const { family, loading: fmLoading } = useFamilyData();

  // Helper to calculate total given an array and predicate
  const sum = (arr: any[], predicate: (item: any) => boolean) => 
    arr.filter(predicate).reduce((acc, item) => acc + item.amount, 0);

  // Income/Expense total
  const totalIncome = sum(transactions, t => t.type === 'income');
  const totalExpense = sum(transactions, t => t.type === 'expense');

  // Initial balances
  const initCash = family?.initialCashBalance || 0;
  const initOnline = family?.initialOnlineBalance || 0;

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

  const cashBalance = initCash + incomeCash - expenseCash + transferToCash - transferFromCash - lentCash + lentCashSettled + borrowedCash - borrowedCashSettled;
  const onlineBalance = initOnline + incomeOnline - expenseOnline + transferFromCash - transferToCash - lentOnline + lentOnlineSettled + borrowedOnline - borrowedOnlineSettled;
  const totalBalance = cashBalance + onlineBalance;

  const handleDelete = (id: string) => {
    Alert.alert('Delete Transaction', 'Are you sure you want to delete this?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: () => deleteTransaction(id) }
    ]);
  };

  if (txLoading || lnLoading || fmLoading) {
    return (
      <View style={[styles.container, { justifyContent: 'center' }]}>
        <ActivityIndicator size="large" color={themeColors.primary} />
      </View>
    );
  }

  const recentTransactions = transactions.slice(0, 10);

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>Hello, {userData?.name}</Text>
          <Text style={styles.subtitle}>Here is your family summary</Text>
        </View>
      </View>

      <BalanceCard 
        totalBalance={totalBalance} 
        cashBalance={cashBalance} 
        onlineBalance={onlineBalance} 
        income={totalIncome} 
        expense={totalExpense} 
      />

      <BudgetWidget />

      <Pressable 
        onPress={() => router.push('/add-transaction')}
        style={({ pressed }) => [
          styles.addTransactionBtn,
          { 
            backgroundColor: pressed ? themeColors.surfaceHover : themeColors.surface,
            borderColor: themeColors.border,
            borderWidth: 1.5,
            transform: [{ scale: pressed ? 0.98 : 1 }],
          }
        ]}
      >
        <MaterialCommunityIcons name="plus" size={22} color={themeColors.textPrimary} style={{ marginRight: 8 }} />
        <Text style={[styles.addTransactionBtnText, { color: themeColors.textPrimary }]}>Add New Transaction</Text>
      </Pressable>

      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Recent Transactions</Text>
      </View>

      <View style={styles.transactionList}>
        {recentTransactions.length > 0 ? (
          recentTransactions.map(txn => (
            <TransactionCard 
              key={txn.id} 
              transaction={txn}
              onPress={() => handleDelete(txn.id)}
            />
          ))
        ) : (
          <Text style={styles.emptyText}>No recent transactions</Text>
        )}
      </View>
    </ScrollView>
  );
}

const getStyles = (themeColors: any) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: themeColors.background,
  },
  content: {
    padding: 24,
    paddingTop: 64, // Extra padding for top
    paddingBottom: 48,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 32,
  },
  greeting: {
    fontSize: 28,
    fontWeight: '800',
    color: themeColors.textPrimary,
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 15,
    color: themeColors.textSecondary,
    marginTop: 6,
    fontWeight: '500',
  },
  logoutBtn: {
    padding: 10,
    backgroundColor: themeColors.surfaceHover,
    borderRadius: 12,
  },
  logoutText: {
    color: themeColors.expense,
    fontWeight: '700',
  },
  sectionHeader: {
    marginTop: 24,
    marginBottom: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 4,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: themeColors.textPrimary,
    letterSpacing: 0.3,
  },
  addTransactionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 100,
    marginTop: 16,
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 3,
  },
  addTransactionBtnText: {
    fontSize: 16,
    fontWeight: '800',
    letterSpacing: 0.3,
  },
  transactionList: {
    backgroundColor: themeColors.surface,
    borderRadius: 24,
    padding: 12,
  },
  emptyText: {
    color: themeColors.textMuted,
    textAlign: 'center',
    paddingVertical: 32,
    fontWeight: '500',
  },
  addButton: {
    marginTop: 32,
  },
});


