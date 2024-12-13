import React, { createContext, useEffect, useState } from "react";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { auth, db } from "../../firebaseConfig";
import { doc, getDoc } from "firebase/firestore";
import AsyncStorage from "@react-native-async-storage/async-storage";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
            if (currentUser) {
                try {
                    // Firestore'dan kullanıcı bilgilerini al
                    const userDocRef = doc(db, "users", currentUser.uid);
                    const userDoc = await getDoc(userDocRef);

                    if (userDoc.exists()) {
                        const userData = userDoc.data();
                        const accessToken = currentUser.stsTokenManager.accessToken;

                        // Kullanıcı bilgilerini birleştir ve kaydet
                        const fullUser = {
                            ...currentUser,
                            ...userData,
                            accessToken,
                        };

                        setUser(fullUser);
                        await AsyncStorage.setItem("userToken", accessToken); // Token'ı sakla
                    } else {
                        console.log("Kullanıcı Firestore'da bulunamadı.");
                    }
                } catch (error) {
                    console.log("Firestore'dan kullanıcı bilgisi alınırken hata:", error);
                }
            } else {
                setUser(null);
                await AsyncStorage.removeItem("userToken"); // Token'ı kaldır
            }
        });

        return () => unsubscribe(); // Cleanup için unsubscribe
    }, []);

    const logout = async () => {
        try {
            await signOut(auth);
            setUser(null);
            await AsyncStorage.removeItem("userToken");
        } catch (error) {
            console.log("Oturum kapatma hatası:", error);
        }
    };

    return (
        <AuthContext.Provider value={{ user, setUser, logout }}>
            {children}
        </AuthContext.Provider>
    );
};
