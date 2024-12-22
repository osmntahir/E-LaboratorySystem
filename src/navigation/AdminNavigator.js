// src/navigation/AdminNavigator.js
import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import AdminHomeScreen from '../screens/admin/AdminHomeScreen';
import GuideManagementScreen from '../screens/admin/GuideManagementScreen';
import AddGuideScreen from '../screens/admin/guideManagement/AddGuideScreen';
import EditGuideScreen from '../screens/admin/guideManagement/EditGuideScreen';
import PatientListScreen from '../screens/admin/PatientListScreen';
import PatientDetailScreen from '../screens/admin/PatientDetailScreen';
import AddTestResultScreen from '../screens/admin/AddTestResultScreen';
import UploadJSONScreen from '../screens/UploadJSONScreen';
import TestAnalysisScreen from '../screens/admin/TestAnalysisScreen';
import AddAgeGroupScreen from '../screens/admin/guideManagement/AddAgeGroupScreen';
import EditTestResultScreen from '../screens/admin/EditTestResultScreen';
import EditAgeGroupScreen from '../screens/admin/guideManagement/EditAgeGroupScreen';
import EditTestScreen from '../screens/admin/guideManagement/EditTestScreen';
import AddTestScreen from '../screens/admin/guideManagement/AddTestScreen';

const Stack = createStackNavigator();

const AdminNavigator = () => {
    return (
        <Stack.Navigator initialRouteName="AdminHome">
            <Stack.Screen
                name="AdminHome"
                component={AdminHomeScreen}
                options={{ title: 'Admin Anasayfa' }}
            />
            <Stack.Screen
                name="GuideManagement"
                component={GuideManagementScreen}
                options={{ title: 'Kılavuz Yönetimi' }}
            />
            <Stack.Screen
                name="AddGuide"
                component={AddGuideScreen}
                options={{ title: 'Kılavuz Ekle' }}
            />
            <Stack.Screen
                name="EditGuide"
                component={EditGuideScreen}
                options={{ title: 'Kılavuz Düzenle' }}
            />
            <Stack.Screen
                name="Patients"
                component={PatientListScreen}
                options={{ title: 'Hasta Listesi' }}
            />
            <Stack.Screen
                name="PatientDetail"
                component={PatientDetailScreen}
                options={{ title: 'Hasta Detayı' }}
            />
            <Stack.Screen
                name="AddTestResult"
                component={AddTestResultScreen}
                options={{ title: 'Tahlil Ekle' }}
            />
            <Stack.Screen
                name="AddTest"
                component={AddTestScreen}
                options={{ title: 'Tetkik Ekle' }}
            />
            <Stack.Screen
                name="EditTest"
                component={EditTestScreen}
                options={{ title: 'Tetkik Düzenle' }}
            />
            <Stack.Screen
                name="AddAgeGroup"
                component={AddAgeGroupScreen}
                options={{ title: 'Yaş Grubu Ekle' }}
            />
            <Stack.Screen
                name="EditAgeGroup"
                component={EditAgeGroupScreen}
                options={{ title: 'Yaş Grubu Düzenle' }}
            />
            <Stack.Screen
                name="TestResultDetail"
                component={AddTestResultScreen}
                options={{ title: 'Tahlil Detayı' }}
            />
            <Stack.Screen
                name="UploadJSON"
                component={UploadJSONScreen}
                options={{ title: 'JSON Yükle' }}
            />
            <Stack.Screen
                name="TestAnalysis"
                component={TestAnalysisScreen}
                options={{ title: 'Tetkik Analizi' }}
            />
            <Stack.Screen
                name="EditTestResult"
                component={EditTestResultScreen}
                options={{ title: 'Tahlil Düzenle' }}
            />
        </Stack.Navigator>
    );
};

export default AdminNavigator;
