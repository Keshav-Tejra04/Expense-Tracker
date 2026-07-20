import React, { useState } from 'react';
import { useTheme } from '../../context/ThemeContext';
import { View, Text, StyleSheet, Alert, TouchableOpacity } from 'react-native';
import { useFamily } from '../../hooks/useFamily';
import { useTransactions } from '../../hooks/useTransactions';
import { updateFamilyBudget } from '../../lib/family';
import { Input } from '../ui/Input';
import { Button } from '../ui/Button';
import { Card } from '../ui/Card';
import { colors } from '../../constants/colors';

export function BudgetWidget() {
  const { theme } = useTheme();
  const themeColors = colors[theme];
  const styles = getStyles(themeColors);

  const { family, loading: familyLoading } = useFamily();
  
  // Get current month YYYY-MM
  const today = new Date();
  const currentMonth = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}`;
  
  const { transactions, loading: txnLoading } = useTransactions(currentMonth);
  
  const [budgetInput, setBudgetInput] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);

  if (familyLoading || txnLoading) {
    return null;
  }

  const budget = family?.monthlyBudget || 0;
  
  const handleSaveBudget = async () => {
    if (!family) return;
    const amount = Number(budgetInput);
    if (isNaN(amount) || amount <= 0) {
      Alert.alert('Invalid Amount', 'Please enter a valid budget amount.');
      return;
    }
    
    setSaving(true);
    try {
      await updateFamilyBudget(family.id, amount);
      setIsEditing(false);
      setBudgetInput('');
    } catch (err: any) {
      Alert.alert('Error', err.message);
    } finally {
      setSaving(false);
    }
  };

  const spent = transactions
    .filter(t => t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0);

  const remaining = budget - spent;
  
  // Calculate daily budget left
  const daysInMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0).getDate();
  const daysLeft = daysInMonth - today.getDate() + 1; // +1 to include today
  const dailyLeft = remaining > 0 ? (remaining / daysLeft) : 0;

  const progress = budget > 0 ? Math.min(spent / budget, 1) : 0;
  
  let progressColor = themeColors.primary;
  if (progress > 0.8) progressColor = themeColors.expense;
  else if (progress > 0.5) progressColor = '#F59E0B'; // Orange/warning

  return (
    <View style={styles.container}>
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Monthly Budget</Text>
      </View>
      
      {(!budget || isEditing) ? (
        <Card style={styles.setupCard}>
          <Text style={styles.setupTitle}>
            {budget ? 'Update Budget' : 'Set your family monthly budget'}
          </Text>
          <Input
            label="Monthly Budget (₹)"
            placeholder="e.g. 50000"
            value={budgetInput}
            onChangeText={setBudgetInput}
            keyboardType="numeric"
          />
          <View style={styles.actionRow}>
            {isEditing && (
              <Button 
                title="Cancel" 
                variant="secondary" 
                onPress={() => setIsEditing(false)} 
                style={{ flex: 1, marginRight: 8 }}
              />
            )}
            <Button 
              title="Save Budget" 
              onPress={handleSaveBudget} 
              isLoading={saving}
              style={{ flex: 2 }}
            />
          </View>
        </Card>
      ) : (
        <Card style={styles.budgetCard}>
          <View style={styles.budgetHeader}>
            <Text style={styles.budgetLabel}>{today.toLocaleString('default', { month: 'long' })} Overview</Text>
            <TouchableOpacity onPress={() => { setBudgetInput(budget.toString()); setIsEditing(true); }}>
              <Text style={styles.editBtn}>Edit</Text>
            </TouchableOpacity>
          </View>
          
          <Text style={styles.budgetValue}>₹{budget.toLocaleString('en-IN')}</Text>
          
          <View style={styles.progressContainer}>
            <View style={[styles.progressBar, { width: `${progress * 100}%`, backgroundColor: progressColor }]} />
          </View>
          
          <View style={styles.statsRow}>
            <View style={styles.stat}>
              <Text style={styles.statLabel}>Spent</Text>
              <Text style={[styles.statValue, { color: progress > 0.9 ? themeColors.expense : themeColors.textPrimary }]}>
                ₹{spent.toLocaleString('en-IN')}
              </Text>
            </View>
            <View style={styles.stat}>
              <Text style={styles.statLabel}>Remaining</Text>
              <Text style={[styles.statValue, { color: remaining < 0 ? themeColors.expense : themeColors.income }]}>
                ₹{remaining.toLocaleString('en-IN')}
              </Text>
            </View>
          </View>
          
          <View style={styles.divider} />
          
          <View style={styles.insightRow}>
            <Text style={styles.insightLabel}>Safe Daily Spend ({daysLeft} days left)</Text>
            <Text style={[styles.insightValue, { color: themeColors.income }]}>
              ₹{dailyLeft.toFixed(0)} / day
            </Text>
          </View>
          
          {remaining < 0 && (
            <Text style={styles.overBudget}>
              Over budget by ₹{Math.abs(remaining).toLocaleString('en-IN')}
            </Text>
          )}
        </Card>
      )}
    </View>
  );
}

const getStyles = (themeColors: any) => StyleSheet.create({
  container: {
    marginBottom: 24,
  },
  sectionHeader: {
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: themeColors.textPrimary,
  },
  setupCard: {
    padding: 20,
  },
  setupTitle: {
    fontSize: 14,
    color: themeColors.textPrimary,
    marginBottom: 16,
    fontWeight: '500',
  },
  actionRow: {
    flexDirection: 'row',
    marginTop: 12,
  },
  budgetCard: {
    padding: 20,
  },
  budgetHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  budgetLabel: {
    fontSize: 13,
    color: themeColors.textSecondary,
    fontWeight: '500',
  },
  editBtn: {
    color: themeColors.primary,
    fontWeight: '600',
    fontSize: 13,
  },
  budgetValue: {
    fontSize: 28,
    fontWeight: 'bold',
    color: themeColors.textPrimary,
    marginBottom: 20,
  },
  progressContainer: {
    height: 6,
    backgroundColor: themeColors.border,
    borderRadius: 3,
    overflow: 'hidden',
    marginBottom: 20,
  },
  progressBar: {
    height: '100%',
    borderRadius: 3,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  stat: {
    flex: 1,
  },
  statLabel: {
    fontSize: 12,
    color: themeColors.textSecondary,
    marginBottom: 4,
  },
  statValue: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  divider: {
    height: 1,
    backgroundColor: themeColors.border,
    marginVertical: 12,
  },
  insightRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  insightLabel: {
    color: themeColors.textSecondary,
    fontSize: 13,
  },
  insightValue: {
    color: themeColors.textPrimary,
    fontWeight: 'bold',
    fontSize: 13,
  },
  overBudget: {
    marginTop: 12,
    color: themeColors.expense,
    fontWeight: '500',
    fontSize: 13,
    textAlign: 'center',
  },
});
