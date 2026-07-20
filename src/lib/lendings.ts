import { collection, doc, setDoc, deleteDoc, updateDoc } from 'firebase/firestore';
import { db } from './firebase';

export type LendingType = 'lent' | 'borrowed';
export type LendingStatus = 'pending' | 'settled';

export interface Lending {
  id: string;
  familyId: string;
  type: LendingType;
  amount: number;
  settledAmount?: number;
  personName: string;
  note?: string;
  status: LendingStatus;
  date: string; // YYYY-MM-DD
  createdAt: number;
}

export const addLending = async (
  familyId: string,
  type: LendingType,
  amount: number,
  personName: string,
  date: Date,
  note?: string
) => {
  const lendingId = `lnd_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
  
  const year = date.getFullYear();
  const monthStr = String(date.getMonth() + 1).padStart(2, '0');
  const dayStr = String(date.getDate()).padStart(2, '0');
  const formattedDate = `${year}-${monthStr}-${dayStr}`;

  const newLending: Lending = {
    id: lendingId,
    familyId,
    type,
    amount,
    settledAmount: 0,
    personName,
    note,
    status: 'pending',
    date: formattedDate,
    createdAt: Date.now(),
  };

  await setDoc(doc(db, 'lendings', lendingId), newLending);
  return lendingId;
};

export const settleLending = async (lending: Lending, amount: number) => {
  const currentSettled = lending.settledAmount || 0;
  const newSettled = currentSettled + amount;
  
  // If the new settled amount is greater than or equal to the total amount, mark as settled
  const newStatus = newSettled >= lending.amount ? 'settled' : 'pending';

  await updateDoc(doc(db, 'lendings', lending.id), {
    settledAmount: newSettled,
    status: newStatus
  });
};

export const deleteLending = async (lendingId: string) => {
  await deleteDoc(doc(db, 'lendings', lendingId));
};
