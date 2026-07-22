import React, { useState } from 'react';
import { useTheme } from '../../context/ThemeContext';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator, TouchableOpacity, Modal, KeyboardAvoidingView, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { useLendings } from '../../hooks/useLendings';
import { settleLending, deleteLending, Lending } from '../../lib/lendings';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Card } from '../../components/ui/Card';
import { colors } from '../../constants/colors';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { formatIndianNumber, parseIndianNumber } from '../../lib/formatters';

export default function LendingsScreen() {
  const { theme } = useTheme();
  const themeColors = colors[theme];
  const styles = getStyles(themeColors);

  const { lendings, loading } = useLendings();
  const router = useRouter();

  // Modal states
  const [settleModalVisible, setSettleModalVisible] = useState(false);
  const [deleteModalVisible, setDeleteModalVisible] = useState(false);
  const [selectedLending, setSelectedLending] = useState<Lending | null>(null);
  
  // Settle specific states
  const [settleAmountInput, setSettleAmountInput] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  const openSettleModal = (lending: Lending) => {
    setSelectedLending(lending);
    const remaining = lending.amount - (lending.settledAmount || 0);
    setSettleAmountInput(formatIndianNumber(remaining.toString()));
    setSettleModalVisible(true);
  };

  const openDeleteModal = (lending: Lending) => {
    setSelectedLending(lending);
    setDeleteModalVisible(true);
  };

  const confirmSettle = async () => {
    if (!selectedLending) return;
    const amount = parseIndianNumber(settleAmountInput);
    if (amount <= 0) return;

    setIsProcessing(true);
    try {
      await settleLending(selectedLending, amount);
      setSettleModalVisible(false);
    } catch (err) {
      console.error(err);
    } finally {
      setIsProcessing(false);
    }
  };

  const confirmDelete = async () => {
    if (!selectedLending) return;
    setIsProcessing(true);
    try {
      await deleteLending(selectedLending.id, selectedLending.familyId);
      setDeleteModalVisible(false);
    } catch (err) {
      console.error(err);
    } finally {
      setIsProcessing(false);
    }
  };

  if (loading) {
    return (
      <View style={[styles.container, { justifyContent: 'center' }]}>
        <ActivityIndicator size="large" color={themeColors.primary} />
      </View>
    );
  }

  const pendingLendings = lendings.filter(l => l.status === 'pending');
  const settledLendings = lendings.filter(l => l.status === 'settled');

  const renderLendingCard = (lending: Lending) => {
    const isLent = lending.type === 'lent';
    const amountColor = isLent ? themeColors.expense : themeColors.income;
    const settledAmt = lending.settledAmount || 0;
    
    return (
      <Card key={lending.id} variant="glass" style={styles.card}>
        <View style={styles.cardHeader}>
          <View style={styles.badgeContainer}>
            <View style={[styles.badge, { backgroundColor: isLent ? `${themeColors.expense}15` : `${themeColors.income}15` }]}>
              <Text style={[styles.badgeText, { color: amountColor }]}>
                {isLent ? 'Lent To' : 'Borrowed From'}
              </Text>
            </View>
            {lending.status === 'settled' && (
              <View style={[styles.badge, { backgroundColor: `${themeColors.primary}15`, marginLeft: 8 }]}>
                <Text style={[styles.badgeText, { color: themeColors.primary }]}>Settled</Text>
              </View>
            )}
          </View>
          <Text style={[styles.amount, { color: amountColor }]}>
            ₹{lending.amount.toLocaleString('en-IN')}
          </Text>
        </View>

        <Text style={styles.personName}>{lending.personName}</Text>
        {lending.note ? <Text style={styles.note}>{lending.note}</Text> : null}
        
        {/* Progress Bar for Partial Settlement */}
        {lending.status === 'pending' && settledAmt > 0 && (
          <View style={styles.progressContainer}>
            <View style={styles.progressHeader}>
              <Text style={styles.progressLabel}>Settled: ₹{settledAmt.toLocaleString('en-IN')}</Text>
              <Text style={styles.progressLabel}>Left: ₹{(lending.amount - settledAmt).toLocaleString('en-IN')}</Text>
            </View>
            <View style={styles.progressBarBg}>
              <View style={[styles.progressBarFill, { width: `${(settledAmt / lending.amount) * 100}%` as any, backgroundColor: themeColors.primary }]} />
            </View>
          </View>
        )}
        
        <Text style={styles.date}>{lending.date}</Text>

        <View style={styles.actions}>
          {lending.status === 'pending' && (
            <TouchableOpacity 
              style={styles.settleBtn}
              onPress={() => openSettleModal(lending)}
            >
              <MaterialCommunityIcons name="check-circle-outline" size={20} color={themeColors.primary} />
              <Text style={styles.settleText}>Settle</Text>
            </TouchableOpacity>
          )}
          
          <TouchableOpacity 
            style={styles.deleteBtn}
            onPress={() => openDeleteModal(lending)}
          >
            <MaterialCommunityIcons name="delete-outline" size={20} color={themeColors.expense} />
          </TouchableOpacity>
        </View>
      </Card>
    );
  };

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
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
            <MaterialCommunityIcons name="hand-coin-outline" size={64} color={themeColors.border} />
            <Text style={styles.emptyText}>No active lendings or borrowings.</Text>
          </View>
        )}
      </ScrollView>

      {/* Settlement Modal */}
      <Modal visible={settleModalVisible} transparent animationType="fade">
        <KeyboardAvoidingView style={styles.modalOverlay} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Settle Amount</Text>
              <TouchableOpacity onPress={() => setSettleModalVisible(false)}>
                <MaterialCommunityIcons name="close" size={24} color={themeColors.textSecondary} />
              </TouchableOpacity>
            </View>
            <Text style={styles.modalSubtitle}>
              How much did {selectedLending?.personName} return (or how much did you return)?
            </Text>
            <Input
              label="Amount Settled (₹)"
              value={settleAmountInput}
              onChangeText={(val) => setSettleAmountInput(formatIndianNumber(val))}
              keyboardType="number-pad"
            />
            <Button 
              title="Confirm Settlement" 
              onPress={confirmSettle} 
              isLoading={isProcessing}
            />
          </View>
        </KeyboardAvoidingView>
      </Modal>

      {/* Delete Modal */}
      <Modal visible={deleteModalVisible} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Delete Record</Text>
              <TouchableOpacity onPress={() => setDeleteModalVisible(false)}>
                <MaterialCommunityIcons name="close" size={24} color={themeColors.textSecondary} />
              </TouchableOpacity>
            </View>
            <Text style={styles.modalSubtitle}>
              Are you sure you want to delete this record for {selectedLending?.personName}? This action cannot be undone.
            </Text>
            <Button 
              title="Yes, Delete" 
              variant="danger"
              onPress={confirmDelete} 
              isLoading={isProcessing}
              style={{ marginTop: 16 }}
            />
          </View>
        </View>
      </Modal>
    </View>
  );
}

