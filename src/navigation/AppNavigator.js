// src/navigation/AppNavigator.js
import React, { useContext } from "react";
import { NavigationContainer } from "@react-navigation/native";
import { AuthContext } from "../context/AuthContext";
import AuthNavigator from "./AuthNavigator";
import AdminNavigator from "./AdminNavigator";
import UserNavigator from "./UserNavigator";
import SplashScreen from "../screens/SplashScreen";

const AppNavigator = () => {
    const { user, loading } = useContext(AuthContext);

    // Uygulama ilk açıldığında loading true ise => Splash ekranı göster
    if (loading) {
        return <SplashScreen />;
    }

    // Eğer user yoksa => AuthNavigator
    if (!user) {
        return (
            <NavigationContainer>
                <AuthNavigator />
            </NavigationContainer>
        );
    }

    // Kullanıcı var => rol tespiti yap ve doğru navigasyonu göster
    const userRole = user.role; // Firestore'dan user doc içinde "role" geliyordu
    // role = "admin" ya da "patient"

    return (
        <NavigationContainer>
            {userRole === "admin" ? <AdminNavigator /> : userRole === "patient" ? <UserNavigator /> : null}
        </NavigationContainer>
    );
};

export default AppNavigator;
