import { useState, useEffect } from 'react';
import { collection, query, where, orderBy, onSnapshot } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { Transaction } from '../lib/transactions';
import { useAuth } from '../context/AuthContext';

export function useTransactions(month?: string) {
  const { userData } = useAuth();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!userData?.familyId) {
      setTransactions([]);
      setLoading(false);
      return;
    }

    let q = query(
      collection(db, 'transactions'),
      where('familyId', '==', userData.familyId)
    );

    if (month) {
      q = query(
        collection(db, 'transactions'),
        where('familyId', '==', userData.familyId),
        where('month', '==', month)
      );
    } else {
      q = query(
        collection(db, 'transactions'),
        where('familyId', '==', userData.familyId)
      );
    }

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const results: Transaction[] = [];
        snapshot.forEach((doc) => {
          results.push(doc.data() as Transaction);
        });
        
        // Sort in-memory to avoid Firestore index requirements
        results.sort((a, b) => {
          if (a.date !== b.date) {
            return new Date(b.date).getTime() - new Date(a.date).getTime();
          }
          return b.createdAt - a.createdAt;
        });
        
        setTransactions(results);
        setLoading(false);
      },
      (err) => {
        console.error("Error fetching transactions:", err);
        setError(err.message);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [userData?.familyId, month]);

  return { transactions, loading, error };
}
