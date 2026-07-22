import { createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut } from 'firebase/auth';
import { doc, setDoc, getDoc, collection, query, where, getDocs } from 'firebase/firestore';
import { auth, db } from './firebase';
import { User, Family } from './types';
import { syncService } from './syncService';

// Generate a random 6-character alphanumeric code
const generateFamilyCode = () => {
  return Math.random().toString(36).substring(2, 8).toUpperCase();
};

export const createFamily = async (
  userId: string, 
  userName: string, 
  familyName: string,
  initialCashBalance?: number,
  initialOnlineBalance?: number
): Promise<string> => {
  const familyId = `fam_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
  const familyCode = generateFamilyCode();

  const newFamily: Family = {
    id: familyId,
    name: familyName,
    code: familyCode,
    members: [userName],
    currency: '₹',
    createdAt: Date.now(),
    createdBy: userId,
    initialCashBalance: initialCashBalance || 0,
    initialOnlineBalance: initialOnlineBalance || 0,
  };

  await setDoc(doc(db, 'families', familyId), newFamily);
  return familyId;
};

export const registerUser = async (
  email: string, 
  password: string, 
  name: string, 
  familyName?: string, 
  familyCode?: string,
  initialCashBalance?: number,
  initialOnlineBalance?: number
) => {
  // 1. Create Firebase Auth User
  const userCredential = await createUserWithEmailAndPassword(auth, email, password);
  const firebaseUser = userCredential.user;

  let familyId: string | null = null;
  let role: 'admin' | 'member' = 'member';

  // 2. Handle Family Logic
  if (familyCode) {
    // Join existing family
    const q = query(collection(db, 'families'), where('code', '==', familyCode.toUpperCase()));
    const querySnapshot = await getDocs(q);
    
    if (querySnapshot.empty) {
      throw new Error('Invalid Family Code');
    }
    
    const familyDoc = querySnapshot.docs[0];
    familyId = familyDoc.id;
    
    // Add user name to family members list
    const familyData = familyDoc.data() as Family;
    await setDoc(doc(db, 'families', familyId), {
      ...familyData,
      members: [...familyData.members, name]
    });
    
  } else if (familyName) {
    // Create new family
    familyId = await createFamily(firebaseUser.uid, name, familyName, initialCashBalance, initialOnlineBalance);
    role = 'admin';
  } else {
    throw new Error('Must provide either a Family Name or a Family Code');
  }

  // 3. Create User Profile
  const userProfile: User = {
    uid: firebaseUser.uid,
    email,
    name,
    familyId,
    role,
    createdAt: Date.now(),
  };

  await setDoc(doc(db, 'users', firebaseUser.uid), userProfile);
  await syncService.setCache(`@cache_user_${firebaseUser.uid}`, userProfile);
  return userProfile;
};

export const loginUser = async (email: string, password: string) => {
  const userCredential = await signInWithEmailAndPassword(auth, email, password);
  return userCredential.user;
};

export const logoutUser = async () => {
  await signOut(auth);
};
