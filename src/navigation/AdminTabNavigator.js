// src/navigation/AdminTabNavigator.js
import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

// Ekran bileşenlerini içe aktarın
import AdminHomeScreen from '../screens/admin/AdminHomeScreen';
import GuideManagementScreen from '../screens/admin/GuideManagementScreen';
import TestAnalysisScreen from '../screens/admin/TestAnalysisScreen';
import PatientListScreen from '../screens/admin/PatientListScreen';

const Tab = createBottomTabNavigator();

const AdminTabNavigator = () => {
    return (
        <Tab.Navigator
            screenOptions={({ route }) => ({
                // Tab ikonları
                tabBarIcon: ({ color, size }) => {
                    let iconName;

                    switch (route.name) {
                        case 'Home':
                            iconName = 'home';
                            break;
                        case 'GuideManagementTab':
                            iconName = 'book';
                            break;
                        case 'TestAnalysisTab':
                            iconName = 'flash';
                            break;
                        case 'PatientsTab':
                            iconName = 'account-multiple';
                            break;
                        default:
                            iconName = 'circle';
                    }

                    return <Icon name={iconName} size={size} color={color} />;
                },
                tabBarStyle: {
                    height: 60, // Daha büyük bir yükseklik ayarlayın
                    paddingBottom: 10, // İkonlar ve metin arasında boşluk bırakır
                },
                tabBarActiveTintColor: '#27ae60',
                tabBarInactiveTintColor: 'gray',
                headerShown: true, // Her tab için header'ı gizle
                tabBarHideOnKeyboard: true, // Klavye açıldığında tab bar'ı gizle

            })}
        >
            <Tab.Screen
                name="Home"
                component={AdminHomeScreen}
                options={{ title: 'Home' }}
            />
            <Tab.Screen
                name="GuideManagementTab"
                component={GuideManagementScreen}
                options={{ title: 'Kılavuz Yönetimi' }}
            />
            <Tab.Screen
                name="TestAnalysisTab"
                component={TestAnalysisScreen}
                options={{ title: 'Hızlı Tahlil' }}
            />
            <Tab.Screen
                name="PatientsTab"
                component={PatientListScreen}
                options={{ title: 'Hasta Yönetimi' }}
            />
        </Tab.Navigator>
    );
};

export default AdminTabNavigator;
