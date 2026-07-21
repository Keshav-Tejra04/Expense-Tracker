import { initializeApp, getApps, getApp } from 'firebase/app';
import { initializeAuth, getAuth } from 'firebase/auth';
// @ts-ignore - Ignore TS error for this specific export (it exists at runtime for React Native)
import { getReactNativePersistence } from 'firebase/auth';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getFirestore } from 'firebase/firestore';
import { Platform } from 'react-native';

const firebaseConfig = {
  apiKey: "AIzaSyBiqMLlFqCzfwhSMhvPCQC6TEvWMy9Woe8",
  authDomain: "expense-tracker-fea2c.firebaseapp.com",
  projectId: "expense-tracker-fea2c",
  storageBucket: "expense-tracker-fea2c.firebasestorage.app",
  messagingSenderId: "983991394710",
  appId: "1:983991394710:web:60351e58296fa008cebdb7",
  measurementId: "G-4C3SBR3C7V"
};

// Initialize Firebase
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();

let auth: any;

if (Platform.OS === 'web') {
  // Web handles persistence automatically out of the box
  auth = getAuth(app);
} else {
  // Native apps require AsyncStorage for permanent persistence
  // @ts-ignore
  auth = initializeAuth(app, {
    persistence: getReactNativePersistence(AsyncStorage)
  });
}

// Initialize Firestore
const db = getFirestore(app);

export { app, auth, db };
