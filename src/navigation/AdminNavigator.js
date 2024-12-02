// src/navigation/AdminNavigator.js
import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import AdminHomeScreen from '../screens/AdminHomeScreen';
import GuideManagementScreen from '../screens/GuideManagementScreen';
import AddGuideScreen from '../screens/AddGuideScreen';
import EditGuideScreen from '../screens/EditGuideScreen';
import PatientListScreen from '../screens/PatientListScreen';
import PatientDetailScreen from '../screens/PatientDetailScreen';
import AddTestResultScreen from '../screens/AddTestResultScreen';

const Stack = createStackNavigator();

const AdminNavigator = () => {
    return (
        <Stack.Navigator>
            <Stack.Screen name="AdminHome" component={AdminHomeScreen} options={{ title: 'Admin Anasayfa' }} />
            <Stack.Screen name="GuideManagement" component={GuideManagementScreen} options={{ title: 'Kılavuz Yönetimi' }} />
            <Stack.Screen name="AddGuide" component={AddGuideScreen} options={{ title: 'Kılavuz Ekle' }} />
            <Stack.Screen name="EditGuide" component={EditGuideScreen} options={{ title: 'Kılavuz Düzenle' }} />
            <Stack.Screen name="Patients" component={PatientListScreen} options={{ title: 'Hasta Listesi' }} />
            <Stack.Screen name="PatientDetail" component={PatientDetailScreen} options={{ title: 'Hasta Detayı' }} />
            <Stack.Screen name="AddTestResult" component={AddTestResultScreen} options={{ title: 'Tahlil Ekle' }} />
            <Stack.Screen name="EditTestResult" component={AddTestResultScreen} options={{ title: 'Tahlil Düzenle' }} />
            <Stack.Screen name="TestResultDetail" component={AddTestResultScreen} options={{ title: 'Tahlil Detayı' }} />
            
        </Stack.Navigator>
    );
};

export default AdminNavigator;
