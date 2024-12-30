// src/navigation/AdminNavigator.js
import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';

// Alt bar’lı Tab Navigator
import AdminTabNavigator from './AdminTabNavigator';

// Tüm detay ekranları:
import GuideDetailScreen from '../screens/admin/guideManagement/GuideDetailScreen';
import TestDetailScreen from '../screens/admin/guideManagement/TestDetailScreen';
import AddGuideScreen from '../screens/admin/guideManagement/AddGuideScreen';
import EditGuideScreen from '../screens/admin/guideManagement/EditGuideScreen';
import AddTestScreen from '../screens/admin/guideManagement/AddTestScreen';
import EditTestScreen from '../screens/admin/guideManagement/EditTestScreen';
import AddAgeGroupScreen from '../screens/admin/guideManagement/AddAgeGroupScreen';
import EditAgeGroupScreen from '../screens/admin/guideManagement/EditAgeGroupScreen';

import PatientDetailScreen from '../screens/admin/PatientDetailScreen';
import AddTestResultScreen from '../screens/admin/AddTestResultScreen';
import EditTestResultScreen from '../screens/admin/EditTestResultScreen';
import AddPatientScreen from '../screens/admin/AddPatientScreen';
import UpdatePatientScreen from '../screens/admin/UpdatePatientScreen';
import PatientGraphScreen from '../screens/admin/PatientGraphScreen';


const Stack = createStackNavigator();

const AdminNavigator = () => {
        return (
            <Stack.Navigator>
                    {/* 1) İlk ekranımız Tab Navigator olsun. */}
                    <Stack.Screen
                        name="MainTabs"
                        component={AdminTabNavigator}
                        options={{ headerShown: false }}
                    />

                    {/* 2) Detay ekranları */}
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
                    {/* TestResultDetail için de ayrı bir screen isteniyorsa: */}
                    {/* <Stack.Screen
        name="TestResultDetail"
        component={SomeDetailScreen} // varsa
        options={{ title: 'Tahlil Detayı' }}
      /> */}

                    <Stack.Screen
                        name="AddPatient"
                        component={AddPatientScreen}
                        options={{ title: 'Hasta Ekle' }}
                    />
                    <Stack.Screen
                        name="UpdatePatient"
                        component={UpdatePatientScreen}
                        options={{ title: 'Hasta Güncelle' }}
                    />
                    <Stack.Screen
                        name="PatientGraphic"
                        component={PatientGraphScreen}
                        options={{ title: 'Hasta Grafiği' }}
                    />
            </Stack.Navigator>
        );
};

export default AdminNavigator;