const getStyles = (themeColors: any) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: themeColors.background,
  },
  content: {
    padding: 24,
    paddingTop: 64,
    paddingBottom: 48,
  },
  header: {
    fontSize: 28,
    fontWeight: '800',
    color: themeColors.textPrimary,
    marginBottom: 24,
    letterSpacing: -0.5,
  },
  addButton: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: themeColors.textPrimary,
    marginBottom: 16,
    marginTop: 8,
    letterSpacing: 0.3,
  },
  card: {
    padding: 20,
    marginBottom: 16,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  badgeContainer: {
    flexDirection: 'row',
  },
  badge: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 100,
  },
  badgeText: {
    fontSize: 12,
    fontWeight: '700',
  },
  amount: {
    fontSize: 24,
    fontWeight: '800',
    letterSpacing: -0.5,
  },
  personName: {
    fontSize: 18,
    fontWeight: '700',
    color: themeColors.textPrimary,
    marginBottom: 6,
  },
  note: {
    fontSize: 14,
    color: themeColors.textSecondary,
    marginBottom: 12,
    fontWeight: '500',
  },
  date: {
    fontSize: 13,
    color: themeColors.textMuted,
    marginBottom: 20,
    fontWeight: '500',
  },
  progressContainer: {
    marginBottom: 20,
    backgroundColor: themeColors.surfaceHover,
    padding: 12,
    borderRadius: 16,
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  progressLabel: {
    fontSize: 12,
    color: themeColors.textSecondary,
    fontWeight: '600',
  },
  progressBarBg: {
    height: 6,
    backgroundColor: themeColors.border,
    borderRadius: 3,
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 3,
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: themeColors.border,
    paddingTop: 16,
  },
  settleBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 16,
    backgroundColor: `${themeColors.primary}15`,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 100,
  },
  settleText: {
    color: themeColors.primary,
    fontWeight: '700',
    marginLeft: 6,
  },
  deleteBtn: {
    padding: 8,
    backgroundColor: themeColors.surfaceHover,
    borderRadius: 100,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 64,
  },
  emptyText: {
    color: themeColors.textSecondary,
    marginTop: 16,
    fontSize: 16,
    fontWeight: '500',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  modalContent: {
    backgroundColor: themeColors.surface,
    borderRadius: 24,
    padding: 24,
    width: '100%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.2,
    shadowRadius: 24,
    elevation: 10,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: themeColors.textPrimary,
  },
  modalSubtitle: {
    fontSize: 15,
    color: themeColors.textSecondary,
    marginBottom: 24,
    fontWeight: '500',
    lineHeight: 22,
  },
});
