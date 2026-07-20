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
    <Card style={styles.container}>
      <Text style={styles.label}>Current Balance</Text>
      <Text style={styles.balance}>{formatCurrency(balance)}</Text>
      
      <View style={styles.row}>
        <View style={styles.statBox}>
          <Text style={styles.statLabel}>Income</Text>
          <Text style={[styles.statValue, { color: themeColors.income }]}>
            {formatCurrency(income)}
          </Text>
        </View>
        <View style={styles.divider} />
        <View style={styles.statBox}>
          <Text style={styles.statLabel}>Expenses</Text>
          <Text style={[styles.statValue, { color: themeColors.expense }]}>
            {formatCurrency(expense)}
          </Text>
        </View>
      </View>
    </Card>
  );
}

const getStyles = (themeColors: any) => StyleSheet.create({
  container: {
    padding: 24,
    alignItems: 'center',
    backgroundColor: themeColors.surface,
  },
  label: {
    fontSize: 16,
    color: themeColors.textSecondary,
    marginBottom: 8,
  },
  balance: {
    fontSize: 36,
    fontWeight: 'bold',
    color: themeColors.textPrimary,
    marginBottom: 24,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
  },
  statBox: {
    flex: 1,
    alignItems: 'center',
  },
  statLabel: {
    fontSize: 14,
    color: themeColors.textSecondary,
    marginBottom: 4,
  },
  statValue: {
    fontSize: 18,
    fontWeight: '600',
  },
  divider: {
    width: 1,
    backgroundColor: themeColors.border,
    marginHorizontal: 16,
  },
});
