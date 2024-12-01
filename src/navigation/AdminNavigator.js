import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import AdminHomeScreen from "../screens/AdminHomeScreen";
import GuideManagementScreen from "../screens/GuideManagementScreen";
import PatientManagementScreen from "../screens/PatientManagementScreen";

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
            <Stack.Screen
                name="PatientManagement"
                component={PatientManagementScreen} // Artık hatasız çalışır
                options={{ title: "Hasta Yönetimi" }}
            />
        </Stack.Navigator>
    );
};

export default AdminNavigator;
