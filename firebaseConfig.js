import { initializeApp, getApps } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
 apiKey: "AIzaSyDDEqjHHfbLpGgZONUT5EtHjFsK4bwADoE",
  authDomain: "sangeeth-9bbe6.firebaseapp.com",
  projectId: "sangeeth-9bbe6",
  storageBucket: "sangeeth-9bbe6.firebasestorage.app",
  messagingSenderId: "867369179312",
  appId: "1:867369179312:web:75a88c7895a6fcc6008375",
};

// Check if Firebase app is already initialized
const app = !getApps().length ? initializeApp(firebaseConfig) : getApps()[0];
const db = getFirestore(app);

// Initialize Auth with that app
const auth = getAuth(app);

export { auth , db };
