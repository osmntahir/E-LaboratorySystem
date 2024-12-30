// src/navigation/UserTabNavigator.js
import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

// Ana ekran bileşenleri
import UserHomeScreen from '../screens/users/UserHomeScreen';
import TestResultsScreen from '../screens/users/TestResultsScreen';
import ProfileScreen from '../screens/users/ProfileScreen';
import ChangePasswordScreen from '../screens/users/ChangePasswordScreen';

import UserGraphScreen from '../screens/users/UserGraphScreen';

const Tab = createBottomTabNavigator();

const UserTabNavigator = () => {
    return (
        <Tab.Navigator
            screenOptions={({ route }) => ({
                // Alt tab ikonları belirlenir
                tabBarIcon: ({ color, size }) => {
                    let iconName = 'home';

                    if (route.name === 'HomeTab') {
                        iconName = 'home';
                    } else if (route.name === 'ResultsTab') {
                        iconName = 'flask';
                    } else if (route.name === 'ProfileTab') {
                        iconName = 'account';
                    }
                    else if (route.name === 'UserGraph') {
                        iconName = 'chart-line';
                    }
                    return <Icon name={iconName} size={size} color={color} />;
                },
                tabBarActiveTintColor: '#42A5F5',
                tabBarInactiveTintColor: 'gray',
                headerShown: true,              // Her tab'de default header gizlenir
                tabBarHideOnKeyboard: true,      // Klavye açılınca tab bar gizlensin
                tabBarStyle: {
                    height: 60,                    // Yüksekliği artırabilirsiniz
                    paddingBottom: 5,             // İkon ve metin arasındaki boşluk
                },
            })}
        >
            <Tab.Screen
                name="HomeTab"
                component={UserHomeScreen}
                options={{
                    headerShown: false, // Header gizlenir
                    tabBarLabel: 'Anasayfa',
                    tabBarIcon: ({ color, size }) => (
                        <Icon name="home" size={size} color={color} /> // İkon aynı kalabilir
                    ),
                }}
            />

            <Tab.Screen
                name="ResultsTab"
                component={TestResultsScreen}
                options={{ title: 'Tahlil Sonuçları' }}
            />
            <Tab.Screen
                name="ProfileTab"
                component={ProfileScreen}
                options={{ title: 'Profil' }}
            />

            <Tab.Screen
                name="UserGraph"
                component={UserGraphScreen}
                options={{ title: 'Grafik '}}
            />
        </Tab.Navigator>
    );
};

export default UserTabNavigator;
