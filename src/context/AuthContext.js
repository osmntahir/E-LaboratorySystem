// src/context/AuthContext.js
import React, { createContext, useEffect, useState } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { auth, db } from "../../firebaseConfig";
import { doc, getDoc, onSnapshot } from "firebase/firestore";
import AsyncStorage from "@react-native-async-storage/async-storage";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);   // Kullanıcı objesi
    const [loading, setLoading] = useState(true); // Uygulama açılırken "splash" / "auth check"

    useEffect(() => {
        let unsubscribeAuth = null;
        let unsubscribeUserDoc = null;

        const checkLocalToken = async () => {
            try {
                // 1) Localde token var mı?
                const localToken = await AsyncStorage.getItem("userToken");
                if (localToken) {
                    // Token mevcut, ancak yine de onAuthStateChanged'ı beklemek daha güvenli
                }
            } catch (error) {
                console.log("Local token check error:", error);
            }

            // 2) onAuthStateChanged ile firebase auth'u dinle
            unsubscribeAuth = onAuthStateChanged(auth, async (currentUser) => {
                if (currentUser) {
                    try {
                        // Firestore'dan kullanıcı bilgileri
                        const userDocRef = doc(db, "users", currentUser.uid);
                        // Set up a real-time listener on the user's document
                        unsubscribeUserDoc = onSnapshot(userDocRef, (userDoc) => {
                            if (userDoc.exists()) {
                                const userData = userDoc.data();
                                const accessToken = currentUser.stsTokenManager?.accessToken || "";

                                const fullUser = {
                                    ...currentUser,
                                    ...userData,
                                    accessToken,
                                };
                                setUser(fullUser);
                                AsyncStorage.setItem("userToken", accessToken);
                            } else {
                                console.log("Kullanıcı Firestore'da bulunamadı.");
                                setUser(null);
                                AsyncStorage.removeItem("userToken");
                            }
                        });
                    } catch (error) {
                        console.log("Firestore userDoc error:", error);
                        setUser(null);
                        await AsyncStorage.removeItem("userToken");
                    }
                } else {
                    // currentUser yok => logout
                    setUser(null);
                    await AsyncStorage.removeItem("userToken");
                }
                setLoading(false);
            });
        };

        checkLocalToken();

        return () => {
            if (unsubscribeAuth) unsubscribeAuth();
            if (unsubscribeUserDoc) unsubscribeUserDoc();
        };
    }, []);

    const logout = async () => {
        try {
            await auth.signOut();
            setUser(null);
            await AsyncStorage.removeItem("userToken");
        } catch (error) {
            console.log("Oturum kapatma hatası:", error);
        }
    };

    return (
        <AuthContext.Provider value={{ user, setUser, logout, loading }}>
            {children}
        </AuthContext.Provider>
    );
};
