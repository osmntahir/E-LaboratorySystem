import { signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut } from "firebase/auth";
import { auth } from "../../firebaseConfig";

// Login fonksiyonu
export const login = (email, password) => {
    return signInWithEmailAndPassword(auth, email, password);
};

// Register fonksiyonu
export const register = (email, password) => {
    return createUserWithEmailAndPassword(auth, email, password);
};

// Logout fonksiyonu
export const logout = () => {
    return signOut(auth);
};
