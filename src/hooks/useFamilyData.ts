import { useState, useEffect } from 'react';
import { doc, onSnapshot } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { Family } from '../lib/types';
import { useAuth } from '../context/AuthContext';
import { syncService } from '../lib/syncService';

export function useFamilyData() {
  const { userData } = useAuth();
  const [family, setFamily] = useState<Family | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userData?.familyId) {
      setFamily(null);
      setLoading(false);
      return;
    }

    const familyId = userData.familyId;
    const cacheKey = `@cache_family_${familyId}`;

    const applyPendingActions = (baseFamily: Family | null, queue: any[]): Family | null => {
      if (!baseFamily) return null;
      let updated = { ...baseFamily };
      for (const item of queue) {
        if (item.type === 'UPDATE_BALANCES' && item.payload.familyId === familyId) {
          updated.initialCashBalance = item.payload.initialCashBalance;
          updated.initialOnlineBalance = item.payload.initialOnlineBalance;
        } else if (item.type === 'UPDATE_BUDGET' && item.payload.familyId === familyId) {
          updated.monthlyBudget = item.payload.monthlyBudget;
        }
      }
      return updated;
    };

    const loadCache = async () => {
      const cached = await syncService.getCache<Family>(cacheKey);
      const queue = await syncService.getQueue();
      if (cached) {
        setFamily(applyPendingActions(cached, queue));
      }
      setLoading(false);
    };

    loadCache();

    const unsubscribe = onSnapshot(
      doc(db, 'families', familyId),
      async (snapshot) => {
        if (snapshot.exists()) {
          const fresh = snapshot.data() as Family;
          syncService.setCache(cacheKey, fresh);
          const queue = await syncService.getQueue();
          setFamily(applyPendingActions(fresh, queue));
        } else {
          setFamily(null);
        }
        setLoading(false);
      },
      async (err) => {
        console.warn("Error/Offline fetching family:", err.message);
        const cached = await syncService.getCache<Family>(cacheKey);
        if (cached) {
          const queue = await syncService.getQueue();
          setFamily(applyPendingActions(cached, queue));
        }
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [userData?.familyId]);

  return { family, loading };
}

