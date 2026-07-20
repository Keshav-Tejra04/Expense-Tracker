import { doc, updateDoc } from 'firebase/firestore';
import { db } from './firebase';

export const updateFamilyBudget = async (familyId: string, monthlyBudget: number) => {
  await updateDoc(doc(db, 'families', familyId), {
    monthlyBudget
  });
};
