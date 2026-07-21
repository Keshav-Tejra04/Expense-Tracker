import React, { useMemo, useState, useEffect } from 'react';
import { useTheme } from '../../context/ThemeContext';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator, Dimensions, TouchableOpacity, Platform, LogBox } from 'react-native';
import { PieChart, BarChart } from 'react-native-chart-kit';
import { useTransactions } from '../../hooks/useTransactions';
import { defaultExpenseCategories } from '../../constants/categories';
import { colors } from '../../constants/colors';
import { MaterialCommunityIcons } from '@expo/vector-icons';

// Suppress known react-native-chart-kit web warning
LogBox.ignoreLogs(['Invalid DOM property `transform-origin`']);
if (Platform.OS === 'web') {
  const originalConsoleError = console.error;
  console.error = (...args: any[]) => {
    if (typeof args[0] === 'string' && args[0].includes('transform-origin')) {
      return; // Suppress React DOM property warning on Web
    }
    originalConsoleError(...args);
  };
}
import { Card } from '../../components/ui/Card';

const screenWidth = Dimensions.get('window').width;

export default function AnalyticsScreen() {
  const { theme } = useTheme();
  const themeColors = colors[theme];
  const styles = getStyles(themeColors);

  // We fetch ALL transactions here to compute historical data instantly
  const { transactions, loading } = useTransactions();

  const today = new Date();
  const [currentDate, setCurrentDate] = useState(new Date(today.getFullYear(), today.getMonth(), 1));

  const {
    currentMonthExpense,
    momPercentage,
    momIsUp,
    pieChartData,
    barChartData
  } = useMemo(() => {
    if (!transactions) return { currentMonthExpense: 0, momPercentage: 0, momIsUp: false, pieChartData: [], barChartData: null };

    // Helper to get YYYY-MM
    const getMonthStr = (d: Date) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
    
    const currentMonthStr = getMonthStr(currentDate);
    const prevMonthDate = new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1);
    const prevMonthStr = getMonthStr(prevMonthDate);

    // Filter Current & Prev Month Expenses
    const currentExpenses = transactions.filter(t => t.type === 'expense' && t.month === currentMonthStr);
    const prevExpenses = transactions.filter(t => t.type === 'expense' && t.month === prevMonthStr);

    const currentTotal = currentExpenses.reduce((sum, t) => sum + t.amount, 0);
    const prevTotal = prevExpenses.reduce((sum, t) => sum + t.amount, 0);

    // MoM Calculation
    let momPct = 0;
    if (prevTotal > 0) {
      momPct = ((currentTotal - prevTotal) / prevTotal) * 100;
    } else if (currentTotal > 0) {
      momPct = 100; // If prev month was 0, but this month has expenses, it's 100% up
    }
    const momIsUpVal = momPct > 0;

    // Pie Chart Data (Current Month Categories)
    const grouped = currentExpenses.reduce((acc, txn) => {
      acc[txn.category] = (acc[txn.category] || 0) + txn.amount;
      return acc;
    }, {} as Record<string, number>);

    const pieData = Object.keys(grouped).map(catName => {
      const categoryInfo = defaultExpenseCategories.find(c => c.name === catName);
      const percentage = currentTotal > 0 ? ((grouped[catName] / currentTotal) * 100).toFixed(0) : "0";
      return {
        name: `% ${catName}`,
        rawName: catName,
        amount: Number(percentage), // used by PieChart to render slice and legend number
        originalAmount: grouped[catName], // used by our custom list
        color: categoryInfo?.color || themeColors.border,
        legendFontColor: themeColors.textSecondary,
        legendFontSize: 12
      };
    }).sort((a, b) => b.originalAmount - a.originalAmount);

    // Bar Chart Data (Last 6 Months History)
    const labels: string[] = [];
    const data: number[] = [];
    
    for (let i = 5; i >= 0; i--) {
      const d = new Date(currentDate.getFullYear(), currentDate.getMonth() - i, 1);
      const mStr = getMonthStr(d);
      const monthLabel = d.toLocaleString('default', { month: 'short' });
      
      const monthTotal = transactions
        .filter(t => t.type === 'expense' && t.month === mStr)
        .reduce((sum, t) => sum + t.amount, 0);
        
      labels.push(monthLabel);
      data.push(monthTotal);
    }

    return {
      currentMonthExpense: currentTotal,
      momPercentage: Math.abs(momPct).toFixed(1),
      momIsUp: momIsUpVal,
      pieChartData: pieData,
      barChartData: { labels, datasets: [{ data }] }
    };
  }, [transactions, currentDate, themeColors]);

  const goToPreviousMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };

  const goToNextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };

  const isCurrentMonth = 
    currentDate.getFullYear() === today.getFullYear() && 
    currentDate.getMonth() === today.getMonth();

  const monthName = currentDate.toLocaleString('default', { month: 'long', year: 'numeric' });

  if (loading) {
    return (
      <View style={[styles.container, { justifyContent: 'center' }]}>
        <ActivityIndicator size="large" color={themeColors.primary} />
      </View>
    );
  }

  const chartConfig = {
    backgroundGradientFrom: themeColors.surface,
    backgroundGradientTo: themeColors.surface,
    color: (opacity = 1) => themeColors.primary,
    labelColor: (opacity = 1) => themeColors.textSecondary,
    fillShadowGradient: themeColors.primary,
    fillShadowGradientOpacity: 0.8,
    barPercentage: 0.6,
    decimalPlaces: 0,
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.headerTitle}>Analytics</Text>
      
      {/* Sleek Month Selector */}
      <View style={styles.monthSelector}>
        <TouchableOpacity onPress={goToPreviousMonth} style={styles.monthBtn}>
          <MaterialCommunityIcons name="chevron-left" size={24} color={themeColors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.monthText}>{monthName}</Text>
        <TouchableOpacity onPress={goToNextMonth} style={styles.monthBtn} disabled={isCurrentMonth}>
          <MaterialCommunityIcons 
            name="chevron-right" 
            size={24} 
            color={isCurrentMonth ? themeColors.border : themeColors.textPrimary} 
          />
        </TouchableOpacity>
      </View>

      {/* Hero Metric Card */}
      <Card variant="glass" style={styles.heroCard}>
        <Text style={styles.heroLabel}>Total Spent</Text>
        <Text style={styles.heroAmount}>₹{currentMonthExpense.toLocaleString('en-IN')}</Text>
        
        {Number(momPercentage) > 0 ? (
          <View style={[styles.momBadge, { backgroundColor: momIsUp ? `${themeColors.expense}20` : `${themeColors.income}20` }]}>
            <MaterialCommunityIcons 
              name={momIsUp ? "trending-up" : "trending-down"} 
              size={16} 
              color={momIsUp ? themeColors.expense : themeColors.income} 
            />
            <Text style={[styles.momText, { color: momIsUp ? themeColors.expense : themeColors.income }]}>
              {momPercentage}% {momIsUp ? 'more' : 'less'} than last month
            </Text>
          </View>
        ) : (
          <View style={[styles.momBadge, { backgroundColor: themeColors.surfaceHover }]}>
            <Text style={[styles.momText, { color: themeColors.textSecondary }]}>No comparison data</Text>
          </View>
        )}
      </Card>

      {/* 6-Month Trend Chart */}
      {barChartData && Math.max(...barChartData.datasets[0].data) > 0 && (
        <View style={styles.chartSection}>
          <Text style={styles.sectionTitle}>6-Month Trend</Text>
          <Card variant="glass" style={styles.barChartCard}>
            <BarChart
              data={barChartData}
              width={screenWidth - 48 - 40} // Screen - Padding - CardPadding
              height={220}
              yAxisLabel="₹"
              yAxisSuffix=""
              chartConfig={chartConfig}
              style={{ borderRadius: 16 }}
              withInnerLines={false}
              showBarTops={false}
              showValuesOnTopOfBars={true}
              fromZero
            />
          </Card>
        </View>
      )}

      {/* Category Breakdown (Pie & List) */}
      <View style={styles.chartSection}>
        <Text style={styles.sectionTitle}>Spending Breakdown</Text>
        
        {pieChartData.length > 0 ? (
          <Card variant="glass" style={styles.categoryCard}>
            <PieChart
              data={pieChartData}
              width={screenWidth - 48 - 40}
              height={200}
              chartConfig={chartConfig}
              accessor="amount"
              backgroundColor="transparent"
              paddingLeft="15"
              center={[10, 0]}
              absolute
            />

            <View style={styles.divider} />

            {/* List with Progress Bars */}
            <View style={styles.categoryList}>
              {pieChartData.map((item, index) => (
                <View key={item.rawName} style={[styles.categoryRow, index === pieChartData.length - 1 && { borderBottomWidth: 0 }]}>
                  <View style={styles.catInfoRow}>
                    <View style={styles.catIconWrap}>
                      <MaterialCommunityIcons 
                        name={defaultExpenseCategories.find(c => c.name === item.rawName)?.icon || 'currency-inr'} 
                        size={20} 
                        color={item.color} 
                      />
                    </View>
                    <View style={styles.catTextWrap}>
                      <Text style={styles.catName}>{item.rawName}</Text>
                      <Text style={styles.catAmount}>₹{item.originalAmount.toLocaleString('en-IN')}</Text>
                    </View>
                    <Text style={styles.catPercent}>{item.amount}%</Text>
                  </View>
                  
                  {/* Mini Progress Bar */}
                  <View style={styles.miniProgressBg}>
                    <View style={[styles.miniProgressFill, { width: `${item.amount}%` as any, backgroundColor: item.color }]} />
                  </View>
                </View>
              ))}
            </View>
          </Card>
        ) : (
          <Card variant="glass" style={styles.emptyCard}>
            <MaterialCommunityIcons name="chart-pie" size={48} color={themeColors.border} />
            <Text style={styles.emptyText}>No spending recorded this month.</Text>
          </Card>
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
    paddingTop: Platform.OS === 'ios' ? 64 : 48,
    paddingBottom: 48,
  },
  headerTitle: {
    fontSize: 32,
    fontWeight: '800',
    color: themeColors.textPrimary,
    letterSpacing: -1,
    marginBottom: 24,
  },
  monthSelector: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: themeColors.surfaceHover,
    padding: 6,
    borderRadius: 100,
    marginBottom: 32,
  },
  monthBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: themeColors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  monthText: {
    fontSize: 16,
    fontWeight: '700',
    color: themeColors.textPrimary,
  },
  heroCard: {
    padding: 32,
    alignItems: 'center',
    marginBottom: 32,
  },
  heroLabel: {
    fontSize: 14,
    color: themeColors.textSecondary,
    marginBottom: 8,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  heroAmount: {
    fontSize: 48,
    fontWeight: '800',
    color: themeColors.textPrimary,
    letterSpacing: -2,
    marginBottom: 16,
  },
  momBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 100,
  },
  momText: {
    fontSize: 13,
    fontWeight: '700',
    marginLeft: 6,
  },
  chartSection: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: themeColors.textPrimary,
    marginBottom: 16,
    letterSpacing: -0.5,
  },
  barChartCard: {
    padding: 20,
    alignItems: 'center',
    overflow: 'hidden',
  },
  categoryCard: {
    padding: 20,
  },
  divider: {
    height: 1,
    backgroundColor: themeColors.border,
    marginVertical: 24,
  },
  categoryList: {
    flex: 1,
  },
  categoryRow: {
    marginBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: themeColors.border,
    paddingBottom: 20,
  },
  catInfoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  catIconWrap: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: themeColors.surfaceHover,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  catTextWrap: {
    flex: 1,
  },
  catName: {
    fontSize: 16,
    fontWeight: '700',
    color: themeColors.textPrimary,
    marginBottom: 4,
  },
  catAmount: {
    fontSize: 14,
    color: themeColors.textSecondary,
    fontWeight: '500',
  },
  catPercent: {
    fontSize: 16,
    fontWeight: '800',
    color: themeColors.textPrimary,
  },
  miniProgressBg: {
    height: 6,
    backgroundColor: themeColors.surfaceHover,
    borderRadius: 3,
  },
  miniProgressFill: {
    height: '100%',
    borderRadius: 3,
  },
  emptyCard: {
    padding: 48,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyText: {
    color: themeColors.textSecondary,
    marginTop: 16,
    fontSize: 15,
    fontWeight: '500',
  },
});
