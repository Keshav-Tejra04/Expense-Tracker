import { collection, doc, setDoc, deleteDoc, query, where, orderBy, getDocs, onSnapshot } from 'firebase/firestore';
import { db } from './firebase';

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

  const newTransaction: any = {
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

  await setDoc(doc(db, 'transactions', transactionId), newTransaction);
  return transactionId;
};

export const deleteTransaction = async (transactionId: string) => {
  await deleteDoc(doc(db, 'transactions', transactionId));
};
