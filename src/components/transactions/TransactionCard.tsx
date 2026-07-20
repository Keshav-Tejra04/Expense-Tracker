import React from 'react';
import { useTheme } from '../../context/ThemeContext';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Transaction } from '../../lib/transactions';
import { defaultExpenseCategories, defaultIncomeCategories } from '../../constants/categories';
import { colors } from '../../constants/colors';

interface TransactionCardProps {
  transaction: Transaction;
  onPress?: () => void;
}

export function TransactionCard({ transaction, onPress }: TransactionCardProps) {
  const { theme } = useTheme();
  const themeColors = colors[theme];
  const styles = getStyles(themeColors);

  const isExpense = transaction.type === 'expense';
  const amountColor = isExpense ? themeColors.textPrimary : themeColors.income;
  const prefix = isExpense ? '-' : '+';
  
  // Find category to get icon and color
  const allCategories = [...defaultExpenseCategories, ...defaultIncomeCategories];
  const categoryConfig = allCategories.find(c => c.name === transaction.category);
  const iconName = categoryConfig?.icon || 'dots-horizontal';
  const iconColor = categoryConfig?.color || themeColors.textSecondary;

  return (
    <Pressable 
      onPress={onPress} 
      disabled={!onPress}
      style={({ pressed }) => [
        styles.container,
        {
          backgroundColor: pressed ? themeColors.surfaceHover : 'transparent',
          transform: [{ scale: pressed ? 0.98 : 1 }]
        }
      ]}
    >
      <View style={[styles.iconContainer, { backgroundColor: `${iconColor}15` }]}>
        <MaterialCommunityIcons name={iconName as any} size={24} color={iconColor} />
      </View>
      
      <View style={styles.details}>
        <Text style={styles.category} numberOfLines={1}>{transaction.category}</Text>
        <Text style={styles.note} numberOfLines={1}>
          {transaction.note ? transaction.note : `By ${transaction.memberName}`}
        </Text>
      </View>
      
      <View style={styles.amountContainer}>
        <Text style={[styles.amount, { color: amountColor }]}>
          {prefix}₹{transaction.amount.toLocaleString('en-IN')}
        </Text>
        <Text style={styles.date}>{transaction.date}</Text>
      </View>
    </Pressable>
  );
}

const getStyles = (themeColors: any) => StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderRadius: 16,
    marginBottom: 4,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  details: {
    flex: 1,
    justifyContent: 'center',
  },
  category: {
    fontSize: 16,
    fontWeight: '600',
    color: themeColors.textPrimary,
    marginBottom: 4,
  },
  note: {
    fontSize: 13,
    color: themeColors.textSecondary,
  },
  amountContainer: {
    alignItems: 'flex-end',
    justifyContent: 'center',
  },
  amount: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 4,
  },
  date: {
    fontSize: 12,
    color: themeColors.textMuted,
  },
});
