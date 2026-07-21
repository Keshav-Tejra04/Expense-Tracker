import React from 'react';
import { useTheme } from '../../context/ThemeContext';
import { View, Text, StyleSheet } from 'react-native';
import { Card } from '../ui/Card';
import { colors } from '../../constants/colors';
import { MaterialCommunityIcons } from '@expo/vector-icons';

interface BalanceCardProps {
  totalBalance: number;
  cashBalance: number;
  onlineBalance: number;
  income: number;
  expense: number;
}

export function BalanceCard({ totalBalance, cashBalance, onlineBalance, income, expense }: BalanceCardProps) {
  const { theme } = useTheme();
  const themeColors = colors[theme];
  const styles = getStyles(themeColors);

  const formatCurrency = (amt: number) => `₹${amt.toLocaleString('en-IN')}`;

  return (
    <View style={styles.container}>
      <Text style={styles.label}>Total Balance</Text>
      <Text style={styles.balance}>{formatCurrency(totalBalance)}</Text>
      
      {/* Wallet Split */}
      <View style={styles.walletsRow}>
        <View style={styles.walletBox}>
          <View style={styles.walletIconWrap}>
            <MaterialCommunityIcons name="cash-multiple" size={16} color={themeColors.textSecondary} />
          </View>
          <View>
            <Text style={styles.walletLabel}>Cash</Text>
            <Text style={styles.walletValue}>{formatCurrency(cashBalance)}</Text>
          </View>
        </View>

        <View style={styles.walletDivider} />

        <View style={styles.walletBox}>
          <View style={styles.walletIconWrap}>
            <MaterialCommunityIcons name="bank" size={16} color={themeColors.textSecondary} />
          </View>
          <View>
            <Text style={styles.walletLabel}>Online</Text>
            <Text style={styles.walletValue}>{formatCurrency(onlineBalance)}</Text>
          </View>
        </View>
      </View>

      {/* Income / Expense */}
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
    marginBottom: 24,
    letterSpacing: -1,
  },
  walletsRow: {
    flexDirection: 'row',
    backgroundColor: themeColors.surfaceHover,
    padding: 16,
    borderRadius: 16,
    marginBottom: 32,
    alignItems: 'center',
  },
  walletBox: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  walletIconWrap: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: themeColors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  walletLabel: {
    fontSize: 12,
    color: themeColors.textSecondary,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  walletValue: {
    fontSize: 16,
    fontWeight: '700',
    color: themeColors.textPrimary,
    marginTop: 2,
  },
  walletDivider: {
    width: 1,
    height: '100%',
    backgroundColor: themeColors.border,
    marginHorizontal: 16,
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
