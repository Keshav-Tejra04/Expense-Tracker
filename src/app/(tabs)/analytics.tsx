import React, { useMemo, useState } from 'react';
import { useTheme } from '../../context/ThemeContext';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator, Dimensions, TouchableOpacity } from 'react-native';
import { PieChart } from 'react-native-chart-kit';
import { useTransactions } from '../../hooks/useTransactions';
import { defaultExpenseCategories } from '../../constants/categories';
import { colors } from '../../constants/colors';
import { MaterialCommunityIcons } from '@expo/vector-icons';

const screenWidth = Dimensions.get('window').width;

export default function AnalyticsScreen() {
  const { theme } = useTheme();
  const themeColors = colors[theme];
  const styles = getStyles(themeColors);

  // Initialize with current month
  const today = new Date();
  const [currentDate, setCurrentDate] = useState(new Date(today.getFullYear(), today.getMonth(), 1));
  
  const currentMonthStr = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}`;
  
  const { transactions, loading } = useTransactions(currentMonthStr);

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
        color: categoryInfo?.color || themeColors.border,
        legendFontColor: themeColors.textSecondary,
        legendFontSize: 12
      };
    });

    data.sort((a, b) => b.amount - a.amount);

    return { chartData: data, totalExpense: total };
  }, [transactions, themeColors]);

  const goToPreviousMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };

  const goToNextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };

  const isCurrentMonth = 
    currentDate.getFullYear() === today.getFullYear() && 
    currentDate.getMonth() === today.getMonth();

  const chartConfig = {
    backgroundGradientFrom: themeColors.surface,
    backgroundGradientTo: themeColors.surface,
    color: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
  };

  const monthName = currentDate.toLocaleString('default', { month: 'long', year: 'numeric' });

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.header}>Analytics</Text>
      
      {/* Month Selector */}
      <View style={styles.monthSelector}>
        <TouchableOpacity onPress={goToPreviousMonth} style={styles.monthBtn}>
          <MaterialCommunityIcons name="chevron-left" size={24} color={themeColors.primary} />
        </TouchableOpacity>
        
        <Text style={styles.monthText}>{monthName}</Text>
        
        <TouchableOpacity onPress={goToNextMonth} style={styles.monthBtn} disabled={isCurrentMonth}>
          <MaterialCommunityIcons 
            name="chevron-right" 
            size={24} 
            color={isCurrentMonth ? themeColors.border : themeColors.primary} 
          />
        </TouchableOpacity>
      </View>
      
      {loading ? (
        <View style={{ padding: 40, alignItems: 'center' }}>
          <ActivityIndicator size="large" color={themeColors.primary} />
        </View>
      ) : (
        <>
          <View style={styles.summaryCard}>
            <Text style={styles.summaryLabel}>Total Spent in {currentDate.toLocaleString('default', { month: 'short' })}</Text>
            <Text style={styles.summaryTotal}>₹{totalExpense.toLocaleString('en-IN')}</Text>
          </View>

          {chartData.length > 0 ? (
            <View style={styles.chartContainer}>
              <Text style={styles.chartTitle}>Spending by Category</Text>
              <PieChart
                data={chartData}
                width={screenWidth - 40}
                height={220}
                chartConfig={chartConfig}
                accessor="amount"
                backgroundColor="transparent"
                paddingLeft="15"
                center={[10, 0]}
                absolute
              />
            </View>
          ) : (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>No expenses recorded for this month.</Text>
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
        </>
      )}
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
    marginBottom: 20,
  },
  monthSelector: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: themeColors.surface,
    padding: 12,
    borderRadius: 12,
    marginBottom: 24,
  },
  monthBtn: {
    padding: 8,
  },
  monthText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: themeColors.textPrimary,
  },
  summaryCard: {
    backgroundColor: themeColors.surface,
    padding: 24,
    borderRadius: 16,
    alignItems: 'center',
    marginBottom: 24,
  },
  summaryLabel: {
    fontSize: 14,
    color: themeColors.textSecondary,
    marginBottom: 8,
  },
  summaryTotal: {
    fontSize: 32,
    fontWeight: 'bold',
    color: themeColors.expense,
  },
  chartContainer: {
    backgroundColor: themeColors.surface,
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    marginBottom: 24,
  },
  chartTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: themeColors.textPrimary,
    marginBottom: 16,
    alignSelf: 'flex-start',
  },
  emptyContainer: {
    backgroundColor: themeColors.surface,
    borderRadius: 16,
    padding: 32,
    alignItems: 'center',
    marginBottom: 24,
  },
  emptyText: {
    color: themeColors.textSecondary,
  },
  breakdownContainer: {
    backgroundColor: themeColors.surface,
    borderRadius: 16,
    padding: 16,
  },
  breakdownTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: themeColors.textPrimary,
    marginBottom: 16,
  },
  breakdownRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: themeColors.border,
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
    color: themeColors.textPrimary,
  },
  breakdownRight: {
    alignItems: 'flex-end',
  },
  breakdownAmount: {
    fontSize: 16,
    fontWeight: 'bold',
    color: themeColors.textPrimary,
  },
  breakdownPercent: {
    fontSize: 12,
    color: themeColors.textSecondary,
    marginTop: 2,
  },
});
