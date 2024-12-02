import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import UserHomeScreen from "../screens/users/UserHomeScreen";
import TestResultsScreen from "../screens/users/TestResultsScreen";

const Stack = createNativeStackNavigator();

const UserNavigator = () => {
    return (
        <Stack.Navigator>
            <Stack.Screen
                name="UserHome"
                component={UserHomeScreen}
                options={{ title: "Kullanıcı Ana Sayfa" }}
            />
            <Stack.Screen
                name="TestResults"
                component={TestResultsScreen}
                options={{ title: "Tahlil Sonuçları" }}
            />
        </Stack.Navigator>
    );
};

export default UserNavigator;
