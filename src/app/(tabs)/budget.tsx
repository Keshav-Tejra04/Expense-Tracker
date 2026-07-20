import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Alert, TouchableOpacity } from 'react-native';
import { useFamily } from '../../hooks/useFamily';
import { useTransactions } from '../../hooks/useTransactions';
import { updateFamilyBudget } from '../../lib/family';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { colors } from '../../constants/colors';

export default function BudgetScreen() {
  const { family, loading: familyLoading } = useFamily();
  
  // Get current month YYYY-MM
  const today = new Date();
  const currentMonth = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}`;
  
  const { transactions, loading: txnLoading } = useTransactions(currentMonth);
  
  const [budgetInput, setBudgetInput] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);

  if (familyLoading || txnLoading) {
    return (
      <View style={[styles.container, { justifyContent: 'center' }]}>
        <Text style={{ color: colors.dark.textSecondary, textAlign: 'center' }}>Loading...</Text>
      </View>
    );
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
  
  let progressColor = colors.dark.primary;
  if (progress > 0.8) progressColor = colors.dark.expense;
  else if (progress > 0.5) progressColor = '#F59E0B'; // Orange/warning

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.header}>Monthly Budget</Text>
      
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
            <Text style={styles.budgetLabel}>Budget for {today.toLocaleString('default', { month: 'long' })}</Text>
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
              <Text style={[styles.statValue, { color: progress > 0.9 ? colors.dark.expense : colors.dark.textPrimary }]}>
                ₹{spent.toLocaleString('en-IN')}
              </Text>
            </View>
            <View style={styles.stat}>
              <Text style={styles.statLabel}>Remaining</Text>
              <Text style={[styles.statValue, { color: remaining < 0 ? colors.dark.expense : colors.dark.income }]}>
                ₹{remaining.toLocaleString('en-IN')}
              </Text>
            </View>
          </View>
        </Card>
      )}

      {budget > 0 && !isEditing && (
        <Card style={styles.insightCard}>
          <Text style={styles.insightTitle}>Insights</Text>
          
          <View style={styles.insightRow}>
            <Text style={styles.insightLabel}>Days Left in Month</Text>
            <Text style={styles.insightValue}>{daysLeft} days</Text>
          </View>
          
          <View style={styles.insightRow}>
            <Text style={styles.insightLabel}>Safe Daily Spend</Text>
            <Text style={[styles.insightValue, { color: colors.dark.income }]}>
              ₹{dailyLeft.toFixed(0)} / day
            </Text>
          </View>
          
          {remaining < 0 && (
            <Text style={styles.overBudget}>
              You have over-extended your budget by ₹{Math.abs(remaining).toLocaleString('en-IN')}.
            </Text>
          )}
        </Card>
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
  },
  header: {
    fontSize: 28,
    fontWeight: 'bold',
    color: colors.dark.textPrimary,
    marginBottom: 24,
  },
  setupCard: {
    padding: 24,
  },
  setupTitle: {
    fontSize: 16,
    color: colors.dark.textPrimary,
    marginBottom: 16,
    fontWeight: '500',
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
    color: colors.dark.textSecondary,
  },
  editBtn: {
    color: colors.dark.primary,
    fontWeight: 'bold',
  },
  budgetValue: {
    fontSize: 32,
    fontWeight: 'bold',
    color: colors.dark.textPrimary,
    marginBottom: 24,
  },
  progressContainer: {
    height: 8,
    backgroundColor: colors.dark.border,
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 24,
  },
  progressBar: {
    height: '100%',
    borderRadius: 4,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  stat: {
    flex: 1,
  },
  statLabel: {
    fontSize: 12,
    color: colors.dark.textSecondary,
    marginBottom: 4,
  },
  statValue: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  insightCard: {
    padding: 24,
    marginTop: 20,
  },
  insightTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.dark.textPrimary,
    marginBottom: 16,
  },
  insightRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  insightLabel: {
    color: colors.dark.textSecondary,
    fontSize: 14,
  },
  insightValue: {
    color: colors.dark.textPrimary,
    fontWeight: 'bold',
    fontSize: 14,
  },
  overBudget: {
    marginTop: 16,
    color: colors.dark.expense,
    fontWeight: '500',
    backgroundColor: `${colors.dark.expense}20`,
    padding: 12,
    borderRadius: 8,
  },
});
