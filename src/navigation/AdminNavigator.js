import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import AdminHomeScreen from "../screens/AdminHomeScreen";
import GuideManagementScreen from "../screens/GuideManagementScreen";

const Stack = createNativeStackNavigator();

const AdminNavigator = () => {
    return (
        <Stack.Navigator>
            <Stack.Screen
                name="AdminHome"
                component={AdminHomeScreen}
                options={{ title: "Admin Ana Sayfa" }}
            />
            <Stack.Screen
                name="GuideManagement"
                component={GuideManagementScreen}
                options={{ title: "Kılavuz Yönetimi" }}
            />
        </Stack.Navigator>
    );
};

export default AdminNavigator;
