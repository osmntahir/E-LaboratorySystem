// src/navigation/UserNavigator.js
import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import UserHomeScreen from "../screens/users/UserHomeScreen";
import TestResultsScreen from "../screens/users/TestResultsScreen";
import ProfileScreen from "../screens/users/ProfileScreen";
import ChangePasswordScreen from "../screens/users/ChangePasswordScreen";

const Stack = createNativeStackNavigator();

const UserNavigator = () => {
    return (
        <Stack.Navigator>
            <Stack.Screen
                name="UserHome"
                component={UserHomeScreen}
                options={{ headerShown: false }}
            />
            <Stack.Screen
                name="TestResults"
                component={TestResultsScreen}
                options={{ title: "Tahlil Sonuçları" }}
            />
            <Stack.Screen
                name="Profile"
                component={ProfileScreen}
                options={{ title: "Profilim" }}
            />
            <Stack.Screen
                name="ChangePassword"
                component={ChangePasswordScreen}
                options={{ title: "Şifre Değiştir" }}
            />
        </Stack.Navigator>
    );
};

export default UserNavigator;
