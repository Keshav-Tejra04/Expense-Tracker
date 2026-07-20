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
  
  const daysInMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0).getDate();
  const daysLeft = daysInMonth - today.getDate() + 1;
  const dailyLeft = remaining > 0 ? (remaining / daysLeft) : 0;

  const progress = budget > 0 ? Math.min(spent / budget, 1) : 0;
  
  let progressColor = themeColors.primary;
  if (progress > 0.85) progressColor = themeColors.expense;
  else if (progress > 0.6) progressColor = '#F59E0B'; // Amber

  return (
    <View style={styles.container}>
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Monthly Budget</Text>
      </View>
      
      {(!budget || isEditing) ? (
        <Card variant="glass" style={styles.setupCard}>
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
        <Card variant="glass" style={styles.budgetCard}>
          <View style={styles.budgetHeader}>
            <Text style={styles.budgetLabel}>{today.toLocaleString('default', { month: 'long' })} Overview</Text>
            <TouchableOpacity onPress={() => { setBudgetInput(budget.toString()); setIsEditing(true); }}>
              <Text style={styles.editBtn}>Edit</Text>
            </TouchableOpacity>
          </View>
          
          <Text style={styles.budgetValue}>₹{budget.toLocaleString('en-IN')}</Text>
          
          <View style={styles.progressContainer}>
            <View 
              style={[
                styles.progressBar, 
                { 
                  width: `${progress * 100}%`, 
                  backgroundColor: progressColor,
                  shadowColor: progressColor,
                }
              ]} 
            />
          </View>
          
          <View style={styles.statsRow}>
            <View style={styles.stat}>
              <Text style={styles.statLabel}>Spent</Text>
              <Text style={[styles.statValue, { color: themeColors.textPrimary }]}>
                ₹{spent.toLocaleString('en-IN')}
              </Text>
            </View>
            <View style={[styles.stat, { alignItems: 'flex-end' }]}>
              <Text style={styles.statLabel}>Remaining</Text>
              <Text style={[styles.statValue, { color: remaining < 0 ? themeColors.expense : themeColors.income }]}>
                ₹{remaining.toLocaleString('en-IN')}
              </Text>
            </View>
          </View>
          
          <View style={styles.divider} />
          
          <View style={styles.insightRow}>
            <Text style={styles.insightLabel}>Safe Daily Spend ({daysLeft} days left)</Text>
            <Text style={[styles.insightValue, { color: themeColors.primary }]}>
              ₹{dailyLeft.toFixed(0)} / day
            </Text>
          </View>
          
          {remaining < 0 && (
            <View style={styles.overBudgetContainer}>
              <Text style={styles.overBudget}>
                Over budget by ₹{Math.abs(remaining).toLocaleString('en-IN')}
              </Text>
            </View>
          )}
        </Card>
      )}
    </View>
  );
}

const getStyles = (themeColors: any) => StyleSheet.create({
  container: {
    marginTop: 16,
    marginBottom: 8,
  },
  sectionHeader: {
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
  setupCard: {
    padding: 24,
  },
  setupTitle: {
    fontSize: 16,
    color: themeColors.textPrimary,
    marginBottom: 20,
    fontWeight: '600',
  },
  actionRow: {
    flexDirection: 'row',
    marginTop: 16,
  },
  budgetCard: {
    padding: 24,
  },
  budgetHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  budgetLabel: {
    fontSize: 14,
    color: themeColors.textSecondary,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  editBtn: {
    color: themeColors.primary,
    fontWeight: '700',
    fontSize: 14,
  },
  budgetValue: {
    fontSize: 36,
    fontWeight: '800',
    color: themeColors.textPrimary,
    marginBottom: 24,
    letterSpacing: -0.5,
  },
  progressContainer: {
    height: 8,
    backgroundColor: themeColors.surfaceHover,
    borderRadius: 4,
    marginBottom: 24,
  },
  progressBar: {
    height: '100%',
    borderRadius: 4,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 8,
    elevation: 4,
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
    fontSize: 13,
    color: themeColors.textSecondary,
    marginBottom: 6,
    fontWeight: '500',
  },
  statValue: {
    fontSize: 18,
    fontWeight: '700',
  },
  divider: {
    height: 1,
    backgroundColor: themeColors.border,
    marginVertical: 16,
  },
  insightRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  insightLabel: {
    color: themeColors.textSecondary,
    fontSize: 14,
    fontWeight: '500',
  },
  insightValue: {
    color: themeColors.primary,
    fontWeight: '700',
    fontSize: 14,
  },
  overBudgetContainer: {
    marginTop: 16,
    backgroundColor: `${themeColors.expense}15`,
    padding: 12,
    borderRadius: 12,
  },
  overBudget: {
    color: themeColors.expense,
    fontWeight: '600',
    fontSize: 14,
    textAlign: 'center',
  },
});
