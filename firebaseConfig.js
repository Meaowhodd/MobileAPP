// firebaseConfig.js
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyCOPgxKm7piBMmIhFsxX5f-qdiqE0LUrko",
  authDomain: "mobileapp-82ba2.firebaseapp.com",
  projectId: "mobileapp-82ba2",
  storageBucket: "mobileapp-82ba2.firebasestorage.app",
  messagingSenderId: "102061505283",
  appId: "1:102061505283:web:b6e5624a26957ec8a2c736",
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = getAuth(app);

