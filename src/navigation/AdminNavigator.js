// src/navigation/AdminNavigator.js
import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';

import AdminHomeScreen from '../screens/admin/AdminHomeScreen';
import GuideManagementScreen from '../screens/admin/GuideManagementScreen';

import GuideDetailScreen from '../screens/admin/guideManagement/GuideDetailScreen';
import TestDetailScreen from '../screens/admin/guideManagement/TestDetailScreen';

import AddGuideScreen from '../screens/admin/guideManagement/AddGuideScreen';
import EditGuideScreen from '../screens/admin/guideManagement/EditGuideScreen';

import AddTestScreen from '../screens/admin/guideManagement/AddTestScreen';
import EditTestScreen from '../screens/admin/guideManagement/EditTestScreen';

import AddAgeGroupScreen from '../screens/admin/guideManagement/AddAgeGroupScreen';
import EditAgeGroupScreen from '../screens/admin/guideManagement/EditAgeGroupScreen';

import PatientListScreen from '../screens/admin/PatientListScreen';
import PatientDetailScreen from '../screens/admin/PatientDetailScreen';
import AddTestResultScreen from '../screens/admin/AddTestResultScreen';
import EditTestResultScreen from '../screens/admin/EditTestResultScreen';


import TestAnalysisScreen from '../screens/admin/TestAnalysisScreen';

const Stack = createStackNavigator();

const AdminNavigator = () => {
    return (
        <Stack.Navigator initialRouteName="AdminHome">
            <Stack.Screen
                name="AdminHome"
                component={AdminHomeScreen}
                options={{ title: 'Admin Anasayfa' }}
            />

            {/** Kılavuz Yönetimi Anasayfa **/}
            <Stack.Screen
                name="GuideManagement"
                component={GuideManagementScreen}
                options={{ title: 'Kılavuz Yönetimi' }}
            />

            {/** Hiyerarşik Ekranlar **/}
            <Stack.Screen
                name="GuideDetail"
                component={GuideDetailScreen}
                options={{ title: 'Kılavuz Detayı' }}
            />
            <Stack.Screen
                name="TestDetail"
                component={TestDetailScreen}
                options={{ title: 'Test Detayı' }}
            />

            {/** Guide Add/Edit **/}
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

            {/** Test Add/Edit **/}
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

            {/** AgeGroup Add/Edit **/}
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

            {/** Hastalar vb. **/}
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
                name="EditTestResult"
                component={EditTestResultScreen}
                options={{ title: 'Tahlil Düzenle' }}
            />
            <Stack.Screen
                name="TestResultDetail"
                component={AddTestResultScreen}
                options={{ title: 'Tahlil Detayı' }}
            />

            <Stack.Screen
                name="TestAnalysis"
                component={TestAnalysisScreen}
                options={{ title: 'Tetkik Analizi' }}
            />
        </Stack.Navigator>
    );
};

export default AdminNavigator;
