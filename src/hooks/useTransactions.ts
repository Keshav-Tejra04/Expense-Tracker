import { useState, useEffect } from 'react';
import { collection, query, where, onSnapshot } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { Transaction } from '../lib/transactions';
import { useAuth } from '../context/AuthContext';
import { syncService } from '../lib/syncService';

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

    const familyId = userData.familyId;
    const cacheKey = `@cache_txns_${familyId}`;

    const helperProcessTransactions = (list: Transaction[], monthFilter?: string) => {
      let filtered = list;
      if (monthFilter) {
        filtered = list.filter(t => t.month === monthFilter);
      }
      return [...filtered].sort((a, b) => {
        if (a.date !== b.date) {
          return new Date(b.date).getTime() - new Date(a.date).getTime();
        }
        return b.createdAt - a.createdAt;
      });
    };

    // Load cached transactions first
    const loadCache = async () => {
      const cached = await syncService.getCache<Transaction[]>(cacheKey);
      const queue = await syncService.getQueue();
      
      let baseTxns = cached || [];
      
      // Apply pending offline actions onto cache
      for (const item of queue) {
        if (item.type === 'ADD_TRANSACTION' && item.payload.familyId === familyId) {
          if (!baseTxns.some(t => t.id === item.payload.id)) {
            baseTxns = [item.payload, ...baseTxns];
          }
        } else if (item.type === 'DELETE_TRANSACTION') {
          baseTxns = baseTxns.filter(t => t.id !== item.payload.transactionId);
        }
      }

      setTransactions(helperProcessTransactions(baseTxns, month));
      setLoading(false);
    };

    loadCache();

    let q = query(
      collection(db, 'transactions'),
      where('familyId', '==', familyId)
    );

    if (month) {
      q = query(
        collection(db, 'transactions'),
        where('familyId', '==', familyId),
        where('month', '==', month)
      );
    }

    const unsubscribe = onSnapshot(
      q,
      async (snapshot) => {
        const results: Transaction[] = [];
        snapshot.forEach((doc) => {
          results.push(doc.data() as Transaction);
        });

        // Save fresh full snapshot for this family (only if not month-filtered)
        if (!month) {
          syncService.setCache(cacheKey, results);
        }
        
        // Also check if there are any un-synced pending ADD/DELETE transactions to merge visually
        const queue = await syncService.getQueue();
        let merged = [...results];
        for (const item of queue) {
          if (item.type === 'ADD_TRANSACTION' && item.payload.familyId === familyId) {
            if (!merged.some(t => t.id === item.payload.id)) {
              merged.push(item.payload);
            }
          } else if (item.type === 'DELETE_TRANSACTION') {
            merged = merged.filter(t => t.id !== item.payload.transactionId);
          }
        }

        setTransactions(helperProcessTransactions(merged, month));
        setLoading(false);
      },
      async (err) => {
        console.warn("Error/Offline fetching transactions:", err.message);
        setError(err.message);
        // Fall back to cache
        const cached = await syncService.getCache<Transaction[]>(cacheKey);
        if (cached) {
          setTransactions(helperProcessTransactions(cached, month));
        }
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [userData?.familyId, month]);

  return { transactions, loading, error };
}

