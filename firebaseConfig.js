// firebaseConfig.js
import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth, initializeAuth, getReactNativePersistence } from 'firebase/auth';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Firebase yapılandırması
const firebaseConfig = {
  apiKey: "AIzaSyBAcraYzrYNtfHY4Sa7Qpr1uOJiABT85ps",
  authDomain: "e-lab-2a26f.firebaseapp.com",
  projectId: "e-lab-2a26f",
  storageBucket: "e-lab-2a26f.firebasestorage.app",
  messagingSenderId: "294801335188",
  appId: "1:294801335188:web:bc6087285864f20d906581"
};


// 1) Ana Uygulama (doktor oturumları vb.)
const app = initializeApp(firebaseConfig);

// 2) Firestore bağlantısı
const db = getFirestore(app);

// 3) Auth'u AsyncStorage ile başlat (doktor vs. ana oturum)
const auth = initializeAuth(app, {
  persistence: getReactNativePersistence(AsyncStorage),
});

// === Secondary App (yeni hasta oluşturmak için) ===
import { initializeApp as initializeSecondaryApp } from "firebase/app";
import { getAuth as getSecondaryAuth } from "firebase/auth";

const secondaryApp = initializeSecondaryApp(firebaseConfig, "SecondaryApp");
const secondaryAuth = getSecondaryAuth(secondaryApp);
// Bu secondaryAuth ile createUser yaparsak, ana oturumu bozmaz.

export { db, auth, secondaryAuth };
