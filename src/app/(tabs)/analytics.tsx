import React, { useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator, Dimensions } from 'react-native';
import { PieChart } from 'react-native-chart-kit';
import { useTransactions } from '../../hooks/useTransactions';
import { defaultExpenseCategories } from '../../constants/categories';
import { colors } from '../../constants/colors';

const screenWidth = Dimensions.get('window').width;

export default function AnalyticsScreen() {
  const today = new Date();
  const currentMonth = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}`;
  
  const { transactions, loading } = useTransactions(currentMonth);

  const { chartData, totalExpense } = useMemo(() => {
    if (!transactions) return { chartData: [], totalExpense: 0 };
    
    const expenses = transactions.filter(t => t.type === 'expense');
    const total = expenses.reduce((sum, t) => sum + t.amount, 0);

    const grouped = expenses.reduce((acc, txn) => {
      acc[txn.category] = (acc[txn.category] || 0) + txn.amount;
      return acc;
    }, {} as Record<string, number>);

    const data = Object.keys(grouped).map(catName => {
      const categoryInfo = defaultExpenseCategories.find(c => c.name === catName);
      return {
        name: catName,
        amount: grouped[catName],
        color: categoryInfo?.color || colors.dark.border,
        legendFontColor: colors.dark.textSecondary,
        legendFontSize: 12
      };
    });

    data.sort((a, b) => b.amount - a.amount); // highest first

    return { chartData: data, totalExpense: total };
  }, [transactions]);

  if (loading) {
    return (
      <View style={[styles.container, { justifyContent: 'center' }]}>
        <ActivityIndicator size="large" color={colors.dark.primary} />
      </View>
    );
  }

  const chartConfig = {
    backgroundGradientFrom: colors.dark.surface,
    backgroundGradientTo: colors.dark.surface,
    color: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.header}>Analytics</Text>
      
      <View style={styles.summaryCard}>
        <Text style={styles.summaryLabel}>Total Spent This Month</Text>
        <Text style={styles.summaryTotal}>₹{totalExpense.toLocaleString('en-IN')}</Text>
      </View>

      {chartData.length > 0 ? (
        <View style={styles.chartContainer}>
          <Text style={styles.chartTitle}>Spending by Category</Text>
          <PieChart
            data={chartData}
            width={screenWidth - 40} // padding 20 on each side
            height={220}
            chartConfig={chartConfig}
            accessor="amount"
            backgroundColor="transparent"
            paddingLeft="15"
            center={[10, 0]}
            absolute // Show absolute numbers in chart tooltip? PieChart uses absolute visually anyway.
          />
        </View>
      ) : (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>Not enough data to show charts.</Text>
        </View>
      )}

      {chartData.length > 0 && (
        <View style={styles.breakdownContainer}>
          <Text style={styles.breakdownTitle}>Detailed Breakdown</Text>
          {chartData.map(item => {
            const percentage = ((item.amount / totalExpense) * 100).toFixed(1);
            return (
              <View key={item.name} style={styles.breakdownRow}>
                <View style={styles.breakdownLeft}>
                  <View style={[styles.colorDot, { backgroundColor: item.color }]} />
                  <Text style={styles.breakdownCategory}>{item.name}</Text>
                </View>
                <View style={styles.breakdownRight}>
                  <Text style={styles.breakdownAmount}>₹{item.amount.toLocaleString('en-IN')}</Text>
                  <Text style={styles.breakdownPercent}>{percentage}%</Text>
                </View>
              </View>
            );
          })}
        </View>
      )}
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
    paddingTop: 60,
    paddingBottom: 40,
  },
  header: {
    fontSize: 28,
    fontWeight: 'bold',
    color: colors.dark.textPrimary,
    marginBottom: 24,
  },
  summaryCard: {
    backgroundColor: colors.dark.surface,
    padding: 24,
    borderRadius: 16,
    alignItems: 'center',
    marginBottom: 24,
  },
  summaryLabel: {
    fontSize: 14,
    color: colors.dark.textSecondary,
    marginBottom: 8,
  },
  summaryTotal: {
    fontSize: 32,
    fontWeight: 'bold',
    color: colors.dark.expense,
  },
  chartContainer: {
    backgroundColor: colors.dark.surface,
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    marginBottom: 24,
  },
  chartTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.dark.textPrimary,
    marginBottom: 16,
    alignSelf: 'flex-start',
  },
  emptyContainer: {
    backgroundColor: colors.dark.surface,
    borderRadius: 16,
    padding: 32,
    alignItems: 'center',
  },
  emptyText: {
    color: colors.dark.textSecondary,
  },
  breakdownContainer: {
    backgroundColor: colors.dark.surface,
    borderRadius: 16,
    padding: 16,
  },
  breakdownTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.dark.textPrimary,
    marginBottom: 16,
  },
  breakdownRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.dark.border,
  },
  breakdownLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  colorDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 12,
  },
  breakdownCategory: {
    fontSize: 16,
    color: colors.dark.textPrimary,
  },
  breakdownRight: {
    alignItems: 'flex-end',
  },
  breakdownAmount: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.dark.textPrimary,
  },
  breakdownPercent: {
    fontSize: 12,
    color: colors.dark.textSecondary,
    marginTop: 2,
  },
});
