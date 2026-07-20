import { useState, useEffect } from 'react';
import { doc, onSnapshot } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { Family } from '../lib/types';
import { useAuth } from '../context/AuthContext';

export function useFamily() {
  const { userData } = useAuth();
  const [family, setFamily] = useState<Family | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userData?.familyId) {
      setFamily(null);
      setLoading(false);
      return;
    }

    const unsubscribe = onSnapshot(
      doc(db, 'families', userData.familyId),
      (docSnap) => {
        if (docSnap.exists()) {
          setFamily(docSnap.data() as Family);
        } else {
          setFamily(null);
        }
        setLoading(false);
      },
      (err) => {
        console.error("Error fetching family:", err);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [userData?.familyId]);

  return { family, loading };
}
