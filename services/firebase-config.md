COPY AND PASTE THIS CODE INTO A 'firebase-config.ts' file in this folder and input the correct info

// Import the functions you need from the SDKs you need
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

// Your web app's Firebase configuration
// For Firebase JS SDK v9-compat and v9
const firebaseConfig = {
  apiKey: "your-api-key-here",
  authDomain: "autonomy-app-4baf6.firebaseapp.com",
  projectId: "autonomy-app-4baf6",
  storageBucket: "autonomy-app-4baf6.firebasestorage.app",
  messagingSenderId: "your-messaging-sender-id",
  appId: "your-app-id-here",
  measurementId: "your-measurement-id" // Optional, for Analytics
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase services
export const db = getFirestore(app);
export const auth = getAuth(app);

export default app;