import { collection, doc, setDoc, deleteDoc, updateDoc } from 'firebase/firestore';
import { db } from './firebase';

export type LendingType = 'lent' | 'borrowed';
export type LendingStatus = 'pending' | 'settled';

export interface Lending {
  id: string;
  familyId: string;
  type: LendingType;
  amount: number;
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
    personName,
    note,
    status: 'pending',
    date: formattedDate,
    createdAt: Date.now(),
  };

  await setDoc(doc(db, 'lendings', lendingId), newLending);
  return lendingId;
};

export const settleLending = async (lendingId: string) => {
  await updateDoc(doc(db, 'lendings', lendingId), {
    status: 'settled'
  });
};

export const deleteLending = async (lendingId: string) => {
  await deleteDoc(doc(db, 'lendings', lendingId));
};
