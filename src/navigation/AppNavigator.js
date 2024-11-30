// src/navigation/AppNavigator.js
import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import GuideManagementScreen from '../screens/GuideManagementScreen';
import AddGuideScreen from '../screens/AddGuideScreen';
import EditGuideScreen from '../screens/EditGuideScreen';
import AddTestScreen from '../screens/AddTestScreen';
import EditTestScreen from '../screens/EditTestScreen';
import AddAgeGroupScreen from '../screens/AddAgeGroupScreen';
import EditAgeGroupScreen from '../screens/EditAgeGroupScreen';

const Stack = createStackNavigator();

const AppNavigator = () => {
    return (
        <Stack.Navigator initialRouteName="GuideManagement">
            <Stack.Screen
                name="GuideManagement"
                component={GuideManagementScreen}
                options={{ title: 'Kılavuz Yönetimi' }}
            />
            <Stack.Screen
                name="AddGuide"
                component={AddGuideScreen}
                options={{ title: 'Yeni Kılavuz Ekle' }}
            />
            <Stack.Screen
                name="EditGuide"
                component={EditGuideScreen}
                options={{ title: 'Kılavuz Düzenle' }}
            />
            <Stack.Screen
                name="AddTest"
                component={AddTestScreen}
                options={{ title: 'Yeni Tetkik Ekle' }}
            />
            <Stack.Screen
                name="EditTest"
                component={EditTestScreen}
                options={{ title: 'Tetkik Düzenle' }}
            />
            <Stack.Screen
                name="AddAgeGroup"
                component={AddAgeGroupScreen}
                options={{ title: 'Yeni Yaş Grubu Ekle' }}
            />
            <Stack.Screen
                name="EditAgeGroup"
                component={EditAgeGroupScreen}
                options={{ title: 'Yaş Grubu Düzenle' }}
            />
        </Stack.Navigator>
    );
};

export default AppNavigator;
