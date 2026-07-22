import React, { createContext, useContext, useEffect, useState } from 'react';
import { User as FirebaseUser, onAuthStateChanged } from 'firebase/auth';
import { doc, onSnapshot } from 'firebase/firestore';
import { auth, db } from '../lib/firebase';
import { User } from '../lib/types';
import { syncService } from '../lib/syncService';

interface AuthContextType {
  user: FirebaseUser | null;
  userData: User | null;
  loading: boolean;
  refreshUserData: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  userData: null,
  loading: true,
  refreshUserData: async () => {},
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [userData, setUserData] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const refreshUserData = async (uid?: string) => {
    const targetUid = uid || user?.uid;
    if (!targetUid) return;
    
    // Check local cache first
    const cachedUser = await syncService.getCache<User>(`@cache_user_${targetUid}`);
    if (cachedUser) {
      setUserData(cachedUser);
    }
  };

  useEffect(() => {
    let unSubDoc: (() => void) | null = null;

    const unsubscribeAuth = onAuthStateChanged(auth, async (firebaseUser) => {
      setUser(firebaseUser);
      
      if (unSubDoc) {
        unSubDoc();
        unSubDoc = null;
      }

      if (firebaseUser) {
        // Load cached user data immediately for instant offline rendering
        const cacheKey = `@cache_user_${firebaseUser.uid}`;
        const cachedUser = await syncService.getCache<User>(cacheKey);
        if (cachedUser) {
          setUserData(cachedUser);
        }

        // Trigger queue sync when user logs in/starts app
        syncService.processSyncQueue();

        // Real-time listener for user document in Firestore
        unSubDoc = onSnapshot(
          doc(db, 'users', firebaseUser.uid),
          (snapshot) => {
            if (snapshot.exists()) {
              const freshData = { uid: firebaseUser.uid, ...snapshot.data() } as User;
              setUserData(freshData);
              syncService.setCache(cacheKey, freshData);
            } else {
              setUserData(null);
            }
            setLoading(false);
          },
          async (error) => {
            console.warn('[AuthContext] Firestore onSnapshot error (likely offline):', error.message);
            // Fallback to cache if error occurs (offline)
            const fallbackUser = await syncService.getCache<User>(cacheKey);
            if (fallbackUser) {
              setUserData(fallbackUser);
            }
            setLoading(false);
          }
        );
      } else {
        setUserData(null);
        setLoading(false);
      }
    });

    return () => {
      unsubscribeAuth();
      if (unSubDoc) unSubDoc();
    };
  }, []);

  return (
    <AuthContext.Provider value={{ user, userData, loading, refreshUserData }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);

