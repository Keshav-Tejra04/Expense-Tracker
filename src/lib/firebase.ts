import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

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

// Initialize Auth natively (automatically handles web persistence)
const auth = getAuth(app);

// Initialize Firestore
const db = getFirestore(app);

export { app, auth, db };
