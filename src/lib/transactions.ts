import { doc, setDoc, deleteDoc } from 'firebase/firestore';
import { db } from './firebase';
import { syncService } from './syncService';

export type TransactionType = 'expense' | 'income' | 'transfer';
export type PaymentMethod = 'cash' | 'online';

export interface Transaction {
  id: string;
  familyId: string;
  type: TransactionType;
  amount: number;
  category: string;
  note?: string;
  memberName: string;
  memberId: string;
  date: string; // YYYY-MM-DD
  month: string; // YYYY-MM
  createdAt: number;
  paymentMethod?: PaymentMethod; // Used for expense/income
  transferSource?: PaymentMethod; // Used for transfer (e.g. 'online' means online -> cash)
}

export const addTransaction = async (
  familyId: string,
  type: TransactionType,
  amount: number,
  category: string,
  memberName: string,
  memberId: string,
  date: Date,
  note?: string,
  paymentMethod?: PaymentMethod,
  transferSource?: PaymentMethod
) => {
  const transactionId = `txn_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
  
  // Format dates for denormalized querying
  const year = date.getFullYear();
  const monthStr = String(date.getMonth() + 1).padStart(2, '0');
  const dayStr = String(date.getDate()).padStart(2, '0');
  
  const formattedDate = `${year}-${monthStr}-${dayStr}`;
  const formattedMonth = `${year}-${monthStr}`;

  const newTransaction: Transaction = {
    id: transactionId,
    familyId,
    type,
    amount,
    category,
    memberName,
    memberId,
    date: formattedDate,
    month: formattedMonth,
    createdAt: Date.now(),
  };

  if (note !== undefined) newTransaction.note = note;
  if (paymentMethod !== undefined) newTransaction.paymentMethod = paymentMethod;
  if (transferSource !== undefined) newTransaction.transferSource = transferSource;

  // Update local cache immediately
  const cacheKey = `@cache_txns_${familyId}`;
  const cachedTxns = (await syncService.getCache<Transaction[]>(cacheKey)) || [];
  await syncService.setCache(cacheKey, [newTransaction, ...cachedTxns]);

  // Enqueue offline/online sync action
  await syncService.enqueueAction('ADD_TRANSACTION', newTransaction);

  return transactionId;
};

export const deleteTransaction = async (transactionId: string, familyId?: string) => {
  if (familyId) {
    const cacheKey = `@cache_txns_${familyId}`;
    const cachedTxns = (await syncService.getCache<Transaction[]>(cacheKey)) || [];
    await syncService.setCache(cacheKey, cachedTxns.filter(t => t.id !== transactionId));
  }

  await syncService.enqueueAction('DELETE_TRANSACTION', { transactionId });
};

