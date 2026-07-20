import { collection, doc, setDoc, deleteDoc, query, where, orderBy, getDocs, onSnapshot } from 'firebase/firestore';
import { db } from './firebase';

export type TransactionType = 'expense' | 'income';

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
}

export const addTransaction = async (
  familyId: string,
  type: TransactionType,
  amount: number,
  category: string,
  memberName: string,
  memberId: string,
  date: Date,
  note?: string
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
    note,
    memberName,
    memberId,
    date: formattedDate,
    month: formattedMonth,
    createdAt: Date.now(),
  };

  await setDoc(doc(db, 'transactions', transactionId), newTransaction);
  return transactionId;
};

export const deleteTransaction = async (transactionId: string) => {
  await deleteDoc(doc(db, 'transactions', transactionId));
};
