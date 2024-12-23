// src/context/AuthContext.js
import React, { createContext, useEffect, useState } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { auth, db } from "../../firebaseConfig";
import { doc, getDoc } from "firebase/firestore";
import AsyncStorage from "@react-native-async-storage/async-storage";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);   // Kullanıcı objesi
    const [loading, setLoading] = useState(true); // Uygulama açılırken "splash" / "auth check"

    useEffect(() => {
        let unsubscribe;
        const checkLocalToken = async () => {
            try {
                // 1) Localde token var mı?
                const localToken = await AsyncStorage.getItem("userToken");
                if (localToken) {
                    // Eger token varsa, onAuthStateChanged devreye girince user setlenecek
                    // ama yine de "bekleme" olmasın diye userState'i oradan set edebiliriz.
                    // (Opsiyonel) Sadece loading'i false yaparak onAuthStateChanged'ı bekleyebiliriz.
                  //  setLoading(false);
                }
            } catch (error) {
                console.log("Local token check error:", error);
            }

            // 2) onAuthStateChanged ile firebase auth'u dinle
            unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
                if (currentUser) {
                    try {
                        // Firestore'dan kullanıcı bilgileri
                        const userDocRef = doc(db, "users", currentUser.uid);
                        const userDoc = await getDoc(userDocRef);

                        if (userDoc.exists()) {
                            const userData = userDoc.data();
                            const accessToken = currentUser.stsTokenManager?.accessToken || "";

                            const fullUser = {
                                ...currentUser,
                                ...userData,
                                accessToken,
                            };
                            setUser(fullUser);
                            await AsyncStorage.setItem("userToken", accessToken);
                        } else {
                            console.log("Kullanıcı Firestore'da bulunamadı.");
                            setUser(null);
                            await AsyncStorage.removeItem("userToken");
                        }
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
            if (unsubscribe) unsubscribe();
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
