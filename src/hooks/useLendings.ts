import { useState, useEffect } from 'react';
import { collection, query, where, onSnapshot } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { Lending } from '../lib/lendings';
import { useAuth } from '../context/AuthContext';
import { syncService } from '../lib/syncService';

export function useLendings() {
  const { userData } = useAuth();
  const [lendings, setLendings] = useState<Lending[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userData?.familyId) {
      setLendings([]);
      setLoading(false);
      return;
    }

    const familyId = userData.familyId;
    const cacheKey = `@cache_lendings_${familyId}`;

    const helperSortLendings = (list: Lending[]) => {
      return [...list].sort((a, b) => {
        if (a.status !== b.status) {
          return a.status === 'pending' ? -1 : 1;
        }
        if (a.date !== b.date) {
          return new Date(b.date).getTime() - new Date(a.date).getTime();
        }
        return b.createdAt - a.createdAt;
      });
    };

    const applyPendingActions = (baseList: Lending[], queue: any[]) => {
      let merged = [...baseList];
      for (const item of queue) {
        if (item.type === 'ADD_LENDING' && item.payload.familyId === familyId) {
          if (!merged.some(l => l.id === item.payload.id)) {
            merged.push(item.payload);
          }
        } else if (item.type === 'SETTLE_LENDING') {
          merged = merged.map(l => {
            if (l.id === item.payload.lendingId) {
              return { ...l, settledAmount: item.payload.settledAmount, status: item.payload.status };
            }
            return l;
          });
        } else if (item.type === 'DELETE_LENDING') {
          merged = merged.filter(l => l.id !== item.payload.lendingId);
        }
      }
      return helperSortLendings(merged);
    };

    // Load cached lendings first
    const loadCache = async () => {
      const cached = await syncService.getCache<Lending[]>(cacheKey);
      const queue = await syncService.getQueue();
      const base = cached || [];
      setLendings(applyPendingActions(base, queue));
      setLoading(false);
    };

    loadCache();

    const q = query(
      collection(db, 'lendings'),
      where('familyId', '==', familyId)
    );

    const unsubscribe = onSnapshot(
      q,
      async (snapshot) => {
        const results: Lending[] = [];
        snapshot.forEach((doc) => {
          results.push(doc.data() as Lending);
        });

        syncService.setCache(cacheKey, results);

        const queue = await syncService.getQueue();
        setLendings(applyPendingActions(results, queue));
        setLoading(false);
      },
      async (err) => {
        console.warn("Error/Offline fetching lendings:", err.message);
        const cached = await syncService.getCache<Lending[]>(cacheKey);
        if (cached) {
          const queue = await syncService.getQueue();
          setLendings(applyPendingActions(cached, queue));
        }
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [userData?.familyId]);

  return { lendings, loading };
}

