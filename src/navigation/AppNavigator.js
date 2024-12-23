// src/navigation/AppNavigator.js
import React, { useContext } from "react";
import { NavigationContainer } from "@react-navigation/native";
import { AuthContext } from "../context/AuthContext";
import AuthNavigator from "./AuthNavigator";
import AdminNavigator from "./AdminNavigator";
import UserNavigator from "./UserNavigator";
import { View, ActivityIndicator, Text } from "react-native";

const AppNavigator = () => {
    const { user, loading } = useContext(AuthContext);

    // Uygulama ilk açıldığında loading true ise => Splash veya basit loader
    if (loading) {
        return (
            <View style={{flex:1, justifyContent:'center', alignItems:'center'}}>
                <ActivityIndicator size="large" color="#000" />
                <Text>Yükleniyor...</Text>
            </View>
        );
    }

    // Eger user yoksa => AuthNavigator
    if (!user) {
        return (
            <NavigationContainer>
                <AuthNavigator />
            </NavigationContainer>
        );
    }

    // user var => rol tespiti
    const userRole = user.role; // Firestore'dan user doc içinde "role" geliyordu
    // role = "admin" ya da "patient"

    return (
        <NavigationContainer>
            {userRole === "admin" ? <AdminNavigator /> : userRole === "patient" ? <UserNavigator /> : null}
        </NavigationContainer>
    );
};

export default AppNavigator;
