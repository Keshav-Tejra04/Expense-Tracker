import React from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator, TouchableOpacity, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { useLendings } from '../../hooks/useLendings';
import { settleLending, deleteLending } from '../../lib/lendings';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { colors } from '../../constants/colors';
import { MaterialCommunityIcons } from '@expo/vector-icons';

export default function LendingsScreen() {
  const { lendings, loading } = useLendings();
  const router = useRouter();

  const handleSettle = (id: string, person: string) => {
    Alert.alert('Mark as Settled', `Has ${person} returned the money / Have you returned the money to ${person}?`, [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Yes, Settled', onPress: () => settleLending(id) }
    ]);
  };

  const handleDelete = (id: string) => {
    Alert.alert('Delete Record', 'Are you sure you want to delete this record?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: () => deleteLending(id) }
    ]);
  };

  if (loading) {
    return (
      <View style={[styles.container, { justifyContent: 'center' }]}>
        <ActivityIndicator size="large" color={colors.dark.primary} />
      </View>
    );
  }

  const pendingLendings = lendings.filter(l => l.status === 'pending');
  const settledLendings = lendings.filter(l => l.status === 'settled');

  const renderLendingCard = (lending: any) => {
    const isLent = lending.type === 'lent';
    const amountColor = isLent ? colors.dark.expense : colors.dark.income; // Lent = we gave money (-), Borrowed = we got money (+)
    
    return (
      <Card key={lending.id} style={styles.card}>
        <View style={styles.cardHeader}>
          <View style={styles.badgeContainer}>
            <View style={[styles.badge, { backgroundColor: isLent ? `${colors.dark.expense}20` : `${colors.dark.income}20` }]}>
              <Text style={[styles.badgeText, { color: amountColor }]}>
                {isLent ? 'Lent To' : 'Borrowed From'}
              </Text>
            </View>
            {lending.status === 'settled' && (
              <View style={[styles.badge, { backgroundColor: `${colors.dark.primary}20`, marginLeft: 8 }]}>
                <Text style={[styles.badgeText, { color: colors.dark.primary }]}>Settled</Text>
              </View>
            )}
          </View>
          <Text style={[styles.amount, { color: amountColor }]}>
            ₹{lending.amount.toLocaleString('en-IN')}
          </Text>
        </View>

        <Text style={styles.personName}>{lending.personName}</Text>
        {lending.note ? <Text style={styles.note}>{lending.note}</Text> : null}
        <Text style={styles.date}>{lending.date}</Text>

        <View style={styles.actions}>
          {lending.status === 'pending' && (
            <TouchableOpacity 
              style={styles.settleBtn}
              onPress={() => handleSettle(lending.id, lending.personName)}
            >
              <MaterialCommunityIcons name="check-circle-outline" size={20} color={colors.dark.primary} />
              <Text style={styles.settleText}>Mark Settled</Text>
            </TouchableOpacity>
          )}
          
          <TouchableOpacity 
            style={styles.deleteBtn}
            onPress={() => handleDelete(lending.id)}
          >
            <MaterialCommunityIcons name="delete-outline" size={20} color={colors.dark.expense} />
          </TouchableOpacity>
        </View>
      </Card>
    );
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.header}>Lendings & Borrowings</Text>
      
      <Button 
        title="+ Add New Record" 
        onPress={() => router.push('/add-lending')} 
        style={styles.addButton}
      />

      {pendingLendings.length > 0 && (
        <>
          <Text style={styles.sectionTitle}>Pending</Text>
          {pendingLendings.map(renderLendingCard)}
        </>
      )}

      {settledLendings.length > 0 && (
        <>
          <Text style={styles.sectionTitle}>Settled History</Text>
          {settledLendings.map(renderLendingCard)}
        </>
      )}

      {lendings.length === 0 && (
        <View style={styles.emptyState}>
          <MaterialCommunityIcons name="hand-coin-outline" size={64} color={colors.dark.border} />
          <Text style={styles.emptyText}>No active lendings or borrowings.</Text>
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
  addButton: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.dark.textPrimary,
    marginBottom: 16,
    marginTop: 8,
  },
  card: {
    padding: 16,
    marginBottom: 16,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  badgeContainer: {
    flexDirection: 'row',
  },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  badgeText: {
    fontSize: 12,
    fontWeight: 'bold',
  },
  amount: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  personName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.dark.textPrimary,
    marginBottom: 4,
  },
  note: {
    fontSize: 14,
    color: colors.dark.textSecondary,
    marginBottom: 8,
  },
  date: {
    fontSize: 12,
    color: colors.dark.textMuted,
    marginBottom: 16,
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: colors.dark.border,
    paddingTop: 12,
  },
  settleBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 16,
    backgroundColor: `${colors.dark.primary}10`,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  settleText: {
    color: colors.dark.primary,
    fontWeight: 'bold',
    marginLeft: 6,
  },
  deleteBtn: {
    padding: 6,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 64,
  },
  emptyText: {
    color: colors.dark.textSecondary,
    marginTop: 16,
    fontSize: 16,
  },
});
