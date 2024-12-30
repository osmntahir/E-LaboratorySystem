// src/navigation/UserNavigator.js
import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';

// Alt tab bar Navigator
import UserTabNavigator from './UserTabNavigator';

// Detay ekranlarını içe aktarın
import ChangePasswordScreen from '../screens/users/ChangePasswordScreen';

const Stack = createStackNavigator();

const UserNavigator = () => {
    return (
        <Stack.Navigator>
            {/** 1) Ana Tab Bar Ekranları **/}
            <Stack.Screen
                name="MainTabs"
                component={UserTabNavigator}
                options={{ headerShown: false }}
            />
            <Stack.Screen
                name="ChangePassword"
                component={ChangePasswordScreen}
                options={{ title: 'Şifre Değiştir' }}
            />


        </Stack.Navigator>
    );
};

export default UserNavigator;
