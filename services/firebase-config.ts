import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';

// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDIplfLjQxkYU3uUqQtaoK5ZosqYWozt-Q",
  authDomain: "autonomy-app-4baf6.firebaseapp.com",
  projectId: "autonomy-app-4baf6",
  storageBucket: "autonomy-app-4baf6.firebasestorage.app",
  messagingSenderId: "412344199785",
  appId: "1:412344199785:web:77421036ba22aa2e8950f8"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firestore
export const db = getFirestore(app);

export default app;
