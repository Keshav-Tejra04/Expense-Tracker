import React from 'react';
import { useTheme } from '../../context/ThemeContext';
import { View, Text, StyleSheet } from 'react-native';
import { Card } from '../ui/Card';
import { colors } from '../../constants/colors';

interface BalanceCardProps {
  balance: number;
  income: number;
  expense: number;
}

export function BalanceCard({ balance, income, expense }: BalanceCardProps) {
  const { theme } = useTheme();
  const themeColors = colors[theme];
  const styles = getStyles(themeColors);

  const formatCurrency = (amt: number) => `₹${amt.toLocaleString('en-IN')}`;

  return (
    <View style={styles.container}>
      <Text style={styles.label}>Total Balance</Text>
      <Text style={styles.balance}>{formatCurrency(balance)}</Text>
      
      <View style={styles.row}>
        <View style={styles.statBox}>
          <View style={[styles.dot, { backgroundColor: themeColors.income }]} />
          <View>
            <Text style={styles.statLabel}>Income</Text>
            <Text style={styles.statValue}>{formatCurrency(income)}</Text>
          </View>
        </View>
        
        <View style={styles.statBox}>
          <View style={[styles.dot, { backgroundColor: themeColors.expense }]} />
          <View>
            <Text style={styles.statLabel}>Expenses</Text>
            <Text style={styles.statValue}>{formatCurrency(expense)}</Text>
          </View>
        </View>
      </View>
    </View>
  );
}

const getStyles = (themeColors: any) => StyleSheet.create({
  container: {
    paddingVertical: 16,
    paddingHorizontal: 8,
    marginBottom: 8,
  },
  label: {
    fontSize: 15,
    color: themeColors.textSecondary,
    marginBottom: 8,
    fontWeight: '500',
  },
  balance: {
    fontSize: 48,
    fontWeight: '800',
    color: themeColors.textPrimary,
    marginBottom: 32,
    letterSpacing: -1,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
  },
  statBox: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginRight: 12,
  },
  statLabel: {
    fontSize: 13,
    color: themeColors.textSecondary,
    marginBottom: 2,
    fontWeight: '500',
  },
  statValue: {
    fontSize: 18,
    fontWeight: '700',
    color: themeColors.textPrimary,
  },
});
