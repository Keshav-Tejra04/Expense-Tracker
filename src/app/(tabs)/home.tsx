import React from 'react';
import { useTheme } from '../../context/ThemeContext';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator, Alert, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useAuth } from '../../context/AuthContext';
import { logoutUser } from '../../lib/auth';
import { useTransactions } from '../../hooks/useTransactions';
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

      <BalanceCard balance={balance} income={totalIncome} expense={totalExpense} />

      <BudgetWidget />

      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Recent Transactions</Text>
        <Pressable 
          onPress={() => router.push('/add-transaction')}
          style={({ pressed }) => [
            styles.addIconBtn,
            { transform: [{ scale: pressed ? 0.9 : 1 }] }
          ]}
        >
          <MaterialCommunityIcons name="plus" size={20} color="#FFFFFF" />
          <Text style={styles.addIconText}>Add</Text>
        </Pressable>
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
  addIconBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'transparent',
    borderWidth: 1.5,
    borderColor: themeColors.textPrimary,
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 100,
  },
  addIconText: {
    color: themeColors.textPrimary,
    fontWeight: '800',
    fontSize: 13,
    marginLeft: 4,
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


