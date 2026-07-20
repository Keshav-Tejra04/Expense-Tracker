import { useState, useEffect } from 'react';
import { collection, query, where, onSnapshot } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { Lending } from '../lib/lendings';
import { useAuth } from '../context/AuthContext';

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

    const q = query(
      collection(db, 'lendings'),
      where('familyId', '==', userData.familyId)
    );

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const results: Lending[] = [];
        snapshot.forEach((doc) => {
          results.push(doc.data() as Lending);
        });
        
        // Sort in memory to avoid Firestore index requirements
        results.sort((a, b) => {
          // Pending items first, then by date desc
          if (a.status !== b.status) {
            return a.status === 'pending' ? -1 : 1;
          }
          if (a.date !== b.date) {
            return new Date(b.date).getTime() - new Date(a.date).getTime();
          }
          return b.createdAt - a.createdAt;
        });
        
        setLendings(results);
        setLoading(false);
      },
      (err) => {
        console.error("Error fetching lendings:", err);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [userData?.familyId]);

  return { lendings, loading };
}
