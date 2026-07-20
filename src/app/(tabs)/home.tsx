import React from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator, TouchableOpacity, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '../../context/AuthContext';
import { logoutUser } from '../../lib/auth';
import { useTransactions } from '../../hooks/useTransactions';
import { deleteTransaction } from '../../lib/transactions';
import { BalanceCard } from '../../components/home/BalanceCard';
import { TransactionCard } from '../../components/transactions/TransactionCard';
import { Button } from '../../components/ui/Button';
import { colors } from '../../constants/colors';

export default function HomeScreen() {
  const { userData } = useAuth();
  const router = useRouter();
  
  // By passing no month, it fetches all transactions for simplicity right now
  const { transactions, loading } = useTransactions();

  // Calculate totals
  const totalIncome = transactions
    .filter(t => t.type === 'income')
    .reduce((sum, t) => sum + t.amount, 0);
    
  const totalExpense = transactions
    .filter(t => t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0);
    
  const balance = totalIncome - totalExpense;

  const handleDelete = (id: string) => {
    Alert.alert('Delete Transaction', 'Are you sure you want to delete this?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: () => deleteTransaction(id) }
    ]);
  };

  if (loading) {
    return (
      <View style={[styles.container, { justifyContent: 'center' }]}>
        <ActivityIndicator size="large" color={colors.dark.primary} />
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>Hello, {userData?.name}</Text>
          <Text style={styles.subtitle}>Here is your family summary</Text>
        </View>
      </View>

      <BalanceCard balance={balance} income={totalIncome} expense={totalExpense} />

      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Recent Transactions</Text>
      </View>

      <View style={styles.transactionList}>
        {transactions.length === 0 ? (
          <Text style={styles.emptyText}>No transactions yet. Add one below!</Text>
        ) : (
          transactions.slice(0, 10).map((t) => (
            <TransactionCard 
              key={t.id} 
              transaction={t} 
              onPress={() => handleDelete(t.id)} 
            />
          ))
        )}
      </View>

      <Button 
        title="+ Add Transaction" 
        onPress={() => router.push('/add-transaction')} 
        style={styles.addButton}
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.dark.background,
  },
  content: {
    padding: 20,
    paddingTop: 60, // Extra padding for top
    paddingBottom: 40,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  greeting: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.dark.textPrimary,
  },
  subtitle: {
    fontSize: 14,
    color: colors.dark.textSecondary,
    marginTop: 4,
  },
  logoutBtn: {
    padding: 8,
    backgroundColor: colors.dark.surfaceHover,
    borderRadius: 8,
  },
  logoutText: {
    color: colors.dark.expense,
    fontWeight: '600',
  },
  sectionHeader: {
    marginTop: 32,
    marginBottom: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.dark.textPrimary,
  },
  transactionList: {
    backgroundColor: colors.dark.surface,
    borderRadius: 16,
    padding: 16,
  },
  emptyText: {
    color: colors.dark.textMuted,
    textAlign: 'center',
    paddingVertical: 20,
  },
  addButton: {
    marginTop: 32,
  },
});


