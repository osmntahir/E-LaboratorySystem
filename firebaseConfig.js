// firebaseConfig.js
import { initializeApp } from "firebase/app";
import { getFirestore, serverTimestamp } from "firebase/firestore";

// Firebase yapılandırma bilgilerinizi buraya ekleyin
const firebaseConfig = {
  apiKey: "AIzaSyBAcraYzrYNtfHY4Sa7Qpr1uOJiABT85ps",
  authDomain: "e-lab-2a26f.firebaseapp.com",
  projectId: "e-lab-2a26f",
  storageBucket: "e-lab-2a26f.firebasestorage.app",
  messagingSenderId: "294801335188",
  appId: "1:294801335188:web:bc6087285864f20d906581"
};

// Firebase'i başlat
const app = initializeApp(firebaseConfig);

// Firestore bağlantısını al
const firestore = getFirestore(app);

export { firestore, serverTimestamp };
